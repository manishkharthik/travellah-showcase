import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { timeStart, timeEnd, day, notes, location, name, labelId } = await request.json();
    const { id: eventId } = await params;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        day: day,
        timeStart: timeStart,
        timeEnd: timeEnd,
        notes: notes,
        location: location,
        ...(name !== undefined ? { name } : {}),
        ...(labelId !== undefined ? { labelId } : {}),
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    // Delete the event and all its copies
    await prisma.event.deleteMany({
      where: {
        OR: [
          { id: eventId },
          { originalEventId: eventId },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
