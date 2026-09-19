# Plan e informe de pruebas (cierre)

## Plan

| Capa | Artefacto | Criterio |
| --- | --- | --- |
| Unitaria | `npm test` | 19 pruebas en verde |
| Estática | `npm run lint`, `npm run build` | Sin errores |
| Humo E2E | `npm run test:e2e` | Login visible, sin jerga RLS |
| UAT laboratorio | `protocolo-10-ensayos.md` | Bitácora sin secretos |
| Aceptación Sprint 6 | T-01–T-16 | Pendiente en HTTPS/móvil |
| Campo | `plantilla-30-transacciones.md` | Después de Production en la Alcaldía |

## Informe al 2026-09-18

Ejecutado: unitarias, lint, build, 10 ensayos UAT (8 OK, 2 parciales).

No ejecutado: Lighthouse, WCAG formal, restore, 30 pares, T-12/T-14 Push/PWA
en dispositivo, cierre con foto nueva (T-06 restante).

Defectos abiertos de alcance: geocerca solo en cliente; `strict` inactivo.

Evidencia: `docs/pruebas/bitacora-10-ensayos.md`,
`docs/cierre/registro-defectos.md`.
