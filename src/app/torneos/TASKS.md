# Backlog de certificación — ALTTEZ Torneos

Objetivo: llevar ALTTEZ Torneos a 65–70% de preparación operativa usando primero
las capacidades existentes y desarrollando únicamente brechas demostradas.

## Protocolo obligatorio

Cada capacidad pasa por cinco estados:

```text
INVENTARIADA → CONECTADA → PERSISTIDA → PROBADA → CERTIFICADA
```

Una tarea de corrección solo se ejecuta cuando la evidencia anterior falla. Si
la capacidad ya supera el gate, se documenta como reutilizada y se continúa sin
refactorizarla. No se amplía alcance durante la certificación.

## Fase 1 — Inventario y control

- [x] T001 Inventariar formatos existentes y su cobertura real en `src/app/torneos/CAPABILITY_MATRIX.md`
- [x] T002 Inventariar rutas, pantallas y estados de acceso existentes en `src/app/torneos/CAPABILITY_MATRIX.md`
- [x] T003 [P] Inventariar entidades, servicios y operaciones Supabase consumidas por Torneos en `src/app/torneos/CAPABILITY_MATRIX.md`
- [x] T004 [P] Inventariar pruebas existentes y mapearlas a capacidades en `src/app/torneos/CAPABILITY_MATRIX.md`
- [x] T005 Seleccionar la configuración de referencia del piloto sin limitar los demás formatos en `src/app/torneos/README.md`
- [x] T006 Documentar severidades P0–P3, evidencia mínima y regla de no reconstrucción en `src/app/torneos/RUNBOOK.md`

**Gate:** toda capacidad queda marcada como existente, parcialmente conectada,
ausente o no verificable. Ninguna implementación comienza sin esa clasificación.

## Fase 2 — Backend y ambiente verificables

- [x] T007 Confirmar qué project ref usa local, Vercel, CI y keep-alive sin exponer secretos en `supabase/ENVIRONMENTS.example.md`
- [x] T008 Determinar con evidencia si `jqqzwcrfbtcyjiuacrjk` o `rwqqdwlldbegkivqvtwk` contiene el backend recuperable y registrar la decisión en `src/app/torneos/DECISIONS.md`
- [ ] T009 Comparar las tablas/RPC requeridas por `src/app/torneos/services/torneosService.js` contra el esquema remoto canónico y registrar diferencias en `src/app/torneos/CAPABILITY_MATRIX.md`
- [x] T010 Auditar la cadena actual de `supabase/migrations/` mediante bootstrap vacío sin desplegarla en producción y registrar el resultado en `supabase/README.md`
- [ ] T011 Si T010 falla, generar con Supabase CLI un baseline mínimo nuevo en `supabase/migrations/` reutilizando SQL válido y descartando únicamente incompatibilidades demostradas
- [ ] T012 Verificar grants, RLS, ownership, vistas y RPC del esquema efectivo con dos organizadores y `anon` en `supabase/tests/torneos_rls.test.sql`
- [ ] T013 Si T012 falla, corregir solo políticas y funciones afectadas mediante una migración generada por Supabase CLI en `supabase/migrations/`
- [ ] T014 Corregir o retirar la referencia de seed únicamente si el bootstrap confirma el fallo en `supabase/config.toml` y `supabase/seed.sql`
- [ ] T015 Documentar el procedimiento reproducible de bootstrap y verificación en `supabase/README.md`

**Gate:** existe un ambiente canónico, el esquema requerido por Torneos responde
y el aislamiento A/B/anon está probado. Si el esquema actual supera el gate, no
se crea un baseline alternativo.

## Fase 3 — US1: certificar acceso del organizador

**Meta:** URL → login/registro → onboarding → lista sin ayuda técnica.

