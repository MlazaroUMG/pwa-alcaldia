interface LegalDocumentViewProps {
  title: string
  version: string
  body: string[]
  onBack: () => void
}

/**
 * Muestra un documento legal en texto claro dentro de la PWA.
 *
 * @component
 * @module Auth
 */
export function LegalDocumentView({
  title,
  version,
  body,
  onBack,
}: LegalDocumentViewProps) {
  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver
      </button>
      <header>
        <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Versión {version}</p>
      </header>
      {body.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-foreground">
          {paragraph}
        </p>
      ))}
    </article>
  )
}
