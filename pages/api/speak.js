// pages/api/speak.js
export default async function handler(req, res) {
  const text = decodeURIComponent(req.query.text || "");
  if (!text) return res.status(400).send("no text");

  const key = process.env.CARTESIA_API_KEY;
  if (!key) return res.status(500).send("Missing CARTESIA_API_KEY");

  try {
    const response = await fetch("https://api.cartesia.ai/v1/tts/bytes", {
      method: "POST",
      headers: {
        "Cartesia-Version": "2024-06-10",
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model_id: "sonic-multilingual",
        transcript: text,
        voice: {
          mode: "id",
          id: "b7c7e3e4-6f8f-4e7b-9c3d-2f1a0b9e8d7c"  // 官方推薦中文聲線（最自然）
        },
        output_format: {
          container: "mp3",
          encoding: "mp3",
          bit_rate: 128000
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Cartesia error:", err);
      return res.status(response.status).send("Cartesia error: " + err);
    }

    res.setHeader("Content-Type", "audio/mpeg");
    response.body.pipe(res);
  } catch (e) {
    console.error("Speak error:", e);
    res.status(500).send(e.message);
  }
}
