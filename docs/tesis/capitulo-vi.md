# Capítulo VI. Calidad, validación, despliegue y transferencia

Borrador técnico para trasladar a Word institucional. Fecha de corte:
2026-09-19. No sustituye el documento Word ni fabrica métricas de las 30
transacciones reales.

## Introducción

Este capítulo describe cómo se controló la calidad del Sistema de Gestión de
Incidencias de la Alcaldía Auxiliar de Zona 18, Distrito IV; qué se validó de
forma continua; hasta dónde llega la validación final del producto; cómo se
prepara el despliegue y la transferencia; y qué lecciones quedan para el
trabajo futuro.

El sistema complementa la recepción informal de denuncias (WhatsApp, ventanilla
o llamada) con una PWA ciudadana y un tablero administrativo. No es un CRM ni
una mesa de ayuda comercial. La autorización real vive en Row Level Security
de Supabase, no solo en la interfaz.[1]

El corte de evidencia distingue tres capas: (a) implementación y pruebas
locales, (b) preproducción en el proyecto Supabase `cgpwabpfadbtbohxowxz` y
(c) producción HTTPS en Vercel más las 30 observaciones pareadas en la
Alcaldía. Las capas (a) y (b) tienen evidencia. De (c) ya existe Production
en `https://pwa-alcaldia.vercel.app`; las 30 observaciones reales siguen
pendientes.

---

## 6.1 Calidad y Definición de Terminado

### 6.1.1 Evolución de la Definición de Terminado

La DoD no nació completa. En los sprints 1 a 5 bastaba con que la historia
fuera usable en local, con RLS coherente y sin secretos en Git. El Sprint 6
añadió PWA, Push preparado e IA consultiva. La QA de preproducción endureció
Storage privado, folio, descarte auditable, validación centralizada y
anonimización. El cierre adaptado agregó persistencia de tema, geocerca de
cliente, fotos completas y auditoría de transiciones de estado.

**Tabla 6.1.** Evolución de la Definición de Terminado.

| Etapa | Criterio mínimo para integrar | Qué faltaba aún |
| --- | --- | --- |
| Sprints 1–5 | Flujo usable, RLS por rol, sin secretos en el repo | Suite automatizada, Storage privado, folio |
| Sprint 6 | Candidata: PWA, heurística de duplicados, muro con expiración | Aceptación T-01–T-16, VAPID, HTTPS |
| QA preproducción | Validación Zod, Storage privado, descarte, Edge Functions | Geocerca, tema persistente, auditoría de estados |
| Cierre adaptado | DoD de producto + 10 ensayos UAT + CI con `npm test` | Push del cierre a `master`, 30 pares reales, TypeScript `strict` |

Comentario: la DoD se endureció cuando el riesgo pasó de “funciona” a “no
filtra datos personales ni pierde trazabilidad”. Fuente: plantillas de
entrega, ADR 0008 y `docs/cierre/`.

### 6.1.2 Pruebas mínimas por historia

Cada historia de usuario del MVP se acepta solo si cumple, como mínimo:

1. Flujo principal en el rol correcto (ciudadano o admin).
2. Caso negativo (permiso denegado, GPS fallido, dato inválido o fuera de
   geocerca).
3. Autorización en servidor (la UI no es suficiente).
4. Mensaje de error comprensible, sin SQL ni jerga de RLS.
5. Evidencia de lint/build o prueba unitaria cuando la regla es pura.

**Tabla 6.2.** Correspondencia HU / función / prueba mínima.

| HU | Función actual | Prueba mínima |
| --- | --- | --- |
| HU-01 Clasificación inicial del reporte | F-02 | Validar campos obligatorios y selección de categoría |
| HU-02 Fotografía con cámara | F-02 | Adjuntar JPG/PNG y almacenar de forma segura |
| HU-03 Geolocalización | F-02 | Permiso de ubicación y marcador interactivo |
| HU-04 Seguimiento y resolución | F-04 | Transiciones visibles y foto de resolución |
| HU-05 Lista centralizada de tickets | F-05, F-11 | Tablero con filtros por zona, estado y prioridad |
| HU-06 Cambio de estado | F-06 | Actualización en la DB protegida por RLS |
| HU-07 Cierre con evidencia y notas | F-07 | Resumen de resolución obligatorio |
| HU-08 Publicación en el Muro | F-08 | Publicar resueltos anonimizando identidad |
| HU-09 Alerta de duplicado | F-03 | Aviso en pantalla por coordenadas y semántica |

Los identificadores HU corresponden al Capítulo V. El inventario
operativo del repositorio es F-01 a F-12 del Sprint 6. Fuente: matriz de
historias del documento de planificación.

