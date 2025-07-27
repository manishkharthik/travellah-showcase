import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, labelId, color, tripId, day, timeStart, timeEnd, originalEventId, notes, location } = body;
    const newEvent = await prisma.event.create({
      data: {
        name,
        labelId,
        color,
        tripId,
        day,
        timeStart,
        timeEnd,
        originalEventId,
        notes,
        location,
      },
    });
    return NextResponse.json(newEvent);
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

    // Add connection retry logic
    let retries = 3;
    let events;
    
    while (retries > 0) {
      try {
        events = await prisma.event.findMany({
          where,
          include: {
            label: true, // 👈 includes label data in each event
          },
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          console.error("Error fetching events after retries:", error);
          return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

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