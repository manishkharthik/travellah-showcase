import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const latestTrip = await prisma.trip.findFirst({
      where: {
        tripMemberships: {
          some: {
            userId: parseInt(userId),
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
      include: {
        tripMemberships: {
          include: {
            user: {
              select: {
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!latestTrip) {
      return NextResponse.json({ error: "No trips found" }, { status: 404 });
    }

    const people = latestTrip.tripMemberships.map((m) => m.user);
    return NextResponse.json({ trip: latestTrip, people }, { status: 200 });
  } catch (error) {
    console.error("Error fetching latest trip:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}