// 超穩定版：完全不 import 任何第三方套件，直接 fetch Groq
export default async function handler(req, res) {
  // 只允許 GET
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // 檢查 key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: "GROQ_API_KEY not set" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.95,
        max_tokens: 1300,
        messages: [
          {
            role: "user",
            content: "用繁體中文寫一篇600~900字的原創短篇故事，風格隨機（懸疑、治癒、奇幻、怪談皆可），要有完整起承轉合，直接輸出故事正文，不要加任何標題、引號、說明或程式碼符號。"
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Groq API error");
    }

    const story = data.choices[0].message.content.trim();

    res.status(200).json({
      success: true,
      story: story,
      generated_at: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
