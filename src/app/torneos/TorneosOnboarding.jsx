import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { PALETTE } from "../../shared/tokens/palette";
import { useAuth } from "../../shared/auth";
import { supabase } from "../../shared/lib/supabase";
import { AuthFormField, mkAuthInput } from "../../shared/auth/components/AuthFormField";

const EASE = [0.22, 1, 0.36, 1];

export default function TorneosOnboarding({ onComplete }) {
  const auth = useAuth();
  const [form, setForm] = useState({
    nombre: "", ciudad: "", disciplina: "Fútbol",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.ciudad.trim()) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // En Torneos, actualizamos directamente el profile y los metadatos.
      // 1. Actualizar user_metadata para Smart Routing
      const currentRoles = auth.user?.user_metadata?.roles || [];
      const newRoles = Array.from(new Set([...currentRoles, "organizador"]));
      
      const { error: metaError } = await supabase.auth.updateUser({
        data: { roles: newRoles, current_app: "torneos", org_name: form.nombre }
      });
      
      if (metaError) throw metaError;

      // 2. Si hay profile_id, podríamos actualizarlo (esto dependería de la BD, 
      // pero actualizando el metadato aseguramos el Smart Routing).

      // Refrescar sesión global
      await supabase.auth.refreshSession();
      onComplete();

    } catch (e) {
      console.error("TorneosOnboarding error:", e);
      setError(`Error: ${e?.message || "No se pudo configurar la organización"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F6F1EA", padding: 24, fontFamily: "Manrope, sans-serif"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          width: "100%", maxWidth: 460, background: "#FFFFFF",
          borderRadius: 24, padding: "40px 32px",
          border: `1px solid ${PALETTE.border}`,
          boxShadow: "0 24px 64px rgba(23,26,28,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
            background: "linear-gradient(135deg, #F6F1EA, #FFFFFF)",
            border: `1px solid ${PALETTE.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", color: PALETTE.bronce,
          }}>
            <Trophy size={32} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: PALETTE.text, letterSpacing: "-0.04em", marginBottom: 8 }}>
            Cuenta de Organizador
          </h1>
          <p style={{ fontSize: 13, color: PALETTE.textMuted, lineHeight: 1.5 }}>
            Ingresa los detalles de tu liga u organización para comenzar a crear torneos.
          </p>
        </div>

        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: 12, marginBottom: 20,
            fontSize: 12, fontWeight: 600,
            background: "rgba(217,92,92,0.08)", color: PALETTE.danger,
            border: "1px solid rgba(217,92,92,0.15)",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 14 }}>
          <AuthFormField label="Nombre de la organización *">
            <input style={mkAuthInput()} value={form.nombre}
              onChange={e => update("nombre", e.target.value)} placeholder="Ej: Liga Norte" />
          </AuthFormField>

          <AuthFormField label="Ciudad *">
            <input style={mkAuthInput()} value={form.ciudad}
              onChange={e => update("ciudad", e.target.value)} placeholder="Medellín" />
          </AuthFormField>

          <AuthFormField label="Deporte principal">
            <select style={{ ...mkAuthInput(), cursor: "pointer" }}
              value={form.disciplina} onChange={e => update("disciplina", e.target.value)}>
              {["Fútbol", "Futsal", "Baloncesto", "Voleibol", "Otro"].map(d =>
                <option key={d} value={d}>{d}</option>
              )}
            </select>
          </AuthFormField>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", marginTop: 32, minHeight: 52, borderRadius: 14, border: "none",
            background: loading ? "#E8DCC4" : PALETTE.bronce,
            color: "#FFFFFF", fontSize: 13, fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
            boxShadow: loading ? "none" : `0 8px 24px rgba(206,137,70,0.25)`,
          }}
        >
          {loading ? "Configurando..." : "Finalizar y entrar"}
        </button>
      </motion.div>
    </div>
  );
}
