'use client'

import type { Insight } from '@/lib/types'

interface Props {
  insights: Insight[]
}

const levelConfig = {
  success: {
    icon: '✅',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    badge: 'bg-emerald-500/20 text-emerald-400',
    label: 'Positivo',
    dot: 'bg-emerald-400',
  },
  info: {
    icon: 'ℹ️',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    badge: 'bg-blue-500/20 text-blue-400',
    label: 'Info',
    dot: 'bg-blue-400',
  },
  warning: {
    icon: '⚠️',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    badge: 'bg-amber-500/20 text-amber-400',
    label: 'Atenção',
    dot: 'bg-amber-400',
  },
  danger: {
    icon: '🚨',
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    badge: 'bg-red-500/20 text-red-400',
    label: 'Alerta',
    dot: 'bg-red-400',
  },
}

export default function InsightsList({ insights }: Props) {
  const sorted = [...insights].sort((a, b) => {
    const order = { danger: 0, warning: 1, success: 2, info: 3 }
    return order[a.level] - order[b.level]
  })

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-white mb-1">Insights</h2>
          <p className="text-sm text-gray-500">Análise automática do seu perfil financeiro</p>
        </div>
        <span className="text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-medium flex-shrink-0">
          {insights.length} análises
        </span>
      </div>

      <div className="space-y-3 stagger-children">
        {sorted.map((insight, i) => {
          const cfg = levelConfig[insight.level]
          return (
            <div
              key={insight.id}
              className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 fade-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg leading-none flex-shrink-0 mt-0.5">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white leading-snug">{insight.message}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {insight.detail && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{insight.detail}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
