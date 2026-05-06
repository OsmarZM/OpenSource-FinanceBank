import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const OPENBB_URL = (process.env['OPENBB_URL'] ?? 'http://localhost:8001').replace(/\/$/, '')

// Simple in-process cache (60s TTL) to avoid hammering the sidecar
const cache = new Map<string, { data: unknown; expiresAt: number }>()
const CACHE_TTL_MS = 60_000

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const pathStr = '/' + path.join('/')
  const search = request.nextUrl.search

  // Don't cache /health or /data/* (session data)
  const shouldCache = !pathStr.startsWith('/data') && pathStr !== '/health'
  const cacheKey = pathStr + search

  if (shouldCache) {
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=60' },
      })
    }
  }

  try {
    const upstream = await fetch(`${OPENBB_URL}${pathStr}${search}`, {
      headers: { Accept: 'application/json' },
    })

    const data: unknown = await upstream.json()

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status })
    }

    if (shouldCache) {
      cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS })
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=60' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OpenBB sidecar unreachable'
    return NextResponse.json(
      { error: message, hint: 'Start with: docker compose --profile openbb up' },
      { status: 503 },
    )
  }
}
