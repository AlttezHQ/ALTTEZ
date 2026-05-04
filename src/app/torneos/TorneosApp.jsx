import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy, Globe, Users, User, Plus, Tag, Calendar,
  BarChart2, Settings, Home, LogOut, List, Download,
  ArrowRight, CheckCircle,
} from "lucide-react";
import { PALETTE, ELEVATION } from "../../shared/tokens/palette";

const CU        = PALETTE.bronce;
const CU_BORDER = PALETTE.bronceBorder;
const CU_DIM    = PALETTE.bronceDim;
const CU_FOCUS  = PALETTE.bronceFocus;
const BG        = PALETTE.bg;
const CARD      = PALETTE.surface;
const TEXT      = PALETTE.text;
const MUTED     = PALETTE.textMuted;
const HINT      = PALETTE.textHint;
const BORDER    = PALETTE.border;
const ELEV      = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const EASE      = [0.22, 1, 0.36, 1];
const BRAND_SYMBOL = "/branding/alttez-symbol-transparent.png";
const FONT      = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

// ── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "inicio",      icon: Home,      label: "Inicio" },
  { id: "torneos",     icon: Trophy,    label: "Torneos" },
  { id: "equipos",     icon: Users,     label: "Equipos" },
  { id: "categorias",  icon: Tag,       label: "Categorías" },
  { id: "calendario",  icon: Calendar,  label: "Calendario" },
  { id: "estadisticas",icon: BarChart2, label: "Estadísticas" },
  { id: "fixtures",    icon: List,      label: "Fixtures" },
  { id: "publica",     icon: Globe,     label: "Vista pública" },
  { id: "ajustes",     icon: Settings,  label: "Ajustes" },
];

function TorneosSidebar({ active, onNav }) {
  return (
    <div style={{
      width: 220, flexShrink: 0, background: CARD,
      borderRight: `1px solid ${BORDER}`,
      display: "flex", flexDirection: "column",
      fontFamily: FONT, height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: "20px 16px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <img src={BRAND_SYMBOL} alt="ALTTEZ" style={{ width: 26, height: 26, objectFit: "contain" }} />
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: TEXT }}>ALTTEZ</span>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
          background: CU_DIM, color: CU, border: `1px solid ${CU_BORDER}`,
          borderRadius: 4, padding: "2px 6px", marginLeft: 2,
        }}>TORNEOS</span>
      </div>
      <div style={{ height: 1, background: BORDER, margin: "0 12px 8px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 8px", overflow: "auto" }}>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              whileHover={{ x: 2 }}
              onClick={() => onNav(id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                background: isActive ? CU_DIM : "transparent",
                color: isActive ? CU : MUTED,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                fontFamily: FONT, textAlign: "left",
                borderLeft: isActive ? `2px solid ${CU}` : "2px solid transparent",
                marginBottom: 1, transition: "background 0.15s",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}` }}>
        <span style={{ fontSize: 11, color: HINT, fontFamily: FONT }}>v2.0 · Torneos</span>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function TorneosHeader({ onLogout }) {
  return (
    <div style={{
      height: 56, background: CARD, borderBottom: `1px solid ${BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0, fontFamily: FONT,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Trophy size={18} color={CU} />
        <span style={{ fontWeight: 700, fontSize: 14, color: TEXT, letterSpacing: "-0.01em" }}>Torneos</span>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          background: CU_DIM, color: CU, border: `1px solid ${CU_BORDER}`,
          borderRadius: 4, padding: "2px 7px",
        }}>ALTTEZ</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          background: BG, border: `1px solid ${BORDER}`,
          borderRadius: 8, padding: "5px 10px",
        }}>
          <User size={13} color={MUTED} />
          <span style={{ fontSize: 12, color: TEXT, fontWeight: 500, fontFamily: FONT }}>Administrador</span>
        </div>
        <div style={{ width: 1, height: 20, background: BORDER }} />
        <motion.button
          whileHover={{ opacity: 0.75 }}
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: MUTED, fontSize: 12, fontFamily: FONT, padding: 0,
          }}
        >
          <LogOut size={13} />
          Cerrar sesión
        </motion.button>
      </div>
    </div>
  );
}

// ── MiniTorneosPreview ────────────────────────────────────────────────────────

