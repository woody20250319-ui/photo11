import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size = '2K' } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: '请输入提示词' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      console.error('ARK_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'API配置错误，请联系管理员。请确保已重启开发服务器。' },
        { status: 500 }
      );
    }

    console.log('Generating image with prompt:', prompt);

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'ep-20251008215753-dnhpt',
        prompt: prompt,
        sequential_image_generation: 'disabled',
        response_format: 'url',
        size: size,
        stream: false,
        watermark: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('火山引擎生图 API error:', errorData);

      let errorMessage = '图片生成失败，请稍后重试';
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Image generation response:', data);

    // 提取生成的图片URL
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      console.error('No image URL in response:', data);
      return NextResponse.json(
        { error: '未能获取生成的图片' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      revisedPrompt: data.data?.[0]?.revised_prompt,
      usage: data.usage
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
