import { BaseConnector } from '@fin-engine/connectors-base'
import type { Transaction } from '@fin-engine/types'
import { pluggyToCategory } from './categories.js'

export { pluggyToCategory } from './categories.js'

const PLUGGY_API_BASE = 'https://api.pluggy.ai'

export interface PluggyConnectorOptions {
  clientId: string
  clientSecret: string
  /**
   * The Item ID to fetch transactions from.
   * If not provided, the first item from GET /items is used automatically.
   */
  itemId?: string
  /** ISO 8601 date string — defaults to 90 days ago */
  dateFrom?: string
  /** ISO 8601 date string — defaults to today */
  dateTo?: string
}

export interface PluggyItem {
  id: string
  status: string
  connector?: { name: string }
}

// ---------------------------------------------------------------------------
// Raw Pluggy API response shapes (minimal, only fields we consume)
// ---------------------------------------------------------------------------

interface PluggyAccount {
  id: string
  name: string
  type: string
  number: string | null
}

interface PluggyTransaction {
  id: string
  date: string           // ISO 8601
  description: string
  amount: number         // always positive from Pluggy
  type: 'CREDIT' | 'DEBIT'
  category: string | null
  accountId: string
  balance?: number
  currencyCode?: string
}

interface PluggyAccountsResponse {
  total: number
  results: PluggyAccount[]
}

interface PluggyTransactionsResponse {
  total: number
  totalPages: number
  page: number
  results: PluggyTransaction[]
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------

export class PluggyConnector extends BaseConnector {
  readonly name = 'pluggy'

  private apiKey: string | null = null

  constructor(private options: PluggyConnectorOptions) {
    super()
  }

  /**
   * Authenticates with Pluggy and stores the short-lived API key.
   * Must be called before getTransactions().
   */
  async connect(): Promise<void> {
    const res = await fetch(`${PLUGGY_API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: this.options.clientId,
        clientSecret: this.options.clientSecret,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(`Pluggy auth failed (${res.status}): ${text}`)
    }

    const data = (await res.json()) as { apiKey: string }
    this.apiKey = data.apiKey
  }

  /**
   * Lists all Items (bank connections) for this client.
   * Requires connect() to have been called first.
   */
  async listItems(): Promise<PluggyItem[]> {
    if (!this.apiKey) {
      throw new Error('PluggyConnector: call connect() before listItems()')
    }
    const data = await this._fetch<{ total: number; results: PluggyItem[] }>('/items')
    return data.results
  }

  /**
   * Fetches all accounts for the configured Item, then retrieves all
   * transactions (paginated) for each account, and normalizes them to
   * the FinEngine Transaction shape.
   *
   * If itemId was not provided in options, auto-discovers the first available item.
   */
  async getTransactions(): Promise<Transaction[]> {
    if (!this.apiKey) {
      throw new Error('PluggyConnector: call connect() before getTransactions()')
    }

    // Auto-discover itemId if not set
    if (!this.options.itemId) {
      const items = await this.listItems()
      if (!items.length) {
        throw new Error('Pluggy: no items found for this client — connect a bank account first')
      }
      this.options = { ...this.options, itemId: items[0]!.id }
    }

    const dateFrom = this.options.dateFrom ?? this._daysAgo(90)
    const dateTo = this.options.dateTo ?? this._today()

    const accounts = await this._getAccounts()
    const all: Transaction[] = []

    for (const account of accounts) {
      const txs = await this._getAccountTransactions(account.id, dateFrom, dateTo)
      all.push(...txs)
    }

    return all.sort((a, b) => a.date.localeCompare(b.date))
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async _getAccounts(): Promise<PluggyAccount[]> {
    const res = await this._fetch<PluggyAccountsResponse>(
      `/accounts?itemId=${this.options.itemId}`,
    )
    return res.results
  }

  private async _getAccountTransactions(
    accountId: string,
    from: string,
    to: string,
  ): Promise<Transaction[]> {
    const results: Transaction[] = []
    let page = 1

    do {
      const url =
        `/transactions?accountId=${accountId}` +
        `&from=${from}&to=${to}&pageSize=100&page=${page}`

      const data = await this._fetch<PluggyTransactionsResponse>(url)

      for (const raw of data.results) {
        results.push(this._normalize(raw))
      }

      if (page >= data.totalPages) break
      page++
    } while (true) // eslint-disable-line no-constant-condition

    return results
  }

  private _normalize(raw: PluggyTransaction): Transaction {
    // Pluggy always returns positive amounts — DEBIT means money leaving the account
    const amount = raw.type === 'DEBIT' ? -Math.abs(raw.amount) : Math.abs(raw.amount)

    return {
      id: `pluggy-${raw.id}`,
      date: raw.date.slice(0, 10), // trim time portion
      description: raw.description,
      amount,
      type: raw.type === 'CREDIT' ? 'credit' : 'debit',
      category: pluggyToCategory(raw.category),
      account: raw.accountId,
      metadata: {
        pluggyId: raw.id,
        pluggyCategory: raw.category,
        balance: raw.balance,
        currencyCode: raw.currencyCode ?? 'BRL',
      },
    }
  }

  private async _fetch<T>(path: string): Promise<T> {
    const res = await fetch(`${PLUGGY_API_BASE}${path}`, {
      headers: { 'X-API-KEY': this.apiKey! },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(`Pluggy API error ${res.status} ${path}: ${text}`)
    }

    return res.json() as Promise<T>
  }

  private _today(): string {
    return new Date().toISOString().slice(0, 10)
  }

  private _daysAgo(n: number): string {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().slice(0, 10)
  }
}
