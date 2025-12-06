export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const GROQ_KEY = process.env.GROQ_API_KEY;
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;

  if (!GROQ_KEY || !ELEVEN_KEY) {
    return res.status(500).json({ error: "Missing API keys" });
  }

  try {
    // Step 1: 生成故事文字
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.95,
        max_tokens: 1300,
        messages: [{
          role: "user",
          content: "用繁體中文寫一篇600~900字的原創短篇故事，風格隨機（懸疑、治癒、奇幻、怪談皆可），要有完整劇情，直接輸出故事正文，不要加任何標題或說明。"
        }]
      })
    });

    const groqData = await groqRes.json();
    const story = groqData.choices[0].message.content.trim();

    // Step 2: 轉語音合成（Rachel 聲音）
    const ttsRes = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: story,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.7, similarity_boost: 0.85 }
      })
    });

    const audioBuffer = await ttsRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    res.status(200).json({
      success: true,
      story: story,
      audio_url: audioUrl,           // 前端直接放 <audio src={audio_url} />
      generated_at: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
