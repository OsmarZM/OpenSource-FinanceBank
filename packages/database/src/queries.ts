import { randomUUID } from 'node:crypto'
import type { Transaction, EngineResult, Insight } from '@fin-engine/types'
import { getClient } from './client'
import type { TransactionInsert, AnalysisSessionInsert, InsightInsert, TransactionSource } from './schema'

// ─── Transactions ─────────────────────────────────────────────────────────────

/**
 * Saves an array of transactions to Supabase.
 * Uses upsert — safe to call multiple times with the same data.
 */
export async function saveTransactions(
  transactions: Transaction[],
  source: TransactionSource = 'manual',
  sessionId?: string,
): Promise<void> {
  const client = getClient()

  const rows: TransactionInsert[] = transactions.map((tx) => ({
    id: tx.id,
    date: tx.date,
    description: tx.description,
    amount: tx.amount,
    type: tx.type,
    category: tx.category ?? null,
    account: tx.account ?? null,
    source,
    session_id: sessionId ?? null,
    metadata: (tx.metadata ?? null) as Record<string, unknown> | null,
  }))

  const { error } = await client.from('transactions').upsert(rows, { onConflict: 'id' })

  if (error) {
    throw new Error(`Failed to save transactions: ${error.message}`)
  }
}

/**
 * Returns all transactions, optionally filtered by session.
 */
export async function getTransactions(sessionId?: string): Promise<Transaction[]> {
  const client = getClient()

  let query = client
    .from('transactions')
    .select('*')
    .order('date', { ascending: true })

  if (sessionId) {
    query = query.eq('session_id', sessionId)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch transactions: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.date,
    description: row.description,
    amount: row.amount,
    type: row.type,
    category: row.category ?? undefined,
    account: row.account ?? undefined,
    metadata: row.metadata ?? undefined,
  }))
}

// ─── Analysis sessions ────────────────────────────────────────────────────────

/**
 * Persists a full analysis result to Supabase.
 * Returns the generated session ID.
 */
export async function saveAnalysisSession(
  result: EngineResult,
  sourceConnector: string,
): Promise<string> {
  const client = getClient()
  const sessionId = randomUUID()

  const session: AnalysisSessionInsert = {
    id: sessionId,
    source_connector: sourceConnector,
    period_from: result.period.from,
    period_to: result.period.to,
    total_income: result.totalIncome,
    total_expenses: result.totalExpenses,
    balance: result.balance,
    savings_rate: result.savingsRate,
    transaction_count: result.transactions.length,
    result_json: result as unknown as Record<string, unknown>,
  }

  const { error: sessionError } = await client
    .from('analysis_sessions')
    .insert(session)

  if (sessionError) {
    throw new Error(`Failed to save analysis session: ${sessionError.message}`)
  }

  // Save individual insights linked to this session
  if (result.insights.length > 0) {
    await saveInsights(result.insights, sessionId)
  }

  return sessionId
}

/**
 * Returns the last N analysis sessions, ordered by most recent.
 */
export async function getAnalysisSessions(limit = 10) {
  const client = getClient()

  const { data, error } = await client
    .from('analysis_sessions')
    .select('id, source_connector, period_from, period_to, total_income, total_expenses, balance, savings_rate, transaction_count, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to fetch analysis sessions: ${error.message}`)
  return data ?? []
}

/**
 * Returns the full EngineResult for a specific session.
 */
export async function getAnalysisSession(sessionId: string): Promise<EngineResult | null> {
  const client = getClient()

  const { data, error } = await client
    .from('analysis_sessions')
    .select('result_json')
    .eq('id', sessionId)
    .single()

  if (error) return null
  return (data?.result_json ?? null) as EngineResult | null
}

// ─── Insights ─────────────────────────────────────────────────────────────────

/**
 * Saves insights linked to an analysis session.
 */
export async function saveInsights(insights: Insight[], sessionId: string): Promise<void> {
  const client = getClient()

  const rows: InsightInsert[] = insights.map((ins) => ({
    id: ins.id,
    session_id: sessionId,
    level: ins.level,
    message: ins.message,
    detail: ins.detail ?? null,
    category: ins.category ?? null,
    value: ins.value ?? null,
    change_pct: ins.change ?? null,
  }))

  const { error } = await client.from('insights').upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(`Failed to save insights: ${error.message}`)
}
