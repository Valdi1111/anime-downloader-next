import { NextResponse } from "next/server";
import { getListAll } from "@/core/myanimelist";
import prisma from "@/core/prisma";

export async function GET() {
    const list = await prisma.mal_mangalist.findMany();
    return NextResponse.json(list);
}

export async function POST() {
    const data = await getListAll(true);
    await prisma.mal_mangalist.deleteMany();
    await prisma.mal_mangalist.createMany({ data });
    return NextResponse.json(data);
}
