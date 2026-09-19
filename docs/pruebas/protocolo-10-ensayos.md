# Protocolo de 10 ensayos UAT (locales)

Cuentas de ensayo fuera de Git. No copiar contraseñas, DPI ni teléfonos reales a este repositorio.

## Preparación

1. Variables `VITE_SUPABASE_*` locales apuntando al proyecto QA.
2. `npm run dev`.
3. Navegador con permisos de cámara/GPS disponibles o con fallback al mapa.

## Casos

| ID | Actor | Flujo | Resultado esperado |
| --- | --- | --- | --- |
| T-01 | Admin | Iniciar sesión | Entra al dashboard administrativo |
| T-02 | Ciudadano | Iniciar sesión | Entra a la PWA ciudadana |
| T-03 | Ciudadano | Reportar con foto y GPS **dentro** de la geocerca | El ticket se crea con folio |
| T-04 | Ciudadano | Intentar confirmar un punto **fuera** de Pinares del Norte | El mapa rechaza y el envío no procede |
| T-05 | Admin | Tablero: Pendiente → En Progreso | El ticket cambia de columna |
| T-06 | Admin | Cerrar incidencia con foto de resolución | El diálogo hace scroll y confirma; la foto se ve completa (`contain`) |
| T-07 | Ciudadano | Ver resolución en Mis tickets | La foto de cierre se ve entera |
| T-08 | Ciudadano / Admin | Muro comunitario | La foto publicada se ve completa |
| T-09 | Ambos | Cambiar tema y recargar | El tema persistido se conserva |
| T-10 | Ambos | Avatar | Muestra iniciales de nombre y apellido |

## Registro

Usar `docs/pruebas/bitacora-10-ensayos.md`. Anotar fecha, resultado (OK / Falla / Bloqueado) y nota sin secretos.

## Fuera de este protocolo

Las 30 transacciones pareadas AS-IS/TO-BE se ejecutan después del despliegue en la Alcaldía Auxiliar, con ciudadanos reales y datos anonimizados. Plantilla: `docs/pruebas/plantilla-30-transacciones.md`.
