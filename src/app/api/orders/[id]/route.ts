import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const token = request.cookies.get('auth-token')?.value;
		if (!token)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const payload = await verifyAuth(token);
		const role = String(payload.role || '');

		const { status } = await request.json();
		const nextStatus = String(status || '');

		const existingOrder = await prisma.order.findUnique({ where: { id } });
		if (!existingOrder) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		const canBill = nextStatus === 'BILLED';
		const waiterAllowed =
			(existingOrder.status === 'PENDING' && nextStatus === 'PREPARING') ||
			canBill;
		const chefAllowed =
			existingOrder.status === 'PREPARING' && nextStatus === 'DELIVERED';

		if (role === 'WAITER' && !waiterAllowed) {
			return NextResponse.json(
				{ error: 'Waiter can only mark PENDING as PREPARING or bill orders.' },
				{ status: 403 },
			);
		}

		if (role === 'CHEF' && !chefAllowed) {
			return NextResponse.json(
				{ error: 'Chef can only mark PREPARING orders as DELIVERED.' },
				{ status: 403 },
			);
		}

		if (role !== 'ADMIN' && role !== 'WAITER' && role !== 'CHEF') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const order = await prisma.order.update({
			where: { id },
			data: { status: nextStatus },
		});

		// If order is billed, check if table has other unbilled orders. If not, table becomes AVAILABLE
		if (nextStatus === 'BILLED') {
			const activeOrders = await prisma.order.count({
				where: {
					tableId: order.tableId,
					status: { not: 'BILLED' },
				},
			});
			if (activeOrders === 0) {
				await prisma.table.update({
					where: { id: order.tableId },
					data: { status: 'AVAILABLE' },
				});
			}
		}

		return NextResponse.json(order);
	} catch {
		return NextResponse.json(
			{ error: 'Failed to update order' },
			{ status: 500 },
		);
	}
}

// Customer-facing: cancel a PENDING order
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const order = await prisma.order.findUnique({ where: { id } });
		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}
		if (order.status !== 'PENDING') {
			return NextResponse.json(
				{ error: 'Cannot cancel an order that is already being prepared' },
				{ status: 409 },
			);
		}

		await prisma.order.delete({ where: { id } });

		// If no more active orders for the table, mark it available
		const activeOrders = await prisma.order.count({
			where: { tableId: order.tableId, status: { not: 'BILLED' } },
		});
		if (activeOrders === 0) {
			await prisma.table.update({
				where: { id: order.tableId },
				data: { status: 'AVAILABLE' },
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('DELETE /api/orders/[id]', error);
		return NextResponse.json(
			{ error: 'Failed to cancel order' },
			{ status: 500 },
		);
	}
}
