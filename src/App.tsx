import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"

import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { CitizenLayout } from "@/components/layout/CitizenLayout"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabaseClient"
import type { UserRole } from "@/lib/supabase.types"
import "./App.css"

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [roleError, setRoleError] = useState<string | null>(null)

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
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const loadRole = async () => {
      if (!session?.user.id) {
        setRole(null)
        setRoleError(null)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle()

      if (error) {
        setRoleError(error.message)
        setRole(null)
        return
      }

      const profileRole = data?.role

      if (profileRole !== "admin" && profileRole !== "citizen") {
        setRoleError("No se encontró un perfil con rol asignado para este usuario.")
        setRole(null)
        return
      }

      setRole(profileRole)
      setRoleError(null)
    }

    void loadRole()
  }, [session?.user.id])

  const handleSignOut = async () => {
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

          {!isLoadingSession && !session && (
            <main className="flex min-h-screen items-center justify-center px-4">
              <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-foreground shadow-lg sm:p-8">
                <h2 className="mb-4 text-center text-2xl font-bold text-foreground">
                  Acceso al Sistema
                </h2>
                <img
                  src="/logo.png"
                  alt="Alcaldía Auxiliar Zona 18"
                  className="mx-auto mb-4 h-20 w-auto"
                />
                <p className="mb-4 text-center text-sm text-foreground/85">
                  Inicia sesión o crea una cuenta para reportar incidencias.
                </p>

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                    <TabsTrigger value="register">Registro</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-4">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="register" className="mt-4">
                    <RegisterForm />
                  </TabsContent>
                </Tabs>
              </section>
            </main>
          )}

          {!isLoadingSession && session && (
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
