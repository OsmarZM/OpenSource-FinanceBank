/**
 * Core financial data types for FinEngine OSS
 */

export type Category =
  | 'food'
  | 'transport'
  | 'housing'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'income'
  | 'investment'
  | 'transfer'
  | 'subscription'
  | 'utilities'
  | 'other'

export interface Transaction {
  /** Unique identifier */
  id: string
  /** ISO 8601 date: YYYY-MM-DD */
  date: string
  /** Transaction description or merchant name */
  description: string
  /** Amount: positive = credit/income, negative = debit/expense */
  amount: number
  type: 'credit' | 'debit'
  category?: Category | string
  account?: string
  metadata?: Record<string, unknown>
}

export interface Period {
  from: string
  to: string
}

export interface CategoryBreakdown {
  category: Category | string
  total: number
  count: number
  percentage: number
}

export interface Pattern {
  id: string
  type: 'trend_up' | 'trend_down' | 'spike' | 'recurring' | 'low_savings' | 'high_spend'
  label: string
  description: string
  category?: Category | string
  /** Percentage change as decimal (e.g., 0.35 = 35% increase) */
  change?: number
  value?: number
}

export interface EngineResult {
  period: Period
  totalIncome: number
  totalExpenses: number
  balance: number
  /** Savings rate as fraction (0–1) */
  savingsRate: number
  byCategory: CategoryBreakdown[]
  transactions: Transaction[]
  patterns: Pattern[]
  insights: Insight[]
}

export interface Insight {
  id: string
  level: 'info' | 'success' | 'warning' | 'danger'
  message: string
  detail?: string
  category?: Category | string
  value?: number
  change?: number
}

export interface Connector {
  readonly name: string
  connect(): Promise<void>
  getTransactions(): Promise<Transaction[]>
}
