import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, FileSpreadsheet, AlertTriangle, Building2 } from "lucide-react";
import { PALETTE } from "../../shared/tokens/palette";
import { useTorneosStore } from "./store/useTorneosStore";
import { useAuth } from "../../shared/auth";
import { validateTorneosInlineLogin, validateTorneosInlineRegister } from "../../shared/auth/authValidation";
import { supabase, isSupabaseReady } from "../../shared/lib/supabase";

import TorneosSidebar    from "./components/shared/TorneosSidebar";
import TorneosHeader     from "./components/shared/TorneosHeader";
import ModuleEmptyState  from "./components/shared/ModuleEmptyState";
import InicioPage        from "./pages/InicioPage";
import TorneosListPage   from "./pages/TorneosListPage";
import EquiposPage       from "./pages/EquiposPage";
import FixturesPage      from "./pages/FixturesPage";
import AjustesPage       from "./pages/AjustesPage";
import CrearTorneoWizard from "./components/wizard/CrearTorneoWizard";
import CategoriasPage    from "./pages/CategoriasPage";
import ProgramacionPage  from "./pages/ProgramacionPage";
import EstadisticasPage  from "./pages/EstadisticasPage";
import AlttezLoader      from "./components/shared/AlttezLoader";

const BG     = PALETTE.bg;
const CARD   = PALETTE.surface;
const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const BORDER = PALETTE.border;
const EASE   = [0.22, 1, 0.36, 1];
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

const PAGE_ANIM = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: EASE },
};

// ── Inline auth screen (login + register tabs) ─────────────────────────────
// Uses shared auth context + centralized validation.