- [ ] T016 [P] [US1] Ejecutar y documentar el recorrido anónimo `/torneos` → login en `artifacts/torneos-access-audit.md`
- [ ] T017 [P] [US1] Inspeccionar preservación de `redirect=/torneos` en `src/shared/auth/authRedirects.js`, `src/app/auth/login/page.tsx` y `src/app/auth/register/page.tsx`
- [ ] T018 [US1] Ejecutar registro, confirmación de correo, login y retorno a Torneos y registrar evidencia en `artifacts/torneos-access-audit.md`
- [ ] T019 [US1] Ejecutar onboarding y verificar que organización, membresía y capacidad se persisten en Supabase; registrar evidencia en `artifacts/torneos-access-audit.md`
- [ ] T020 [US1] Si T017–T019 fallan, corregir únicamente los saltos demostrados en `src/shared/auth/authRedirects.js`, `src/shared/auth/components/AuthRegisterForm.jsx` y `src/app/torneos/TorneosOnboarding.jsx`
- [ ] T021 [US1] Verificar loader, timeout, reintento y sesión expirada en `src/app/torneos/layout.tsx`
- [ ] T022 [US1] Si T021 falla, añadir solo los estados de recuperación faltantes en `src/app/torneos/layout.tsx`
- [ ] T023 [US1] Automatizar el recorrido ya certificado en `src/tests/e2e/torneos-access.spec.ts`

**Gate US1:** cinco recorridos consecutivos llegan a `/torneos/lista`, sin
loader indefinido ni intervención sobre Supabase.

## Fase 4 — US2: certificar creación y persistencia

**Meta:** crear un torneo, cerrar sesión y recuperarlo desde servidor.

- [ ] T024 [P] [US2] Trazar los datos del wizard desde `src/app/torneos/components/wizard/CrearTorneoWizard.jsx` hasta `src/app/torneos/services/torneosService.js` en `src/app/torneos/CAPABILITY_MATRIX.md`
- [ ] T025 [P] [US2] Evaluar la puntuación de completitud existente sin modificarla y registrar falsos positivos en `src/app/torneos/CAPABILITY_MATRIX.md`
- [ ] T026 [US2] Ejecutar creación con la configuración piloto y verificar filas reales de torneo, categoría y equipos en `artifacts/torneos-persistence-audit.md`
- [ ] T027 [US2] Limpiar caché, volver a iniciar sesión y verificar rehidratación desde Supabase en `artifacts/torneos-persistence-audit.md`
- [ ] T028 [US2] Simular un fallo remoto y comprobar si la UI muestra guardado falso en `artifacts/torneos-persistence-audit.md`
- [ ] T029 [US2] Si T026–T028 fallan, corregir únicamente contratos de resultado y reconciliación afectados en `src/app/torneos/services/torneosService.js` y `src/app/torneos/store/useTorneosStore.js`
- [ ] T030 [US2] Si T025 demuestra falsos positivos críticos, extraer readiness verificable a `src/app/torneos/domain/readiness/tournamentReadiness.ts`
- [ ] T031 [US2] Automatizar creación, limpieza de caché y reapertura en `src/tests/e2e/torneos-create-reopen.spec.ts`

**Gate US2:** el torneo reaparece desde Supabase y un error remoto nunca se
presenta como sincronización exitosa.

## Fase 5 — US3: certificar formatos y operación competitiva

**Meta:** reutilizar motores existentes y demostrar un torneo completo.

- [ ] T032 [P] [US3] Ejecutar las pruebas existentes de `src/tests/torneos/competitionEngine.test.js` y clasificar fallos reales en `src/app/torneos/CAPABILITY_MATRIX.md`
- [ ] T033 [P] [US3] Comparar opciones del wizard contra `src/app/torneos/utils/fixturesEngine.js` y `src/app/torneos/utils/competitionEngine.js` en `src/app/torneos/CAPABILITY_MATRIX.md`
- [ ] T034 [US3] Ejecutar el caso piloto de 8 equipos, 2 grupos, una vuelta, semifinal y final en `artifacts/torneos-operation-audit.md`
- [ ] T035 [US3] Verificar programación, resultado, corrección, posiciones, clasificados y avance en `artifacts/torneos-operation-audit.md`
- [ ] T036 [US3] Verificar persistencia y reapertura de fixture y fase final en `artifacts/torneos-operation-audit.md`
- [ ] T037 [US3] Si T032–T036 fallan, corregir solo reglas o conexiones afectadas en `src/app/torneos/utils/competitionEngine.js`, `src/app/torneos/store/useTorneosStore.js` y `src/app/torneos/services/torneosService.js`
- [ ] T038 [US3] Añadir únicamente los casos no cubiertos encontrados a `src/tests/torneos/competitionEngine.test.js`
- [ ] T039 [US3] Automatizar el torneo completo certificado en `src/tests/e2e/torneos-operation.spec.ts`

