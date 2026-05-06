'use client'

import { motion } from 'framer-motion'
import DesktopHeader from '@/components/layout/DesktopHeader'
import MobileNav from '@/components/layout/MobileNav'
import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar } from 'lucide-react'
import MonthlyChart from '@/components/MonthlyChart'
import CategoryChart from '@/components/CategoryChart'
import TransactionList from '@/components/TransactionList'
import type { EngineResult } from '@/lib/types'

export default function AnalyticsPage() {
  const [data, setData] = useState<EngineResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analyze')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/10 to-black pb-20 md:pb-8">
      <DesktopHeader
        title="Analytics"
        subtitle="Análises Detalhadas"
        rightContent={
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
          >
            Exportar
          </motion.button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="space-y-8">
          {/* Time Range Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 flex-wrap"
          >
            {['1M', '3M', '6M', '1A', 'Tudo'].map((period, idx) => (
              <motion.button
                key={period}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  idx === 0
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {period}
              </motion.button>
            ))}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-4 gap-4"
          >
            {[
              {
                label: 'Avg. Gasto Diário',
                value: data ? (data.totalExpenses / (data.period.days || 1)).toFixed(2) : '0',
                icon: '💵',
              },
              {
                label: 'Maior Transação',
                value: data
                  ? Math.max(...data.transactions.map((t) => Math.abs(t.amount)))
                      .toFixed(2)
                  : '0',
                icon: '📊',
              },
              {
                label: 'Transações',
                value: data?.transactions.length || 0,
                icon: '🔄',
              },
              {
                label: 'Categorias',
                value: data?.byCategory.length || 0,
                icon: '🏷️',
              },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MonthlyChart data={data?.monthly || []} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CategoryChart data={data?.byCategory || []} />
            </motion.div>
          </div>

          {/* Top Transactions */}
          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Top Transações
              </h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 overflow-x-auto">
                <TransactionList
                  transactions={data.transactions
                    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                    .slice(0, 20)}
                />
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
