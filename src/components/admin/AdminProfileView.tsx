import { useEffect, useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabaseClient"

interface AdminProfileViewProps {
  email?: string
}

interface AdminProfileDetails {
  role: string
  created_at: string
}

/**
 * Read-only profile view for the authenticated administrator.
 *
 * Mirrors the "profile view" structural piece from the shadcn-admin
 * reference dashboard, scoped to the account's own data (email, role, and
 * member-since date). Citizen verification data is shown separately via
 * {@link SubmitterProfileDialog} while managing incidents.
 *
 * @component
 * @module Admin
 * @param {AdminProfileViewProps} props The signed-in administrator's email.
 * @returns {JSX.Element} Simple account summary card.
 */
export function AdminProfileView({ email }: AdminProfileViewProps) {
  const [details, setDetails] = useState<AdminProfileDetails | null>(null)

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
        .select("role,created_at")
        .eq("id", user.id)
        .maybeSingle()

      setDetails((data ?? null) as AdminProfileDetails | null)
    }

    void loadProfile()
  }, [])

  const initials = email?.slice(0, 2).toUpperCase() ?? "AD"

  return (
    <section className="mx-auto w-full max-w-lg space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Mi perfil
        </h2>
        <p className="text-sm text-muted-foreground">
          Información de la cuenta administrativa.
        </p>
      </header>

      <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
        <Avatar className="size-14">
          <AvatarFallback className="bg-muni-blue text-base font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-base font-semibold text-foreground">
            {email ?? "Usuario autenticado"}
          </p>
          <p className="text-sm text-muted-foreground">
            Rol: {details?.role ?? "Cargando..."}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 text-sm shadow-sm">
        <p>
          <span className="font-semibold text-foreground">Cuenta creada:</span>{" "}
          {details?.created_at
            ? new Date(details.created_at).toLocaleString()
            : "No disponible"}
        </p>
      </div>
    </section>
  )
}
