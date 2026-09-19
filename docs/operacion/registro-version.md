# Registro de versión y limitaciones

| Versión | Fecha | Ambiente | Qué incluye | Limitaciones abiertas |
| --- | --- | --- | --- | --- |
| Sprint 6 candidata | 2026-09-11 | Local + Supabase | PWA, heurística, muro 30 días, Push preparado | T-01–T-16 parciales |
| QA preproducción | 2026-09-17 | Supabase remoto | Storage privado, folio, descarte, Edge Functions | Sin Vercel Production |
| Cierre adaptado | 2026-09-18 | Local + QA | Tema, avatar, geocerca cliente, fotos contain, auditoría de estados, CI test | 30 pares, `strict`, CHECK geo, Lighthouse |
| audit_status_insert_policy | 2026-09-18 | Supabase QA | INSERT admin en `incident_audit_events` | — |
| Production Vercel | 2026-09-19 | `https://pwa-alcaldia.vercel.app` | PWA HTTPS, login visible, `VITE_*` en Preview/Production | SHA vivo `e1e8b12` sin `vercel.json`; 30 pares; Push en dispositivo |

Limitaciones vigentes para quien opere:

1. La geocerca se puede evadir vía API.
2. Restore de backup no se ensayó en este ciclo.
3. Las metas 30 % / 45 % de la tesis no tienen muestra real.
4. Las cabeceras de `vercel.json` no estaban en la respuesta de Production
   inspeccionada el 2026-09-19.
