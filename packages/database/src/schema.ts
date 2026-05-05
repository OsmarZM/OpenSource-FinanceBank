/**
 * Supabase Database Schema Types
 *
 * These types mirror the tables defined in migrations/001_initial.sql.
 * Regenerate with: `npx supabase gen types typescript --local > src/schema.ts`
 */

export type TransactionSource = 'csv' | 'pluggy' | 'mock' | 'manual'
export type InsightLevel = 'info' | 'success' | 'warning' | 'danger'
export type TransactionType = 'credit' | 'debit'

// ─── Table row types ─────────────────────────────────────────────────────────

export interface TransactionRow {
  id: string
  date: string
  description: string
  amount: number
  type: TransactionType
  category: string | null
  account: string | null
  source: TransactionSource
  session_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface AnalysisSessionRow {
  id: string
  source_connector: string
  period_from: string
  period_to: string
  total_income: number
  total_expenses: number
  balance: number
  savings_rate: number
  transaction_count: number
  result_json: Record<string, unknown> | null
  created_at: string
}

export interface InsightRow {
  id: string
  session_id: string | null
  level: InsightLevel
  message: string
  detail: string | null
  category: string | null
  value: number | null
  change_pct: number | null
  created_at: string
}

// ─── Insert types (subset of row types for inserts) ───────────────────────────

export type TransactionInsert = Omit<TransactionRow, 'created_at'>
export type AnalysisSessionInsert = Omit<AnalysisSessionRow, 'created_at'>
export type InsightInsert = Omit<InsightRow, 'created_at'>

// ─── Supabase Database type (used with createClient<Database>) ────────────────

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: TransactionRow
        Insert: TransactionInsert
        Update: Partial<TransactionInsert>
      }
      analysis_sessions: {
        Row: AnalysisSessionRow
        Insert: AnalysisSessionInsert
        Update: Partial<AnalysisSessionInsert>
      }
      insights: {
        Row: InsightRow
        Insert: InsightInsert
        Update: Partial<InsightInsert>
      }
    }
  }
}
