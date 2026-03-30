# Elevate Sports — Arquitectura del Sistema (2026-03-29)

> Diagrama generado por @Carlos (Arquitecto) a partir del código fuente real.
> Última revisión: 2026-03-29. Fuente de verdad: rama `desarrollo`.

---

## 1. Diagrama de Componentes

```mermaid
graph TD
  %% ── Entry Point ──────────────────────────────────────────────────────────
  subgraph entry["Entry Point"]
    main["main.jsx"]
    regSW["registerSW.js\n(PWA bridge)"]
  end

  %% ── PWA / Build ──────────────────────────────────────────────────────────
  subgraph build["Build & PWA — vite.config.js"]
    vPWA["vite-plugin-pwa\n(Workbox)"]
    SW["Service Worker\nsw.js\nCacheFirst / NetworkFirst\nBackgroundSync"]
  end

  %% ── Root ──────────────────────────────────────────────────────────────────
  subgraph appRoot["App.jsx — BrowserRouter"]
    AppRoot["App()\nBrowserRouter + Routes"]
    CRMApp["CRMApp()\nState machine\nactiveModule • athletes • historial\nclubInfo • matchStats • finanzas\nmode • session • authProfile"]
  end

  %% ── Portal (rutas públicas) ───────────────────────────────────────────────
  subgraph portal["Portal Corporativo — lazy loaded (/)"]
    PortalLayout["PortalLayout\nNavbar glassmorphism + Outlet\nRoute: /"]
    PortalHome["PortalHome (index)"]
    HeroSection["HeroSection"]
    EcoSection["EcosystemSection"]
    ServicesSection["ServicesSection"]
    JournalSection["JournalSection"]
    QuienesSomos["QuienesSomos\n/quienes-somos"]
    Contacto["Contacto\n/contacto"]
    SportsCRMPage["SportsCRMPage\n/servicios/sports-crm"]
    JournalPage["JournalPage\n/journal"]
    PrivacyPolicy["PrivacyPolicy\n/privacidad"]
  end

  %% ── CRM módulos ──────────────────────────────────────────────────────────
  subgraph crm["CRM App — lazy loaded (/crm/*)"]
    LandingPage["LandingPage\nlogin + register\n← sin mode"]
    Home["Home\nDashboard FIFA\nKPIs clickeables\nProximo Evento real"]
    Entrenamiento["Entrenamiento\nRPE engine\nAsistencia + sesiones"]
    GestionPlantilla["GestionPlantilla\nLista FIFA + Pizarra táctica\nBulkAthleteUploader"]
    Administracion["Administracion\nPagos · Movimientos · Resumen"]
    MiClub["MiClub\nConfig del club"]
    Calendario["Calendario\nVista mensual + RSVP"]
    MatchCenter["MatchCenter\nPost-partido · Player Card Pro\nElevateScore · Spider SVG"]
    Reportes["Reportes\n(inline en App.jsx)"]
  end

  %% ── TacticalBoard V9 subsystem ───────────────────────────────────────────
  subgraph tbv9["TacticalBoard V9 — subsistema"]
    TBV9["TacticalBoardV9\nv9.1 landscape 105x68\nfull/half pitch toggle"]
    FieldLayer["FieldLayer\nLayer 1 — SVG pitch\nforwardRef • memo"]
    DrawingLayer["DrawingLayer\nLayer 3 — SVG vectors\nflechas · presión · corte"]
    GhostToken["GhostToken\nDrag ghost\nring buffer trail 3 sombras\n60fps sin re-renders"]
    DrawingToolbar["DrawingToolbar\nBottom bar\npanel expandible AnimatePresence"]
    Planificacion["Planificacion\nsub-component de Entrenamiento"]
    BulkUploader["BulkAthleteUploader\nCSV / XLSX onboarding"]
  end

  %% ── UI Primitives ────────────────────────────────────────────────────────
  subgraph uiPrim["UI Primitives — src/components/ui/"]
    EmptyState["EmptyState"]
    OfflineBanner["OfflineBanner"]
    UpdateToast["UpdateToast"]
    InstallBanner["InstallAppBanner"]
    ImportIcons["ImportIcons"]
  end

  subgraph sharedComps["Shared Components — src/components/"]
    ErrorBoundary["ErrorBoundary"]
    Toast["Toast / ToastContainer"]
    FieldBg["FieldBackground"]
    ConfirmModal["ConfirmModal"]
    LegalDisclaimer["LegalDisclaimer"]
    MiniTopbar["MiniTopbar (inline CRMApp)"]
  end

  %% ── Hooks ────────────────────────────────────────────────────────────────
  subgraph hooks["Hooks — src/hooks/"]
    useLS["useLocalStorage\nsyncs state ↔ localStorage\nerror handler injectable"]
    useSBSync["useSupabaseSync\nwrite-through pattern\noffline-first"]
    useDrag["useDragEngine\nlong-press 150ms\npointer events\nsnap to nearest token"]
    useDraw["useDrawingEngine\nSVG drawing state\ncoords porcentuales 0-100\nlocalStorage persist"]
    useResp["useResponsive\nbreakpoints xs/sm/md/lg\ndebounced 150ms"]
    useInstall["useInstallPWA\nbeforeinstallprompt\niOS detect\n7-day dismiss"]
  end

  %% ── Services ─────────────────────────────────────────────────────────────
  subgraph services["Services — src/services/"]
    sbSvc["supabaseService\nwrite-through cache\ncreateClub · getClub\nsaveAthletes · saveSession\nmigrateLocalToSupabase"]
    authSvc["authService\nsignUp · signIn · signOut\ngetProfile · onAuthStateChange\nlinkProfileToClub"]
    healthSvc["healthService\ntakeHealthSnapshot\ngetSnapshots · clearSnapshots\nsetHealthClubId (multi-tenancy)"]
    storageSvc["storageService\nloadDemoState · loadProductionState\nlogout · calcStats · buildSesion"]
    migSvc["migrationService\nrunMigrations\nschema versioning"]
    backupSvc["backupService\nexportBackupJSON"]
    bulkSvc["bulkUploadService\nCSV/XLSX parse"]
  end

  %% ── Lib ──────────────────────────────────────────────────────────────────
  subgraph lib["Lib — src/lib/"]
    sbClient["supabase.js\ncreateClient\nisSupabaseReady flag"]
    regSWLib["registerSW.js\nSW lifecycle bridge"]
  end

  %% ── Utils ────────────────────────────────────────────────────────────────
  subgraph utils["Utils — src/utils/"]
    rpe["rpeEngine\ncalcSaludActual\ncalcCargaSemanal\nsaludColor · tendenciaSalud"]
    score["elevateScore\ncalcElevateScore\ncalcOVR\ngetPerformanceAlert\ngenerateRecommendations\ngetAthleteScoreHistory"]
    helpers["helpers\ngetAvatarUrl (DiceBear)\ncalculateAge\ngetStatusStyle"]
    sanitize["sanitize (DOMPurify)\nsanitizeText (onChange)\nsanitizeNote\nsanitizeTextFinal (submit)"]
  end

  %% ── Constants ────────────────────────────────────────────────────────────
  subgraph constants["Constants — src/constants/"]
    palette["palette.js\nPALETTE\nneon · purple · bg · surface…"]
    roles["roles.js\nROLES (admin/coach/staff)\nhasPermission · canAccessModule\nSESSION_KEY · createSession"]
    schemas["schemas.js\nZod schemas\ncreateMovimiento · validatePago\nvalidateSesion"]
    initStates["initialStates.js\nEMPTY_ATHLETES\nEMPTY_HISTORIAL\nEMPTY_MATCH_STATS\nEMPTY_FINANZAS"]
  end

  %% ── Supabase (external) ──────────────────────────────────────────────────
  subgraph supabase["Supabase BaaS"]
    sbDB[("PostgreSQL + RLS\nclubs · profiles\nathletes · sessions\nhealth_snapshots\npagos · movimientos\nmatch_reports\ncalendar_events · rsvp")]
    sbAuth["Auth\nemail/password\ntrigger → profiles"]
  end

  %% ═══ EDGES — Entry ═══
  main --> AppRoot
  main --> regSW
  regSW --> SW

  %% ═══ EDGES — App Root ═══
  AppRoot -->|"Route /"| PortalLayout
  AppRoot -->|"Route /crm/*"| CRMApp
  AppRoot -->|"Route /privacidad"| PrivacyPolicy

  %% ═══ EDGES — Portal ═══
  PortalLayout --> PortalHome
  PortalLayout --> QuienesSomos
  PortalLayout --> Contacto
  PortalLayout --> SportsCRMPage
  PortalLayout --> JournalPage
  PortalLayout -.-> OfflineBanner
  PortalLayout -.-> UpdateToast
  PortalLayout -.-> InstallBanner
  PortalLayout -.-> useResp
  PortalHome --> HeroSection
  PortalHome --> EcoSection
  PortalHome --> ServicesSection
  PortalHome --> JournalSection

  %% ═══ EDGES — CRM ═══
  CRMApp -->|"!mode"| LandingPage
  CRMApp -->|"home"| Home
  CRMApp -->|"entrenamiento"| Entrenamiento
  CRMApp -->|"plantilla"| GestionPlantilla
  CRMApp -->|"admin"| Administracion
  CRMApp -->|"miclub"| MiClub
  CRMApp -->|"calendario"| Calendario
  CRMApp -->|"partidos"| MatchCenter
  CRMApp -->|"reportes"| Reportes
  CRMApp -.-> ErrorBoundary
  CRMApp -.-> MiniTopbar
  CRMApp -.-> FieldBg
  CRMApp -.-> OfflineBanner
  CRMApp -.-> UpdateToast

  %% CRMApp hooks
  CRMApp -.-> useLS
  CRMApp -.-> useSBSync
  CRMApp -.-> authSvc
  CRMApp -.-> storageSvc
  CRMApp -.-> healthSvc
  CRMApp -.-> backupSvc
  CRMApp -.-> sbSvc
  CRMApp -.-> roles
  CRMApp -.-> initStates
  CRMApp -.-> schemas
  CRMApp -.-> palette

  %% ═══ EDGES — GestionPlantilla ═══
  GestionPlantilla --> TBV9
  GestionPlantilla --> BulkUploader

  %% ═══ EDGES — TacticalBoard V9 ═══
  TBV9 --> FieldLayer
  TBV9 --> DrawingLayer
  TBV9 --> GhostToken
  TBV9 --> DrawingToolbar
  TBV9 -.-> useDrag
  TBV9 -.-> useDraw
  TBV9 -.-> useLS
  TBV9 -.-> rpe
  TBV9 -.-> helpers

  %% ═══ EDGES — Entrenamiento ═══
  Entrenamiento --> Planificacion
  Entrenamiento -.-> rpe
  Entrenamiento -.-> sanitize
  Entrenamiento -.-> helpers

  %% ═══ EDGES — MatchCenter ═══
  MatchCenter -.-> score

  %% ═══ EDGES — Administracion ═══
  Administracion -.-> schemas
  Administracion -.-> ConfirmModal

  %% ═══ EDGES — MiClub ═══
  MiClub -.-> sanitize

  %% ═══ EDGES — Home ═══
  Home -.-> useResp
  Home -.-> EmptyState

  %% ═══ EDGES — Hooks ═══
  useSBSync --> sbSvc
  useSBSync --> sbClient
  useDraw -.-> useLS
  healthSvc -.-> rpe

  %% ═══ EDGES — Services → Lib/External ═══
  sbSvc --> sbClient
  authSvc --> sbClient
  sbClient --> sbDB
  sbClient --> sbAuth
```

