import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signAuth } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, password } = await request.json();

        const user = await prisma.user.findFirst({
            where: { name }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await signAuth({
            id: user.id,
            name: user.name,
            role: user.role
        });

        const response = NextResponse.json({ success: true, role: user.role });

        response.cookies.set({
            name: 'auth-token',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return response;
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
