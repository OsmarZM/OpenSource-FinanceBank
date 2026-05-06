#!/usr/bin/env tsx
/**
 * scripts/test-openbb.ts
 *
 * Tests the OpenBB market data sidecar (services/openbb).
 * Fetches IBOV, S&P500, USD/BRL and a portfolio value calculation.
 *
 * Usage:
 *   pnpm tsx scripts/test-openbb.ts
 *
 * Requires the OpenBB sidecar to be running:
 *   docker compose --profile openbb up
 *   OR:
 *   cd services/openbb && uv run uvicorn src.main:app --port 8001
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env') })

const OPENBB_URL = (process.env['OPENBB_URL'] ?? 'http://localhost:8001').replace(/\/$/, '')

const R = '\x1b[0m'
const B = '\x1b[1m'
const G = '\x1b[32m'
const Y = '\x1b[33m'
const C = '\x1b[36m'
const RED = '\x1b[31m'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${OPENBB_URL}${path}`)
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status} ${path}: ${text}`)
  }
  return res.json() as Promise<T>
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${OPENBB_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status} ${path}: ${text}`)
  }
  return res.json() as Promise<T>
}

console.log(`${C}${B}━━━ FinEngine × OpenBB Sidecar Test ━━━${R}`)
console.log(`${B}URL:${R} ${OPENBB_URL}\n`)

// ─── 1. Health ────────────────────────────────────────────────────────────────
process.stdout.write('🏥 Health check... ')
try {
  const health = await get<{ status: string; openbb_version: string }>('/health')
  console.log(`${G}${health.status}${R}  OpenBB v${health.openbb_version}`)
} catch (e) {
  console.log(`${RED}FAILED${R}`)
  console.error(e instanceof Error ? e.message : e)
  console.log(`\nStart the sidecar first:\n  ${Y}docker compose --profile openbb up${R}`)
  process.exit(1)
}

// ─── 2. IBOV quote ───────────────────────────────────────────────────────────
process.stdout.write('📊 IBOV quote (^BVSP)... ')
try {
  const res = await get<{ symbol: string; quote: Record<string, unknown> }>('/quote/%5EBVSP')
  const price = res.quote['last_price'] ?? res.quote['close'] ?? '?'
  const changePct = res.quote['change_percent']
  const change = changePct != null ? ` (${Number(changePct) >= 0 ? '+' : ''}${Number(changePct).toFixed(2)}%)` : ''
  console.log(`${G}${Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pts${change}${R}`)
} catch (e) {
  console.log(`${Y}SKIP${R} — ${e instanceof Error ? e.message : e}`)
}

// ─── 3. S&P500 quote ─────────────────────────────────────────────────────────
process.stdout.write('📊 S&P 500 quote (^GSPC)... ')
try {
  const res = await get<{ symbol: string; quote: Record<string, unknown> }>('/quote/%5EGSPC')
  const price = res.quote['last_price'] ?? res.quote['close'] ?? '?'
  console.log(`${G}${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}${R}`)
} catch (e) {
  console.log(`${Y}SKIP${R} — ${e instanceof Error ? e.message : e}`)
}

// ─── 4. USD/BRL FX ───────────────────────────────────────────────────────────
process.stdout.write('💱 USD/BRL FX rate... ')
try {
  const res = await get<{ pair: string; data: Array<{ date: string; close: number }> }>('/fx/USDBRL')
  const latest = res.data.at(-1)
  if (latest) {
    console.log(`${G}R$ ${latest.close.toFixed(4)}${R}  (${latest.date})`)
  } else {
    console.log(`${Y}No data${R}`)
  }
} catch (e) {
  console.log(`${Y}SKIP${R} — ${e instanceof Error ? e.message : e}`)
}

// ─── 5. Portfolio value ──────────────────────────────────────────────────────
process.stdout.write('💼 Portfolio value (PETR4.SA × 100, VALE3.SA × 50)... ')
try {
  const res = await post<{
    totalValue: number
    positions: Array<{ symbol: string; value?: number; error?: string }>
  }>('/portfolio/value', {
    holdings: [
      { symbol: 'PETR4.SA', quantity: 100 },
      { symbol: 'VALE3.SA', quantity: 50 },
    ],
  })
  console.log(`${G}R$ ${res.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${R}`)
  for (const pos of res.positions) {
    if (pos.error) {
      console.log(`  ${Y}${pos.symbol}: ${pos.error}${R}`)
    } else {
      console.log(`  ${pos.symbol}: R$ ${(pos.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    }
  }
} catch (e) {
  console.log(`${Y}SKIP${R} — ${e instanceof Error ? e.message : e}`)
}

// ─── 6. Widgets manifest ─────────────────────────────────────────────────────
process.stdout.write('🧩 Widgets manifest... ')
try {
  const widgets = await get<Array<{ id: string; name: string }>>('/widgets.json')
  console.log(`${G}${widgets.length} widget(s) registered${R}`)
  for (const w of widgets) {
    console.log(`  · ${w.id}: ${w.name}`)
  }
} catch (e) {
  console.log(`${Y}SKIP${R} — ${e instanceof Error ? e.message : e}`)
}

console.log(`\n${G}${B}✓ OpenBB sidecar test complete${R}`)
console.log(`\nTo use with OpenBB Workspace, add a custom backend pointing to:`)
console.log(`  ${C}${OPENBB_URL}/widgets.json${R}`)
