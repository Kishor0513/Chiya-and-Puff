import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const { tableId, token, items } = await request.json();

		if (!items || items.length === 0) {
			return NextResponse.json(
				{ error: 'Order cannot be empty' },
				{ status: 400 },
			);
		}

		const table = await prisma.table.findUnique({ where: { id: tableId } });
		if (!table || table.qrData !== token) {
			return NextResponse.json(
				{ error: 'Invalid table or QR token' },
				{ status: 403 },
			);
		}

		// Calculate total
		let totalAmount = 0;
		const orderItemsData = [];

		for (const item of items) {
			const dbItem = await prisma.menuItem.findUnique({
				where: { id: item.menuItemId },
			});
			if (!dbItem || !dbItem.available) {
				return NextResponse.json(
					{ error: `Item ${item.menuItemId} is not available` },
					{ status: 400 },
				);
			}
			const subTotal = dbItem.price * item.quantity;
			totalAmount += subTotal;
			orderItemsData.push({
				menuItemId: dbItem.id,
				quantity: item.quantity,
				subTotal,
			});
		}

		// See if there's already an active (PENDING or PREPARING or DELIVERED) order we can append to?
		// Actually, usually placing a new order creates a new record or appends.
		// Let's create a new order, or if one is UNBILLED just append. For simplicity, create a new separate Order.

		// Ensure a new order clears any transient request state on the table.
		if (table.status !== 'OCCUPIED') {
			await prisma.table.update({
				where: { id: tableId },
				data: { status: 'OCCUPIED' },
			});
		}

		const order = await prisma.order.create({
			data: {
				tableId,
				totalAmount,
				status: 'PENDING',
				items: {
					create: orderItemsData,
				},
			},
			include: { items: true },
		});

		return NextResponse.json(order);
	} catch (error) {
		console.error('Order creation error', error);
		return NextResponse.json(
			{ error: 'Failed to place order' },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const tableId = request.nextUrl.searchParams.get('tableId');
		const where = tableId ? { tableId } : {};
		const orders = await prisma.order.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			include: {
				table: true,
				items: { include: { menuItem: true } },
			},
		});
		return NextResponse.json(orders);
	} catch {
		return NextResponse.json({ error: 'Failed' }, { status: 500 });
	}
}
