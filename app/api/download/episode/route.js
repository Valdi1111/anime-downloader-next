import { NextResponse } from "next/server";
import { getEpisodeUrl } from "@/core/animeworld";
import episode from "@/core/download";
import prisma from "@/core/prisma";

export async function POST(req) {
    /**
     * @type {{link: string, filter: boolean|null}}
     */
    const json = await req.json();
    let data;
    try {
        data = await getEpisodeUrl(json.link, true);
    } catch (e) {
        return NextResponse.json({ error: true, message: "Error fetching episode data" });
    }
    if (json.filter) {
        if (!data.malId) {
            return NextResponse.json({ error: true, message: "Mal id not found in episode page" });
        }
        const malAnime = await prisma.mal_animelist.findUnique({
            where: { id: data.malId }
        })
        if (!malAnime) {
            return NextResponse.json({ error: true, message: "Episode not in mal anime-list" });
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
    await episode(folder, json.link, data.episode, data.url, data.fileName, data.malId, data.alId);
    return NextResponse.json({ success: true, ...data });
}
