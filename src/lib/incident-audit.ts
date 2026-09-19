import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

/**
 * Registra una transición de estado en `incident_audit_events`.
 *
 * Reutiliza la tabla de descarte (ADR 0008). No bloquea el tablero si el
 * INSERT falla por RLS pendiente de aplicar en remoto.
 */
export async function recordIncidentStatusChange(params: {
  incidentId: string
  fromStatus: IncidentStatus
  toStatus: IncidentStatus
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from("incident_audit_events").insert({
    incident_id: params.incidentId,
    actor_id: user?.id ?? null,
    action: "status_changed",
    reason: `${params.fromStatus} -> ${params.toStatus}`,
  })

  return error
}
