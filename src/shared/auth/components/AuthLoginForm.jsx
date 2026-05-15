import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { PALETTE } from "../../tokens/palette";
import { useAuth } from "../useAuth";
import { getPostLoginRedirect, getRedirectParam } from "../authRedirects";
import { sanitizeEmail } from "../../utils/sanitize";

const EASE = [0.22, 1, 0.36, 1];
const CU = PALETTE.bronce;

function FieldGroup({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, color: PALETTE.textMuted, marginBottom: 6, fontWeight: 600 }}>
        {label}
      </label>
      {children}
      {error && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function mkInput(hasError) {
  return {
    width: "100%",
    fontSize: 13,
    padding: "11px 13px",
    background: PALETTE.surface,
    border: `1px solid ${hasError ? PALETTE.danger : PALETTE.border}`,
    borderRadius: 12,
    color: PALETTE.text,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };
}

export default function AuthLoginForm({ onRegisterClick, onRecoverClick, source = null }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleLogin = async () => {
    const errs = {};
    const cleanEmail = sanitizeEmail(form.email);
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errs.email = "Email obligatorio y válido";
    if (!form.password) errs.password = "Ingresa tu contraseña";
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setMsg(null);
      const { error } = await auth.signIn(cleanEmail, form.password);
      setLoading(false);
      if (error) {
        setMsg({ type: "error", text: error });
        return;
      }
      const currentPath = source === "torneos" ? "/torneos" : location.pathname;
      navigate(getPostLoginRedirect({
        redirectPath: getRedirectParam(),
        currentPath,
        profile: auth.profile,
      }), { replace: true });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        maxWidth: 440,
        margin: "0 auto",
        padding: "34px 30px",
        borderRadius: 24,
        background: "rgba(255,255,255,0.98)",
        border: `1px solid ${PALETTE.border}`,
        boxShadow: "0 24px 64px rgba(23,26,28,0.10)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: "linear-gradient(135deg, #F6F1EA, #FFFFFF)",
          border: `1px solid ${PALETTE.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: CU
        }}>
          <LogIn size={20} />
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text }}>Iniciar sesión</div>
          <div style={{ fontSize: 11, color: PALETTE.textMuted }}>{source === 'torneos' ? 'Credenciales de organizador' : 'Credenciales del club'}</div>
        </div>
      </div>

      {msg && (
        <div style={{ 
          padding: "10px 14px", borderRadius: 10, marginBottom: 18,
          fontSize: 12, fontWeight: 600,
          background: msg.type === 'error' ? 'rgba(217,92,92,0.08)' : 'rgba(47,165,111,0.08)',
          color: msg.type === 'error' ? PALETTE.danger : '#2FA56F',
          border: `1px solid ${msg.type === 'error' ? 'rgba(217,92,92,0.15)' : 'rgba(47,165,111,0.15)'}`
        }}>
          {msg.text}
        </div>
      )}

      <FieldGroup label="Email" error={errors.email}>
        <input
          style={mkInput(errors.email)}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="tu@email.com"
          maxLength={80}
          type="email"
          autoComplete="email"
        />
      </FieldGroup>

      <FieldGroup label="Contraseña" error={errors.password}>
        <input
          style={mkInput(errors.password)}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="Tu contraseña"
          type="password"
          autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
      </FieldGroup>

      <div 
        onClick={onRecoverClick}
        style={{ textAlign: "right", marginTop: -6, marginBottom: 18, fontSize: 11, color: CU, fontWeight: 700, cursor: "pointer" }}
      >
        ¿Olvidaste tu contraseña?
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          minHeight: 50,
          borderRadius: 14,
          border: "none",
          background: loading ? "#E8DCC4" : `linear-gradient(135deg, ${CU} 0%, #A66F38 100%)`,
          color: loading ? PALETTE.textMuted : "#FFFFFF",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: loading ? "wait" : "pointer",
          boxShadow: loading ? "none" : `0 10px 20px rgba(201,151,58,0.22)`,
        }}
      >
        {loading ? "Verificando..." : "Ingresar"}
      </button>

      <div onClick={onRegisterClick} style={{ marginTop: 22, textAlign: "center", fontSize: 12, color: PALETTE.textMuted, cursor: "pointer" }}>
        No tengo cuenta. <span style={{ color: CU, fontWeight: 700 }}>{source === 'torneos' ? 'Registrarse' : 'Registrar club'}</span>
      </div>
    </motion.div>
  );
}
