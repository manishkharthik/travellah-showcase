import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tripId = searchParams.get("tripId");
        if (!tripId) {
            return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
        }
        const messages = await prisma.message.findMany({
            where: { tripId },
            include: { 
                sender: true,
                replyTo: {
                    include: {
                        sender: true
                    }
                }
            },
            orderBy: { createdAt: "asc"},
        });
        return NextResponse.json({ data: messages });
    } catch (error) {
        console.error("[API] Failed to fetch messages", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { content, senderId, tripId, replyToId, type } = body;
    if (!content || !senderId || !tripId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const message = await prisma.message.create({
        data: {
            content,
            senderId,
            tripId,
            replyToId: replyToId || null,
            type,
        },
        include: {
            sender: true,
            replyTo: {
                include: { sender: true }
            }
        }
    });
    return NextResponse.json({ data: message });
}