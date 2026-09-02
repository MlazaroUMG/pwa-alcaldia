/**
 * Descarga una evidencia de incidencia. Si CORS impide el blob, abre una pestaña.
 */
export async function downloadIncidentImage(imageUrl: string, title: string) {
  const safeName = title
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w.-]/g, "")
    .toLowerCase()
  const filename = `evidencia-${safeName || "incidencia"}.jpg`

  try {
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error("No se pudo descargar la imagen.")
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  } catch {
    window.open(imageUrl, "_blank", "noopener,noreferrer")
  }
}
