import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Download, CheckCircle, Trophy, Globe,
  BarChart2, Users, Calendar, Clock, MapPin, ArrowRight,
  Pencil, ChevronRight, Settings, Upload, FileDown,
  Shirt, LayoutGrid, Zap,
} from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";

// ── Tokens ────────────────────────────────────────────────────────────────────
const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD   = PALETTE.surface;
const BG     = PALETTE.bg;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const HINT   = PALETTE.textHint;
const BORDER = PALETTE.border;
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE   = [0.22, 1, 0.36, 1];

const ELEV_SM  = "0 1px 4px rgba(23,26,28,0.06), 0 2px 8px rgba(23,26,28,0.04)";
const ELEV_MD  = "0 4px 16px rgba(23,26,28,0.08), 0 1px 4px rgba(23,26,28,0.04)";
const ELEV_CU  = `0 4px 16px ${CU}22, 0 1px 4px ${CU}11`;

const FORMATO_LABELS = {
  todos_contra_todos: "Liga",
  eliminacion: "Eliminación",
  grupos_playoffs: "Grupos + Playoffs",
};

const STEPS_STRIP = ["Crear torneo", "Agregar equipos", "Configurar fases", "Publicar"];

// ── Spring animation preset ───────────────────────────────────────────────────
const spring = { type: "spring", stiffness: 380, damping: 30 };
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: EASE, delay },
});

// ── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ value, label, icon: Icon, iconColor, iconBg }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: ELEV_MD }}
      transition={spring}
      style={{
        flex: "0 1 auto", minWidth: 100,
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", background: CARD, borderRadius: 12,
        border: `1px solid ${BORDER}`, boxShadow: ELEV_SM, cursor: "default",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 9, background: iconBg, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={16} color={iconColor} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: iconColor, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 9, color: HINT, fontWeight: 700, marginTop: 3, letterSpacing: "0.07em" }}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}

