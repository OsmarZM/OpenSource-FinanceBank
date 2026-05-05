'use client'

import { useEffect, useRef, useState } from 'react'
import type { CategoryBreakdown } from '@/lib/types'
import { formatBRL, getCategoryLabel, getCategoryIcon } from '@/lib/format'

interface Props {
  data: CategoryBreakdown[]
}

const BAR_COLORS = [
  '#2563EB',
  '#3B82F6',
  '#60A5FA',
  '#93C5FD',
  '#1D4ED8',
  '#1E40AF',
  '#1E3A8A',
  '#BFDBFE',
]

export default function CategoryChart({ data }: Props) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(true), 100)
        }
      },
      { threshold: 0.2 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const top = data.slice(0, 8)

  return (
    <div ref={ref} className="glass-card p-6">
      <h2 className="text-lg font-semibold text-white mb-1">Gastos por Categoria</h2>
      <p className="text-sm text-gray-500 mb-5">Top {top.length} categorias de despesas</p>

      <div className="space-y-4">
        {top.map((cat, i) => (
          <div key={cat.category} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{getCategoryIcon(cat.category)}</span>
                <span className="text-sm text-gray-300 font-medium">
                  {getCategoryLabel(cat.category)}
                </span>
                <span className="text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-full">
                  {cat.count}×
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-gray-400">{cat.percentage.toFixed(1)}%</span>
                <span className="text-sm font-semibold text-white tabular-nums">
                  {formatBRL(cat.total)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: animated ? `${cat.percentage}%` : '0%',
                  background: BAR_COLORS[i % BAR_COLORS.length],
                  transitionDelay: `${i * 80}ms`,
                  boxShadow: animated ? `0 0 8px ${BAR_COLORS[i % BAR_COLORS.length]}60` : 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
