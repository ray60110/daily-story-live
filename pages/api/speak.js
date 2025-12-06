export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const text = decodeURIComponent(req.query.text || "");
  if (!text) return res.status(400).send("no text");

  const key = process.env.CARTESIA_API_KEY;
  if (!key) return res.status(500).send("Missing CARTESIA_API_KEY");

  try {
    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Cartesia-Version": "2025-04-16",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model_id: "sonic-3",
        transcript: text,
        voice: {
          mode: "id",
          id: "6ccbfb76-1fc6-48f7-b71d-91ac6298247b"
        },
        language: "zh",
        generation_config: {
          volume: 1.0,
          speed: 1.0,
          emotion: "neutral"
        },
        output_format: {
          container: "mp3",
          encoding: "mp3",
          sample_rate: 44100,
          bit_rate: 128000
        },
        save: false
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
