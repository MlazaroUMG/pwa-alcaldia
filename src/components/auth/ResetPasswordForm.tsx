import { useState } from "react"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toUserFacingError } from "@/lib/network-errors"
import { supabase } from "@/lib/supabaseClient"

interface ResetPasswordFormProps {
  onCompleted: () => void
}

const AUTH_INPUT_CLASS =
  "rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"

/**
 * Formulario de nueva contraseña tras el evento PASSWORD_RECOVERY de Auth.
 *
 * No introduce rutas: App muestra esta vista cuando el enlace de correo
 * restablece la sesión de recuperación.
 *
 * @component
 * @module Auth
 */
export function ResetPasswordForm({ onCompleted }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.")
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.auth.updateUser({ password })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(toUserFacingError(error))
      return
    }

    onCompleted()
  }

  return (
    <main className="min-h-screen bg-[#edf3fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xl sm:px-8">
          <div className="mb-6 flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Alcaldía Auxiliar Zona 18"
              className="size-12 rounded-xl object-contain"
            />
            <div>
              <div className="font-display text-base font-bold leading-tight text-gray-900">
                PWA Alcaldia
              </div>
              <div className="text-xs text-gray-400">Recuperación de contraseña</div>
            </div>
          </div>

          <h1 className="font-display mb-1 text-3xl font-bold text-gray-950">
            Nueva contraseña
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Define una contraseña nueva para continuar con tu sesión.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="reset-password" className="text-sm text-gray-600">
                Contraseña nueva
              </Label>
              <Input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={AUTH_INPUT_CLASS}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-confirm" className="text-sm text-gray-600">
                Confirmar contraseña
              </Label>
              <Input
                id="reset-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={AUTH_INPUT_CLASS}
                required
              />
            </div>

            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <Button
              type="submit"
              className="w-full rounded-xl bg-blue-500 py-6 font-semibold text-white hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Actualizar contraseña"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
