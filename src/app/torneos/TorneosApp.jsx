import { useCallback, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, FileSpreadsheet, Tag, Mail } from "lucide-react";
import { PALETTE } from "../../shared/tokens/palette";
import { useTorneosStore } from "./store/useTorneosStore";
import { isSupabaseReady, supabase } from "../../shared/lib/supabase";
import {
  signIn,
  signUp,
  signInWithGoogle,
  signOut as authSignOut,
  resetPasswordForEmail,
  updatePassword,
  deleteAccount,
  getProfile,
  onAuthStateChange,
} from "../../shared/services/authService";
import { showToast } from "../../shared/ui/Toast";
import { validateForgotPasswordForm, validateLoginForm, validateRegisterForm, validateResetPasswordForm } from "./auth/authValidators";
import { evaluatePasswordStrength, getPasswordRequirements } from "./auth/passwordStrength";
import { listMyTorneos, saveTorneo } from "./services/torneosService";

import TorneosSidebar    from "./components/shared/TorneosSidebar";
import TorneosHeader     from "./components/shared/TorneosHeader";
import ModuleEmptyState  from "./components/shared/ModuleEmptyState";
import InicioPage        from "./pages/InicioPage";
import TorneosListPage   from "./pages/TorneosListPage";
import EquiposPage       from "./pages/EquiposPage";
import FixturesPage      from "./pages/FixturesPage";
import EstadisticasPage  from "./pages/EstadisticasPage";
import CalendarioPage    from "./pages/CalendarioPage";
import AjustesPage       from "./pages/AjustesPage";
import CrearTorneoWizard from "./components/wizard/CrearTorneoWizard";

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

