import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbClient = SupabaseClient<any>

let _client: DbClient | null = null

/**
 * Returns a singleton Supabase client.
 * Requires SUPABASE_URL and SUPABASE_ANON_KEY in the environment.
 *
 * @throws {Error} If environment variables are not set.
 */
export function getClient(): DbClient {
  if (_client) return _client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured.\n' +
      'Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.\n' +
      'See .env.example for reference.',
    )
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return _client
}

/**
 * Returns true if SUPABASE_URL and SUPABASE_ANON_KEY are set.
 * Safe to call without throwing.
 */
export function isConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
}

/**
 * Resets the singleton (mainly for tests).
 */
export function resetClient(): void {
  _client = null
}
