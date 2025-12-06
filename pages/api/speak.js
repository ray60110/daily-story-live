export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const text = decodeURIComponent(req.query.text || "");
  if (!text) return res.status(400).send("no text");

  const key = process.env.CARTESIA_API_KEY;
  if (!key) return res.status(500).send("Missing CARTESIA_API_KEY");

  try {
    const response = await fetch("https://api.cartesia.ai/tts/sse", {  // SSE 端點（官方推薦，避開 bytes 404）
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Cartesia-Version": "2025-04-16",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model_id: "sonic-2",  // 穩定模型
        transcript: text,
        voice: {
          mode: "name",
          name: "alloy"  // 官方自然聲線（支援中文）
        },
        output_format: {
          container: "mp3",
          encoding: "mp3",
          sample_rate: 44100
        },
        generation_config: {
          volume: 1.0,
          speed: 1.0
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
