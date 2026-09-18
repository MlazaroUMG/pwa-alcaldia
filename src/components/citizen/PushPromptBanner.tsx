import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"

interface PushPromptBannerProps {
  onEnable: () => void
  onDismiss: () => void
  isBusy?: boolean
  message?: string | null
}

/**
 * Ofrece notificaciones del dispositivo después de un reporte exitoso.
 *
 * @component
 * @module Citizen
 */
export function PushPromptBanner({
  onEnable,
  onDismiss,
  isBusy = false,
  message,
}: PushPromptBannerProps) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-50">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-2">
          <p>
            ¿Quieres recibir avisos en este dispositivo cuando tu reporte cambie de estado?
          </p>
          {message && <p className="text-xs">{message}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={onEnable} disabled={isBusy}>
              {isBusy ? "Activando..." : "Activar avisos"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
              Ahora no
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
