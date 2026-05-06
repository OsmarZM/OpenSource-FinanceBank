import { NextRequest, NextResponse } from 'next/server'
import { PluggyClient } from 'pluggy-sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/register
 *
 * Registers (or lists) webhooks for this app in Pluggy.
 * Should be called once during setup or when the webhook URL changes.
 *
 * Strategy: if a webhook already exists for this URL, skip creation.
 * Otherwise, create a new "all" webhook pointing to this app's URL
 * with a shared secret in the headers for request validation.
 *
 * Body (optional): { url?: string }
 * - url defaults to NEXT_PUBLIC_APP_URL + /api/webhooks/pluggy
 *
 * Returns: { webhook: Webhook } on success or { webhooks: Webhook[] } if listing
 *
 * Docs: https://docs.pluggy.ai/docs/webhooks
 */
export async function POST(req: NextRequest) {
  const clientId = process.env['PLUGGY_CLIENT_ID']
  const clientSecret = process.env['PLUGGY_CLIENT_SECRET']
  const appUrl = process.env['NEXT_PUBLIC_APP_URL']
  const webhookSecret = process.env['PLUGGY_WEBHOOK_SECRET']

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Pluggy credentials not configured' },
      { status: 503 },
    )
  }

  if (!appUrl) {
    return NextResponse.json(
      {
        error: 'NEXT_PUBLIC_APP_URL not configured',
        hint: 'Set NEXT_PUBLIC_APP_URL=https://your-domain.com in .env.local',
      },
      { status: 503 },
    )
  }

  let targetUrl: string
  try {
    const body = await req.json().catch(() => ({}))
    targetUrl = body?.url ?? `${appUrl}/api/webhooks/pluggy`
  } catch {
    targetUrl = `${appUrl}/api/webhooks/pluggy`
  }

  // Pluggy only accepts HTTPS — reject localhost to give a clear error
  if (targetUrl.startsWith('http://')) {
    return NextResponse.json(
      {
        error: 'Pluggy requires HTTPS webhook URLs',
        hint: 'Use ngrok or a deployed URL. Received: ' + targetUrl,
      },
      { status: 400 },
    )
  }

  const pluggy = new PluggyClient({ clientId, clientSecret })

  // Check if webhook already registered for this URL
  const { results: existing } = await pluggy.fetchWebhooks()
  const alreadyRegistered = existing.find((wh) => wh.url === targetUrl)
  if (alreadyRegistered) {
    return NextResponse.json({
      message: 'Webhook already registered',
      webhook: alreadyRegistered,
    })
  }

  // Build optional secret header — Pluggy sends it back with every notification
  const headers: Record<string, string> | undefined = webhookSecret
    ? { 'x-pluggy-webhook-secret': webhookSecret }
    : undefined

  const webhook = await pluggy.createWebhook('all', targetUrl, headers)

  return NextResponse.json({ webhook }, { status: 201 })
}

/**
 * GET /api/webhooks/register
 *
 * Lists all webhooks registered in Pluggy for this client.
 */
export async function GET() {
  const clientId = process.env['PLUGGY_CLIENT_ID']
  const clientSecret = process.env['PLUGGY_CLIENT_SECRET']

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Pluggy credentials not configured' },
      { status: 503 },
    )
  }

  const pluggy = new PluggyClient({ clientId, clientSecret })
  const { results: webhooks } = await pluggy.fetchWebhooks()
  return NextResponse.json({ webhooks })
}
