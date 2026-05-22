import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, ArrowLeft } from "lucide-react";
import { PALETTE } from "../../tokens/palette";
import { useAuth } from "../useAuth";
import { sanitizeText } from "../../utils/sanitize";
import { validateRegisterForm } from "../authValidation";
import { evaluatePasswordStrength } from "../passwordStrength";
import { AuthFormField, mkAuthInput } from "./AuthFormField";
import PasswordInput from "./PasswordInput";
import PasswordStrengthBar from "./PasswordStrengthBar";

const EASE = [0.22, 1, 0.36, 1];
const CU = PALETTE.bronce;

export default function AuthRegisterForm({ onLoginClick, onAfterRegister = null }) {
  const auth = useAuth();
  const [form, setForm] = useState({
    nombre: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState(null);
  const [consentData, setConsentData] = useState(false);

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const passwordStrength = evaluatePasswordStrength(form.password, {
    email: form.email,
    nombre: form.nombre,
  });

  const handleRegister = async () => {
    // Usamos 'universal' para el validador ya que no requerimos datos de club ni torneos
    const { errors: errs, cleanData } = validateRegisterForm(
      form,
      "universal",
      { consentData, consentGuardian: true } // consentGuardian ya no aplica en este paso universal
    );
    setErrors(errs);
    if (!cleanData) return;

    setLoading(true);
    setMsg(null);
    const { error } = await auth.signUp({
      email: cleanData.email,
      password: cleanData.password,
      fullName: cleanData.nombre,
      // No asignamos rol todavía, se asignará durante el Onboarding
    });
    setLoading(false);

    if (error) {
      setMsg({ type: "error", text: error });
      return;
    }

    if (onAfterRegister) {
      onAfterRegister(cleanData);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 440, margin: "0 auto" }}>
      <button
        onClick={() => window.location.href = "/"}
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
        transition={{ duration: 0.52, ease: EASE }}
        style={{
          width: "100%",
          padding: "34px 30px", borderRadius: 24,
          background: "rgba(255,255,255,0.98)",
          border: `1px solid ${PALETTE.border}`,
          boxShadow: "0 24px 64px rgba(23,26,28,0.10)",
        }}
      >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "linear-gradient(135deg, #F6F1EA, #FFFFFF)",
          border: `1px solid ${PALETTE.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", color: CU,
        }}>
          <UserPlus size={24} />
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text }}>
            Crear cuenta
          </div>
          <div style={{ fontSize: 11, color: PALETTE.textMuted }}>
            Ingresa tus datos para comenzar
          </div>
        </div>
      </div>

      {msg && (
        <div style={{
          padding: "12px 16px", borderRadius: 12, marginBottom: 22,
          fontSize: 13, fontWeight: 600,
          background: msg.type === "error" ? "rgba(217,92,92,0.08)" : "rgba(47,165,111,0.08)",
          color: msg.type === "error" ? PALETTE.danger : "#2FA56F",
          border: `1px solid ${msg.type === "error" ? "rgba(217,92,92,0.15)" : "rgba(47,165,111,0.15)"}`,
        }}>
          {msg.text}
        </div>
      )}

      <AuthFormField label="Nombre completo *" error={errors.nombre}>
        <input style={mkAuthInput(!!errors.nombre)} value={form.nombre}
          onChange={e => update("nombre", sanitizeText(e.target.value))}
          placeholder="Tu nombre completo" />
      </AuthFormField>

      <AuthFormField label="Email *" error={errors.email}>
        <input style={mkAuthInput(!!errors.email)} value={form.email}
          onChange={e => update("email", e.target.value)}
          placeholder="tu@email.com" type="email" autoComplete="email" />
      </AuthFormField>

      <AuthFormField label="Contraseña *" error={errors.password}>
        <PasswordInput
          id="register-password"
          value={form.password}
          onChange={e => update("password", e.target.value)}
          placeholder="Mínimo 8 caracteres"
          hasError={!!errors.password}
          autoComplete="new-password"
        />
        <PasswordStrengthBar password={form.password} strength={passwordStrength} />
      </AuthFormField>

      <AuthFormField label="Confirmar contraseña *" error={errors.confirmPassword}>
        <PasswordInput
          id="register-confirm-password"
          value={form.confirmPassword}
          onChange={e => update("confirmPassword", e.target.value)}
          placeholder="Repite tu contraseña"
          hasError={!!errors.confirmPassword}
          autoComplete="new-password"
        />
      </AuthFormField>

      {/* Consentimientos */}
      <div style={{
        marginTop: 10, padding: 20, borderRadius: 18,
        background: "#FFFCF7", border: `1px solid ${PALETTE.border}`,
      }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <input type="checkbox" checked={consentData}
            onChange={e => setConsentData(e.target.checked)}
            style={{ marginTop: 3, accentColor: CU }} />
          <span style={{ fontSize: 12, color: PALETTE.textMuted, lineHeight: 1.6 }}>
            Acepto la{" "}
            <a href="/privacidad" target="_blank" rel="noopener noreferrer"
              style={{ color: CU, fontWeight: 700 }}>
              Política de Privacidad
            </a>{" "}
            y el tratamiento de mis datos personales.
          </span>
        </label>
        {errors.consentData && (
          <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 12 }}>
            {errors.consentData}
          </div>
        )}
      </div>

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%", marginTop: 24, minHeight: 52, borderRadius: 14, border: "none",
          background: loading ? "#E8DCC4" : `linear-gradient(135deg, ${CU} 0%, #A66F38 100%)`,
          color: loading ? PALETTE.textMuted : "#FFFFFF",
          fontSize: 12, fontWeight: 800, letterSpacing: "0.14em",
          textTransform: "uppercase", cursor: loading ? "wait" : "pointer",
          boxShadow: loading ? "none" : `0 10px 20px rgba(201,151,58,0.22)`,
        }}
      >
        {loading ? "Registrando..." : "Confirmar registro"}
      </button>

      <div
        onClick={onLoginClick}
        style={{ marginTop: 18, textAlign: "center", fontSize: 12, color: PALETTE.textMuted, cursor: "pointer" }}
      >
        ¿Ya tienes cuenta?{" "}
        <span style={{ color: CU, fontWeight: 700 }}>Iniciar sesión</span>
      </div>
      </motion.div>
    </div>
  );
}
