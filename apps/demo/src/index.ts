/**
 * FinEngine OSS — Demo app
 *
 * Runs a full financial analysis using mock data.
 * Zero configuration required.
 *
 * Usage:
 *   pnpm demo
 *   npx fin-engine demo
 */
import { MockConnector } from '@fin-engine/connector-mock'
import { FinancialEngine } from '@fin-engine/core'
import type { EngineResult, CategoryBreakdown, Insight } from '@fin-engine/types'
import chalk from 'chalk'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function bar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function displayResult(result: EngineResult): void {
  console.log()
  console.log(chalk.bold.cyan('━'.repeat(54)))
  console.log(chalk.bold.white('  💰 FinEngine OSS — Análise Financeira'))
  console.log(chalk.gray(`  Período: ${result.period.from} – ${result.period.to} (${result.period.days} dias)`))
  console.log(chalk.gray(`  ${result.transactions.length} transações analisadas`))
  console.log(chalk.bold.cyan('━'.repeat(54)))

  console.log()
  console.log(chalk.bold.cyan('📊  RESUMO FINANCEIRO'))
  console.log(`  Receitas      ${chalk.green(formatBRL(result.totalIncome).padStart(16))}`)
  console.log(`  Despesas      ${chalk.red(formatBRL(result.totalExpenses).padStart(16))}`)
  console.log(`  ${'─'.repeat(32)}`)
  const balanceColor = result.balance >= 0 ? chalk.green : chalk.red
  console.log(`  Saldo         ${balanceColor(formatBRL(result.balance).padStart(16))}`)
  const savingsColor = result.savingsRate >= 20 ? chalk.green : result.savingsRate >= 10 ? chalk.yellow : chalk.red
  console.log(`  Poupança      ${savingsColor(`${result.savingsRate.toFixed(1)}%`.padStart(16))}`)

  if (result.categoryBreakdown.length > 0) {
    console.log()
    console.log(chalk.bold.cyan('📂  GASTOS POR CATEGORIA'))
    for (const cat of result.categoryBreakdown.slice(0, 10)) {
      const label = cat.category.padEnd(14)
      const value = formatBRL(cat.total).padStart(14)
      const pct = `${cat.percentage.toFixed(1)}%`.padStart(6)
      console.log(`  ${label} ${chalk.yellow(value)}  ${chalk.gray(pct)}  ${chalk.cyan(bar(cat.percentage))}`)
    }
  }

  if (result.insights.length > 0) {
    console.log()
    console.log(chalk.bold.cyan('💡  INSIGHTS'))
    for (const insight of result.insights) {
      const icon = insight.level === 'alert' ? '🚨' : insight.level === 'warning' ? '⚠️ ' : 'ℹ️ '
      const color = insight.level === 'alert' ? chalk.red : insight.level === 'warning' ? chalk.yellow : chalk.blue
      console.log(`  ${icon}  ${color(insight.message)}`)
      if (insight.detail) {
        console.log(`       ${chalk.gray(insight.detail)}`)
      }
    }
  }

  console.log()
  console.log(chalk.bold.cyan('━'.repeat(54)))
  console.log()
}

async function main() {
  console.log()
  console.log(chalk.bold.yellow('🚀  FinEngine OSS — Modo Demo'))
  console.log(chalk.gray('  Usando dados financeiros simulados para demonstração'))
  console.log()

  const connector = new MockConnector()
  await connector.connect()
  const transactions = await connector.getTransactions()

  const engine = new FinancialEngine()
  const result = engine.analyze(transactions)

  console.log(chalk.green(`✔ ${transactions.length} transações analisadas`))

  displayResult(result)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

