import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: "給我一則600-900字的原創中文短篇故事，直接輸出純文字，不要加標題、引號、任何說明。"
      }]
    });

    const story = completion.choices[0]?.message?.content || "生成失敗";

    res.status(200).json({
      success: true,
      title: "今日故事（測試版）",
      story: story,
      time: new Date().toLocaleString("zh-TW")
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
