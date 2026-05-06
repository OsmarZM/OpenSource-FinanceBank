'use client'

import { useEffect, useState } from 'react'
import { formatBRL } from '@/lib/format'

interface QuoteData {
  last_price?: number
  close?: number
  prev_close?: number
  open?: number
  change_percent?: number
  [key: string]: unknown
}

interface QuoteResult {
  symbol: string
  quote: QuoteData
  error?: string
}

interface FxBar {
  date: string
  close: number
}

interface FxResult {
  pair: string
  data: FxBar[]
  error?: string
}

interface MarketSnapshot {
  ibov: QuoteResult | null
  sp500: QuoteResult | null
  usdbrl: FxResult | null
}

function getPrice(q: QuoteData | undefined): number {
  if (!q) return 0
  return Number(q.last_price ?? q.close ?? q.prev_close ?? q.open ?? 0)
}

function formatChange(pct: number | undefined): string {
  if (pct == null) return ''
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

function MiniSparkline({ data }: { data: FxBar[] }) {
  if (!data || data.length < 2) return null
  const values = data.map((d) => d.close)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 80
  const h = 28
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const up = values[values.length - 1] >= values[0]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
      <polyline points={points} fill="none" stroke={up ? '#34d399' : '#f87171'} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function QuoteCard({
  label,
  symbol,
  value,
  changePct,
  prefix = '',
}: {
  label: string
  symbol: string
  value: number
  changePct?: number
  prefix?: string
}) {
  const up = (changePct ?? 0) >= 0
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-sm font-semibold text-white tabular-nums">
        {prefix}{value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
      {changePct != null && (
        <span className={`text-xs font-medium tabular-nums ${up ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatChange(changePct)}
        </span>
      )}
      <span className="text-xs text-gray-600">{symbol}</span>
    </div>
  )
}

export default function MarketWidget() {
  const [data, setData] = useState<MarketSnapshot>({ ibov: null, sp500: null, usdbrl: null })
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [ibovRes, sp500Res, usdbrlRes] = await Promise.allSettled([
          fetch('/api/market/quote/%5EBVSP').then((r) => r.json() as Promise<QuoteResult>),
          fetch('/api/market/quote/%5EGSPC').then((r) => r.json() as Promise<QuoteResult>),
          fetch('/api/market/fx/USDBRL').then((r) => r.json() as Promise<FxResult>),
        ])

        const ibov = ibovRes.status === 'fulfilled' && !ibovRes.value.error && ibovRes.value.quote ? ibovRes.value : null
        const sp500 = sp500Res.status === 'fulfilled' && !sp500Res.value.error && sp500Res.value.quote ? sp500Res.value : null
        const usdbrl = usdbrlRes.status === 'fulfilled' && !usdbrlRes.value.error && Array.isArray(usdbrlRes.value.data) ? usdbrlRes.value : null

        if (!ibov && !sp500 && !usdbrl) {
          setOffline(true)
        } else {
          setData({ ibov, sp500, usdbrl })
        }
      } catch {
        setOffline(true)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-4" />
        <div className="flex gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-white/5 rounded w-16" />
              <div className="h-4 bg-white/5 rounded w-24" />
              <div className="h-3 bg-white/5 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (offline) {
    return (
      <div className="glass-card p-5 border-white/5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white">Dados de Mercado</h3>
          <span className="text-xs bg-gray-500/10 border border-gray-500/20 text-gray-500 px-2 py-0.5 rounded-full">
            Offline
          </span>
        </div>
        <p className="text-xs text-gray-600">
          Inicie o sidecar OpenBB para ver cotações em tempo real.
        </p>
        <code className="block mt-2 text-xs text-gray-700 bg-white/[0.03] rounded px-2 py-1 font-mono">
          docker compose --profile openbb up
        </code>
      </div>
    )
  }

  const ibovPrice = data.ibov ? getPrice(data.ibov.quote) : 0
  const sp500Price = data.sp500 ? getPrice(data.sp500.quote) : 0
  const usdBrl = data.usdbrl?.data?.at(-1)?.close ?? 0

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Dados de Mercado</h3>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          OpenBB live
        </div>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        {data.ibov && ibovPrice > 0 && (
          <QuoteCard
            label="IBOVESPA"
            symbol="^BVSP"
            value={ibovPrice}
            changePct={data.ibov.quote.change_percent as number | undefined}
          />
        )}

        {data.sp500 && sp500Price > 0 && (
          <QuoteCard
            label="S&P 500"
            symbol="^GSPC"
            value={sp500Price}
            changePct={data.sp500.quote.change_percent as number | undefined}
          />
        )}

        {data.usdbrl && usdBrl > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 font-medium">USD/BRL</span>
            <span className="text-sm font-semibold text-white tabular-nums">
              {formatBRL(usdBrl)}
            </span>
            <MiniSparkline data={data.usdbrl.data.slice(-30)} />
            <span className="text-xs text-gray-600">Câmbio</span>
          </div>
        )}
      </div>
    </div>
  )
}
