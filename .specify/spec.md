# Feature Specification: Auditoria de Dominios ALTTEZ

**Feature Branch**: `domain-logic-audit`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "Utilizando como base la Constitucion v1.0.0 que
acabamos de ratificar, ejecuta el comando $speckit-specify para auditar las
carpetas de dominio actuales en src/. Analiza su comportamiento y mapea la
logica de negocio real del proyecto dentro de un nuevo archivo llamado
.specify/spec.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mapear el negocio real (Priority: P1)

Como fundador, arquitecto o agente de producto, necesito una auditoria clara de
los dominios actuales para entender que hace ALTTEZ hoy, que actores atiende y
que reglas de negocio ya estan vivas en el sistema.

**Why this priority**: Sin este mapa, cualquier plan nuevo corre el riesgo de
duplicar logica, romper limites entre modulos o documentar una plataforma que no
coincide con el codigo real.

**Independent Test**: Una persona nueva al proyecto puede leer el documento e
identificar, sin abrir el codigo, los dominios principales, sus objetivos, sus
actores y los flujos operativos que sostienen.

**Acceptance Scenarios**:

1. **Given** el repositorio actual, **When** se revisa la auditoria, **Then** se
   puede distinguir el ecosistema publico, el CRM deportivo y el modulo de
   torneos como capacidades separadas pero conectadas.
2. **Given** un dominio operativo como entrenamientos o propuestas,
   **When** se consulta el spec, **Then** se entiende que problema de negocio
   resuelve, que datos mueve y que decisiones de negocio automatiza.

---

### User Story 2 - Trazar reglas transversales (Priority: P2)

Como responsable de arquitectura y gobierno tecnico, necesito ver las reglas
compartidas que atraviesan varios modulos para poder planear cambios sin romper
persistencia, permisos, multiclub o experiencia offline.

**Why this priority**: Las reglas transversales son el mayor punto de
regresion. Si no quedan explicitas, el equipo puede corregir una vista y dañar
salud, auth, RSVP, cache o sincronizacion en otro dominio.

**Independent Test**: Un planificador puede revisar el spec y listar las
restricciones compartidas que cualquier feature nuevo debe respetar.

**Acceptance Scenarios**:

1. **Given** un cambio que afecta datos de club, **When** se lee el spec,
   **Then** queda claro que existe aislamiento por `club_id`, modos demo y
   produccion, y sincronizacion gradual entre navegador y nube.
2. **Given** una iniciativa que toca entrenamiento, calendario o salud,
   **When** se consulta el spec, **Then** se identifican reglas como bloqueo de
   RPE por inasistencia, snapshots de salud y uso de historiales individuales.

---

### User Story 3 - Preparar la siguiente etapa de planning (Priority: P3)

Como agente que luego va a clarificar, planear o implementar, necesito que la
auditoria delimite alcance, entidades y dependencias para convertir el estado
actual del producto en una base util de especificacion.

**Why this priority**: El objetivo no es solo describir carpetas; es dejar un
insumo confiable para decisiones futuras.

**Independent Test**: Un plan futuro puede tomar este spec y derivar una linea
base de alcance, entidades y riesgos sin volver a explorar todo `src/`.

**Acceptance Scenarios**:

1. **Given** una nueva especificacion de producto, **When** se compara con esta
   auditoria, **Then** se puede decidir si se trata de una extension de un
   dominio existente o de una capacidad nueva.

### Edge Cases

- Como se interpreta el comportamiento cuando una capacidad existe en modo demo,
  offline y sincronizado a la nube al mismo tiempo.
- Como se delimitan rutas publicas que consumen datos comerciales o deportivos
  sin requerir sesion autenticada.
- Como se clasifica la logica compartida que vive fuera de un solo modulo de
  producto, como auth, health snapshots, propuestas, store global y servicios.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La auditoria MUST inventariar los dominios funcionales activos en
  `src/` y agruparlos por proposito de negocio, no solo por nombre de carpeta.
- **FR-002**: La auditoria MUST describir el ecosistema ALTTEZ como minimo en
  tres superficies: portal publico/comercial, CRM operativo del club y modulo
  de torneos/publicacion competitiva.
