import { supabase } from "@/lib/supabaseClient"

export type NotificationType =
  | "incident_received"
  | "status_changed"
  | "wall_published"

export interface AppNotification {
  id: string
  user_id: string
  incident_id: string | null
  type: NotificationType
  title: string
  body: string
  read_at: string | null
  created_at: string
}

const NOTIFICATION_COLUMNS =
  "id,user_id,incident_id,type,title,body,read_at,created_at"

export async function fetchUserNotifications(limit = 20) {
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit)

  return {
    notifications: (data ?? []) as AppNotification[],
    error,
  }
}

export async function markNotificationRead(notificationId: string) {
  return supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .is("read_at", null)
}
