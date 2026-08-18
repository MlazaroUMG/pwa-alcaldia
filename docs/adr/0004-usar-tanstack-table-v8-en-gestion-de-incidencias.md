# ADR 0004: Usar TanStack Table v8 en gestion de incidencias

## Estado

Aceptado

## Fecha

2026-08-07

## Contexto

La tabla administrativa de gestion de incidencias debe incluir busqueda, paginacion y acciones por fila, conservando la logica ya implementada para cambiar estados y abrir el dialogo de resolucion al pasar a `Resuelto`.

La referencia visual solicitada, `shadcn-admin`, usa un patron de tabla headless con columnas separadas, componente de tabla reutilizable y controles de paginacion.

## Alternativas consideradas

- Mantener la tabla shadcn basica y agregar busqueda/paginacion manual: funcionaria, pero duplicaria logica y haria crecer el componente.
- Adoptar TanStack Table v9: es la version mas reciente, pero su API exige registro explicito de features y fue publicada muy recientemente al momento de la decision.
- Usar TanStack Table v8: API estable, ampliamente usada y alineada con patrones existentes de shadcn-admin.

## Decision

Se usa `@tanstack/react-table` v8 para la tabla de gestion:

- `src/components/ui/data-table.tsx` centraliza busqueda global y renderizado.
- `src/components/ui/data-table-pagination.tsx` centraliza paginacion.
- `src/components/admin/ticket-columns.tsx` define columnas y acciones de incidentes.
- `src/components/admin/AdminTicketTable.tsx` conserva la logica de carga, cambio de estado y resolucion.

## Consecuencias positivas

- Se obtiene busqueda y paginacion con una API probada.
- La tabla administrativa queda modular y mas facil de mantener.
- Las acciones por fila permanecen cerca del dominio administrativo.
- Se evita introducir la complejidad temprana de v9.

## Consecuencias negativas

- Se agrega una dependencia adicional al bundle.
- El componente `DataTable` aun pagina en cliente; si el volumen crece, sera necesario mover paginacion y filtros al servidor.
- En una futura migracion a TanStack Table v9 habra cambios de API.

## Referencias relacionadas

- `src/components/admin/AdminTicketTable.tsx`.
- `src/components/admin/ticket-columns.tsx`.
- `src/components/ui/data-table.tsx`.
- `src/components/ui/data-table-pagination.tsx`.
- `package.json`.
- `AGENTS.md`, secciones 8.8, 14 y 16.
