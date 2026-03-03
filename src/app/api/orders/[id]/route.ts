import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // Any logged in staff can update orders

        const { status } = await request.json();

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        });

        // If order is billed, check if table has other unbilled orders. If not, table becomes AVAILABLE
        if (status === 'BILLED') {
            const activeOrders = await prisma.order.count({
                where: {
                    tableId: order.tableId,
                    status: { not: 'BILLED' }
                }
            });
            if (activeOrders === 0) {
                await prisma.table.update({
                    where: { id: order.tableId },
                    data: { status: 'AVAILABLE' }
                });
            }
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
