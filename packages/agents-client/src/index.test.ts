import { describe, it, expect, vi } from 'vitest'
import { AgentsClient } from './index.js'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const MOCK_ENGINE_RESULT = {
  period: { from: '2026-02-01', to: '2026-04-30', days: 89 },
  totalIncome: 10300,
  totalExpenses: 9850,
  balance: 450,
  savingsRate: 0.0437,
  byCategory: [
    { category: 'housing', total: 3000, percentage: 30.5, count: 6 },
    { category: 'food', total: 2400, percentage: 24.4, count: 45 },
  ],
  patterns: [],
  monthly: [],
}

const MOCK_INSIGHTS_RESPONSE = {
  insights: [
    { id: 'llm-abc123', level: 'warning', message: 'Taxa de poupança muito baixa: 4.4%', detail: 'Tente reduzir gastos com alimentação.' },
    { id: 'llm-def456', level: 'danger', message: 'Gastos com moradia em 30.5% das despesas', detail: 'Considera renegociar o aluguel.' },
  ],
  provider: 'bedrock',
  model: 'anthropic.claude-haiku-4-5-20251022-v1:0',
}

describe('AgentsClient', () => {
  it('calls POST /analyze with the engine result', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_INSIGHTS_RESPONSE),
    })

    const client = new AgentsClient('http://localhost:8000')
    const result = await client.analyze(MOCK_ENGINE_RESULT)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/analyze',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result.insights).toHaveLength(2)
    expect(result.provider).toBe('bedrock')
    expect(result.model).toContain('haiku')
  })

  it('returns insights with expected shape', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_INSIGHTS_RESPONSE),
    })

    const client = new AgentsClient('http://localhost:8000')
    const result = await client.analyze(MOCK_ENGINE_RESULT)

    for (const insight of result.insights) {
      expect(insight).toHaveProperty('id')
      expect(insight).toHaveProperty('level')
      expect(insight).toHaveProperty('message')
      expect(['info', 'success', 'warning', 'danger']).toContain(insight.level)
    }
  })

  it('handles empty insights (provider=none)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ insights: [], provider: 'none', model: '' }),
    })

    const client = new AgentsClient('http://localhost:8000')
    const result = await client.analyze(MOCK_ENGINE_RESULT)

    expect(result.insights).toHaveLength(0)
    expect(result.provider).toBe('none')
  })

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
      statusText: 'Internal Server Error',
    })

    const client = new AgentsClient('http://localhost:8000')
    await expect(client.analyze(MOCK_ENGINE_RESULT)).rejects.toThrow('500')
  })

  it('throws on network error', async () => {
    mockFetch.mockRejectedValue(new TypeError('fetch failed'))

    const client = new AgentsClient('http://localhost:8000')
    await expect(client.analyze(MOCK_ENGINE_RESULT)).rejects.toThrow('fetch failed')
  })

  it('calls GET /health', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok', provider: 'bedrock', model: 'anthropic.claude-haiku-4-5-20251022-v1:0', llm_provider_env: 'bedrock' }),
    })

    const client = new AgentsClient('http://localhost:8000')
    const h = await client.health()

    expect(h.status).toBe('ok')
    expect(h.provider).toBe('bedrock')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/health')
  })
})
