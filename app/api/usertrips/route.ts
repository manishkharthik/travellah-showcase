// app/api/user-trips/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getRequiredEnvVar } from '@/lib/env';

export async function GET(req: NextRequest) {
    try {
        const JWT_SECRET = getRequiredEnvVar('JWT_SECRET');
        
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

        const trips = await prisma.trip.findMany({
            where: { 
                tripMemberships: {
                    some: {
                        userId: decoded.userId,
                    },
                },
            }
        });
        return NextResponse.json(trips);
    } catch (error) {
        console.error('Error in /api/usertrips:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
