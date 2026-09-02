import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Clock3, Pencil, Trash2, UsersRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"

interface WallPost {
  id: string
  title: string
  category: string
  dependency: string | null
  call_type_code: number | null
  call_type_label: string | null
  resolution_summary: string | null
  resolution_image_url: string | null
  resolved_at: string | null
}

function formatResolvedDate(value: string | null) {
  if (!value) {
    return "Sin fecha"
  }

  return new Date(value).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

/**
 * Administrative moderation panel for public wall content.
 *
 * Allows post-level edits to resolution summaries and controlled
 * unpublishing. The query intentionally fetches only data needed for the
 * public projection, avoiding user id, coordinates and original description.
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
        .select("id,title,category,dependency,call_type_code,call_type_label,resolution_summary,resolution_image_url,resolved_at")
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
    <section className="min-h-0 flex-1 overflow-y-auto bg-[#f7f9fc] p-6 dark:bg-[#0d0b45]">
      <div className="w-full">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100">
              Muro Público
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-indigo-200">
              Resoluciones visibles para la comunidad. Se eliminan automáticamente a
              los 30 días.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            <AlertCircle className="size-4" />
            {posts.length} publicaciones activas
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <UsersRound className="mx-auto mb-4 size-12 opacity-30" />
            <p className="font-medium">No hay publicaciones en el muro</p>
            <p className="mt-1 text-sm">
              Las resoluciones marcadas como públicas aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-[#2a278f] dark:bg-[#1e1b7a]"
              >
                {post.resolution_image_url ? (
                  <img
                    src={post.resolution_image_url}
                    alt={`Resolución de ${post.category}`}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                    <CheckCircle2 className="size-10 text-emerald-500" />
                  </div>
                )}

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {post.category}
                      </span>
                      <h3 className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                        {post.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {post.dependency ?? "Sin dependencia"}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                        {post.call_type_code && post.call_type_label
                          ? `${post.call_type_code} - ${post.call_type_label}`
                          : "Sin tipo de llamada"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(post.id)
                          setDraftSummary(post.resolution_summary ?? "")
                        }}
                        className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-indigo-50 hover:text-indigo-500"
                        title="Editar resumen"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(post.id)}
                        className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
                        title="Quitar del muro"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingId === post.id ? (
                    <div className="mb-3 space-y-2">
                      <Input
                        value={draftSummary}
                        onChange={(event) => setDraftSummary(event.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                          onClick={() => void handleSaveEdit(post.id)}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-indigo-200">
                      {post.resolution_summary ?? "Sin resumen registrado."}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400 dark:border-indigo-900">
                    <div className="flex items-center gap-1">
                      <Clock3 className="size-3" />
                      {formatResolvedDate(post.resolved_at)}
                    </div>
                    <span>Publicado</span>
                  </div>

                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full w-full rounded-full bg-green-400" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
