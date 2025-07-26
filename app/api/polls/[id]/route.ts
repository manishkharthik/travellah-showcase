import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const pollId = params.id;
    try {
        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                creator: true,
                options: {
                    include: {
                        votes: {
                            include: {
                                user: true, 
                            },
                        },
                    },
                },
                votes: true,
            },
        });
        if (!poll) {
            return NextResponse.json({ error: "Poll not found" }, { status: 404 });
        }
        return NextResponse.json({ data: poll });
    } catch {
        return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const pollId = params.id;
    const { title, options } = await req.json();
    try {
        await prisma.poll.update({
            where: { id: pollId },
            data: {
                title,
            },
        });
        if (options && Array.isArray(options)) {
            const existingOptions = await prisma.pollOption.findMany({ where: { pollId } });
            const incomingIds = options.filter(o => o.id).map(o => o.id);
            const toDelete = existingOptions.filter(o => !incomingIds.includes(o.id));
            for (const opt of toDelete) {
                await prisma.vote.deleteMany({ where: { optionId: opt.id } });
                await prisma.pollOption.delete({ where: { id: opt.id } });
            }
            for (const opt of options) {
                if (opt.id) {
                    await prisma.pollOption.update({
                        where: { id: opt.id },
                        data: { text: opt.text },
                    });
                } else {
                    await prisma.pollOption.create({
                        data: {
                            text: opt.text,
                            pollId,
                        },
                    });
                }
            }
        }
        const updatedPoll = await prisma.poll.findUnique({
            where: { id: pollId},
            include: {
                creator: true,
                options: { include: { votes: true } },
                votes: true,
            },
        });
        return NextResponse.json({ updated: updatedPoll });
    } catch {
        return NextResponse.json({ error: "Failed to updated poll" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const pollId = params.id;
    try {
        const options = await prisma.pollOption.findMany({ where: { pollId } });
        for (const opt of options) {
            await prisma.vote.deleteMany({ where: { optionId: opt.id } });
        }
        await prisma.pollOption.deleteMany({ where: { pollId } });
        await prisma.poll.delete({ where: { id: pollId } });
        return NextResponse.json({ message: "Poll deleted" });
    } catch {
        return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 });
    }
}