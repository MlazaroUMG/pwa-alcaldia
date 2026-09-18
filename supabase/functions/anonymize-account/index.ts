import { createClient } from "npm:@supabase/supabase-js@2"

function getSecretKey() {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS")
  if (keys) {
    const parsed = JSON.parse(keys) as Record<string, string>
    return parsed.default
  }

  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (request.method !== "POST") {
    return json({ error: "Método no permitido" }, 405)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const secretKey = getSecretKey()
  const authHeader = request.headers.get("Authorization") ?? ""

  if (!supabaseUrl || !secretKey || !authHeader.startsWith("Bearer ")) {
    return json({ error: "No autorizado" }, 401)
  }

  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser()

  if (userError || !user) {
    return json({ error: "No autorizado" }, 401)
  }

  const admin = createClient(supabaseUrl, secretKey)
  const { data: profile } = await admin
    .from("profiles")
    .select("role,anonymized_at")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role === "admin") {
    return json({ error: "Las cuentas administrativas no se anonimizan desde la PWA." }, 403)
  }

  const { error: rpcError } = await userClient.rpc("anonymize_citizen_profile")
  if (rpcError) {
    return json({ error: "No se pudo completar la solicitud." }, 400)
  }

  await admin
    .from("account_anonymization_requests")
    .update({ processed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("processed_at", null)

  const { error: banError } = await admin.auth.admin.updateUserById(user.id, {
    ban_duration: "876000h",
  })

  if (banError) {
    return json({ error: "El perfil se anonimizó, pero no se pudo desactivar el acceso." }, 500)
  }

  return json({ ok: true })
})
