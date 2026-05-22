import { useState } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { PALETTE } from "../../shared/tokens/palette";
import { useAuth } from "../../shared/auth";
import { supabase } from "../../shared/lib/supabase";
import { AuthFormField, mkAuthInput } from "../../shared/auth/components/AuthFormField";
import { createClub } from "../../shared/services/supabaseService";

const EASE = [0.22, 1, 0.36, 1];

export default function CrmOnboarding({ onComplete }) {
  const auth = useAuth();
  const [form, setForm] = useState({
    nombre: "", disciplina: "Fútbol",
    ciudad: "", entrenador: "", categorias: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.ciudad.trim() || !form.entrenador.trim() || !form.categorias.trim()) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Crear club en BD usando el RPC que vincula al usuario como admin
    const clubId = await createClub({
      ...form, email: auth.user.email,
    }, "production");

    if (!clubId) {
      setError("Ocurrió un error al crear tu club. Intenta nuevamente.");
      setLoading(false);
      return;
    }

    // 2. Actualizar user_metadata para Smart Routing
    // Obtenemos los roles actuales por si ya era 'organizador'
    const currentRoles = auth.user?.user_metadata?.roles || [];
    const newRoles = Array.from(new Set([...currentRoles, "club"]));

    const { error: updateError } = await supabase.auth.updateUser({
      data: { roles: newRoles, current_app: "crm" }
    });

    if (updateError) {
      console.warn("No se pudo actualizar metadata de routing", updateError);
    }

    // 3. Forzar refresco de sesión
    await supabase.auth.refreshSession();
    setLoading(false);
    onComplete();
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
          width: "100%", maxWidth: 480, background: "#FFFFFF",
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
            <Building2 size={32} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: PALETTE.text, letterSpacing: "-0.04em", marginBottom: 8 }}>
            Configura tu Club
          </h1>
          <p style={{ fontSize: 13, color: PALETTE.textMuted, lineHeight: 1.5 }}>
            Completa esta información básica para inicializar tu entorno de gestión deportiva.
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
          <AuthFormField label="Nombre del club *">
            <input style={mkAuthInput()} value={form.nombre}
              onChange={e => update("nombre", e.target.value)} placeholder="Ej: Águilas del Lucero" />
          </AuthFormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <AuthFormField label="Disciplina">
              <select style={{ ...mkAuthInput(), cursor: "pointer" }}
                value={form.disciplina} onChange={e => update("disciplina", e.target.value)}>
                {["Fútbol", "Futsal", "Baloncesto", "Voleibol", "Otro"].map(d =>
                  <option key={d} value={d}>{d}</option>
                )}
              </select>
            </AuthFormField>
            <AuthFormField label="Ciudad *">
              <input style={mkAuthInput()} value={form.ciudad}
                onChange={e => update("ciudad", e.target.value)} placeholder="Medellín" />
            </AuthFormField>
          </div>

          <AuthFormField label="Director Técnico *">
            <input style={mkAuthInput()} value={form.entrenador}
              onChange={e => update("entrenador", e.target.value)} placeholder="Nombre completo" />
          </AuthFormField>

          <AuthFormField label="Categoría principal *">
            <input style={mkAuthInput()} value={form.categorias}
              onChange={e => update("categorias", e.target.value)} placeholder="Ej: Sub-17" />
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
          {loading ? "Creando entorno..." : "Finalizar y entrar"}
        </button>
      </motion.div>
    </div>
  );
}
