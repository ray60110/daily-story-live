// pages/api/speak.js - Cartesia 高品質版（低延遲、自然情感）
export default async function handler(req, res) {
  const text = decodeURIComponent(req.query.text || "");
  if (!text) return res.status(400).send("no text");

  const key = process.env.CARTESIA_API_KEY;
  if (!key) return res.status(500).send("Missing CARTESIA_API_KEY");

  try {
    const response = await fetch("https://api.cartesia.ai/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        voice: "c83a2b83-8eb0-4c2f-9b6a-0f1e0b8d2e1f",  // Cartesia 中文聲線 ID (從 docs 抄，換成你喜歡的)
        speed: 1.0,
        format: "mp3_44100_128"  // 高品質 MP3
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).send("Cartesia error: " + err);
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");
    response.body.pipe(res);
  } catch (e) {
    res.status(500).send("Server error: " + e.message);
  }
}
