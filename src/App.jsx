/**
 * @component App v8 — Auth-Ready
 * @description Componente raiz resiliente:
 * - Supabase Auth (email/password) para login/registro
 * - ErrorBoundary envuelve cada modulo
 * - React.lazy + Suspense para code-splitting
 * - Toast notifications (no alert)
 * - Schema migrations al boot
 *
 * @version 8.0
 * @author @Arquitecto (Julian) + @Data (Mateo) v2 Auth
 */

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { setHookErrorHandler } from "./hooks/useLocalStorage";
import { useStore } from "./store/useStore";
import FieldBackground from "./components/FieldBackground";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer, { showToast } from "./components/Toast";
import { EMPTY_ATHLETES, EMPTY_HISTORIAL, EMPTY_MATCH_STATS, EMPTY_FINANZAS } from "./constants/initialStates";
import {
  loadDemoState, loadProductionState, logout as logoutService,
  setStorageErrorHandler,
} from "./services/storageService";
import { clearSnapshots, setHealthErrorHandler, setHealthClubId } from "./services/healthService";
import { runMigrations } from "./services/migrationService";
import { PALETTE as C } from "./constants/palette";
import { SESSION_KEY, createSession, validateSession, canAccessModule } from "./constants/roles";
import { setValidationErrorHandler } from "./constants/schemas";

import { isSupabaseReady } from "./lib/supabase";
import { createClub as sbCreateClub, setClubId, setSupabaseErrorHandler, migrateLocalToSupabase, loadClubIdFromProfile } from "./services/supabaseService";
import { exportBackupJSON } from "./services/backupService";
import { signUp, signIn, signOut as authSignOut, getProfile, onAuthStateChange, setAuthErrorHandler, linkProfileToClub } from "./services/authService";
import OfflineBanner from "./components/ui/OfflineBanner";
import UpdateToast from "./components/ui/UpdateToast";

