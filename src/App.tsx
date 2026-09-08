import { useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"

import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { CitizenLayout } from "@/components/layout/CitizenLayout"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { isNetworkError, toUserFacingError } from "@/lib/network-errors"
import { supabase } from "@/lib/supabaseClient"
import type { UserRole } from "@/lib/supabase.types"
import "./App.css"

const ROLE_CACHE_PREFIX = "ciudadapp-role:"

function readCachedRole(userId: string): UserRole | null {
  try {
    const value = sessionStorage.getItem(`${ROLE_CACHE_PREFIX}${userId}`)
    if (value === "admin" || value === "citizen") {
      return value
    }
  } catch {
    // sessionStorage puede no estar disponible.
  }

  return null
}

function writeCachedRole(userId: string, nextRole: UserRole) {
  try {
    sessionStorage.setItem(`${ROLE_CACHE_PREFIX}${userId}`, nextRole)
  } catch {
    // Ignora fallos de almacenamiento.
  }
}

function clearCachedRole(userId: string) {
  try {
    sessionStorage.removeItem(`${ROLE_CACHE_PREFIX}${userId}`)
  } catch {
    // Ignora fallos de almacenamiento.
  }
}

type AuthTab = "login" | "signup"

function getMetadataValue(user: User, key: string) {
  const value = user.user_metadata?.[key]
  return typeof value === "string" ? value : null
}

function isGoogleUser(user: User) {
  return (
    user.app_metadata?.provider === "google" ||
    user.identities?.some((identity) => identity.provider === "google") === true
  )
}

async function createCitizenProfileFromGoogleUser(user: User) {
  const fullName =
    getMetadataValue(user, "full_name") ??
    getMetadataValue(user, "name") ??
    user.email?.split("@")[0] ??
    "Ciudadano"
  const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/)

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    role: "citizen",
    first_name: firstName ?? "Ciudadano",
    last_name: lastNameParts.join(" ") || null,
  })

  return error
}

/**
 * Authentication shell adapted from the visual reference.
 *
 * Presents login and citizen registration in a responsive two-panel layout.
 * The selected role is not controlled here: Supabase profiles continue to
 * define whether the authenticated user enters the admin or citizen module.
 *
 * @component
 * @module App
 */
