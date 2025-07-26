import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.length < 1) {
        return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
        where: {
            username: {
                startsWith: query,
                mode: "insensitive",
            },
        },
        select: {
            name: true,
            username: true,
        },
        take: 8,
    });

    return NextResponse.json(users);
}