function PasswordStrengthIndicator({ password, passwordStrength, compact = false }) {
  if (!password) return null;

  const isHigh = passwordStrength.level === "high";
  const isMedium = passwordStrength.level === "medium";
  const tone = isHigh ? CU : isMedium ? MUTED : PALETTE.danger;
  const progressWidth = `${(passwordStrength.passed / passwordStrength.total) * 100}%`;

  return (
    <div style={{
      marginTop: 8, padding: compact ? 10 : 12, borderRadius: 12,
      background: isMedium ? CU_DIM : BG,
      border: `1px solid ${BORDER}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: tone }}>
          {passwordStrength.label}
        </span>
        <span style={{ fontSize: 10, color: MUTED }}>
          {passwordStrength.passed}/{passwordStrength.total}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: CARD, border: `1px solid ${BORDER}`, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: progressWidth, background: tone, transition: "width 0.18s ease" }} />
      </div>
        <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "1fr 1fr", gap: "4px 10px" }}>
        {getPasswordRequirements().map(req => {
          const ok = passwordStrength.checks[req.key];
          return (
            <div key={req.key} style={{ fontSize: 10, color: ok ? CU : MUTED, lineHeight: 1.25 }}>
              {ok ? "✓" : "•"} {req.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TorneosAuthScreen({ onAuthSuccess, recoveryMode, onRecoveryComplete, initialTab = "login" }) {
  const [tab, setTab] = useState(recoveryMode ? "reset" : initialTab);
  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmPassword: "", newPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleLogin = async () => {
    const errs = validateLoginForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const { user, error } = await signIn(form.email, form.password);
    setLoading(false);
    if (error) { setMsg({ type: "error", text: error }); return; }
    showToast("Sesión iniciada correctamente.", "success");
    onAuthSuccess(user);
  };

  const handleRegister = async () => {
    const errs = validateRegisterForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const { user, session, requiresEmailConfirmation, error } = await signUp({ email: form.email, password: form.password, fullName: form.nombre, role: "admin" });
    setLoading(false);
    if (error) { setMsg({ type: "error", text: error }); return; }
    if (requiresEmailConfirmation || !session) {
      setMsg({ type: "success", text: "Cuenta creada correctamente. Revisa tu email para confirmar la cuenta antes de iniciar sesión." });
      setTab("login");
      setForm(f => ({ ...f, password: "", confirmPassword: "" }));
      return;
    }
    setMsg({ type: "success", text: "Cuenta creada correctamente. Sesión iniciada." });
    showToast("Cuenta creada correctamente. Sesión iniciada.", "success");
    onAuthSuccess(user);
  };

  const handleForgotPassword = async () => {
    const errs = validateForgotPasswordForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    await resetPasswordForEmail(form.email, `${window.location.origin}/torneos`);
    setLoading(false);
    setMsg({ type: "success", text: "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña." });
  };

  const handleResetPassword = async () => {
    const errs = validateResetPasswordForm(form, {
      email: form.email,
      nombre: form.nombre,
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const { error } = await updatePassword(form.newPassword);
    setLoading(false);
    if (error) { setMsg({ type: "error", text: error }); return; }
    await authSignOut();
    setMsg({ type: "success", text: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });
    setForm(f => ({ ...f, password: "", newPassword: "", confirmPassword: "" }));
    setTab("login");
    onRecoveryComplete?.();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle(`${window.location.origin}/torneos`);
    setLoading(false);
    if (error) setMsg({ type: "error", text: error });
  };

  const passwordStrength = evaluatePasswordStrength(tab === "reset" ? form.newPassword : form.password, {
    email: form.email,
    nombre: form.nombre,
  });

  const inp = (hasErr) => ({
    width: "100%", boxSizing: "border-box",
    border: `1px solid ${hasErr ? PALETTE.danger : BORDER}`,
    borderRadius: 10, padding: "11px 13px",
    fontSize: 13, color: TEXT, fontFamily: FONT,
    background: BG, outline: "none",
  });

  const field = (label, key, props = {}) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      <input
        style={inp(errors[key])}
        value={form[key]}
        onChange={e => update(key, e.target.value)}
        {...props}
      />
      {errors[key] && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 4 }}>{errors[key]}</div>}
    </div>
  );

  const primaryButton = (label, onClick) => (
    <button onClick={onClick} disabled={loading} style={{
      width: "100%", minHeight: 52, borderRadius: 14, border: "none",
      background: loading ? "#E8DCC4" : `linear-gradient(135deg, ${CU}, #A66F38)`,
      color: loading ? MUTED : "#FFF", fontSize: 12, fontWeight: 800,
      letterSpacing: "0.14em", textTransform: "uppercase",
      fontFamily: FONT, cursor: loading ? "wait" : "pointer",
    }}>{label}</button>
  );

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
          width: "100%", maxWidth: tab === "register" ? 760 : 460,
          background: CARD, borderRadius: 28,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 24px 64px rgba(23,26,28,0.10)",
          padding: "36px 34px", fontFamily: FONT,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 46, height: 46, borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,241,234,0.96))", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 28px rgba(23,26,28,0.08)" }}>
            <Trophy size={22} color={CU} />
          </div>
          <div>
            <div style={{ fontSize: tab === "register" ? 28 : 24, fontWeight: 900, letterSpacing: "-0.05em", color: TEXT }}>
              {tab === "register" ? "Registrar en Torneos" : tab === "forgot" ? "Recuperar contraseña" : tab === "reset" ? "Nueva contraseña" : "Iniciar sesión"}
            </div>
            <div style={{ fontSize: 11, color: MUTED }}>
              {tab === "register" ? "Datos del organizador y acceso" : tab === "forgot" ? "Acceso seguro para organizadores" : tab === "reset" ? "Define una contraseña segura" : "Credenciales del organizador"}
            </div>
          </div>
        </div>

        {tab !== "forgot" && tab !== "reset" && <div style={{ display: "flex", background: BG, borderRadius: 12, padding: 3, marginBottom: 20, border: `1px solid ${BORDER}` }}>
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
        </div>}

        {msg && (
          <div style={{
            marginBottom: 16, padding: "10px 14px", borderRadius: 8, fontSize: 12,
            background: msg.type === "error" ? "rgba(220,38,38,0.08)" : CU_DIM,
            color: msg.type === "error" ? PALETTE.danger : CU,
            border: `1px solid ${msg.type === "error" ? "rgba(220,38,38,0.2)" : CU_BOR}`,
          }}>{msg.text}</div>
        )}

        {tab === "login" && (
          <>
            {field("Email", "email", { type: "email", placeholder: "tu@email.com", autoComplete: "email", onKeyDown: e => e.key === "Enter" && handleLogin() })}
            {field("Contraseña", "password", { type: "password", placeholder: "Tu contraseña", autoComplete: "current-password", onKeyDown: e => e.key === "Enter" && handleLogin() })}
            {primaryButton(loading ? "Verificando..." : "Ingresar a Torneos", handleLogin)}
            <button onClick={handleGoogleLogin} disabled={loading} style={{ width: "100%", minHeight: 46, marginTop: 10, borderRadius: 14, border: `1px solid ${BORDER}`, background: CARD, color: TEXT, fontSize: 12, fontWeight: 800, fontFamily: FONT, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Mail size={14} /> Continuar con Google
            </button>
            <div onClick={() => { setTab("forgot"); setErrors({}); setMsg(null); }} style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: MUTED, cursor: "pointer" }}>¿Olvidaste tu contraseña?</div>
          </>
        )}

        {tab === "register" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {field("Nombre / organización", "nombre", { placeholder: "Ej: Liga Norte", maxLength: 60 })}
              {field("Email", "email", { type: "email", placeholder: "tu@email.com", autoComplete: "email", maxLength: 80 })}
            </div>
            <div style={{ marginTop: 6, paddingTop: 18, borderTop: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: TEXT, marginBottom: 12 }}>Cuenta de acceso</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  {field("Contraseña", "password", { type: "password", placeholder: "Mínimo 10 caracteres", autoComplete: "new-password", maxLength: 72 })}
                  <PasswordStrengthIndicator password={form.password} passwordStrength={passwordStrength} />
                </div>
                {field("Confirmar contraseña", "confirmPassword", { type: "password", placeholder: "Repite tu contraseña", autoComplete: "new-password", maxLength: 72 })}
              </div>
            </div>
            <div style={{ marginTop: 8, padding: "18px", borderRadius: 18, background: "#FFFCF7", border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: TEXT, marginBottom: 10 }}>Autorización de datos</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                Al crear tu cuenta aceptas la Política de Tratamiento de Datos Personales para gestionar torneos y comunicaciones operativas.
              </div>
            </div>
            <div style={{ marginTop: 20 }}>{primaryButton(loading ? "Creando cuenta..." : "Crear cuenta en Torneos", handleRegister)}</div>
            <button onClick={handleGoogleLogin} disabled={loading} style={{ width: "100%", minHeight: 46, marginTop: 10, borderRadius: 14, border: `1px solid ${BORDER}`, background: CARD, color: TEXT, fontSize: 12, fontWeight: 800, fontFamily: FONT, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Mail size={14} /> Continuar con Google
            </button>
          </>
        )}

        {tab === "forgot" && (
          <>
            {field("Email", "email", { type: "email", placeholder: "tu@email.com", autoComplete: "email" })}
            {primaryButton(loading ? "Enviando..." : "Enviar instrucciones", handleForgotPassword)}
            <div onClick={() => { setTab("login"); setErrors({}); setMsg(null); }} style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: MUTED, cursor: "pointer" }}>Volver a iniciar sesión</div>
          </>
        )}

        {tab === "reset" && (
          <>
            <div>
              {field("Nueva contraseña", "newPassword", { type: "password", placeholder: "Mínimo 10 caracteres", autoComplete: "new-password", maxLength: 72 })}
              <PasswordStrengthIndicator password={form.newPassword} passwordStrength={passwordStrength} />
            </div>
            {field("Confirmar contraseña", "confirmPassword", { type: "password", placeholder: "Repite tu contraseña", autoComplete: "new-password", maxLength: 72 })}
            {primaryButton(loading ? "Actualizando..." : "Actualizar contraseña", handleResetPassword)}
          </>
        )}
      </motion.div>
    </div>
  );
}

