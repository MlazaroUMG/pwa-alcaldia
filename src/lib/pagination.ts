/**
 * Ventana deslizante de 3 páginas, con elipsis cuando el total es mayor.
 * Al avanzar, el primer número visible se desplaza con la página actual.
 */
export function getVisiblePageItems(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  if (total <= 0) {
    return []
  }

  if (total <= 3) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const start = Math.min(Math.max(current, 1), total - 2)
  const pages = [start, start + 1, start + 2]
  const items: Array<number | "ellipsis"> = []

  if (start > 1) {
    items.push("ellipsis")
  }

  items.push(...pages)

  if (start + 2 < total) {
    items.push("ellipsis")
  }

  return items
}
