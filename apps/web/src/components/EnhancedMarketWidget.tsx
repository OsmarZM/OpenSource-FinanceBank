'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume?: string
  high?: number
  low?: number
}

interface MarketSnapshot {
  indices: MarketData[]
  commodities: MarketData[]
  crypto?: MarketData[]
  loading: boolean
  error?: string
}

function MarketCard({ data, isUp }: { data: MarketData; isUp: boolean }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={clsx(
        'p-4 rounded-xl border',
        isUp
          ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20'
          : 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-400">{data.symbol}</p>
          <p className="text-xs text-gray-600">{data.name}</p>
        </div>
        <motion.div animate={{ y: isUp ? -2 : 2 }} transition={{ repeat: Infinity, duration: 2 }}>
          {isUp ? (
            <TrendingUp size={18} className="text-green-400" />
          ) : (
            <TrendingDown size={18} className="text-red-400" />
          )}
        </motion.div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={clsx('text-lg font-bold', isUp ? 'text-green-400' : 'text-red-400')}>
          {data.price.toFixed(2)}
        </span>
        <span
          className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded',
            isUp ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          )}
        >
          {isUp ? '+' : ''}{data.changePercent.toFixed(2)}%
        </span>
      </div>

      {data.high && data.low && (
        <div className="text-xs text-gray-600 mt-2 space-y-0.5">
          <p>H: {data.high.toFixed(2)} | L: {data.low.toFixed(2)}</p>
        </div>
      )}
    </motion.div>
  )
}

export default function EnhancedMarketWidget() {
  const [market, setMarket] = useState<MarketSnapshot>({
    indices: [],
    commodities: [],
    loading: true,
  })

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch('/api/market')
        const data = await res.json()
        setMarket({ ...data, loading: false })
      } catch (error) {
        console.error('Market data error:', error)
        setMarket((prev) => ({ ...prev, loading: false, error: 'Falha ao carregar dados' }))
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000) // Atualiza a cada 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-400" />
          Mercados Globais
        </h2>

        {market.loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="p-4 rounded-xl bg-white/5 animate-pulse"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}
          </div>
        ) : market.error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {market.error}
          </div>
        ) : (
          <>
            {/* Índices */}
            {market.indices.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mb-6">
                <p className="text-sm text-gray-500 font-medium">Índices</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {market.indices.map((data) => (
                    <MarketCard
                      key={data.symbol}
                      data={data}
                      isUp={data.changePercent >= 0}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Commodities */}
            {market.commodities.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <p className="text-sm text-gray-500 font-medium">Commodities</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {market.commodities.map((data) => (
                    <MarketCard
                      key={data.symbol}
                      data={data}
                      isUp={data.changePercent >= 0}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Last Updated */}
      <motion.p className="text-xs text-gray-600 text-center">
        Atualizado em tempo real
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="ml-1 inline-block"
        >
          ●
        </motion.span>
      </motion.p>
    </motion.section>
  )
}
