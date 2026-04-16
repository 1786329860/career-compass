import React, { useState } from 'react'
import { optimizeResume } from '../api'
import Loading from '../components/Loading'

function ResumeOptimizer() {
  const [resumeText, setResumeText] = useState('')
  const [targetPosition, setTargetPosition] = useState('')
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async () => {
    if (!resumeText.trim() || !targetPosition.trim()) {
      setError('请填写简历内容和目标岗位')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const data = await optimizeResume({
        resume_text: resumeText,
        target_job: targetPosition,
        jd_text: jdText,
      })
      setResult(data)
    } catch (err) {
      setError(err.message || '优化失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (result?.optimized_resume) {
      navigator.clipboard.writeText(result.optimized_resume).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">简历精修坊</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">AI 逐条分析简历，给出评分和优化建议</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：输入区域 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              简历内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="请粘贴你的简历内容..."
              rows={12}
              className="w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              目标岗位 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={targetPosition}
              onChange={(e) => setTargetPosition(e.target.value)}
              placeholder="如：前端开发工程师"
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              目标岗位 JD（可选）
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="粘贴目标岗位的 JD，可获得更精准的优化建议..."
              rows={6}
              className="w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '优化中...' : '开始优化'}
          </button>
        </div>

        {/* 右侧：结果展示 */}
        <div className="space-y-4">
          {loading && <Loading text="正在分析你的简历..." />}

          {result && !loading && (
            <>
              {/* 评分仪表盘 */}
              {result.total_score !== undefined && (
                <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
                  <h2 className="text-lg font-semibold text-[var(--text)] mb-4">简历评分</h2>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-indigo-600">
                      <span className="text-3xl font-bold text-indigo-600">{result.total_score}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">总分（满分100）</p>
                  </div>
                  {result.scores && result.scores.length > 0 && (
                    <div className="space-y-3">
                      {result.scores.map((dim, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-[var(--text-secondary)]">{dim.dimension}</span>
                            <span className="font-medium text-[var(--text)]">{dim.score}/20</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full">
                            <div
                              className={`h-2 rounded-full ${
                                dim.score >= 16 ? 'bg-emerald-500' :
                                dim.score >= 12 ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(dim.score / 20) * 100}%` }}
                            />
                          </div>
                          {dim.comment && <p className="text-xs text-[var(--text-secondary)] mt-1">{dim.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 逐条修改建议 */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
                  <h2 className="text-lg font-semibold text-[var(--text)] mb-4">修改建议</h2>
                  <div className="space-y-4">
                    {result.suggestions.map((s, idx) => (
                      <div key={idx} className="border border-[var(--border)] rounded-lg overflow-hidden">
                        <div className="p-3 bg-red-50">
                          <p className="text-xs font-medium text-red-600 mb-1">原文</p>
                          <p className="text-sm text-[var(--text)]">{s.original}</p>
                        </div>
                        <div className="p-3 bg-green-50">
                          <p className="text-xs font-medium text-green-600 mb-1">优化后</p>
                          <p className="text-sm text-[var(--text)]">{s.improved}</p>
                        </div>
                        {s.reason && (
                          <div className="p-3">
                            <p className="text-xs text-[var(--text-secondary)]">{s.reason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 缺失关键词 */}
              {result.missing_keywords && result.missing_keywords.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
                  <h2 className="text-lg font-semibold text-[var(--text)] mb-4">缺失关键词</h2>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 一键复制优化后简历 */}
              {result.optimized_resume && (
                <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[var(--text)]">优化后简历</h2>
                    <button
                      onClick={handleCopy}
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                    >
                      {copied ? '已复制' : '一键复制'}
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-[var(--text)] whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {result.optimized_resume}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 空状态 */}
          {!result && !loading && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-[var(--text-secondary)]">填写简历内容并点击"开始优化"</p>
              <p className="text-sm text-gray-400 mt-2">优化结果将在这里展示</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeOptimizer
