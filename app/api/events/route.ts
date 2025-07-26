import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const event = await prisma.event.create({
      data: {
        name: body.name,
        labelId: body.labelId,
        color: body.color,
        tripId: body.tripId,
      },
      
    });
    return NextResponse.json(event);
  } catch (err) {
    console.error("Error creating event:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");
    const where = tripId ? { tripId } : {};

    const events = await prisma.event.findMany({
      where,
      include: {
        label: true, // 👈 includes label data in each event
      },
    });

    return NextResponse.json({ data: events });
  } catch (error) {
    console.error("Error fetching events", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}


    // try {
    //     const {searchParams} = new URL(req.url);
    //     const tripId = searchParams.get("tripId");
    //     const where = tripId ? {tripId} : {};
    //     const events = await prisma.event.findMany({where, include: {label: true}});
        
    //     return NextResponse.json({data: events});
    // } catch (error) {
    //     return NextResponse.json({error: "Failed to fetch events"}, {status: 500});
    // }
