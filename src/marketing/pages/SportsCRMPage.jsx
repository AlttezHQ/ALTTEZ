import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Home, Users, Zap, Calendar, DollarSign, BarChart2, Settings,
  Bell, Shield, Cloud, Building2, CheckCircle,
} from "lucide-react";
import { usePageTitle } from "../../shared/hooks/usePageTitle";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G, MARKETING_FONTS as F } from "../theme/brand";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ECOSYSTEM_CARDS = [
  {
    label: "ALTTEZ CRM",
    tag: "Core Platform",
    description: "Operación integral del club, coordinación diaria del cuerpo técnico y administración centralizada.",
  },
  {
    label: "ALTTEZ Journal",
    tag: "Seguimiento",
    description: "Registro y seguimiento de rendimiento, bitácora del deportista y análisis de carga.",
  },
  {
    label: "ALTTEZ Advisory",
    tag: "Estrategia",
    description: "Acompañamiento para organizaciones que buscan profesionalizar su operación.",
  },
];

const MODULES = [
  { Icon: Zap,          label: "Entrenamiento", body: "Planificación y control de sesiones" },
  { Icon: Users,        label: "Plantilla",     body: "Gestión del plantel y roles" },
  { Icon: Calendar,     label: "Calendario",    body: "Agenda y coordinación del club" },
  { Icon: DollarSign,   label: "Finanzas",      body: "Pagos, cuotas y reportes" },
  { Icon: BarChart2,    label: "Rendimiento",   body: "Métricas y análisis del equipo" },
];

const TRUST = [
  { Icon: Shield,       label: "Datos seguros",          body: "Información protegida con altos estándares" },
  { Icon: Cloud,        label: "Acceso en la nube",       body: "Disponible desde cualquier dispositivo" },
  { Icon: Building2,    label: "Multi-club",              body: "Escala con tu organización" },
  { Icon: CheckCircle,  label: "Confiable y profesional", body: "Diseñado para proyectos deportivos serios" },
];

const PLAYERS = [
  { name: "Franco Rossi",  pos: "DEL", pct: 87 },
  { name: "Omar Farías",   pos: "MED", pct: 92 },
  { name: "Diego Herrera", pos: "DEF", pct: 74 },
  { name: "Matías López",  pos: "POR", pct: 95 },
];

const BAR_DATA = [65, 80, 72, 85, 90, 88, 92];
const CAL_DAYS = [null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26];

const SIDEBAR_ICONS = [Home, Users, Zap, Calendar, DollarSign, BarChart2, Settings];

// ─── CRM Preview ──────────────────────────────────────────────────────────────

