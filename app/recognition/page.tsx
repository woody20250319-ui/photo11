'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function RecognitionPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('请详细描述这张图片的内容');
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
      setRecognitionResult(null);
    };
    reader.readAsDataURL(file);
  };

  const recognizeImage = async () => {
    if (!originalFileRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image_file', originalFileRef.current);
      formData.append('prompt', prompt);

      const response = await fetch('/api/recognition', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = '图片识别失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `图片识别失败 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setRecognitionResult(data.result);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : '图片识别失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setOriginalImage(null);
    setRecognitionResult(null);
    setError(null);
    setPrompt('请详细描述这张图片的内容');
    originalFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyResult = () => {
    if (recognitionResult) {
      navigator.clipboard.writeText(recognitionResult);
      alert('识别结果已复制到剪贴板');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              ← 返回首页
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              🔍 图片识别
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
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-16 text-center cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 transition-colors"
              >
                <div className="text-6xl mb-4">📁</div>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  点击上传图片
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  支持 JPG、PNG、WEBP 等格式
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      识别提示词
                    </label>
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="例如：请详细描述这张图片的内容"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={recognizeImage}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isProcessing ? '识别中...' : '开始识别'}
                    </button>

                    {recognitionResult && (
                      <button
                        onClick={copyResult}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        复制结果
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

              {/* 图片和识别结果展示 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 图片预览 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      图片预览
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

                {/* 识别结果 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      识别结果
                    </h3>
                    {recognitionResult && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ 识别完成
                      </span>
                    )}
                  </div>
                  <div className="relative min-h-[300px] bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-auto max-h-[600px]">
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                        <span className="text-gray-500 dark:text-gray-400">
                          AI 正在分析图片...
                        </span>
                      </div>
                    ) : recognitionResult ? (
                      <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2 text-gray-900 dark:text-white" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1 text-gray-900 dark:text-white" {...props} />,
                            p: ({node, ...props}) => <p className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props} />,
                            li: ({node, ...props}) => <li className="ml-2" {...props} />,
                            code: ({node, inline, ...props}: any) =>
                              inline ?
                                <code className="bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded text-sm font-mono text-orange-600 dark:text-orange-400" {...props} /> :
                                <code className="block bg-gray-200 dark:bg-gray-600 p-3 rounded text-sm font-mono overflow-x-auto text-gray-800 dark:text-gray-200" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-gray-800 dark:text-gray-200" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-600 dark:text-gray-400 my-3" {...props} />,
                          }}
                        >
                          {recognitionResult}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[300px] text-gray-400 dark:text-gray-500">
                        点击"开始识别"按钮进行图片识别
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 提示：你可以修改识别提示词来获取不同角度的图片分析，例如"提取图片中的文字"、"识别图片中的物品"等。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
