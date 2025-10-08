'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AIGeneratePage() {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string>('2K');

  const examplePrompts = [
    '一只可爱的橘猫在阳光下睡觉，水彩画风格',
    '未来科技城市，赛博朋克风格，霓虹灯光',
    '宁静的湖面倒映着雪山，油画风格',
    '星空下的樱花树，唯美梦幻',
    '中国古风建筑，水墨画风格'
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setRevisedPrompt(null);

    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          size: imageSize
        }),
      });

      if (!response.ok) {
        let errorMessage = '图片生成失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `图片生成失败 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setRevisedPrompt(data.revisedPrompt);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : '图片生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请右键图片另存为');
    }
  };

  const useExamplePrompt = (example: string) => {
    setPrompt(example);
  };

  const resetAll = () => {
    setPrompt('');
    setGeneratedImage(null);
    setRevisedPrompt(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              ← 返回首页
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              🎨 AI生图
            </h1>
          </div>
        </div>

        {/* 主要内容区 */}
        <div className="max-w-6xl mx-auto">
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 输入区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  提示词 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述你想要生成的图片，例如：一只可爱的橘猫在阳光下睡觉，水彩画风格"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                />
              </div>

              {/* 示例提示词 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  示例提示词（点击使用）
                </label>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => useExamplePrompt(example)}
                      className="px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* 图片尺寸选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  图片尺寸
                </label>
                <div className="flex gap-3">
                  {['1K', '2K', '4K'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        imageSize === size
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={generateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isGenerating ? '生成中...' : '生成图片'}
                </button>

                {generatedImage && (
                  <>
                    <button
                      onClick={downloadImage}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      下载图片
                    </button>
                    <button
                      onClick={resetAll}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      重新生成
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 生成结果区域 */}
          {(isGenerating || generatedImage) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  生成结果
                </h3>
                {generatedImage && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ 生成完成
                  </span>
                )}
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">AI 正在创作中...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    这可能需要几秒到几十秒，请耐心等待
                  </p>
                </div>
              ) : generatedImage ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={generatedImage}
                      alt="AI生成的图片"
                      className="w-full h-auto object-contain max-h-[600px] mx-auto"
                    />
                  </div>

                  {revisedPrompt && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                        优化后的提示词：
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {revisedPrompt}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* 提示信息 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 提示：
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1 list-disc list-inside">
              <li>提示词越详细，生成的图片效果越好</li>
              <li>可以指定画风、色调、光线、构图等细节</li>
              <li>生成时间根据图片尺寸和复杂度而定，请耐心等待</li>
              <li>生成的图片会包含水印</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
