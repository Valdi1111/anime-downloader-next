const dotenv = require("dotenv");
dotenv.config();

const fetch = require("node-fetch");
const io = require("socket.io-client");
const ws = io("https://api.animeworld.tv/");
const TAG = "[AnimeWorld Api]";

const opts = {
    auth: {
        clientId: process.env.AW_CLIENT_ID,
        apiKey: process.env.AW_API_KEY,
    }
};

ws.on('connect', function () {
    ws.emit("authorization", opts);
});

// Success events

ws.on('authorized', function (data) {
    console.log(TAG, "Successfully connected!");
});

ws.on('event_anime', function (data) {
    console.log(TAG, "New anime added!", data);
});

ws.on('event_episode', async function (data) {
    console.log(TAG, "News episode added!", data);
    const res = await fetch(process.env.EPISODE_DL_API_URL, {
        cache: 'no-store',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: data.episode.link, filter: true })
    });
    if (!res.ok) {
        console.error(TAG, "Error on episode download!");
    }
});

ws.on('event_news', function (data) {
    console.log(TAG, "News added!", data);
});

// Failure events

ws.on('unauthenticated', function (data) {
    console.error(TAG, "Unauthenticated!", data);
});

ws.on('unauthorized', function (data) {
    console.error(TAG, "Unauthorized!", data);
});

ws.on('authorization_expired', function (data) {
    console.error(TAG, "Authorization expired!", data);
});

ws.on('authorization_exceeded', function (data) {
    console.error(TAG, "Authorization exceeded!", data);
});

ws.on('authorization_flooded', function (data) {
    console.error(TAG, "Authorization flooded!", data);
});

ws.on('disconnect', function (data) {
    console.log(TAG, "Disconnected.", data);
});

console.log(TAG, "Starting...");

module.exports = ws;