---

## 2. Diagrama de Entidades de Datos (Data Model simplificado)

```mermaid
classDiagram
  class Club {
    +string id
    +string nombre
    +string disciplina
    +string ciudad
    +string entrenador
    +string temporada
    +string[] categorias
    +string[] campos
    +string email
    +string telefono
    +string mode
  }

  class Profile {
    +uuid id
    +uuid club_id
    +string full_name
    +string role
    +string email
  }

  class Athlete {
    +string id
    +string nombre
    +string posicion
    +number dorsal
    +string dob
    +number rpe
    +string estado
    +string photo
    +string club_id
  }

  class Session {
    +number num
    +string fecha
    +string tipo
    +number presentes
    +number total
    +number rpeAvg
    +string nota
    +string club_id
  }

  class HealthSnapshot {
    +string athleteId
    +string athleteName
    +number sessionNum
    +string fecha
    +number saludActual
    +number rpe
    +string clubId
  }

  class MatchReport {
    +string athleteId
    +string fecha
    +number goles
    +number asistencias
    +number recuperaciones
    +number duelosGanados
    +number minutosJugados
    +boolean tarjetaAmarilla
    +boolean tarjetaRoja
    +number rpe
    +number elevateScore
    +number ovr
    +string club_id
  }

  class Pago {
    +string athleteId
    +string mes
    +string estado
    +number monto
    +string club_id
  }

  class Movimiento {
    +string id
    +string tipo
    +number monto
    +string categoria
    +string descripcion
    +string fecha
    +string club_id
  }

  class CalendarEvent {
    +string id
    +string tipo
    +string fecha
    +string hora
    +string titulo
    +string lugar
    +string[] convocados
    +string club_id
  }

  class RSVPEntry {
    +string eventId
    +string athleteId
    +string estado
    +string club_id
  }

  Club "1" --> "*" Profile : tiene
  Club "1" --> "*" Athlete : gestiona
  Club "1" --> "*" Session : registra
  Club "1" --> "*" MatchReport : produce
  Club "1" --> "*" Pago : controla
  Club "1" --> "*" Movimiento : registra
  Club "1" --> "*" CalendarEvent : agenda
  Athlete "1" --> "*" HealthSnapshot : genera
  Athlete "1" --> "*" MatchReport : protagoniza
  Athlete "1" --> "*" Pago : tiene
  CalendarEvent "1" --> "*" RSVPEntry : contiene
  Session "1" --> "*" HealthSnapshot : dispara
```

