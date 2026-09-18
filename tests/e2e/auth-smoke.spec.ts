import { expect, test } from "@playwright/test"

test("muestra el acceso público sin filtrar jerga interna", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Bienvenido" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible()
  await expect(page.getByText("políticas RLS")).toHaveCount(0)
})
