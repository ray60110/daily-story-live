export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const text = decodeURIComponent(req.query.text || "");
  if (!text) return res.status(400).send("no text");

  const key = process.env.CARTESIA_API_KEY;
  if (!key) return res.status(500).send("Missing CARTESIA_API_KEY");

  try {
    const r = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Cartesia-Version": "2025-04-16",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model_id: "sonic-3",
        transcript: text,
        voice: { mode: "id", id: "6ccbfb76-1fc6-48f7-b71d-91ac6298247b" },
        language: "zh",
        output_format: { container: "mp3", encoding: "mp3", sample_rate: 44100 }
      })
    });

    if (!r.ok) {
      const e = await r.text();
      return res.status(r.status).send("Cartesia error: " + e);
    }

    res.setHeader("Content-Type", "audio/mpeg");
    r.body.pipe(res);
  } catch (e) {
    res.status(500).send("Server error: " + e.message);
  }
}
