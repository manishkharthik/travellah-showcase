import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const tripId = body.tripId;

  if (!tripId) {
    return NextResponse.json({ error: "Missing trip ID" }, { status: 400 });
  }

  try {
    await prisma.trip.delete({
      where: { id: tripId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Trip deletion failed" }, { status: 500 });
  }
}
