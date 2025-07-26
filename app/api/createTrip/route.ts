import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, peopleToInvite, tripStart, tripEnd, userId } = body;

    if (!name|| !tripStart || !tripEnd) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const peopleArray = Array.isArray(peopleToInvite)
      ? peopleToInvite
      : peopleToInvite.split(",").map((username: string) => username.trim()).filter(Boolean);

    const validUsers = await prisma.user.findMany({
      where: {
        username: {
          in: peopleArray,
        },
      },
      select: {
        username: true,
      },
    });

    const validUsernames = validUsers.map((u) => u.username).filter((username): username is string => username !== null);
    const invalidUsernames = peopleArray
      .filter((username: string | null): username is string => typeof username === 'string' && username !== null)
      .filter((username: string) => !validUsernames.includes(username));

    if (invalidUsernames.length > 0) {
      return NextResponse.json(
        {error: `The following usernames(s) were not found: ${invalidUsernames.join(", ")}`,},
      );
    }

    const newTrip = await prisma.trip.create({
      data: {
        name,
        peopleInvited: validUsernames,
        startDate: new Date(tripStart),
        endDate: new Date(tripEnd),
        user: {connect: { id: userId } },

      },
    });

    const invitedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { username: { in: validUsernames } },
          { id: userId },
        ],
      },
      select: {
        id: true,
      },
    });

    await prisma.tripMembership.createMany({
      data: invitedUsers.map((user) => ({
        userId: user.id,
        tripId: newTrip.id,
      })),
    });

    return NextResponse.json({trip: newTrip}, { status: 201 });

  } catch (error) {
    console.error("Trip creation error: ", error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}