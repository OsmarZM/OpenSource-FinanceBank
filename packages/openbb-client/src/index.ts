/**
 * @fin-engine/openbb-client
 *
 * Typed HTTP client for the FinEngine OpenBB market data sidecar.
 * Reads OPENBB_URL from environment (default: http://localhost:8001).
 *
 * All methods throw on HTTP errors (4xx/5xx).
 */

// ─── Response types ───────────────────────────────────────────────────────────

export interface QuoteData {
  symbol: string
  last_price?: number
  close?: number
  open?: number
  high?: number
  low?: number
  volume?: number
  prev_close?: number
  change?: number
  change_percent?: number
  [key: string]: unknown
}

export interface QuoteResult {
  symbol: string
  quote: QuoteData
}

export interface OHLCVBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface HistoricalResult {
  symbol: string
  from: string
  to: string
  data: OHLCVBar[]
}

export interface IndexResult {
  index: string
  from: string
  to: string
  data: OHLCVBar[]
}

export interface FxResult {
  pair: string
  from: string
  to: string
  data: OHLCVBar[]
}

export interface NewsItem {
  date?: string
  title?: string
  text?: string
  url?: string
  source?: string
  [key: string]: unknown
}

export interface NewsResult {
  symbol: string
  news: NewsItem[]
}

export interface Holding {
  symbol: string
  quantity: number
}

export interface Position {
  symbol: string
  quantity: number
  lastPrice?: number
  value?: number
  error?: string
}

export interface PortfolioValueResult {
  totalValue: number
  positions: Position[]
}

export interface HealthResult {
  status: string
  openbb_version: string
}

// ─── Client ───────────────────────────────────────────────────────────────────

export class OpenBBClient {
  private readonly baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl =
      (baseUrl ?? process.env['OPENBB_URL'] ?? 'http://localhost:8001').replace(/\/$/, '')
  }

  private async _get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`)
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(`OpenBB sidecar ${res.status} GET ${path}: ${text}`)
    }
    return res.json() as Promise<T>
  }

  private async _post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(`OpenBB sidecar ${res.status} POST ${path}: ${text}`)
    }
    return res.json() as Promise<T>
  }

  // ── Market data ────────────────────────────────────────────────────────────

  /** Real-time quote for a symbol (e.g. "PETR4.SA", "AAPL") */
  getQuote(symbol: string): Promise<QuoteResult> {
    return this._get(`/quote/${encodeURIComponent(symbol)}`)
  }

  /**
   * OHLCV historical prices.
   * @param symbol   Ticker (e.g. "PETR4.SA")
   * @param from     ISO 8601 date string (default: 90 days ago)
   * @param to       ISO 8601 date string (default: today)
   * @param interval Bar interval: "1d" | "1h" | "1wk" (default: "1d")
   */
  getHistorical(
    symbol: string,
    from?: string,
    to?: string,
    interval = '1d',
  ): Promise<HistoricalResult> {
    const params = new URLSearchParams({ interval })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return this._get(`/historical/${encodeURIComponent(symbol)}?${params}`)
  }

  /**
   * Market index price history.
   * Common: "^BVSP" (IBOV), "^GSPC" (S&P500), "^DJI", "^IXIC" (NASDAQ)
   */
  getIndex(name: string, from?: string, to?: string): Promise<IndexResult> {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return this._get(`/index/${encodeURIComponent(name)}?${params}`)
  }

  /**
   * FX pair history.
   * Examples: "USDBRL", "EURBRL", "EURUSD"
   */
  getFx(pair: string, from?: string, to?: string): Promise<FxResult> {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return this._get(`/fx/${encodeURIComponent(pair)}?${params}`)
  }

  /** Recent news for a symbol */
  getNews(symbol: string, limit = 10): Promise<NewsResult> {
    return this._get(`/news/${encodeURIComponent(symbol)}?limit=${limit}`)
  }

  /** Calculate current market value of a portfolio */
  getPortfolioValue(holdings: Holding[]): Promise<PortfolioValueResult> {
    return this._post('/portfolio/value', { holdings })
  }

  // ── Health ─────────────────────────────────────────────────────────────────

  health(): Promise<HealthResult> {
    return this._get('/health')
  }
}

/** Default singleton client — reads OPENBB_URL from env */
export const openbbClient = new OpenBBClient()
