import { createClient } from "npm:@supabase/supabase-js@2"
import webpush from "npm:web-push@3.6.7"

interface NotificationRecord {
  id: string
  user_id: string
  incident_id: string | null
  type: "incident_received" | "status_changed" | "wall_published"
  title: string
  body: string
}

interface DatabaseWebhookPayload {
  type: "INSERT"
  table: "notifications"
  schema: "public"
  record: NotificationRecord
}

interface PushSubscriptionRow {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

function getSecretKey() {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS")
  if (keys) {
    const parsed = JSON.parse(keys) as Record<string, string>
    return parsed.default
  }

  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Método no permitido", { status: 405 })
  }

  const webhookSecret = Deno.env.get("PUSH_WEBHOOK_SECRET")
  if (
    !webhookSecret ||
    request.headers.get("x-webhook-secret") !== webhookSecret
  ) {
    return new Response("No autorizado", { status: 401 })
  }

  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const secretKey = getSecretKey()

  if (!vapidPublicKey || !vapidPrivateKey || !supabaseUrl || !secretKey) {
    return new Response("Configuración incompleta", { status: 500 })
  }

  let payload: DatabaseWebhookPayload
  try {
    payload = (await request.json()) as DatabaseWebhookPayload
  } catch {
    return new Response("JSON inválido", { status: 400 })
  }

  if (
    payload.type !== "INSERT" ||
    payload.table !== "notifications" ||
    payload.schema !== "public" ||
    !payload.record?.user_id
  ) {
    return new Response("Evento inválido", { status: 400 })
  }

  webpush.setVapidDetails(
    "mailto:soporte@pwa-alcaldia.local",
    vapidPublicKey,
    vapidPrivateKey
  )

  const supabaseAdmin = createClient(supabaseUrl, secretKey)
  const { data, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id,endpoint,p256dh,auth")
    .eq("user_id", payload.record.user_id)

  if (error) {
    return Response.json({ error: "No se pudieron cargar las suscripciones." }, { status: 500 })
  }

  const subscriptions = (data ?? []) as PushSubscriptionRow[]
  const expiredSubscriptionIds: string[] = []
  const message = JSON.stringify({
    title: payload.record.title,
    body: payload.record.body,
    url: "/",
  })

  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          message
        )
      } catch (error) {
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof error.statusCode === "number"
            ? error.statusCode
            : null

        if (statusCode === 404 || statusCode === 410) {
          expiredSubscriptionIds.push(subscription.id)
          return
        }

        throw error
      }
    })
  )

  if (expiredSubscriptionIds.length > 0) {
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .in("id", expiredSubscriptionIds)
  }

  const failed = results.filter((result) => result.status === "rejected").length
  return Response.json({
    sent: subscriptions.length - expiredSubscriptionIds.length - failed,
    failed,
    removed: expiredSubscriptionIds.length,
  })
})
