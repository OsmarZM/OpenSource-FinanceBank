import type { Transaction, Category } from './types'

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

function makeTx(date: Date, description: string, amount: number, category: Category): Transaction {
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

export function generateMockTransactions(): Transaction[] {
  seq = 0
  const txs: Transaction[] = []

  for (let month = 0; month < 3; month++) {
    const d = new Date()
    d.setDate(5)
    d.setMonth(d.getMonth() - month)
    txs.push(makeTx(d, 'Salário — Empresa XYZ', 8_000, 'income'))
  }

  txs.push(makeTx(dateOffset(45), 'Freelance — Projeto Web', 1_500, 'income'))
  txs.push(makeTx(dateOffset(12), 'Freelance — Consultoria', 800, 'income'))

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
    for (let i = 0; i < monthlyBills.length; i++) {
      const [desc, amount, cat] = monthlyBills[i]
      const d = new Date()
      d.setDate(10 + i)
      d.setMonth(d.getMonth() - month)
      txs.push(makeTx(d, desc, amount, cat))
    }
  }

  const supermarkets = [
    'Supermercado Pão de Açúcar',
    'Carrefour',
    'Extra Supermercados',
    'Mercado Municipal',
    'Atacadão',
  ]
  for (let week = 0; week < 4; week++) {
    txs.push(makeTx(dateOffset(90 - week * 7), supermarkets[week % supermarkets.length], -(260 + Math.round(Math.random() * 50)), 'food'))
  }
  for (let week = 0; week < 4; week++) {
    txs.push(makeTx(dateOffset(60 - week * 7), supermarkets[(week + 2) % supermarkets.length], -(280 + Math.round(Math.random() * 50)), 'food'))
  }
  for (let week = 0; week < 4; week++) {
    txs.push(makeTx(dateOffset(28 - week * 7), supermarkets[week % supermarkets.length], -(360 + Math.round(Math.random() * 60)), 'food'))
  }

  const deliveryApps = ['iFood', 'iFood — Restaurante Sabor', 'Rappi', 'iFood — Pizza Hut']
  for (let i = 0; i < 24; i++) {
    const daysBack = Math.floor(Math.random() * 90)
    const amount = daysBack < 30 ? -(55 + Math.round(Math.random() * 45)) : -(30 + Math.round(Math.random() * 25))
    txs.push(makeTx(dateOffset(daysBack), deliveryApps[i % deliveryApps.length], amount, 'food'))
  }

  const restaurants = ['Restaurante do Zé', 'Sushi Osaka', 'Churrascaria Gaúcha', 'Café Central', 'Padaria São Paulo', 'Subway']
  for (let i = 0; i < 12; i++) {
    txs.push(makeTx(dateOffset(Math.floor(Math.random() * 90)), restaurants[i % restaurants.length], -(35 + Math.round(Math.random() * 80)), 'food'))
  }

  for (let i = 0; i < 20; i++) {
    const isUber = Math.random() > 0.3
    txs.push(makeTx(dateOffset(Math.floor(Math.random() * 90)), isUber ? 'Uber' : '99 Taxi', -(15 + Math.round(Math.random() * 40)), 'transport'))
  }
  for (let i = 0; i < 6; i++) {
    txs.push(makeTx(dateOffset(15 * i), 'Posto Ipiranga', -(150 + Math.round(Math.random() * 60)), 'transport'))
  }

  for (let i = 0; i < 5; i++) {
    txs.push(makeTx(dateOffset(Math.floor(Math.random() * 90)), 'Drogasil', -(25 + Math.round(Math.random() * 80)), 'health'))
  }

  txs.push(makeTx(dateOffset(72), 'Renner — Roupas', -220, 'shopping'))
  txs.push(makeTx(dateOffset(38), 'Americanas', -89, 'shopping'))
  txs.push(makeTx(dateOffset(15), 'Lojas Marisa', -145, 'shopping'))
  txs.push(makeTx(dateOffset(5), 'Amazon — Eletrônicos', -450, 'shopping'))

  txs.push(makeTx(dateOffset(55), 'Cinema Cinemark', -48, 'entertainment'))
  txs.push(makeTx(dateOffset(33), 'Show — Ticket Master', -180, 'entertainment'))
  txs.push(makeTx(dateOffset(10), 'Ingresso.com', -65, 'entertainment'))

  txs.push(makeTx(dateOffset(80), 'Tesouro Direto — Aplicação', -500, 'investment'))
  txs.push(makeTx(dateOffset(50), 'Tesouro Direto — Aplicação', -500, 'investment'))
  txs.push(makeTx(dateOffset(20), 'Tesouro Direto — Aplicação', -500, 'investment'))
  txs.push(makeTx(dateOffset(80), 'CDB Nubank — Aplicação', -1_000, 'investment'))
  txs.push(makeTx(dateOffset(50), 'CDB Nubank — Aplicação', -1_000, 'investment'))

  return txs.sort((a, b) => a.date.localeCompare(b.date))
}