### 6.1.3 Severidad y cierre de defectos

Un defecto se cierra solo con reproducción, corrección, prueba y revisión de
regresión. Las severidades usadas en el cierre son: crítica, alta, media y
baja.

**Tabla 6.3.** Defectos del cierre adaptado (2026-09-18).

| ID | Severidad | Estado |
| --- | --- | --- |
| DEF-01 a DEF-04, DEF-07 | Media / baja | Corregidos |
| DEF-05 Geocerca solo en cliente | Alta (alcance) | Mitigado; CHECK SQL aplazado |
| DEF-06 Auditoría de estados | Media | Corregido (código + política INSERT remota) |

Flujo de calidad: cambio local → `npm test` / `lint` / `build` → bitácora UAT
si toca flujo visible → integración. CI en GitHub Actions ejecuta tests,
build y lint en `master`/`main` y pull requests.

**Figura 6.1.** Flujo de calidad (describir en Word como diagrama):
autor → pruebas locales → CI → QA en Supabase → UAT → Preview Git →
Production `https://pwa-alcaldia.vercel.app`.

---

## 6.2 Pruebas y validación continua

### 6.2.1 Estrategia por niveles

**Tabla 6.4.** Pirámide de pruebas aplicada.

| Nivel | Qué cubre | Estado al corte |
| --- | --- | --- |
| Unitarias (Vitest) | Validación Zod, folio, geocerca, iniciales, tema, errores de red | 19 pruebas en verde |
| Humo E2E (Playwright) | Pantalla de acceso sin jerga interna | Opcional en CI (requiere Chromium) |
| UAT estructurada | T-01 a T-10 del cierre adaptado | Bitácora 2026-09-18 |
| RLS / Storage | Policies, bucket privado, RPC de muro | Aplicado en remoto QA |
| No funcionales | Contraste, teclado, PWA, cabeceras | Parcial; Lighthouse no corrido en este ciclo |

No se afirma cobertura de líneas porcentual: Vitest cubre reglas puras, no
todos los componentes.

### 6.2.2 Ambientes y datos

- Local: Vite + `.env` con `VITE_SUPABASE_URL` y clave publicable.
- QA/preproducción: mismo proyecto Supabase, datos de ensayo. No copiar
  producción a local.
- Production Vercel: `https://pwa-alcaldia.vercel.app` (equipo `pwa-alcaldia`,
  Hobby, framework Vite, región `iad1`). Preview Git de `master`:
  `https://pwa-alcaldia-git-master-pwa-alcaldia.vercel.app`.

Los datos de evidencia académica se anonimizan. Las cuentas UAT no se
versionan.

### 6.2.3 Resultados por módulo

**Tabla 6.5.** Resumen T-01 a T-16 (Sprint 6) y T-01 a T-10 (cierre).

| Serie | Alcance | Resultado honesto |
| --- | --- | --- |
| T-01–T-16 Sprint 6 | Seguridad RLS, Google incompleto, GPS, duplicados, kanban, muro, Push, PWA, lint/build | T-10 y T-16 con evidencia estructural/local; el resto sigue pendiente de aceptación formal en HTTPS/móvil |
| T-01–T-10 cierre | Login, geocerca, tablero, fotos, tema, avatar | 8 OK y 2 OK parcial (foto de envío y diálogo de cierre con foto nueva) |

No se mezclan ambas series como si fueran el mismo protocolo. La serie del
Sprint 6 permanece como deuda de aceptación. La del cierre documenta el
pulido post-QA.

### 6.2.4 Requerimientos no funcionales

- Accesibilidad: se buscó contraste institucional, foco visible y textos en
  español. No hay auditoría formal WCAG 2.1 AA con herramienta automatizada
  en este corte.
- Rendimiento: paginación 5/10/25/50 en listados admin; el bundle de Vite
  supera 500 kB minificados (aviso del build). No se ejecutó Lighthouse.
- PWA: `manifest.webmanifest`, iconos 192/512, Service Worker manual. La
  instalación en Android requiere HTTPS de Production.
- Seguridad HTTP: la plataforma ya envía `Strict-Transport-Security`.
  `vercel.json` declara `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options` y `Permissions-Policy`; esas cuatro no estaban en la
  respuesta de Production inspeccionada el 2026-09-19 (SHA `e1e8b12`, sin
  `vercel.json` en Git). Aplican a los despliegues posteriores que incluyan
  el archivo.

**Figura 6.2.** Reservar captura de CI verde y de la bitácora UAT (sin
correos).

