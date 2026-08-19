import { useEffect, useState } from "react"
import { AlertTriangle, KeyRound, Save, Trash2 } from "lucide-react"

import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"

interface ProfileSettingsViewProps {
  email?: string
  layout?: "admin" | "citizen"
}

interface ProfileDetails {
  id: string
  role: string
  created_at: string
  dpi: string | null
  phone: string | null
  address: string | null
}

/**
 * Shared account settings view for citizen and administrative modules.
 *
 * Shows the authenticated user's Supabase profile, exposes safe edits for
 * phone/address, provides a password-reset request, and documents account
 * deletion as an administrative operation because deleting Auth users requires
 * privileged server-side credentials.
 *
 * @component
 * @module Profile
 * @param {ProfileSettingsViewProps} props Current email and layout context.
 * @returns {JSX.Element} Profile settings panel with appearance controls.
 */
export function ProfileSettingsView({
  email,
  layout = "citizen",
}: ProfileSettingsViewProps) {
  const [profile, setProfile] = useState<ProfileDetails | null>(null)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("id,role,created_at,dpi,phone,address")
        .eq("id", user.id)
        .maybeSingle()

      const nextProfile = (data ?? null) as ProfileDetails | null
      setProfile(nextProfile)
      setPhone(nextProfile?.phone ?? "")
      setAddress(nextProfile?.address ?? "")
    }

    void loadProfile()
  }, [])

  const handleSaveProfile = async () => {
    if (!profile) {
      return
    }

    setIsSaving(true)
    setMessage(null)
    setErrorMessage(null)

    const { error } = await supabase
      .from("profiles")
      .update({
        phone: phone.trim() || null,
        address: address.trim() || null,
      })
      .eq("id", profile.id)

    setIsSaving(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setProfile((previous) =>
      previous
        ? {
            ...previous,
            phone: phone.trim() || null,
            address: address.trim() || null,
          }
        : previous
    )
    setMessage("Perfil actualizado correctamente.")
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setErrorMessage("No hay correo disponible para enviar el cambio de contraseña.")
      return
    }

    setMessage(null)
    setErrorMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setMessage("Se envió un enlace de cambio de contraseña al correo registrado.")
  }

  return (
    <section
      className={
        layout === "admin"
          ? "w-full space-y-6 p-4 sm:p-6"
          : "space-y-4 rounded-2xl bg-card p-4 shadow-sm"
      }
    >
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Ajustes de perfil
        </h2>
        <p className="text-sm text-muted-foreground">
          Consulta tus datos, actualiza información de contacto y cambia la apariencia.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Correo</Label>
              <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
                {email ?? "No disponible"}
              </p>
            </div>
            <div>
              <Label>Rol</Label>
              <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
                {profile?.role ?? "Cargando..."}
              </p>
            </div>
            <div>
              <Label>DPI</Label>
              <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
                {profile?.dpi ?? "No registrado"}
              </p>
            </div>
            <div>
              <Label>Fecha de creación</Label>
              <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleString()
                  : "No disponible"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Teléfono</Label>
              <Input
                id="profile-phone"
                inputMode="numeric"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-address">Dirección</Label>
              <Input
                id="profile-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </div>
          </div>

          {message && (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>
          )}
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <Button type="button" onClick={handleSaveProfile} disabled={isSaving}>
            <Save className="size-4" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-base font-semibold text-foreground">Apariencia</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Cambia entre modo claro y oscuro.
            </p>
            <ThemeToggle />
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-base font-semibold text-foreground">
              Seguridad de la cuenta
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Solicita un enlace para cambiar tu contraseña.
            </p>
            <Button type="button" variant="outline" onClick={handlePasswordReset}>
              <KeyRound className="size-4" />
              Cambiar contraseña
            </Button>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4" />
              <h3 className="text-base font-semibold">Eliminación de cuenta</h3>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Por seguridad, la eliminación real debe realizarse mediante una función
              administrativa con permisos de servidor.
            </p>
            <Button type="button" variant="destructive" disabled>
              <Trash2 className="size-4" />
              Solicitar eliminación
            </Button>
          </div>
        </aside>
      </div>
    </section>
  )
}
