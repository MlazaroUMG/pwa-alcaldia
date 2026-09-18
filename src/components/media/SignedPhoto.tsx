import { useEffect, useState } from "react"

import { getSignedIncidentPhotoUrl } from "@/lib/incident-photos"

interface SignedPhotoProps {
  path: string | null | undefined
  alt: string
  className?: string
}

/**
 * Muestra una fotografía de incidencia mediante URL firmada o pública heredada.
 */
export function SignedPhoto({ path, alt, className }: SignedPhotoProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void getSignedIncidentPhotoUrl(path).then((nextUrl) => {
      if (!cancelled) {
        setUrl(nextUrl)
      }
    })

    return () => {
      cancelled = true
    }
  }, [path])

  if (!url) {
    return null
  }

  return <img src={url} alt={alt} className={className} />
}
