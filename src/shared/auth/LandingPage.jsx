import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Trophy, Globe, Layers, ShieldCheck, Monitor, User, UserPlus, ArrowRight, Star } from "lucide-react";
import { PALETTE } from "../tokens/palette";
import { sanitizeText, sanitizeTextFinal, sanitizeEmail, sanitizePhone } from "../utils/sanitize";
import { ROLES } from "../constants/roles";
import { isSupabaseReady } from "../lib/supabase";

const BRAND_SYMBOL = "/branding/alttez-symbol-transparent.png";
const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 360, damping: 28 };
const SPRING_FAST = { type: "spring", stiffness: 400, damping: 28 };
const REQUIRED_FIELDS = ["nombre", "ciudad", "entrenador", "categorias"];

const CU = "#C9973A";
const CU_BORDER = "rgba(201,151,58,0.28)";
const CU_SOFT = "rgba(201,151,58,0.10)";

if (typeof document !== "undefined" && !document.getElementById("landing-kf")) {
  const s = document.createElement("style");
  s.id = "landing-kf";
  s.textContent = `
    @media (max-width: 960px) {
      .ldg-auth-shell {
        grid-template-columns: 1fr !important;
      }
      .ldg-right-col {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
      }
    }
    @media (max-width: 720px) {
      .ldg-form-row,
      .ldg-right-col {
        grid-template-columns: 1fr !important;
      }
      .ldg-shell {
        padding: 28px 18px 40px !important;
      }
      .ldg-card,
      .ldg-panel {
        padding: 24px 20px !important;
      }
      .ldg-hero-row {
        flex-direction: column !important;
      }
      .ldg-crm-preview {
        display: none !important;
      }
      .ldg-card-inner {
        flex-direction: column !important;
      }
      .ldg-mini-list,
      .ldg-mini-fixture {
        display: none !important;
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
    radial-gradient(circle at 12% 12%, rgba(201,151,58,0.08), transparent 24%),
    radial-gradient(circle at 88% 18%, rgba(201,151,58,0.10), transparent 22%),
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function BrandSymbol() {
  return (
    <div style={{
      width: 46, height: 46, borderRadius: 16,
      background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,241,234,0.96))",
      border: `1px solid ${PALETTE.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 10px 28px rgba(23,26,28,0.08)",
    }}>
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
        style={{ width: "100%", maxWidth: 1240, position: "relative", zIndex: 2 }}
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
        border: "none", background: "none", padding: 0,
        marginBottom: 18, cursor: "pointer",
        color: CU, fontSize: 11, fontWeight: 700,
        display: "flex", alignItems: "center", gap: 4,
      }}
    >
      ← {label}
    </button>
  );
}

// ── Mini CRM product preview ──────────────────────────────────────────────────

