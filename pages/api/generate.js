// pages/api/generate.js
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    console.error('❌ Missing GROQ_API_KEY');
    return res.status(500).json({ 
      error: 'Server configuration error',
      success: false 
    });
  }

  console.log('🚀 Starting story generation...');

  try {
    // 3. 使用 Groq SDK 生成故事
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.95,
      max_tokens: 1200,
      messages: [{
        role: "user",
        content: "用繁體中文寫一篇600~900字的原創短篇故事,風格隨機(懸疑、治癒、奇幻、怪談皆可),要有完整起承轉合,直接輸出故事正文,不要加標題、引號、任何說明。"
      }]
    });

    console.log('✅ Received response from Groq');

    // 4. 驗證回應
    const story = completion.choices?.[0]?.message?.content;

    if (!story || story.trim().length === 0) {
      throw new Error('Empty story content');
    }

    const trimmedStory = story.trim();
    console.log(`✅ Story generated (${trimmedStory.length} characters)`);

    // 5. 成功回應
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
      wordCount: trimmedStory.length
    });

  } catch (error) {
    // 6. 錯誤處理
    console.error('❌ Error:', error.message);
    
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to generate story',
      time: new Date().toLocaleString("zh-TW", { 
        timeZone: "Asia/Taipei" 
      })
    });
  }
}
