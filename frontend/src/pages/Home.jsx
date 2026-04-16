import React from 'react'
import { useNavigate } from 'react-router-dom'

const modules = [
  {
    path: '/jd-parser',
    icon: '🔍',
    title: '岗位真相机',
    description: '粘贴职位描述，AI 深度解析真实工作内容、能力要求和薪资区间，帮你拨开 JD 的迷雾。',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    path: '/ability',
    icon: '📊',
    title: '能力雷达图',
    description: '输入你的背景信息，生成六维能力雷达图，精准定位能力差距，给出补强建议。',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    path: '/roadmap',
    icon: '🗺️',
    title: '行动路线图',
    description: '根据目标岗位和当前状态，AI 生成个性化学习规划，按周拆解任务，追踪进度。',
    color: 'from-amber-500 to-orange-600',
  },
  {
    path: '/resume',
    icon: '📝',
    title: '简历精修坊',
    description: 'AI 逐条分析简历，给出评分和优化建议，让你的简历在众多候选人中脱颖而出。',
    color: 'from-rose-500 to-pink-600',
  },
  {
    path: '/interview',
    icon: '🎤',
    title: '模拟面试间',
    description: 'AI 模拟真实面试场景，技术面/HR面/行为面全覆盖，面试后生成详细评估报告。',
    color: 'from-violet-500 to-purple-600',
  },
]

function Home() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto">
      {/* 欢迎区域 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
          欢迎使用<span className="text-indigo-600"> 职途罗盘</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          AI 驱动的职业发展助手，从岗位解析到模拟面试，全方位助力你的求职之路
        </p>
      </div>

      {/* 模块卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div
            key={mod.path}
            onClick={() => navigate(mod.path)}
            className="group bg-white rounded-xl shadow-sm border border-[var(--border)] p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4`}>
              <span className="text-2xl">{mod.icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2 group-hover:text-indigo-600 transition-colors">
              {mod.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {mod.description}
            </p>
          </div>
        ))}
      </div>

      {/* 底部说明 */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-400">
          Hello AI 科技致善 | 所有数据仅在本地处理，保护你的隐私
        </p>
      </div>
    </div>
  )
}

export default Home
