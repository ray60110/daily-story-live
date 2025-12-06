export default async function handler(req, res) {
  // 強制只允許 GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed", success: false });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.95,
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: "用繁體中文寫一篇600~900字的原創短篇故事，風格隨機（懸疑、治癒、奇幻、怪談皆可），要有完整劇情，直接輸出故事正文，不要加任何標題或說明。"
        }]
      })
    });

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content?.trim() || "生成失敗";

    res.status(200).json({
      success: true,
      story: story,
      time: new Date().toLocaleString("zh-TW")
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
