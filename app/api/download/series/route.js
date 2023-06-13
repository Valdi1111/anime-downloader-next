import { NextResponse } from "next/server";
import { getSeriesUrls } from "@/core/animeworld";
import episode from "@/core/download";
import prisma from "@/core/prisma";

export async function POST(req) {
    /**
     * @type {{link: string, filter: boolean|null}}
     */
    const json = await req.json();
    let data;
    try {
        data = await getSeriesUrls(json.link);
    } catch (e) {
        return NextResponse.json({ error: true, message: "Error fetching series data" });
    }
    if (json.filter) {
        if (!data.malId) {
            return NextResponse.json({ error: true, message: "Mal id not found in series page" });
        }
        const malAnime = await prisma.mal_animelist.findUnique({
            where: { id: data.malId }
        })
        if (!malAnime) {
            return NextResponse.json({ error: true, message: "Series not in mal anime-list" });
        }
    }
    let folder = process.env.ANIME_TEMP_FOLDER;
    if (data.malId) {
        const malFolder = await prisma.mal_folder.findUnique({
            where: { id: data.malId }
        })
        if (malFolder) {
            folder = malFolder.folder;
        }
    }
    await Promise.all(data.episodes.map(e => episode(folder, json.link, e.episode, e.url, e.fileName, data.malId, data.alId)));
    return NextResponse.json({ success: true, ...data });
}
