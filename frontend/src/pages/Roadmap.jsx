import React, { useState, useEffect } from 'react'
import { generateRoadmap } from '../api'
import Loading from '../components/Loading'

const STORAGE_KEY = 'roadmap_tasks'

function Roadmap() {
  const [formData, setFormData] = useState({
    targetPosition: '',
    currentStatus: '',
    availableTime: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTasks))
  }, [completedTasks])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleTask = (taskId) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const handleSubmit = async () => {
    if (!formData.targetPosition.trim() || !formData.currentStatus) {
      setError('请填写目标岗位和当前状态')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const data = await generateRoadmap({
        target_job: formData.targetPosition,
        current_status: formData.currentStatus,
        available_time: formData.availableTime,
      })
      setResult(data)
    } catch (err) {
      setError(err.message || '生成失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 计算进度
  const getProgress = () => {
    if (!result || !result.tasks) return 0
    const total = result.tasks.length
    const done = result.tasks.filter(t => completedTasks[t.title]).length
    return total > 0 ? Math.round((done / total) * 100) : 0
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">行动路线图</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">AI 生成个性化学习规划，按周拆解任务</p>
      </div>

      {/* 输入表单 */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            目标岗位 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.targetPosition}
            onChange={(e) => handleChange('targetPosition', e.target.value)}
            placeholder="如：全栈开发工程师"
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              当前状态 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.currentStatus}
              onChange={(e) => handleChange('currentStatus', e.target.value)}
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">请选择</option>
              <option value="零基础">零基础</option>
              <option value="有理论基础，无项目经验">有理论基础，无项目经验</option>
              <option value="有少量项目经验">有少量项目经验</option>
              <option value="有实习经验">有实习经验</option>
              <option value="准备跳槽">准备跳槽</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              可用时间
            </label>
            <select
              value={formData.availableTime}
              onChange={(e) => handleChange('availableTime', e.target.value)}
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">请选择</option>
              <option value="1个月">1个月</option>
              <option value="3个月">3个月</option>
              <option value="6个月">6个月</option>
              <option value="1年">1年</option>
            </select>
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
          {loading ? '生成中...' : '生成规划'}
        </button>
      </div>

      {/* 加载状态 */}
      {loading && <Loading text="正在为你定制学习路线..." />}

      {/* 结果展示 */}
      {result && !loading && (
        <div className="space-y-6">
          {/* 进度条 */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-[var(--text)]">学习进度</h2>
              <span className="text-sm font-medium text-indigo-600">{getProgress()}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full">
              <div
                className="h-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>

          {/* 时间线视图 */}
          {result.tasks && (() => {
            // 按 week 分组
            const grouped = {}
            result.tasks.forEach(task => {
              if (!grouped[task.week]) grouped[task.week] = []
              grouped[task.week].push(task)
            })
            return Object.entries(grouped).sort(([a], [b]) => a - b).map(([week, tasks]) => (
              <div key={week} className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    tasks.some(t => t.milestone) ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}>
                    {week}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-base font-semibold text-[var(--text)]">第 {week} 周</h3>
                    {tasks.some(t => t.milestone) && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">里程碑</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <label key={task.title} className="flex items-start p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={!!completedTasks[task.title]}
                        onChange={() => toggleTask(task.title)}
                        className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <p className={`text-sm ${completedTasks[task.title] ? 'line-through text-gray-400' : 'text-[var(--text)]'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{task.description}</p>
                        {task.milestone && (
                          <span className="text-xs mt-1 inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">里程碑</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))
          })()}

          {/* 关键里程碑 */}
          {result.milestones && result.milestones.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-amber-500 rounded-full mr-2"></span>
                关键里程碑
              </h2>
              <div className="space-y-2">
                {result.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center p-3 bg-amber-50 rounded-lg">
                    <span className="text-amber-500 mr-3">&#127942;</span>
                    <p className="text-sm text-[var(--text)]">{m}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 温馨提示 */}
          {result.tips && result.tips.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                <span className="w-1 h-5 bg-indigo-500 rounded-full mr-2"></span>
                温馨提示
              </h2>
              <div className="space-y-2">
                {result.tips.map((tip, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg text-sm text-[var(--text)]">
                    &#128161; {tip}
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

export default Roadmap
