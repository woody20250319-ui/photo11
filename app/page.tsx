import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "图片压缩",
      description: "快速压缩图片，减小文件大小，保持画质",
      icon: "📦",
      href: "/compress",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "抠图去背景",
      description: "AI智能抠图，一键去除背景",
      icon: "✂️",
      href: "/remove-bg",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "图片识别",
      description: "智能识别图片内容，提取文字信息",
      icon: "🔍",
      href: "/recognition",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "AI生图",
      description: "AI绘画，文字生成精美图片",
      icon: "🎨",
      href: "/ai-generate",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            图片处理工具箱
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            一站式图片处理解决方案
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                  {feature.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>

              <div className={`absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}>
                <span className="text-white text-2xl">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
