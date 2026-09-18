import { supabase } from "@/lib/supabaseClient"
import { toUserFacingError } from "@/lib/network-errors"
import { assertValidImageFile } from "@/lib/validation/image"

export type IncidentPhotoKind = "evidence" | "resolution"

interface UploadIncidentPhotoInput {
  incidentId: string
  file: File
  kind: IncidentPhotoKind
}

export async function uploadIncidentPhoto({
  incidentId,
  file,
  kind,
}: UploadIncidentPhotoInput) {
  await assertValidImageFile(file)

  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (!accessToken) {
    throw new Error("Inicia sesión para adjuntar una fotografía.")
  }

  const formData = new FormData()
  formData.set("incidentId", incidentId)
  formData.set("kind", kind)
  formData.set("file", file)

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-incident-photo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  )

  const payload = (await response.json().catch(() => null)) as
    | { path?: string; signedUrl?: string; error?: string }
    | null

  if (!response.ok || !payload?.path) {
    throw new Error(
      toUserFacingError(
        { message: payload?.error },
        "No se pudo guardar la fotografía. Inténtalo de nuevo."
      )
    )
  }

  return {
    path: payload.path,
    signedUrl: payload.signedUrl ?? null,
  }
}

export async function getSignedIncidentPhotoUrl(path: string | null | undefined) {
  if (!path) {
    return null
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const { data, error } = await supabase.storage
    .from("incident-photos")
    .createSignedUrl(path, 60 * 10)

  if (error) {
    return null
  }

  return data.signedUrl
}
