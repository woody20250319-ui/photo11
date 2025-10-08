import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image_file') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: '请上传图片文件' },
        { status: 400 }
      );
    }

    // 创建新的FormData发送到remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', imageFile);
    removeBgFormData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': 'PVySMzcrR67gUknWqUNJMbJt',
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg API error:', errorText);
      return NextResponse.json(
        { error: '去除背景失败，请稍后重试' },
        { status: response.status }
      );
    }

    // 获取处理后的图片
    const imageBuffer = await response.arrayBuffer();

    // 返回图片数据
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error removing background:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
