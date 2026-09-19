# Matriz Go / No-Go de cierre

Fecha: 2026-09-19. Ambiente: código local + proyecto Supabase QA + Production
HTTPS `https://pwa-alcaldia.vercel.app`. **No incluye las 30 transacciones
reales.**

| Criterio | Estado | Evidencia | Puerta |
| --- | --- | --- | --- |
| Tema claro/oscuro sobrevive a recargar | Go de código | `ThemeProvider` lee `localStorage` al inicializar; script anti-flash en `index.html` | A |
| Avatar = iniciales de nombre y apellido | Go de código | `getAvatarInitials` + layouts ciudadano/admin | A |
| Contraste ciudadano en modo claro | Go de código | Selects e icono Luna en gris oscuro | A |
| Auth siempre paleta clara | Go de código | `AuthLightShell` + clases explícitas | A |
| Foto completa en detalle, resolución y muro | Go de código | `object-contain` + `max-h-80` / kanban `max-h-40` | A |
| Geocerca Pinares del Norte | Go de cliente | Mapa + Zod; sin CHECK SQL remoto | A |
| Auditoría de transiciones de estado | Go remoto | INSERT RLS `Admins can insert incident audit` aplicada el 2026-09-18 | B |
| CI con `npm test` | Go local | `.github/workflows/ci.yml` | B |
| Cabeceras Vercel preparadas | Go de archivo | `vercel.json` local; no estaban en el SHA `e1e8b12` vivo el 2026-09-19 | B / D |
| 10 ensayos UAT estructurados | Ver bitácora | `docs/pruebas/bitacora-10-ensayos.md` | C |
| Preview/Production Vercel | Go de plataforma | Alias Production HTTP 200; login visible; `VITE_*` configuradas | D |
| 30 transacciones reales AS-IS/TO-BE | No-Go | Tras despliegue en la Alcaldía | E |
| TypeScript `strict` | Deuda | No se activó: rompería el build actual | E / Cap. VI |
| CHECK geográfico en Postgres | Deuda | Bypass API documentado hasta autorizar migración | E |

## Decisión de este ciclo

**Go para pulido local, ensayos UAT, política INSERT de auditoría en QA y
Production HTTPS identificada.** No-Go para métricas de tesis con ciudadanos
reales. El SHA vivo al inspeccionar no incluía aún `vercel.json` ni el
cierre adaptado; el push a `master` es el que publica ese corte.