function MiniTorneosPreview() {
  const rounds = [
    { label: "Cuartos", matches: 4 },
    { label: "Semis",   matches: 2 },
    { label: "Final",   matches: 1 },
  ];
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background: CARD, borderRadius: 10, padding: "14px 16px",
        boxShadow: ELEV, border: `1px solid ${BORDER}`,
        width: 210, flexShrink: 0, fontFamily: FONT,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: CU, letterSpacing: "0.08em", marginBottom: 10 }}>
        FIXTURE · FASE ELIMINATORIA
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        {rounds.map(({ label, matches }) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: HINT, fontWeight: 600, marginBottom: 5, letterSpacing: "0.06em" }}>
              {label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Array.from({ length: matches }).map((_, i) => (
                <div key={i} style={{
                  height: 20, background: BG, borderRadius: 4,
                  border: `1px solid ${BORDER}`, display: "flex",
                  alignItems: "center", padding: "0 6px", gap: 4,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: CU_DIM, border: `1px solid ${CU_BORDER}` }} />
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: BORDER }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 10, height: 1, background: `linear-gradient(90deg, ${CU_BORDER}, transparent)`,
      }} />
      <div style={{ marginTop: 6, fontSize: 9, color: CU, fontWeight: 600, letterSpacing: "0.06em" }}>
        ● EN PROGRESO
      </div>
    </motion.div>
  );
}

// ── WelcomeCard ───────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Crear torneo" },
  { label: "Agregar equipos" },
  { label: "Configurar fases" },
  { label: "Publicar" },
];