function CRMPreview() {
  // Donut geometry for r=17 (44x44 viewBox)
  const R = 17;
  const CIRC = 2 * Math.PI * R; // 106.81

  return (
    <div style={{
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid rgba(0,0,0,0.09)",
      background: "#FFFFFF",
      boxShadow: "0 32px 80px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        background: "#F7F6F3",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src="/branding/alttez-symbol-transparent.png" alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />
          <span style={{ color: "#0F0F0F", fontSize: 10, fontWeight: 800, letterSpacing: "1.4px" }}>ALTTEZ</span>
        </div>
        <span style={{ color: "#6B7280", fontSize: 9 }}>Bienvenido, Entrenador</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={12} color="#9CA3AF" />
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: G.button,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 8, fontWeight: 800,
          }}>E</div>
        </div>
      </div>

      {/* 3-col body: sidebar | main | right */}
      <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 112px" }}>

        {/* Sidebar — dark charcoal */}
        <div style={{
          background: "#1A1A1A",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "10px 0",
          display: "flex", flexDirection: "column", gap: 2, alignItems: "center",
        }}>
          {SIDEBAR_ICONS.map((Icon, i) => (
            <div key={i} style={{
              width: 26, height: 26, borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: i === 1 ? "rgba(201,151,58,0.90)" : "transparent",
            }}>
              <Icon size={12} color={i === 1 ? "#FFFFFF" : "rgba(255,255,255,0.35)"} strokeWidth={1.5} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, borderRight: "1px solid rgba(0,0,0,0.06)" }}>

          {/* Plantel activo */}
          <div>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>
              Plantel activo
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {PLAYERS.map((p, i) => (
                <div key={p.name} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "5px 8px", borderRadius: 8,
                  background: i === 1 ? "rgba(201,151,58,0.09)" : "#F7F6F3",
                  border: i === 1 ? "1px solid rgba(201,151,58,0.22)" : "1px solid transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: i === 1 ? G.button : "#E5E7EB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 7, fontWeight: 800,
                      color: i === 1 ? "white" : "#6B7280",
                    }}>{p.name[0]}</div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#0F0F0F", lineHeight: 1 }}>{p.name}</div>
                      <div style={{ fontSize: 7, color: "#9CA3AF" }}>{p.pos}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 50, height: 3, borderRadius: 2, background: "#E5E7EB", overflow: "hidden" }}>
                      <div style={{ width: `${p.pct}%`, height: "100%", background: "#C9973A" }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#0F0F0F" }}>{p.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asistencia chart */}
          <div style={{ padding: "8px 10px", borderRadius: 10, background: "#F7F6F3", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
              Asistencia a entrenos
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 28 }}>
              {BAR_DATA.map((v, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: "3px 3px 0 0",
                  background: i === BAR_DATA.length - 1 ? "#C9973A" : "rgba(201,151,58,0.28)",
                  height: `${(v / 100) * 100}%`,
                }} />
              ))}
            </div>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#0F0F0F" }}>92%</span>
              <span style={{ fontSize: 8, color: "#16A34A", fontWeight: 600 }}>↑ Última sesión</span>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>

          {/* ALTTEZ Score */}
          <div style={{ padding: "8px 10px", borderRadius: 10, background: "#F7F6F3", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px" }}>ALTTEZ Score</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#C9973A", lineHeight: 1.1, marginTop: 2 }}>18</div>
          </div>

          {/* Calendario */}
          <div style={{ padding: "8px 10px", borderRadius: 10, background: "#F7F6F3", border: "1px solid rgba(0,0,0,0.06)", flex: 1 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5 }}>Calendario</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
              {["L","M","X","J","V","S","D"].map(d => (
                <div key={d} style={{ fontSize: 5.5, color: "#9CA3AF", textAlign: "center" }}>{d}</div>
              ))}
              {CAL_DAYS.map((d, i) => (
                <div key={i} style={{
                  fontSize: 6.5, textAlign: "center", borderRadius: 3, padding: "1px 0",
                  background: d === 18 ? "#C9973A" : "transparent",
                  color: d === 18 ? "white" : d ? "#0F0F0F" : "transparent",
                  fontWeight: d === 18 ? 800 : 400,
                }}>{d || ""}</div>
              ))}
            </div>
          </div>

          {/* Rendimiento — donut 42x42 */}
          <div style={{ padding: "8px 10px", borderRadius: 10, background: "#F7F6F3", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5 }}>Rendimiento</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ position: "relative", width: 42, height: 42, flexShrink: 0 }}>
                <svg viewBox="0 0 44 44" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                  <circle cx="22" cy="22" r={R} fill="none" stroke="#E5E7EB" strokeWidth="4.5" />
                  <circle cx="22" cy="22" r={R} fill="none" stroke="#C9973A" strokeWidth="4.5"
                    strokeDasharray={`${0.72 * CIRC} ${CIRC}`} strokeLinecap="round" />
                </svg>
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: "#0F0F0F" }}>72%</span>
              </div>
              <span style={{ fontSize: 8, color: "#6B7280" }}>del equipo</span>
            </div>
          </div>

          {/* Pagos del mes */}
          <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(201,151,58,0.09)", border: "1px solid rgba(201,151,58,0.22)" }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px" }}>Pagos del mes</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0F0F0F", marginTop: 2 }}>$24,500</div>
            <div style={{ fontSize: 7, color: "#16A34A", fontWeight: 600, marginTop: 1 }}>12 al día</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SportsCRMPage() {
  const navigate = useNavigate();
  usePageTitle("ALTTEZ CRM — Plataforma deportiva integral");

  return (
    <div style={{ overflowX: "hidden", background: B.bg }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 32px 48px" }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.75fr) minmax(0, 1.25fr)",
          gap: 48,
          alignItems: "center",
        }}>

          {/* Left text */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <div style={{ width: 14, height: 2, background: B.primary, borderRadius: 1, flexShrink: 0 }} />
              <span style={{ color: B.primary, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.8px" }}>
                SOFTWARE DEPORTIVO TODO EN UNO
              </span>
            </div>

            <h1 style={{
              margin: "0 0 16px",
              color: B.text,
              fontSize: "clamp(36px, 3.4vw, 50px)",
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              fontFamily: F.display,
            }}>
              Eleva la gestión<br />
              <span style={{ color: B.primary }}>de tu club.</span>
            </h1>

            <p style={{ margin: "0 0 26px", maxWidth: 380, color: B.textMuted, fontSize: 14, lineHeight: 1.7 }}>
              Jugadores, entrenamiento, calendario, pagos y rendimiento en una sola plataforma profesional.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: `0 10px 28px ${B.primaryGlow}` }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/contacto")}
                style={{
                  padding: "12px 22px", borderRadius: 10,
                  border: "none", background: G.button,
                  color: "white", fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Solicitar demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/crm?demo=true")}
                style={{
                  padding: "12px 22px", borderRadius: 10,
                  border: `1px solid ${B.borderStrong}`,
                  background: "transparent",
                  color: B.text, fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Ver plataforma
              </motion.button>
            </div>
          </motion.div>

          {/* Right — dashboard with atmospheric bg */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ position: "relative" }}
          >
            {/* Atmospheric stadium background */}
            <div style={{
              position: "absolute",
              inset: "-20px -16px",
              backgroundImage: "url('/brand/hero-stadium-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 28,
              opacity: 0.07,
              filter: "blur(4px)",
              pointerEvents: "none",
            }} />
            <CRMPreview />
          </motion.div>
        </div>
      </section>

      {/* ── ECOSISTEMA STRIP ─────────────────────────────────── */}
      <section style={{ padding: "0 32px 32px" }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr 1.6fr",
          gap: 28,
          padding: "36px 36px",
          borderRadius: 18,
          background: B.bgAlt,
          border: `1px solid ${B.border}`,
          alignItems: "start",
        }}>
          {/* Col 1: statement */}
          <div>
            <div style={{ color: B.primary, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>
              Ecosistema ALTTEZ
            </div>
            <p style={{ margin: 0, color: B.text, fontSize: 16, fontWeight: 800, lineHeight: 1.4 }}>
              Una marca.<br />Un sistema.<br />Un ecosistema<br />con criterio.
            </p>
          </div>

          {/* Col 2: description */}
          <div style={{ paddingTop: 4 }}>
            <p style={{ margin: "0 0 14px", color: B.textMuted, fontSize: 12, lineHeight: 1.75 }}>
              ALTTEZ no es solo un acceso tecnológico. Es la capa que ordena cómo tu organización opera, comunica y compite, con la misma propiedad que un proyecto deportivo serio amerita.
            </p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {["Datos seguros", "Acceso en la nube", "Multi-club"].map(tag => (
                <span key={tag} style={{
                  padding: "4px 9px", borderRadius: 999,
                  background: "#FFFFFF", border: `1px solid ${B.border}`,
                  color: B.textMuted, fontSize: 9, fontWeight: 600,
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Col 3: product cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {ECOSYSTEM_CARDS.map((product) => (
              <div key={product.label} style={{
                display: "grid", gridTemplateColumns: "28px 1fr", gap: 10, alignItems: "start",
                padding: "11px 13px", borderRadius: 12,
                background: "#FFFFFF", border: `1px solid ${B.border}`,
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: B.primarySoft, border: "1px solid rgba(201,151,58,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src="/branding/alttez-symbol-transparent.png" alt="" style={{ width: 13, height: 13, objectFit: "contain" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: B.text, marginBottom: 2 }}>{product.label}</div>
                  <div style={{ fontSize: 9, color: B.textMuted, lineHeight: 1.55 }}>{product.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ROW ──────────────────────────────────────── */}
      <section style={{ padding: "0 32px 28px" }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10,
        }}>
          {MODULES.map(({ Icon, label, body }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              style={{
                padding: "20px 16px",
                borderRadius: 14,
                background: "#FFFFFF",
                border: `1px solid ${B.border}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8, marginBottom: 10,
                background: "rgba(201,151,58,0.10)",
                border: "1px solid rgba(201,151,58,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={14} color="#C9973A" strokeWidth={1.75} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: B.text, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 10, color: B.textMuted, lineHeight: 1.5 }}>{body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRUST ROW ────────────────────────────────────────── */}
      <section style={{ padding: "0 32px 56px" }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          borderTop: `1px solid ${B.border}`,
          paddingTop: 22,
        }}>
          {TRUST.map(({ Icon, label, body }) => (
            <div key={label} style={{ display: "flex", alignItems: "start", gap: 10, padding: "10px 12px" }}>
              <Icon size={16} color="#C9973A" strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: B.text, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 10, color: B.textMuted, lineHeight: 1.5 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
