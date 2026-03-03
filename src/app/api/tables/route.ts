import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
    try {
        const tables = await prisma.table.findMany({
            orderBy: { tableNumber: 'asc' },
            include: {
                orders: {
                    where: { status: { notIn: ['BILLED'] } },
                    include: { items: { include: { menuItem: true } } }
                }
            }
        });
        return NextResponse.json(tables);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
                status: 'AVAILABLE'
            }
        });

        return NextResponse.json(table);
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ error: 'Table number already exists' }, { status: 400 });
        return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
    }
}
