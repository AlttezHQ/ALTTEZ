/**
 * @component LandingPage
 * @description Pantalla de bienvenida / onboarding de ALTTEZ.
 * Dos caminos: Demo o Nuevo Club.
 *
 * @props { onDemo, onRegister, onLogin }
 * @version 3.1.0
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PALETTE } from "../tokens/palette";
import { sanitizeText, sanitizeTextFinal, sanitizeEmail, sanitizePhone } from "../utils/sanitize";
import { ROLES } from "../constants/roles";
import { isSupabaseReady } from "../lib/supabase";

const BRAND_SYMBOL = "/branding/alttez-symbol-transparent.png";
const EASE = [0.22, 1, 0.36, 1];

/* ── Keyframes ── */
if (typeof document !== "undefined" && !document.getElementById("landing-kf")) {
  const s = document.createElement("style");
  s.id = "landing-kf";
  s.textContent = `
    @keyframes ldg_fade { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
    @keyframes ldg_float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
    @media (max-width: 640px) {
      .ldg-cards { grid-template-columns: 1fr !important; }
      .ldg-form-row { grid-template-columns: 1fr !important; }
      .ldg-form-pad { padding: 28px 22px !important; }
    }
  `;
  document.head.appendChild(s);
}

const REQUIRED_FIELDS = ["nombre", "ciudad", "entrenador", "categorias"];

/* ─── Shared page background shell (defined outside component) ─── */
const PAGE_BG = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: `
    radial-gradient(ellipse at 50% 16%, rgba(200,255,0,0.05), transparent 38%),
    radial-gradient(ellipse at 88% 80%, rgba(127,119,221,0.07), transparent 30%),
    linear-gradient(180deg, #03040A 0%, #07090F 50%, #030408 100%)
  `,
  padding: "32px 20px",
  position: "relative",
  overflow: "hidden",
};

const GRID_A = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
  opacity: 0.2,
};

const GRID_B = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
  backgroundSize: "192px 192px",
  opacity: 0.25,
};

const VIGNETTE = {
  position: "absolute", inset: 0, pointerEvents: "none",
  background: "radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.58) 100%)",
};

/* ─── Reusable pieces ─── */
function BrandSymbol() {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: "rgba(200,255,0,0.08)",
        border: "1px solid rgba(200,255,0,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <img
        src={BRAND_SYMBOL}
        alt="ALTTEZ"
        style={{
          width: 22,
          height: 22,
          objectFit: "contain",
          filter: "invert(1) brightness(1.4) sepia(1) hue-rotate(50deg) saturate(2.2)",
        }}
      />
    </div>
  );
}

