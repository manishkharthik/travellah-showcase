import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Retireive all tasks for a trip
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");
    if (!tripId) {
        return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }
    try {
        const tasks = await prisma.task.findMany({
            where: { tripId },
            include: {
                assigner: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
                assignees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                dueBy: "asc",
            },
        });
        return NextResponse.json({ data: tasks }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Failed to retrieve tasks", err }, { status: 500 });
    }
}

// Create a new task
export async function POST(req: NextRequest) {
    const body = await req.json();
    const {title, assignerId, assigneeIds, dueBy, tripId, description} = body;
    if (!title || !assignerId || !assigneeIds || !dueBy || !tripId || !description) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                assignerId,
                createdAt: new Date(),
                dueBy: new Date(dueBy),
                tripId
            },
        });
        await prisma.taskAssignee.createMany({
            data: assigneeIds.map((userId: number) => ({
                taskId: task.id,
                userId,
            })),
        });
        const fullTask = await prisma.task.findUnique({
            where: { id: task.id },
            include: {
                assigner: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
                assignees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });
        return NextResponse.json({ data: fullTask });
    } catch (err) {
        return NextResponse.json({ error: "Failed to create task", err }, { status: 500 });
    }
}