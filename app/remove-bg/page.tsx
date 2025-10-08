'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function RemoveBgPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalFileRef = useRef<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setError(null);
    originalFileRef.current = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const removeBackground = async () => {
    if (!originalFileRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image_file', originalFileRef.current);

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '去除背景失败');
      }

      // 将响应转换为Blob然后创建URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : '去除背景失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `no-bg-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
    }
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    originalFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              ← 返回首页
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              ✂️ 抠图去背景
            </h1>
          </div>
        </div>

        {/* 主要内容区 */}
        <div className="max-w-6xl mx-auto">
          {/* 上传区域 */}
          {!originalImage && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-16 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
              >
                <div className="text-6xl mb-4">📁</div>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  点击上传图片
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  支持 JPG、PNG、GIF 等格式
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 图片处理区域 */}
          {originalImage && (
            <div className="space-y-6">
              {/* 控制面板 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-gray-600 dark:text-gray-300">
                      使用 AI 智能识别主体，自动去除背景
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={removeBackground}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isProcessing ? '处理中...' : '去除背景'}
                    </button>

                    {processedImage && (
                      <button
                        onClick={downloadImage}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        下载图片
                      </button>
                    )}

                    <button
                      onClick={resetAll}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      重新上传
                    </button>
                  </div>
                </div>
              </div>

              {/* 图片预览对比 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 原图 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      原图
                    </h3>
                  </div>
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={originalImage}
                      alt="原图"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* 去背景后 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      去背景后
                    </h3>
                    {processedImage && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ 处理完成
                      </span>
                    )}
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0),linear-gradient(45deg,#f0f0f0_25%,transparent_25%,transparent_75%,#f0f0f0_75%,#f0f0f0)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] dark:bg-[linear-gradient(45deg,#444_25%,transparent_25%,transparent_75%,#444_75%,#444),linear-gradient(45deg,#444_25%,transparent_25%,transparent_75%,#444_75%,#444)]">
                    {processedImage ? (
                      <img
                        src={processedImage}
                        alt="去背景后"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <span className="text-gray-400 dark:text-gray-500">
                          等待处理...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 提示：处理后的图片为 PNG 格式，支持透明背景。建议用于人物、产品等主体明确的图片。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
