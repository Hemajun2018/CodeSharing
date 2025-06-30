import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '请提供要提取邀请码的文本' }, { status: 400 })
    }

    if (!SILICONFLOW_API_KEY) {
      console.error('SILICONFLOW_API_KEY环境变量未配置')
      return NextResponse.json({ error: 'AI服务未配置，请联系管理员' }, { status: 500 })
    }

    // 调用硅基流动的DeepSeek模型
    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          {
            role: "user",
            content: `请从下面的文本中提取邀请码，每个邀请码之后换行，只回复邀请码，不要回复其他内容：<${text}>`
          }
        ],
        stream: false,
        max_tokens: 256,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('硅基流动API调用失败:', errorData)
      return NextResponse.json({ error: 'AI模型调用失败' }, { status: 500 })
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json({ error: 'AI模型响应格式异常' }, { status: 500 })
    }

    const extractedCodes = data.choices[0].message.content.trim()
    
    return NextResponse.json({ 
      extractedCodes,
      usage: data.usage 
    })

  } catch (error) {
    console.error('提取邀请码失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 