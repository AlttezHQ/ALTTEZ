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
import { AnimatePresence, motion } from "framer-motion";
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
import { canAccessModule } from "../../shared/constants/roles";

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

// ── Loading fallback — ALTTEZ splash broadcast ──
const LoadingFallback = () => (
  <div style={{
    display:"flex", alignItems:"center", justifyContent:"center",
    height:"60vh", position:"relative",
  }}>
    <div style={{ textAlign:"center", position:"relative" }}>
      <div style={{
        position:"relative",
        width: 80, height: 80,
        margin:"0 auto 18px",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <img
          src="/branding/alttez-symbol-transparent.png"
          alt="ALTTEZ"
          style={{
            width: 64, height: 64, objectFit:"contain",
            opacity: 0.92,
            animation: "alttez-pulse 1.8s ease-in-out infinite",
          }}
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
        <span style={{
          position:"absolute", inset:0,
          border:`2px solid ${C.border}`,
          borderTopColor: C.blue,
          borderRightColor: C.blueHi,
          borderRadius:"50%",
          animation:"spin 1.1s cubic-bezier(0.4,0,0.2,1) infinite",
        }} />
      </div>
      <div style={{
        fontSize:11,
        color:C.textMuted,
        textTransform:"uppercase",
        letterSpacing:"0.14em",
        fontWeight:700,
      }}>
        Cargando ALTTEZ
      </div>
    </div>
    <style>{`
      @keyframes alttez-pulse {
        0%,100% { opacity: 1; transform: scale(1); }
        50%     { opacity: 0.75; transform: scale(0.94); }
      }
    `}</style>
  </div>
);

export function CRMApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = useStore(state => state.mode);
  const setMode = useStore(state => state.setMode);
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

  // Role: exclusivamente desde Supabase authProfile; demo siempre admin aislado
  const userRole = mode === "demo" ? "admin" : (authProfile?.role ?? null);

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
      <div style={{ minHeight:"100vh", background:"#FAFAF8", position:"relative" }}>
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

  const isHomeModule = activeModule === "home";

  // ── Routing con ErrorBoundary + Suspense por modulo ──
  return (
    <div style={{ minHeight:"100vh", background:isHomeModule ? "#FAFAF8" : C.bg, position:"relative" }}>
      {!isHomeModule && <FieldBackground />}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ width: "100%", minHeight: "100vh" }}
            >
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
                  <_MiniTopbarLocal title="Calendario" accent={C.bronce} accentBg="rgba(206, 137, 70,0.05)" />
                  <Calendario clubId={authProfile?.club_id || ""} />
                </ErrorBoundary>
              )}

              {activeModule === "partidos" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Match Center" accent={C.bronce} accentBg="rgba(206, 137, 70,0.05)" />
                  <MatchCenter clubId={authProfile?.club_id || ""} />
                </ErrorBoundary>
              )}

              {activeModule === "reportes" && (
                <ErrorBoundary>
                  <_MiniTopbarLocal title="Reportes" />
                  <Reportes onNavigate={navigateTo} />
                </ErrorBoundary>
              )}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
}

export default CRMApp;
