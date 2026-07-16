import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase.types"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
  )
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey
)
