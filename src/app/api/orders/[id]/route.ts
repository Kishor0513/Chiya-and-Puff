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
		// Any logged in staff can update orders

		const { status } = await request.json();

		const order = await prisma.order.update({
			where: { id },
			data: { status },
		});

		// If order is billed, check if table has other unbilled orders. If not, table becomes AVAILABLE
		if (status === 'BILLED') {
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
	} catch (error) {
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
