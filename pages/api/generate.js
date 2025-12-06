export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Wrong method" });

  try {
    // 1. Groq 生故事
    const groq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.95,
        max_tokens: 1300,
        messages: [{ role: "user", content: "用繁體中文寫一篇600~900字原創短篇故事，風格隨機，直接輸出純文字，不要標題。" }]
      })
    });
    const gdata = await groq.json();
    const story = gdata.choices[0].message.content.trim();

    // 2. 回傳「直接可點的 ElevenLabs 播放網址」
    const playUrl = `/api/speak?text=${encodeURIComponent(story)}`;

    res.json({
      success: true,
      story,
      audio_url: playUrl,
      generated_at: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
