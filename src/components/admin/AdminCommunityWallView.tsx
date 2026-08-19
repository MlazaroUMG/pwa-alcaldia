import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"

interface WallPost {
  id: string
  category: string
  resolution_summary: string | null
  image_url: string | null
  resolved_at: string | null
}

/**
 * Administrative moderation panel for public wall content.
 *
 * Allows post-level edits to resolution summaries and controlled removal of
 * community posts while keeping all changes bound to resolved incidents.
 *
 * @component
 * @module Admin
 * @returns {JSX.Element} Community wall manager with edit/delete actions.
 */
export function AdminCommunityWallView() {
  const [posts, setPosts] = useState<WallPost[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftSummary, setDraftSummary] = useState("")

  useEffect(() => {
    const loadPosts = async () => {
      const { data } = await supabase
        .from("incidents")
        .select("id,category,resolution_summary,image_url,resolved_at")
        .eq("is_public", true)
        .eq("status", "Resuelto")
        .order("resolved_at", { ascending: false })

      setPosts((data ?? []) as WallPost[])
    }

    void loadPosts()
  }, [])

  const handleDelete = async (incidentId: string) => {
    const { error } = await supabase
      .from("incidents")
      .update({ is_public: false })
      .eq("id", incidentId)

    if (error) {
      return
    }

    setPosts((previous) => previous.filter((post) => post.id !== incidentId))
  }

  const handleSaveEdit = async (incidentId: string) => {
    const { error } = await supabase
      .from("incidents")
      .update({ resolution_summary: draftSummary.trim() || null })
      .eq("id", incidentId)

    if (error) {
      return
    }

    setPosts((previous) =>
      previous.map((post) =>
        post.id === incidentId
          ? { ...post, resolution_summary: draftSummary.trim() || null }
          : post
      )
    )
    setEditingId(null)
    setDraftSummary("")
  }

  return (
    <section className="w-full space-y-4 p-4 sm:p-6">
      <header>
        <h2 className="text-xl font-semibold">Muro Comunitario</h2>
        <p className="text-sm text-muted-foreground">
          Vista administrativa para editar o retirar publicaciones públicas.
        </p>
      </header>

      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-lg border bg-background p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{post.category}</p>
                <p className="text-xs text-muted-foreground">{post.id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(post.id)
                    setDraftSummary(post.resolution_summary ?? "")
                  }}
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void handleDelete(post.id)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>

            {post.image_url && (
              <img
                src={post.image_url}
                alt={`Publicación de ${post.category}`}
                className="mb-3 h-44 w-full rounded-md object-cover"
              />
            )}

            {editingId === post.id ? (
              <div className="space-y-2">
                <Input
                  value={draftSummary}
                  onChange={(event) => setDraftSummary(event.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleSaveEdit(post.id)}
                  >
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground">
                {post.resolution_summary ?? "Sin resumen registrado."}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
