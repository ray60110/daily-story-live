// pages/api/generate.js
export default async function handler(req, res) {
  // 直接用 fetch 呼叫 Groq API，完全不 import 任何套件
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.9,
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content: "請用繁體中文寫一篇600~900字的原創短篇故事，風格隨機但要有完整起承轉合，直接輸出故事正文，不要加標題、引號、任何說明。"
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || "Groq API 錯誤");

    const story = data.choices[0]?.message?.content || "生成失敗";

    res.status(res).status(200).json({
      success: true,
      story: story.trim(),
      generated_at: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
