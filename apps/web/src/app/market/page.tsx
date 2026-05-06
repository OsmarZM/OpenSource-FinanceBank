'use client'

import { motion } from 'framer-motion'
import DesktopHeader from '@/components/layout/DesktopHeader'
import MobileNav from '@/components/layout/MobileNav'
import EnhancedMarketWidget from '@/components/EnhancedMarketWidget'
import { useState } from 'react'
import { TrendingUp, BarChart3, Globe } from 'lucide-react'

const MARKET_WATCHLIST = [
  { symbol: 'IBOV', name: 'Ibovespa', icon: '🇧🇷' },
  { symbol: 'SP500', name: 'S&P 500', icon: '🇺🇸' },
  { symbol: 'USDBRL', name: 'Dólar', icon: '💱' },
  { symbol: 'GOLD', name: 'Ouro', icon: '✨' },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
]

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'news'>('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/10 to-black pb-20 md:pb-8">
      <DesktopHeader
        title="Mercados"
        subtitle="Visão Global dos Ativos"
        rightContent={
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
          >
            🔔 Alertas
          </motion.button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="space-y-8">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            {(['overview', 'watchlist', 'news'] as const).map((tab, idx) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {tab === 'overview' && '📊'}
                {tab === 'watchlist' && '⭐'}
                {tab === 'news' && '📰'}
                {' '}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <EnhancedMarketWidget />
            </motion.div>
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Minha Carteira Monitorada
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {MARKET_WATCHLIST.map((item, idx) => (
                  <motion.div
                    key={item.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 hover:border-blue-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-bold text-white">{item.symbol}</p>
                          <p className="text-xs text-gray-500">{item.name}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-xl opacity-50 hover:opacity-100 transition-opacity"
                      >
                        ⭐
                      </motion.button>
                    </div>
                    <div className="h-8 bg-white/5 rounded-lg" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-white">Notícias do Mercado</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((idx) => (
                  <motion.article
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-blue-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 opacity-50 group-hover:opacity-75 transition-opacity" />
                      <div className="flex-1">
                        <p className="font-bold text-white group-hover:text-blue-300 transition-colors">
                          Bolsa fecha em alta com aprovação de medida fiscal
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ibovespa sobe 1,2% com recuperação de ações de bancos
                        </p>
                        <p className="text-xs text-gray-600 mt-2">Há 2 horas</p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}

          {/* Market Calendar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border border-white/10 bg-white/5"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe size={20} className="text-blue-400" />
              Calendário Econômico
            </h2>
            <div className="space-y-3">
              {[
                { date: 'Hoje', event: 'FOMC (Fed)', impact: 'Alto' },
                { date: 'Amanhã', event: 'Desemprego EUA', impact: 'Alto' },
                { date: '+2d', event: 'Inflação Brasil', impact: 'Médio' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400">{item.date}</span>
                    <span className="text-white font-medium">{item.event}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      item.impact === 'Alto'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {item.impact}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
