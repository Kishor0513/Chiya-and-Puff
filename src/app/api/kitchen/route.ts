import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

async function checkChefAuth() {
	const cookieStore = await cookies();
	const token = cookieStore.get('auth-token')?.value;
	if (!token) return null;
	try {
		const payload = await verifyAuth(token);
		if (payload.role === 'CHEF' || payload.role === 'ADMIN') {
			return payload;
		}
		return null;
	} catch {
		return null;
	}
}

// Get active orders (PENDING and PREPARING) for the kitchen
export async function GET() {
	const auth = await checkChefAuth();
	if (!auth) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const orders = await prisma.order.findMany({
			where: {
				status: { in: ['PREPARING', 'DELIVERED'] },
			},
			orderBy: { createdAt: 'asc' },
			include: {
				table: true,
				items: {
					include: { menuItem: true },
				},
			},
		});
		return NextResponse.json(orders);
	} catch (error) {
		console.error('KMS GET error', error);
		return NextResponse.json(
			{ error: 'Failed to fetch active orders' },
			{ status: 500 },
		);
	}
}

// Update order status from kitchen
export async function PATCH(request: NextRequest) {
	const auth = await checkChefAuth();
	if (!auth) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { orderId, status } = await request.json();

		if (!orderId || !status) {
			return NextResponse.json(
				{ error: 'Missing orderId or status' },
				{ status: 400 },
			);
		}

		const order = await prisma.order.findUnique({ where: { id: orderId } });
		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		if (!(order.status === 'PREPARING' && status === 'DELIVERED')) {
			return NextResponse.json(
				{ error: 'Kitchen can only mark PREPARING orders as DELIVERED.' },
				{ status: 403 },
			);
		}

		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: { status },
			include: { table: true },
		});

		return NextResponse.json(updatedOrder);
	} catch (error) {
		console.error('KMS PATCH error', error);
		return NextResponse.json(
			{ error: 'Failed to update order status' },
			{ status: 500 },
		);
	}
}
