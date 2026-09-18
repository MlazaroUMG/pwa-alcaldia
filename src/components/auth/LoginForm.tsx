import { useState } from "react"
import type { FormEvent } from "react"

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toUserFacingError } from "@/lib/network-errors"
import { supabase } from "@/lib/supabaseClient"
import { FIELD_LIMITS, emailSchema, loginPasswordSchema } from "@/lib/validation"

const AUTH_INPUT_CLASS =
  "rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"

interface LoginFormProps {
  onForgotPassword: () => void
}

/**
 * Login form for existing users in citizen/admin modules.
 *
 * @component
 * @module Auth
 */
export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const parsedEmail = emailSchema.safeParse(email)
    const parsedPassword = loginPasswordSchema.safeParse(password)

    if (!parsedEmail.success) {
      setErrorMessage(parsedEmail.error.issues[0]?.message ?? "Correo inválido.")
      return
    }

    if (!parsedPassword.success) {
      setErrorMessage(parsedPassword.error.issues[0]?.message ?? "Contraseña inválida.")
      return
    }

    setIsSubmitting(true)

    if (!rememberMe) {
      sessionStorage.setItem("pwa-alcaldia-session-only", "1")
    } else {
      sessionStorage.removeItem("pwa-alcaldia-session-only")
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: parsedEmail.data,
      password: parsedPassword.data,
    })

    if (error) {
      setErrorMessage(toUserFacingError(error, "Correo o contraseña incorrectos."))
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
  }

  const handleGoogleSignIn = async () => {
    setErrorMessage(null)
    setIsGoogleSubmitting(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setErrorMessage(toUserFacingError(error))
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm text-gray-600">
          Correo electrónico
        </Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="ejemplo@correo.com"
          maxLength={FIELD_LIMITS.email.max}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={AUTH_INPUT_CLASS}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-sm text-gray-600">
          Contraseña
        </Label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="********"
          maxLength={FIELD_LIMITS.password.maxChars}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={AUTH_INPUT_CLASS}
          required
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="size-4 rounded accent-blue-500"
          />
          Recordarme en este dispositivo
        </label>
        <button
          type="button"
          className="font-medium text-blue-500 hover:text-blue-700"
          onClick={onForgotPassword}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      <Button
        type="submit"
        className="w-full rounded-xl bg-blue-500 py-6 font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </Button>

      <div className="my-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400">O iniciar sesión con</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <GoogleAuthButton
        label="Continuar con Google"
        isLoading={isGoogleSubmitting}
        disabled={isSubmitting}
        onClick={handleGoogleSignIn}
      />
    </form>
  )
}
