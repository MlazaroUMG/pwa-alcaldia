# Control de versiones y evidencias de trabajo

## Estado verificado

- El repositorio local está conectado a GitHub:

```text
origin https://github.com/MlazaroUMG/pwa-alcaldia.git
```

- La rama local actual rastrea `origin/master`.
- Existen múltiples cambios locales sin commit, incluyendo archivos nuevos de Sprint 2 y documentación.
- `.env` debe mantenerse como archivo local no versionado. Se retiró del tracking con `git rm --cached .env` y se documentan las variables requeridas en `.env.example`.

## Flujo recomendado

1. Crear una rama por bloque de trabajo:

```bash
git switch -c feat/sprint-2-auth-profile-admin
```

2. Revisar cambios antes de preparar commit:

```bash
git status
git diff
```

3. Agregar solo archivos relacionados al alcance del sprint:

```bash
git add src docs .github package.json package-lock.json
```

4. Verificar que `.env` no se agregue:

```bash
git status --short
```

5. Ejecutar verificación local:

```bash
npm run build
npm run lint
```

6. Crear commits pequeños y descriptivos:

```text
feat(auth): agrega prueba de concepto de Google Auth
feat(profile): agrega ajustes compartidos de perfil
docs(delivery): documenta matriz de entrega Sprint 1
```

7. Subir rama y abrir pull request:

```bash
git push -u origin feat/sprint-2-auth-profile-admin
```

## Evidencias recomendadas

- Captura del tablero Jira con épicas, sprint activo y tareas movidas por estado.
- Captura del backlog priorizado y de la historia/tarea asociada al cambio.
- Captura de `git status` limpio antes de la entrega.
- Captura de commits en GitHub o pull request.
- Captura de GitHub Actions mostrando build/lint ejecutados.
- Captura de Vercel Deployment asociado al commit o PR.
- Captura de Supabase Dashboard con tablas/políticas RLS relevantes, ocultando datos sensibles.

## Buenas prácticas aplicables

- No hacer `push` directo a `master` si se puede usar pull request.
- No versionar `.env`, credenciales, tokens ni datos reales de ciudadanos.
- Usar `.env.example` para documentar variables requeridas sin exponer valores reales.
- Documentar decisiones significativas como ADR en `docs/adr/`.
- Mantener commits enfocados por objetivo funcional o técnico.
- No usar comandos destructivos como `git reset --hard` o `git checkout --` sin autorización explícita.

## Brechas actuales

- El repositorio no tenía workflow CI versionado; se agregó `.github/workflows/ci.yml`.
- `.env` estaba trackeado por Git; se agregó a `.gitignore` y se retiró del índice sin borrarlo localmente.
- No hay hook pre-commit versionado. Se recomienda agregarlo más adelante con una herramienta como Husky o Lefthook si el equipo decide exigir validaciones antes de cada commit.
- `npm run lint` puede fallar hasta resolver errores preexistentes de componentes shadcn (`button.tsx`, `form.tsx`). El workflow sirve como control, pero para tener CI verde se debe corregir esa deuda.
