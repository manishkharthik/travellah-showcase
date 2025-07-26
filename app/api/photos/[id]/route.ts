import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

{/* (3) Edit image caption/day */}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const photoId = params.id;
    const { caption, day } = await req.json();
    const updated = await prisma.photo.update({
        where: { id: photoId },
        data: {
            ...(caption && { caption }),
            ...(day && { day: new Date(day) }),
        },
    });
    return NextResponse.json(updated);
}

{/* (4) Delete selected image */}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const photoId = params.id;
    const photo = await prisma.photo.findUnique({
        where: { id: photoId },
    });
    if (!photo) {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }
    const path = photo.imageUrl.split('/').slice(-1)[0];
    const { error: storageError } = await supabase.storage.from('photos').remove([path]);
    if (storageError) {
        console.error('Supabase delete error:', storageError.message);
        return NextResponse.json({ error: "Failed to delete image from storage" }, { status: 500 });
    }
    const deleted = await prisma.photo.delete({
        where: { id: photoId },
    });
    return NextResponse.json(deleted);
}