---

## 3. Máquina de Estados — Navegación CRMApp

```mermaid
stateDiagram-v2
  [*] --> Portal : "/" — ruta pública

  Portal --> CRM_LandingPage : navega a /crm

  state Portal {
    [*] --> PortalHome
    PortalHome --> QuienesSomos : /quienes-somos
    PortalHome --> Contacto : /contacto
    PortalHome --> SportsCRMPage : /servicios/sports-crm
    PortalHome --> JournalPage : /journal
    PortalHome --> CRM_LandingPage : CTA "Ir al CRM"
  }

  state "CRM — mode=null" as CRM_LandingPage {
    [*] --> login_register : render LandingPage
    login_register --> handleDemo : Demo mode
    login_register --> handleRegister : Registro nuevo club
    login_register --> handleLogin : Login Supabase Auth
  }

  handleDemo --> CRM_Home : mode=demo, activeModule=home
  handleRegister --> CRM_Home : mode=production, activeModule=home
  handleLogin --> CRM_Home : mode=production, activeModule=home

  state "CRM — mode activo" as CRM_Active {
    [*] --> CRM_Home

    CRM_Home --> CRM_Entrenamiento : navigateTo(entrenamiento)
    CRM_Home --> CRM_Plantilla : navigateTo(plantilla)
    CRM_Home --> CRM_Admin : navigateTo(admin)
    CRM_Home --> CRM_MiClub : navigateTo(miclub)
    CRM_Home --> CRM_Calendario : navigateTo(calendario)
    CRM_Home --> CRM_Partidos : navigateTo(partidos)
    CRM_Home --> CRM_Reportes : navigateTo(reportes)

    CRM_Entrenamiento --> CRM_Home : MiniTopbar ← Dashboard
    CRM_Plantilla --> CRM_Home : MiniTopbar ← Dashboard
    CRM_Admin --> CRM_Home : MiniTopbar ← Dashboard
    CRM_MiClub --> CRM_Home : MiniTopbar ← Dashboard
    CRM_Calendario --> CRM_Home : MiniTopbar ← Dashboard
    CRM_Partidos --> CRM_Home : MiniTopbar ← Dashboard
    CRM_Reportes --> CRM_Home : MiniTopbar ← Dashboard

    state CRM_Plantilla {
      [*] --> ListView
      ListView --> TacticalBoardV9 : tab Pizarra
      TacticalBoardV9 --> ListView : tab Lista
    }

    note right of CRM_Admin
      RBAC: solo role=admin
      permission: view:admin
    end note

    note right of CRM_Partidos
      RBAC: admin + coach
      permission: view:partidos
    end note
  }

  CRM_LandingPage --> CRM_Active : mode set
  CRM_Active --> [*] : handleLogout → navigate("/")

  note right of CRM_Active
    RBAC: canAccessModule(userRole, mod)
    Roles: admin | coach | staff
    Auth source priority:
    1. authProfile.role (Supabase)
    2. session.role (localStorage)
    3. fallback: "admin"
  end note
```

