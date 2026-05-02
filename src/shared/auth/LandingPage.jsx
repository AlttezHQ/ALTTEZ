import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PALETTE } from "../tokens/palette";
import { sanitizeText, sanitizeTextFinal, sanitizeEmail, sanitizePhone } from "../utils/sanitize";
import { ROLES } from "../constants/roles";
import { isSupabaseReady } from "../lib/supabase";

const BRAND_SYMBOL = "/branding/alttez-symbol-transparent.png";
const EASE = [0.22, 1, 0.36, 1];
const REQUIRED_FIELDS = ["nombre", "ciudad", "entrenador", "categorias"];

if (typeof document !== "undefined" && !document.getElementById("landing-kf")) {
  const s = document.createElement("style");
  s.id = "landing-kf";
  s.textContent = `
    @media (max-width: 720px) {
      .ldg-grid,
      .ldg-form-row,
      .ldg-auth-shell {
        grid-template-columns: 1fr !important;
      }
      .ldg-shell {
        padding: 28px 18px 40px !important;
      }
      .ldg-card,
      .ldg-panel {
        padding: 24px 20px !important;
      }
    }
  `;
  document.head.appendChild(s);
}

const PAGE_BG = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `
    radial-gradient(circle at 12% 12%, rgba(206, 137, 70,0.10), transparent 24%),
    radial-gradient(circle at 88% 18%, rgba(206, 137, 70,0.12), transparent 22%),
    linear-gradient(180deg, #F6F1EA 0%, #FDFDFB 100%)
  `,
  padding: "40px 24px",
  position: "relative",
  overflow: "hidden",
};

const GRID = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: "linear-gradient(rgba(23,26,28,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(23,26,28,0.018) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
  maskImage: "linear-gradient(180deg, rgba(0,0,0,0.52), transparent 92%)",
};

