import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const table = await prisma.table.findUnique({
			where: { id },
			include: {
				orders: {
					where: { status: { notIn: ['BILLED'] } },
					orderBy: { createdAt: 'desc' },
					include: { items: { include: { menuItem: true } } },
				},
			},
		});
		if (!table) {
			return NextResponse.json({ error: 'Table not found' }, { status: 404 });
		}
		return NextResponse.json(table);
	} catch (error) {
		console.error('GET /api/tables/[id]', error);
		return NextResponse.json(
			{ error: 'Failed to fetch table' },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const token = request.cookies.get('auth-token')?.value;
		if (!token)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		await verifyAuth(token);

		const { status } = await request.json();

		const validStatuses = ['AVAILABLE', 'OCCUPIED', 'NEEDS_SERVICE'];
		if (!validStatuses.includes(status)) {
			return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
		}

		const table = await prisma.table.update({
			where: { id },
			data: { status },
		});

		return NextResponse.json(table);
	} catch (error) {
		console.error('PATCH /api/tables/[id]', error);
		return NextResponse.json(
			{ error: 'Failed to update table' },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const token = request.cookies.get('auth-token')?.value;
		if (!token)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const payload = await verifyAuth(token);
		if (payload.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Forbidden: Admin only' },
				{ status: 403 },
			);
		}

		// Cannot delete a table that has active orders
		const activeOrders = await prisma.order.count({
			where: { tableId: id, status: { notIn: ['BILLED'] } },
		});
		if (activeOrders > 0) {
			return NextResponse.json(
				{ error: 'Cannot delete a table with active orders' },
				{ status: 409 },
			);
		}

		await prisma.table.delete({ where: { id } });
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('DELETE /api/tables/[id]', error);
		return NextResponse.json(
			{ error: 'Failed to delete table' },
			{ status: 500 },
		);
	}
}