function WelcomeCard({ onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      style={{
        flex: 1, background: CARD, borderRadius: 16,
        boxShadow: ELEV, border: `1px solid ${BORDER}`,
        padding: 32, display: "flex", flexDirection: "column",
        gap: 20, minWidth: 0, overflow: "hidden",
      }}
    >
      {/* Top row: text left, preview right */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            margin: 0, fontSize: 28, fontWeight: 700, color: TEXT,
            lineHeight: 1.15, letterSpacing: "-0.02em", fontFamily: FONT,
          }}>
            Bienvenido a<br />ALTTEZ Torneos
          </h1>
          <p style={{
            margin: "10px 0 0", fontSize: 14, color: MUTED,
            lineHeight: 1.6, fontFamily: FONT,
          }}>
            Gestiona torneos, fases y fixtures desde un solo lugar.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCreate}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: CU, color: "#FFF", border: "none", borderRadius: 8,
                padding: "9px 18px", fontSize: 13, fontWeight: 600,
                fontFamily: FONT, cursor: "pointer", letterSpacing: "-0.01em",
              }}
            >
              <Plus size={14} />
              Crear torneo
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "transparent", color: CU,
                border: `1px solid ${CU_BORDER}`, borderRadius: 8,
                padding: "9px 18px", fontSize: 13, fontWeight: 600,
                fontFamily: FONT, cursor: "pointer",
              }}
            >
              <Download size={14} />
              Importar datos
            </motion.button>
          </div>
        </div>
        <MiniTorneosPreview />
      </div>

      {/* 4-step strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        borderTop: `1px solid ${BORDER}`, paddingTop: 18,
      }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: i === 0 ? CU : CU_DIM,
                border: `1.5px solid ${i === 0 ? CU : CU_BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {i === 0
                  ? <CheckCircle size={12} color="#FFF" />
                  : <span style={{ fontSize: 10, fontWeight: 700, color: CU }}>{i + 1}</span>
                }
              </div>
              <span style={{
                fontSize: 11, fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? TEXT : HINT, fontFamily: FONT,
                whiteSpace: "nowrap",
              }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 1.5, margin: "0 8px",
                background: `linear-gradient(90deg, ${CU_BORDER}, ${BORDER})`,
              }} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── WizardCard ────────────────────────────────────────────────────────────────

const SPORTS = ["Fútbol", "Básquet", "Vóleibol", "Tenis", "Pádel", "Otro"];
const FORMATS = ["Todos contra todos", "Eliminación directa", "Grupos + Playoffs", "Mixto"];

function WizardCard({ onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
      style={{
        width: 384, flexShrink: 0, background: CARD,
        borderRadius: 16, boxShadow: ELEV, border: `1px solid ${BORDER}`,
        padding: 28, fontFamily: FONT,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>
          Crear tu primer torneo
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          background: CU_DIM, color: CU, border: `1px solid ${CU_BORDER}`,
          borderRadius: 4, padding: "3px 8px",
        }}>
          Paso 1 de 4
        </span>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
        {[1, 2, 3, 4].map((n, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              background: n === 1 ? CU : "transparent",
              border: `2px solid ${n === 1 ? CU : BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: n === 1 ? "#FFF" : HINT,
              }}>{n}</span>
            </div>
            {i < 3 && (
              <div style={{ flex: 1, height: 1.5, background: BORDER, margin: "0 4px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Form fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Nombre */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>
            NOMBRE DEL TORNEO
          </label>
          <input
            type="text"
            placeholder="Ej: Copa Primavera 2026"
            style={{
              width: "100%", boxSizing: "border-box",
              border: `1px solid ${BORDER}`, borderRadius: 8,
              padding: "9px 12px", fontSize: 13, color: TEXT,
              fontFamily: FONT, background: BG, outline: "none",
            }}
          />
        </div>
        {/* Deporte */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>
            DEPORTE
          </label>
          <select style={{
            width: "100%", boxSizing: "border-box",
            border: `1px solid ${BORDER}`, borderRadius: 8,
            padding: "9px 12px", fontSize: 13, color: TEXT,
            fontFamily: FONT, background: BG, outline: "none", appearance: "none",
          }}>
            <option value="">Seleccionar deporte</option>
            {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Formato */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>
            FORMATO
          </label>
          <select style={{
            width: "100%", boxSizing: "border-box",
            border: `1px solid ${BORDER}`, borderRadius: 8,
            padding: "9px 12px", fontSize: 13, color: TEXT,
            fontFamily: FONT, background: BG, outline: "none", appearance: "none",
          }}>
            <option value="">Seleccionar formato</option>
            {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        {/* Fecha */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>
            FECHA DE INICIO
          </label>
          <input
            type="date"
            style={{
              width: "100%", boxSizing: "border-box",
              border: `1px solid ${BORDER}`, borderRadius: 8,
              padding: "9px 12px", fontSize: 13, color: TEXT,
              fontFamily: FONT, background: BG, outline: "none",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCreate}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            background: CU, color: "#FFF", border: "none", borderRadius: 8,
            padding: "11px 18px", fontSize: 13, fontWeight: 600,
            fontFamily: FONT, cursor: "pointer",
          }}
        >
          Continuar
          <ArrowRight size={14} />
        </motion.button>
        <button style={{
          background: "none", border: "none", color: MUTED,
          fontSize: 12, fontFamily: FONT, cursor: "pointer", padding: "4px 0",
        }}>
          Guardar borrador
        </button>
      </div>
    </motion.div>
  );
}

// ── InfoCards ─────────────────────────────────────────────────────────────────

const INFO_CARDS = [
  { icon: Globe,     title: "Página pública",       desc: "Comparte el torneo con una URL pública" },
  { icon: BarChart2, title: "Estadísticas",          desc: "Rendimiento de equipos y jugadores en tiempo real" },
  { icon: Users,     title: "Gestión de equipos",    desc: "Administra equipos, jugadores y cuerpos técnicos" },
];

function InfoCards() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
      gap: 14, marginTop: 20,
    }}>
      {INFO_CARDS.map(({ icon: Icon, title, desc }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.25 + i * 0.07 }}
          style={{
            background: CARD, borderRadius: 12,
            border: `1px solid ${BORDER}`, padding: 20,
            fontFamily: FONT,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: CU_DIM,
            border: `1px solid ${CU_BORDER}`, display: "flex",
            alignItems: "center", justifyContent: "center", marginBottom: 12,
          }}>
            <Icon size={16} color={CU} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{desc}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ── EmptyStateBlock ───────────────────────────────────────────────────────────

function EmptyStateBlock({ onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.4 }}
      style={{
        marginTop: 40, padding: "48px 0",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        fontFamily: FONT,
      }}
    >
      <Trophy size={40} color={CU} style={{ opacity: 0.35 }} />
      <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginTop: 4 }}>
        Aún no hay torneos creados
      </div>
      <div style={{ fontSize: 13, color: MUTED, textAlign: "center", maxWidth: 360, lineHeight: 1.6 }}>
        Crea tu primer torneo para comenzar a gestionar competencias.
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onCreate}
        style={{
          marginTop: 8, display: "flex", alignItems: "center", gap: 7,
          background: "transparent", color: CU,
          border: `1px solid ${CU_BORDER}`, borderRadius: 8,
          padding: "9px 20px", fontSize: 13, fontWeight: 600,
          fontFamily: FONT, cursor: "pointer",
        }}
      >
        <Plus size={14} />
        Crear torneo
      </motion.button>
    </motion.div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function TorneosApp() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("torneos");

  const handleCreate = () => {
    // Navigate to creation wizard once implemented
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: BG,
      fontFamily: FONT,
    }}>
      <TorneosSidebar active={activeNav} onNav={setActiveNav} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TorneosHeader onLogout={() => navigate("/")} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px 48px" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <WelcomeCard onCreate={handleCreate} />
            <WizardCard onCreate={handleCreate} />
          </div>
          <InfoCards />
          <EmptyStateBlock onCreate={handleCreate} />
        </main>
      </div>
    </div>
  );
}
