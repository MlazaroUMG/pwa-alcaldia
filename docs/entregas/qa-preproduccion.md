# Entrega QA de preproducción

Fecha: 2026-09-16.

## Qué se entregó

- ADR 0008 de descarte, anonimización y validación.
- Migración local `202609160900_qa_preproduccion.sql` (no aplicada en remoto).
- Edge Functions `upload-incident-photo` y `anonymize-account` (no desplegadas).
- Validación centralizada, contraseña 12–64, recuperación dedicada, consentimiento versionado.
- Folio `INC-000001`, descarte/restauración auditable, tema claro ciudadano, galería, Push contextual.

## Qué no se hizo

- No se aplicó la migración en el proyecto Supabase remoto.
- No se desplegaron Edge Functions.
- No se cambió Vercel ni se hizo commit.

## Cómo verificar

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

La humo de Playwright cubre la pantalla de acceso. Los flujos autenticados requieren sesión real tras aplicar la migración.
