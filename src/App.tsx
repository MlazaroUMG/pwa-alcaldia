import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"

import { IncidentSubmissionForm } from "@/components/citizen/IncidentSubmissionForm"
import { AdminTicketTable } from "@/components/admin/AdminTicketTable"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { CommunityBoard } from "@/components/citizen/CommunityBoard"
import { MainHeader } from "@/components/layout/MainHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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

      const profileRole = (data as { role?: UserRole } | null)?.role

      if (!profileRole) {
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
    <div className="min-h-screen bg-background">
      <MainHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {isLoadingSession && (
          <p className="text-sm text-muted-foreground">Validando sesión...</p>
        )}

        {!isLoadingSession && !session && (
          <section className="mx-auto w-full max-w-lg space-y-4 rounded-lg border bg-card p-4 shadow-sm sm:p-6">
            <header className="space-y-1">
              <h2 className="text-xl font-semibold">Acceso al sistema</h2>
              <p className="text-sm text-muted-foreground">
                Inicia sesión o crea una cuenta para reportar incidencias.
              </p>
            </header>

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
        )}

        {!isLoadingSession && session && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Sesión activa: <span className="font-medium text-foreground">{session.user.email}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rol:</span>
                  <Badge variant="outline" className="capitalize">
                    {role ?? "sin perfil"}
                  </Badge>
                </div>
              </div>

              <Button variant="outline" onClick={() => void handleSignOut()}>
                Cerrar sesión
              </Button>
            </div>

            {roleError && (
              <p className="text-sm text-destructive">
                {roleError}
              </p>
            )}

            {role === "citizen" && (
              <Tabs defaultValue="citizen-form" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-fit">
                  <TabsTrigger value="citizen-form">Reportar incidente</TabsTrigger>
                  <TabsTrigger value="community-board">Community Board</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="citizen-form"
                  className="mt-4 rounded-lg border bg-card shadow-sm"
                >
                  <IncidentSubmissionForm userId={session.user.id} />
                </TabsContent>
                <TabsContent value="community-board" className="mt-4">
                  <CommunityBoard />
                </TabsContent>
              </Tabs>
            )}

            {role === "admin" && (
              <Tabs defaultValue="admin-dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-fit">
                  <TabsTrigger value="admin-dashboard">Dashboard Admin</TabsTrigger>
                  <TabsTrigger value="community-board">Community Board</TabsTrigger>
                </TabsList>

                <TabsContent value="admin-dashboard" className="mt-4">
                  <AdminTicketTable />
                </TabsContent>
                <TabsContent value="community-board" className="mt-4">
                  <CommunityBoard />
                </TabsContent>
              </Tabs>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
