import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const { name, color, tripId } = body;
    if (!name || !color || !tripId) {
        return NextResponse.json({error: "Missing fields"}, {status: 400});
    }
    try {
        const label = await prisma.label.create({
            data: {
                name, 
                color, 
                tripId,
            },
        });
        return NextResponse.json(label);
    } catch (error) {
        return NextResponse.json({error: "Failed to create label"}, { status: 500});
    }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");
    console.log("Fetching with tripId:", tripId); // ✅ Add this
    const where = tripId ? { tripId } : {};
    const labels = await prisma.label.findMany({ where });
    return NextResponse.json({ data: labels });
  } catch (error) {
    console.error("Error fetching labels:", error); // ✅ See actual error
    return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
    const {id} = await req.json();
    const result = await prisma.label.deleteMany({where: { id}});
    return NextResponse.json(result);
}

export async function PATCH(req: Request) {
    const {name, color, id} = await req.json();
    const label = await prisma.label.updateMany({
        where: {id },
        data: {name, color},
    });
    return NextResponse.json(label);
}