// ── Meta pill row ─────────────────────────────────────────────────────────────
function MetaRow({ torneo }) {
  const items = [
    torneo.temporada  && { label: "Año",         value: torneo.temporada },
    torneo.formato    && { label: "Formato",      value: FORMATO_LABELS[torneo.formato] ?? torneo.formato },
    torneo.sedePrincipal && { label: "Sede",      value: torneo.sedePrincipal },
    torneo.organizador   && { label: "Organizador", value: torneo.organizador },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18, marginTop: 6 }}>
      {items.map(({ label, value }) => (
        <div key={label} style={{
          display: "flex", alignItems: "center", gap: 5,
          background: BG, border: `1px solid ${BORDER}`,
          borderRadius: 8, padding: "4px 10px",
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: HINT, letterSpacing: "0.06em" }}>
            {label.toUpperCase()}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Check Item ────────────────────────────────────────────────────────────────
function CheckItem({ done, label, sublabel, actionLabel, onAction, delay = 0 }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 0", borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {/* Indicator */}
      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        background: done ? CU : "transparent",
        border: `2px solid ${done ? CU : BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.25s",
      }}>
        <AnimatePresence>
          {done && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={spring}
            >
              <CheckCircle size={13} color="#FFF" strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: done ? 600 : 500,
          color: done ? TEXT : MUTED,
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: 11, color: HINT, marginTop: 1, lineHeight: 1.4 }}>{sublabel}</div>
        )}
      </div>

      {/* Right */}
      {done
        ? <ChevronRight size={14} color={BORDER} style={{ flexShrink: 0 }} />
        : actionLabel
          ? (
            <motion.button
              whileHover={{ scale: 1.04, background: CU_DIM }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              onClick={onAction}
              style={{
                flexShrink: 0, background: "transparent", color: CU,
                border: `1.5px solid ${CU_BOR}`, borderRadius: 8,
                padding: "5px 14px", fontSize: 11, fontWeight: 700,
                fontFamily: FONT, cursor: "pointer", whiteSpace: "nowrap",
                transition: "background 0.15s",
              }}
            >
              {actionLabel}
            </motion.button>
          )
          : null
      }
    </motion.div>
  );
}

// ── Info Cards ────────────────────────────────────────────────────────────────
function InfoCards({ onInfoClick }) {
  const cards = [
    {
      icon: Globe, title: "Página pública",
      desc: "Comparte el torneo con una URL pública.",
      mod: "publica", cta: "Ver página",
      iconColor: "#3B82F6", iconBg: "#EFF6FF",
    },
    {
      icon: BarChart2, title: "Estadísticas",
      desc: "Rendimiento de equipos y jugadores en tiempo real",
      mod: "estadisticas", cta: "Ver estadísticas",
      iconColor: CU, iconBg: CU_DIM,
    },
    {
      icon: Users, title: "Gestión de equipos",
      desc: "Administra equipos, jugadores y cuerpos técnicos",
      mod: "equipos", cta: "Ir a gestión",
      iconColor: "#8B5CF6", iconBg: "#F5F3FF",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" style={{ marginTop: "40px" }}>
      {cards.map(({ icon: Icon, title, desc, mod, cta, iconColor, iconBg }, i) => (
        <motion.div
          key={title}
          {...fadeUp(0.12 + i * 0.05)}
          whileHover={{ y: -1, boxShadow: ELEV_MD }}
          transition={spring}
          onClick={() => onInfoClick(mod)}
          style={{
            background: CARD, borderRadius: 8, border: `1px solid ${BORDER}`,
            padding: "10px 12px", fontFamily: FONT, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10, boxShadow: ELEV_SM,
          }}
        >
          {/* Icon */}
          <div style={{
            width: 26, height: 26, borderRadius: 6, background: iconBg, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={12} color={iconColor} />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, marginBottom: 1 }}>{title}</div>
            <div style={{
              fontSize: 10, color: MUTED, lineHeight: 1.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{desc}</div>
          </div>

          {/* CTA */}
          <motion.div
            whileHover={{ x: 2 }}
            transition={spring}
            style={{ display: "flex", alignItems: "center", gap: 2, color: CU, fontSize: 10, fontWeight: 700, flexShrink: 0 }}
          >
            {cta} <ArrowRight size={9} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Acciones Rápidas ──────────────────────────────────────────────────────────
function AccionesRapidas({ onNavigate }) {
  const actions = [
    { icon: Users,    label: "Gestionar equipos",  mod: "equipos",    color: "#F97316", bg: "#FFF7ED" },
    { icon: Trophy,   label: "Ver fixture",         mod: "fixtures",   color: "#3B82F6", bg: "#EFF6FF" },
    { icon: Settings, label: "Configurar reglas",   mod: "ajustes",    color: "#8B5CF6", bg: "#F5F3FF" },
    { icon: Upload,   label: "Importar equipos",    mod: "equipos",    color: "#10B981", bg: "#ECFDF5" },
    { icon: FileDown, label: "Exportar datos",      mod: "equipos",    color: MUTED,     bg: BG },
  ];

  return (
    <motion.div
      {...fadeUp(0.2)}
      style={{
        background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`,
        boxShadow: ELEV_SM, overflow: "hidden", marginTop: 10,
      }}
    >
      <div style={{
        padding: "12px 16px", borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", gap: 7,
      }}>
        <Zap size={13} color={CU} />
        <span style={{ fontSize: 11, fontWeight: 800, color: TEXT, letterSpacing: "-0.01em" }}>
          Acciones rápidas
        </span>
      </div>
      {actions.map(({ icon: Icon, label, mod, color, bg }, i) => (
        <motion.button
          key={label}
          whileHover={{ background: BG, x: 2 }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          onClick={() => onNavigate(mod)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "9px 16px", border: "none", background: "transparent",
            borderBottom: i < actions.length - 1 ? `1px solid ${BORDER}` : "none",
            cursor: "pointer", textAlign: "left", fontFamily: FONT,
          }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 7, background: bg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon size={12} color={color} />
          </div>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: TEXT }}>{label}</span>
          <ChevronRight size={13} color={HINT} />
        </motion.button>
      ))}
    </motion.div>
  );
}

