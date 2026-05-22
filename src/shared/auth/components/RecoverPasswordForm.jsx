import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { PALETTE } from "../../tokens/palette";
import { isSupabaseReady, supabase } from "../../lib/supabase";
import { AuthFormField, mkAuthInput } from "./AuthFormField";

const EASE = [0.22, 1, 0.36, 1];
const CU = PALETTE.bronce;

/**
 * @component RecoverPasswordForm
 * @description Formulario de recuperación de contraseña vía Supabase resetPasswordForEmail.
 * Muestra feedback de éxito cuando se envía el email de recuperación.
 */
export default function RecoverPasswordForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError("Ingresa un email válido");
      return;
    }
    if (!isSupabaseReady || !supabase) {
      setError("Servicio no disponible. Contacta a soporte.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/crm`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(clean, { redirectTo });
      if (err) {
        setError(err.message || "No se pudo enviar el email de recuperación");
      } else {
        setSent(true);
      }
    } catch (e) {
      setError(e?.message || "Error inesperado");
    } finally {
      setLoading(false);
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
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          width: "100%",
          padding: "34px 30px", borderRadius: 24,
          background: "rgba(255,255,255,0.98)",
          border: `1px solid ${PALETTE.border}`,
          boxShadow: "0 24px 64px rgba(23,26,28,0.10)",
        }}
      >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: "linear-gradient(135deg, #F6F1EA, #FFFFFF)",
          border: `1px solid ${PALETTE.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", color: CU,
        }}>
          <Mail size={20} />
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text }}>Recuperar contraseña</div>
          <div style={{ fontSize: 11, color: PALETTE.textMuted }}>Te enviaremos un enlace por email</div>
        </div>
      </div>

      {sent ? (
        /* Estado de éxito */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{
            padding: "24px 20px", borderRadius: 16, textAlign: "center",
            background: "rgba(47,165,111,0.06)",
            border: "1px solid rgba(47,165,111,0.2)",
          }}
        >
          <CheckCircle size={36} color="#2FA56F" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 800, color: PALETTE.text, marginBottom: 6 }}>Email enviado</div>
          <div style={{ fontSize: 12, color: PALETTE.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
            Revisa tu bandeja de entrada en <strong>{email.trim().toLowerCase()}</strong>.
            El enlace expira en 1 hora.
          </div>
          <button
            onClick={onBack}
            style={{
              padding: "10px 24px", borderRadius: 10, border: `1px solid ${PALETTE.border}`,
              background: "transparent", color: PALETTE.textMuted,
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Volver al login
          </button>
        </motion.div>
      ) : (
        /* Formulario */
        <>
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 18,
              fontSize: 12, fontWeight: 600,
              background: "rgba(217,92,92,0.08)", color: PALETTE.danger,
              border: "1px solid rgba(217,92,92,0.15)",
            }}>
              {error}
            </div>
          )}

          <AuthFormField label="Email de tu cuenta">
            <input
              style={mkAuthInput(!!error)}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="tu@email.com"
              autoComplete="email"
              maxLength={80}
            />
          </AuthFormField>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", minHeight: 50, borderRadius: 14, border: "none",
              background: loading ? "#E8DCC4" : `linear-gradient(135deg, ${CU} 0%, #A66F38 100%)`,
              color: loading ? PALETTE.textMuted : "#FFFFFF",
              fontSize: 12, fontWeight: 800, letterSpacing: "0.14em",
              textTransform: "uppercase", cursor: loading ? "wait" : "pointer",
              boxShadow: loading ? "none" : `0 10px 20px rgba(201,151,58,0.22)`,
              marginBottom: 16,
            }}
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>

          <div
            onClick={onBack}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontSize: 12, color: PALETTE.textMuted, cursor: "pointer",
            }}
          >
            <ArrowLeft size={13} /> Volver al login
          </div>
        </>
      )}
      </motion.div>
    </div>
  );
}