// ── React.lazy: code-splitting por modulo ──
const PortalLayout = lazy(() => import("./components/portal/PortalLayout"));
const PortalHome = lazy(() => import("./components/portal/PortalHome"));
const SportsCRMPage = lazy(() => import("./components/portal/SportsCRMPage"));
const JournalPage = lazy(() => import("./components/portal/JournalPage"));
const QuienesSomos = lazy(() => import("./components/portal/QuienesSomos"));
const Contacto = lazy(() => import("./components/portal/Contacto"));
const PrivacyPolicy = lazy(() => import("./components/portal/PrivacyPolicy"));
const ConfirmarAsistencia = lazy(() => import("./components/portal/ConfirmarAsistencia"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const Home = lazy(() => import("./components/Home"));
const Entrenamiento = lazy(() => import("./components/Entrenamiento"));
const GestionPlantilla = lazy(() => import("./components/GestionPlantilla"));
const MiClub = lazy(() => import("./components/MiClub"));
const Administracion = lazy(() => import("./components/Administracion"));
const Calendario     = lazy(() => import("./components/Calendario"));
const MatchCenter    = lazy(() => import("./components/MatchCenter"));
const DemoGate       = lazy(() => import("./components/DemoGate"));
const KioskMode      = lazy(() => import("./components/KioskMode"));

// ── Conectar handlers de error de storage al boot (antes de que cualquier hook escriba) ──
const _toastError = (msg) => showToast(msg, "error");
setStorageErrorHandler(_toastError);
setHookErrorHandler(_toastError);
setHealthErrorHandler(_toastError);
setValidationErrorHandler(_toastError);
setSupabaseErrorHandler(_toastError);
setAuthErrorHandler(_toastError);

// ── Ejecutar migraciones al boot ──
runMigrations();
// Migration result tracked internally — no console output in production

// ── Loading fallback ──
const LoadingFallback = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
    <div style={{ textAlign:"center" }}>
      <div style={{ width:24, height:24, border:`2px solid ${C.neon}`, borderTop:"2px solid transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} />
      <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"2px" }}>Inicializando</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  </div>
);

function MiniTopbar({
  title,
  accent = C.neon,
  accentBg = "rgba(200,255,0,0.05)",
  mode,
  clubName,
  clubCategory,
  onHomeClick,
}) {
  return (
    <div style={{ height:38, background:"rgba(10,10,15,0.85)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${accent}33`, display:"flex", alignItems:"stretch" }}>
      <div onClick={onHomeClick} style={{ padding:"0 18px", fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color:C.textMuted, display:"flex", alignItems:"center", cursor:"pointer", borderRight:`1px solid ${C.border}`, transition:"color 0.15s" }} onMouseEnter={e=>e.currentTarget.style.color="white"} onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}>
        â† Dashboard
      </div>
      <div style={{ padding:"0 18px", fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color:"white", display:"flex", alignItems:"center", borderBottom:`2px solid ${accent}`, background:accentBg }}>
        {title}
      </div>
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10, padding:"0 18px" }}>
        {mode === "demo" && (
          <div style={{ padding:"2px 8px", fontSize:8, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", background:`${C.amber}33`, color:C.amber, border:`1px solid ${C.amber}66` }}>Demo</div>
        )}
        <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"1px" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:accent, display:"inline-block", marginRight:6 }}/>
          {clubName || "Mi Club"} Â· {clubCategory || "General"}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_CLUB = { nombre:"", disciplina:"", ciudad:"", entrenador:"", temporada:"", categorias:[], campos:[], descripcion:"", telefono:"", email:"" };

// ── Root: BrowserRouter wrapper ──
export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Portal Corporativo — rutas con navbar compartida */}
        <Route element={<Suspense fallback={<LoadingFallback />}><PortalLayout /></Suspense>}>
          <Route index element={<PortalHome />} />
          <Route path="quienes-somos" element={<QuienesSomos />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="servicios/sports-crm" element={<SportsCRMPage />} />
          <Route path="journal" element={<JournalPage />} />
        </Route>
        {/* Politica de Privacidad — publica, sin navbar del portal */}
        <Route
          path="/privacidad"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        {/* Confirmacion de asistencia — publica, sin login, acceso via link de WhatsApp */}
        <Route
          path="/confirmar/:clubId/:eventId"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ConfirmarAsistencia />
            </Suspense>
          }
        />
        {/* CRM App — sistema de gestion deportiva */}
        <Route path="/crm/*" element={<CRMApp />} />
      </Routes>
    </BrowserRouter>
  );
}

