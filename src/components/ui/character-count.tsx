interface CharacterCountProps {
  value: string
  max: number
}

/**
 * Contador visible de caracteres para campos con tope.
 */
export function CharacterCount({ value, max }: CharacterCountProps) {
  return (
    <p className="text-right text-xs text-muted-foreground">
      {value.length}/{max}
    </p>
  )
}
