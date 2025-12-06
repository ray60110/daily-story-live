export default async function handler(req, res) {
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
          content: "用繁體中文寫一篇600~900字的原創短篇故事，風格隨機（懸疑、治癒、奇幻、怪談皆可），要有完整起承轉合，直接輸出故事正文，不要加標題、引號、任何說明。"
        }]
      })
    });

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content || "生成失敗";

    res.status(200).json({
      success: true,
      story: story.trim(),
      time: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