// ── CRM App: todo el sistema de gestion deportiva ──
function CRMApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = useStore(state => state.mode);
  const setMode = useStore(state => state.setMode);
  const session = useStore(state => state.session);
  const setSession = useStore(state => state.setSession);
  const activeModule = useStore(state => state.activeModule);
  const setActiveModule = useStore(state => state.setActiveModule);
  const setAthletes = useStore(state => state.setAthletes);
  const setHistorial = useStore(state => state.setHistorial);
  const clubInfo = useStore(state => state.clubInfo);
  const setClubInfo = useStore(state => state.setClubInfo);
  const setMatchStats = useStore(state => state.setMatchStats);
  const setFinanzas = useStore(state => state.setFinanzas);
  const clearStore = useStore(state => state.clearStore);

  // ── Sync handling has been moved to useStore/components ──

  // Auth state: perfil de Supabase (club_id + role)
  const [authProfile, setAuthProfile] = useState(null);

  // Listener de auth: detecta login/logout/token refresh
  useEffect(() => {
    if (!isSupabaseReady) return;
    const sub = onAuthStateChange(async (event, authSession) => {
      if (event === "SIGNED_IN" && authSession) {
        const profile = await getProfile();
        setAuthProfile(profile);
        if (profile?.club_id) {
          setClubId(profile.club_id);
          setHealthClubId(profile.club_id); // aislar snapshots por club en dispositivo compartido
          await loadClubIdFromProfile();
        }
      } else if (event === "SIGNED_OUT") {
        setAuthProfile(null);
      }
    });
    // Cargar profile si ya hay sesion activa al boot
    (async () => {
      const profile = await getProfile();
      if (profile) {
        setAuthProfile(profile);
        if (profile.club_id) {
          setClubId(profile.club_id);
          setHealthClubId(profile.club_id); // aislar snapshots por club al recargar pagina
        }
      }
    })();
    return () => sub.unsubscribe();
  }, []);

  // Role: prioridad auth profile > localStorage session > null (sin fallback privilegiado)
  // SECURITY: nunca se asume un rol por defecto. Si no hay autenticacion valida, userRole = null.
  const userRole = authProfile?.role
    || ((session && validateSession(session)) ? session.role : null);

  // Navegación con control de acceso por rol
  const navigateTo = useCallback((mod) => {
    if (!canAccessModule(userRole, mod)) {
      showToast(`Acceso restringido. Tu perfil (${userRole}) no tiene permisos para este modulo.`, "warning");
      return;
    }
    setActiveModule(mod);
  }, [userRole]);

  const handleDemo = useCallback(() => {
    loadDemoState();
    const demoSession = createSession("admin", "Demo User");
    setSession(demoSession);
    const demoAthletes = JSON.parse(localStorage.getItem("elevate_athletes"));
    const demoHistorial = JSON.parse(localStorage.getItem("elevate_historial"));
    const demoClubInfo = JSON.parse(localStorage.getItem("elevate_clubInfo"));
    const demoMatchStats = JSON.parse(localStorage.getItem("elevate_matchStats"));
    const demoFinanzas = JSON.parse(localStorage.getItem("elevate_finanzas"));
    setAthletes(demoAthletes);
    setHistorial(demoHistorial);
    setClubInfo(demoClubInfo);
    setMatchStats(demoMatchStats);
    setFinanzas(demoFinanzas);
    setActiveModule("home");
    setMode("demo");
    // Sync demo data to Supabase in background
    if (isSupabaseReady) {
      migrateLocalToSupabase({
        clubInfo: demoClubInfo, athletes: demoAthletes, historial: demoHistorial,
        finanzas: demoFinanzas, matchStats: demoMatchStats, mode: "demo",
      }).then(r => r.success && showToast("Entorno demo sincronizado con la nube.", "info"));
    }
  }, [setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas, setMode, setSession]);

  const handleRegister = useCallback(async (form) => {
    // 1. Registrar en Supabase Auth (si disponible)
    if (isSupabaseReady && form.email && form.password) {
      const { user, error } = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.entrenador,
        role: form.role || "admin",
      });
      if (error) {
        showToast(error, "error");
        return;
      }
      if (user) {
        showToast("Cuenta creada. Revisa tu correo para confirmar el acceso.", "info");
      }
    }

    // 2. Configurar estado local (offline-first)
    loadProductionState(form);
    const newSession = createSession(form.role || "admin", form.entrenador);
    setSession(newSession);
    setAthletes(EMPTY_ATHLETES);
    setHistorial(EMPTY_HISTORIAL);
    const newClubInfo = JSON.parse(localStorage.getItem("elevate_clubInfo"));
    setClubInfo(newClubInfo);
    setMatchStats(EMPTY_MATCH_STATS);
    setFinanzas(EMPTY_FINANZAS);
    setActiveModule("home");
    setMode("production");

    // 3. Crear club en Supabase y vincular al profile
    if (isSupabaseReady) {
      const clubId = await sbCreateClub(form, "production");
      if (clubId) {
        await linkProfileToClub(clubId);
        showToast("Club registrado y sincronizado en la nube.", "info");
      }
    }
  }, [setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas, setMode, setSession]);

  const handleLogin = useCallback(async ({ email, password }) => {
    if (!isSupabaseReady) {
      showToast("Supabase no disponible — usa modo demo", "warning");
      return;
    }
    const { user, error } = await signIn(email, password);
    if (error) {
      showToast(error, "error");
      return;
    }

    // Cargar profile y club_id
    const profile = await getProfile();
    if (!profile?.club_id) {
      showToast("No se encontro un club vinculado a esta cuenta. Contacta al administrador.", "warning");
      return;
    }
    setAuthProfile(profile);
    setClubId(profile.club_id);
    setHealthClubId(profile.club_id); // aislar snapshots por club en dispositivo compartido

    // Configurar sesion local (compatibilidad)
    const localSession = createSession(profile.role || "admin", profile.full_name || user.email);
    setSession(localSession);
    setMode("production");
    setActiveModule("home");
    showToast(`Bienvenido, ${profile.full_name || user.email}`, "success");
  }, [setSession, setMode]);

  const handleLogout = useCallback(async () => {
    // Cerrar sesion Supabase Auth
    if (isSupabaseReady) await authSignOut();
    setAuthProfile(null);
    logoutService();
    clearSnapshots();
    setClubId(null);
    setSession(null);
    setAthletes(EMPTY_ATHLETES);
    setHistorial(EMPTY_HISTORIAL);
    setClubInfo(DEFAULT_CLUB);
    setMatchStats(EMPTY_MATCH_STATS);
    setFinanzas(EMPTY_FINANZAS);
    setActiveModule("home");
    setMode(null);
    navigate("/");
  }, [setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas, setMode, setSession, navigate]);

  // Guard: si el usuario esta en el CRM (mode activo) pero no tiene rol verificado, forzar logout.
  // Esto cierra el vector donde un atacante borra authProfile y manipula localStorage
  // para obtener el antiguo fallback "admin".
  useEffect(() => {
    if (mode && !userRole) {
      const logoutId = setTimeout(() => {
        handleLogout();
      }, 0);
      return () => clearTimeout(logoutId);
    }
  }, [mode, userRole, handleLogout]);

  // Auto-demo: si llegan desde el portal con ?demo=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true" && !mode) {
      const demoId = setTimeout(() => {
        handleDemo();
      }, 0);
      window.history.replaceState({}, "", "/crm");
      return () => clearTimeout(demoId);
    }
  }, [handleDemo, mode]);

  // ── Kiosk mode: URL directa /crm/kiosk — sin auth, sin wrapper ──
  if (location.pathname === "/crm/kiosk") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <KioskMode />
      </Suspense>
    );
  }

  // ── Landing: directo al formulario de login/registro ──
  if (!mode) {
    return (
      <div style={{ minHeight:"100vh", background:"#050a14", position:"relative" }}>
        <FieldBackground />
        <ToastContainer />
        <OfflineBanner />
        <UpdateToast />
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage onDemo={handleDemo} onRegister={handleRegister} onLogin={handleLogin} />
        </Suspense>
      </div>
    );
  }



  const _MiniTopbarLocal = ({ title, accent = C.neon, accentBg = "rgba(200,255,0,0.05)" }) => (
    <div style={{ height:38, background:"rgba(10,10,15,0.85)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${accent}33`, display:"flex", alignItems:"stretch" }}>
      <div onClick={() => setActiveModule("home")} style={{ padding:"0 18px", fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color:C.textMuted, display:"flex", alignItems:"center", cursor:"pointer", borderRight:`1px solid ${C.border}`, transition:"color 0.15s" }} onMouseEnter={e=>e.currentTarget.style.color="white"} onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}>
        ← Dashboard
      </div>
      <div style={{ padding:"0 18px", fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color:"white", display:"flex", alignItems:"center", borderBottom:`2px solid ${accent}`, background:accentBg }}>
        {title}
      </div>
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10, padding:"0 18px" }}>
        {mode === "demo" && (
          <div style={{ padding:"2px 8px", fontSize:8, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", background:`${C.amber}33`, color:C.amber, border:`1px solid ${C.amber}66` }}>Demo</div>
        )}
        <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"1px" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:accent, display:"inline-block", marginRight:6 }}/>
          {clubInfo.nombre || "Mi Club"} · {(clubInfo.categorias||[])[0]||"General"}
        </div>
      </div>
    </div>
  );

  // ── Routing con ErrorBoundary + Suspense por modulo ──
  return (
    <div style={{ minHeight:"100vh", background:C.bg, position:"relative" }}>
      <FieldBackground />
      <ToastContainer />
      <OfflineBanner />
      <UpdateToast />
      {/* Gate de conversión para modo demo: banner persistente + modal a los 15 min */}
      {mode === "demo" && (
        <Suspense fallback={null}>
          <DemoGate onNavigateToRegister={handleLogout} />
        </Suspense>
      )}
      {/* Padding bottom compensa el banner del DemoGate (52px) en modo demo */}
      <div style={{ position:"relative", zIndex:2, paddingBottom: mode === "demo" ? 60 : 0 }}>
        <Suspense fallback={<LoadingFallback />}>

          {activeModule === "home" && (
            <ErrorBoundary>
              <Home onNavigate={navigateTo} mode={mode} onLogout={handleLogout} userRole={userRole} onExportBackup={() => { exportBackupJSON(); showToast("Backup descargado correctamente", "success"); }} />
            </ErrorBoundary>
          )}

          {activeModule === "entrenamiento" && (
            <ErrorBoundary>
              <MiniTopbar title="Entrenamiento" mode={mode} clubName={clubInfo.nombre} clubCategory={(clubInfo.categorias || [])[0]} onHomeClick={() => setActiveModule("home")} />
              <Entrenamiento clubId={authProfile?.club_id || ""} />
            </ErrorBoundary>
          )}

          {activeModule === "plantilla" && (
            <ErrorBoundary>
              <MiniTopbar title="Gestion de plantilla" mode={mode} clubName={clubInfo.nombre} clubCategory={(clubInfo.categorias || [])[0]} onHomeClick={() => setActiveModule("home")} />
              <GestionPlantilla clubId={authProfile?.club_id || ""} />
            </ErrorBoundary>
          )}

          {activeModule === "miclub" && (
            <ErrorBoundary>
              <MiniTopbar title="Mi club" mode={mode} clubName={clubInfo.nombre} clubCategory={(clubInfo.categorias || [])[0]} onHomeClick={() => setActiveModule("home")} />
              <MiClub />
            </ErrorBoundary>
          )}

          {activeModule === "admin" && (
            <ErrorBoundary>
              <MiniTopbar title="Administracion" accent={C.purple} accentBg="rgba(127,119,221,0.08)" mode={mode} clubName={clubInfo.nombre} clubCategory={(clubInfo.categorias || [])[0]} onHomeClick={() => setActiveModule("home")} />
              <Administracion />
            </ErrorBoundary>
          )}

          {activeModule === "calendario" && (
            <ErrorBoundary>
              <MiniTopbar title="Calendario" accent={C.neon} accentBg="rgba(200,255,0,0.05)" mode={mode} clubName={clubInfo.nombre} clubCategory={(clubInfo.categorias || [])[0]} onHomeClick={() => setActiveModule("home")} />
              <Calendario clubId={authProfile?.club_id || ""} />
            </ErrorBoundary>
          )}

          {activeModule === "partidos" && (
            <ErrorBoundary>
              <MiniTopbar title="Match Center" accent={C.neon} accentBg="rgba(200,255,0,0.05)" mode={mode} clubName={clubInfo.nombre} clubCategory={(clubInfo.categorias || [])[0]} onHomeClick={() => setActiveModule("home")} />
              <MatchCenter clubId={authProfile?.club_id || ""} />
            </ErrorBoundary>
          )}

          {activeModule === "reportes" && (
            <ErrorBoundary>
              <MiniTopbar title="Reportes" mode={mode} clubName={clubInfo.nombre} clubCategory={(clubInfo.categorias || [])[0]} onHomeClick={() => setActiveModule("home")} />
              <Reportes onNavigate={navigateTo} />
            </ErrorBoundary>
          )}

        </Suspense>
      </div>
    </div>
  );
}

