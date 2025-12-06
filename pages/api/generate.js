const { Groq } = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      messages: [{
        role: "user",
        content: "給我一則600-900字的原創中文短篇故事，直接輸出純文字，開頭不要加任何標題或說明。"
      }]
    });

    const story = completion.choices[0]?.message?.content || "生成失敗";

    res.status(200).json({
      success: true,
      story: story,
      time: new Date().toLocaleString("zh-TW")
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