- **FR-003**: La auditoria MUST mapear el ciclo de negocio del CRM del club,
  incluyendo onboarding, autenticacion, gestion de plantilla, entrenamiento,
  calendario, partido, finanzas, reportes y propuestas.
- **FR-004**: La auditoria MUST mapear el ciclo de negocio del dominio
  `torneos`, incluyendo torneos, categorias, equipos, partidos, programacion,
  estados operativos y publicacion del portal del torneo.
- **FR-005**: La auditoria MUST identificar las reglas compartidas entre
  dominios, incluyendo multi-tenancy por club, persistencia offline-first,
  sincronizacion con nube, permisos por rol y estados demo/produccion.
- **FR-006**: La auditoria MUST identificar las entidades de negocio que
  aparecen repetidamente como fuente de verdad operacional.
- **FR-007**: La auditoria MUST distinguir claramente entre reglas de negocio,
  experiencia de usuario y mecanismos de persistencia para que futuros cambios
  sepan que preservar.
- **FR-008**: La auditoria MUST dejar explicito que `data/` y la canalizacion de
  analitica existen como capacidad separada del producto web y que no forman
  parte del alcance funcional auditado en `src/`.

## Technical & Governance Constraints *(mandatory)*

- **TG-001**: La auditoria MUST usar como base la Constitucion ALTTEZ v1.0.0 y
  respetar sus principios de modularidad por dominio, separacion de capas y
  respeto de workspace.
- **TG-002**: El documento MUST reflejar la estructura real auditada en
  `src/app/`, `src/shared/`, `src/components/`, `src/marketing/` y `src/tests/`.
- **TG-003**: El archivo de salida MUST vivir en `.specify/spec.md` y la
  resolucion de feature para comandos posteriores MUST apuntar a `.specify`.
- **TG-004**: La auditoria MUST documentar impactos nulos sobre secretos,
  `docs/`, `artifacts/` y `data/`; este trabajo es descriptivo y no modifica
  esas superficies.
- **TG-005**: La auditoria MUST mantener el foco en valor operativo y logica de
  negocio real, evitando convertir el spec en un inventario de componentes
  visuales o detalles de framework sin implicacion funcional.

## Key Entities *(include if feature involves data)*

- **Club**: Unidad operativa central del CRM; concentra identidad, staff,
  disciplina, configuracion y aislamiento de datos.
- **Perfil de Usuario**: Actor autenticado con rol y vinculacion a club que
  determina acceso a modulos internos.
- **Athlete / Deportista**: Recurso base del CRM deportivo; participa en
  entrenamientos, calendario, salud, rendimiento y finanzas.
- **Sesion de Entrenamiento**: Registro historico de asistencia, carga RPE, tipo
  de trabajo y observaciones del ciclo deportivo.
- **Health Snapshot**: Fotografia de salud por deportista al cierre de sesion
  para historico, alertas y seguimiento de riesgo.
- **Calendar Event**: Convocatoria o evento de club, entrenamiento o partido con
  estados RSVP por deportista.
- **Match Report**: Captura post-partido del rendimiento individual y colectivo
  usada para score, alertas y analitica.
- **Movimiento Financiero / Pago**: Registros de caja y cumplimiento economico
  del plantel.
- **Proposal**: Propuesta comercial con ciclo de creacion, envio, firma,
  rechazo o contrapropuesta.
- **Tournament**: Competicion gestionada por el modulo de torneos y publicada
  hacia experiencias publicas.
- **Category**: Subdivision competitiva del torneo con estados operativos,
  equipos, formato y alertas.
- **Fixture / Match**: Partido programado o disputado dentro del torneo, con
  reglas de programacion, avance y resultados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona nueva al proyecto puede identificar en menos de
  5 minutos los dominios principales de ALTTEZ y su proposito operativo leyendo
  solo este spec.
- **SC-002**: Cada dominio principal auditado queda descrito con al menos un
  actor, un objetivo de negocio y una lista clara de reglas o flujos que ya
  estan activos.
- **SC-003**: El documento permite enumerar sin ambiguedad al menos 8 entidades
  de negocio compartidas por el producto.
- **SC-004**: Un agente o planificador puede usar este spec para decidir si un
  cambio futuro extiende un dominio existente o introduce uno nuevo sin volver a
  inspeccionar todo `src/`.

