/**
 * Core financial data types — embedded from @fin-engine/types
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
  id: string
  date: string
  description: string
  /** positive = credit/income, negative = debit/expense */
  amount: number
  type: 'credit' | 'debit'
  category?: Category | string
  account?: string
  metadata?: Record<string, unknown>
}

export interface Period {
  from: string
  to: string
  days?: number
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
  change?: number
  value?: number
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

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  balance: number
  byCategory: Record<string, number>
}

export interface EngineResult {
  period: Period
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  byCategory: CategoryBreakdown[]
  transactions: Transaction[]
  patterns: Pattern[]
  insights: Insight[]
  monthly: MonthlyData[]
}
