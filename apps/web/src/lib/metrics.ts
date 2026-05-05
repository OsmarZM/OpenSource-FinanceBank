import type { Transaction, CategoryBreakdown, Pattern, Period, MonthlyData } from './types'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function monthKey(date: string): string {
  return date.slice(0, 7)
}

export function buildMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const map = new Map<string, MonthlyData>()

  for (const tx of transactions) {
    const key = monthKey(tx.date)
    if (!map.has(key)) {
      map.set(key, { month: key, income: 0, expenses: 0, balance: 0, byCategory: {} })
    }
    const m = map.get(key)!
    const cat = tx.category ?? 'other'

    if (tx.amount >= 0) {
      m.income += tx.amount
    } else {
      m.expenses += Math.abs(tx.amount)
      m.byCategory[cat] = (m.byCategory[cat] ?? 0) + Math.abs(tx.amount)
    }
  }

  const result = Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
  for (const m of result) {
    m.income = round2(m.income)
    m.expenses = round2(m.expenses)
    m.balance = round2(m.income - m.expenses)
  }
  return result
}

export function buildCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const totals = new Map<string, { total: number; count: number }>()
  let totalExpenses = 0

  for (const tx of transactions) {
    if (tx.amount < 0) {
      const cat = tx.category ?? 'other'
      const prev = totals.get(cat) ?? { total: 0, count: 0 }
      const abs = Math.abs(tx.amount)
      totals.set(cat, { total: prev.total + abs, count: prev.count + 1 })
      totalExpenses += abs
    }
  }

  return Array.from(totals.entries())
    .map(([category, { total, count }]) => ({
      category,
      total: round2(total),
      count,
      percentage: totalExpenses > 0 ? round2((total / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export function detectPatterns(monthly: MonthlyData[], transactions: Transaction[]): Pattern[] {
  const patterns: Pattern[] = []
  let patternId = 0

  function pid() {
    return `pattern-${++patternId}`
  }

  if (monthly.length >= 2) {
    const first = monthly[0]
    const last = monthly[monthly.length - 1]

    const allCategories = new Set([
      ...Object.keys(first.byCategory),
      ...Object.keys(last.byCategory),
    ])

    for (const cat of allCategories) {
      const firstAmt = first.byCategory[cat] ?? 0
      const lastAmt = last.byCategory[cat] ?? 0
      if (firstAmt === 0 || lastAmt === 0) continue
      const change = (lastAmt - firstAmt) / firstAmt

      if (change >= 0.2) {
        patterns.push({
          id: pid(),
          type: 'trend_up',
          label: `Gastos com ${cat} em alta`,
          description: `Gastos com ${cat} aumentaram ${Math.round(change * 100)}% comparado ao início do período.`,
          category: cat,
          change,
          value: lastAmt,
        })
      } else if (change <= -0.2) {
        patterns.push({
          id: pid(),
          type: 'trend_down',
          label: `Gastos com ${cat} em queda`,
          description: `Gastos com ${cat} reduziram ${Math.round(Math.abs(change) * 100)}% comparado ao início do período.`,
          category: cat,
          change,
          value: lastAmt,
        })
      }
    }
  }

  if (monthly.length > 0) {
    const lastMonth = monthly[monthly.length - 1]
    const rate = lastMonth.income > 0 ? (lastMonth.income - lastMonth.expenses) / lastMonth.income : 0
    if (rate < 0.1 && lastMonth.income > 0) {
      patterns.push({
        id: pid(),
        type: 'low_savings',
        label: 'Taxa de poupança baixa',
        description: `Você poupou apenas ${Math.round(rate * 100)}% da renda no último mês.`,
        value: rate,
      })
    }
  }

  const subTxs = transactions.filter((t) => t.category === 'subscription' && t.amount < 0)
  const subGroups = new Map<string, Transaction[]>()
  for (const tx of subTxs) {
    const key = tx.description.split(/\s+/).slice(0, 2).join(' ').toLowerCase()
    const group = subGroups.get(key) ?? []
    group.push(tx)
    subGroups.set(key, group)
  }
  for (const [, group] of subGroups) {
    if (group.length >= 2) {
      const avg = group.reduce((s, t) => s + Math.abs(t.amount), 0) / group.length
      patterns.push({
        id: pid(),
        type: 'recurring',
        label: `Assinatura recorrente: ${group[0].description}`,
        description: `Cobrança mensal de aprox. R$ ${avg.toFixed(2)}.`,
        category: 'subscription',
        value: avg,
      })
    }
  }

  return patterns
}

export function calcPeriod(transactions: Transaction[]): Period {
  const dates = transactions.map((t) => t.date).sort()
  const from = dates[0] ?? ''
  const to = dates[dates.length - 1] ?? ''
  const days =
    from && to
      ? Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000) + 1
      : 0
  return { from, to, days }
}