## Assumptions

- El objetivo de esta especificacion es producir una linea base de auditoria del
  negocio actual, no redisenar alcance ni corregir implementaciones.
- Se asume que los dominios mas relevantes viven en `src/app`, `src/shared` y
  `src/marketing`, mientras `src/components` aporta piezas reutilizables y no
  define por si solo un dominio de negocio.
- Se asume que el producto opera en dos grandes modos: experiencias publicas de
  descubrimiento/consumo y experiencias privadas de operacion de club.
- Se asume que el patron predominante de persistencia es offline-first con cache
  local y sincronizacion gradual hacia la nube cuando esta disponible.
- Se asume que `npm run lint` no es obligatorio para esta entrega porque el
  trabajo es documental y no altera runtime ni contratos ejecutables.

## Domain Audit

### Panorama del Producto

ALTTEZ opera hoy como un ecosistema deportivo dual. La primera mitad es un
portal publico y comercial que explica la propuesta de valor, presenta modulos,
captura interes comercial, publica propuestas y expone experiencias publicas
como confirmaciones o portales de torneo. La segunda mitad es un CRM operativo
para clubes y cuerpos tecnicos, donde se gestiona el dia a dia deportivo,
administrativo y comercial del club. En paralelo, el modulo `torneos` funciona
como un subproducto competitivo con sus propias reglas, estados operativos y
salidas publicas.

### Dominios Principales

#### 1. CRM del Club

El CRM es la superficie central para usuarios autenticados del club. Sus
comportamientos observados incluyen:

- Arranque en modo demo o produccion.
- Verificacion de sesion, perfil y permisos por rol.
- Navegacion por modulos internos segun capacidad del usuario.
- Onboarding progresivo cuando el perfil aun no tiene club asociado.
- Persistencia local con cache segura y restauracion posterior.

Actores principales:

- Administrador del club.
- Entrenador principal.
- Staff de apoyo.

Valor de negocio:

- Convertir la operacion diaria del club en datos accionables y reutilizables.

#### 2. Gestion de Plantilla y Roster Deportivo

Este dominio organiza la base de deportistas del club y soporta dos usos:
gestion de ficha y preparacion tactica. La logica observada permite:

- Crear y editar deportistas individualmente o en lote.
- Registrar disponibilidad, posicion, tarjetas, goles y datos personales.
- Consultar senales de salud y riesgo del deportista.
- Construir formaciones tacticas, notas y artefactos visuales para partidos.

Valor de negocio:

- Mantener una fuente de verdad del plantel y su disponibilidad competitiva.

#### 3. Entrenamiento y Carga Deportiva

Este dominio gestiona sesiones de entrenamiento y seguimiento de bienestar.
Comportamientos reales detectados:

- Registro de asistencia por deportista.
- Registro de RPE individual por sesion.
- Cierre de sesion con generacion de historico.
- Calculo de salud actual, riesgo y tendencia individual.
- Persistencia de wellness logs y snapshots historicos.
- Sincronizacion posterior con servicios de nube cuando aplica.

Reglas de negocio destacadas:

- Solo los presentes generan snapshot de salud al cerrar la sesion.
- El historial conserva RPE por atleta, no solo promedio de plantel.
- La salud se usa para alertas del staff y seguimiento historico.

#### 4. Calendario, Convocatorias y RSVP

El calendario combina planificacion competitiva y disponibilidad humana.
Capacidades observadas:

- Crear eventos de entrenamiento, partido o club.
- Mostrar agenda mensual y detalle por evento.
- Gestionar RSVP por deportista.
- Medir disponibilidad consolidada por convocatoria.
- Marcar ausencias de manera reutilizable para otros dominios.

Regla transversal clave:

- La ausencia confirmada en calendario condiciona el registro posterior de RPE,
  evitando inconsistencia entre disponibilidad y carga reportada.

#### 5. Match Center y Analitica Post-Partido

Este dominio convierte un partido jugado en datos de rendimiento. La logica
presente incluye:

- Seleccion de partido de referencia.
- Registro guiado de KPIs por deportista.
- Calculo de score de rendimiento y lectura de alertas.
- Analitica individual y comparativa por jugador.

