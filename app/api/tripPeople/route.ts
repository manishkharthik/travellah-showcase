import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");

    if (!tripId) {
        return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    try {
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                tripMemberships: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                username: true,
                                id: true,
                            },
                        },
                    },
                },
            },
        });

        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        const people = trip.tripMemberships.map((m) => (m.user));

        return NextResponse.json({ people });
    } catch (error) {
        console.error("Error fetching trip people:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });  
    }
}