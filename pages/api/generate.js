export default async function handler(req, res) {
  // 1. 檢查 HTTP 方法
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. 檢查環境變數
  if (!process.env.GROQ_API_KEY) {
    console.error('Missing GROQ_API_KEY in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // 3. 呼叫 Groq API
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
          content: "用繁體中文寫一篇600~900字的原創短篇故事,風格隨機(懸疑、治癒、奇幻、怪談皆可),要有完整起承轉合,直接輸出故事正文,不要加標題、引號、任何說明。"
        }]
      })
    });

    // 4. 檢查 HTTP 回應狀態
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      throw new Error(
        errorData.error?.message || 
        `API request failed with status ${response.status}`
      );
    }

    // 5. 解析回應
    const data = await response.json();
    
    // 6. 驗證回應資料
    if (!data.choices || data.choices.length === 0) {
      console.error('Invalid API response:', data);
      throw new Error('No story generated from API');
    }

    const story = data.choices[0]?.message?.content;
    
    if (!story || story.trim().length === 0) {
      throw new Error('Empty story content');
    }

    // 7. 成功回應
    return res.status(200).json({
      success: true,
      story: story.trim(),
      time: new Date().toLocaleString("zh-TW", { 
        timeZone: "Asia/Taipei",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      wordCount: story.trim().length
    });

  } catch (error) {
    // 8. 錯誤處理
    console.error('Story generation error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Story generation failed',
      time: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    });
  }
}
