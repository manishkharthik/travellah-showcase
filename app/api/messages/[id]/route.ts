import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const messageId = params.id;
    if (!messageId) {
        return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }
    try {
        await prisma.message.delete({
            where: { id: messageId },
        });
        return NextResponse.json({ message: "Message deleted" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}