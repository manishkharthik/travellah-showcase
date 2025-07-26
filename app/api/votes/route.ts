import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const body = await req.json();
    const { userId, optionIds, pollId } = body;
    if (!userId || !optionIds || !pollId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    try {
        // Remove previous votes by user for this poll
        await prisma.vote.deleteMany ({
            where: { userId, pollId },
        })
         // Submit new votes
        await prisma.vote.createMany ({
            data: optionIds.map((optionId: string) => ({
                userId,
                optionId,
                pollId,
            })),
        });
        // Fetch the updated poll (including creator and votes)
        const updatedPoll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                creator: true,
                options: {
                    include: { votes: true },
                },
            },
        });
        return NextResponse.json({ updatedPoll }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Failed to submit vote" }, {status: 500 });
    }
}