**Gate US3:** dos ejecuciones producen los mismos 15 partidos, posiciones y
clasificados; reintentos y correcciones no duplican resultados.

## Fase 6 — US4: certificar publicación pública

**Meta:** un visitante consulta solo torneos publicados y campos permitidos.

- [ ] T040 [P] [US4] Trazar el portal desde `src/app/t/[slug]/page.tsx` hasta vistas y fallbacks de `src/app/torneos/services/torneosService.js` en `src/app/torneos/CAPABILITY_MATRIX.md`
- [ ] T041 [US4] Probar torneo publicado, privado e inexistente como `anon` y registrar evidencia en `artifacts/torneos-public-audit.md`
- [ ] T042 [US4] Revisar la salida pública para detectar datos personales en `src/app/torneos/pages/PublicTorneoPage.jsx` y `artifacts/torneos-public-audit.md`
- [ ] T043 [US4] Si T040–T042 fallan, restringir solo el acceso afectado en `src/app/torneos/services/torneosService.js` y la migración correctiva generada en `supabase/migrations/`
- [ ] T044 [US4] Automatizar publicado/privado/inexistente en `src/tests/e2e/torneos-public.spec.ts`

**Gate US4:** `anon` ve el torneo publicado, recibe cero datos del privado y no
puede listar tablas base ni información personal.

## Fase 7 — US5: certificar contingencia y piloto

**Meta:** conocer exactamente qué ocurre ante fallos sin prometer offline no
demostrado.

- [ ] T045 [P] [US5] Inventariar qué datos de Torneos persiste actualmente `src/app/torneos/store/useTorneosStore.js` en `src/app/torneos/CAPABILITY_MATRIX.md`
- [ ] T046 [US5] Simular desconexión, recarga, sesión expirada y doble envío en `artifacts/torneos-resilience-audit.md`
- [ ] T047 [US5] Si T046 demuestra pérdida silenciosa, implementar la corrección mínima en `src/app/torneos/store/useTorneosStore.js` y `src/app/torneos/components/shared/TorneosShell.tsx`
- [ ] T048 [US5] Reutilizar exportaciones existentes o, si no existen, crear contingencia mínima en `src/app/torneos/services/tournamentExportService.ts`
- [ ] T049 [US5] Documentar verificación previa, backup, recuperación y escalamiento en `src/app/torneos/RUNBOOK.md`
- [ ] T050 [US5] Ejecutar dos simulaciones completas y consolidar evidencia en `artifacts/torneos-pilot-readiness.md`

**Gate US5:** cero P0, máximo dos P1 con workaround y dos simulaciones completas
sin SQL manual ni pérdida silenciosa.

## Fase 8 — Cierre

- [ ] T051 Actualizar estados `INVENTARIADA/PROBADA/CERTIFICADA` y brechas remanentes en `src/app/torneos/CAPABILITY_MATRIX.md`
- [ ] T052 Actualizar alcance realmente soportado y limitaciones en `src/app/torneos/README.md`
- [ ] T053 Ejecutar lint, pruebas dirigidas y build disponibles y registrar limitaciones en `src/app/torneos/RUNBOOK.md`
- [ ] T054 Revisar secretos, datos personales y artefactos rastreados mediante `.gitignore` y `git status`

## Dependencias

```text
Inventario
  → ambiente/backend verificable
  → US1 acceso
  → US2 creación persistente
  → US3 operación
  → US4 publicación
  → US5 resiliencia
  → decisión de piloto
```

US4 puede auditarse en paralelo con la última parte de US3. Las correcciones
condicionales no se estiman ni ejecutan hasta obtener evidencia de fallo.

## Primer incremento

El primer incremento termina al completar T001–T015. Su resultado no es código
nuevo: es saber qué se reutiliza, cuál Supabase es canónico y qué brechas son
reales. Después se certifica el corredor operativo historia por historia.
