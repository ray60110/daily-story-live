// pages/api/speak.js - Cartesia 官方端點 + 參數（2025-04-16 版本）
export default async function handler(req, res) {
  const text = decodeURIComponent(req.query.text || "");
  if (!text) return res.status(400).send("no text");

  const key = process.env.CARTESIA_API_KEY;
  if (!key) return res.status(500).send("Missing CARTESIA_API_KEY");

  try {
    const response = await fetch("https://api.cartesia.ai/v1/tts/bytes", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Cartesia-Version": "2025-04-16",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model_id: "sonic-3",  // 最新多語言模型
        transcript: text,
        voice: {
          mode: "id",
          id: "6ccbfb76-1fc6-48f7-b71d-91ac6298247b"  // 官方推薦自然英文/多語言聲線（中文自然）
        },
        language: "zh",  // 中文語言
        output_format: {
          container: "mp3",
          encoding: "mp3",
          sample_rate: 44100,
          bit_rate: 128000
        },
        generation_config: {
          volume: 1.0,
          speed: 1.0,
          emotion: "neutral"
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Cartesia error:", err);
      return res.status(response.status).send("Cartesia error: " + err);
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");
    response.body.pipe(res);
  } catch (e) {
    console.error("Speak error:", e);
    res.status(500).send("Server error: " + e.message);
  }
}
