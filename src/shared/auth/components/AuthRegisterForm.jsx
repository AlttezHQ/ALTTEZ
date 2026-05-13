import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { PALETTE } from "../../tokens/palette";
import { useAuth } from "../useAuth";
import { ROLES } from "../../constants/roles";
import { 
  sanitizeText, 
  sanitizeTextFinal, 
  sanitizeEmail, 
  sanitizePhone 
} from "../../utils/sanitize";

const EASE = [0.22, 1, 0.36, 1];
const CU = PALETTE.bronce;
const CU_BORDER = "rgba(201,151,58,0.28)";
const REQUIRED_FIELDS = ["nombre", "ciudad", "entrenador", "categorias"];

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

export default function AuthRegisterForm({ onLoginClick, source = null }) {
  const auth = useAuth();
  const [form, setForm] = useState({
    nombre: "", disciplina: source === "torneos" ? "Fútbol" : "Futbol", 
    ciudad: "", entrenador: "", temporada: "2025-26", 
    categorias: "", campo: "", telefono: "", 
    email: "", role: "admin", password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [consentData, setConsentData] = useState(false);
  const [consentGuardian, setConsentGuardian] = useState(false);

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleRegister = async () => {
    const errs = {};
    const requiredFields = source === "torneos" ? ["nombre", "ciudad"] : REQUIRED_FIELDS;
    
    requiredFields.forEach((k) => {
      if (!form[k] || !form[k].trim()) errs[k] = "Campo obligatorio";
    });

    const cleanEmail = sanitizeEmail(form.email);
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errs.email = "Email obligatorio y válido";
    if (!form.password || form.password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (!consentData) errs.consentData = "Debes aceptar la política de datos";
    if (source !== "torneos" && !consentGuardian) errs.consentGuardian = "Debes certificar la autorización";
    
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setMsg(null);
      const { error } = await auth.signUp({
        ...form,
        nombre: sanitizeTextFinal(form.nombre),
        ciudad: sanitizeTextFinal(form.ciudad),
        entrenador: sanitizeTextFinal(form.entrenador),
        categorias: sanitizeTextFinal(form.categorias),
        campo: sanitizeTextFinal(form.campo),
        telefono: sanitizePhone(form.telefono),
        email: cleanEmail,
        password: form.password,
        role: source === "torneos" ? "admin" : form.role,
        redirectPath: source === "torneos" ? "/torneos" : undefined,
      });
      setLoading(false);
      if (error) setMsg({ type: "error", text: error });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.52, ease: EASE }}
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "36px 34px",
        borderRadius: 28,
        background: "rgba(255,255,255,0.98)",
        border: `1px solid ${PALETTE.border}`,
        boxShadow: "0 24px 64px rgba(23,26,28,0.10)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "linear-gradient(135deg, #F6F1EA, #FFFFFF)",
          border: `1px solid ${PALETTE.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: CU
        }}>
          <UserPlus size={24} />
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text }}>
            {source === "torneos" ? "Registro Torneos" : "Registrar club"}
          </div>
          <div style={{ fontSize: 11, color: PALETTE.textMuted }}>
            {source === "torneos" ? "Crea tu cuenta de organizador" : "Datos operativos y acceso principal"}
          </div>
        </div>
      </div>

      {msg && (
        <div style={{ 
          padding: "12px 16px", borderRadius: 12, marginBottom: 22,
          fontSize: 13, fontWeight: 600,
          background: msg.type === 'error' ? 'rgba(217,92,92,0.08)' : 'rgba(47,165,111,0.08)',
          color: msg.type === 'error' ? PALETTE.danger : '#2FA56F',
          border: `1px solid ${msg.type === 'error' ? 'rgba(217,92,92,0.15)' : 'rgba(47,165,111,0.15)'}`
        }}>
          {msg.text}
        </div>
      )}

      {source === "torneos" ? (
        /* ── Torneos form ── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FieldGroup label="Nombre del organizador *" error={errors.nombre}>
            <input style={mkInput(errors.nombre)} value={form.nombre} onChange={(e) => update("nombre", sanitizeText(e.target.value))} placeholder="Ej: Liga Norte" />
          </FieldGroup>
          <FieldGroup label="Ciudad *" error={errors.ciudad}>
            <input style={mkInput(errors.ciudad)} value={form.ciudad} onChange={(e) => update("ciudad", sanitizeText(e.target.value))} placeholder="Ej: Medellín" />
          </FieldGroup>
          <div style={{ gridColumn: "1 / span 2" }}>
            <FieldGroup label="Deporte principal" error={null}>
              <select style={{ ...mkInput(false), cursor: "pointer" }} value={form.disciplina} onChange={(e) => update("disciplina", e.target.value)}>
                {["Fútbol", "Futsal", "Baloncesto", "Voleibol", "Rugby", "Otro"].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FieldGroup>
          </div>
        </div>
      ) : (
        /* ── Clubes form ── */
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FieldGroup label="Nombre del club *" error={errors.nombre}>
              <input style={mkInput(errors.nombre)} value={form.nombre} onChange={(e) => update("nombre", sanitizeText(e.target.value))} placeholder="Ej: Águilas del Lucero" />
            </FieldGroup>
            <FieldGroup label="Disciplina" error={null}>
              <select style={{ ...mkInput(false), cursor: "pointer" }} value={form.disciplina} onChange={(e) => update("disciplina", e.target.value)}>
                {["Futbol", "Futsal", "Baloncesto", "Voleibol", "Otro"].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Ciudad *" error={errors.ciudad}>
              <input style={mkInput(errors.ciudad)} value={form.ciudad} onChange={(e) => update("ciudad", sanitizeText(e.target.value))} placeholder="Ej: Medellín" />
            </FieldGroup>
            <FieldGroup label="Director técnico *" error={errors.entrenador}>
              <input style={mkInput(errors.entrenador)} value={form.entrenador} onChange={(e) => update("entrenador", sanitizeText(e.target.value))} placeholder="Nombre completo" />
            </FieldGroup>
            <FieldGroup label="Categoría principal *" error={errors.categorias}>
              <input style={mkInput(errors.categorias)} value={form.categorias} onChange={(e) => update("categorias", sanitizeText(e.target.value))} placeholder="Ej: Sub-17" />
            </FieldGroup>
            <FieldGroup label="Temporada" error={null}>
              <input style={mkInput(false)} value={form.temporada} onChange={(e) => update("temporada", e.target.value)} placeholder="2025-26" />
            </FieldGroup>
          </div>
        </>
      )}

      <div style={{ marginTop: 10, paddingTop: 22, borderTop: `1px solid ${PALETTE.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: PALETTE.text, marginBottom: 14 }}>Cuenta de acceso</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FieldGroup label="Email *" error={errors.email}>
            <input style={mkInput(errors.email)} value={form.email} onChange={(e) => update("email", sanitizeEmail(e.target.value))} placeholder="tu@email.com" type="email" autoComplete="email" />
          </FieldGroup>
          <FieldGroup label="Contraseña *" error={errors.password}>
            <input style={mkInput(errors.password)} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Mínimo 6 caracteres" type="password" autoComplete="new-password" />
          </FieldGroup>
        </div>
      </div>

      {source !== "torneos" && (
        <FieldGroup label="Tu rol en el club" error={errors.role}>
          <select style={{ ...mkInput(errors.role), cursor: "pointer" }} value={form.role} onChange={(e) => update("role", e.target.value)}>
            {Object.entries(ROLES).map(([key, r]) => <option key={key} value={key}>{r.label}</option>)}
          </select>
        </FieldGroup>
      )}

      <div style={{ marginTop: 10, padding: "20px", borderRadius: 18, background: "#FFFCF7", border: `1px solid ${PALETTE.border}` }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <input type="checkbox" checked={consentData} onChange={(e) => setConsentData(e.target.checked)} style={{ marginTop: 3, accentColor: CU }} />
          <span style={{ fontSize: 12, color: PALETTE.textMuted, lineHeight: 1.6 }}>
            Acepto la <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={{ color: CU, fontWeight: 700 }}>Política de Privacidad</a> y el tratamiento de mis datos personales.
          </span>
        </label>
        {errors.consentData && <div style={{ fontSize: 10, color: PALETTE.danger, marginBottom: 12 }}>{errors.consentData}</div>}

        {source !== "torneos" && (
          <>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <input type="checkbox" checked={consentGuardian} onChange={(e) => setConsentGuardian(e.target.checked)} style={{ marginTop: 3, accentColor: CU }} />
              <span style={{ fontSize: 12, color: PALETTE.textMuted, lineHeight: 1.6 }}>
                Certifico que cuento con la autorización de los padres o tutores legales para el tratamiento de datos de menores.
              </span>
            </label>
            {errors.consentGuardian && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 10 }}>{errors.consentGuardian}</div>}
          </>
        )}
      </div>

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 24,
          minHeight: 52,
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
        {loading ? "Registrando..." : source === "torneos" ? "Crear cuenta de Torneos" : "Confirmar registro"}
      </button>

      <div onClick={onLoginClick} style={{ marginTop: 18, textAlign: "center", fontSize: 12, color: PALETTE.textMuted, cursor: "pointer" }}>
        ¿Ya tienes cuenta? <span style={{ color: CU, fontWeight: 700 }}>Iniciar sesión</span>
      </div>
    </motion.div>
  );
}
