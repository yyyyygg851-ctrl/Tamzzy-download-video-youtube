const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.static(__dirname));

function isYoutubeUrl(value) {
try {
const u = new URL(value);
const host = u.hostname.toLowerCase();

return (
  host === "youtu.be" ||
  host === "youtube.com" ||
  host.endsWith(".youtube.com") ||
  host === "youtube-nocookie.com" ||
  host.endsWith(".youtube-nocookie.com")
);

} catch {
return false;
}
}

app.post("/api/download", async (req, res) => {
try {
const { url } = req.body || {};

if (!url) {
  return res.status(400).json({
    error: "URL YouTube belum diberikan."
  });
}

if (!isYoutubeUrl(url)) {
  return res.status(400).json({
    error: "URL YouTube tidak valid."
  });
}

const response = await axios.post(
  "https://api.ytultra.com/ikool/youtube/download",
  { url },
  {
    headers: {
      "Content-Type": "application/json",
      "referer":
        "https://www.ytultra.com/id/youtube-video-downloader/",
      "origin": "https://www.ytultra.com",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/58.0.3029.110 Safari/537.3"
    },
    timeout: 30000
  }
);

const data = response.data;

if (!data) {
  return res.status(502).json({
    error: "API downloader tidak mengembalikan data."
  });
}

if (
  data.data &&
  Array.isArray(data.data.medias)
) {
  return res.json(data);
}

return res.status(502).json({
  error: "Media tidak ditemukan dari API downloader."
});

} catch (error) {
console.error(
"Downloader error:",
error.response?.data || error.message
);

return res.status(500).json({
  error:
    error.response?.data?.message ||
    error.message ||
    "Gagal memproses video."
});

}
});

app.get("/api/health", (req, res) => {
res.json({
status: "online",
service: "TAMZZY Downloader"
});
});

/*
Penting untuk Vercel:
jangan menggunakan app.listen().
*/
module.exports = app;
