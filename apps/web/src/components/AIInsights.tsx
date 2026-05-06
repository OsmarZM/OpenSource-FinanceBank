'use client'

import type { EngineResult, Insight } from '@/lib/types'

interface UsageStats {
  input_tokens: number
  output_tokens: number
  estimated_cost_usd: number
}

interface Props {
  engineResult: EngineResult
  insights: Insight[] | null
  loading: boolean
  error: string | null
  usage?: UsageStats | null
  onGenerate: () => void
}

const levelConfig = {
  success: { icon: '✅', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/20 text-emerald-400', label: 'Positivo' },
  info:    { icon: 'ℹ️', border: 'border-blue-500/30',    bg: 'bg-blue-500/5',    badge: 'bg-blue-500/20 text-blue-400',    label: 'Info'     },
  warning: { icon: '⚠️', border: 'border-amber-500/30',  bg: 'bg-amber-500/5',   badge: 'bg-amber-500/20 text-amber-400',  label: 'Atenção'  },
  danger:  { icon: '🚨', border: 'border-red-500/30',    bg: 'bg-red-500/5',     badge: 'bg-red-500/20 text-red-400',      label: 'Alerta'   },
}

function InsightSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/[0.03] rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AIInsights({ insights, loading, error, usage, onGenerate }: Props) {
  const sorted = insights
    ? [...insights].sort((a, b) => {
        const order = { danger: 0, warning: 1, success: 2, info: 3 }
        return order[a.level] - order[b.level]
      })
    : null

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-white">Insights com IA</h2>
            <span className="text-xs bg-purple-500/20 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full font-medium">
              Claude Haiku
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Análise gerada por Claude Haiku 4.5 via AWS Bedrock
          </p>
          {/* Cost badge — shown after a successful generation */}
          {usage && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-gray-600 font-mono">
                {usage.input_tokens.toLocaleString()} in · {usage.output_tokens.toLocaleString()} out tokens
              </span>
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                ~${usage.estimated_cost_usd < 0.001
                  ? usage.estimated_cost_usd.toFixed(6)
                  : usage.estimated_cost_usd.toFixed(4)} USD
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-600/30 hover:border-purple-400/40 hover:text-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <span>✨</span>
              {insights ? 'Regenerar' : 'Gerar insights com IA'}
            </>
          )}
        </button>
      </div>

      {/* States */}
      {loading && <InsightSkeleton />}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm">
          <p className="text-red-400 font-medium">⚠️ Erro ao gerar insights</p>
          <p className="text-gray-500 mt-1 text-xs">{error}</p>
          <p className="text-gray-600 mt-2 text-xs">
            Verifique se o sidecar Python está rodando e as credenciais AWS estão configuradas.
          </p>
        </div>
      )}

      {!loading && !error && !insights && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-gray-400 font-medium text-sm">Análise por IA não executada</p>
          <p className="text-gray-600 text-xs mt-1">
            Clique em &quot;Gerar insights com IA&quot; para obter análise do Claude Haiku 4.5
          </p>
        </div>
      )}

      {!loading && !error && sorted && sorted.length > 0 && (
        <div className="space-y-3 stagger-children">
          {sorted.map((insight, i) => {
            const cfg = levelConfig[insight.level] ?? levelConfig.info
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
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">
                          AI
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
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
      )}

      {!loading && !error && sorted && sorted.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Nenhum insight gerado. Tente novamente.
        </p>
      )}
    </div>
  )
}
