import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Mail } from "lucide-react";
import { PALETTE } from "../../../shared/tokens/palette";
import { useAuth } from "../../../shared/auth";
import { signInWithGoogle } from "../../../shared/services/authService";
import { validateLoginForm, validateRegisterForm } from "../../../shared/auth/authValidation";
import { evaluatePasswordStrength } from "../../../shared/auth/passwordStrength";
import PasswordStrengthBar from "../../../shared/auth/components/PasswordStrengthBar";
import RecoverPasswordForm from "../../../shared/auth/components/RecoverPasswordForm";

// ── Design tokens (matching TorneosApp palette) ────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function TorneosAuthScreen({ initialTab = "login" }) {
  const auth = useAuth();
  const [tab, setTab]           = useState(initialTab);
  const [form, setForm]         = useState({ nombre: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState(null);
  const [consentData, setConsentData] = useState(false);

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleLogin = async () => {
    const { errors: errs, cleanData } = validateLoginForm(form);
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
    const { errors: errs, cleanData } = validateRegisterForm(form, "torneos", { consentData });
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setMsg(null);
      const { error } = await signInWithGoogle(`${window.location.origin}/torneos`);
      if (error) setMsg({ type: "error", text: error });
    } catch (error) {
      setMsg({ type: "error", text: error?.message || "No se pudo iniciar sesión con Google" });
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

  const passwordStrength = evaluatePasswordStrength(form.password, {
    email: form.email,
    nombre: form.nombre,
  });

  // ── Recover tab ─────────────────────────────────────────────────────────────
  if (tab === "recover") {
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
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", color: TEXT }}>ALTTEZ Torneos</div>
              <div style={{ fontSize: 10, color: MUTED }}>Gestor de torneos deportivos</div>
            </div>
          </div>
          <RecoverPasswordForm onBack={() => setTab("login")} />
        </motion.div>
      </div>
    );
  }

  // ── Login / Register tabs ────────────────────────────────────────────────────
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
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.04em", color: TEXT }}>ALTTEZ Torneos</div>
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
                fontWeight: tab === key ? 600 : 500,
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
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>CONTRASEÑA</label>
              <input style={inp(errors.password)} type="password" value={form.password}
                onChange={e => update("password", e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Tu contraseña" />
              {errors.password && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 3 }}>{errors.password}</div>}
            </div>
            <div
              onClick={() => setTab("recover")}
              style={{ textAlign: "right", marginBottom: 16, fontSize: 11, color: CU, fontWeight: 700, cursor: "pointer" }}
            >
              ¿Olvidaste tu contraseña?
            </div>
            <button onClick={handleLogin} disabled={loading} style={{
              width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
              background: loading ? "#E8DCC4" : `linear-gradient(135deg, ${CU}, #A66F38)`,
              color: loading ? MUTED : "#FFF", fontSize: 13, fontWeight: 600,
              fontFamily: FONT, cursor: loading ? "wait" : "pointer",
            }}>{loading ? "Verificando..." : "Ingresar"}</button>
            <button onClick={handleGoogleLogin} disabled={loading} style={{
              width: "100%", minHeight: 46, marginTop: 10, borderRadius: 12,
              border: `1px solid ${BORDER}`, background: CARD, color: TEXT,
              fontSize: 12, fontWeight: 700, fontFamily: FONT,
              cursor: loading ? "wait" : "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Mail size={14} /> Continuar con Google
            </button>
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
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>CONTRASEÑA</label>
              <input style={inp(errors.password)} type="password" value={form.password}
                onChange={e => update("password", e.target.value)}
                placeholder="Mínimo 8 caracteres" />
              {errors.password && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 3 }}>{errors.password}</div>}
              <PasswordStrengthBar password={form.password} strength={passwordStrength} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 }}>CONFIRMAR CONTRASEÑA</label>
              <input style={inp(errors.confirmPassword)} type="password" value={form.confirmPassword}
                onChange={e => update("confirmPassword", e.target.value)}
                placeholder="Repite tu contraseña" />
              {errors.confirmPassword && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 3 }}>{errors.confirmPassword}</div>}
            </div>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, padding: "14px", borderRadius: 12, background: BG, border: `1px solid ${BORDER}` }}>
              <input
                type="checkbox"
                checked={consentData}
                onChange={e => setConsentData(e.target.checked)}
                style={{ marginTop: 2, accentColor: CU }}
              />
              <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                Al crear tu cuenta aceptas la Política de Tratamiento de Datos Personales para gestionar torneos y comunicaciones operativas.
              </span>
            </label>
            {errors.consentData && <div style={{ fontSize: 10, color: PALETTE.danger, marginBottom: 12 }}>{errors.consentData}</div>}
            <button onClick={handleRegister} disabled={loading} style={{
              width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
              background: loading ? "#E8DCC4" : `linear-gradient(135deg, ${CU}, #A66F38)`,
              color: loading ? MUTED : "#FFF", fontSize: 13, fontWeight: 600,
              fontFamily: FONT, cursor: loading ? "wait" : "pointer",
            }}>{loading ? "Creando cuenta..." : "Crear cuenta"}</button>
            <button onClick={handleGoogleLogin} disabled={loading} style={{
              width: "100%", minHeight: 46, marginTop: 10, borderRadius: 12,
              border: `1px solid ${BORDER}`, background: CARD, color: TEXT,
              fontSize: 12, fontWeight: 700, fontFamily: FONT,
              cursor: loading ? "wait" : "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Mail size={14} /> Continuar con Google
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
