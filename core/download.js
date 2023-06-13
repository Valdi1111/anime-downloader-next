import prisma from "@/core/prisma";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

/**
 *
 * @param {string} folder
 * @param {string} episodeUrl
 * @param {int|float|string} episode
 * @param {string} downloadUrl
 * @param {string} fileName
 * @param {int|null} malId
 * @param {int|null} alId
 * @returns {Promise<int>}
 */
export default async function episode(folder, episodeUrl, episode, downloadUrl, fileName, malId, alId) {
    const download = await prisma.aw_download.create({
        data: {
            episode_url: episodeUrl,
            episode: episode,
            download_url: downloadUrl,
            state: "downloading",
            folder: folder,
            file: fileName,
            started: new Date(),
            mal_id: malId,
            al_id: alId
        }
    });
    const res = await fetch(downloadUrl, { cache: 'no-store' });
    if (!res.ok) {
        return Promise.reject(new Error("Cannot download episode file from url!"));
    }
    try {
        const folderPath = path.join(process.env.ANIME_BASE_FOLDER, folder);
        fs.mkdirSync(folderPath, { recursive: true })
        const filePath = path.join(folderPath, fileName);
        const filePathTemp = filePath + process.env.ANIME_DOWNLOAD_EXTENSION;
        const writeStream = fs.createWriteStream(filePathTemp);
        await new Promise((resolve, reject) => {
            Readable.from(res.body)
                .pipe(writeStream)
                .on("error", (err) => {
                    reject(err);
                })
                .on("finish", () => {
                    writeStream.close();
                })
                .on("close", () => {
                    fs.renameSync(filePathTemp, filePath);
                    resolve(writeStream);
                });
        });
    } catch (e) {
        await prisma.aw_download.update({
            data: { state: "error_downloading" },
            where: { id: download.id }
        });
        return Promise.reject(e);
    }
    await prisma.aw_download.update({
        data: {
            state: "completed",
            completed: new Date()
        },
        where: { id: download.id }
    });
    return Promise.resolve(download.id);
}
