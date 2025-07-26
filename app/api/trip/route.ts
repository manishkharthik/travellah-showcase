import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");

    if (!tripId) {
        return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    try {
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                user: true,
                tripMemberships: {
                    include: {
                        user: true,
                    },
                },
                events: true,
                labels: true,
                expenses: true,
                messages: true, 
            },
        });
        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }
        return NextResponse.json({ data: trip }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch trip", err }, { status: 500 });
    }
}