---

## 6.3 Validación final del producto

### 6.3.1 Narrativa del ticket de extremo a extremo

1. El ciudadano inicia sesión, completa perfil si vino de Google, y reporta
   con título, descripción, dependencia, tipo de llamada, fotografía y punto
   dentro de Pinares del Norte / Zona 18 / Distrito IV.
2. Si hay un caso abierto similar a menos de 80 m, el sistema sugiere
   duplicado. El ciudadano decide.
3. Se crea el ticket con folio `INC-000001` en adelante y estado Pendiente.
4. El administrador verifica identidad, mueve a En progreso y cierra con
   foto, resumen y opción de publicar.
5. El ciudadano ve la resolución en Mis tickets. El muro, si se publicó,
   muestra categoría, resumen, foto de resolución y fecha; nunca identidad,
   DPI, coordenadas ni la descripción original.
6. A los 30 días la publicación se despublica; la fila no se borra.

Esta narrativa está implementada. Production ya sirve la PWA por HTTPS. El
eslabón Push en dispositivo real y la instalación en Android siguen
pendientes de ensayo en el teléfono de referencia.

### 6.3.2 Cumplimiento del MVP

**Tabla 6.6.** Historias del MVP.

| Historia | Decisión | Observación |
| --- | --- | --- |
| HU-01 a HU-08 | Aceptadas en código | Falta aceptación formal T-01–T-16 en algunos bordes |
| HU-09 Alerta de duplicado | Aceptada en código | Heurística consultiva (ADR 0007); confirmación humana |
| LLM / CRM / cola offline | Fuera de alcance | No implementar como si existieran |
| IA semántica vinculante | Descartada | ADR 0007: apoyo, no decisión automática |
| 30 pares AS-IS/TO-BE | Pospuesta | Tras despliegue en la Alcaldía |

### 6.3.3 Hipótesis y 30 observaciones

La tesis plantea reducir tiempos de gestión (meta de referencia 30 %) y
aumentar trazabilidad (meta de referencia 45 %). Esas metas **no se
confirman ni se niegan** con datos inventados.

Al corte solo existen:

- Plantilla de 30 pares en `docs/pruebas/plantilla-30-transacciones.md`.
- Fórmulas previstas: variación `(promedio_ASIS − promedio_TOBE) / promedio_ASIS × 100`
  y trazabilidad `tickets_con_5_checkpoints / total × 100`.
- Diez ensayos UAT de laboratorio, no 30 transacciones ciudadanas reales.

Cuando se midan los 30 pares se reportarán promedio, mediana, mínimo, máximo
y dispersión. Si la muestra no alcanza las metas, el capítulo debe decirlo.

### 6.3.4 Limitaciones de la validación final

- Geocerca evitable si se inserta por API.
- TypeScript `strict` no activo.
- Lighthouse, auditoría WCAG formal y restore de base no ensayados en este
  ciclo.
- Un ensayo UAT movió `INC-000009` a En proceso; no se fabricó un cierre con
  foto nueva.

---

## 6.4 Despliegue y transferencia

### 6.4.1 Arquitectura final

**Figura 6.3.** Arquitectura (diagrama a redibujar):

```text
PWA React/Vite (ciudadano mobile-first)
Dashboard React (admin desktop-first)
        │
        ▼
Supabase Auth + PostgreSQL + RLS
Storage privado incident-photos (URLs firmadas)
Edge Functions Deno: upload-incident-photo, anonymize-account, send-push
        │
        ▼
Vercel (Preview / Production) — cabeceras en vercel.json
```

No hay backend Node propio. Leaflet/OSM no usa API key de pago. La
navegación no usa React Router (ADR 0003).

**Tabla 6.7.** Contratos y secretos (nombres, no valores).

| Destino | Variables |
| --- | --- |
| Frontend / Vercel | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_VAPID_PUBLIC_KEY` |
| Edge Functions | `VAPID_*`, `PUSH_WEBHOOK_SECRET`, claves internas de Supabase |

### 6.4.2 Preview, Production y rollback

Procedimiento identificado el 2026-09-19 (no se inventan métricas de las 30
transacciones):

1. El proyecto Vercel `pwa-alcaldia` (`prj_kQW8GemUL7chHJBNjUD1L1gqFRv8`)
   está enlazado a GitHub `MlazaroUMG/pwa-alcaldia`. Cada push a `master`
   dispara Production; otras ramas disparan Preview.
2. Variables presentes en Preview y Production (nombres, no valores):
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
   `VITE_VAPID_PUBLIC_KEY`.
3. Smoke de humo en Production: `GET https://pwa-alcaldia.vercel.app/`
   respondió HTTP 200; el HTML de login (“Bienvenido”, correo, contraseña,
   Google) se renderizó. No se ejecutó el flujo completo de ambos roles en
   este corte remoto. Sin errores de runtime agrupados en los 7 días
   previos a la inspección.
