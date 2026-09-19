# Bitácora de 10 ensayos UAT

Fecha: 2026-09-18. Ambiente: Vite local (`127.0.0.1:5174`) contra el proyecto Supabase QA. Cuentas UAT fuera de Git. Sin DPI ni contraseñas en este archivo.

| ID | Resultado | Nota |
| --- | --- | --- |
| T-01 | OK | El administrador entra al dashboard. Se ven totales y recientes. |
| T-02 | OK | El ciudadano entra a la PWA. Home muestra nombre y accesos Reportar / Mis tickets. |
| T-03 | OK parcial | El formulario acepta un punto interno (`14.662, -90.4636`). La foto no se adjuntó en la automatización; no se persistió un ticket extra. |
| T-04 | OK | Un clic fuera del polígono muestra *La ubicación debe estar dentro de Pinares del Norte, Zona 18, Distrito IV* y no cambia el marcador interno. |
| T-05 | OK | En el tablero, `INC-000009` pasó de Recibido a En proceso. El detalle muestra *Volver a Recibido* / *Resolver incidencia*. |
| T-06 | OK parcial | El detalle admin muestra la evidencia con `object-contain` y `max-h-80`. El diálogo de cierre con foto nueva no se completó (clic interceptado). |
| T-07 | OK | En Mis tickets, `INC-000004` muestra la foto de resolución con `max-h-80 object-contain`. |
| T-08 | OK | Muro admin y muro ciudadano: fotos de resolución con `max-h-80 object-contain`. |
| T-09 | OK | El tema oscuro se guardó en `localStorage` y sobrevivió a recargar. Auth sigue con fondo `#edf3fb` aunque el `html` esté en `dark`. |
| T-10 | OK | Avatar admin `ML` y ciudadano `FE` (nombre y apellido, no correo). |

## Verificación automática complementaria

- `npm test`: 19 pruebas (incluye geocerca, iniciales y persistencia de tema).
- `npm run lint` y `npm run build`: sin errores.

## Pendiente explícito

- Política INSERT remota de auditoría aplicada el 2026-09-18.
- Cerrar una incidencia con foto nueva y confirmar el scroll del diálogo (T-06 restante).
- Las 30 transacciones reales y Vercel Production no se ejecutaron.
