import { NextRequest, NextResponse } from 'next/server'
import { PluggyClient } from 'pluggy-sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type WebhookEvent = {
  event: string
  eventId: string
  itemId?: string
  error?: unknown
}

async function handleItemCreated(itemId: string) {
  // Item connected — here you'd persist itemId to your database
  // e.g. await db.items.upsert({ id: itemId, status: 'connected' })
  console.log('[pluggy/webhook] item/created', itemId)
}

async function handleItemUpdated(itemId: string) {
  // Item synced — here you'd trigger a data refresh via /api/pluggy
  console.log('[pluggy/webhook] item/updated', itemId)
}

async function handleItemError(itemId: string, error: unknown) {
  // Item failed to sync — surface this to the user
  console.error('[pluggy/webhook] item/error', itemId, error)
}

/**
 * POST /api/webhooks/pluggy
 *
 * Receives Pluggy webhook events.
 * Must return 2XX within 5 seconds — heavy work should be async.
 *
 * Events: item/created, item/updated, item/error
 * Docs:   https://docs.pluggy.ai/docs/webhooks
 */
export async function POST(req: NextRequest) {
  let event: WebhookEvent
  try {
    event = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log('[pluggy/webhook] received:', event.event, 'id:', event.eventId)

  // Process asynchronously — do NOT await heavy operations before returning
  void (async () => {
    try {
      switch (event.event) {
        case 'item/created':
          if (event.itemId) await handleItemCreated(event.itemId)
          break
        case 'item/updated':
          if (event.itemId) await handleItemUpdated(event.itemId)
          break
        case 'item/error':
          if (event.itemId) await handleItemError(event.itemId, event.error)
          break
        default:
          console.log('[pluggy/webhook] unhandled event:', event.event)
      }
    } catch (err) {
      console.error('[pluggy/webhook] handler error:', err)
    }
  })()

  // Respond immediately with 2XX — Pluggy requires this within 5s
  return NextResponse.json({ received: true })
}
