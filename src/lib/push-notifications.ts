import { supabase } from "@/lib/supabaseClient"

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/")
  const decoded = window.atob(base64)

  return Uint8Array.from(decoded, (character) => character.charCodeAt(0))
}

export function supportsWebPush() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export async function enablePushNotifications() {
  if (!supportsWebPush()) {
    throw new Error("Este navegador no admite notificaciones del dispositivo.")
  }

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!publicKey) {
    throw new Error("Las notificaciones del dispositivo aún no están configuradas.")
  }

  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    throw new Error("El permiso de notificaciones no fue concedido.")
  }

  const registration = await navigator.serviceWorker.ready
  const existingSubscription = await registration.pushManager.getSubscription()
  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }))

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No se pudo verificar la sesión.")
  }

  const serialized = subscription.toJSON()
  const p256dh = serialized.keys?.p256dh
  const auth = serialized.keys?.auth

  if (!serialized.endpoint || !p256dh || !auth) {
    throw new Error("El navegador devolvió una suscripción incompleta.")
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: serialized.endpoint,
      p256dh,
      auth,
    },
    { onConflict: "endpoint" }
  )

  if (error) {
    throw error
  }
}

export async function disablePushNotifications() {
  if (!supportsWebPush()) {
    return
  }

  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) {
    return
  }

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", subscription.endpoint)
  await subscription.unsubscribe()
}
