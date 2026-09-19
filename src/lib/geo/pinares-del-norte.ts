export type GeoPoint = {
  latitude: number
  longitude: number
}

/**
 * Polígono operativo de Pinares del Norte / Zona 18 / Distrito IV.
 *
 * Aproximación a partir del centro OSM usado por el mapa
 * `[14.662, -90.4636]`. No es un deslinde catastral oficial y puede
 * ajustarse si la Alcaldía entrega un polígono de mayor precisión.
 */
export const PINARES_DEL_NORTE_POLYGON: GeoPoint[] = [
  { latitude: 14.6765, longitude: -90.4782 },
  { latitude: 14.6788, longitude: -90.4584 },
  { latitude: 14.6724, longitude: -90.4458 },
  { latitude: 14.6612, longitude: -90.4406 },
  { latitude: 14.6506, longitude: -90.4468 },
  { latitude: 14.6468, longitude: -90.4614 },
  { latitude: 14.6494, longitude: -90.4768 },
  { latitude: 14.6618, longitude: -90.4824 },
]

export const PINARES_DEL_NORTE_CENTER: [number, number] = [14.662, -90.4636]

export const GEOFENCE_OUTSIDE_MESSAGE =
  "La ubicación debe estar dentro de Pinares del Norte, Zona 18, Distrito IV."

function isOnSegment(point: GeoPoint, start: GeoPoint, end: GeoPoint) {
  const cross =
    (point.longitude - start.longitude) * (end.latitude - start.latitude) -
    (point.latitude - start.latitude) * (end.longitude - start.longitude)

  if (Math.abs(cross) > 1e-12) {
    return false
  }

  const withinLongitude =
    point.longitude >= Math.min(start.longitude, end.longitude) - 1e-12 &&
    point.longitude <= Math.max(start.longitude, end.longitude) + 1e-12
  const withinLatitude =
    point.latitude >= Math.min(start.latitude, end.latitude) - 1e-12 &&
    point.latitude <= Math.max(start.latitude, end.latitude) + 1e-12

  return withinLongitude && withinLatitude
}

/**
 * Ray-casting propio. El punto sobre un borde se considera dentro.
 */
export function pointInPolygon(point: GeoPoint, polygon: GeoPoint[] = PINARES_DEL_NORTE_POLYGON) {
  if (polygon.length < 3) {
    return false
  }

  let inside = false

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const current = polygon[index]
    const last = polygon[previous]

    if (isOnSegment(point, last, current)) {
      return true
    }

    const intersects =
      current.latitude > point.latitude !== last.latitude > point.latitude &&
      point.longitude <
        ((last.longitude - current.longitude) * (point.latitude - current.latitude)) /
          (last.latitude - current.latitude) +
          current.longitude

    if (intersects) {
      inside = !inside
    }
  }

  return inside
}

export function isWithinPinaresDelNorte(latitude: number, longitude: number) {
  return pointInPolygon({ latitude, longitude })
}

export function getPinaresMaxBounds(padding = 0.012): [[number, number], [number, number]] {
  const latitudes = PINARES_DEL_NORTE_POLYGON.map((point) => point.latitude)
  const longitudes = PINARES_DEL_NORTE_POLYGON.map((point) => point.longitude)

  return [
    [Math.min(...latitudes) - padding, Math.min(...longitudes) - padding],
    [Math.max(...latitudes) + padding, Math.max(...longitudes) + padding],
  ]
}

export function getPinaresLeafletRing(): [number, number][] {
  return PINARES_DEL_NORTE_POLYGON.map((point) => [point.latitude, point.longitude])
}
