import * as cheerio from "cheerio";

/**
 * Get the download urls for a given series
 * @param link the series
 * @returns {Promise<{malId: int|null, alId: int|null, episodes: [{url: string, fileName: string, episode: string}]}>}
 */
export async function getSeriesUrls(link) {
    const host = link.substring(0, link.lastIndexOf("/") + 1);
    const res = await fetch(link, { cache: 'no-store' });
    if (!res.ok) {
        return Promise.reject(new Error("Cannot load page from series link!"));
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const episodes = [];
    const elements = $("div.server.active ul.episodes.range li.episode a");
    for (let i = 0; i < elements.length; i++) {
        const element = elements.get(i);
        const eLink = host + $(element).attr("data-id");
        try {
            const eUrl = await getEpisodeUrl(eLink, false);
            eUrl.episode = $(element).attr("data-episode-num");
            episodes.push(eUrl)
        } catch (e) {
            return Promise.reject(e);
        }
    }
    const data = { episodes }
    const malButton = $("#mal-button");
    if (malButton) {
        const str = malButton.attr("href");
        data.malId = !str ? null : parseInt(str.substring(str.lastIndexOf("/") + 1));
    }
    const alButton = $("#anilist-button");
    if (alButton) {
        const str = alButton.attr("href");
        data.alId = !str ? null : parseInt(str.substring(str.lastIndexOf("/") + 1));
    }
    return Promise.resolve(data);
}

/**
 * Get the download data for a given episode
 * @param link the episode
 * @param all get episode number, myanimelist and anilist ids
 * @returns {Promise<{url: string, fileName: string, episode: string|null, malId: int|null, alId: int|null}>}
 */
export async function getEpisodeUrl(link, all = false) {
    const res = await fetch(link, { cache: 'no-store' });
    if (!res.ok) {
        return Promise.reject(new Error("Cannot load page from episode link!"));
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const dlButton = $("#downloadLink");
    if (!dlButton) {
        return Promise.reject(new Error("Download button not found!"));
    }
    let url = dlButton.attr("href");
    if (!url) {
        return Promise.reject(new Error("Attribute href not found in download button!"));
    }
    const data = {
        url: url.replace("download-file.php?id=", ""),
        fileName: url.substring(url.lastIndexOf("/") + 1),
    };
    if (all) {
        data.episode = $("div.server.active ul.episodes.range li.episode a.active").attr("data-episode-num");
        const malButton = $("#mal-button");
        if (malButton) {
            const str = malButton.attr("href");
            data.malId = !str ? null : parseInt(str.substring(str.lastIndexOf("/") + 1));
        }
        const alButton = $("#anilist-button");
        if (alButton) {
            const str = alButton.attr("href");
            data.alId = !str ? null : parseInt(str.substring(str.lastIndexOf("/") + 1));
        }
    }
    return Promise.resolve(data);
}