function getPreferredDisplayName({ torneoActivo, torneos, profile, user }) {
  const firstTorneo = torneos.find(t => t?.nombre?.trim());
  return (
    torneoActivo?.nombre?.trim() ||
    firstTorneo?.nombre?.trim() ||
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.user_metadata?.name?.trim() ||
    user?.email ||
    "Administrador"
  );
}

function FirstLeagueOnboarding({ onCreate, onLogout }) {
  const [form, setForm] = useState({ nombre: "", ciudad: "", deporte: "Fútbol" });
  const [errors, setErrors] = useState({});
  const sports = ["Fútbol", "Básquet", "Vóleibol", "Tenis", "Pádel", "Rugby", "Otro"];

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  const submit = () => {
    const nextErrors = {};
    if (!form.nombre.trim()) nextErrors.nombre = "Ingresa el nombre de la liga";
    if (!form.ciudad.trim()) nextErrors.ciudad = "Ingresa la ciudad";
    if (!form.deporte.trim()) nextErrors.deporte = "Selecciona un deporte";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onCreate({
      nombre: form.nombre.trim(),
      ciudad: form.ciudad.trim(),
      deporte: form.deporte,
      formato: "todos_contra_todos",
    });
  };

  const input = (hasError) => ({
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${hasError ? PALETTE.danger : BORDER}`,
    borderRadius: 10,
    padding: "11px 13px",
    fontSize: 13,
    color: TEXT,
    fontFamily: FONT,
    background: BG,
    outline: "none",
  });

  const field = (label, key, control) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10, fontWeight: 800, color: MUTED, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      {control}
      {errors[key] && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 4 }}>{errors[key]}</div>}
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(180deg, #F6F1EA 0%, #FDFDFB 100%)`,
      padding: "40px 24px",
      fontFamily: FONT,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        style={{
          width: "100%",
          maxWidth: 560,
          background: CARD,
          borderRadius: 28,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 24px 64px rgba(23,26,28,0.10)",
          padding: "36px 34px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 46, height: 46, borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,241,234,0.96))", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 28px rgba(23,26,28,0.08)" }}>
            <Trophy size={22} color={CU} />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.05em", color: TEXT }}>Crear tu primera liga</div>
            <div style={{ fontSize: 12, color: MUTED }}>Configura el espacio inicial para gestionar tus torneos.</div>
          </div>
        </div>

        {field("Nombre de la liga", "nombre", (
          <input value={form.nombre} onChange={e => update("nombre", e.target.value)} placeholder="Ej: Liga Norte" maxLength={80} style={input(errors.nombre)} />
        ))}

        {field("Ciudad", "ciudad", (
          <input value={form.ciudad} onChange={e => update("ciudad", e.target.value)} placeholder="Ej: Bogotá" maxLength={60} style={input(errors.ciudad)} />
        ))}

        {field("Deporte principal", "deporte", (
          <select value={form.deporte} onChange={e => update("deporte", e.target.value)} style={{ ...input(errors.deporte), appearance: "none" }}>
            {sports.map(sport => <option key={sport} value={sport}>{sport}</option>)}
          </select>
        ))}

        <button onClick={submit} style={{
          width: "100%", minHeight: 52, marginTop: 8, borderRadius: 14, border: "none",
          background: `linear-gradient(135deg, ${CU}, #A66F38)`, color: "#FFF",
          fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
          fontFamily: FONT, cursor: "pointer",
        }}>
          Comenzar
        </button>

        <button onClick={onLogout} style={{ marginTop: 14, width: "100%", background: "none", border: "none", color: MUTED, fontSize: 12, fontFamily: FONT, cursor: "pointer" }}>
          Cerrar sesión
        </button>
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

export default function TorneosApp() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const torneoActivoId = useTorneosStore(s => s.torneoActivoId);
  const torneos        = useTorneosStore(s => s.torneos);
  const crearTorneo    = useTorneosStore(s => s.crearTorneo);
  const setTorneosFromRemote = useTorneosStore(s => s.setTorneosFromRemote);
  const torneoActivo   = torneoActivoId ? torneos.find(t => t.id === torneoActivoId) ?? null : null;

  const [activeModule, setActiveModule] = useState("inicio");
  const [showImport,   setShowImport]   = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const initialAuthTab = new URLSearchParams(location.search).get("auth") === "register" ? "register" : "login";

  // undefined = checking, null = not authed, object = authed
  const [authUser, setAuthUser] = useState(isSupabaseReady ? undefined : null);
  const [authProfile, setAuthProfile] = useState(null);
  const [torneosRemoteChecked, setTorneosRemoteChecked] = useState(!isSupabaseReady);
  const oauthFeedbackShown = useRef(false);

  const hydrateRemoteTorneos = useCallback(async () => {
    if (!isSupabaseReady) {
      setTorneosRemoteChecked(true);
      return;
    }
    const { ok, torneos: remoteTorneos } = await listMyTorneos();
    if (ok && remoteTorneos.length > 0) setTorneosFromRemote(remoteTorneos);
    setTorneosRemoteChecked(true);
  }, [setTorneosFromRemote]);

  useEffect(() => {
    if (!isSupabaseReady) return;
    const hasOAuthReturn = location.search.includes("code=") || location.hash.includes("access_token");

    // Check existing session
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setAuthUser(user ?? null);
      if (user) {
        setTorneosRemoteChecked(false);
        const profile = await getProfile();
        setAuthProfile(profile);
        await hydrateRemoteTorneos();
        const provider = user.app_metadata?.provider;
        if (hasOAuthReturn && provider === "google" && !oauthFeedbackShown.current) {
          oauthFeedbackShown.current = true;
          showToast("Sesión iniciada con Google.", "success");
        }
      }
    });

    // Subscribe to changes
    const sub = onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        setAuthUser(null);
        return;
      }
      if (event === "SIGNED_IN") {
        const user = session?.user ?? null;
        setAuthUser(user);
        const profile = user ? await getProfile() : null;
        setAuthProfile(profile);
        if (user) {
          setTorneosRemoteChecked(false);
          await hydrateRemoteTorneos();
        }
        const provider = user?.app_metadata?.provider;
        if (provider === "google" && !oauthFeedbackShown.current) {
          oauthFeedbackShown.current = true;
          showToast("Sesión iniciada con Google.", "success");
        }
      }
      if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setAuthProfile(null);
        setTorneosRemoteChecked(true);
      }
    });
    return () => sub.unsubscribe();
  }, [hydrateRemoteTorneos, location.hash, location.search]);

  const goTo      = (mod) => setActiveModule(mod);
  const goTorneos = ()    => setActiveModule("torneos");

  const handleCreate  = () => setActiveModule("crear");
  const handleImport  = () => setShowImport(true);

  const handleWizardFinish = () => setActiveModule("torneos");
  const handleWizardBack   = () => setActiveModule("inicio");

  const handleAbrirTorneo = () => setActiveModule("fixtures");

  const handleAuthSuccess = async (user) => {
    setAuthUser(user);
    const profile = await getProfile();
    setAuthProfile(profile);
    setTorneosRemoteChecked(false);
    await hydrateRemoteTorneos();
  };

  const handleCreateFirstLeague = async (data) => {
    const torneo = crearTorneo(data);
    await saveTorneo(torneo);
    setActiveModule("inicio");
    showToast("Liga creada correctamente. Ya puedes gestionar tus torneos.", "success");
  };

  const handleLogout = async () => {
    if (isSupabaseReady) await authSignOut();
    setAuthProfile(null);
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("¿Eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.")) return;
    const { error } = await deleteAccount();
    if (error) { alert(error); return; }
    navigate("/");
  };

  const sidebarActive = activeModule === "crear" ? null : activeModule;

  // Loading state while checking Supabase session
  if (authUser === undefined || (authUser && !torneosRemoteChecked)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
        <div style={{ textAlign: "center", fontFamily: FONT }}>
          <Trophy size={28} color={CU} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase" }}>Cargando...</div>
        </div>
      </div>
    );
  }

  // Auth gate — show login/register if no active session
  if (authUser === null || passwordRecovery) {
    return (
      <TorneosAuthScreen
        key={passwordRecovery ? "recovery" : "auth"}
        onAuthSuccess={handleAuthSuccess}
        recoveryMode={passwordRecovery}
        initialTab={initialAuthTab}
        onRecoveryComplete={() => {
          setPasswordRecovery(false);
          setAuthUser(null);
        }}
      />
    );
  }

  const userDisplayName = getPreferredDisplayName({
    torneoActivo,
    torneos,
    profile: authProfile,
    user: authUser,
  });

  if (torneos.length === 0) {
    return (
      <FirstLeagueOnboarding
        onCreate={handleCreateFirstLeague}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: FONT }}>
      <TorneosSidebar
        active={sidebarActive}
        onNav={goTo}
        torneoActivo={torneoActivo}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TorneosHeader
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          userName={userDisplayName}
          accountEmail={authUser?.email ?? ""}
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
                />
              </motion.div>
            )}

            {activeModule === "equipos" && (
              <motion.div key="equipos" {...PAGE_ANIM}>
                <EquiposPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "categorias" && (
              <motion.div key="categorias" {...PAGE_ANIM}>
                <ModuleEmptyState
                  icon={Tag}
                  title="Sin categorías"
                  subtitle="Define categorías para organizar tus torneos."
                />
              </motion.div>
            )}

            {activeModule === "calendario" && (
              <motion.div key="calendario" {...PAGE_ANIM}>
                <CalendarioPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "estadisticas" && (
              <motion.div key="estadisticas" {...PAGE_ANIM}>
                <EstadisticasPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "fixtures" && (
              <motion.div key="fixtures" {...PAGE_ANIM}>
                <FixturesPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "publica" && (
              <motion.div key="publica" {...PAGE_ANIM}>
                <AjustesPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "ajustes" && (
              <motion.div key="ajustes" {...PAGE_ANIM}>
                <AjustesPage onGoTorneos={goTorneos} />
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
