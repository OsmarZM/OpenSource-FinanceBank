import type { Transaction, Insight, EngineResult } from './types'
import { categorize } from './categorizer'
import { buildCategoryBreakdown, buildMonthlyData, calcPeriod, detectPatterns } from './metrics'

let insightSeq = 0

function makeInsight(
  level: Insight['level'],
  message: string,
  detail?: string,
  extra: Partial<Insight> = {},
): Insight {
  return { id: `insight-${++insightSeq}`, level, message, detail, ...extra }
}

function generateInsights(result: Omit<EngineResult, 'insights'>): Insight[] {
  insightSeq = 0
  const insights: Insight[] = []
  const { byCategory, savingsRate, patterns, totalIncome, totalExpenses } = result

  if (savingsRate >= 0.2) {
    insights.push(makeInsight('success', `Taxa de poupança saudável: ${(savingsRate * 100).toFixed(1)}%`, 'Continue assim! Você está poupando bem.'))
  } else if (savingsRate >= 0.1) {
    insights.push(makeInsight('info', `Taxa de poupança: ${(savingsRate * 100).toFixed(1)}%`, 'Tente aumentar para pelo menos 20%.'))
  } else if (totalIncome > 0) {
    insights.push(makeInsight('danger', `Taxa de poupança muito baixa: ${(savingsRate * 100).toFixed(1)}%`, 'Suas despesas estão consumindo quase toda a renda.'))
  }

  for (const cat of byCategory) {
    if (cat.percentage > 30 && cat.category !== 'housing' && cat.category !== 'investment') {
      insights.push(makeInsight(
        'warning',
        `Gastos com ${cat.category} representam ${cat.percentage.toFixed(0)}% das despesas`,
        `Total: R$ ${cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        { category: cat.category, value: cat.total },
      ))
    }
  }

  for (const p of patterns) {
    if (p.type === 'trend_up' && p.change && p.change >= 0.2) {
      insights.push(makeInsight(
        p.change >= 0.35 ? 'danger' : 'warning',
        `Gastos com ${p.category} aumentaram ${Math.round(p.change * 100)}% no período`,
        p.description,
        { category: p.category, change: p.change },
      ))
    }
    if (p.type === 'trend_down' && p.change && Math.abs(p.change) >= 0.2) {
      insights.push(makeInsight(
        'success',
        `Gastos com ${p.category} reduziram ${Math.round(Math.abs(p.change) * 100)}% no período`,
        p.description,
        { category: p.category, change: p.change },
      ))
    }
    if (p.type === 'recurring') {
      insights.push(makeInsight('info', p.label, p.description, { category: 'subscription' }))
    }
    if (p.type === 'low_savings') {
      insights.push(makeInsight('warning', p.label, p.description))
    }
  }

  if (totalIncome > 0 && totalExpenses < totalIncome && savingsRate < 0.1) {
    const balance = totalIncome - totalExpenses
    insights.push(makeInsight('info', `Saldo positivo: R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Mas a taxa de poupança ainda pode melhorar.'))
  }

  return insights
}

export function analyze(transactions: Transaction[]): EngineResult {
  if (transactions.length === 0) throw new Error('No transactions to analyze.')

  const normalized: Transaction[] = transactions.map((tx) => ({
    ...tx,
    category: tx.category ?? categorize(tx.description),
  }))

  let totalIncome = 0
  let totalExpenses = 0
  for (const tx of normalized) {
    if (tx.amount >= 0) totalIncome += tx.amount
    else totalExpenses += Math.abs(tx.amount)
  }
  totalIncome = Math.round(totalIncome * 100) / 100
  totalExpenses = Math.round(totalExpenses * 100) / 100

  const balance = Math.round((totalIncome - totalExpenses) * 100) / 100
  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 10000) / 10000
      : 0

  const byCategory = buildCategoryBreakdown(normalized)
  const period = calcPeriod(normalized)
  const monthly = buildMonthlyData(normalized)
  const patterns = detectPatterns(monthly, normalized)

  const partial = { period, totalIncome, totalExpenses, balance, savingsRate, byCategory, transactions: normalized, patterns, monthly }
  const insights = generateInsights(partial)

  return { ...partial, insights }
}
