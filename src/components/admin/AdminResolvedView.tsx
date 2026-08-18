import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"

interface ResolvedIncident {
  id: string
  title: string
  category: string
  resolved_at: string | null
  is_public: boolean
}

/**
 * Admin list of resolved incidents with publication controls.
 *
 * Enables supervisors to decide whether resolved cases should be visible on the
 * community wall by toggling publication state per ticket.
 *
 * @component
 * @module Admin
 * @returns {JSX.Element} Resolved-ticket table with publish checkboxes.
 */
export function AdminResolvedView() {
  const [items, setItems] = useState<ResolvedIncident[]>([])

  useEffect(() => {
    const loadResolved = async () => {
      const { data } = await supabase
        .from("incidents")
        .select("id,title,category,resolved_at,is_public")
        .eq("status", "Resuelto")
        .order("resolved_at", { ascending: false })

      setItems((data ?? []) as ResolvedIncident[])
    }

    void loadResolved()
  }, [])

  const handleTogglePublic = async (incidentId: string, nextValue: boolean) => {
    const { error } = await supabase
      .from("incidents")
      .update({ is_public: nextValue })
      .eq("id", incidentId)

    if (error) {
      return
    }

    setItems((previous) =>
      previous.map((item) =>
        item.id === incidentId ? { ...item, is_public: nextValue } : item
      )
    )
  }

  return (
    <section className="w-full space-y-4 p-4 sm:p-6">
      <header>
        <h2 className="text-xl font-semibold text-foreground">Resueltos</h2>
        <p className="text-sm text-muted-foreground">
          Marca qué incidencias finalizadas se publican en el muro comunitario.
        </p>
      </header>

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border bg-background p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.category}</p>
              <p className="text-xs text-muted-foreground">
                {item.resolved_at
                  ? new Date(item.resolved_at).toLocaleString()
                  : "Sin fecha de resolución"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-muni-green text-[#0f2f08]">Resuelto</Badge>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.is_public}
                  onChange={(event) =>
                    void handleTogglePublic(item.id, event.target.checked)
                  }
                  className="size-4 rounded border-input"
                />
                Publicar
              </label>
            </div>
          </article>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay casos resueltos disponibles.</p>
      )}
    </section>
  )
}