---

## 4. Flujo de Datos — Offline-First + Supabase Sync

```mermaid
sequenceDiagram
  participant User
  participant CRMApp
  participant localStorage
  participant useSupabaseSync
  participant supabaseService
  participant SupabaseDB

  User->>CRMApp: Login / Demo
  CRMApp->>localStorage: loadDemoState / loadProductionState
  CRMApp->>localStorage: setAthletes, setHistorial, etc. (via useLocalStorage)

  Note over CRMApp,SupabaseDB: Boot — offline-first sync
  CRMApp->>useSupabaseSync: mount
  useSupabaseSync->>supabaseService: getAthletes(clubId)
  supabaseService->>SupabaseDB: SELECT * FROM athletes WHERE club_id=?
  SupabaseDB-->>supabaseService: rows
  supabaseService-->>useSupabaseSync: data
  useSupabaseSync->>CRMApp: setAthletes(data) — overwrite cache

  Note over CRMApp,SupabaseDB: Write — guardar sesion
  User->>CRMApp: guardarSesion(nota, tipo)
  CRMApp->>localStorage: setHistorial (inmediato)
  CRMApp->>useSupabaseSync: syncSession(sesion) — background
  useSupabaseSync->>supabaseService: saveSession(sesion, clubId)
  supabaseService->>SupabaseDB: INSERT INTO sessions
  SupabaseDB-->>supabaseService: ok

  Note over CRMApp,SupabaseDB: Write — health snapshots
  CRMApp->>healthService: takeHealthSnapshot(athletes, historial, sesion.num)
  healthService->>localStorage: setItem(elevate_healthSnapshots_{clubId})
  CRMApp->>useSupabaseSync: syncHealthSnapshots(snapshots) — background
  useSupabaseSync->>supabaseService: saveHealthSnapshots(snapshots)
  supabaseService->>SupabaseDB: INSERT INTO health_snapshots
```

---

## Resumen del Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | React | 19 |
| Bundler | Vite | 8 |
| Animaciones | Framer Motion | 12 |
| Router | React Router DOM | 6 |
| Backend/Auth/DB | Supabase | latest |
| PWA | vite-plugin-pwa + Workbox | latest |
| Sanitización | DOMPurify | latest |
| Validación | Zod | latest |
| Deploy | Vercel | auto-deploy desde master |

## RBAC — Permisos por Rol

| Permiso | admin | coach | staff |
|---------|-------|-------|-------|
| view:home | SI | SI | SI |
| view:entrenamiento | SI | SI | SI |
| view:plantilla | SI | SI | NO |
| view:admin | SI | NO | NO |
| view:miclub | SI | NO | NO |
| view:reportes | SI | SI | NO |
| view:calendario | SI | SI | NO |
| view:partidos | SI | SI | NO |
| edit:athletes | SI | SI | NO |
| edit:sesion | SI | SI | SI |
| edit:finanzas | SI | NO | NO |
| edit:tactical | SI | SI | NO |
| export:backup | SI | NO | NO |
| manage:roles | SI | NO | NO |
