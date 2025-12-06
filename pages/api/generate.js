// pages/api/generate.js

export default async function handler(req, res) {
  // 1. 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      success: false 
    });
  }

  // 2. 檢查環境變數
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ Missing GROQ_API_KEY in environment variables');
    return res.status(500).json({ 
      error: 'Server configuration error - Missing API key',
      success: false 
    });
  }

  console.log('🚀 Starting story generation...');

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

    console.log(`📡 Groq API responded with status: ${response.status}`);

    // 4. 檢查 HTTP 回應狀態
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('❌ Groq API error:', errorData);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response');
      }
      
      throw new Error(errorMessage);
    }

    // 5. 解析回應
    const data = await response.json();
    console.log('✅ Received data from Groq API');

    // 6. 驗證回應資料結構
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('❌ Invalid API response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid API response: no choices returned');
    }

    const story = data.choices[0]?.message?.content;

    // 7. 驗證故事內容
    if (!story || typeof story !== 'string' || story.trim().length === 0) {
      console.error('❌ Empty or invalid story content');
      throw new Error('Empty story content received from API');
    }

    const trimmedStory = story.trim();
    console.log(`✅ Story generated successfully (${trimmedStory.length} characters)`);

    // 8. 成功回應
    return res.status(200).json({
      success: true,
      story: trimmedStory,
      time: new Date().toLocaleString("zh-TW", { 
        timeZone: "Asia/Taipei",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      wordCount: trimmedStory.length,
      model: "llama-3.3-70b-versatile"
    });

  } catch (error) {
    // 9. 完整錯誤處理
    console.error('❌ Story generation error:', error.message);
    console.error('Stack trace:', error.stack);

    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to generate story',
      time: new Date().toLocaleString("zh-TW", { 
        timeZone: "Asia/Taipei" 
      })
    });
  }
}
