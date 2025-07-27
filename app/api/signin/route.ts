import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getRequiredEnvVar } from '@/lib/env';

export async function POST(req: NextRequest) {
    try {
      // Check for required environment variables
      const JWT_SECRET = getRequiredEnvVar('JWT_SECRET');

      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
      }

      // Test database connection
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      const response = NextResponse.json({ message: 'Signed in successfully' });

      response.headers.set(
        'Set-Cookie',
        `token=${token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
      );

      return response;
      } catch (error) {
        console.error('Error during sign-in:', error);
        // More detailed error logging for debugging
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
}
