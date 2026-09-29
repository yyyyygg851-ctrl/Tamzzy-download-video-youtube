const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "100kb" }));

app.use(express.static(path.join(__dirname)));

function isYoutubeUrl(value) {
try {
const url = new URL(value);

const host = url.hostname.toLowerCase();

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
    error: "URL harus berupa URL YouTube."
  });
}

const response = await axios.post(
  "https://api.ytultra.com/ikool/youtube/download",
  { url },
  {
    headers: {
      "Content-Type": "application/json",
      "referer": "https://www.ytultra.com/id/youtube-video-downloader/",
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

if (
  !data ||
  !data.data ||
  !Array.isArray(data.data.medias)
) {
  return res.status(502).json({
    error: "Server downloader tidak mengembalikan daftar media.",
    upstream: data
  });
}

return res.json(data);

} catch (error) {

console.error(
  "YTUltra error:",
  error.response?.data || error.message
);

return res.status(500).json({
  error:
    error.response?.data?.message ||
    "Gagal memproses video. Coba lagi beberapa saat."
});

}
});

app.get("*", (req, res) => {

if (req.path.startsWith("/api/")) {
return res.status(404).json({
error: "API endpoint tidak ditemukan."
});
}

res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
console.log("TAMZZY Downloader running on port ${PORT}");
});
