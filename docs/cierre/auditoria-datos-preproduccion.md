# Auditoría de datos previa a las migraciones QA

Fecha: 2026-09-16. Proyecto remoto `cgpwabpfadbtbohxowxz`. Consulta de solo
lectura. No se copian DPI, correos, nombres ni fotografías.

## Resumen

| Indicador | Valor |
| --- | --- |
| Usuarios Auth | 8 |
| Perfiles | 8 |
| Usuarios sin perfil | 0 |
| DPI inválidos | 0 |
| DPI triviales | 0 |
| Grupos de DPI duplicados | 0 |
| Teléfonos inválidos | 0 |
| Teléfonos triviales (todos iguales) | 2 |
| Longitud máxima de nombre | 22 |
| Longitud máxima de apellido | 22 |
| Longitud máxima de dirección | 199 |
| Incidencias | 9 |
| Título máximo | 31 |
| Descripción máxima | 82 |
| Resumen máximo | 47 |
| Títulos cortos (< 5) | 0 |
| Descripciones cortas (< 20) | 0 |

## Decisiones de endurecimiento

- El CHECK de dirección en base queda en 200 caracteres. El cliente limita
  nuevas entradas a 160.
- El CHECK de teléfono exige 8 dígitos, pero **no** rechaza dígitos repetidos
  hasta limpiar las dos filas triviales.
- El índice único parcial de DPI se versiona con `IF NOT EXISTS`.
- No hay cuentas huérfanas que backfillear hoy. El trigger cubre altas futuras.

## Storage

El bucket `incident-photos` está público, sin límite de tamaño ni MIME. Las
políticas actuales permiten INSERT autenticado sin restringir ruta y SELECT
público. La migración local las reemplaza; el cambio remoto requiere
autorización explícita.
