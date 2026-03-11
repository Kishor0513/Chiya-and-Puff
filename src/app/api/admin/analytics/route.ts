import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyAuth(token);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Revenue for the last 7 days
    const orders = await prisma.order.findMany({
      where: {
        status: 'BILLED',
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const revenueByDay: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      revenueByDay[date.toISOString().split('T')[0]] = 0;
    }

    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (revenueByDay[day] !== undefined) {
        revenueByDay[day] += order.totalAmount;
      }
    });

    // 2. Top 5 Popular Items
    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const populatedTopItems = await Promise.all(
      topItems.map(async (item) => {
        const detail = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: { name: true, category: true },
        });
        return {
          name: detail?.name || 'Unknown',
          category: detail?.category || 'General',
          count: item._sum.quantity || 0,
        };
      })
    );

    // 3. Category performance
    const categorySales = await prisma.orderItem.findMany({
      where: { order: { status: 'BILLED' } },
      include: { menuItem: { select: { category: true } } },
    });

    const categoryData: Record<string, number> = {};
    categorySales.forEach(item => {
      categoryData[item.menuItem.category] = (categoryData[item.menuItem.category] || 0) + item.subTotal;
    });

    return NextResponse.json({
      revenueTrends: Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount })).reverse(),
      popularItems: populatedTopItems,
      categoryStats: Object.entries(categoryData).map(([name, value]) => ({ name, value })),
    });
  } catch (error) {
    console.error('Analytics API error', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
