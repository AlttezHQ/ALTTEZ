import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, ArrowLeft } from "lucide-react";
import { PALETTE } from "../../tokens/palette";
import { useAuth } from "../useAuth";
import { getPostLoginRedirect, getRedirectParam } from "../authRedirects";
import { validateLoginForm } from "../authValidation";
import { AuthFormField, mkAuthInput } from "./AuthFormField";
import PasswordInput from "./PasswordInput";
import GoogleLoginButton from "./GoogleLoginButton";
import Button from "../../../shared/ui/Button";

const EASE = [0.22, 1, 0.36, 1];
const CU = PALETTE.bronce;

export default function AuthLoginForm({ onRegisterClick, onRecoverClick }) {
  const auth     = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]       = useState(null);

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleLogin = async () => {
    const { errors: errs, cleanData } = validateLoginForm(form);
    setErrors(errs);
    if (!cleanData) return;

    setLoading(true);
    setMsg(null);
    const { error, user, profile } = await auth.signIn(cleanData.email, cleanData.password);
    setLoading(false);
    if (error) {
      setMsg({ type: "error", text: error });
      return;
    }
    const currentPath = location.pathname;
    navigate(getPostLoginRedirect({
      redirectPath: getRedirectParam(),
      currentPath,
      userMetadata: user?.user_metadata,
      profile: profile
    }), { replace: true });
  };

  const googleRedirect = window.location.origin;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 440, margin: "0 auto" }}>
      <button
        onClick={() => navigate("/")}
        type="button"
        style={{
          border: "none", background: "none", padding: 0,
          marginBottom: 16, cursor: "pointer",
          color: CU, fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 6,
          position: "absolute", top: -32, left: 0,
        }}
      >
        <ArrowLeft size={12} strokeWidth={3} />
        Volver al ecosistema
      </button>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="glass-panel"
        style={{
          width: "100%",
          padding: "40px 32px",
          border: `1px solid var(--color-border)`,
          boxShadow: "var(--shadow-panel)",
        }}
      >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: "linear-gradient(135deg, #F6F1EA, #FFFFFF)",
          border: `1px solid ${PALETTE.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", color: CU,
        }}>
          <LogIn size={20} />
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text }}>
            Iniciar sesión
          </div>
          <div style={{ fontSize: 11, color: PALETTE.textMuted }}>
            Ingresa tus credenciales para continuar
          </div>
        </div>
      </div>

      {msg && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 18,
          fontSize: 12, fontWeight: 600,
          background: msg.type === "error" ? "rgba(217,92,92,0.08)" : "rgba(47,165,111,0.08)",
          color: msg.type === "error" ? PALETTE.danger : "#2FA56F",
          border: `1px solid ${msg.type === "error" ? "rgba(217,92,92,0.15)" : "rgba(47,165,111,0.15)"}`,
        }}>
          {msg.text}
        </div>
      )}

      <AuthFormField label="Email" error={errors.email}>
        <input
          style={mkAuthInput(!!errors.email)}
          value={form.email}
          onChange={e => update("email", e.target.value)}
          placeholder="tu@email.com"
          maxLength={80}
          type="email"
          autoComplete="email"
        />
      </AuthFormField>

      <AuthFormField label="Contraseña" error={errors.password}>
        <PasswordInput
          id="login-password"
          value={form.password}
          onChange={e => update("password", e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Tu contraseña"
          hasError={!!errors.password}
          autoComplete="current-password"
        />
      </AuthFormField>

      <div
        onClick={onRecoverClick}
        style={{
          textAlign: "right", marginTop: -6, marginBottom: 18,
          fontSize: 11, color: CU, fontWeight: 700, cursor: "pointer",
        }}
      >
        ¿Olvidaste tu contraseña?
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleLogin}
        loading={loading}
        style={{ width: "100%", minHeight: 52, borderRadius: 14, marginBottom: 12 }}
      >
        Ingresar
      </Button>

      {/* Separador */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: PALETTE.border }} />
        <span style={{ fontSize: 10, color: PALETTE.textMuted, fontWeight: 600 }}>O</span>
        <div style={{ flex: 1, height: 1, background: PALETTE.border }} />
      </div>

      <GoogleLoginButton redirectTo={googleRedirect} disabled={loading} />

      <div
        onClick={onRegisterClick}
        style={{ marginTop: 22, textAlign: "center", fontSize: 12, color: PALETTE.textMuted, cursor: "pointer" }}
      >
        No tengo cuenta.{" "}
        <span style={{ color: CU, fontWeight: 700 }}>
          Crear cuenta
        </span>
      </div>
      </motion.div>
    </div>
  );
}
