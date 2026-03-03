import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value;
		if (!token)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		await verifyAuth(token);

		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const [
			totalTables,
			occupiedTables,
			pendingOrders,
			totalStaff,
			recentOrders,
			todayRevenueResult,
		] = await Promise.all([
			prisma.table.count(),
			prisma.table.count({
				where: { status: { in: ['OCCUPIED', 'NEEDS_SERVICE'] } },
			}),
			prisma.order.count({
				where: { status: { in: ['PENDING', 'PREPARING'] } },
			}),
			prisma.user.count(),
			prisma.order.findMany({
				where: {},
				orderBy: { createdAt: 'desc' },
				take: 10,
				include: {
					table: true,
					items: {
						include: { menuItem: { select: { name: true } } },
					},
				},
			}),
			prisma.order.aggregate({
				_sum: { totalAmount: true },
				where: { status: 'BILLED', createdAt: { gte: startOfDay } },
			}),
		]);

		return NextResponse.json({
			totalTables,
			occupiedTables,
			pendingOrders,
			totalStaff,
			recentOrders,
			todayRevenue: todayRevenueResult._sum.totalAmount ?? 0,
		});
	} catch (error) {
		console.error('GET /api/admin/stats', error);
		return NextResponse.json(
			{ error: 'Failed to fetch stats' },
			{ status: 500 },
		);
	}
}
