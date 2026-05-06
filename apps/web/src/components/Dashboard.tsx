'use client'

import { useEffect, useState } from 'react'
import type { EngineResult, Insight } from '@/lib/types'
import SummaryCard from './SummaryCard'
import CategoryChart from './CategoryChart'
import MonthlyChart from './MonthlyChart'
import InsightsList from './InsightsList'
import TransactionList from './TransactionList'
import AIInsights from './AIInsights'
import MarketWidget from './MarketWidget'
import { formatBRL } from '@/lib/format'

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-white/5 animate-pulse ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite',
      }}
    />
  )
}

type DataSource = 'mock' | 'pluggy'

export default function Dashboard() {
  const [data, setData] = useState<EngineResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<DataSource>('mock')
  const [pluggyLoading, setPluggyLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState<Insight[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiUsage, setAiUsage] = useState<{ input_tokens: number; output_tokens: number; estimated_cost_usd: number } | null>(null)

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

  function connectPluggy() {
    setPluggyLoading(true)
    loadData('/api/pluggy', 'pluggy')
    setPluggyLoading(false)
  }

  function loadMock() {
    loadData('/api/analyze', 'mock')
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card border-red-500/30 p-8 text-center max-w-md">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-400 font-medium">Erro ao carregar dados</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  const savingsPercent = data ? data.savingsRate * 100 : 0
  const savingsColor: 'green' | 'yellow' | 'red' =
    savingsPercent >= 20 ? 'green' : savingsPercent >= 10 ? 'yellow' : 'red'

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-gradient flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/20">
              💰
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">FinEngine</span>
              <span className="text-blue-400 text-lg font-bold"> OSS</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <span className="text-xs text-gray-500 hidden sm:block">
                {data.period.from} — {data.period.to}
              </span>
            )}
            {/* Data source badge */}
            {source === 'pluggy' ? (
              <div className="flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />
                Pluggy sandbox
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Dados simulados
              </div>
            )}
            {/* Source switcher buttons */}
            <button
              onClick={source === 'mock' ? connectPluggy : loadMock}
              disabled={loading || pluggyLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-blue-600/20 hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {source === 'mock' ? '🔗 Pluggy sandbox' : '🔄 Voltar mock'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero */}
        <section className="fade-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Dashboard{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Financeiro
            </span>
          </h1>
          <p className="text-gray-500">
            {loading
              ? 'Carregando análise...'
              : `${data?.transactions.length} transações analisadas nos últimos ${data?.period.days ?? 0} dias`}
          </p>
        </section>

        {/* Market Data */}
        <section className="fade-up" style={{ animationDelay: '100ms' }}>
          <MarketWidget />
        </section>

        {/* Summary Cards */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : data ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                title="Receitas Totais"
                value={data.totalIncome}
                icon="📈"
                color="green"
                delay={0}
                subtitle={`${data.transactions.filter((t) => t.amount > 0).length} créditos`}
              />
              <SummaryCard
                title="Despesas Totais"
                value={data.totalExpenses}
                icon="📉"
                color="red"
                delay={100}
                subtitle={`${data.transactions.filter((t) => t.amount < 0).length} débitos`}
              />
              <SummaryCard
                title="Saldo Líquido"
                value={data.balance}
                icon="💳"
                color={data.balance >= 0 ? 'blue' : 'red'}
                delay={200}
                subtitle={data.balance >= 0 ? 'Positivo ✓' : 'Negativo ✗'}
              />
              <SummaryCard
                title="Taxa de Poupança"
                value={savingsPercent}
                format="percent"
                icon="🏦"
                color={savingsColor}
                delay={300}
                subtitle={savingsPercent >= 20 ? 'Meta atingida 🎯' : 'Meta: 20%'}
              />
            </div>
          ) : null}
        </section>

        {/* Charts row */}
        <section className="grid lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </>
          ) : data ? (
            <>
              <div className="fade-up" style={{ animationDelay: '200ms' }}>
                <MonthlyChart data={data.monthly} />
              </div>
              <div className="fade-up" style={{ animationDelay: '300ms' }}>
                <CategoryChart data={data.byCategory} />
              </div>
            </>
          ) : null}
        </section>

        {/* Rule-based Insights */}
        <section>
          {loading ? (
            <Skeleton className="h-64" />
          ) : data ? (
            <div className="fade-up" style={{ animationDelay: '400ms' }}>
              <InsightsList insights={data.insights} />
            </div>
          ) : null}
        </section>

        {/* AI Insights (Claude Haiku via Bedrock) */}
        {data && (
          <section className="fade-up" style={{ animationDelay: '450ms' }}>
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
          </section>
        )}

        {/* Transactions */}
        <section>
          {loading ? (
            <Skeleton className="h-96" />
          ) : data ? (
            <div className="fade-up" style={{ animationDelay: '500ms' }}>
              <TransactionList transactions={data.transactions} />
            </div>
          ) : null}
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/5">
          <p className="text-gray-600 text-sm">
            FinEngine OSS — Análise Financeira Inteligente &nbsp;•&nbsp;{' '}
            <span className="text-blue-500">Ambiente de Testes</span>
          </p>
          {data && (
            <p className="text-gray-700 text-xs mt-1">
              Saldo: {formatBRL(data.balance)} &nbsp;•&nbsp; Poupança: {(data.savingsRate * 100).toFixed(1)}%
            </p>
          )}
        </footer>
      </main>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-800/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
