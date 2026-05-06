import { NextRequest, NextResponse } from 'next/server'
import { AgentsClient } from '@fin-engine/agents-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AGENTS_URL = (process.env['AGENTS_URL'] ?? 'http://localhost:8000').replace(/\/$/, '')

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const client = new AgentsClient(AGENTS_URL)

  try {
    const result = await client.analyze(body as Parameters<typeof client.analyze>[0])
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isOffline = message.includes('fetch failed') || message.includes('ECONNREFUSED')

    return NextResponse.json(
      {
        error: message,
        ...(isOffline
          ? { hint: 'Start with: docker compose --profile ai up (set LLM_PROVIDER=bedrock + AWS credentials)' }
          : {}),
      },
      { status: isOffline ? 503 : 500 },
    )
  }
}