4. Deployment de Production inspeccionado: `dpl_2fjdVSAvkiRsir6EJ3M15YXG2tpd`,
   estado READY, origen git, SHA `e1e8b128418c5ce6973db2c729c5a9bc4c25af09`
   (`fix(ui): corrige pop ups view y mostrar imagenes`), listo el
   2026-09-18 17:15 UTC. Alias: `pwa-alcaldia.vercel.app`. Rollback: redeploy
   del candidato anterior (`dpl_HiGE9Zk6EGHszoLWP4Xg7Xg9cAii`, merge QA).
5. Datos y RLS no se revierten solo con Git: hace falta migración correctiva
   y respaldo de Supabase.

### 6.4.3 Carga inicial, respaldo y monitoreo

- Carga inicial: personal admin creado a mano; ciudadanos por registro. No hay
  seed versionado con datos reales.
- Respaldo: usar el respaldo de proyecto de Supabase antes de migraciones
  nuevas. El procedimiento está en `docs/operacion/recuperacion.md`.
- Monitoreo: logs de Auth, API, Edge Functions y Vercel. La campana in-app
  permanece si Push falla.

### 6.4.4 Capacitación, manuales, acta y soporte

El paquete vive en `docs/manuales/` y `docs/operacion/`. El acta y el
checklist de accesos no incluyen contraseñas. El soporte previsto es el
equipo académico durante la transferencia y, después, el personal de la
Alcaldía Auxiliar con el manual de operación.

---

## 6.5 Retrospectiva y trabajo futuro

### 6.5.1 Prácticas que funcionaron

- RLS y `private.is_admin()` como frontera de autorización (ADR 0001).
- Entregas iterativas por sprint con ADR cuando la decisión era irreversible.
- QA de preproducción antes del pulido visual: Storage y descarte no se
  reabrieron.
- Heurística de duplicados sin enviar texto sensible a un LLM.

### 6.5.2 Problemas y decisiones

- Las pruebas automatizadas llegaron tarde; la DoD temprana no las exigía.
- La documentación de Sprint 6 adelantó porcentajes de despliegue; Production
  HTTPS sí existe, pero el SHA vivo al corte no incluía aún `vercel.json` ni
  el pulido de geocerca/auditoría.
- No existía baseline de esquema aislada al inicio; el historial de
  migraciones se reconcilió sobre el proyecto compartido.
- El tema se persistía mal (escritura antes de lectura). Se corrigió leyendo
  `localStorage` en el initializer.

### 6.5.3 Deuda priorizada

| Prioridad | Ítem | Por qué importa |
| --- | --- | --- |
| 1 | Push VAPID en dispositivo real + webhook | Cierra T-14; Production HTTPS ya existe |
| 2 | 30 pares reales anonimizados | Única evidencia de la hipótesis |
| 3 | CHECK geográfico en Postgres | Cierra bypass de la geocerca |
| 4 | TypeScript `strict` gradual | Reduce defectos de contrato |
| 5 | Lighthouse + WCAG formal | No funcionales medidos |
| 6 | Retiro de columnas `image_url` antiguas | Después de comprobar consumidores |

### 6.5.4 Backlog futuro

- Confirmación humana sigue siendo obligatoria ante duplicados.
- No entrenar un modelo propio sin dataset etiquetado.
- No borrar incidencias para “limpiar” el muro.
- Evaluar retiro de código muerto solo después del congelamiento de
  Production.

---

## Notas

[1] AGENTS.md, secciones 8.5 y 18.3; ADR 0001.

## Bibliografía mínima para el Word

- Documentos ADR 0001 a 0008 del repositorio.
- Plantillas de entrega de sprints 1 a 6.
- `docs/cierre/` y `docs/pruebas/` de este corte.
- Documentación de Supabase sobre RLS, Storage y Edge Functions (consultar
  versión vigente al citar).
- Plantilla institucional `Forma.pdf` para tipografía y numeración.

## Anexos sugeridos (no van en el cuerpo de 15–20 páginas)

- A. Matriz Go/No-Go.
- B. Registro de defectos.
- C. Bitácora de 10 ensayos.
- D. Plantilla vacía de 30 transacciones.
- E. Manuales y acta.
- F. Capturas anonimizadas del flujo E2E.
