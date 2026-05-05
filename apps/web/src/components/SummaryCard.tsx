'use client'

import { useEffect, useRef, useState } from 'react'

interface SummaryCardProps {
  title: string
  value: number
  format?: 'brl' | 'percent'
  icon: string
  color: 'blue' | 'green' | 'red' | 'yellow'
  delay?: number
  subtitle?: string
}

const colorMap = {
  blue: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-600/10',
    icon: 'bg-blue-600/20 text-blue-400',
    value: 'text-blue-400',
    glow: 'shadow-blue-500/10',
  },
  green: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-600/10',
    icon: 'bg-emerald-600/20 text-emerald-400',
    value: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
  red: {
    border: 'border-red-500/30',
    bg: 'bg-red-600/10',
    icon: 'bg-red-600/20 text-red-400',
    value: 'text-red-400',
    glow: 'shadow-red-500/10',
  },
  yellow: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-600/10',
    icon: 'bg-amber-600/20 text-amber-400',
    value: 'text-amber-400',
    glow: 'shadow-amber-500/10',
  },
}

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [current, setCurrent] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now()
      const animate = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCurrent(target * eased)
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate)
        }
      }
      frameRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, delay])

  return current
}

export default function SummaryCard({
  title,
  value,
  format = 'brl',
  icon,
  color,
  delay = 0,
  subtitle,
}: SummaryCardProps) {
  const animated = useCountUp(Math.abs(value), 1000, delay)
  const c = colorMap[color]

  const display =
    format === 'percent'
      ? `${animated.toFixed(1)}%`
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          value < 0 ? -animated : animated,
        )

  return (
    <div
      className={`glass-card ${c.border} ${c.bg} p-5 shadow-lg ${c.glow} fade-up hover:scale-[1.02] transition-transform duration-300`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 font-medium mb-1 truncate">{title}</p>
          <p className={`text-2xl font-bold tabular-nums ${c.value} leading-tight`}>
            {display}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center text-xl flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
