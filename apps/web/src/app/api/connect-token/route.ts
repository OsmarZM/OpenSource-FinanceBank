import { NextRequest, NextResponse } from 'next/server'
import { PluggyClient } from 'pluggy-sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/connect-token
 *
 * Creates a short-lived Pluggy Connect Token server-side.
 * The frontend uses this token to open the Pluggy Connect widget
 * without ever touching CLIENT_ID or CLIENT_SECRET in the browser.
 *
 * Body (optional): { clientUserId: string }
 * Returns:         { accessToken: string }
 */
export async function POST(req: NextRequest) {
  const clientId = process.env['PLUGGY_CLIENT_ID']
  const clientSecret = process.env['PLUGGY_CLIENT_SECRET']

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: 'Pluggy credentials not configured',
        hint: 'Set PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET in .env.local',
      },
      { status: 503 },
    )
  }

  let clientUserId: string | undefined
  try {
    const body = await req.json().catch(() => ({}))
    clientUserId = body?.clientUserId
  } catch {
    // body is optional
  }

  try {
    const pluggy = new PluggyClient({ clientId, clientSecret })

    const connectToken = await pluggy.createConnectToken(
      undefined, // itemId — omit to allow connecting any bank
      clientUserId ? { clientUserId } : undefined,
    )

    return NextResponse.json({ accessToken: connectToken.accessToken })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
