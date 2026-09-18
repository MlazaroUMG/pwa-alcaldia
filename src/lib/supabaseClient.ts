import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase.types"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Faltan las variables de entorno de Supabase.")
}

const browserStorage =
  typeof window === "undefined" ? undefined : window.localStorage

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: browserStorage,
    storageKey: "pwa-alcaldia-auth",
  },
})
