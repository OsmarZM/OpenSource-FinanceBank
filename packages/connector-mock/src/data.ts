import type { Transaction, Category } from '@fin-engine/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

let seq = 0

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function dateOffset(daysBack: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - daysBack)
  return d
}

function makeTx(
  date: Date,
  description: string,
  amount: number,
  category: Category,
): Transaction {
  seq++
  return {
    id: `mock-${String(seq).padStart(4, '0')}`,
    date: formatDate(date),
    description,
    amount,
    type: amount >= 0 ? 'credit' : 'debit',
    category,
  }
}

// ─── Data generation ────────────────────────────────────────────────────────

/**
 * Generates ~180 realistic Brazilian financial transactions for the last 90 days.
 * Contains a deliberate pattern: food spending increases ~35% in the last 30 days
 * compared to the first 30 days, making the pattern detector more interesting.
 */
export function generateMockTransactions(): Transaction[] {
  seq = 0
  const txs: Transaction[] = []

  // ── Monthly salary (day 5 of each month, last 3 months) ────────────────
  for (let month = 0; month < 3; month++) {
    const d = new Date()
    d.setDate(5)
    d.setMonth(d.getMonth() - month)
    txs.push(makeTx(d, 'Salário — Empresa XYZ', 8_000, 'income'))
  }

  // ── Freelance income (random months) ───────────────────────────────────
  txs.push(makeTx(dateOffset(45), 'Freelance — Projeto Web', 1_500, 'income'))
  txs.push(makeTx(dateOffset(12), 'Freelance — Consultoria', 800, 'income'))

  // ── Fixed monthly bills (repeated 3×) ──────────────────────────────────
  const monthlyBills: Array<[string, number, Category]> = [
    ['Aluguel', -2_500, 'housing'],
    ['Condomínio', -500, 'housing'],
    ['Internet Vivo Fibra', -120, 'utilities'],
    ['Energia Elétrica CEMIG', -180, 'utilities'],
    ['Água SABESP', -65, 'utilities'],
    ['Netflix', -55.9, 'subscription'],
    ['Spotify', -21.9, 'subscription'],
    ['Amazon Prime', -19.9, 'subscription'],
    ['Academia SmartFit', -99.9, 'health'],
    ['Plano de Saúde Amil', -350, 'health'],
  ]

  for (let month = 0; month < 3; month++) {
    for (const [desc, amount, cat] of monthlyBills) {
      const d = new Date()
      d.setDate(10)
      d.setMonth(d.getMonth() - month)
      // Spread bills over a few days to look realistic
      d.setDate(d.getDate() + monthlyBills.indexOf([desc, amount, cat] as typeof monthlyBills[0]))
      txs.push(makeTx(d, desc, amount, cat))
    }
  }

  // ── Weekly grocery shopping ─────────────────────────────────────────────
  const supermarkets = [
    'Supermercado Pão de Açúcar',
    'Carrefour',
    'Extra Supermercados',
    'Mercado Municipal',
    'Atacadão',
  ]
  // Month 1 (days 61–90): baseline ~R$280/week
  for (let week = 0; week < 4; week++) {
    const daysBack = 90 - week * 7
    const amount = -(260 + Math.round(Math.random() * 50))
    txs.push(makeTx(dateOffset(daysBack), supermarkets[week % supermarkets.length], amount, 'food'))
  }
  // Month 2 (days 31–60): slightly up ~R$300/week
  for (let week = 0; week < 4; week++) {
    const daysBack = 60 - week * 7
    const amount = -(280 + Math.round(Math.random() * 50))
    txs.push(makeTx(dateOffset(daysBack), supermarkets[(week + 2) % supermarkets.length], amount, 'food'))
  }
  // Month 3 (last 30 days): noticeably up ~R$380/week (35% increase)
  for (let week = 0; week < 4; week++) {
    const daysBack = 28 - week * 7
    const amount = -(360 + Math.round(Math.random() * 60))
    txs.push(makeTx(dateOffset(daysBack), supermarkets[week % supermarkets.length], amount, 'food'))
  }

  // ── iFood / delivery (frequent, last 90 days) ──────────────────────────
  const deliveryApps = ['iFood', 'iFood — Restaurante Sabor', 'Rappi', 'iFood — Pizza Hut']
  for (let i = 0; i < 24; i++) {
    const daysBack = Math.floor(Math.random() * 90)
    // Last 30 days: higher frequency and value (pattern reinforcement)
    const amount = daysBack < 30
      ? -(55 + Math.round(Math.random() * 45))
      : -(30 + Math.round(Math.random() * 25))
    txs.push(makeTx(dateOffset(daysBack), deliveryApps[i % deliveryApps.length], amount, 'food'))
  }

  // ── Restaurants ─────────────────────────────────────────────────────────
  const restaurants = [
    'Restaurante do Zé',
    'Sushi Osaka',
    'Churrascaria Gaúcha',
    'Café Central',
    'Padaria São Paulo',
    'Subway',
  ]
  for (let i = 0; i < 12; i++) {
    const daysBack = Math.floor(Math.random() * 90)
    const amount = -(35 + Math.round(Math.random() * 80))
    txs.push(makeTx(dateOffset(daysBack), restaurants[i % restaurants.length], amount, 'food'))
  }

  // ── Transport ───────────────────────────────────────────────────────────
  for (let i = 0; i < 20; i++) {
    const daysBack = Math.floor(Math.random() * 90)
    const isUber = Math.random() > 0.3
    txs.push(makeTx(
      dateOffset(daysBack),
      isUber ? 'Uber' : '99 Taxi',
      -(15 + Math.round(Math.random() * 40)),
      'transport',
    ))
  }
  // Fuel
  for (let i = 0; i < 6; i++) {
    const daysBack = 15 * i
    txs.push(makeTx(dateOffset(daysBack), 'Posto Ipiranga', -(150 + Math.round(Math.random() * 60)), 'transport'))
  }

  // ── Pharmacy / Health ────────────────────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    const daysBack = Math.floor(Math.random() * 90)
    txs.push(makeTx(dateOffset(daysBack), 'Drogasil', -(25 + Math.round(Math.random() * 80)), 'health'))
  }

  // ── Shopping ─────────────────────────────────────────────────────────────
  txs.push(makeTx(dateOffset(72), 'Renner — Roupas', -220, 'shopping'))
  txs.push(makeTx(dateOffset(38), 'Americanas', -89, 'shopping'))
  txs.push(makeTx(dateOffset(15), 'Lojas Marisa', -145, 'shopping'))
  txs.push(makeTx(dateOffset(5), 'Amazon — Eletrônicos', -450, 'shopping'))

  // ── Entertainment ────────────────────────────────────────────────────────
  txs.push(makeTx(dateOffset(55), 'Cinema Cinemark', -48, 'entertainment'))
  txs.push(makeTx(dateOffset(33), 'Show — Ticket Master', -180, 'entertainment'))
  txs.push(makeTx(dateOffset(10), 'Ingresso.com', -65, 'entertainment'))

  // ── Investment ───────────────────────────────────────────────────────────
  txs.push(makeTx(dateOffset(80), 'Tesouro Direto — Aplicação', -500, 'investment'))
  txs.push(makeTx(dateOffset(50), 'Tesouro Direto — Aplicação', -500, 'investment'))
  txs.push(makeTx(dateOffset(20), 'Tesouro Direto — Aplicação', -500, 'investment'))
  txs.push(makeTx(dateOffset(80), 'CDB Nubank — Aplicação', -1_000, 'investment'))
  txs.push(makeTx(dateOffset(50), 'CDB Nubank — Aplicação', -1_000, 'investment'))

  // Sort by date ascending
  return txs.sort((a, b) => a.date.localeCompare(b.date))
}
