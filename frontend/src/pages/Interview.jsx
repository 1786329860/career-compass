import React, { useState, useRef, useEffect } from 'react'
import { startInterview, interviewChat, getInterviewReport } from '../api'
import Loading from '../components/Loading'
import RadarChart from '../components/RadarChart'

const INTERVIEW_TYPES = [
  { value: '技术面', label: '技术面试', icon: '💻' },
  { value: 'HR面', label: 'HR 面试', icon: '🤝' },
  { value: '行为面', label: '行为面试', icon: '🧠' },
]

const DIFFICULTY_OPTIONS = [
  { value: '基础', label: '简单' },
  { value: '中等', label: '中等' },
  { value: '困难', label: '困难' },
]

function Interview() {
  const [phase, setPhase] = useState('setup') // setup | interviewing | report
  const [config, setConfig] = useState({
    type: '技术面',
    targetPosition: '',
    difficulty: '基础',
  })
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleStart = async () => {
    if (!config.targetPosition.trim()) {
      setError('请填写目标岗位')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await startInterview({
        job_type: config.type,
        target_job: config.targetPosition,
        difficulty: config.difficulty,
      })
      setSessionId(data.session_id)
      setMessages([
        { role: 'ai', content: data.first_question || '面试开始，请准备好回答以下问题。' },
      ])
      setPhase('interviewing')
    } catch (err) {
      setError(err.message || '启动面试失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!userInput.trim()) return
    const userMsg = userInput.trim()
    setUserInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const data = await interviewChat({
        session_id: sessionId,
        user_answer: userMsg,
      })
      if (data.is_finished) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.ai_reply || '面试结束，感谢你的参与！' }])
        // 自动获取报告
        try {
          const reportData = await getInterviewReport({ session_id: sessionId })
          setReport(reportData)
          setPhase('report')
        } catch {
          setPhase('report')
        }
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: data.ai_reply || '' }])
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: `出错了：${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRestart = () => {
    setPhase('setup')
    setSessionId('')
    setMessages([])
    setUserInput('')
    setReport(null)
    setError('')
  }

  // 设置界面
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text)]">模拟面试间</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">AI 模拟真实面试场景，助你从容应对</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
          {/* 面试类型 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text)] mb-3">面试类型</label>
            <div className="grid grid-cols-3 gap-3">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setConfig((prev) => ({ ...prev, type: t.value }))}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    config.type === t.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-[var(--border)] hover:border-indigo-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">{t.icon}</span>
                  <span className="text-sm font-medium text-[var(--text)]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 目标岗位 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              目标岗位 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.targetPosition}
              onChange={(e) => setConfig((prev) => ({ ...prev, targetPosition: e.target.value }))}
              placeholder="如：前端开发工程师"
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 难度 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text)] mb-3">难度选择</label>
            <div className="flex gap-3">
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setConfig((prev) => ({ ...prev, difficulty: d.value }))}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    config.difficulty === d.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '正在准备面试...' : '开始面试'}
          </button>
        </div>
      </div>
    )
  }

  // 报告界面
  if (phase === 'report') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">面试评估报告</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">面试结束，以下是你的表现分析</p>
          </div>
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            重新面试
          </button>
        </div>

        {report ? (
          <div className="space-y-6">
            {/* 总分 */}
            {report.total_score !== undefined && (
              <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6 text-center">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">综合评分</h2>
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-indigo-600">
                  <span className="text-4xl font-bold text-indigo-600">{report.total_score}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-3">满分 10 分</p>
              </div>
            )}

            {/* 雷达图 */}
            {report.dimension_scores && (
              <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
                <RadarChart
                  data={{
                    indicators: report.dimension_scores.map(d => d.name),
                    values: report.dimension_scores.map(d => d.score),
                    title: '能力维度分析',
                    max: 10,
                  }}
                />
              </div>
            )}

            {/* 逐题点评 */}
            {report.details && report.details.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                  <span className="w-1 h-5 bg-indigo-600 rounded-full mr-2"></span>
                  逐题点评
                </h2>
                <div className="space-y-4">
                  {report.details.map((review, idx) => (
                    <div key={idx} className="border border-[var(--border)] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--text)]">
                          第 {idx + 1} 题
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          review.score >= 8 ? 'bg-green-50 text-green-600' :
                          review.score >= 5 ? 'bg-amber-50 text-amber-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {review.score}分
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">
                        <span className="font-medium text-[var(--text)]">问题：</span>{review.question}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">
                        <span className="font-medium text-[var(--text)]">你的回答：</span>{review.user_answer}
                      </p>
                      <p className="text-sm text-indigo-600">
                        <span className="font-medium">点评：</span>{review.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 改进建议 */}
            {report.top_improvements && report.top_improvements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
                  <span className="w-1 h-5 bg-amber-500 rounded-full mr-2"></span>
                  改进建议
                </h2>
                <div className="space-y-3">
                  {report.top_improvements.map((imp, idx) => (
                    <div key={idx} className="flex items-start p-3 bg-amber-50 rounded-lg">
                      <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-[var(--text)]">{imp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-12 text-center">
            <p className="text-[var(--text-secondary)]">报告生成中，请稍候...</p>
          </div>
        )}
      </div>
    )
  }

  // 面试对话界面
  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      {/* 顶部信息栏 */}
      <div className="bg-white rounded-t-xl border border-[var(--border)] border-b-0 px-6 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {INTERVIEW_TYPES.find((t) => t.value === config.type)?.label || '面试'} - {config.targetPosition}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            难度：{DIFFICULTY_OPTIONS.find((d) => d.value === config.difficulty)?.label}
          </p>
        </div>
        <button
          onClick={handleRestart}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          结束面试
        </button>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 bg-white border border-[var(--border)] border-t-0 border-b-0 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-[var(--text)] rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="bg-white rounded-b-xl border border-[var(--border)] border-t-0 p-4">
        <div className="flex gap-3">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的回答..."
            rows={1}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !userInput.trim()}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

export default Interview
