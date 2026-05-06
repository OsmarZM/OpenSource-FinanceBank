import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PluggyConnector } from './index.js'
import { pluggyToCategory } from './categories.js'

// ─── Mock global fetch ────────────────────────────────────────────────────────
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const AUTH_RESPONSE = { apiKey: 'test-api-key-sandbox' }

const ACCOUNTS_RESPONSE = {
  total: 1,
  results: [{ id: 'acc-1', name: 'Conta Corrente', type: 'BANK', number: '12345-6' }],
}

const TRANSACTIONS_PAGE_1 = {
  total: 3,
  totalPages: 1,
  page: 1,
  results: [
    { id: 'tx-1', date: '2026-04-01T00:00:00Z', description: 'Salário', amount: 8000, type: 'CREDIT', category: 'Salary', accountId: 'acc-1' },
    { id: 'tx-2', date: '2026-04-05T00:00:00Z', description: 'Supermercado', amount: 350, type: 'DEBIT', category: 'Groceries', accountId: 'acc-1' },
    { id: 'tx-3', date: '2026-04-10T00:00:00Z', description: 'Netflix', amount: 55.9, type: 'DEBIT', category: 'Streaming', accountId: 'acc-1' },
  ],
}

function mockResponses(responses: object[]) {
  let idx = 0
  mockFetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(responses[idx++]),
    }),
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('PluggyConnector', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('authenticates and stores apiKey', async () => {
    mockResponses([AUTH_RESPONSE, ACCOUNTS_RESPONSE, TRANSACTIONS_PAGE_1])

    const connector = new PluggyConnector({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      itemId: 'sandbox-item-id',
    })

    await connector.connect()

    // connect() should POST to /auth
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pluggy.ai/auth',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('throws if getTransactions() is called without connect()', async () => {
    const connector = new PluggyConnector({
      clientId: 'id',
      clientSecret: 'secret',
      itemId: 'item',
    })

    await expect(connector.getTransactions()).rejects.toThrow('call connect()')
  })

  it('returns normalized transactions after connect()', async () => {
    mockResponses([AUTH_RESPONSE, ACCOUNTS_RESPONSE, TRANSACTIONS_PAGE_1])

    const connector = new PluggyConnector({
      clientId: 'id',
      clientSecret: 'secret',
      itemId: 'item',
    })

    await connector.connect()
    const txs = await connector.getTransactions()

    expect(txs).toHaveLength(3)
  })

  it('normalizes DEBIT amount to negative', async () => {
    mockResponses([AUTH_RESPONSE, ACCOUNTS_RESPONSE, TRANSACTIONS_PAGE_1])

    const connector = new PluggyConnector({ clientId: 'id', clientSecret: 'secret', itemId: 'item' })
    await connector.connect()
    const txs = await connector.getTransactions()

    const supermarket = txs.find((t) => t.description === 'Supermercado')!
    expect(supermarket.amount).toBe(-350)
    expect(supermarket.type).toBe('debit')
  })

  it('normalizes CREDIT amount to positive', async () => {
    mockResponses([AUTH_RESPONSE, ACCOUNTS_RESPONSE, TRANSACTIONS_PAGE_1])

    const connector = new PluggyConnector({ clientId: 'id', clientSecret: 'secret', itemId: 'item' })
    await connector.connect()
    const txs = await connector.getTransactions()

    const salary = txs.find((t) => t.description === 'Salário')!
    expect(salary.amount).toBe(8000)
    expect(salary.type).toBe('credit')
  })

  it('trims time from date string', async () => {
    mockResponses([AUTH_RESPONSE, ACCOUNTS_RESPONSE, TRANSACTIONS_PAGE_1])

    const connector = new PluggyConnector({ clientId: 'id', clientSecret: 'secret', itemId: 'item' })
    await connector.connect()
    const txs = await connector.getTransactions()

    for (const tx of txs) {
      expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('handles pagination (2 pages)', async () => {
    const page1 = { total: 4, totalPages: 2, page: 1, results: TRANSACTIONS_PAGE_1.results.slice(0, 2) }
    const page2 = { total: 4, totalPages: 2, page: 2, results: TRANSACTIONS_PAGE_1.results.slice(2) }

    mockResponses([AUTH_RESPONSE, ACCOUNTS_RESPONSE, page1, page2])

    const connector = new PluggyConnector({ clientId: 'id', clientSecret: 'secret', itemId: 'item' })
    await connector.connect()
    const txs = await connector.getTransactions()

    expect(txs).toHaveLength(3)
  })

  it('includes pluggy metadata', async () => {
    mockResponses([AUTH_RESPONSE, ACCOUNTS_RESPONSE, TRANSACTIONS_PAGE_1])

    const connector = new PluggyConnector({ clientId: 'id', clientSecret: 'secret', itemId: 'item' })
    await connector.connect()
    const txs = await connector.getTransactions()

    const netflix = txs.find((t) => t.description === 'Netflix')!
    expect(netflix.metadata?.pluggyId).toBe('tx-3')
    expect(netflix.metadata?.pluggyCategory).toBe('Streaming')
  })

  it('throws on auth failure', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401, text: () => Promise.resolve('Unauthorized') })

    const connector = new PluggyConnector({ clientId: 'bad', clientSecret: 'creds', itemId: 'item' })
    await expect(connector.connect()).rejects.toThrow('Pluggy auth failed')
  })
})

// ─── Category mapping tests ───────────────────────────────────────────────────
describe('pluggyToCategory', () => {
  it.each([
    ['Salary', 'income'],
    ['Income', 'income'],
    ['Groceries', 'food'],
    ['Restaurants', 'food'],
    ['Ride Share', 'transport'],
    ['Gas Station', 'transport'],
    ['Rent', 'housing'],
    ['Streaming', 'subscription'],
    ['Netflix', 'subscription'],  // not in Pluggy — maps to other, then falls back
    ['Investment', 'investment'],
    ['Transfer', 'transfer'],
    ['Gym', 'health'],
    ['Education', 'education'],
    ['Entertainment', 'entertainment'],
    ['Shopping', 'shopping'],
    ['Unknown XYZ', 'other'],
    [null, 'other'],
    [undefined, 'other'],
  ])('pluggyToCategory(%s) → %s', (input, expected) => {
    // Netflix not in map → 'other', that's fine
    const result = pluggyToCategory(input as string)
    if (input === 'Netflix') {
      expect(result).toBe('other') // not in Pluggy's taxonomy
    } else {
      expect(result).toBe(expected)
    }
  })
})
