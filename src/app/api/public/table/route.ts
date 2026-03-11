import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const number = searchParams.get('number');

    if (!number) {
        return NextResponse.json({ error: 'Missing table number' }, { status: 400 });
    }

    try {
        const table = await prisma.table.findFirst({
            where: { tableNumber: parseInt(number, 10) }
        });
        if (!table) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        }
        return NextResponse.json({ id: table.id, qrData: table.qrData });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