function BrandSymbol() {
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 16,
        background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,241,234,0.96))",
        border: `1px solid ${PALETTE.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 28px rgba(23,26,28,0.08)",
      }}
    >
      <img src={BRAND_SYMBOL} alt="ALTTEZ" style={{ width: 24, height: 24, objectFit: "contain" }} />
    </div>
  );
}

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

function Shell({ children }) {
  return (
    <div style={PAGE_BG}>
      <div style={GRID} />
      <div
        className="ldg-shell"
        style={{
          width: "100%",
          maxWidth: 1120,
          position: "relative",
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TopBack({ onClick, label = "Volver al inicio" }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: "none",
        padding: 0,
        marginBottom: 18,
        cursor: "pointer",
        color: PALETTE.textMuted,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      ← {label}
    </button>
  );
}

export default function LandingPage({ onDemo, onRegister, onLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("landing");
  const [form, setForm] = useState({
    nombre: "", disciplina: "Futbol", ciudad: "", entrenador: "",
    temporada: "2025-26", categorias: "", campo: "",
    telefono: "", email: "", role: "admin", password: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [consentData, setConsentData] = useState(false);
  const [consentGuardian, setConsentGuardian] = useState(false);

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const validateAndSubmit = async () => {
    const errs = {};
    REQUIRED_FIELDS.forEach((k) => {
      if (!form[k] || !form[k].trim()) errs[k] = "Campo obligatorio";
    });
    const cleanEmail = sanitizeEmail(form.email);
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errs.email = "Email obligatorio y válido";
    if (!form.password || form.password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (!ROLES[form.role]) errs.role = "Rol inválido";
    if (!consentData) errs.consentData = "Debes aceptar la política de tratamiento de datos";
    if (!consentGuardian) errs.consentGuardian = "Debes certificar la autorización parental";
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setLoading(true);
      await onRegister({
        ...form,
        nombre: sanitizeTextFinal(form.nombre),
        ciudad: sanitizeTextFinal(form.ciudad),
        entrenador: sanitizeTextFinal(form.entrenador),
        categorias: sanitizeTextFinal(form.categorias),
        campo: sanitizeTextFinal(form.campo),
        telefono: sanitizePhone(form.telefono),
        email: cleanEmail,
        password: form.password,
        consent_at: new Date().toISOString(),
        consent_version: "1.0",
        guardian_consent: consentGuardian,
      });
      setLoading(false);
    }
  };

  const validateAndLogin = async () => {
    const errs = {};
    const cleanEmail = sanitizeEmail(loginForm.email);
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errs.email = "Email obligatorio y válido";
    if (!loginForm.password) errs.password = "Ingresa tu contraseña";
    setErrors(errs);
    if (Object.keys(errs).length === 0 && onLogin) {
      setLoading(true);
      await onLogin({ email: cleanEmail, password: loginForm.password });
      setLoading(false);
    }
  };

  if (step === "landing") {
    return (
      <Shell>
        <TopBack onClick={() => navigate("/")} />
        <div className="ldg-auth-shell" style={{ display: "grid", gridTemplateColumns: "1.02fr 1fr", gap: 24 }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease: EASE }}
            className="ldg-card"
            style={{
              padding: "40px 38px",
              borderRadius: 28,
              background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,248,0.96) 100%)",
              border: `1px solid ${PALETTE.border}`,
              boxShadow: "0 24px 64px rgba(23,26,28,0.10)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
              <BrandSymbol />
              <div>
                <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.06em", color: PALETTE.text }}>ALTTEZ</div>
                <div style={{ fontSize: 11, color: PALETTE.textMuted }}>Infraestructura operativa para clubes</div>
              </div>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "rgba(244,231,207,0.72)", color: PALETTE.text, fontSize: 11, fontWeight: 700, marginBottom: 18 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: PALETTE.neon }} />
              Nuevo sistema visual ALTTEZ
            </div>

            <h1 style={{ margin: "0 0 14px", fontSize: "clamp(38px, 4.6vw, 58px)", lineHeight: 0.95, letterSpacing: "-0.07em", color: PALETTE.text }}>
              Un acceso claro
              <br />
              para todo tu club.
            </h1>

            <p style={{ margin: 0, maxWidth: 500, fontSize: 16, lineHeight: 1.7, color: PALETTE.textMuted }}>
              Entra al entorno demo, registra un club real o inicia sesión con tu equipo. Misma operación, misma lógica, ahora con una experiencia más editorial y profesional.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 26 }}>
              {[
                ["Plantilla", "Jugadores, estados y fichas"],
                ["Entrenamiento", "Carga, sesiones y bienestar"],
                ["Administración", "Calendario, finanzas y reportes"],
              ].map(([title, copy]) => (
                <div key={title} style={{ padding: "14px 12px", borderRadius: 16, background: "#FFFDFC", border: `1px solid ${PALETTE.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: PALETTE.text, marginBottom: 5 }}>{title}</div>
                  <div style={{ fontSize: 11, color: PALETTE.textMuted, lineHeight: 1.55 }}>{copy}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.06, ease: EASE }}
            style={{ display: "grid", gap: 16 }}
          >
            <button
              onClick={onDemo}
              className="ldg-card"
              style={{
                textAlign: "left",
                padding: "28px",
                borderRadius: 24,
                background: "#FFFFFF",
                border: `1px solid ${PALETTE.border}`,
                boxShadow: "0 18px 48px rgba(23,26,28,0.08)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: PALETTE.neon, marginBottom: 12 }}>Entorno demo</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text, marginBottom: 10 }}>Explorar demo</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: PALETTE.textMuted }}>Accede con datos simulados y recorre el CRM sin configuración previa.</div>
            </button>

            <button
              onClick={() => setStep("register")}
              className="ldg-card"
              style={{
                textAlign: "left",
                padding: "28px",
                borderRadius: 24,
                background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,241,234,0.96) 100%)",
                border: `1px solid ${PALETTE.border}`,
                boxShadow: "0 18px 48px rgba(23,26,28,0.08)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: PALETTE.textMuted, marginBottom: 12 }}>Club real</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text, marginBottom: 10 }}>Registrar club</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: PALETTE.textMuted }}>Carga la operación base de tu organización y deja lista la cuenta de acceso.</div>
            </button>

            {isSupabaseReady && (
              <button
                onClick={() => setStep("login")}
                style={{
                  minHeight: 54,
                  borderRadius: 16,
                  border: `1px solid ${PALETTE.border}`,
                  background: "rgba(255,255,255,0.84)",
                  color: PALETTE.text,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Ya tengo cuenta
              </button>
            )}
          </motion.div>
        </div>
      </Shell>
    );
  }

  if (step === "register") {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: EASE }}
          className="ldg-panel"
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
          <TopBack onClick={() => setStep("landing")} label="Volver" />

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <BrandSymbol />
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text }}>Registrar club</div>
              <div style={{ fontSize: 11, color: PALETTE.textMuted }}>Datos operativos y acceso principal</div>
            </div>
          </div>

          <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldGroup label="Nombre del club *" error={errors.nombre}>
              <input style={mkInput(errors.nombre)} value={form.nombre} onChange={(e) => updateField("nombre", sanitizeText(e.target.value))} placeholder="Ej: Águilas del Lucero" maxLength={60} />
            </FieldGroup>
            <FieldGroup label="Disciplina" error={null}>
              <select style={{ ...mkInput(false), cursor: "pointer" }} value={form.disciplina} onChange={(e) => updateField("disciplina", e.target.value)}>
                {["Futbol", "Futsal", "Baloncesto", "Voleibol", "Otro"].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FieldGroup>
          </div>

          <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldGroup label="Ciudad *" error={errors.ciudad}>
              <input style={mkInput(errors.ciudad)} value={form.ciudad} onChange={(e) => updateField("ciudad", sanitizeText(e.target.value))} placeholder="Ej: Medellín" maxLength={60} />
            </FieldGroup>
            <FieldGroup label="Director técnico *" error={errors.entrenador}>
              <input style={mkInput(errors.entrenador)} value={form.entrenador} onChange={(e) => updateField("entrenador", sanitizeText(e.target.value))} placeholder="Nombre completo" maxLength={60} />
            </FieldGroup>
          </div>

          <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldGroup label="Categoría principal *" error={errors.categorias}>
              <input style={mkInput(errors.categorias)} value={form.categorias} onChange={(e) => updateField("categorias", sanitizeText(e.target.value))} placeholder="Ej: Sub-17" maxLength={30} />
            </FieldGroup>
            <FieldGroup label="Temporada" error={null}>
              <input style={mkInput(false)} value={form.temporada} onChange={(e) => updateField("temporada", e.target.value)} placeholder="2025-26" maxLength={10} />
            </FieldGroup>
          </div>

          <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldGroup label="Campo / Cancha" error={null}>
              <input style={mkInput(false)} value={form.campo} onChange={(e) => updateField("campo", sanitizeText(e.target.value))} placeholder="Ej: Estadio Sur" maxLength={60} />
            </FieldGroup>
            <FieldGroup label="Teléfono" error={null}>
              <input style={mkInput(false)} value={form.telefono} onChange={(e) => updateField("telefono", sanitizePhone(e.target.value))} placeholder="300 123 4567" maxLength={20} />
            </FieldGroup>
          </div>

          <div style={{ marginTop: 6, paddingTop: 18, borderTop: `1px solid ${PALETTE.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: PALETTE.text, marginBottom: 12 }}>Cuenta de acceso</div>
            <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FieldGroup label="Email *" error={errors.email}>
                <input style={mkInput(errors.email)} value={form.email} onChange={(e) => updateField("email", sanitizeEmail(e.target.value))} placeholder="tu@email.com" maxLength={80} type="email" autoComplete="email" />
              </FieldGroup>
              <FieldGroup label="Contraseña *" error={errors.password}>
                <input style={mkInput(errors.password)} value={form.password} onChange={(e) => updateField("password", e.target.value)} placeholder="Mínimo 6 caracteres" maxLength={72} type="password" autoComplete="new-password" />
              </FieldGroup>
            </div>
          </div>

          <FieldGroup label="Tu rol en el club" error={errors.role}>
            <select style={{ ...mkInput(errors.role), cursor: "pointer" }} value={form.role} onChange={(e) => updateField("role", e.target.value)}>
              {Object.entries(ROLES).map(([key, r]) => <option key={key} value={key}>{r.label}</option>)}
            </select>
          </FieldGroup>

          <div style={{ marginTop: 8, padding: "18px", borderRadius: 18, background: "#FFFCF7", border: `1px solid ${PALETTE.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: PALETTE.text, marginBottom: 10 }}>Autorización de datos</div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <input type="checkbox" checked={consentData} onChange={(e) => { setConsentData(e.target.checked); if (errors.consentData) setErrors((p) => { const n = { ...p }; delete n.consentData; return n; }); }} style={{ marginTop: 2, accentColor: PALETTE.neon }} />
              <span style={{ fontSize: 12, color: PALETTE.textMuted, lineHeight: 1.6 }}>
                Acepto la{" "}
                <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={{ color: PALETTE.neon }}>
                  Política de Tratamiento de Datos Personales
                </a>.
              </span>
            </label>
            {errors.consentData && <div style={{ fontSize: 10, color: PALETTE.danger, marginBottom: 10 }}>{errors.consentData}</div>}

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <input type="checkbox" checked={consentGuardian} onChange={(e) => { setConsentGuardian(e.target.checked); if (errors.consentGuardian) setErrors((p) => { const n = { ...p }; delete n.consentGuardian; return n; }); }} style={{ marginTop: 2, accentColor: PALETTE.neon }} />
              <span style={{ fontSize: 12, color: PALETTE.textMuted, lineHeight: 1.6 }}>
                Certifico la autorización de padres o tutores si se registran menores de edad.
              </span>
            </label>
            {errors.consentGuardian && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 8 }}>{errors.consentGuardian}</div>}
          </div>

          <button
            onClick={validateAndSubmit}
            disabled={loading || !consentData || !consentGuardian}
            style={{
              width: "100%",
              marginTop: 20,
              minHeight: 52,
              borderRadius: 14,
              border: "none",
              background: loading || !consentData || !consentGuardian ? "#E8DCC4" : "linear-gradient(135deg, #CE8946 0%, #A66F38 100%)",
              color: loading || !consentData || !consentGuardian ? PALETTE.textMuted : "#FFFFFF",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: loading ? "wait" : (!consentData || !consentGuardian) ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Registrando club..." : "Confirmar registro"}
          </button>

          {isSupabaseReady && (
            <div onClick={() => { setStep("login"); setErrors({}); }} style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: PALETTE.textMuted, cursor: "pointer" }}>
              Ya tengo cuenta. <span style={{ color: PALETTE.neon, fontWeight: 700 }}>Iniciar sesión</span>
            </div>
          )}
        </motion.div>
      </Shell>
    );
  }

  if (step === "login") {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="ldg-panel"
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
          <TopBack onClick={() => { setStep("landing"); setErrors({}); }} label="Volver" />

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <BrandSymbol />
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text }}>Iniciar sesión</div>
              <div style={{ fontSize: 11, color: PALETTE.textMuted }}>Credenciales del club</div>
            </div>
          </div>

          <FieldGroup label="Email" error={errors.email}>
            <input
              style={mkInput(errors.email)}
              value={loginForm.email}
              onChange={(e) => { setLoginForm((p) => ({ ...p, email: e.target.value })); if (errors.email) setErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
              placeholder="tu@email.com"
              maxLength={80}
              type="email"
              autoComplete="email"
            />
          </FieldGroup>

          <FieldGroup label="Contraseña" error={errors.password}>
            <input
              style={mkInput(errors.password)}
              value={loginForm.password}
              onChange={(e) => { setLoginForm((p) => ({ ...p, password: e.target.value })); if (errors.password) setErrors((p) => { const n = { ...p }; delete n.password; return n; }); }}
              placeholder="Tu contraseña"
              type="password"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && validateAndLogin()}
            />
          </FieldGroup>

          <button
            onClick={validateAndLogin}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 10,
              minHeight: 50,
              borderRadius: 14,
              border: "none",
              background: loading ? "#E8DCC4" : "linear-gradient(135deg, #CE8946 0%, #A66F38 100%)",
              color: loading ? PALETTE.textMuted : "#FFFFFF",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Verificando..." : "Ingresar al CRM"}
          </button>

          <div onClick={() => { setStep("register"); setErrors({}); }} style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: PALETTE.textMuted, cursor: "pointer" }}>
            No tengo cuenta. <span style={{ color: PALETTE.neon, fontWeight: 700 }}>Registrar club</span>
          </div>
        </motion.div>
      </Shell>
    );
  }

  return null;
}
