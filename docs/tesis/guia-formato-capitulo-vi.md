# Cómo pasar este borrador al Capítulo VI en Word

Este archivo no es el capítulo institucional. Indica cómo trasladar
`docs/tesis/capitulo-vi.md` a Word sin cambiar el sentido técnico.

## Formato institucional

- Fuente: Times New Roman 12.
- Interlineado: 1.5.
- Texto justificado, sin sangría de párrafo.
- El capítulo inicia en página nueva.
- Título del capítulo: 16 puntos, negrita.
- Títulos 6.1 a 6.5: 14 puntos, negrita.
- Introducción general **antes** de 6.1.
- Extensión objetivo: 15 a 20 páginas más anexos.

## Figuras y tablas

Cada tabla o figura del borrador debe copiarse así:

1. Número: `Tabla 6.x` o `Figura 6.x`.
2. Título breve en la parte superior (tablas) o inferior (figuras), según la
   convención del documento institucional.
3. Comentario de una o dos oraciones que interprete el dato, no que lo repita.
4. Fuente: repositorio, bitácora, ADR o “elaboración propia”.

Las capturas de anexos deben usar datos ficticios o anonimizados. No incluir
DPI, contraseñas, URLs firmadas completas ni coordenadas exactas de ciudadanos.

## Referencias

- Las notas al pie del borrador se marcan como `[N]`. En Word, convertirlas a
  notas al pie reales.
- La bibliografía se concentra al final del documento institucional, no dentro
  de este capítulo salvo que el formato de la facultad lo exija por capítulo.

## Afirmaciones que no deben copiarse de versiones antiguas

No afirmar en el Word lo siguiente, porque no coincide con el repositorio:

- React Router o rutas URL por módulo.
- `vite-plugin-pwa` como generador del Service Worker.
- Node.js como runtime de las Edge Functions (el runtime es Deno).
- Compresión automática de imágenes en cliente.
- Actualización “en tiempo real” de tickets.
- TypeScript `strict` ya activo.
- IA semántica o auto-categorización vinculante.

La navegación es por estado local en layouts. El Service Worker es manual. La
prioridad y los duplicados son heurísticos consultivos (ADR 0007).
