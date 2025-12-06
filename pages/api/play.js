export default async function handler(req, res) {
  const text = req.query.text || "";
  const key = process.env.ELEVENLABS_API_KEY;

  const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream", {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.7, similarity_boost: 0.85 }
    })
  });

  res.setHeader("Content-Type", "audio/mpeg");
  response.body.pipe(res);
}