function MiniCRMPreview() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ flexShrink: 0 }}
    >
      <div
        className="ldg-crm-preview"
        style={{
          width: 310, flexShrink: 0,
          borderRadius: 12, overflow: "hidden",
          border: "1px solid #E9E2D7",
          boxShadow: "0 14px 40px rgba(23,26,28,0.16)",
          background: "#F6F1EA",
          pointerEvents: "none", userSelect: "none",
        }}
      >
        {/* Navbar */}
        <div style={{ background: "#FAFAF8", borderBottom: "1px solid #E9E2D7", padding: "5px 8px", display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 13, height: 13, background: "#171A1C", borderRadius: 3, flexShrink: 0 }} />
          <span style={{ fontSize: 7.5, fontWeight: 900, letterSpacing: "-0.04em", color: "#171A1C", marginRight: 4 }}>ALTTEZ</span>
          {["Inicio", "Entrenamiento", "Plantilla", "Calendario", "Reportes", "Mi Club"].map(t => (
            <span key={t} style={{ fontSize: 5.5, color: "#8A8580", marginRight: 3 }}>{t}</span>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 5.5, color: "#8A8580", marginRight: 4 }}>DEMO</span>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: "#C9973A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 6, color: "#fff", fontWeight: 800 }}>AD</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", height: 198 }}>
          {/* Sidebar */}
          <div style={{ width: 26, background: "#FAFAF8", borderRight: "1px solid #E9E2D7", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10, gap: 8 }}>
            {[true, false, false, false, false].map((active, i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: active ? "#C9973A" : "#E9E2D7" }} />
            ))}
          </div>

          {/* Main */}
          <div style={{ flex: 1, padding: "8px", overflow: "hidden" }}>
            <div style={{ fontSize: 7, fontWeight: 800, color: "#171A1C", marginBottom: 1 }}>Hola, Águilas de Lucero</div>
            <div style={{ fontSize: 5.5, color: "#8A8580", marginBottom: 7 }}>Temporada 2025–26</div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3, marginBottom: 7 }}>
              {[["18","Plantilla","Jugadores"],["7","Partidos","Próximos"],["5","Sesiones","Esta semana"],["82%","Asistencia","Promedio de"]].map(([v,l,s]) => (
                <div key={l} style={{ background: "#fff", border: "1px solid #E9E2D7", borderRadius: 5, padding: "4px 3px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#171A1C" }}>{v}</div>
                  <div style={{ fontSize: 4, color: "#8A8580" }}>{s}</div>
                  <div style={{ fontSize: 4.5, color: "#8A8580", fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Module cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 7 }}>
              {[
                ["Entrenamiento","Planifica sesiones, ejercicios y cargas de trabajo.","Entrar →"],
                ["Gestión de plantilla","Roles, contratos y planificación deportiva.","Ver plantilla →"],
              ].map(([t,s,cta]) => (
                <div key={t} style={{ borderRadius: 6, background: "linear-gradient(150deg,#1C1C1A,#2A2A28)", padding: "7px 6px" }}>
                  <div style={{ fontSize: 6, fontWeight: 800, color: "#fff" }}>{t}</div>
                  <div style={{ fontSize: 4.5, color: "rgba(255,255,255,0.55)", marginTop: 1, lineHeight: 1.4 }}>{s}</div>
                  <div style={{ marginTop: 5, fontSize: 5.5, color: "#C9973A", fontWeight: 700 }}>{cta}</div>
                </div>
              ))}
            </div>

            {/* Próximo evento */}
            <div style={{ background: "#fff", border: "1px solid #E9E2D7", borderRadius: 5, padding: "4px 6px", display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: "#F6F1EA", border: "1px solid #E9E2D7", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 7, color: "#C9973A" }}>◆</span>
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 4.5, color: "#8A8580", textTransform: "uppercase", letterSpacing: "0.04em" }}>Partido amistoso</div>
                  <div style={{ fontSize: 4.5, color: "#C9973A", fontWeight: 600 }}>Ver calendario →</div>
                </div>
                <div style={{ fontSize: 5.5, fontWeight: 700, color: "#171A1C", whiteSpace: "nowrap" }}>ÁGUILAS DE LUCERO vs DEPORTIVO SUR</div>
                <div style={{ fontSize: 4.5, color: "#8A8580" }}>Sáb 10 May · 17:00h · Campo A</div>
              </div>
            </div>

            {/* Financial */}
            <div style={{ background: "linear-gradient(135deg,#F6F1EA,#FDFDFB)", border: "1px solid #E9E2D7", borderRadius: 5, padding: "4px 6px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: "#fff", border: "1px solid #E9E2D7", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 7, color: "#C9973A" }}>$</span>
              </div>
              <div>
                <div style={{ fontSize: 5, color: "#8A8580", fontWeight: 600 }}>Salud financiera del club</div>
                <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                  {["Resumen general","Indicadores clave"].map(t => (
                    <span key={t} style={{ fontSize: 4.5, color: "#8A8580", background: "#fff", border: "1px solid #E9E2D7", borderRadius: 3, padding: "2px 4px" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Mini club list (Clubes card) ──────────────────────────────────────────────

const CLUB_AVATARS = [
  { bg: "rgba(201,151,58,0.18)", color: CU },
  { bg: "rgba(47,165,111,0.18)", color: "#2FA56F" },
  { bg: "rgba(91,139,245,0.18)", color: "#5B8BF5" },
  { bg: "rgba(217,92,92,0.18)", color: "#D95C5C" },
];

function MiniClubList() {
  return (
    <div className="ldg-mini-list" style={{ width: 176, flexShrink: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: PALETTE.text, marginBottom: 8 }}>Clubes</div>
      {[
        ["Club Atlético Norte","Primera División"],
        ["Deportivo Sur","Inferiores"],
        ["Unión Deportiva","Juveniles"],
        ["Escuela Central","Escuelita"],
      ].map(([name, cat], i) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 0", borderBottom: `1px solid ${PALETTE.border}` }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: CLUB_AVATARS[i].bg,
            border: `1px solid ${CLUB_AVATARS[i].color}44`,
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: CLUB_AVATARS[i].color }}>{name[0]}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: PALETTE.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
            <div style={{ fontSize: 9.5, color: PALETTE.textMuted }}>{cat}</div>
          </div>
          <div style={{ fontSize: 9, color: "#2FA56F", fontWeight: 700, background: "#EAF7F0", padding: "2px 6px", borderRadius: 999, flexShrink: 0 }}>Activo</div>
        </div>
      ))}
      <div style={{ marginTop: 8, fontSize: 10, color: CU, fontWeight: 700, cursor: "pointer" }}>Ver todos los clubes →</div>
    </div>
  );
}

// ── Mini fixture (Torneos card) ───────────────────────────────────────────────

const MATCH_AVATARS = [
  [{ bg: "rgba(201,151,58,0.18)", color: CU }, { bg: "rgba(47,165,111,0.18)", color: "#2FA56F" }],
  [{ bg: "rgba(91,139,245,0.18)", color: "#5B8BF5" }, { bg: "rgba(217,92,92,0.18)", color: "#D95C5C" }],
  [{ bg: "rgba(47,165,111,0.18)", color: "#2FA56F" }, { bg: "rgba(201,151,58,0.18)", color: CU }],
];

function MiniFixture() {
  return (
    <div className="ldg-mini-fixture" style={{ width: 192, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: PALETTE.text, lineHeight: 1.3 }}>Apertura 2024 · Cat. Sub 14</div>
        <span style={{ fontSize: 9.5, color: CU, fontWeight: 700, whiteSpace: "nowrap", cursor: "pointer" }}>Ver torneo público ↗</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${PALETTE.border}`, marginBottom: 7 }}>
        {["Próximos partidos","Resultados","Tabla de posiciones"].map((t, i) => (
          <div key={t} style={{
            fontSize: 8.5, fontWeight: i === 0 ? 700 : 400,
            color: i === 0 ? CU : PALETTE.textMuted,
            padding: "4px 7px",
            borderBottom: i === 0 ? `2px solid ${CU}` : "2px solid transparent",
            marginBottom: -1,
            whiteSpace: "nowrap",
          }}>{t}</div>
        ))}
      </div>

      {/* Matches */}
      {[
        ["C","Club Atlético Norte","D","Deportivo Sur","Sáb 10/05","17:00"],
        ["U","Unión Deportiva","E","Escuela Central","Sáb 10/05","17:00"],
        ["J","Juventud FC","DC","Deportivo Centro","Dom 11/05","09:00"],
      ].map(([hi, home, ai, away, date, time], idx) => (
        <div key={home} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 0", borderBottom: `1px solid ${PALETTE.border}` }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: MATCH_AVATARS[idx][0].bg, border: `1px solid ${MATCH_AVATARS[idx][0].color}44`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: MATCH_AVATARS[idx][0].color }}>{hi}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: PALETTE.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {home} <span style={{ color: PALETTE.textMuted, fontWeight: 400 }}>vs</span> {away}
            </div>
            <div style={{ fontSize: 8.5, color: PALETTE.textMuted }}>{date} · {time}</div>
          </div>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: MATCH_AVATARS[idx][1].bg, border: `1px solid ${MATCH_AVATARS[idx][1].color}44`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: MATCH_AVATARS[idx][1].color }}>{ai}</span>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 8, fontSize: 10, color: CU, fontWeight: 700, cursor: "pointer" }}>Ver fixture completo →</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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

  // ── LANDING ────────────────────────────────────────────────────────────────

  if (step === "landing") {
    return (
      <Shell>
        <TopBack onClick={() => navigate("/")} />

        <div className="ldg-auth-shell" style={{ display: "grid", gridTemplateColumns: "1.08fr 1fr", gap: 20, alignItems: "start" }}>

          {/* ── LEFT CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ boxShadow: "0 32px 80px rgba(23,26,28,0.13)" }}
            transition={{ duration: 0.58, ease: EASE }}
            className="ldg-card"
            style={{
              padding: "36px 34px 28px",
              borderRadius: 28,
              background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,248,0.96) 100%)",
              border: `1px solid ${PALETTE.border}`,
              boxShadow: "0 24px 64px rgba(23,26,28,0.10)",
            }}
          >
            {/* Brand header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <BrandSymbol />
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.06em", color: PALETTE.text }}>ALTTEZ</div>
                <div style={{ fontSize: 10.5, color: PALETTE.textMuted }}>Infraestructura operativa para clubes y torneos</div>
              </div>
            </div>

            {/* Badge with pulsing dot */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "6px 12px", borderRadius: 999,
              background: CU_SOFT, border: `1px solid ${CU_BORDER}`,
              color: PALETTE.text, fontSize: 10.5, fontWeight: 700, marginBottom: 20,
            }}>
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.55, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: CU, flexShrink: 0, display: "inline-block" }}
              />
              Nuevo ecosistema ALTTEZ
            </div>

            {/* Hero row: headline + preview */}
            <div className="ldg-hero-row" style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 24 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: "0 0 14px", fontSize: "clamp(26px, 2.8vw, 42px)", lineHeight: 0.95, letterSpacing: "-0.07em", color: PALETTE.text }}>
                  Una operación clara
                  <br />para clubes y torneos.
                </h1>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: PALETTE.textMuted }}>
                  Explora el entorno demo, registra tu organización o inicia un piloto con una experiencia más editorial, profesional y modular.
                </p>
              </div>
              <MiniCRMPreview />
            </div>

            {/* Module chips — staggered */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
              {[
                [<Users size={14} key="u" />, "Clubes", "Planifica, entrena y administra cada área del club con una visión integral."],
                [<Trophy size={14} key="t" />, "Torneos", "Crea competiciones, gestiona partidos, resultados y tablas en tiempo real."],
                [<Globe size={14} key="g" />, "Vista pública", "Calendarios, resultados y estadísticas con identidad profesional."],
              ].map(([icon, title, copy], i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.28 + i * 0.08, ease: EASE }}
                  whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(23,26,28,0.09)" }}
                  style={{ padding: "13px 11px", borderRadius: 14, background: "#FFFDFC", border: `1px solid ${PALETTE.border}`, cursor: "default" }}
                >
                  <div style={{ color: CU, marginBottom: 7 }}>{icon}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: PALETTE.text, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 10.5, color: PALETTE.textMuted, lineHeight: 1.55 }}>{copy}</div>
                </motion.div>
              ))}
            </div>

            {/* Benefits bar — staggered */}
            <div style={{ paddingTop: 16, borderTop: `1px solid ${PALETTE.border}`, display: "flex" }}>
              {[
                [<Layers size={12} key="l" />, "2 módulos", "Clubes y Torneos"],
                [<ShieldCheck size={12} key="s" />, "Gestión centralizada", "Datos y procesos unificados"],
                [<Monitor size={12} key="m" />, "Vista pública profesional", "Transparencia y comunicación"],
              ].map(([icon, title, sub], i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 + i * 0.09, ease: EASE }}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", gap: 8,
                    paddingLeft: i > 0 ? 14 : 0,
                    borderLeft: i > 0 ? `1px solid ${PALETTE.border}` : "none",
                    marginLeft: i > 0 ? 14 : 0,
                  }}
                >
                  <div style={{ color: CU, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: PALETTE.text }}>{title}</div>
                    <div style={{ fontSize: 9.5, color: PALETTE.textMuted }}>{sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN ── */}
          <motion.div
            className="ldg-right-col"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.07, ease: EASE }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >

            {/* ALTTEZ Clubes */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.10, ease: EASE }}
              whileHover={{ y: -3, boxShadow: "0 24px 56px rgba(23,26,28,0.12)" }}
              style={{
                padding: "22px 20px",
                borderRadius: 22,
                background: "#FFFFFF",
                border: `1px solid ${PALETTE.border}`,
                boxShadow: "0 16px 44px rgba(23,26,28,0.08)",
              }}
            >
              <div className="ldg-card-inner" style={{ display: "flex", gap: 18 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: CU, marginBottom: 7 }}>
                    ALTTEZ CLUBES
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text, marginBottom: 8 }}>
                    Gestionar clubes
                  </div>
                  <p style={{ margin: "0 0 11px", fontSize: 12, lineHeight: 1.65, color: PALETTE.textMuted }}>
                    Administra la operación interna de tu club o escuela deportiva desde un entorno claro y profesional.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 13 }}>
                    {["Plantilla","Entrenamiento","Administración"].map(c => (
                      <span key={c} style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textMuted, background: "#F6F1EA", border: `1px solid ${PALETTE.border}`, borderRadius: 999, padding: "3px 8px" }}>{c}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <motion.button
                      onClick={onDemo}
                      whileHover={{ y: -1, boxShadow: "0 12px 28px rgba(201,151,58,0.34)" }}
                      whileTap={{ scale: 0.97 }}
                      transition={SPRING_FAST}
                      style={{ flex: 1, minHeight: 38, borderRadius: 10, border: "none", background: `linear-gradient(135deg,${CU},#A66F38)`, color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                    >
                      Explorar demo →
                    </motion.button>
                    <motion.button
                      onClick={() => setStep("register")}
                      whileHover={{ y: -1, borderColor: CU, color: CU }}
                      whileTap={{ scale: 0.97 }}
                      transition={SPRING_FAST}
                      style={{ flex: 1, minHeight: 38, borderRadius: 10, border: `1px solid ${PALETTE.border}`, background: "transparent", color: PALETTE.text, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                    >
                      <UserPlus size={12} /> Registrar club
                    </motion.button>
                  </div>
                </div>
                <MiniClubList />
              </div>
            </motion.div>

            {/* ALTTEZ Torneos — highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.18, ease: EASE }}
              whileHover={{ y: -3, boxShadow: `0 24px 56px rgba(201,151,58,0.22), 0 8px 24px rgba(23,26,28,0.08)` }}
              style={{
                padding: "22px 20px",
                borderRadius: 22,
                background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,248,244,0.97) 100%)",
                border: `1.5px solid ${CU_BORDER}`,
                boxShadow: `0 16px 44px ${CU_SOFT}, 0 8px 24px rgba(23,26,28,0.06)`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle copper shimmer accent */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${CU}, transparent)`,
                opacity: 0.6,
              }} />

              {/* MÓDULO DESTACADO badge */}
              <motion.div
                animate={{ opacity: [0.85, 1, 0.85] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: 13, right: 13,
                  fontSize: 8.5, fontWeight: 800, letterSpacing: "0.08em",
                  color: CU, background: "rgba(244,231,207,0.92)",
                  border: `1px solid ${CU_BORDER}`, borderRadius: 999,
                  padding: "3px 9px", display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <Star size={8} fill="currentColor" /> MÓDULO DESTACADO
              </motion.div>

              <div className="ldg-card-inner" style={{ display: "flex", gap: 18 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: CU, marginBottom: 7 }}>
                    ALTTEZ TORNEOS
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text, marginBottom: 8 }}>
                    Gestionar torneos
                  </div>
                  <p style={{ margin: "0 0 11px", fontSize: 12, lineHeight: 1.65, color: PALETTE.textMuted }}>
                    Organiza torneos con fixture, resultados, tabla de posiciones y vista pública profesional.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 13 }}>
                    {["Fixture","Resultados","Tabla","Vista pública"].map(c => (
                      <span key={c} style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textMuted, background: "#F6F1EA", border: `1px solid ${CU_BORDER}`, borderRadius: 999, padding: "3px 8px" }}>{c}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <motion.button
                      onClick={onDemo}
                      whileHover={{ y: -1, boxShadow: "0 12px 28px rgba(201,151,58,0.34)" }}
                      whileTap={{ scale: 0.97 }}
                      transition={SPRING_FAST}
                      style={{ flex: 1, minHeight: 38, borderRadius: 10, border: "none", background: `linear-gradient(135deg,${CU},#A66F38)`, color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                    >
                      Explorar demo →
                    </motion.button>
                    {/* TODO: navigate to /torneos/piloto when Torneos module ships */}
                    <motion.button
                      onClick={() => navigate("/contacto")}
                      whileHover={{ y: -1, background: CU_SOFT }}
                      whileTap={{ scale: 0.97 }}
                      transition={SPRING_FAST}
                      style={{ flex: 1, minHeight: 38, borderRadius: 10, border: `1.5px solid ${CU_BORDER}`, background: "transparent", color: CU, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                    >
                      Solicitar piloto
                    </motion.button>
                  </div>
                </div>
                <MiniFixture />
              </div>
            </motion.div>

            {/* Ya tengo cuenta */}
            {isSupabaseReady && (
              <motion.button
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, delay: 0.26, ease: EASE }}
                whileHover={{ y: -2, boxShadow: "0 12px 32px rgba(23,26,28,0.10)", borderColor: CU_BORDER }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep("login")}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 20px", borderRadius: 18,
                  border: `1px solid ${PALETTE.border}`,
                  background: "rgba(255,255,255,0.84)",
                  cursor: "pointer", textAlign: "left",
                  width: "100%", boxSizing: "border-box",
                  boxShadow: "0 4px 16px rgba(23,26,28,0.05)",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "#F6F1EA", border: `1px solid ${PALETTE.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <User size={18} color={CU} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: PALETTE.text }}>Ya tengo cuenta</div>
                  <div style={{ fontSize: 12, color: PALETTE.textMuted }}>Ingresar a mi espacio ALTTEZ</div>
                </div>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight size={18} color={CU} />
                </motion.div>
              </motion.button>
            )}
          </motion.div>
        </div>
      </Shell>
    );
  }

  // ── REGISTER ───────────────────────────────────────────────────────────────

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

  // ── LOGIN ──────────────────────────────────────────────────────────────────

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
