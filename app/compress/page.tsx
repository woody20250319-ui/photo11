'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function CompressPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setCompressedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = async () => {
    if (!originalImage) return;

    setIsCompressing(true);

    try {
      const img = new Image();
      img.src = originalImage;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      setCompressedImage(compressedDataUrl);

      // 计算压缩后的大小
      const base64Length = compressedDataUrl.split(',')[1].length;
      const sizeInBytes = (base64Length * 3) / 4;
      setCompressedSize(sizeInBytes);
    } catch (error) {
      console.error('压缩失败:', error);
      alert('压缩失败，请重试');
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadImage = () => {
    if (!compressedImage) return;

    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = `compressed_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const resetAll = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setQuality(80);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← 返回首页
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              📦 图片压缩
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
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
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

          {/* 图片处理区域 */}
          {originalImage && (
            <div className="space-y-6">
              {/* 控制面板 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      压缩质量: {quality}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>低质量</span>
                      <span>高质量</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={compressImage}
                      disabled={isCompressing}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isCompressing ? '压缩中...' : '开始压缩'}
                    </button>

                    {compressedImage && (
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(originalSize)}
                    </span>
                  </div>
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={originalImage}
                      alt="原图"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* 压缩后 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      压缩后
                    </h3>
                    {compressedImage && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(compressedSize)}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          减少 {Math.round((1 - compressedSize / originalSize) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {compressedImage ? (
                      <img
                        src={compressedImage}
                        alt="压缩后"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        等待压缩...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