// Inject hover styles for Reportes KPI cards
if (typeof document !== "undefined" && !document.getElementById("reportes-kpi-styles")) {
  const s = document.createElement("style");
  s.id = "reportes-kpi-styles";
  s.textContent = `
    .rep-kpi-card { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
    .rep-kpi-card:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 40px rgba(0,0,0,0.6); }
    .rep-session-row { transition: background 0.15s ease; }
    .rep-session-row:hover { background: rgba(255,255,255,0.06) !important; }
    .rep-secondary-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .rep-secondary-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.5); }
    @media (max-width: 767px) {
      .rep-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .rep-bottom-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(s);
}

// Inline micro-sparkline: renders last N values as an SVG bar chart
function MiniSparkline({ values, color, height = 28, width = 56 }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  const barW = Math.floor((width - (values.length - 1) * 2) / values.length);
  return (
    <svg width={width} height={height} style={{ display:"block" }}>
      {values.map((v, i) => {
        const barH = Math.max(Math.round((v / max) * height), 2);
        const x = i * (barW + 2);
        const y = height - barH;
        return <rect key={i} x={x} y={y} width={barW} height={barH} rx={1} fill={color} opacity={i === values.length - 1 ? 1 : 0.45} />;
      })}
    </svg>
  );
}

// Trend arrow for KPI cards
function TrendArrow({ trend }) {
  if (trend === 0) return <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>—</span>;
  const up = trend > 0;
  return (
    <span style={{ fontSize:10, fontWeight:700, color: up ? C.green : C.danger, display:"flex", alignItems:"center", gap:2 }}>
      {up ? "▲" : "▼"} {Math.abs(trend)}{typeof trend === "number" && Number.isInteger(trend) ? "" : "%"}
    </span>
  );
}

function Reportes({ onNavigate }) {
  const athletes = useStore(state => state.athletes);
  const historial = useStore(state => state.historial);
  const matchStats = useStore(state => state.matchStats);
  const finanzas = useStore(state => state.finanzas);
  const movs = finanzas.movimientos || [];
  const ingresos = movs.filter(m => m.tipo === "ingreso").reduce((s,m) => s+m.monto, 0);
  const egresos = movs.filter(m => m.tipo === "egreso").reduce((s,m) => s+m.monto, 0);
  const balance = ingresos - egresos;
  const pagados = (finanzas.pagos || []).filter(p => p.estado === "pagado").length;

  // Calcular asistencia promedio desde historial
  const asistenciaPct = historial.length > 0
    ? Math.round((historial.reduce((s, h) => s + h.presentes, 0) / historial.reduce((s, h) => s + h.total, 1)) * 100)
    : 0;

  // Ultimas 8 sesiones para sparkline
  const last8 = historial.slice(0, 8).reverse();
  const sparkAsistencia = last8.map(s => s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0);
  const sparkSesiones = last8.map((_, i) => i + 1);

  // Calcular tendencia: comparar ultima sesion vs promedio previo
  const calcTrend = (arr) => {
    if (arr.length < 2) return 0;
    const last = arr[arr.length - 1];
    const prevAvg = arr.slice(0, -1).reduce((a, b) => a + b, 0) / (arr.length - 1);
    if (prevAvg === 0) return 0;
    return Math.round(((last - prevAvg) / prevAvg) * 100);
  };

  const kpiCards = [
    {
      label: "Sesiones totales",
      value: historial.length,
      color: C.green,
      dest: "entrenamiento",
      sparkValues: sparkSesiones,
      trend: historial.length > 1 ? 1 : 0,
      trendDisplay: historial.length > 0 ? `+${Math.min(historial.length, 3)} esta semana` : "Sin sesiones",
    },
    {
      label: "Asistencia promedio",
      value: asistenciaPct + "%",
      color: C.neon,
      dest: "calendario",
      sparkValues: sparkAsistencia,
      trend: calcTrend(sparkAsistencia),
      trendDisplay: asistenciaPct >= 75 ? "Buen nivel" : "Mejorar",
    },
    {
      label: "Partidos jugados",
      value: matchStats.played,
      color: C.purple,
      dest: "partidos",
      sparkValues: [matchStats.won, matchStats.drawn, matchStats.lost].filter(v => v > 0),
      trend: matchStats.won > matchStats.lost ? 1 : matchStats.won < matchStats.lost ? -1 : 0,
      trendDisplay: `${matchStats.won}G ${matchStats.drawn}E ${matchStats.lost}P`,
    },
    {
      label: "Plantilla activa",
      value: athletes.length,
      color: C.amber,
      dest: "plantilla",
      sparkValues: athletes.length > 0 ? [athletes.filter(a=>a.status==="P").length, athletes.filter(a=>a.status==="A").length, athletes.filter(a=>a.status==="L").length].filter(v => v >= 0) : [],
      trend: 0,
      trendDisplay: `${athletes.filter(a=>a.status==="L").length} en recuperacion`,
    },
  ];

  return (
    <div style={{ padding:"20px 16px", maxWidth:900, margin:"0 auto" }}>

      {/* KPI Cards interactivas */}
      <div className="rep-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className="rep-kpi-card"
            onClick={() => onNavigate && onNavigate(kpi.dest)}
            style={{
              background:"rgba(255,255,255,0.03)",
              backdropFilter:"blur(16px)",
              WebkitBackdropFilter:"blur(16px)",
              border:`1px solid rgba(255,255,255,0.08)`,
              borderTop:`3px solid ${kpi.color}`,
              borderRadius:12,
              padding:"16px 14px",
              boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
              cursor:"pointer",
              position:"relative",
              overflow:"hidden",
            }}
          >
            {/* Ambient glow */}
            <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:kpi.color, opacity:0.04, filter:"blur(20px)", pointerEvents:"none" }} />
            <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.3)", marginBottom:10 }}>{kpi.label}</div>
            <div style={{ fontSize:28, fontWeight:700, color:kpi.color, lineHeight:1, marginBottom:8 }}>{kpi.value}</div>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:6 }}>
              <div>
                <TrendArrow trend={kpi.trend} />
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", marginTop:3 }}>{kpi.trendDisplay}</div>
              </div>
              {kpi.sparkValues.length > 1 && (
                <MiniSparkline values={kpi.sparkValues} color={kpi.color} />
              )}
            </div>
            {/* CTA */}
            <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:9, color:kpi.color, textTransform:"uppercase", letterSpacing:"1px", fontWeight:600 }}>
              Profundizar →
            </div>
          </div>
        ))}
      </div>

      {/* Fila secundaria: record de partidos + resumen financiero */}
      <div className="rep-bottom-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
        <div
          className="rep-secondary-card"
          onClick={() => onNavigate && onNavigate("partidos")}
          style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", border:`1px solid rgba(255,255,255,0.08)`, borderRadius:12, padding:18, boxShadow:"0 4px 20px rgba(0,0,0,0.35)", cursor:"pointer" }}
        >
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.3)", marginBottom:14 }}>Rendimiento en competencia</div>
          <div style={{ display:"flex", gap:20, alignItems:"flex-end" }}>
            {[
              { val:matchStats.won, lbl:"Ganados", color:C.green },
              { val:matchStats.drawn, lbl:"Empatados", color:"rgba(255,255,255,0.45)" },
              { val:matchStats.lost, lbl:"Perdidos", color:C.danger },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize:30, fontWeight:700, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px", marginTop:4 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14 }}>
            <div style={{ display:"flex", gap:2, height:4 }}>
              {matchStats.played > 0 && (
                <>
                  <div style={{ flex:matchStats.won || 0, background:C.green, borderRadius:"2px 0 0 2px", minWidth: matchStats.won > 0 ? 4 : 0 }} />
                  <div style={{ flex:matchStats.drawn || 0, background:"rgba(255,255,255,0.3)", minWidth: matchStats.drawn > 0 ? 4 : 0 }} />
                  <div style={{ flex:matchStats.lost || 0, background:C.danger, borderRadius:"0 2px 2px 0", minWidth: matchStats.lost > 0 ? 4 : 0 }} />
                </>
              )}
              {matchStats.played === 0 && <div style={{ flex:1, background:"rgba(255,255,255,0.08)", borderRadius:2 }} />}
            </div>
          </div>
        </div>

        <div
          className="rep-secondary-card"
          onClick={() => onNavigate && onNavigate("admin")}
          style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", border:`1px solid rgba(255,255,255,0.08)`, borderRadius:12, padding:18, boxShadow:"0 4px 20px rgba(0,0,0,0.35)", cursor:"pointer" }}
        >
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.3)", marginBottom:14 }}>Salud financiera</div>
          <div style={{ display:"flex", gap:20, alignItems:"flex-end" }}>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color: balance >= 0 ? C.green : C.danger, lineHeight:1 }}>
                ${Math.abs(balance).toLocaleString("es-CO")}
              </div>
              <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px", marginTop:4 }}>
                {balance >= 0 ? "Superavit" : "Deficit"}
              </div>
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color:C.purple, lineHeight:1 }}>
                {pagados}/{athletes.length}
              </div>
              <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px", marginTop:4 }}>Al dia</div>
            </div>
          </div>
          <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width: athletes.length > 0 ? `${Math.round((pagados / athletes.length) * 100)}%` : "0%", background:C.purple, transition:"width 0.4s ease" }} />
            </div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>
              {athletes.length > 0 ? Math.round((pagados / athletes.length) * 100) : 0}% al dia
            </div>
          </div>
        </div>
      </div>

      {/* Ultimas 5 sesiones — panel detallado */}
      <div style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", border:`1px solid rgba(255,255,255,0.08)`, borderRadius:12, padding:18, boxShadow:"0 4px 20px rgba(0,0,0,0.35)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.3)" }}>Ultimas sesiones</div>
          <button
            onClick={() => onNavigate && onNavigate("entrenamiento")}
            style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"1px", color:C.green, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, padding:"4px 8px" }}
          >
            Ver historial →
          </button>
        </div>
        {historial.length === 0 && (
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"center", padding:"24px 0" }}>Sin sesiones registradas aun</div>
        )}
        {historial.slice(0, 5).map((s, i) => {
          const asist = s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0;
          const rpeNum = Number(s.rpeAvg);
          const rpeColor = isNaN(rpeNum) ? "rgba(255,255,255,0.3)" : rpeNum <= 3 ? C.green : rpeNum <= 7 ? C.amber : C.danger;
          return (
            <div
              key={i}
              className="rep-session-row"
              onClick={() => onNavigate && onNavigate("entrenamiento")}
              style={{
                display:"flex",
                alignItems:"center",
                justifyContent:"space-between",
                padding:"10px 12px",
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                borderRadius:8,
                marginBottom:2,
                cursor:"pointer",
                flexWrap:"wrap",
                gap:8,
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                <div style={{ width:3, height:32, borderRadius:2, background: s.tipo === "Táctica" || s.tipo === "Tactica" ? C.purple : s.tipo === "Físico" || s.tipo === "Fisico" ? C.amber : s.tipo === "Partido" || s.tipo === "Partido interno" ? C.danger : C.green, flexShrink:0 }} />
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"white" }}>Sesion #{s.num} — {s.fecha}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:1 }}>{s.tipo || "Sin tipo"}{s.nota ? " · " + s.nota.slice(0, 40) + (s.nota.length > 40 ? "…" : "") : ""}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.green }}>{asist}%</div>
                  <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Asist.</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color: rpeColor }}>{s.rpeAvg ?? "—"}</div>
                  <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.5px" }}>RPE</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.6)" }}>{s.presentes}/{s.total}</div>
                  <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Pres.</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
