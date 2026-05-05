import type { EngineResult, Insight } from '@fin-engine/types'
import chalk from 'chalk'
import boxen from 'boxen'

// ─── Formatting helpers ─────────────────────────────────────────────────────

function brl(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function bar(percentage: number, width = 20): string {
  const filled = Math.round((percentage / 100) * width)
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(width - filled))
}

// ─── Insight icons ───────────────────────────────────────────────────────────

const LEVEL_ICON: Record<Insight['level'], string> = {
  success: chalk.green('✅'),
  info: chalk.cyan('ℹ️ '),
  warning: chalk.yellow('⚠️ '),
  danger: chalk.red('🚨'),
}

// ─── Category labels in PT-BR ────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  food: 'Alimentação',
  transport: 'Transporte',
  housing: 'Moradia',
  health: 'Saúde',
  education: 'Educação',
  entertainment: 'Lazer',
  shopping: 'Compras',
  income: 'Renda',
  investment: 'Investimentos',
  transfer: 'Transferências',
  subscription: 'Assinaturas',
  utilities: 'Utilidades',
  other: 'Outros',
}

function catLabel(cat: string): string {
  return CATEGORY_LABEL[cat] ?? cat
}

// ─── Main display ─────────────────────────────────────────────────────────────

export function displayResult(result: EngineResult): void {
  const { period, totalIncome, totalExpenses, balance, savingsRate, byCategory, patterns, insights } = result

  console.log()

  // ── Header box ──────────────────────────────────────────────────────────
  const header = [
    chalk.bold.green('💰 FinEngine OSS — Análise Financeira'),
    chalk.gray(`Período: ${formatDate(period.from)} – ${formatDate(period.to)}`),
    chalk.gray(`${result.transactions.length} transações analisadas`),
  ].join('\n')

  console.log(
    boxen(header, {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'green',
    }),
  )

  // ── Financial summary ───────────────────────────────────────────────────
  console.log(chalk.bold('📊  RESUMO FINANCEIRO'))
  console.log()
  console.log(`  ${chalk.gray('Receitas')}   ${chalk.green(brl(totalIncome).padStart(16))}`)
  console.log(`  ${chalk.gray('Despesas')}   ${chalk.red(brl(totalExpenses).padStart(16))}`)
  console.log(`  ${chalk.gray('─'.repeat(30))}`)
  const balanceColor = balance >= 0 ? chalk.green : chalk.red
  console.log(`  ${chalk.bold('Saldo')}      ${balanceColor(brl(balance).padStart(16))}`)
  const savingsColor = savingsRate >= 0.2 ? chalk.green : savingsRate >= 0.1 ? chalk.yellow : chalk.red
  console.log(`  ${chalk.gray('Poupança')}   ${savingsColor(pct(savingsRate).padStart(16))}`)
  console.log()

  // ── Category breakdown ──────────────────────────────────────────────────
  const expenses = byCategory.filter((c) => c.category !== 'income' && c.category !== 'investment')

  if (expenses.length > 0) {
    console.log(chalk.bold('📂  GASTOS POR CATEGORIA'))
    console.log()
    for (const cat of expenses.slice(0, 10)) {
      const label = catLabel(cat.category).padEnd(16)
      const total = brl(cat.total).padStart(14)
      const pctStr = `${cat.percentage.toFixed(1)}%`.padStart(6)
      console.log(`  ${chalk.cyan(label)} ${chalk.white(total)} ${chalk.gray(pctStr)}  ${bar(cat.percentage)}`)
    }
    console.log()
  }

  // ── Insights ─────────────────────────────────────────────────────────────
  if (insights.length > 0) {
    console.log(chalk.bold('💡  INSIGHTS'))
    console.log()
    for (const insight of insights) {
      const icon = LEVEL_ICON[insight.level]
      console.log(`  ${icon}  ${chalk.white(insight.message)}`)
      if (insight.detail) {
        console.log(`       ${chalk.gray(insight.detail)}`)
      }
    }
    console.log()
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  console.log(
    chalk.gray(
      `  Análise gerada pelo FinEngine OSS • ${new Date().toLocaleDateString('pt-BR')}` +
      `\n  Para análise com IA: configure LLM_PROVIDER no .env`,
    ),
  )
  console.log()
}