// ── Active Dashboard ──────────────────────────────────────────────────────────
function ActiveDashboard({ torneo, equipos, partidos, onInfoClick, onNavigate, onCreate }) {
  const finalizados = partidos.filter(p => p.estado === "finalizado").length;
  const programados = partidos.filter(p => p.fechaHora).length;
  const totalJugadores = equipos.reduce((sum, e) => sum + (e.jugadores?.length || 0), 0);

  const getEquipo = id => equipos.find(e => e.id === id);
  const getEquipoNombre = id => getEquipo(id)?.nombre ?? "TBD";

  // Próximos partidos (next 3)
  const now = new Date();
  const proximosPartidos = partidos
    .filter(p => p.fechaHora && new Date(p.fechaHora) > now && p.equipoLocalId && p.equipoVisitaId)
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
    .slice(0, 3);

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${CU_BOR}` }}>
            <Trophy size={24} color={CU} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>{torneo.nombre}</h2>
            <div style={{ fontSize: 13, color: MUTED }}>Administrar y ver detalles del torneo</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, background: CU_DIM }}
          whileTap={{ scale: 0.96 }}
          transition={spring}
          onClick={() => onNavigate("ajustes")}
          style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 16px", color: TEXT, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: FONT }}
        >
          <Settings size={16} /> Configuración
        </motion.button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Main content (Left Column) ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* KPI Cards */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { value: equipos.length, label: "Equipos Registrados", icon: Users, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.2)" },
              { value: programados, label: "Partidos Programados", icon: Calendar, color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.2)" },
              { value: totalJugadores, label: "Jugadores Totales", icon: Shirt, color: CU, bg: CU_DIM, border: CU_BOR }
            ].map((kpi, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)} style={{ flex: "1 1 200px", background: CARD, borderRadius: 16, padding: 20, border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: kpi.bg, border: `1px solid ${kpi.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <kpi.icon size={20} color={kpi.color} />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, lineHeight: 1 }}>{kpi.value}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{kpi.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Próximos Partidos Table */}
          <motion.div {...fadeUp(0.15)} style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: TEXT }}>Próximos Partidos</h3>
              <button onClick={() => onNavigate("fixtures")} style={{ background: "none", border: "none", color: CU, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Ver todos</button>
            </div>
            
            {proximosPartidos.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: BG, color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "12px 24px", fontWeight: 600 }}>Hora</th>
                      <th style={{ padding: "12px 24px", fontWeight: 600 }}>Equipo Local</th>
                      <th style={{ padding: "12px 24px", fontWeight: 600 }}>Equipo Visitante</th>
                      <th style={{ padding: "12px 24px", fontWeight: 600 }}>Lugar</th>
                      <th style={{ padding: "12px 24px", fontWeight: 600 }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proximosPartidos.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < proximosPartidos.length - 1 ? `1px solid ${BORDER}` : "none", background: "transparent", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "16px 24px", color: TEXT, fontWeight: 500 }}>
                          {new Date(p.fechaHora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: MUTED }}>
                              {getEquipoNombre(p.equipoLocalId).charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, color: TEXT }}>{getEquipoNombre(p.equipoLocalId)}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: MUTED }}>
                              {getEquipoNombre(p.equipoVisitaId).charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, color: TEXT }}>{getEquipoNombre(p.equipoVisitaId)}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px", color: MUTED }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> {p.lugar || "Sede Principal"}</div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <button style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 12px", color: TEXT, fontSize: 12, cursor: "pointer", fontFamily: FONT }}>Ver detalles</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <Calendar size={32} color={BORDER} style={{ margin: "0 auto 12px" }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Sin partidos próximos</div>
                <div style={{ fontSize: 13, color: MUTED }}>No hay encuentros programados para las próximas fechas.</div>
              </div>
            )}
          </motion.div>

        </div>

        {/* ── Right column (Sidebar Widgets) ── */}
        <motion.div {...fadeUp(0.1)} className="w-full lg:w-[320px] lg:flex-shrink-0" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Estado de Configuración */}
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: TEXT }}>Estado de Configuración</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: MUTED }}>Equipos</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{equipos.length}/16</span>
                </div>
                <div style={{ height: 6, background: BG, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((equipos.length / 16) * 100, 100)}%`, background: CU, borderRadius: 3 }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: MUTED }}>Partidos</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{programados} Programados</span>
                </div>
                <div style={{ height: 6, background: BG, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: partidos.length ? `${Math.min((programados / partidos.length) * 100, 100)}%` : "0%", background: "#10B981", borderRadius: 3 }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Jugadores</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{totalJugadores} Activos</span>
                </div>
                <div style={{ height: 6, background: BG, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "100%", background: "#3B82F6", borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Ajustes Rápidos */}
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: TEXT }}>Ajustes Rápidos</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: FileDown, label: "Reglas del torneo", color: MUTED, bg: BG },
                { icon: LayoutGrid, label: "Formato de juego", color: CU, bg: CU_DIM },
                { icon: MapPin, label: "Sede principal", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" }
              ].map((ajuste, i) => (
                <button key={i} onClick={() => onNavigate("ajustes")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 12, background: "transparent", border: "none", borderRadius: 8, cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = BG} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: ajuste.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ajuste.icon size={16} color={ajuste.color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{ajuste.label}</span>
                  <ChevronRight size={14} color={MUTED} style={{ marginLeft: "auto" }} />
                </button>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </>
  );
}

// ── Welcome Screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ onCreate, onImport, onInfoClick }) {
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <motion.div
          {...fadeUp(0)}
          style={{
            flex: 1, background: CARD, borderRadius: 16,
            boxShadow: ELEV_MD, border: `1px solid ${BORDER}`,
            padding: 28, display: "flex", flexDirection: "column",
            gap: 20, minWidth: 0, fontFamily: FONT,
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: "-0.025em" }}>
              Bienvenido a ALTTEZ Torneos
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
              Gestiona torneos, fases y fixtures desde un solo lugar.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: ELEV_CU }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                onClick={onCreate}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: CU, color: "#FFF", border: "none",
                  borderRadius: 9, padding: "9px 18px",
                  fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
                  boxShadow: ELEV_CU,
                }}
              >
                <Plus size={14} />Crear torneo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, background: CU_DIM }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                onClick={onImport}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: "transparent", color: CU,
                  border: `1.5px solid ${CU_BOR}`, borderRadius: 9, padding: "9px 18px",
                  fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
                }}
              >
                <Download size={14} />Importar datos
              </motion.button>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", alignItems: "center", borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
            {STEPS_STRIP.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: i === 0 ? CU : CU_DIM, border: `1.5px solid ${i === 0 ? CU : CU_BOR}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {i === 0
                      ? <CheckCircle size={11} color="#FFF" />
                      : <span style={{ fontSize: 9, fontWeight: 700, color: CU }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ fontSize: 11, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? TEXT : HINT, whiteSpace: "nowrap" }}>
                    {s}
                  </span>
                </div>
                {i < 3 && (
                  <div style={{ flex: 1, height: 1.5, margin: "0 8px", background: `linear-gradient(90deg, ${CU_BOR}, ${BORDER})` }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...fadeUp(0.1)}
          className="w-full lg:w-[264px] lg:flex-shrink-0"
          style={{ background: CARD, borderRadius: 14, boxShadow: ELEV_SM, border: `1px solid ${BORDER}`, padding: 20, fontFamily: FONT }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Crear tu primer torneo</div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
            Completa el formulario para crear tu primer torneo en minutos.
          </p>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: ELEV_CU }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
            onClick={onCreate}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              background: CU, color: "#FFF", border: "none", borderRadius: 9, padding: "10px 0",
              fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer", boxShadow: ELEV_CU,
            }}
          >
            Comenzar →
          </motion.button>
        </motion.div>
      </div>

      <InfoCards onInfoClick={onInfoClick} />

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        style={{ marginTop: 28, padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: FONT }}
      >
        <Trophy size={28} color={CU} style={{ opacity: 0.25 }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginTop: 4 }}>Aún no hay torneos creados</div>
        <div style={{ fontSize: 12, color: MUTED, textAlign: "center", maxWidth: 300, lineHeight: 1.6 }}>
          Crea tu primer torneo para comenzar.
        </div>
        <motion.button
          whileHover={{ scale: 1.02, background: CU_DIM }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={onCreate}
          style={{
            marginTop: 6, display: "flex", alignItems: "center", gap: 7,
            background: "transparent", color: CU, border: `1.5px solid ${CU_BOR}`,
            borderRadius: 9, padding: "8px 18px",
            fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
          }}
        >
          <Plus size={14} />Crear torneo
        </motion.button>
      </motion.div>
    </>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function InicioPage({ onCreate, onImport, onInfoClick, onNavigate }) {
  const torneoActivoId = useTorneosStore(s => s.torneoActivoId);
  const torneos        = useTorneosStore(s => s.torneos);
  const allEquipos     = useTorneosStore(s => s.equipos);
  const allPartidos    = useTorneosStore(s => s.partidos);
  const allSedes       = useTorneosStore(s => s.sedes);

  const torneoActivo = torneoActivoId ? torneos.find(t => t.id === torneoActivoId) ?? null : null;
  const equipos  = torneoActivoId ? allEquipos.filter(e => e.torneoId === torneoActivoId)  : [];
  const partidos = torneoActivoId ? allPartidos.filter(p => p.torneoId === torneoActivoId) : [];
  const sedes    = torneoActivoId ? allSedes.filter(s => s.torneoId === torneoActivoId)    : [];

  if (torneoActivo) {
    return (
      <ActiveDashboard
        torneo={torneoActivo}
        equipos={equipos}
        partidos={partidos}
        sedes={sedes}
        onInfoClick={onInfoClick}
        onNavigate={onNavigate ?? onInfoClick}
        onCreate={onCreate}
      />
    );
  }

  return (
    <WelcomeScreen onCreate={onCreate} onImport={onImport} onInfoClick={onInfoClick} />
  );
}
