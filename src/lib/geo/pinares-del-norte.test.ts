import { describe, expect, it } from "vitest"

import {
  GEOFENCE_OUTSIDE_MESSAGE,
  PINARES_DEL_NORTE_CENTER,
  isWithinPinaresDelNorte,
  pointInPolygon,
} from "@/lib/geo/pinares-del-norte"

describe("geocerca Pinares del Norte", () => {
  it("acepta el centro operativo de Zona 18", () => {
    expect(
      isWithinPinaresDelNorte(PINARES_DEL_NORTE_CENTER[0], PINARES_DEL_NORTE_CENTER[1])
    ).toBe(true)
  })

  it("rechaza un punto fuera del Distrito IV", () => {
    expect(isWithinPinaresDelNorte(14.634, -90.506)).toBe(false)
    expect(pointInPolygon({ latitude: 14.6, longitude: -90.5 })).toBe(false)
  })

  it("expone el mensaje en español", () => {
    expect(GEOFENCE_OUTSIDE_MESSAGE).toContain("Pinares del Norte")
  })
})
