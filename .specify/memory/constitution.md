<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
  - Template principle 1 -> I. Arquitectura Modular por Dominio
  - Template principle 2 -> II. App Router y Disciplina de Tipos
  - Template principle 3 -> III. Sistema Visual Consistente
  - Template principle 4 -> IV. Separacion de Estado, Dominio e Integraciones
  - Template principle 5 -> V. Seguridad, Higiene y Respeto del Workspace
- Added sections:
  - Guardrails Tecnicos
  - Flujo de Entrega y Revision
- Removed sections:
  - None
- Templates requiring updates:
  - UPDATED .specify/templates/plan-template.md
  - UPDATED .specify/templates/spec-template.md
  - UPDATED .specify/templates/tasks-template.md
  - PENDING .specify/templates/commands/*.md (directory does not exist in this repository; command docs currently live under .specify/extensions/git/commands/)
- Follow-up TODOs:
  - None
-->
# ALTTEZ Constitution

## Core Principles

### I. Arquitectura Modular por Dominio
Toda funcionalidad nueva MUST respetar la separacion actual del repositorio por
responsabilidad. Las rutas y pantallas viven en `src/app/`, los componentes
globales reutilizables en `src/components/`, el producto comercial en
`src/marketing/`, las capacidades transversales en `src/shared/` y la analitica
operativa en `data/`. Cada modulo funcional MUST agrupar UI, selectores,
constantes y mapeadores cerca de su dominio para evitar dependencias cruzadas
accidentales. El codigo de `data/` MUST permanecer aislado del frontend y no
puede alterarse salvo solicitud explicita.

### II. App Router y Disciplina de Tipos
La aplicacion web MUST seguir las convenciones de Next.js App Router ya
presentes en `src/app/`. Todo archivo nuevo creado dentro de `src/app/` MUST ser
TypeScript o TSX. El proyecto opera con `tsconfig` estricto y alias `@/*`; las
extensiones nuevas MUST ser compatibles con esa configuracion y no introducir
atajos que debiliten el tipado. Los archivos legacy en JavaScript pueden seguir
existiendo, pero cualquier nueva superficie de ruta o contrato de dominio MUST
nacer tipada.

### III. Sistema Visual Consistente
La UI MUST construirse sobre el sistema visual existente: tokens globales en
`src/index.css`, estilos encapsulados por modulo y responsive real para desktop
y mobile. Los componentes de pantalla MUST usar CSS Modules para estilos
locales, salvo que el modulo existente ya este resuelto con Tailwind CSS v4
dentro del mismo patron. Tailwind CSS v4 MAY complementar, pero no sustituir,
los tokens y convenciones del proyecto. Los colores, espaciados, radios,
estados de foco y animaciones MUST reutilizar variables existentes antes de
crear nuevas excepciones. Los componentes interactivos MUST conservar
accesibilidad basica: jerarquia clara, estados visibles y objetivos tactiles
consistentes.

### IV. Separacion de Estado, Dominio e Integraciones
La presentacion MUST permanecer separada de las reglas de negocio y de los
efectos externos. Los componentes React orquestan interaccion; los stores
centralizan transiciones de estado; `domain/`, `utils/`, `selectors/` y
`mappers/` concentran calculo derivado; `services/` y clientes compartidos
manejan I/O con Supabase u otros sistemas. Ninguna pantalla MUST esconder
logica critica de negocio directamente en el JSX cuando esa logica pueda vivir
en selectores o helpers verificables. Los cambios que alteren reglas de negocio
MUST considerar pruebas o cobertura dirigida en `src/tests/`.

### V. Seguridad, Higiene y Respeto del Workspace
Las credenciales reales MUST permanecer fuera de Git; `.env` nunca se comitea y
`.env.example` MUST seguir siendo la unica plantilla versionable. La carpeta
`docs/` MUST mantenerse local e ignorada. Los logs, dumps, screenshots y otros
artefactos temporales MUST escribirse solo en `artifacts/`; queda prohibido
generar archivos de depuracion en la raiz. Ningun cambio puede borrar,
reestructurar o sobrescribir trabajo no solicitado del usuario. Todo agente o
colaborador MUST tratar el workspace como un entorno compartido y preservar los
cambios ajenos.

## Guardrails Tecnicos

- El stack canonico del producto web es Next.js 16, React 19, Tailwind CSS v4,
  CSS global/CSS Modules, Supabase y Zustand; cualquier desviacion MUST
  justificarse en el plan del feature.
- La estructura de pruebas vigente vive en `src/tests/`; la ausencia de una
  carpeta `tests/` en la raiz no autoriza a crear una estructura paralela sin
  justificarlo.
- Todo cambio en rutas, providers compartidos, autenticacion, configuracion de
  build o contratos de datos MUST incluir validacion con `npm run lint` y,
  cuando el riesgo de integracion lo amerite, `npm run build`.
- Las modificaciones a servicios, selectores, almacenamiento local, auth o
  calculo de dominio MUST agregar o actualizar pruebas dirigidas en
  `src/tests/`, salvo que el plan documente por que el riesgo es nulo.
- El proyecto mantiene una transicion controlada entre JavaScript y TypeScript;
  las migraciones MUST ser incrementales y no pueden romper archivos legacy sin
  necesidad funcional.

## Flujo de Entrega y Revision

- Antes de implementar, todo trabajo MUST ubicarse en la estructura real del
  proyecto y declarar que directorios tocara.
- Los planes y tareas de Spec Kit MUST verificar los cinco principios de esta
  constitucion antes de aprobar investigacion, diseno o implementacion.
- Toda entrega MUST dejar claro si hubo validacion por lint, pruebas, build o
  limitaciones pendientes.
- Las revisiones tecnicas MUST priorizar regresiones funcionales, violaciones de
  limites entre capas, deuda visual fuera del sistema de tokens y riesgos sobre
  secretos, `docs/`, `artifacts/` o `data/`.
- Cuando un cambio exija romper alguna regla, la excepcion MUST documentarse en
  el plan con justificacion y alternativa mas simple descartada.

## Governance

Esta constitucion prevalece sobre practicas informales y sobre plantillas
genericas importadas en el repositorio. Toda spec, plan, task list y revision
MUST demostrar conformidad explicita con estos principios. Las enmiendas
requieren: evidencia de la nueva convencion en el codigo o en la operacion del
proyecto, actualizacion sincronizada de los templates afectados y registro del
impacto semantico en versionado.

La version de la constitucion sigue Semantic Versioning:
- MAJOR cuando se elimina o redefine un principio de forma incompatible.
- MINOR cuando se agrega un principio o una obligacion material nueva.
- PATCH cuando solo hay aclaraciones editoriales o mejoras no normativas.

Toda auditoria o implementacion iniciada con Spec Kit MUST revisar esta
constitucion al comenzar y al cerrar. Si algun template esperado por Spec Kit no
existe en el repo, la discrepancia MUST registrarse en el Sync Impact Report en
lugar de inventar estructura nueva.

**Version**: 1.0.0 | **Ratified**: 2026-05-29 | **Last Amended**: 2026-05-29
