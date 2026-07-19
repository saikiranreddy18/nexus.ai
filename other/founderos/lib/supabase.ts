import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

/**
 * True when real Supabase credentials are present. The checked-in .env.local
 * ships with bracketed placeholders (e.g. https://[PROJECT_REF].supabase.co),
 * in which case the app runs in local demo mode instead.
 */
export const isSupabaseConfigured: boolean = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && !url.includes("[") && !key.includes("["))
})()

/**
 * Browser-side Supabase client (singleton).
 *
 * Uses createBrowserClient (@supabase/ssr) rather than the plain
 * supabase-js createClient — this persists the session in cookies (not just
 * localStorage), which is what lets Server Components (lib/supabase/server.ts)
 * see the same authenticated user via auth.uid() in RLS policies. Without
 * this, every server-rendered page (e.g. /project/[id]) sees an anonymous
 * session and RLS silently filters out the user's own rows.
 */
export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey || !isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured. Set real values for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
      )
    }

    client = createBrowserClient(url, anonKey)
  }
  return client
}
