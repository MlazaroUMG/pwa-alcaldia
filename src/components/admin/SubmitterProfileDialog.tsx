import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabaseClient"

interface SubmitterProfileDialogProps {
  /** Profile id to look up, or `null` to keep the dialog closed. */
  profileId: string | null
  onOpenChange: (open: boolean) => void
}

interface SubmitterProfile {
  id: string
  role: string
  created_at: string
  dpi: string | null
  phone: string | null
  address: string | null
}

/**
 * Shared modal to inspect a citizen's profile from the administrative module.
 *
 * Reused by the incident inbox and the management table so administrators
 * can verify a reporting citizen's identity (DPI, phone, address) before
 * actioning a ticket. Requires the `admin` role at the Row Level Security
 * layer to actually return data for a profile other than the caller's own.
 *
 * @component
 * @module Admin
 * @param {SubmitterProfileDialogProps} props Profile id and open-state handler.
 * @returns {JSX.Element} Dialog with the citizen's verification details.
 */
export function SubmitterProfileDialog({
  profileId,
  onOpenChange,
}: SubmitterProfileDialogProps) {
  const [profile, setProfile] = useState<SubmitterProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isCurrentRequest = true

    // Deferred so the state updates below never run synchronously within the
    // effect body itself (avoids a cascading render on every profileId change).
    const bootstrapTimer = window.setTimeout(() => {
      if (!profileId) {
        setProfile(null)
        return
      }

      setIsLoading(true)

      const loadProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id,role,created_at,dpi,phone,address")
          .eq("id", profileId)
          .maybeSingle()

        if (isCurrentRequest) {
          setProfile((data ?? null) as SubmitterProfile | null)
          setIsLoading(false)
        }
      }

      void loadProfile()
    }, 0)

    return () => {
      isCurrentRequest = false
      window.clearTimeout(bootstrapTimer)
    }
  }, [profileId])

  return (
    <Dialog open={profileId !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Perfil del ciudadano</DialogTitle>
          <DialogDescription>Datos para verificación administrativa.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Cargando perfil...</p>
        )}

        {!isLoading && profile && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">ID:</span> {profile.id}
            </p>
            <p>
              <span className="font-semibold">Rol:</span> {profile.role}
            </p>
            <p>
              <span className="font-semibold">DPI:</span>{" "}
              {profile.dpi ?? "No registrado"}
            </p>
            <p>
              <span className="font-semibold">Teléfono:</span>{" "}
              {profile.phone ?? "No registrado"}
            </p>
            <p>
              <span className="font-semibold">Dirección:</span>{" "}
              {profile.address ?? "No registrada"}
            </p>
            <p>
              <span className="font-semibold">Creado:</span>{" "}
              {new Date(profile.created_at).toLocaleString()}
            </p>
          </div>
        )}

        {!isLoading && !profile && profileId && (
          <p className="text-sm text-muted-foreground">
            No se encontró información para este perfil.
          </p>
        )}

        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => onOpenChange(false)}
        >
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  )
}
