import { describe, expect, it } from "vitest"

import { getAvatarInitials } from "@/lib/avatar-initials"

describe("iniciales de avatar", () => {
  it("usa la primera letra del nombre y del apellido", () => {
    expect(getAvatarInitials("Marvin", "Lázaro", "correo@example.com")).toBe("ML")
  })

  it("usa dos letras del nombre disponible si falta el otro", () => {
    expect(getAvatarInitials("Ana", null, "correo@example.com")).toBe("AN")
    expect(getAvatarInitials(undefined, "Pérez", "correo@example.com")).toBe("PÉ")
  })

  it("cae al correo cuando no hay nombre", () => {
    expect(getAvatarInitials(null, null, "ciudadano@example.com")).toBe("CI")
  })

  it("usa US cuando no hay datos", () => {
    expect(getAvatarInitials(null, null, null)).toBe("US")
  })
})
