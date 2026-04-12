/**
 * @component CRMApp
 * @description Shell principal del sistema CRM de ALTTEZ.
 * Gestiona: sesion Supabase, estado de autenticacion, routing de modulos,
 * modo demo/produccion y el guard de seguridad por rol.
 *
 * @version 1.0
 */

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useStore } from "../../shared/store/useStore";
import FieldBackground from "../../shared/ui/FieldBackground";
import ErrorBoundary from "../../shared/ui/ErrorBoundary";
import ToastContainer, { showToast } from "../../shared/ui/Toast";
import { EMPTY_ATHLETES, EMPTY_HISTORIAL, EMPTY_MATCH_STATS, EMPTY_FINANZAS } from "../../shared/constants/initialStates";
import {
  loadDemoState, loadProductionState, logout as logoutService,
} from "../../shared/services/storageService";
import { clearSnapshots, setHealthClubId } from "../../shared/services/healthService";
import { PALETTE as C } from "../../shared/tokens/palette";
import { SESSION_KEY, createSession, validateSession, canAccessModule } from "../../shared/constants/roles";

import { isSupabaseReady } from "../../shared/lib/supabase";
import { createClub as sbCreateClub, setClubId, migrateLocalToSupabase, loadClubIdFromProfile } from "../../shared/services/supabaseService";
import { exportBackupJSON } from "../../shared/services/backupService";
import { signUp, signIn, signOut as authSignOut, getProfile, onAuthStateChange, linkProfileToClub } from "../../shared/services/authService";
import OfflineBanner from "../../shared/ui/OfflineBanner";
import UpdateToast from "../../shared/ui/UpdateToast";
import MiniTopbar from "./MiniTopbar";

// ── React.lazy: code-splitting por modulo ──
const LandingPage = lazy(() => import("../../shared/auth/LandingPage"));
const Home = lazy(() => import("../dashboard/Home"));
const Entrenamiento = lazy(() => import("../training/Entrenamiento"));
const GestionPlantilla = lazy(() => import("../roster/GestionPlantilla"));
const MiClub = lazy(() => import("../club/MiClub"));
const Administracion = lazy(() => import("../finance/Administracion"));
const Calendario = lazy(() => import("../scheduling/Calendario"));
const MatchCenter = lazy(() => import("../competition/MatchCenter"));
const DemoGate = lazy(() => import("./DemoGate"));
const KioskMode = lazy(() => import("../experience/KioskMode"));
const Reportes = lazy(() => import("../analytics/Reportes"));

const DEFAULT_CLUB = { nombre:"", disciplina:"", ciudad:"", entrenador:"", temporada:"", categorias:[], campos:[], descripcion:"", telefono:"", email:"" };

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

export function CRMApp() {
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
          setHealthClubId(profile.club_id);
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
          setHealthClubId(profile.club_id);
        }
      }
    })();
    return () => sub.unsubscribe();
  }, []);

  // Role: prioridad auth profile > localStorage session > null
  const userRole = authProfile?.role
    || ((session && validateSession(session)) ? session.role : null);

  // Navegacion con control de acceso por rol
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
    const demoAthletes = JSON.parse(localStorage.getItem("alttez_athletes"));
    const demoHistorial = JSON.parse(localStorage.getItem("alttez_historial"));
    const demoClubInfo = JSON.parse(localStorage.getItem("alttez_clubInfo"));
    const demoMatchStats = JSON.parse(localStorage.getItem("alttez_matchStats"));
    const demoFinanzas = JSON.parse(localStorage.getItem("alttez_finanzas"));
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
    const newClubInfo = JSON.parse(localStorage.getItem("alttez_clubInfo"));
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
    setHealthClubId(profile.club_id);

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
    if (!mode) {
      return <Navigate to="/crm" replace />;
    }
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
    <MiniTopbar
      title={title}
      accent={accent}
      accentBg={accentBg}
      mode={mode}
      clubName={clubInfo.nombre}
      clubCategory={(clubInfo.categorias || [])[0]}
      onHomeClick={() => setActiveModule("home")}
    />
  );

  // ── Routing con ErrorBoundary + Suspense por modulo ──
  return (
    <div style={{ minHeight:"100vh", background:C.bg, position:"relative" }}>
      <FieldBackground />
      <ToastContainer />
      <OfflineBanner />
      <UpdateToast />
      {/* Gate de conversion para modo demo: banner persistente + modal a los 15 min */}
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
              <_MiniTopbarLocal title="Entrenamiento" />
              <Entrenamiento clubId={authProfile?.club_id || ""} />
            </ErrorBoundary>
          )}

          {activeModule === "plantilla" && (
            <ErrorBoundary>
              <_MiniTopbarLocal title="Gestion de plantilla" />
              <GestionPlantilla clubId={authProfile?.club_id || ""} />
            </ErrorBoundary>
          )}

          {activeModule === "miclub" && (
            <ErrorBoundary>
              <_MiniTopbarLocal title="Mi club" />
              <MiClub />
            </ErrorBoundary>
          )}

          {activeModule === "admin" && (
            <ErrorBoundary>
              <_MiniTopbarLocal title="Administracion" accent={C.purple} accentBg="rgba(127,119,221,0.08)" />
              <Administracion />
            </ErrorBoundary>
          )}

          {activeModule === "calendario" && (
            <ErrorBoundary>
              <_MiniTopbarLocal title="Calendario" accent={C.neon} accentBg="rgba(200,255,0,0.05)" />
              <Calendario clubId={authProfile?.club_id || ""} />
            </ErrorBoundary>
          )}

          {activeModule === "partidos" && (
            <ErrorBoundary>
              <_MiniTopbarLocal title="Match Center" accent={C.neon} accentBg="rgba(200,255,0,0.05)" />
              <MatchCenter clubId={authProfile?.club_id || ""} />
            </ErrorBoundary>
          )}

          {activeModule === "reportes" && (
            <ErrorBoundary>
              <_MiniTopbarLocal title="Reportes" />
              <Reportes onNavigate={navigateTo} />
            </ErrorBoundary>
          )}

        </Suspense>
      </div>
    </div>
  );
}

export default CRMApp;