function TorneosAuthScreen({ initialTab = "login" }) {
  const auth = useAuth();
  const [tab, setTab]     = useState(initialTab);
  const [form, setForm]   = useState({ nombre: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]     = useState(null);

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleLogin = async () => {
    const { errors: errs, cleanData } = validateTorneosInlineLogin(form);
    setErrors(errs);
    if (!cleanData) return;
    try {
      setLoading(true);
      setMsg(null);
      const { error } = await auth.signIn(cleanData.email, cleanData.password);
      if (error) { setMsg({ type: "error", text: error }); return; }
      // Auth state update handled by AuthProvider listener
    } catch (error) {
      setMsg({ type: "error", text: error?.message || "No se pudo iniciar sesión" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const { errors: errs, cleanData } = validateTorneosInlineRegister(form);
    setErrors(errs);
    if (!cleanData) return;
    try {
      setLoading(true);
      setMsg(null);
      const { error } = await auth.signUp({
        email: cleanData.email,
        password: cleanData.password,
        fullName: cleanData.nombre,
        role: "admin",
      });
      if (error) { setMsg({ type: "error", text: error }); return; }
      // Auth state update handled by AuthProvider listener
    } catch (error) {
      setMsg({ type: "error", text: error?.message || "No se pudo crear la cuenta" });
    } finally {
      setLoading(false);
    }
  };

  const inp = (hasErr) => ({
    width: "100%", boxSizing: "border-box",
    border: `1px solid ${hasErr ? PALETTE.danger : BORDER}`,
    borderRadius: 10, padding: "11px 13px",
    fontSize: 13, color: TEXT, fontFamily: FONT,
    background: BG, outline: "none",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(180deg, #F6F1EA 0%, #FDFDFB 100%)`,
      padding: "40px 24px",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        style={{
          width: "100%", maxWidth: 420,
          background: CARD, borderRadius: 24,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 24px 64px rgba(23,26,28,0.10)",
          padding: "32px 28px", fontFamily: FONT,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Trophy size={20} color={CU} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.04em", color: TEXT }}>ALTTEZ Torneos</div>
            <div style={{ fontSize: 10, color: MUTED }}>Gestor de torneos deportivos</div>
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", background: BG, borderRadius: 10, padding: 3, marginBottom: 20, border: `1px solid ${BORDER}` }}>
          {[["login", "Iniciar sesión"], ["register", "Registrarse"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setErrors({}); setMsg(null); }}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                background: tab === key ? CARD : "transparent",
                color: tab === key ? CU : MUTED,
                fontWeight: tab === key ? 700 : 500,
                fontSize: 12, fontFamily: FONT, cursor: "pointer",
                boxShadow: tab === key ? "0 2px 8px rgba(23,26,28,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >{label}</button>
          ))}
        </div>

        {msg && (
          <div style={{
            marginBottom: 16, padding: "10px 14px", borderRadius: 8, fontSize: 12,
            background: msg.type === "error" ? "rgba(220,38,38,0.08)" : CU_DIM,
            color: msg.type === "error" ? PALETTE.danger : CU,
            border: `1px solid ${msg.type === "error" ? "rgba(220,38,38,0.2)" : CU_BOR}`,
          }}>{msg.text}</div>
        )}

        {tab === "login" ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>EMAIL</label>
              <input style={inp(errors.email)} type="email" value={form.email}
                onChange={e => update("email", e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="tu@email.com" />
              {errors.email && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 3 }}>{errors.email}</div>}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>CONTRASEÑA</label>
              <input style={inp(errors.password)} type="password" value={form.password}
                onChange={e => update("password", e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Tu contraseña" />
              {errors.password && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 3 }}>{errors.password}</div>}
            </div>
            <button onClick={handleLogin} disabled={loading} style={{
              width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
              background: loading ? "#E8DCC4" : `linear-gradient(135deg, ${CU}, #A66F38)`,
              color: loading ? MUTED : "#FFF", fontSize: 13, fontWeight: 700,
              fontFamily: FONT, cursor: loading ? "wait" : "pointer",
            }}>{loading ? "Verificando..." : "Ingresar"}</button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>NOMBRE / ORGANIZACIÓN</label>
              <input style={inp(errors.nombre)} value={form.nombre}
                onChange={e => update("nombre", e.target.value)}
                placeholder="Ej: Liga Norte" />
              {errors.nombre && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 3 }}>{errors.nombre}</div>}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>EMAIL</label>
              <input style={inp(errors.email)} type="email" value={form.email}
                onChange={e => update("email", e.target.value)}
                placeholder="tu@email.com" />
              {errors.email && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 3 }}>{errors.email}</div>}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>CONTRASEÑA</label>
              <input style={inp(errors.password)} type="password" value={form.password}
                onChange={e => update("password", e.target.value)}
                placeholder="Mínimo 6 caracteres" />
              {errors.password && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 3 }}>{errors.password}</div>}
            </div>
            <button onClick={handleRegister} disabled={loading} style={{
              width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
              background: loading ? "#E8DCC4" : `linear-gradient(135deg, ${CU}, #A66F38)`,
              color: loading ? MUTED : "#FFF", fontSize: 13, fontWeight: 700,
              fontFamily: FONT, cursor: loading ? "wait" : "pointer",
            }}>{loading ? "Creando cuenta..." : "Crear cuenta"}</button>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ── Import modal ──────────────────────────────────────────────────────────────

function ImportModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(23,26,28,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, fontFamily: FONT,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{
          background: CARD, borderRadius: 16, width: 480,
          boxShadow: "0 24px 64px rgba(23,26,28,0.18)",
          border: `1px solid ${BORDER}`, padding: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Importar datos</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{
            border: `2px dashed ${CU_BOR}`, borderRadius: 10, padding: "20px 16px",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 8, background: CU_DIM,
          }}>
            <FileSpreadsheet size={24} color={CU} />
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Desde Excel / CSV</span>
            <span style={{ fontSize: 11, color: MUTED }}>Arrastra un archivo o haz clic para seleccionar</span>
            <input type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} />
          </label>
          <div style={{
            border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16,
            display: "flex", alignItems: "center", gap: 12, opacity: 0.5,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trophy size={16} color={MUTED} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Desde ALTTEZ Clubes</div>
              <div style={{ fontSize: 11, color: MUTED }}>Próximamente disponible</div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: MUTED, background: BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "2px 7px" }}>
              PRONTO
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", fontSize: 13, color: MUTED, fontFamily: FONT, cursor: "pointer" }}>
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: CU, color: "#FFF", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
          >
            Importar
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────

const TORNEOS_INIT_TIMEOUT_MS = 12000;

function TorneosStatusScreen({ icon: Icon, title, subtitle, ctaLabel, onCta }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 720, background: CARD, borderRadius: 24, border: `1px solid ${BORDER}`, boxShadow: "0 24px 64px rgba(23,26,28,0.10)", padding: "24px 20px" }}>
        <ModuleEmptyState
          icon={Icon}
          title={title}
          subtitle={subtitle}
          ctaLabel={ctaLabel}
          onCta={onCta}
        />
      </div>
    </div>
  );
}

