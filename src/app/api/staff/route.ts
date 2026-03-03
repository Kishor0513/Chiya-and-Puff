import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyAuth(token);
        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const staff = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, role: true, createdAt: true }
        });

        return NextResponse.json(staff);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
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

        const { name, password, role } = await request.json();

        const existing = await prisma.user.findFirst({ where: { name } });
        if (existing) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                password: hashedPassword,
                role: role || 'WAITER'
            },
            select: { id: true, name: true, role: true, createdAt: true }
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
    }
}
