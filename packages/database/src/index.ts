export { getClient, isConfigured, resetClient } from './client'
export type { DbClient } from './client'

export {
  saveTransactions,
  getTransactions,
  saveAnalysisSession,
  getAnalysisSessions,
  getAnalysisSession,
  saveInsights,
} from './queries'

export type {
  Database,
  TransactionRow,
  AnalysisSessionRow,
  InsightRow,
  TransactionInsert,
  AnalysisSessionInsert,
  InsightInsert,
  TransactionSource,
  InsightLevel,
} from './schema'
