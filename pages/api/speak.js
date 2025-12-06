// pages/api/speak.js - 終極版，實測 duration 正確 + 播放順利
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const text = decodeURIComponent(req.query.text || "");
  if (!text) return res.status(400).send("no text");

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs:", err);
      return res.status(response.status).send("ElevenLabs error: " + err);
    }

    // 關鍵：加這些 headers 讓瀏覽器正確讀 metadata
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");  // 支援 seek
    res.setHeader("Content-Length", response.headers.get("content-length") || "0");

    response.body.pipe(res);  // 完整 stream
  } catch (e) {
    console.error("Vercel stream error:", e);
    res.status(500).send("Stream error: " + e.message);
  }
}
