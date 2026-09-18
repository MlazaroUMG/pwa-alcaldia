import { useState } from "react"
import type { FormEvent } from "react"

import { PasswordInput } from "@/components/auth/PasswordInput"
import { BrandLogo } from "@/components/layout/BrandLogo"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toUserFacingError } from "@/lib/network-errors"
import { supabase } from "@/lib/supabaseClient"
import { FIELD_LIMITS, getPasswordIssues } from "@/lib/validation"

interface ResetPasswordFormProps {
  onCompleted: () => void
}

const AUTH_INPUT_CLASS =
  "rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"

/**
 * Formulario de nueva contraseña tras el evento PASSWORD_RECOVERY de Auth.
 *
 * @component
 * @module Auth
 */
export function ResetPasswordForm({ onCompleted }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const passwordHints = password ? getPasswordIssues(password) : []

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const issues = getPasswordIssues(password)
    if (issues.length > 0) {
      setErrorMessage(issues[0])
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
            <BrandLogo className="size-12 border-slate-200" />
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
            Define una contraseña de 12 a 64 caracteres con mayúscula, minúscula, número y símbolo.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="reset-password" className="text-sm text-gray-600">
                Contraseña nueva
              </Label>
              <PasswordInput
                id="reset-password"
                autoComplete="new-password"
                maxLength={FIELD_LIMITS.password.maxChars}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={AUTH_INPUT_CLASS}
                required
              />
              {passwordHints.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                  {passwordHints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-confirm" className="text-sm text-gray-600">
                Confirmar contraseña
              </Label>
              <PasswordInput
                id="reset-confirm"
                autoComplete="new-password"
                maxLength={FIELD_LIMITS.password.maxChars}
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
