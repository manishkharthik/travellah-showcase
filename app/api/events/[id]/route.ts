import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, context: any) {
  const body = await req.json();
  const id = context.params?.id;

  if (!id) {
    return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
  }

  try {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        day: body.day ? new Date(body.day) : undefined,
        timeStart: body.timeStart ?? undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating event:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
