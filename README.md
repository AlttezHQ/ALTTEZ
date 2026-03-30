<p align="center">
  <img src="public/icons/icon-base.svg" width="80" alt="Elevate Sports Logo" />
</p>

<h1 align="center">Elevate Sports</h1>

<p align="center">
  <strong>CRM Deportivo Inteligente</strong> &mdash; Gestiona tu club con rendimiento profesional
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-purple?logo=vite" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20RLS-green?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/PWA-Installable-orange?logo=pwa" alt="PWA" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel" alt="Vercel" />
</p>

---

## Sobre Elevate Sports

Elevate Sports es una plataforma SaaS para la gestion operativa de clubes deportivos. Diseñada para directores tecnicos, cuerpo tecnico y administradores de clubes de futbol juvenil en Latinoamerica.

**El problema:** Los clubes deportivos juveniles gestionan sus operaciones con hojas de calculo, grupos de WhatsApp y memoria. No existe una herramienta accesible que integre lo deportivo con lo administrativo.

**La solucion:** Un CRM deportivo que unifica entrenamiento, tactica, calendario, finanzas y rendimiento en una sola plataforma con estetica premium y experiencia offline-first.

---

## Modulos

| Modulo | Descripcion | Estado |
|--------|-------------|--------|
| **Dashboard FIFA** | Panel de inicio con KPIs interactivos, tiles de navegacion y proximo evento real | Produccion |
| **Entrenamiento** | Sesiones, RPE por atleta, historial semanal, planificacion con export PDF | Produccion |
| **Gestion de Plantilla** | Lista FIFA de atletas, edicion, fotos, bulk import CSV | Produccion |
| **Pizarra Tactica V9** | Campo landscape 105x68, tokens con foto, drag & drop, herramientas de dibujo, full/half pitch | Produccion |
| **Match Center** | Ingesta post-partido, Elevate Score (0-10), Player Card Pro, Spider Chart, recomendaciones | Produccion |
| **Calendario + RSVP** | Vista mensual, crear eventos, confirmacion de asistencia, recordatorio por WhatsApp | Produccion |
| **Administracion** | Control de pagos, movimientos financieros, semaforo de morosidad | Produccion |
| **Mi Club** | Configuracion del club, campos, categorias | Produccion |
| **Portal Corporativo** | Landing page comercial, quienes somos, contacto, politica de privacidad | Produccion |

---

## Stack Tecnologico

```
Frontend       React 19 + Vite 8 + Framer Motion 12
Backend        Supabase (Auth + PostgreSQL + RLS)
PWA            vite-plugin-pwa + Workbox + Service Worker
Deploy         Vercel (auto-deploy desde master)
Offline        localStorage (cache-first) + Supabase sync
PDF            jsPDF + jspdf-autotable
Sanitizacion   DOMPurify
Testing        Vitest + jsdom
```

---

## Arquitectura

```
src/
  components/         Modulos del CRM + Portal
    TacticalBoardV9/  Pizarra tactica (4 capas)
    portal/           Portal corporativo publico
    ui/               Componentes base (EmptyState, Toast, etc.)
  constants/          Paleta, roles, formaciones, schemas
  hooks/              useDragEngine, useDrawingEngine, useLocalStorage, etc.
  services/           Supabase, storage, health, auth, backup
  utils/              rpeEngine, elevateScore, helpers, sanitize
  assets/             Imagenes de tiles del dashboard
  lib/                Cliente Supabase + registro SW
docs/
  architecture.md     Diagramas UML (Mermaid) — renderiza en GitHub
  architecture.puml   Diagramas PlantUML
  SCHEMA_MODEL.json   Modelo de datos documentado
supabase/
  migrations/         6 migraciones SQL (001-006) con RLS
```

Ver [docs/architecture.md](docs/architecture.md) para diagramas completos de componentes, entidades, navegacion y flujo de datos.

---

## Inicio Rapido

```bash
# Clonar
git clone https://github.com/Julianhr27/elevate-sports.git
cd elevate-sports

# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Desarrollo
npm run dev

# Build de produccion
npm run build

# Tests
npm test
```

---

## Algoritmos Deportivos

### Motor RPE (Rated Perceived Exertion)
Calcula la salud de cada atleta basado en la carga de entrenamiento de los ultimos 7 dias. Umbrales calibrados para futbol juvenil:
- **Optimo** (salud >= 50%): disponible para alta exigencia
- **Precaucion** (25-49%): carga moderada recomendada
- **Riesgo** (< 25%): descanso obligatorio

### Elevate Score (0-10)
KPI ponderado que combina rendimiento en partido con fatiga:
```
Score = (goles x 2.0) + (asistencias x 1.5) + (recuperaciones x 0.3)
      + (duelos x 0.2) + (minutos/90 x 1.0)
      - (amarilla x 0.5) - (roja x 3.0)
```
Genera alertas automaticas cuando hay alto rendimiento + alta fatiga.

---

## Seguridad y Privacidad

- **Multi-tenancy**: Datos aislados por `club_id` en Supabase RLS y localStorage
- **Ley 1581 (Habeas Data Colombia)**: Consentimiento de tutores para menores, politica de privacidad accesible
- **Sanitizacion**: DOMPurify en todas las entradas de usuario
- **Auth**: Supabase Auth con email/password + perfiles con roles (admin, coach, staff)

---

## Equipo

| Rol | Responsabilidad |
|-----|-----------------|
| **Arquitecto** | Estructura, rutas, decisiones tecnicas, ENGINEERING_LOG |
| **UI Developer** | Componentes React, animaciones, responsive, estetica FIFA |
| **Data Engineer** | Modelos de datos, algoritmos deportivos, demos realistas |
| **QA/Compliance** | Testing, privacidad, seguridad, validacion de flujos |

---

## Licencia

Propietario. Todos los derechos reservados. Elevate Sports Holding.

---

<p align="center">
  <strong>Elevate Sports</strong> &mdash; La herramienta de mando para clubes deportivos
</p>
