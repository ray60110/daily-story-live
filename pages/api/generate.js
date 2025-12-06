export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { GROQ_API_KEY, ELEVENLABS_API_KEY } = process.env;
  if (!GROQ_API_KEY || !ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "Missing API keys" });
  }

  try {
    // 1. Groq 生成故事
    const storyRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.95,
        max_tokens: 1300,
        messages: [{ role: "user", content: "用繁體中文寫一篇600~900字的原創短篇故事，風格隨機，要有完整劇情，直接輸出純文字，不要加標題。" }]
      })
    });
    const storyData = await storyRes.json();
    const story = storyData.choices[0].message.content.trim();

    // 2. 直接回傳 ElevenLabs 串流網址（超穩！瀏覽器一定播得動）
    const audioUrl = `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream?optimize_streaming_latency=0`;

    // 把故事文字透過 query string 傳給前端，前端再送去 ElevenLabs
    const playUrl = `/api/play?text=${encodeURIComponent(story)}`;

    res.json({
      success: true,
      story,
      audio_url: playUrl,   // 這才是真的能播的網址
      generated_at: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
