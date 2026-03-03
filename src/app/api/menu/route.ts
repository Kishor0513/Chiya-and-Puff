import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const items = await prisma.menuItem.findMany({
            orderBy: { category: 'asc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyAuth(token);
        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const data = await request.json();

        const item = await prisma.menuItem.create({
            data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                category: data.category,
                imageUrl: data.imageUrl || '',
                available: data.available !== undefined ? data.available : true
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('Create Menu Error:', error);
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}
