import { prisma} from "@/lib/prisma"
import {NextResponse } from "next/server";

export async function DELETE(req: Request, {params} : {params: {id: string}}) {
    const {id} = await req.json();
    const result = await prisma.label.deleteMany({where: { id}});
    return NextResponse.json(result);
}

export async function PATCH(req: Request, {params} : {params: {id:string}}) {
    const {name, color, id} = await req.json();
    const label = await prisma.label.updateMany({
        where: {id },
        data: {name, color},
    });
    return NextResponse.json(label);
}