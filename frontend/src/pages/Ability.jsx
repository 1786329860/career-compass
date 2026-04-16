import React, { useState } from 'react'
import { analyzeAbility } from '../api'
import Loading from '../components/Loading'
import RadarChart from '../components/RadarChart'

function Ability() {
  const [formData, setFormData] = useState({
    major: '',
    grade: '',
    skills: '',
    internship: '',
    projects: '',
    targetPosition: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.major.trim() || !formData.targetPosition.trim()) {
      setError('请填写专业和目标岗位')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const data = await analyzeAbility({
        major: formData.major,
        grade: formData.grade,
        skills_known: formData.skills ? formData.skills.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [],
        internship: formData.internship,
        projects: formData.projects,
        target_job: formData.targetPosition,
      })
      setResult(data)
    } catch (err) {
      setError(err.message || '分析失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">能力雷达图</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">输入你的背景信息，生成六维能力分析</p>
      </div>

      {/* 输入表单 */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              专业 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) => handleChange('major', e.target.value)}
              placeholder="如：计算机科学与技术"
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              年级
            </label>
            <select
              value={formData.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">请选择</option>
              <option value="大一">大一</option>
              <option value="大二">大二</option>
              <option value="大三">大三</option>
              <option value="大四">大四</option>
              <option value="研一">研一</option>
              <option value="研二">研二</option>
              <option value="研三">研三</option>
              <option value="已毕业">已毕业</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            已掌握技能
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => handleChange('skills', e.target.value)}
            placeholder="用逗号分隔，如：Python, JavaScript, SQL, 机器学习"
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            实习经历
          </label>
          <textarea
            value={formData.internship}
            onChange={(e) => handleChange('internship', e.target.value)}
            placeholder="描述你的实习经历..."
            rows={3}
            className="w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            项目经历
          </label>
          <textarea
            value={formData.projects}
            onChange={(e) => handleChange('projects', e.target.value)}
            placeholder="描述你的项目经历..."
            rows={3}
            className="w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            目标岗位 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.targetPosition}
            onChange={(e) => handleChange('targetPosition', e.target.value)}
            placeholder="如：前端开发工程师"
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
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
          {loading ? '分析中...' : '开始诊断'}
        </button>
      </div>

      {/* 加载状态 */}
      {loading && <Loading text="正在分析你的能力图谱..." />}

      {/* 结果展示 */}
      {result && !loading && (
        <div className="space-y-6">
          {/* 雷达图 */}
          {result.radar && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <RadarChart
                data={{
                  indicators: result.radar.map(r => r.name),
                  values: result.radar.map(r => r.score),
                  title: '能力雷达图',
                }}
              />
            </div>
          )}

          {/* 能力差距分析 */}
          {result.gaps && result.gaps.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-amber-500 rounded-full mr-2"></span>
                能力差距分析
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-4 font-medium text-[var(--text)]">技能</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text)]">状态</th>
                      <th className="text-left py-3 px-4 font-medium text-[var(--text)]">建议</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.gaps.map((item, idx) => (
                      <tr key={idx} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-3 px-4 text-[var(--text)]">{item.skill}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.status === '已具备' ? 'bg-green-50 text-green-600' :
                            item.status === '部分具备' ? 'bg-amber-50 text-amber-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{item.suggestion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 优先补强建议 */}
          {result.priority_actions && result.priority_actions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-rose-500 rounded-full mr-2"></span>
                优先补强建议
              </h2>
              <div className="space-y-3">
                {result.priority_actions.map((action, idx) => (
                  <div key={idx} className="flex items-start p-3 bg-rose-50 rounded-lg">
                    <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-[var(--text)]">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 推荐学习资源 */}
          {result.learning_resources && result.learning_resources.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-indigo-500 rounded-full mr-2"></span>
                推荐学习资源
              </h2>
              <div className="space-y-2">
                {result.learning_resources.map((r, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm text-[var(--text)]">
                    {idx + 1}. {r}
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

export default Ability
