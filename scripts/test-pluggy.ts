#!/usr/bin/env tsx
/**
 * scripts/test-pluggy.ts
 *
 * Tests the Pluggy sandbox connector end-to-end:
 *   1. Authenticates with Pluggy API
 *   2. Fetches transactions from sandbox Item
 *   3. Runs FinancialEngine analysis
 *   4. Prints colorized results to the terminal
 *
 * Usage:
 *   pnpm tsx scripts/test-pluggy.ts
 *
 * Required env vars (in .env or set manually):
 *   PLUGGY_CLIENT_ID
 *   PLUGGY_CLIENT_SECRET
 *   PLUGGY_SANDBOX_ITEM_ID
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env') })

import { PluggyConnector } from '../packages/connector-pluggy/src/index.js'
import { FinancialEngine } from '../packages/core/src/index.js'

// ─── Terminal colors (no external deps needed here) ────────────────────────
const R = '\x1b[0m'
const B = '\x1b[1m'
const G = '\x1b[32m'
const Y = '\x1b[33m'
const C = '\x1b[36m'
const RED = '\x1b[31m'

function fmt(n: number, prefix = 'R$ '): string {
  return `${prefix}${Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

// ─── Main ────────────────────────────────────────────────────────────────────
const clientId = process.env['PLUGGY_CLIENT_ID']
const clientSecret = process.env['PLUGGY_CLIENT_SECRET']
const itemId = process.env['PLUGGY_SANDBOX_ITEM_ID']

if (!clientId || !clientSecret || !itemId) {
  console.error(
    `${RED}${B}Missing env vars.${R}\n` +
    'Set PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET, and PLUGGY_SANDBOX_ITEM_ID in .env\n\n' +
    'To get sandbox credentials:\n' +
    '  1. Create a free account at https://dashboard.pluggy.ai\n' +
    '  2. Go to Settings → API Keys\n' +
    '  3. Use sandbox Item ID from https://docs.pluggy.ai/docs/sandbox\n',
  )
  process.exit(1)
}

console.log(`${C}${B}━━━ FinEngine × Pluggy Sandbox Test ━━━${R}\n`)
console.log(`${B}Item ID:${R} ${itemId}`)
console.log()

const connector = new PluggyConnector({ clientId, clientSecret, itemId })
const engine = new FinancialEngine()

// ─── Auth ────────────────────────────────────────────────────────────────────
process.stdout.write('🔐 Authenticating with Pluggy... ')
try {
  await connector.connect()
  console.log(`${G}OK${R}`)
} catch (err: unknown) {
  console.log(`${RED}FAILED${R}`)
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}

// ─── Fetch ───────────────────────────────────────────────────────────────────
process.stdout.write('📥 Fetching transactions... ')
let transactions
try {
  transactions = await connector.getTransactions()
  console.log(`${G}${transactions.length} transactions${R}`)
} catch (err: unknown) {
  console.log(`${RED}FAILED${R}`)
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}

if (transactions.length === 0) {
  console.log(`${Y}No transactions returned. Check the Item ID and date range.${R}`)
  process.exit(0)
}

// ─── Analyze ─────────────────────────────────────────────────────────────────
process.stdout.write('⚙️  Running engine... ')
const result = engine.analyze(transactions)
console.log(`${G}OK${R}`)

// ─── Results ─────────────────────────────────────────────────────────────────
console.log(`\n${C}${B}━━━ Analysis Results ━━━${R}`)
console.log(`Period:      ${result.period.from} → ${result.period.to} (${result.period.days} days)`)
console.log(`Transactions:${B} ${result.transactions.length}${R}`)
console.log(`${G}Income:${R}      ${B}${fmt(result.totalIncome)}${R}`)
console.log(`${RED}Expenses:${R}    ${B}${fmt(result.totalExpenses)}${R}`)
console.log(`Balance:     ${result.balance >= 0 ? G : RED}${B}${fmt(result.balance)}${R}`)
console.log(`Savings rate:${result.savingsRate >= 0.2 ? G : Y} ${(result.savingsRate * 100).toFixed(1)}%${R}`)

console.log(`\n${C}${B}━━━ Spending by Category ━━━${R}`)
for (const cat of result.byCategory.slice(0, 8)) {
  const bar = '█'.repeat(Math.round(cat.percentage / 5))
  console.log(`  ${cat.category.padEnd(14)} ${bar.padEnd(20)} ${Y}${cat.percentage.toFixed(1)}%${R}  ${fmt(cat.total)}`)
}

console.log(`\n${C}${B}━━━ Insights ━━━${R}`)
const icons: Record<string, string> = { info: 'ℹ', success: '✓', warning: '⚠', danger: '✖' }
const colors: Record<string, string> = { info: C, success: G, warning: Y, danger: RED }
for (const ins of result.insights) {
  const color = colors[ins.level] ?? ''
  const icon = icons[ins.level] ?? '·'
  console.log(`  ${color}${icon} ${ins.message}${R}`)
  if (ins.detail) console.log(`    ${ins.detail}`)
}

console.log(`\n${G}${B}✓ Test passed${R}`)
