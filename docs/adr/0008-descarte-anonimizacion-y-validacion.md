# ADR 0008: Descarte auditable, anonimización de cuenta y validación de entradas

- Fecha: 2026-09-16
- Estado: Aceptado

## Contexto

La QA de preproducción identificó cuentas huérfanas al registrarse por correo,
ausencia de límites de entrada, fotografías públicas, imposibilidad de retirar
reportes ajenos al propósito municipal y un botón de eliminación de cuenta
inoperante. El Sprint 6 había declarado que no se eliminarían incidencias; esa
decisión se conserva en espíritu, pero se requiere un retiro reversible para
casos improcedentes.

## Alternativas consideradas

1. Borrado físico de incidencias y de usuarios Auth: rompe trazabilidad y falla
   porque `incidents.user_id` referencia `auth.users` sin `ON DELETE`.
2. Soft delete en cliente sin RLS: el ciudadano o un atacante seguirían viendo
   o restaurando registros.
3. Descarte administrativo auditable, folio secuencial, trigger de perfil,
   Storage privado y anonimización de cuenta: conserva evidencia, cumple RLS y
   permite operación municipal.

## Decisión

Se adopta la tercera alternativa.

- Las incidencias se descartan con motivo, actor y fecha. No se borra la fila
  ni las fotografías. Pueden restaurarse.
- El folio visible es `INC-000001`; el UUID permanece como clave primaria.
- El perfil ciudadano se crea con un trigger `AFTER INSERT ON auth.users`.
- El DPI es único e inmutable una vez establecido.
- Las fotografías se validan y se suben por Edge Function a un bucket privado.
- La cuenta ciudadana se anonimiza y se desactiva; los tickets se conservan.

La prioridad permanece como sugerencia consultiva (ADR 0007). No se persiste
como decisión automática.

## Consecuencias positivas

- El registro por correo ya no depende de un `upsert` anónimo.
- Los reportes improcedentes salen de los flujos normales sin perder auditoría.
- Las fotografías dejan de ser enumerables por URL pública.
- El ciudadano puede ejercer un retiro de datos personales sin destruir el
  historial municipal.

## Consecuencias negativas

- Requiere migraciones, Edge Functions y configuración remota de Storage/Auth.
- El folio puede tener huecos si una inserción falla después de consumir la
  secuencia.
- Dos teléfonos triviales existentes no se endurecen aún con CHECK de dígitos
  repetidos hasta una limpieza controlada.

## Reversión

Las columnas nuevas se pueden dejar sin uso. Las RPC de descarte/restauración
y las Edge Functions se revocan. El bucket puede volverse a público solo como
contingencia controlada. No se debe borrar el historial de descarte.

## Referencias

- `AGENTS.md`, secciones 8.5, 18.1, 18.2 y 18.3.
- ADR 0005 y ADR 0007.
- Hallazgos de QA de preproducción.
