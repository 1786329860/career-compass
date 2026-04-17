import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5分钟，报告生成需要较长时间
})

// 请求拦截器
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = '请求失败'
    if (error.response?.data?.detail) {
      message = typeof error.response.data.detail === 'string'
        ? error.response.data.detail
        : JSON.stringify(error.response.data.detail)
    } else if (error.message) {
      message = error.message
    }
    return Promise.reject(new Error(message))
  }
)

// JD解析
export const parseJD = (data) => api.post('/jd/parse', data)

// 能力诊断
export const analyzeAbility = (data) => api.post('/ability/analyze', data)

// 行动规划
export const generateRoadmap = (data) => api.post('/roadmap/generate', data)

// 简历优化
export const optimizeResume = (data) => api.post('/resume/optimize', data)

// 面试
export const startInterview = (data) => api.post('/interview/start', data)
export const interviewChat = (data) => api.post('/interview/chat', data)
export const getInterviewReport = (data) => api.post('/interview/report', data)
