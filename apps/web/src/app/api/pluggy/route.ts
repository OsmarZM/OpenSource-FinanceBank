import { NextResponse } from 'next/server'
import { PluggyConnector } from '@fin-engine/connector-pluggy'
import { FinancialEngine } from '@fin-engine/core'

export const runtime = 'nodejs'
// Disable static caching — Pluggy data is live
export const dynamic = 'force-dynamic'

export async function GET() {
  const clientId = process.env['PLUGGY_CLIENT_ID']
  const clientSecret = process.env['PLUGGY_CLIENT_SECRET']
  // itemId is optional — auto-discovered from GET /items if not set
  const itemId = process.env['PLUGGY_SANDBOX_ITEM_ID'] || undefined

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: 'Pluggy credentials not configured',
        hint: 'Set PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET in .env',
      },
      { status: 503 },
    )
  }

  try {
    const connector = new PluggyConnector({ clientId, clientSecret, itemId })
    await connector.connect()

    const transactions = await connector.getTransactions()

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions returned from Pluggy. Connect a bank account in the Pluggy dashboard first.' },
        { status: 404 },
      )
    }

    const engine = new FinancialEngine()
    const result = engine.analyze(transactions)

    return NextResponse.json({ source: 'pluggy', ...result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
