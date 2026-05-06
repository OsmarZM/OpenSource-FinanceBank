#!/usr/bin/env tsx
/**
 * scripts/test-claude.ts
 *
 * Tests Claude Haiku 4.5 via AWS Bedrock through the agents sidecar.
 * Sends a mock EngineResult and prints the AI-generated insights.
 *
 * Usage:
 *   pnpm tsx scripts/test-claude.ts
 *
 * Requires the agents sidecar to be running with LLM_PROVIDER=bedrock:
 *   docker compose --profile ai up
 *   OR:
 *   cd services/agents && LLM_PROVIDER=bedrock uv run uvicorn agents.server:app --port 8000
 *
 * Required env (in .env):
 *   LLM_PROVIDER=bedrock
 *   AWS_REGION=us-east-1
 *   AWS_ACCESS_KEY_ID=...
 *   AWS_SECRET_ACCESS_KEY=...
 *   BEDROCK_MODEL_ID=anthropic.claude-haiku-4-5-20251022-v1:0
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env') })

import { AgentsClient } from '../packages/agents-client/src/index.js'

const R = '\x1b[0m'
const B = '\x1b[1m'
const G = '\x1b[32m'
const Y = '\x1b[33m'
const C = '\x1b[36m'
const RED = '\x1b[31m'
const PURPLE = '\x1b[35m'

const AGENTS_URL = (process.env['AGENTS_URL'] ?? 'http://localhost:8000').replace(/\/$/, '')

// ─── Mock EngineResult (realistic Brazilian financial data) ───────────────────
const MOCK_ENGINE_RESULT = {
  period: { from: '2026-02-01', to: '2026-04-30', days: 89 },
  totalIncome: 10300.00,
  totalExpenses: 9850.00,
  balance: 450.00,
  savingsRate: 0.0437,
  byCategory: [
    { category: 'housing', total: 3000.00, percentage: 30.5, count: 6 },
    { category: 'food', total: 2400.00, percentage: 24.4, count: 45 },
    { category: 'transport', total: 1200.00, percentage: 12.2, count: 28 },
    { category: 'health', total: 900.00, percentage: 9.1, count: 9 },
    { category: 'subscription', total: 300.00, percentage: 3.0, count: 9 },
    { category: 'shopping', total: 750.00, percentage: 7.6, count: 7 },
    { category: 'investment', total: 500.00, percentage: 5.1, count: 3 },
    { category: 'entertainment', total: 800.00, percentage: 8.1, count: 12 },
  ],
  patterns: [
    { id: 'p1', type: 'trend_up', label: 'Gastos com food em alta', description: 'Gastos com alimentação aumentaram 38% no período.', category: 'food', change: 0.38 },
    { id: 'p2', type: 'low_savings', label: 'Taxa de poupança baixa', description: 'Poupança de apenas 4.4% no período.', value: 0.044 },
    { id: 'p3', type: 'recurring', label: 'Assinatura recorrente: Netflix', description: 'Cobrança mensal de aprox. R$ 55.90.', category: 'subscription' },
  ],
  monthly: [
    { month: '2026-02', income: 8000, expenses: 7800, balance: 200 },
    { month: '2026-03', income: 8000, expenses: 8200, balance: -200 },
    { month: '2026-04', income: 10300, expenses: 9850, balance: 450 },
  ],
  insights: [],
  transactions: [],
}

console.log(`${C}${B}━━━ FinEngine × Claude Haiku 4.5 (AWS Bedrock) ━━━${R}`)
console.log(`${B}Agents URL:${R} ${AGENTS_URL}`)
console.log()

const client = new AgentsClient(AGENTS_URL)

// ─── Health check ─────────────────────────────────────────────────────────────
process.stdout.write('🏥 Health check... ')
try {
  const h = await client.health()
  if (h.status !== 'ok') throw new Error(`status: ${h.status}`)
  console.log(`${G}OK${R}  provider=${B}${h.provider}${R}  model=${B}${h.model}${R}`)

  if (h.provider === 'none') {
    console.log(`\n${Y}⚠ LLM_PROVIDER=none — no AI insights will be generated.${R}`)
    console.log(`Set LLM_PROVIDER=bedrock in the sidecar environment to enable Claude Haiku 4.5.\n`)
  }
} catch (e) {
  console.log(`${RED}FAILED${R}`)
  console.error(e instanceof Error ? e.message : e)
  console.log(`\nStart the sidecar first:`)
  console.log(`  ${Y}cd services/agents && LLM_PROVIDER=bedrock uv run uvicorn agents.server:app --port 8000${R}`)
  console.log(`  OR: ${Y}docker compose --profile ai up${R}`)
  process.exit(1)
}

// ─── Analyze ──────────────────────────────────────────────────────────────────
console.log(`\n${B}Sending EngineResult to Claude Haiku 4.5...${R}`)
console.log(`  Period: ${MOCK_ENGINE_RESULT.period.from} → ${MOCK_ENGINE_RESULT.period.to}`)
console.log(`  Income: R$ ${MOCK_ENGINE_RESULT.totalIncome.toFixed(2)}`)
console.log(`  Expenses: R$ ${MOCK_ENGINE_RESULT.totalExpenses.toFixed(2)}`)
console.log(`  Savings rate: ${(MOCK_ENGINE_RESULT.savingsRate * 100).toFixed(1)}%`)
console.log()

process.stdout.write('✨ Generating insights... ')
const start = Date.now()

let result
try {
  result = await client.analyze(MOCK_ENGINE_RESULT)
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`${G}OK${R}  (${elapsed}s)  model=${B}${result.model}${R}`)
} catch (e) {
  console.log(`${RED}FAILED${R}`)
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
}

// ─── Print insights ───────────────────────────────────────────────────────────
if (!result.insights.length) {
  console.log(`\n${Y}No insights returned (provider may be 'none').${R}`)
  process.exit(0)
}

const levelColors: Record<string, string> = { info: C, success: G, warning: Y, danger: RED }
const levelIcons: Record<string, string> = { info: 'ℹ', success: '✓', warning: '⚠', danger: '✖' }

console.log(`\n${PURPLE}${B}━━━ AI Insights (${result.insights.length} generated) ━━━${R}`)
for (const insight of result.insights) {
  const col = levelColors[insight.level] ?? ''
  const icon = levelIcons[insight.level] ?? '·'
  console.log(`\n  ${col}${B}${icon} [${insight.level.toUpperCase()}]${R} ${insight.message}`)
  if (insight.detail) {
    console.log(`     ${insight.detail}`)
  }
}

console.log(`\n${G}${B}✓ Claude Haiku 4.5 test passed${R}`)
