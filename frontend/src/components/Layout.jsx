import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/jd-parser', label: '岗位真相机', icon: '🔍' },
  { path: '/ability', label: '能力雷达图', icon: '📊' },
  { path: '/roadmap', label: '行动路线图', icon: '🗺️' },
  { path: '/resume', label: '简历精修坊', icon: '📝' },
  { path: '/interview', label: '模拟面试间', icon: '🎤' },
]

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-white border-r border-[var(--border)] flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[var(--border)]">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">职</span>
          </div>
          <span className="text-lg font-bold text-[var(--text)]">职途罗盘</span>
        </div>

        {/* 导航链接 */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 底部标签 */}
        <div className="p-4 border-t border-[var(--border)]">
          <p className="text-xs text-gray-400 text-center">Hello AI 科技致善</p>
        </div>
      </aside>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏（移动端） */}
        <header className="h-16 bg-white border-b border-[var(--border)] flex items-center px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 text-lg font-bold text-[var(--text)]">职途罗盘</span>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
