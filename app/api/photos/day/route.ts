import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

{/* (5) Display images for a particular day */}
export async function GET(req: NextRequest) {
    const tripId = req.nextUrl.searchParams.get('tripId');
    const dayStr = req.nextUrl.searchParams.get('day');
    if (!tripId || !dayStr) {
        return NextResponse.json({ error: 'Missing tripId or day' }, { status: 400 });
    }
    const targetDate = new Date(dayStr);
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);
    const photos = await prisma.photo.findMany({
        where: {
            tripId,
            day: {
                gte: targetDate,
                lt: nextDate,
            },
        },
        orderBy: {
            createdAt: 'desc'
        },
    });
    return NextResponse.json(photos);
}