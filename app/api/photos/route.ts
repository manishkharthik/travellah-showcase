import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';

{/* (1) Upload images */}
export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const tripId = form.get("tripId") as string;
        const day = form.get("day") as string;
        const caption = form.get("caption") as string;
        const imageFile = form.get("file") as File;
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (!tripId || !day || !caption || !imageFile) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Generate unique filename and sanitise
        const safeName = imageFile.name.replace(/[^\w.-]+/g, "_");
        const filename = `${tripId}_${randomUUID()}_${safeName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from("photos")
            .upload(filename, buffer, {
                contentType: imageFile.type,
            });

        if (error) {
            return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(data.path);
        const publicUrl = publicUrlData.publicUrl;

        const photo = await prisma.photo.create({
            data: {
                tripId,
                day: new Date(day),
                caption,
                imageUrl: publicUrl,
            },
        });
        return NextResponse.json(photo, { status: 201 });
    } catch (err: any) {
        console.error("Unexpected server error:", err);
        return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
    }
}

{/* (2) Display images belonging to trip on first load */}
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tripId = searchParams.get("tripId");
        if (!tripId) {
            return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
        }
        const allPhotos = await prisma.photo.findMany({
            where: { tripId },
            orderBy: [{ day: 'asc'}, { createdAt: 'desc'}],
        });
        const latestPhotosByDay = Object.values(
        allPhotos.reduce((acc, photo) => {
        const dayKey = photo.day.toISOString().split('T')[0];
        if (!acc[dayKey]) acc[dayKey] = photo; 
        return acc;
        }, {} as Record<string, typeof allPhotos[0]>)
    );
    return NextResponse.json(latestPhotosByDay);
    } catch (err: any) {
        console.error("GET /api/photos error:", err?.message || err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}