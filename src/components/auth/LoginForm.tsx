import { useState } from "react"
import type { FormEvent } from "react"
import { Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
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
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full border-primary/30 bg-background text-foreground hover:bg-muted"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || isGoogleSubmitting}
      >
        <Globe className="size-4" />
        {isGoogleSubmitting ? "Conectando con Google..." : "Continuar con Google"}
      </Button>

      <div className="flex items-center gap-3 text-xs font-medium text-foreground/80">
        <span className="h-px flex-1 bg-border" />
        <span>o ingresa con correo</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      <Button
        type="submit"
        variant="secondary"
        className="h-11 w-full bg-muni-green text-[#153d0c] hover:bg-muni-green/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </Button>
    </form>
  )
}
