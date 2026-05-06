'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { EngineResult, Insight } from '@/lib/types'
import MobileNav from './layout/MobileNav'
import DesktopHeader from './layout/DesktopHeader'
import AnimatedCard from './AnimatedCard'
import EnhancedMarketWidget from './EnhancedMarketWidget'
import CategoryChart from './CategoryChart'
import MonthlyChart from './MonthlyChart'
import InsightsList from './InsightsList'
import TransactionList from './TransactionList'
import AIInsights from './AIInsights'
import PluggyConnectButton from './PluggyConnectButton'
import { formatBRL } from '@/lib/format'

type DataSource = 'mock' | 'pluggy'

// Skeleton component for loading states
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className={`rounded-xl bg-white/5 ${className}`}
    />
  )
}

export default function Dashboard() {
  const [data, setData] = useState<EngineResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<DataSource>('mock')
  const [pluggyLoading, setPluggyLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState<Insight[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiUsage, setAiUsage] = useState<{
    input_tokens: number
    output_tokens: number
    estimated_cost_usd: number
  } | null>(null)

  function loadData(endpoint: string, src: DataSource) {
    setLoading(true)
    setError(null)
    setData(null)
    setAiInsights(null)
    setAiError(null)
    setAiUsage(null)
    fetch(endpoint)
      .then((r) => r.json())
      .then((d: EngineResult & { error?: string }) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setSource(src)
        setLoading(false)
      })
      .catch((e: Error) => {
        setError(e.message || 'Falha ao carregar os dados financeiros.')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData('/api/analyze', 'mock')
  }, [])

  function connectPluggyById(itemId: string) {
    setPluggyLoading(true)
    loadData(`/api/pluggy?itemId=${encodeURIComponent(itemId)}`, 'pluggy')
    setPluggyLoading(false)
  }

  function loadMock() {
    loadData('/api/analyze', 'mock')
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-black px-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="glass-card border-red-500/30 p-8 text-center max-w-md rounded-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-3"
          >
            ⚠️
          </motion.div>
          <p className="text-red-400 font-medium text-lg">Erro ao carregar dados</p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadMock()}
            className="mt-4 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            Tentar novamente
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  const savingsPercent = data ? data.savingsRate * 100 : 0
  const savingsColor: 'green' | 'yellow' | 'red' =
    savingsPercent >= 20 ? 'green' : savingsPercent >= 10 ? 'yellow' : 'red'

  const rightHeaderContent = (
    <div className="flex items-center gap-2">
      {source === 'pluggy' ? (
        <>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Pluggy
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadMock}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors"
          >
            Voltar
          </motion.button>
        </>
      ) : (
        <>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Mock
          </motion.div>
          <PluggyConnectButton onSuccess={connectPluggyById} label="Conectar" />
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/10 to-black pb-20 md:pb-8">
      {/* Desktop Header */}
      <DesktopHeader
        title="FinEngine"
        subtitle="Dashboard Financeiro"
        dataSource={source}
        transactionCount={data?.transactions.length}
        period={data?.period}
        rightContent={rightHeaderContent}
      />

      {/* Mobile/Desktop Main Content */}
      <main className="w-full px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden"
          >
            <h1 className="text-2xl font-bold text-white mb-1">
              {loading ? 'Carregando...' : 'Suas Finanças'}
            </h1>
            <p className="text-gray-500 text-sm">
              {loading
                ? 'Analisando dados...'
                : `${data?.transactions.length || 0} transações`}
            </p>
          </motion.section>

          {/* Market Data Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <EnhancedMarketWidget />
          </motion.section>

          {/* Summary Cards Grid */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-bold text-white hidden md:block">Resumo Financeiro</h2>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : data ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <AnimatedCard
                  title="Receitas"
                  value={formatBRL(data.totalIncome)}
                  icon="📈"
                  color="green"
                  delay={0}
                  subtitle={`${data.transactions.filter((t) => t.amount > 0).length} créditos`}
                />
                <AnimatedCard
                  title="Despesas"
                  value={formatBRL(data.totalExpenses)}
                  icon="📉"
                  color="red"
                  delay={0.1}
                  subtitle={`${data.transactions.filter((t) => t.amount < 0).length} débitos`}
                />
                <AnimatedCard
                  title="Saldo"
                  value={formatBRL(data.balance)}
                  icon="💳"
                  color={data.balance >= 0 ? 'blue' : 'red'}
                  delay={0.2}
                  subtitle={data.balance >= 0 ? '✓ Positivo' : '✗ Negativo'}
                  trend={
                    data.balance >= 0
                      ? { value: 2.5, isUp: true }
                      : { value: -1.2, isUp: false }
                  }
                />
                <AnimatedCard
                  title="Poupança"
                  value={`${savingsPercent.toFixed(1)}%`}
                  icon="🏦"
                  color={savingsColor}
                  delay={0.3}
                  subtitle={
                    savingsPercent >= 20 ? '🎯 Meta atingida' : '📍 Meta: 20%'
                  }
                />
              </div>
            ) : null}
          </motion.section>

          {/* Charts Grid */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-bold text-white hidden md:block">Análises</h2>
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
              </div>
            ) : data ? (
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <MonthlyChart data={data.monthly} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CategoryChart data={data.byCategory} />
                </motion.div>
              </div>
            ) : null}
          </motion.section>

          {/* Insights Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-bold text-white hidden md:block">Insights</h2>
            {loading ? (
              <Skeleton className="h-64" />
            ) : data ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <InsightsList insights={data.insights} />
              </motion.div>
            ) : null}
          </motion.section>

          {/* AI Insights */}
          {data && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <AIInsights
                engineResult={data}
                insights={aiInsights}
                loading={aiLoading}
                error={aiError}
                usage={aiUsage}
                onGenerate={() => {
                  setAiLoading(true)
                  setAiError(null)
                  fetch('/api/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  })
                    .then((r) => r.json())
                    .then((res: { insights?: Insight[]; error?: string; usage?: { input_tokens: number; output_tokens: number; estimated_cost_usd: number } }) => {
                      if (res.error) throw new Error(res.error)
                      setAiInsights(res.insights ?? [])
                      setAiUsage(res.usage ?? null)
                      setAiLoading(false)
                    })
                    .catch((e: Error) => {
                      setAiError(e.message || 'Falha ao gerar insights.')
                      setAiLoading(false)
                    })
                }}
              />
            </motion.section>
          )}

          {/* Transactions List */}
          {data && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pb-8"
            >
              <h2 className="text-lg font-bold text-white mb-4 hidden md:block">
                Transações Recentes
              </h2>
              <TransactionList
                transactions={data.transactions.slice(0, 10)}
              />
            </motion.section>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
