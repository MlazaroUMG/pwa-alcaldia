import { describe, expect, it } from "vitest"

import { getVisiblePageItems } from "@/lib/pagination"
import { formatTicketNumber } from "@/lib/ticket-number"
import { toUserFacingError } from "@/lib/network-errors"
import {
  dpiSchema,
  firstNameSchema,
  getPasswordIssues,
  incidentTitleSchema,
  phoneSchema,
} from "@/lib/validation"
import { detectImageMime } from "@/lib/validation/image"
import { getSuggestedPriorityDetails } from "@/lib/duplicate-suggestions"

describe("validación de entradas", () => {
  it("rechaza nombres con números", () => {
    expect(firstNameSchema.safeParse("Juan2").success).toBe(false)
    expect(firstNameSchema.safeParse("María José").success).toBe(true)
  })

  it("exige DPI y teléfono no triviales", () => {
    expect(dpiSchema.safeParse("0000000000000").success).toBe(false)
    expect(dpiSchema.safeParse("1234567890123").success).toBe(true)
    expect(phoneSchema.safeParse("11111111").success).toBe(false)
    expect(phoneSchema.safeParse("55112233").success).toBe(true)
  })

  it("exige contraseña moderna", () => {
    expect(getPasswordIssues("corto").length).toBeGreaterThan(0)
    expect(getPasswordIssues("ClaveSegura12!")).toEqual([])
  })

  it("exige títulos con letras suficientes", () => {
    expect(incidentTitleSchema.safeParse("12345").success).toBe(false)
    expect(incidentTitleSchema.safeParse("Fuga de agua en 5a avenida").success).toBe(true)
  })
})

describe("errores al usuario", () => {
  it("no expone jerga de RLS", () => {
    expect(toUserFacingError({ message: "new row violates row-level security policy" })).toBe(
      "No tienes permiso para completar esta acción."
    )
  })
})

describe("folio y prioridad", () => {
  it("formatea el folio visible", () => {
    expect(formatTicketNumber("INC-000012")).toBe("INC-000012")
    expect(formatTicketNumber(4)).toBe("INC-000004")
  })

  it("explica la prioridad sugerida", () => {
    expect(getSuggestedPriorityDetails("Agua potable").reason).toBe("categoria_critica")
    expect(getSuggestedPriorityDetails("Alumbrado público").reason).toBe("estandar")
  })
})

describe("firmas de imagen", () => {
  it("detecta JPEG y rechaza contenido ajeno", () => {
    expect(detectImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe(
      "image/jpeg"
    )
    expect(detectImageMime(new Uint8Array(12).fill(0))).toBeNull()
  })
})

describe("paginación administrativa", () => {
  it("muestra como máximo tres páginas y un recuadro de elipsis", () => {
    expect(getVisiblePageItems(1, 8)).toEqual([1, 2, 3, "ellipsis"])
    expect(getVisiblePageItems(2, 8)).toEqual(["ellipsis", 2, 3, 4, "ellipsis"])
    expect(getVisiblePageItems(6, 8)).toEqual(["ellipsis", 6, 7, 8])
    expect(getVisiblePageItems(1, 3)).toEqual([1, 2, 3])
  })
})
