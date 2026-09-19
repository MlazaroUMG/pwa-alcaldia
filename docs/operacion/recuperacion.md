# Recuperación y respaldos

## Qué se respalda

- Base PostgreSQL del proyecto Supabase (esquema + datos).
- Bucket `incident-photos`.
- Configuración de Auth (sin exportar contraseñas).
- Código en GitHub (no sustituye el respaldo de datos).

## Antes de una migración remota

1. Identificar el proyecto (`cgpwabpfadbtbohxowxz` en este corte).
2. Crear respaldo desde el Dashboard de Supabase (Database → Backups).
3. Anotar fecha, autor y motivo en `registro-version.md`.
4. Aplicar primero en un entorno aislado si la migración es destructiva.
   Las migraciones de este cierre fueron aditivas.

## Restauración

1. Restaurar el backup elegido en Supabase (punto en el tiempo o backup
   diario, según el plan del proyecto).
2. Verificar conteos: `profiles`, `incidents`, `incident_audit_events`.
3. Verificar que una foto firmada sigue abriendo para admin.
4. No reaplicar a ciegas migraciones posteriores al punto restaurado.

Este procedimiento **no se ensayó de punta a punta** en el ciclo de cierre.
Debe ejecutarse un restore de prueba en ventana controlada antes de declarar
Cierre técnico de Production.

## Reversión puntual de la política de auditoría

```sql
drop policy if exists "Admins can insert incident audit"
  on public.incident_audit_events;
```

El descarte sigue funcionando por RPC. Las transiciones de tablero dejarían
de auditarse hasta recrear la política.

## Contingencia de Storage

Volver el bucket a público solo como último recurso y por tiempo limitado:
expone evidencias. Preferir corregir policies y la Edge Function.
