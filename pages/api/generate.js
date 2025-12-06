export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY" });
  }

  try {
    // 1. 先用 Groq 生文字
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.95,
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: "用繁體中文寫一篇600~900字的原創短篇故事，風格隨機，要有完整劇情，直接輸出純文字，不要加標題。"
        }]
      })
    });

    const groqData = await groqRes.json();
    const story = groqData.choices[0].message.content.trim();

    // 2. 用台灣微軟免費 TTS 轉語音（完全不用 key，音質超好）
    const ttsUrl = `https://dict.radiotaiwan.tw/taiwan/sound.php?word=${encodeURIComponent(story.substring(0, 500))}&voice=zh-TW-HsiaoChenNeural`;

    res.status(200).json({
      success: true,
      story: story,
      audio_url: ttsUrl,     // 直接給前端播放
      tip: "點擊播放鍵即可聽完整故事（前500字免費版）",
      generated_at: new Date().toLocaleString("zh-TW")
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
