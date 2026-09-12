import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
}

/**
 * Logotipo institucional recortado a sangre dentro de un contenedor redondeado.
 *
 * @component
 * @module Layout
 */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-xl border border-[#2a278f]",
        className
      )}
    >
      <img
        src="/logo.png"
        alt="Alcaldía Auxiliar Zona 18"
        className="size-full object-cover"
      />
    </span>
  )
}
