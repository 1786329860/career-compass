import React from 'react'

function Loading({ text = '加载中...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
      </div>
      <p className="mt-4 text-sm text-gray-500">{text}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  )
}

export function SkeletonTable({ rows = 3 }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  )
}

export default Loading