function withInitTimeout(promise, label) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout cargando ${label} en /torneos`));
    }, TORNEOS_INIT_TIMEOUT_MS);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

export default function TorneosApp() {
  const location       = useLocation();
  const navigate       = useNavigate();
  const auth           = useAuth();
  const torneoActivoId = useTorneosStore(s => s.torneoActivoId);
  const torneos        = useTorneosStore(s => s.torneos);
  const storeLoading   = useTorneosStore(s => s.loading);
  const storeError     = useTorneosStore(s => s.error);
  const torneoActivo   = torneoActivoId ? torneos.find(t => t.id === torneoActivoId) ?? null : null;

  const loadTorneos    = useTorneosStore(s => s.loadTorneosFromSupabase);

  const [activeModule, setActiveModule] = useState(() => {
    return localStorage.getItem("torneos_active_module") || "inicio";
  });
  const [showImport,   setShowImport]   = useState(false);
  const [editingTorneo, setEditingTorneo] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [initError, setInitError] = useState(null);
  const [initStatus, setInitStatus] = useState("idle");
  const initialAuthTab = new URLSearchParams(location.search).get("auth") === "register" ? "register" : "login";

  // Persist activeModule
  useEffect(() => {
    localStorage.setItem("torneos_active_module", activeModule);
  }, [activeModule]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        if (!isSupabaseReady || !supabase) {
          throw new Error("Supabase no está configurado para cargar ALTTEZ Torneos");
        }

        setInitialLoading(true);
        setRequiresAuth(false);
        setInitError(null);
        setInitStatus("idle");

        console.log("[TORNEOS] inicio carga");

        const { data: sessionData, error: sessionError } = await withInitTimeout(
          supabase.auth.getSession(),
          "sesión"
        );
        console.log("[TORNEOS] sesión obtenida", sessionData?.session ?? null);

        if (sessionError) throw sessionError;

        if (!sessionData?.session) {
          if (!cancelled) {
            setSessionUser(null);
            setRequiresAuth(true);
            navigate("/torneos?auth=login", { replace: true });
          }
          return;
        }

        const user = sessionData.session.user ?? null;
        console.log("[TORNEOS] usuario", user ?? null);

        if (!user) {
          if (!cancelled) {
            setSessionUser(null);
            setRequiresAuth(true);
            navigate("/torneos?auth=login", { replace: true });
          }
          return;
        }

        if (!cancelled) {
          setSessionUser(user);
          if (location.search) {
            navigate("/torneos", { replace: true });
          }
        }

        const { data: profile, error: profileError } = await withInitTimeout(
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          "perfil"
        );
        console.log("[TORNEOS] perfil", profile ?? null);

        if (profileError) throw profileError;

        if (!profile) {
          if (!cancelled) {
            setInitStatus("missing-profile");
            setInitError("No encontramos un perfil asociado a tu cuenta de torneos.");
          }
          return;
        }

        const organization = {
          id: profile.club_id ?? user.id,
          nombre: profile.full_name ?? user.email ?? "Organización ALTTEZ",
        };
        console.log("[TORNEOS] organización", organization);

        if (!organization?.id) {
          if (!cancelled) {
            setInitStatus("missing-organization");
          }
          return;
        }

        const result = await withInitTimeout(loadTorneos(), "torneos");

        if (!cancelled) {
          console.log("[TORNEOS] torneos", result?.torneos ?? []);
          console.log("[TORNEOS] categorías", result?.categorias ?? []);
          setInitStatus(result?.torneos?.length ? "ready" : "empty");
        }
      } catch (error) {
        console.error("[TORNEOS] error", error);
        if (!cancelled) {
          setInitStatus("error");
          setInitError(error?.message || "No se pudo cargar el módulo de torneos");
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
          console.log("[TORNEOS] loading false");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [auth.user?.id, loadTorneos, location.search, navigate]);

  const goTo      = (mod) => setActiveModule(mod);
  const goTorneos = ()    => setActiveModule("torneos");

  const handleCreate  = (torneo = null) => {
    setEditingTorneo(torneo);
    setActiveModule("crear");
  };
  const handleImport  = () => setShowImport(true);

  const handleWizardFinish = () => {
    setEditingTorneo(null);
    setActiveModule("inicio");
  };
  const handleWizardBack   = () => {
    setEditingTorneo(null);
    setActiveModule("inicio");
  };

  const handleAbrirTorneo = () => setActiveModule("inicio");

  const handleEditTorneo = (t) => {
    const store = useTorneosStore.getState();
    const categorias = store.categorias.filter(c => c.torneoId === t.id);
    const equipos = store.equipos.filter(e => e.torneoId === t.id);
    setEditingTorneo({ ...t, categorias, equipos });
    setActiveModule("crear");
  };

  // Logout: limpiar sesión via AuthProvider. No navegar a "/".
  // El auth gate de abajo mostrará TorneosAuthScreen automáticamente.
  const handleLogout = async () => {
    setSessionUser(null);
    setRequiresAuth(true);
    await auth.signOut();
    // Auth gate below will render TorneosAuthScreen when user becomes null
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("¿Eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.")) return;
    const { error } = await auth.deleteAccount();
    if (error) { alert(error); return; }
    setSessionUser(null);
    setRequiresAuth(true);
    // Auth gate below will render TorneosAuthScreen when user becomes null
  };

  const sidebarActive = activeModule === "crear" ? null : activeModule;

  // Loading state while checking Supabase session
  if (initialLoading || storeLoading) {
    return <AlttezLoader fullScreen text="Cargando torneos..." />;
  }

  // Auth gate — show login/register if no active session
  if (requiresAuth || !sessionUser) {
    return <TorneosAuthScreen key={initialAuthTab} initialTab={initialAuthTab} />;
  }

  if (initStatus === "missing-profile") {
    return (
      <TorneosStatusScreen
        icon={AlertTriangle}
        title="No encontramos tu perfil"
        subtitle={initError || "Tu cuenta inició sesión, pero todavía no tiene un perfil válido para ALTTEZ Torneos."}
      />
    );
  }

  if (initStatus === "missing-organization") {
    return (
      <TorneosStatusScreen
        icon={Building2}
        title="No hay organización disponible"
        subtitle="La sesión está activa, pero no encontramos una organización válida para cargar el módulo de torneos."
      />
    );
  }

  if (initStatus === "error" || storeError) {
    return (
      <TorneosStatusScreen
        icon={AlertTriangle}
        title="No se pudo cargar el módulo"
        subtitle={initError || storeError || "Ocurrió un problema cargando torneos desde Supabase."}
      />
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: FONT }}>
      <TorneosSidebar
        active={sidebarActive}
        onNav={goTo}
        torneoActivo={torneoActivo}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userName={sessionUser?.email ?? auth.user?.email ?? ""}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TorneosHeader
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          userName={sessionUser?.email ?? auth.user?.email ?? ""}
        />

        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px 48px" }}>
          <AnimatePresence mode="wait">

            {activeModule === "inicio" && (
              <motion.div key="inicio" {...PAGE_ANIM}>
                <InicioPage
                  onCreate={handleCreate}
                  onImport={handleImport}
                  onInfoClick={goTo}
                  onNavigate={goTo}
                />
              </motion.div>
            )}

            {activeModule === "crear" && (
              <motion.div key="crear" {...PAGE_ANIM}>
                <CrearTorneoWizard
                  initialData={editingTorneo}
                  onFinish={handleWizardFinish}
                  onBack={handleWizardBack}
                />
              </motion.div>
            )}

            {activeModule === "torneos" && (
              <motion.div key="torneos" {...PAGE_ANIM}>
                <TorneosListPage
                  onCreate={handleCreate}
                  onAbrir={handleAbrirTorneo}
                  onEdit={handleEditTorneo}
                />
              </motion.div>
            )}

            {activeModule === "equipos" && (
              <motion.div key="equipos" {...PAGE_ANIM}>
                <EquiposPage key={torneoActivoId} onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "categorias" && (
              <motion.div key="categorias" {...PAGE_ANIM}>
                <CategoriasPage onGoTorneos={goTorneos} onNavigate={goTo} />
              </motion.div>
            )}

            {activeModule === "fixtures" && (
              <motion.div key="fixtures" {...PAGE_ANIM}>
                <FixturesPage key={torneoActivoId} onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "ajustes" && (
              <motion.div key="ajustes" {...PAGE_ANIM}>
                <AjustesPage key={torneoActivoId} onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "programacion" && (
              <motion.div key="programacion" {...PAGE_ANIM}>
                <ProgramacionPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "publica" && (
              <motion.div key="publica" {...PAGE_ANIM}>
                <div style={{ fontFamily: FONT, padding: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 8 }}>Vista Pública</h2>
                  <p style={{ color: MUTED, fontSize: 13 }}>La vista pública del torneo estará disponible cuando publiques el torneo desde Configuración.</p>
                </div>
              </motion.div>
            )}

            {activeModule === "estadisticas" && (
              <motion.div key="estadisticas" {...PAGE_ANIM}>
                <EstadisticasPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      </AnimatePresence>
    </div>
  );
}
