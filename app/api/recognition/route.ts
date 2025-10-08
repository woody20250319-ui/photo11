import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image_file') as File;
    const prompt = formData.get('prompt') as string || '请详细描述这张图片的内容';

    if (!imageFile) {
      return NextResponse.json(
        { error: '请上传图片文件' },
        { status: 400 }
      );
    }

    // 将图片转换为 base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // 确定图片格式
    let imageFormat = 'jpeg';
    if (imageFile.type === 'image/png') {
      imageFormat = 'png';
    } else if (imageFile.type === 'image/webp') {
      imageFormat = 'webp';
    } else if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
      imageFormat = 'jpeg';
    }

    // 构建火山引擎 API 请求
    const apiKey = process.env.ARK_API_KEY;
    console.log('Environment variables check:', {
      hasApiKey: !!apiKey,
      nodeEnv: process.env.NODE_ENV
    });

    if (!apiKey) {
      console.error('ARK_API_KEY not found in environment variables');
      console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('ARK')));
      return NextResponse.json(
        { error: 'API配置错误，请联系管理员。请确保已重启开发服务器。' },
        { status: 500 }
      );
    }

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'ep-20251008195447-nkrrc',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${imageFormat};base64,${base64Image}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('火山引擎 API error:', errorData);
      return NextResponse.json(
        { error: '图片识别失败，请稍后重试' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 提取识别结果
    const result = data.choices?.[0]?.message?.content || '无法识别图片内容';

    return NextResponse.json({
      success: true,
      result: result,
      usage: data.usage
    });

  } catch (error) {
    console.error('Error recognizing image:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
