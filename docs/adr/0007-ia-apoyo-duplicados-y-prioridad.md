# ADR 0007: IA de apoyo para duplicados y prioridad

- Fecha: 2026-09-11
- Estado: Aceptado

## Contexto

Reportes cercanos pueden describir la misma incidencia con textos distintos.
El Sprint 6 requiere advertirlo sin sustituir el criterio ciudadano ni la
decisión administrativa. También se necesita una prioridad sugerida
comprensible, reproducible y sin costo de un proveedor externo.

Los datos de entrada son descripción, categoría, dependencia, tipo de llamada,
coordenadas y fecha. Las coordenadas y descripciones son sensibles, por lo que
no deben devolverse al consultar coincidencias.

## Alternativas consideradas

1. Servicio LLM o embeddings externos: mejor comprensión semántica, pero agrega
   costo, secretos, transferencia de datos sensibles y dependencia operativa.
2. Modelo entrenado propio: no existe un conjunto histórico etiquetado con
   calidad suficiente para entrenamiento y evaluación.
3. Reglas deterministas en PostgreSQL: distancia, ventana temporal, clasificación
   y similitud trigram. Es auditable, económica y adecuada como primera señal.

## Decisión

Se adopta la tercera alternativa mediante la RPC
`suggest_incident_duplicates`, disponible solo para usuarios autenticados.

- Radio máximo: 80 metros.
- Ventana: 14 días.
- Estados considerados: `Pendiente` y `En Progreso`.
- Coincidencia: misma dependencia/tipo de llamada, o misma categoría con
  similitud textual de al menos 0.25.
- Salida sanitizada: categoría, tipo de llamada, distancia agrupada en 40/80
  metros, similitud redondeada y fecha truncada al día. No devuelve ID de usuario, coordenadas exactas,
  descripción ni fotografía.
- Máximo de sugerencias: tres.
- Límite por usuario autenticado: 20 verificaciones por hora.

La prioridad sugerida usa reglas explícitas: agua potable, drenajes,
infraestructura vial o reportes abiertos por más de tres días se marcan como
alta; el resto como media.

La señal es exclusivamente consultiva. El ciudadano puede cancelar o elegir
“Enviar de todos modos”. El sistema no fusiona reportes, no cambia categorías,
no altera estados y no resuelve incidencias automáticamente.

## Consecuencias positivas

- No se envían datos a terceros ni se agregan costos por inferencia.
- El resultado es reproducible, explicable y fácil de ajustar.
- La interfaz mantiene confirmación humana obligatoria.
- El índice trigram mejora las búsquedas sobre descripciones.

## Consecuencias negativas

- La similitud trigram no comprende sinónimos ni contexto.
- El GPS impreciso puede causar falsos positivos o negativos.
- Los umbrales deben revisarse con datos reales anonimizados.
- La insignia administrativa reproduce la regla en cliente para evitar
  consultas N+1; la RPC continúa siendo la fuente de validación previa al alta.

## Seguridad y operación

La RPC usa `SECURITY DEFINER`, `search_path` vacío, privilegio revocado para
`anon`, perfil ciudadano completo, límite temporal y retorno mínimo. RLS
sigue protegiendo las tablas base. El muro usa una RPC autenticada limitada
y no concede acceso público a la tabla `incidents`. Los umbrales no deben
presentarse como certeza ni usarse para negar el registro.

## Reversión

Se puede revocar y eliminar la RPC y el índice trigram sin modificar
incidencias. La interfaz vuelve al envío directo retirando el diálogo y la
consulta previa. La extensión `pg_trgm` puede conservarse porque no altera
datos ni permisos existentes.

## Referencias

- `AGENTS.md`, sección 18.4.
- Migración Sprint 6 de duplicados, expiración del muro y Web Push.
