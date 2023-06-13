const user = 'Valdi_1111';
const limit = 100;

/**
 *
 * @param {string} url
 * @return {Promise<Response<{paging: {prev, next}, data: [{node: {id, title}, list_status: {status}}]}>>}
 */
async function getList(url) {
    const res = await fetch(url, { cache: 'no-store', headers: { 'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID } });
    return await res.json();
}

/**
 *
 * @return {Promise<[{id, title, status}]>}
 */
export async function getListAll(anime) {
    const type = anime ? 'animelist' : 'mangalist';
    const list = [];
    let next = `https://api.myanimelist.net/v2/users/${user}/${type}?nsfw=true&fields=list_status&limit=${limit}`;
    while (next) {
        const res = await getList(next);
        // TODO check res.ok
        next = res.paging.next;
        for (const item of res.data) {
            list.push({ id: item.node.id, title: item.node.title, status: item.list_status.status });
        }
    }
    return list;
}
