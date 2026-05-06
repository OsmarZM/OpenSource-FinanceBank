/**
 * @fin-engine/agents-client
 *
 * HTTP client for the FinEngine agents sidecar (services/agents FastAPI server).
 * Reads AGENTS_URL from environment (default: http://localhost:8000).
 *
 * The agents sidecar wraps Claude Haiku 4.5 via AWS Bedrock and returns
 * LLM-generated financial insights from an EngineResult payload.
 */
import type { Insight } from '@fin-engine/types'

export type { Insight }

export interface EngineResultPayload {
  period?: { from: string; to: string; days?: number }
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  byCategory: Array<{ category: string; total: number; percentage: number; count: number }>
  transactions?: unknown[]
  patterns?: unknown[]
  insights?: unknown[]
  monthly?: unknown[]
}

export interface AgentsUsageStats {
  input_tokens: number
  output_tokens: number
  total_tokens: number
  estimated_cost_usd: number
  model: string
}

export interface AgentsAnalyzeResponse {
  insights: Insight[]
  provider: string
  model: string
  /** Token usage and estimated cost — only present when LLM_PROVIDER=bedrock */
  usage?: AgentsUsageStats
}

export interface AgentsHealthResponse {
  status: string
  provider: string
  model: string
  llm_provider_env: string
}

export class AgentsClient {
  private readonly baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl =
      (baseUrl ?? process.env['AGENTS_URL'] ?? 'http://localhost:8000').replace(/\/$/, '')
  }

  /**
   * Generate LLM-powered insights from a FinEngine EngineResult.
   * Requires LLM_PROVIDER=bedrock in the sidecar's environment.
   * Returns empty insights array if provider is 'none'.
   */
  async analyze(payload: EngineResultPayload): Promise<AgentsAnalyzeResponse> {
    const res = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(`Agents sidecar error (${res.status}): ${text}`)
    }

    return res.json() as Promise<AgentsAnalyzeResponse>
  }

  /** Health check — also returns current provider and model. */
  async health(): Promise<AgentsHealthResponse> {
    const res = await fetch(`${this.baseUrl}/health`)
    if (!res.ok) {
      throw new Error(`Agents sidecar unreachable (${res.status})`)
    }
    return res.json() as Promise<AgentsHealthResponse>
  }
}

/** Default singleton — reads AGENTS_URL from env */
export const agentsClient = new AgentsClient()