Valor de negocio:

- Transformar el partido en feedback cuantificable para decisiones deportivas.

#### 6. Finanzas y Reportes

El dominio administrativo recoge pagos, movimientos y KPIs operativos.
Comportamientos visibles:

- Registrar pagos de deportistas y movimientos de caja.
- Calcular balance, cumplimiento y salud financiera.
- Cruzar indicadores de sesiones, asistencia, partidos y plantilla en reportes.

Valor de negocio:

- Conectar la operacion deportiva con el estado economico y el seguimiento
  ejecutivo del club.

#### 7. Propuestas Comerciales

Este dominio administra propuestas de negocio desde su creacion hasta la
respuesta del cliente. Reglas y flujos observados:

- Listado de propuestas del club activo.
- Lectura publica de una propuesta mediante identificador compartible.
- Actualizacion de estado comercial.
- Firma publica o envio de contrapropuesta sin depender de una sesion del CRM.

Estados de negocio detectados:

- Creada.
- Enviada.
- Aceptada.
- Contrapropuesta.
- Rechazada.

#### 8. Torneos y Competicion Publicable

`torneos` es un dominio completo dentro del producto. Reglas y capacidades
observadas:

- Crear y administrar torneos con datos principales y configuracion.
- Gestionar equipos, categorias, sedes y arbitros.
- Programar y reprogramar partidos.
- Generar fixtures, standings y fases de avance.
- Evaluar estados operativos de categorias mediante selectores dedicados.
- Publicar vistas publicas del torneo y rutas de inscripcion/seguimiento.

Reglas de negocio especialmente claras:

- La UI no resuelve negocio de categorias; consume view models ya preparados.
- Existen estados operativos de categoria, alertas, prioridad y actividad.
- La programacion y los resultados emiten eventos de competencia para trazas o
  procesos posteriores.

#### 9. Portal Publico y Marketing

El portal publico no es solo contenido de marca; tambien funciona como capa de
entrada comercial y de navegacion hacia experiencias operativas. Comportamientos
reales:

- Explicar el ecosistema y modulos del producto.
- Presentar paginas de precios, contacto, identidad y servicios.
- Exponer paginas publicas de propuestas, privacidad, confirmacion y torneos.
- Servir como punto de entrada a demos o rutas autenticadas.

### Reglas Transversales de Negocio

- **Multi-club**: la operacion privada se aísla por club y esa separacion
  condiciona salud, propuestas, sesiones, finanzas y datos deportivos.
- **Offline-first**: el producto prioriza continuidad operativa local y luego
  sincroniza con nube cuando hay contexto disponible.
- **Demo vs produccion**: existe una ruta real de demostracion con datos
  sembrados para acelerar onboarding comercial y pruebas.
- **Roles y permisos**: el acceso a modulos internos no es universal; depende
  del perfil del usuario.
- **Persistencia con cache**: varias capacidades escriben en nube y cache local
  para mantener resiliencia operativa.
- **Dominio separado de UI**: especialmente en `torneos`, la logica se compone
  en selectores, mapeadores y reglas antes de llegar a la vista.

### Mapa de Carpetas a Dominios

- `src/app/crm`, `src/app/shell`, `src/app/dashboard`, `src/app/club`,
  `src/app/analytics`, `src/app/finance`, `src/app/training`,
  `src/app/roster`, `src/app/scheduling`, `src/app/competition`,
  `src/app/proposals`: nucleo operativo del CRM del club.
- `src/app/torneos`: subproducto competitivo con logica propia de torneos,
  categorias, fixtures, equipos y publicacion.
- `src/app/auth` y `src/shared/auth`: entrada autenticada, sesiones y perfiles.
- `src/marketing` y rutas publicas de `src/app/*`: capa de marketing, portal
  corporativo y superficies publicas compartibles.
- `src/shared/services`, `src/shared/store`, `src/shared/utils`,
  `src/shared/hooks`, `src/shared/constants`: reglas compartidas, persistencia,
  estado global y calculos reutilizables.

### Scope Boundary

Esta auditoria cubre la logica de negocio observable en `src/`. No redefine el
modelo futuro del producto, no sustituye la documentacion analitica de `data/`
y no modifica contratos de implementacion existentes.
