import React, { useState } from 'react'
import { parseJD } from '../api'
import Loading, { SkeletonCard, SkeletonTable } from '../components/Loading'

function JDParser() {
  const [jdText, setJdText] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!jdText.trim()) {
      setError('请粘贴职位描述内容')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const data = await parseJD({
        jd_text: jdText,
        job_title: jobTitle,
        company: company,
      })
      setResult(data)
    } catch (err) {
      setError(err.message || '解析失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">岗位真相机</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">粘贴职位描述，AI 深度解析岗位真相</p>
      </div>

      {/* 输入区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            职位描述 (JD) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="请粘贴完整的职位描述..."
            rows={8}
            className="w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              职位名称
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="如：前端开发工程师"
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              公司名称
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="如：字节跳动"
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '解析中...' : '开始解析'}
        </button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonTable rows={4} />
          <SkeletonCard />
        </div>
      )}

      {/* 结果展示 */}
      {result && !loading && (
        <div className="space-y-6">
          {/* 真实工作内容 */}
          {result.daily_tasks && result.daily_tasks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-indigo-600 rounded-full mr-2"></span>
                真实工作内容
              </h2>
              <ul className="space-y-2">
                {result.daily_tasks.map((task, idx) => (
                  <li key={idx} className="flex items-start text-sm text-[var(--text-secondary)]">
                    <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 能力要求 */}
          {result.skills && result.skills.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-emerald-500 rounded-full mr-2"></span>
                能力要求
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-4 font-medium text-[var(--text)]">技能名称</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text)]">等级</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text)]">重要度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.skills.map((skill, idx) => (
                      <tr key={idx} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-3 px-4 text-[var(--text)]">{skill.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            skill.level === '高级' ? 'bg-red-50 text-red-600' :
                            skill.level === '中级' ? 'bg-amber-50 text-amber-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {skill.level}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            skill.importance === '必备' ? 'bg-red-50 text-red-600' :
                            skill.importance === '加分' ? 'bg-blue-50 text-blue-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {skill.importance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 薪资区间 */}
          {result.salary_range && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-amber-500 rounded-full mr-2"></span>
                薪资区间
              </h2>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-indigo-600">{result.salary_range}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">参考市场平均水平</p>
              </div>
            </div>
          )}

          {/* 职业发展路径 */}
          {result.career_path && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-violet-500 rounded-full mr-2"></span>
                职业发展路径
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {result.career_path.split('→').map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                      {step.trim()}
                    </div>
                    {idx < result.career_path.split('→').length - 1 && (
                      <span className="text-gray-300">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* 适配度自评问题 */}
          {result.fit_questions && result.fit_questions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-rose-500 rounded-full mr-2"></span>
                适配度自评
              </h2>
              <div className="space-y-3">
                {result.fit_questions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm text-[var(--text-secondary)]">
                    {idx + 1}. {q}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JDParser
