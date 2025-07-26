import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark task as complete
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const taskId = params.id;
    try {
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                completed: true,
                completedAt: new Date(),
            },
        });
        return NextResponse.json({ message: "Task completed!", data: updatedTask });
    } catch (err) {
        console.error("Error updating task:", err);
        return NextResponse.json({ error: "Failed to update task", err }, { status: 500 });
    }
}

// Delete task
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const taskId = params.id;
    try {
        await prisma.task.delete({
            where: { id: taskId },
        });
        return NextResponse.json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error("Error deleting task:", err);
        return NextResponse.json({ error: "Failed to delete task", err }, { status: 500 });
    }
}