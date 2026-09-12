import { useEffect, useState } from "react"
import { AlertTriangle, KeyRound, Save, Trash2 } from "lucide-react"

import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toUserFacingError } from "@/lib/network-errors"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

interface ProfileSettingsViewProps {
  email?: string
  layout?: "admin" | "citizen"
}

interface ProfileDetails {
  id: string
  role: string
  created_at: string
  first_name: string | null
  last_name: string | null
  dpi: string | null
  phone: string | null
  address: string | null
}

/**
 * Shared account settings view for citizen and administrative modules.
 *
 * El perfil ciudadano mantiene contacto y DPI. El administrativo solo muestra
 * datos básicos, apariencia y cambio de contraseña. La eliminación de cuenta
 * no se ofrece a administradores.
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
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dpi, setDpi] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const isAdminLayout = layout === "admin"
  const citizenLabelClass = isAdminLayout
    ? undefined
    : "text-gray-800 dark:text-gray-100"
  const citizenEditableInputClass = isAdminLayout
    ? undefined
    : "border-gray-400 bg-white text-gray-900 dark:border-input dark:bg-input/30 dark:text-gray-100"
  const citizenOutlineControlClass = isAdminLayout
    ? undefined
    : "border-gray-500 bg-white text-gray-800 hover:bg-gray-100 hover:text-gray-900 dark:border-input dark:bg-input/30 dark:text-gray-100 dark:hover:bg-input/50 dark:hover:text-gray-100"

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
        .select("id,role,created_at,first_name,last_name,dpi,phone,address")
        .eq("id", user.id)
        .maybeSingle()

      const nextProfile = (data ?? null) as ProfileDetails | null
      setProfile(nextProfile)
      setFirstName(nextProfile?.first_name ?? "")
      setLastName(nextProfile?.last_name ?? "")
      setDpi(nextProfile?.dpi ?? "")
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

    if (!isAdminLayout && !profile.dpi && !/^\d{13}$/.test(dpi.trim())) {
      setIsSaving(false)
      setErrorMessage("El DPI debe tener 13 dígitos numéricos.")
      return
    }

    if (!isAdminLayout && !/^\d{8}$/.test(phone.trim())) {
      setIsSaving(false)
      setErrorMessage("El teléfono debe tener 8 dígitos numéricos.")
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update(
        isAdminLayout
          ? {
              first_name: firstName.trim() || null,
              last_name: lastName.trim() || null,
            }
          : {
              first_name: firstName.trim() || null,
              last_name: lastName.trim() || null,
              dpi: profile.dpi ?? (dpi.trim() || null),
              phone: phone.trim() || null,
              address: address.trim() || null,
            }
      )
      .eq("id", profile.id)

    setIsSaving(false)

    if (error) {
      setErrorMessage(toUserFacingError(error))
      return
    }

    setProfile((previous) =>
      previous
        ? {
            ...previous,
            first_name: firstName.trim() || null,
            last_name: lastName.trim() || null,
            dpi: previous.dpi ?? (dpi.trim() || null),
            phone: phone.trim() || null,
            address: address.trim() || null,
          }
        : previous
    )
    setMessage("Perfil actualizado correctamente.")
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setPasswordError("No hay correo disponible para enviar el cambio de contraseña.")
      return
    }

    setPasswordMessage(null)
    setPasswordError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })

    if (error) {
      setPasswordError(toUserFacingError(error))
      return
    }

    setPasswordMessage("Se envió un enlace de cambio de contraseña al correo registrado.")
  }

  return (
    <section
      className={
        layout === "admin"
          ? "min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6"
          : "space-y-4 rounded-2xl bg-card p-4 text-gray-900 shadow-sm dark:text-gray-100"
      }
    >
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
          Ajustes de perfil
        </h2>
        <p className="text-sm text-muted-foreground">
          {isAdminLayout
            ? "Consulta tus datos básicos, cambia la apariencia y solicita un enlace de contraseña."
            : "Consulta tus datos, actualiza información de contacto y cambia la apariencia."}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-first-name" className={citizenLabelClass}>
                Nombre
              </Label>
              <Input
                id="profile-first-name"
                className={cn("mt-1", citizenEditableInputClass)}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profile-last-name" className={citizenLabelClass}>
                Apellido
              </Label>
              <Input
                id="profile-last-name"
                className={cn("mt-1", citizenEditableInputClass)}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
            <div>
              <Label>Correo</Label>
              <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                {email ?? "No disponible"}
              </p>
            </div>
            <div>
              <Label>Rol</Label>
              <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                {profile?.role ?? "Cargando..."}
              </p>
            </div>
            {!isAdminLayout && (
              <div>
                <Label
                  htmlFor={profile?.dpi ? undefined : "profile-dpi"}
                  className={citizenLabelClass}
                >
                  DPI
                </Label>
                {profile?.dpi ? (
                  <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {profile.dpi}
                  </p>
                ) : (
                  <Input
                    id="profile-dpi"
                    inputMode="numeric"
                    className={cn("mt-1", citizenEditableInputClass)}
                    value={dpi}
                    onChange={(event) => setDpi(event.target.value)}
                  />
                )}
              </div>
            )}
            <div>
              <Label>Fecha de creación</Label>
              <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleString()
                  : "No disponible"}
              </p>
            </div>
          </div>

          {!isAdminLayout && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-phone" className={citizenLabelClass}>
                  Teléfono
                </Label>
                <Input
                  id="profile-phone"
                  inputMode="numeric"
                  className={citizenEditableInputClass}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-address" className={citizenLabelClass}>
                  Dirección
                </Label>
                <Input
                  id="profile-address"
                  className={citizenEditableInputClass}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
            </div>
          )}

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
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Apariencia
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Cambia entre modo claro y oscuro.
            </p>
            <ThemeToggle className={citizenOutlineControlClass} />
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Seguridad de la cuenta
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Solicita un enlace para cambiar tu contraseña.
            </p>
            {passwordMessage && (
              <p className="mb-3 text-sm text-emerald-700 dark:text-emerald-300">
                {passwordMessage}
              </p>
            )}
            {passwordError && (
              <p className="mb-3 text-sm text-destructive">{passwordError}</p>
            )}
            <Button
              type="button"
              variant="outline"
              className={citizenOutlineControlClass}
              onClick={handlePasswordReset}
            >
              <KeyRound className="size-4" />
              Cambiar contraseña
            </Button>
          </div>

          {!isAdminLayout && (
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
          )}
        </aside>
      </div>
    </section>
  )
}