function AuthPage() {
  const [tab, setTab] = useState<AuthTab>("login")

  return (
    <main className="min-h-screen bg-[#edf3fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
          <section className="flex flex-col px-6 py-8 sm:px-8 md:px-10 lg:px-12">
            <div className="mb-7 flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Alcaldía Auxiliar Zona 18"
                className="size-12 rounded-xl object-contain"
              />
              <div>
                <div className="font-display text-base font-bold leading-tight text-gray-900">
                  PWA Alcaldia
                </div>
                <div className="text-xs text-gray-400">Gestión de Incidencias</div>
              </div>
            </div>

            <h1 className="font-display mb-1 text-3xl font-bold text-gray-950">
              Bienvenido
            </h1>
            <p className="mb-6 text-sm text-gray-400">
              {tab === "login"
                ? "Inicia sesión para acceder a tu cuenta."
                : "Crea una cuenta para comenzar a usar la app."}
            </p>

            <div className="mb-6 flex rounded-xl border border-gray-200 p-1">
              {(["login", "signup"] as const).map((authTab) => (
                <button
                  key={authTab}
                  type="button"
                  onClick={() => setTab(authTab)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    tab === authTab
                      ? "bg-blue-500 text-white shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {authTab === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              ))}
            </div>

            <div className="flex-1">
              {tab === "login" ? <LoginForm /> : <RegisterForm />}
            </div>

            <p className="mt-5 text-center text-xs text-gray-400">
              {tab === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("signup")}
                    className="font-medium text-blue-500 hover:underline"
                  >
                    Crear cuenta
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="font-medium text-blue-500 hover:underline"
                  >
                    Iniciar sesión
                  </button>
                </>
              )}
            </p>
          </section>

          <aside className="relative hidden min-h-[620px] flex-col items-center justify-center overflow-hidden bg-gray-50 p-10 md:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100" />
            <div className="relative z-10 text-center">
              <div className="mx-auto mb-6 flex size-64 items-center justify-center">
                <svg viewBox="0 0 200 200" className="size-full" aria-hidden="true">
                  <circle cx="100" cy="100" r="90" fill="#e8f4ff" />
                  <rect
                    x="60"
                    y="55"
                    width="80"
                    height="110"
                    rx="12"
                    fill="white"
                    stroke="#c7d9f0"
                    strokeWidth="2"
                  />
                  <rect x="72" y="70" width="56" height="8" rx="3" fill="#bfdbfe" />
                  <rect x="72" y="85" width="40" height="6" rx="3" fill="#dbeafe" />
                  <rect x="72" y="97" width="48" height="6" rx="3" fill="#dbeafe" />
                  <rect x="72" y="109" width="36" height="6" rx="3" fill="#dbeafe" />
                  <circle cx="100" cy="145" r="14" fill="#3b82f6" />
                  <path
                    d="M94 145l4 4 8-8"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle cx="140" cy="60" r="22" fill="#22c55e" opacity="0.9" />
                  <path
                    d="M131 60l6 6 12-12"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <h2 className="font-display text-lg font-bold text-gray-800">
                Sistema Seguro
              </h2>
              <p className="mt-1 max-w-xs text-sm text-gray-500">
                Tus datos se gestionan mediante Supabase Auth y políticas RLS del
                proyecto.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)
  const sessionUser = session?.user

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      setSession(currentSession)
      setIsLoadingSession(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, updatedSession) => {
      setSession(updatedSession)
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const loadRole = async () => {
      if (!sessionUser?.id) {
        setRole(null)
        setRoleError(null)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionUser.id)
        .maybeSingle()

      if (error) {
        const cachedRole = readCachedRole(sessionUser.id)

        if (isNetworkError(error) && cachedRole) {
          setRole(cachedRole)
          setRoleError(null)
          return
        }

        setRoleError(toUserFacingError(error))
        setRole(null)
        return
      }

      const profileRole = data?.role

      if (profileRole !== "admin" && profileRole !== "citizen") {
        if (isGoogleUser(sessionUser)) {
          const profileError = await createCitizenProfileFromGoogleUser(sessionUser)

          if (profileError) {
            setRoleError(toUserFacingError(profileError))
            setRole(null)
            return
          }

          writeCachedRole(sessionUser.id, "citizen")
          setRole("citizen")
          setRoleError(null)
          return
        }

        setRoleError("No se encontró un perfil con rol asignado para este usuario.")
        setRole(null)
        return
      }

      writeCachedRole(sessionUser.id, profileRole)
      setRole(profileRole)
      setRoleError(null)
    }

    void loadRole()
  }, [sessionUser])

  const handleSignOut = async () => {
    if (sessionUser?.id) {
      clearCachedRole(sessionUser.id)
    }

    await supabase.auth.signOut()
  }

  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {isLoadingSession && (
            <main className="flex min-h-screen items-center justify-center px-4">
              <p className="text-sm text-muted-foreground">Validando sesión...</p>
            </main>
          )}

          {!isLoadingSession && !session && !isPasswordRecovery && (
            <AuthPage />
          )}

          {!isLoadingSession && isPasswordRecovery && (
            <ResetPasswordForm onCompleted={() => setIsPasswordRecovery(false)} />
          )}

          {!isLoadingSession && session && !isPasswordRecovery && (
            <>
              {roleError && <p className="p-4 text-sm text-destructive">{roleError}</p>}
              {!roleError && role === "citizen" && (
                <CitizenLayout
                  userId={session.user.id}
                  email={session.user.email}
                  onSignOut={() => void handleSignOut()}
                />
              )}
              {!roleError && role === "admin" && (
                <AdminLayout
                  email={session.user.email}
                  onSignOut={() => void handleSignOut()}
                />
              )}
            </>
          )}
        </div>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
