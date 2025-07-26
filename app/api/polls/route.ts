import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");
    if (!tripId) {
        return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }
    try {
        const polls = await prisma.poll.findMany({
            where: { tripId },
            include: {
                creator: true,
                options: {
                    include: {
                        votes: true,
                    },
                },
                votes: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json({ data: polls }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch polls", err }, { status: 500 });
    }
}

export async function POST(req: NextResponse) {
    const body = await req.json();
    const { title, creatorId, tripId, allowMultiple, options } = body;
    if (!title || !creatorId || !tripId || !options || options.length < 2 || options.some((o: string) => !o.trim()) || options.length > 10) {
        return NextResponse.json({ error: "Missing required fields or invalid options" }, { status: 400 });
    }
    try {
        const newPoll = await prisma.poll.create({
            data: {
                title,
                creatorId,
                tripId,
                allowMultiple,
                options: {
                    create: options.map((text: string) => ({ text })),
                },
            },
            include: {
                options: {
                    include: {
                        votes: true,
                    },
                },
                creator: true,
            },
        });
        return NextResponse.json({ data: newPoll }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
    }
}