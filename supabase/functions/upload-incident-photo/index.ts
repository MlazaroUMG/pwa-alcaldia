import { createClient } from "npm:@supabase/supabase-js@2"

const JPEG = [0xff, 0xd8, 0xff]
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const MAX_BYTES = 5 * 1024 * 1024

function getSecretKey() {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS")
  if (keys) {
    const parsed = JSON.parse(keys) as Record<string, string>
    return parsed.default
  }

  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
}

function matches(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value)
}

function detectImageMime(bytes: Uint8Array) {
  if (bytes.length < 12) {
    return null
  }
  if (matches(bytes, JPEG)) {
    return { mime: "image/jpeg", ext: "jpg" }
  }
  if (matches(bytes, PNG)) {
    return { mime: "image/png", ext: "png" }
  }
  const header = String.fromCharCode(...bytes.slice(0, 4))
  const tag = String.fromCharCode(...bytes.slice(8, 12))
  if (header === "RIFF" && tag === "WEBP") {
    return { mime: "image/webp", ext: "webp" }
  }
  return null
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

  const formData = await request.formData()
  const incidentId = String(formData.get("incidentId") ?? "")
  const kind = String(formData.get("kind") ?? "")
  const file = formData.get("file")

  if (!incidentId || (kind !== "evidence" && kind !== "resolution") || !(file instanceof File)) {
    return json({ error: "Solicitud incompleta." }, 400)
  }

  if (file.size > MAX_BYTES) {
    return json({ error: "La fotografía no puede superar 5 MB." }, 400)
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const detected = detectImageMime(header)
  if (!detected) {
    return json({ error: "El archivo no es una fotografía válida." }, 400)
  }

  const admin = createClient(supabaseUrl, secretKey)
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  const isAdmin = profile?.role === "admin"

  const { data: incident } = await admin
    .from("incidents")
    .select("id,user_id,discarded_at")
    .eq("id", incidentId)
    .maybeSingle()

  if (!incident || incident.discarded_at) {
    return json({ error: "La incidencia no está disponible." }, 404)
  }

  if (kind === "evidence" && incident.user_id !== user.id && !isAdmin) {
    return json({ error: "No tienes permiso para adjuntar esta fotografía." }, 403)
  }

  if (kind === "resolution" && !isAdmin) {
    return json({ error: "Solo el personal administrativo puede adjuntar la resolución." }, 403)
  }

  const ownerFolder = incident.user_id ?? user.id
  const path = `${ownerFolder}/${incidentId}/${kind}-${Date.now()}.${detected.ext}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: uploadError } = await admin.storage
    .from("incident-photos")
    .upload(path, bytes, {
      contentType: detected.mime,
      upsert: false,
    })

  if (uploadError) {
    return json({ error: "No se pudo guardar la fotografía." }, 500)
  }

  const { data: signed } = await admin.storage
    .from("incident-photos")
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  const pathColumn = kind === "evidence" ? "image_path" : "resolution_image_path"
  const urlColumn = kind === "evidence" ? "image_url" : "resolution_image_url"
  const { error: updateError } = await admin
    .from("incidents")
    .update({
      [pathColumn]: path,
      [urlColumn]: signed?.signedUrl ?? null,
    })
    .eq("id", incidentId)

  if (updateError) {
    return json({ error: "La fotografía se subió, pero no se vinculó al reporte." }, 500)
  }

  return json({ path, signedUrl: signed?.signedUrl ?? null })
})
