import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getRequiredEnvVar } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
        const JWT_SECRET = getRequiredEnvVar('JWT_SECRET');
        
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
      data: {
                name,
        email,
        password: hashedPassword,
            },
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        const response = NextResponse.json({ message: 'User created successfully' });

        response.headers.set(
            'Set-Cookie',
            `token=${token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
        );

        return response;
    } catch (error) {
        console.error('Error during signup:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
