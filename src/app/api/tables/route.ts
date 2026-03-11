import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Customer-facing: Set table status to NEEDS_SERVICE (call waiter)
// Validates the QR token so only a diner at the physical table can call service
export async function PATCH(request: NextRequest) {
	try {
		const { tableId, status, token } = await request.json();

		if (!tableId || !token) {
			return NextResponse.json(
				{ error: 'Missing tableId or token' },
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

		const validStatuses = [
			'AVAILABLE',
			'OCCUPIED',
			'NEEDS_SERVICE',
			'BILL_REQUESTED',
		];
		const newStatus = validStatuses.includes(status) ? status : 'NEEDS_SERVICE';

		const updated = await prisma.table.update({
			where: { id: tableId },
			data: { status: newStatus },
		});

		return NextResponse.json(updated);
	} catch (error) {
		console.error('PATCH /api/tables', error);
		return NextResponse.json(
			{ error: 'Failed to update table' },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const tables = await prisma.table.findMany({
			orderBy: { tableNumber: 'asc' },
			include: {
				orders: {
					where: { status: { notIn: ['BILLED'] } },
					include: { items: { include: { menuItem: true } } },
				},
			},
		});
		return NextResponse.json(tables);
	} catch (error) {
		console.error('GET /api/tables', error);
		return NextResponse.json(
			{ error: 'Failed to fetch tables' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value;
		if (!token)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const payload = await verifyAuth(token);
		if (payload.role !== 'ADMIN') {
			// Only admins can physically add new tables
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const { tableNumber } = await request.json();

		// Generate a unique token for this table's QR link
		const qrData = crypto.randomBytes(8).toString('hex');

		const table = await prisma.table.create({
			data: {
				tableNumber: parseInt(tableNumber),
				qrData,
				status: 'AVAILABLE',
			},
		});

		return NextResponse.json(table);
	} catch (error: unknown) {
		if (
			typeof error === 'object' &&
			error !== null &&
			'code' in error &&
			error.code === 'P2002'
		)
			return NextResponse.json(
				{ error: 'Table number already exists' },
				{ status: 400 },
			);

		console.error('POST /api/tables', error);
		return NextResponse.json(
			{ error: 'Failed to create table' },
			{ status: 500 },
		);
	}
}