function FieldGroup({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 9, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.32)", marginBottom: 6, fontWeight: 600 }}>
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
    padding: "10px 13px",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${hasError ? PALETTE.danger : "rgba(255,255,255,0.09)"}`,
    borderRadius: 9,
    color: "white",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
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
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validateAndSubmit = async () => {
    const errs = {};
    REQUIRED_FIELDS.forEach(k => {
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
        nombre: sanitizeTextFinal(form.nombre), ciudad: sanitizeTextFinal(form.ciudad),
        entrenador: sanitizeTextFinal(form.entrenador), categorias: sanitizeTextFinal(form.categorias),
        campo: sanitizeTextFinal(form.campo), telefono: sanitizePhone(form.telefono),
        email: cleanEmail, password: form.password,
        consent_at: new Date().toISOString(), consent_version: "1.0",
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

  /* ════════════ LANDING ════════════ */
  if (step === "landing") return (
    <div style={PAGE_BG}>
      <div style={GRID_A} />
      <div style={GRID_B} />
      <div style={VIGNETTE} />

      {/* Back to portal */}
      <div
        onClick={() => navigate("/")}
        style={{
          position: "absolute", top: 20, left: 24, zIndex: 10,
          fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px",
          color: "rgba(255,255,255,0.25)", cursor: "pointer",
          transition: "color 0.2s", userSelect: "none",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
      >
        ← Volver al inicio
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 720 }}>

        {/* Logotype */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 44 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <BrandSymbol />
            <span style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-2px", color: "white", textTransform: "uppercase", fontFamily: "'Orbitron','Exo 2',Arial,sans-serif", lineHeight: 1 }}>
              ALTTEZ
            </span>
          </div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "4.5px", color: "rgba(255,255,255,0.22)", fontWeight: 500 }}>
            Sistema operativo · Clubes de alto rendimiento
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
          className="ldg-cards"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {/* ── DEMO ── */}
          <motion.div
            whileHover={{ y: -5, boxShadow: `0 28px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(200,255,0,0.28)` }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={onDemo}
            style={{
              padding: "32px 28px",
              background: "rgba(255,255,255,0.022)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(200,255,0,0.1)",
              borderTop: `3px solid ${PALETTE.neon}`,
              borderRadius: 18,
              cursor: "pointer",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: PALETTE.neon, display: "block", flexShrink: 0 }}
              />
              <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "3px", color: PALETTE.neon, fontWeight: 700 }}>
                Entorno demo
              </span>
            </div>

            <div style={{ fontSize: 26, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.5px", lineHeight: 1.08, marginBottom: 12, fontFamily: "'Orbitron','Exo 2',Arial,sans-serif" }}>
              Explorar Demo
            </div>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 24, flex: 1 }}>
              Accede con datos simulados de un club de alto rendimiento. Sin configuración. Con toda la funcionalidad activa.
            </p>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", padding: "11px 20px", background: PALETTE.neon, color: "#0a0a0a", borderRadius: 8, boxShadow: `0 0 18px rgba(200,255,0,0.22)`, width: "fit-content" }}>
              Acceder al demo →
            </div>
          </motion.div>

          {/* ── REGISTRO ── */}
          <motion.div
            whileHover={{ y: -5, boxShadow: `0 28px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(127,119,221,0.3)` }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={() => setStep("register")}
            style={{
              padding: "32px 28px",
              background: "rgba(255,255,255,0.022)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(127,119,221,0.1)",
              borderTop: `3px solid ${PALETTE.purple}`,
              borderRadius: 18,
              cursor: "pointer",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "3px", color: PALETTE.purple, fontWeight: 700, marginBottom: 16 }}>
              Club real
            </div>

            <div style={{ fontSize: 26, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.5px", lineHeight: 1.08, marginBottom: 12, fontFamily: "'Orbitron','Exo 2',Arial,sans-serif" }}>
              Registrar Club
            </div>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 24, flex: 1 }}>
              Incorpora tu organización al ecosistema. Nombre, categorías, cuerpo técnico y estructura operativa completa.
            </p>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", padding: "11px 20px", background: PALETTE.purple, color: "white", borderRadius: 8, boxShadow: `0 0 18px rgba(127,119,221,0.24)`, width: "fit-content" }}>
              Incorporar club →
            </div>
          </motion.div>
        </motion.div>

        {/* Login link */}
        {isSupabaseReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            onClick={() => setStep("login")}
            style={{ marginTop: 24, textAlign: "center", fontSize: 12, cursor: "pointer", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "1.5px", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}
          >
            Ya tengo cuenta →{" "}
            <span style={{ color: PALETTE.neon, fontWeight: 700 }}>Iniciar sesión</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ marginTop: 20, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.1)", textTransform: "uppercase", letterSpacing: "2.5px" }}
        >
          v2.0 · ALTTEZ
        </motion.div>
      </div>
    </div>
  );

  /* ════════════ REGISTER ════════════ */
  if (step === "register") return (
    <div style={PAGE_BG}>
      <div style={GRID_A} />
      <div style={GRID_B} />
      <div style={VIGNETTE} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="ldg-form-pad"
        style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: 560,
          background: "rgba(5,8,18,0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            onClick={() => setStep("landing")}
            style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 20, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}
          >
            ← Volver
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <BrandSymbol />
            <div style={{ fontSize: 24, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.5px", fontFamily: "'Orbitron','Exo 2',Arial,sans-serif" }}>
              Incorporar club
            </div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "2px" }}>
            Datos operativos
          </div>
        </div>

        {/* Form rows */}
        <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FieldGroup label="Nombre del club *" error={errors.nombre}>
            <input style={mkInput(errors.nombre)} value={form.nombre} onChange={e => updateField("nombre", sanitizeText(e.target.value))} placeholder="Ej: Aguilas FC" maxLength={60} />
          </FieldGroup>
          <FieldGroup label="Disciplina" error={null}>
            <select style={{ ...mkInput(false), cursor: "pointer" }} value={form.disciplina} onChange={e => updateField("disciplina", e.target.value)}>
              {["Futbol","Futsal","Baloncesto","Voleibol","Otro"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FieldGroup>
        </div>

        <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FieldGroup label="Ciudad *" error={errors.ciudad}>
            <input style={mkInput(errors.ciudad)} value={form.ciudad} onChange={e => updateField("ciudad", sanitizeText(e.target.value))} placeholder="Ej: Medellín" maxLength={60} />
          </FieldGroup>
          <FieldGroup label="Director técnico *" error={errors.entrenador}>
            <input style={mkInput(errors.entrenador)} value={form.entrenador} onChange={e => updateField("entrenador", sanitizeText(e.target.value))} placeholder="Nombre completo" maxLength={60} />
          </FieldGroup>
        </div>

        <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FieldGroup label="Categoría principal *" error={errors.categorias}>
            <input style={mkInput(errors.categorias)} value={form.categorias} onChange={e => updateField("categorias", sanitizeText(e.target.value))} placeholder="Ej: Sub-17" maxLength={30} />
          </FieldGroup>
          <FieldGroup label="Temporada" error={null}>
            <input style={mkInput(false)} value={form.temporada} onChange={e => updateField("temporada", e.target.value)} placeholder="2025-26" maxLength={10} />
          </FieldGroup>
        </div>

        <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FieldGroup label="Campo / Cancha" error={null}>
            <input style={mkInput(false)} value={form.campo} onChange={e => updateField("campo", sanitizeText(e.target.value))} placeholder="Ej: Cancha La Floresta" maxLength={60} />
          </FieldGroup>
          <FieldGroup label="Teléfono" error={null}>
            <input style={mkInput(false)} value={form.telefono} onChange={e => updateField("telefono", sanitizePhone(e.target.value))} placeholder="300 123 4567" maxLength={20} />
          </FieldGroup>
        </div>

        {/* Cuenta de acceso */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16, marginTop: 4 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "2px", color: PALETTE.neon, marginBottom: 12, fontWeight: 700 }}>
            Cuenta de acceso
          </div>
          <div className="ldg-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldGroup label="Email *" error={errors.email}>
              <input style={mkInput(errors.email)} value={form.email} onChange={e => updateField("email", sanitizeEmail(e.target.value))} placeholder="tu@email.com" maxLength={80} type="email" autoComplete="email" />
            </FieldGroup>
            <FieldGroup label="Contraseña *" error={errors.password}>
              <input style={mkInput(errors.password)} value={form.password} onChange={e => updateField("password", e.target.value)} placeholder="Mínimo 6 caracteres" maxLength={72} type="password" autoComplete="new-password" />
            </FieldGroup>
          </div>
        </div>

        {/* Rol */}
        <FieldGroup label="Tu rol en el club" error={errors.role}>
          <select style={{ ...mkInput(errors.role), cursor: "pointer" }} value={form.role} onChange={e => updateField("role", e.target.value)}>
            {Object.entries(ROLES).map(([key, r]) => <option key={key} value={key}>{r.label}</option>)}
          </select>
        </FieldGroup>

        {/* Consentimiento */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16, marginTop: 4 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "2px", color: PALETTE.purple, marginBottom: 12, fontWeight: 700 }}>
            Autorización Ley 1581 de 2012
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={consentData} onChange={e => { setConsentData(e.target.checked); if (errors.consentData) setErrors(p => { const n={...p}; delete n.consentData; return n; }); }} style={{ marginTop: 2, width: 15, height: 15, flexShrink: 0, accentColor: PALETTE.purple, cursor: "pointer" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>
                He leído y acepto la{" "}
                <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={{ color: PALETTE.purple, textDecoration: "underline" }} onClick={e => e.stopPropagation()}>
                  Política de Tratamiento de Datos Personales
                </a>{" "}conforme a la Ley 1581 de 2012.
              </span>
            </label>
            {errors.consentData && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 4, marginLeft: 25 }}>{errors.consentData}</div>}
          </div>

          <div style={{ marginBottom: 4 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={consentGuardian} onChange={e => { setConsentGuardian(e.target.checked); if (errors.consentGuardian) setErrors(p => { const n={...p}; delete n.consentGuardian; return n; }); }} style={{ marginTop: 2, width: 15, height: 15, flexShrink: 0, accentColor: PALETTE.purple, cursor: "pointer" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>
                Certifico que cuento con la autorización de padres o tutores legales para registrar datos personales de atletas menores de edad.
              </span>
            </label>
            {errors.consentGuardian && <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 4, marginLeft: 25 }}>{errors.consentGuardian}</div>}
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 22 }}>
          <motion.button
            onClick={validateAndSubmit}
            disabled={loading || !consentData || !consentGuardian}
            whileHover={(!loading && consentData && consentGuardian) ? { scale: 1.02, boxShadow: "0 0 28px rgba(200,255,0,0.28)" } : {}}
            whileTap={(!loading && consentData && consentGuardian) ? { scale: 0.97 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              width: "100%", padding: "13px 24px", fontSize: 12, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "2px", borderRadius: 11,
              background: (!consentData || !consentGuardian) ? "rgba(127,119,221,0.15)"
                : loading ? "rgba(200,255,0,0.5)" : PALETTE.neon,
              color: (!consentData || !consentGuardian) ? "rgba(255,255,255,0.28)" : "#0a0a0a",
              border: (!consentData || !consentGuardian) ? "1px solid rgba(127,119,221,0.22)" : "none",
              cursor: loading ? "wait" : (!consentData || !consentGuardian) ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            {loading ? "Registrando club..." : "Confirmar registro →"}
          </motion.button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div style={{ marginTop: 10, fontSize: 10, color: PALETTE.danger, textTransform: "uppercase", letterSpacing: "1px" }}>
            Completa los campos marcados con *
          </div>
        )}

        {isSupabaseReady && (
          <div onClick={() => { setStep("login"); setErrors({}); }} style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.32)", cursor: "pointer", textAlign: "center" }}>
            Ya tengo cuenta →{" "}
            <span style={{ color: PALETTE.neon }}>Iniciar sesión</span>
          </div>
        )}
      </motion.div>
    </div>
  );

  /* ════════════ LOGIN ════════════ */
  if (step === "login") return (
    <div style={PAGE_BG}>
      <div style={GRID_A} />
      <div style={GRID_B} />
      <div style={VIGNETTE} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: 400,
          background: "rgba(5,8,18,0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          padding: "40px 34px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <div
            onClick={() => { setStep("landing"); setErrors({}); }}
            style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 22, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}
          >
            ← Volver
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <BrandSymbol />
            <div style={{ fontSize: 22, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "-0.5px", fontFamily: "'Orbitron','Exo 2',Arial,sans-serif" }}>
              Acceder
            </div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "2px" }}>
            Credenciales del club
          </div>
        </div>

        <FieldGroup label="Email" error={errors.email}>
          <input
            style={mkInput(errors.email)} value={loginForm.email}
            onChange={e => { setLoginForm(p => ({...p, email: e.target.value})); if (errors.email) setErrors(p => { const n={...p}; delete n.email; return n; }); }}
            placeholder="tu@email.com" maxLength={80} type="email" autoComplete="email"
          />
        </FieldGroup>

        <FieldGroup label="Contraseña" error={errors.password}>
          <input
            style={mkInput(errors.password)} value={loginForm.password}
            onChange={e => { setLoginForm(p => ({...p, password: e.target.value})); if (errors.password) setErrors(p => { const n={...p}; delete n.password; return n; }); }}
            placeholder="Tu contraseña" type="password" autoComplete="current-password"
            onKeyDown={e => e.key === "Enter" && validateAndLogin()}
          />
        </FieldGroup>

        <motion.button
          onClick={validateAndLogin}
          disabled={loading}
          whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 28px rgba(200,255,0,0.28)" } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            width: "100%", marginTop: 8, padding: "13px 24px", fontSize: 12, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "2px", borderRadius: 11,
            background: loading ? "rgba(200,255,0,0.5)" : PALETTE.neon,
            color: "#0a0a0a", border: "none",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Verificando..." : "Ingresar al CRM →"}
        </motion.button>

        <div
          onClick={() => { setStep("register"); setErrors({}); }}
          style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.3)", cursor: "pointer", textAlign: "center" }}
        >
          No tengo cuenta →{" "}
          <span style={{ color: PALETTE.purple }}>Incorporar club</span>
        </div>
      </motion.div>
    </div>
  );

  return null;
}
