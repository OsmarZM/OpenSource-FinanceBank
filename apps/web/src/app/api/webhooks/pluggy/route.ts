import { NextRequest, NextResponse } from 'next/server'
import type { WebhookEventPayload } from 'pluggy-sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleItemCreated(itemId: string) {
  // Persist itemId to your database, e.g.:
  // await db.items.upsert({ id: itemId, status: 'connected' })
  console.log('[pluggy/webhook] item/created', itemId)
}

async function handleItemUpdated(itemId: string) {
  // Trigger data refresh — call GET /items/{id} first per Pluggy docs
  console.log('[pluggy/webhook] item/updated', itemId)
}

async function handleItemDeleted(itemId: string) {
  // Remove item from your database
  console.log('[pluggy/webhook] item/deleted', itemId)
}

async function handleItemError(itemId: string, error: { code: string; message: string }) {
  // Surface error to user (e.g. re-auth required)
  console.error('[pluggy/webhook] item/error', itemId, error)
}

async function handleItemWaitingUserInput(itemId: string) {
  // Bank requires extra input (e.g. MFA) — prompt user to reopen widget
  console.log('[pluggy/webhook] item/waiting_user_input', itemId)
}

async function handleTransactionsCreated(
  itemId: string,
  accountId: string,
  createdTransactionsLink: string,
) {
  // Fetch new transactions from createdTransactionsLink and persist
  console.log('[pluggy/webhook] transactions/created', itemId, accountId, createdTransactionsLink)
}

async function handleTransactionsUpdated(itemId: string, transactionIds: string[]) {
  // Re-fetch the changed transactions by ID
  console.log('[pluggy/webhook] transactions/updated', itemId, transactionIds)
}

// ── Route ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/webhooks/pluggy
 *
 * Receives Pluggy webhook events.
 * Validates the shared secret sent as `X-Pluggy-Webhook-Secret` header.
 * Must return 2XX within 5 seconds — all heavy work runs asynchronously.
 *
 * To register this webhook, call POST /api/webhooks/register (server-side)
 * or use the Pluggy Dashboard and set the secret header.
 *
 * Docs: https://docs.pluggy.ai/docs/webhooks
 */
export async function POST(req: NextRequest) {
  // ── Secret validation ──────────────────────────────────────────────────────
  const webhookSecret = process.env['PLUGGY_WEBHOOK_SECRET']
  if (webhookSecret) {
    const incoming = req.headers.get('x-pluggy-webhook-secret')
    if (incoming !== webhookSecret) {
      console.warn('[pluggy/webhook] unauthorized — bad or missing secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let event: WebhookEventPayload
  try {
    event = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log('[pluggy/webhook] received:', event.event, 'id:', event.eventId)

  // Respond immediately — process async so we stay under the 5-second limit
  void (async () => {
    try {
      switch (event.event) {
        case 'item/created':
          await handleItemCreated(event.itemId)
          break
        case 'item/updated':
        case 'item/login_succeeded':
          await handleItemUpdated(event.itemId)
          break
        case 'item/deleted':
          await handleItemDeleted(event.itemId)
          break
        case 'item/error':
          await handleItemError(event.itemId, event.error)
          break
        case 'item/waiting_user_input':
        case 'item/waiting_user_action':
          await handleItemWaitingUserInput(event.itemId)
          break
        case 'transactions/created':
          await handleTransactionsCreated(
            event.itemId,
            event.accountId,
            event.createdTransactionsLink,
          )
          break
        case 'transactions/updated':
          await handleTransactionsUpdated(event.itemId, event.transactionIds)
          break
        default:
          console.log('[pluggy/webhook] unhandled event:', (event as { event: string }).event)
      }
    } catch (err) {
      console.error('[pluggy/webhook] handler error:', err)
    }
  })()

  // Respond immediately with 2XX — Pluggy requires this within 5s
  return NextResponse.json({ received: true })
}
