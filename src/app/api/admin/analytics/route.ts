import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET /api/admin/analytics?days=7|14|30 (default 7)
// Everything money-related counts BILLED orders only, attributed to the day
// they were billed (updatedAt). Popular items previously mixed in unpaid
// PENDING/PREPARING orders — fixed here with a single filtered query.
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyAuth(token);

    const daysParam = parseInt(request.nextUrl.searchParams.get('days') || '7', 10);
    const days = [7, 14, 30].includes(daysParam) ? daysParam : 7;

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [billedOrders, pipeline] = await Promise.all([
      prisma.order.findMany({
        where: { status: 'BILLED', updatedAt: { gte: since } },
        select: {
          totalAmount: true,
          updatedAt: true,
          items: {
            select: {
              quantity: true,
              subTotal: true,
              menuItem: { select: { name: true, category: true } },
            },
          },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { status: { not: 'BILLED' } },
        _count: { status: true },
      }),
    ]);

    // Day buckets, oldest first
    const dayKeys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayKeys.push(d.toISOString().split('T')[0]);
    }
    const revenueByDay: Record<string, number> = Object.fromEntries(dayKeys.map((k) => [k, 0]));
    const ordersByDay: Record<string, number> = Object.fromEntries(dayKeys.map((k) => [k, 0]));
    const hourBuckets = new Array<number>(24).fill(0);

    let todayRevenue = 0;
    let todayOrders = 0;
    const itemAgg: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
    const categoryAgg: Record<string, number> = {};

    for (const order of billedOrders) {
      const day = order.updatedAt.toISOString().split('T')[0];
      if (revenueByDay[day] !== undefined) {
        revenueByDay[day] += order.totalAmount;
        ordersByDay[day] += 1;
      }
      hourBuckets[order.updatedAt.getHours()] += 1;
      if (order.updatedAt >= startOfToday) {
        todayRevenue += order.totalAmount;
        todayOrders += 1;
      }
      for (const item of order.items) {
        const key = item.menuItem.name;
        if (!itemAgg[key]) {
          itemAgg[key] = { name: key, category: item.menuItem.category, qty: 0, revenue: 0 };
        }
        itemAgg[key].qty += item.quantity;
        itemAgg[key].revenue += item.subTotal;
        categoryAgg[item.menuItem.category] = (categoryAgg[item.menuItem.category] || 0) + item.subTotal;
      }
    }

    const totalRevenue = billedOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalOrders = billedOrders.length;

    const popularItems = Object.values(itemAgg)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((i) => ({ name: i.name, category: i.category, count: i.qty, revenue: i.revenue }));

    const peakHours = hourBuckets
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return NextResponse.json({
      days,
      summary: {
        totalRevenue,
        totalOrders,
        avgBill: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        todayRevenue,
        todayOrders,
      },
      revenueTrends: dayKeys.map((date) => ({ date, amount: revenueByDay[date], orders: ordersByDay[date] })),
      popularItems,
      categoryStats: Object.entries(categoryAgg)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      peakHours,
      pipeline: pipeline.map((p) => ({ status: p.status, count: p._count.status })),
    });
  } catch (error) {
    console.error('Analytics API error', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
