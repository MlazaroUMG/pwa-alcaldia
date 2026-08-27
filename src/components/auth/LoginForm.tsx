import { useState } from "react"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"

/**
 * Login form for existing users in citizen/admin modules.
 *
 * Uses Supabase Auth password sign-in and relies on session listeners in the
 * top-level app layout to enforce role-based access boundaries.
 *
 * @component
 * @module Auth
 * @returns {JSX.Element} Password login form with inline error feedback.
 */
export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message)
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
      setErrorMessage(error.message)
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl border-gray-200 px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-sm text-gray-600">
          Contraseña
        </Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="********"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-xl border-gray-200 px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400"
          required
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-gray-600">
          <input type="checkbox" className="size-4 rounded accent-blue-500" />
          Recordarme
        </label>
        <button type="button" className="font-medium text-blue-500 hover:text-blue-700">
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
