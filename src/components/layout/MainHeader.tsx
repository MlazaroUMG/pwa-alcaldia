/**
 * Top-level branded header for the Alcaldia PWA.
 *
 * Provides visual identity and context across citizen and admin modules
 * while keeping a compact, mobile-friendly structure.
 *
 * @component
 * @module Layout
 * @returns {JSX.Element} Sticky-looking brand header with official logo.
 */
export function MainHeader() {
  return (
    <header className="w-full bg-muni-blue text-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-white/80 sm:text-sm">
            Alcaldia Auxiliar
          </p>
          <h1 className="truncate text-base font-semibold sm:text-xl">
            Zona 18 - Panel y Reportes Ciudadanos
          </h1>
        </div>

        <img
          src="/logo.png"
          alt="Alcaldía Auxiliar Zona 18"
          className="h-12 w-auto shrink-0"
        />
      </div>
    </header>
  )
}
