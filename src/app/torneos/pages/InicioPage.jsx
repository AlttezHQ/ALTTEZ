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
  const schedPct    = partidos.length > 0 ? programados / partidos.length : 0;

  const isGrupos = torneo.formato === "grupos_playoffs";

  const checks = [
    {
      done: true,
      label: "Torneo creado",
      sublabel: "El torneo ha sido creado correctamente.",
    },
    {
      done: equipos.length >= 2,
      label: "Equipos",
      sublabel: equipos.length >= 2 ? `${equipos.length} equipos registrados.` : "Agrega al menos 2 equipos.",
      actionLabel: equipos.length < 2 ? "Agregar" : undefined,
      mod: "equipos",
    },
    {
      done: partidos.length > 0,
      label: isGrupos ? "Fase de grupos" : "Fixture generado",
      sublabel: partidos.length > 0 ? `${partidos.length} partidos generados.` : "Genera el fixture desde Fixtures.",
      actionLabel: partidos.length === 0 ? "Generar" : undefined,
      mod: "fixtures",
    },
    {
      done: schedPct >= 0.5,
      label: "Calendario programado",
      sublabel: "Configura el calendario del torneo.",
      actionLabel: schedPct < 0.5 ? "Configurar" : undefined,
      mod: "fixtures",
    },
    {
      done: torneo.publicado,
      label: "Torneo publicado",
      sublabel: torneo.publicado ? "URL pública activa." : "Publica para compartir el torneo.",
      actionLabel: !torneo.publicado ? "Publicar" : undefined,
      mod: "ajustes",
    },
  ];

  const pendingFixture = partidos.length === 0 && equipos.length >= 2;

  // Próximo partido
  const now = new Date();
  const proximoPartido = partidos
    .filter(p => p.fechaHora && new Date(p.fechaHora) > now && p.equipoLocalId && p.equipoVisitaId)
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))[0];

  const getEquipo = id => equipos.find(e => e.id === id);
  const getEquipoNombre = id => getEquipo(id)?.nombre ?? "TBD";

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ── Main card ── */}
        <motion.div
          {...fadeUp(0)}
          style={{
            flex: 1, background: CARD, borderRadius: 14,
            boxShadow: ELEV_MD, border: `1px solid ${BORDER}`,
            padding: "18px 20px 16px", minWidth: 0, fontFamily: FONT,
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", gap: 12, marginBottom: 4,
          }}>
            <div style={{ minWidth: 0 }}>
              {/* Badges */}
              <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                {[
                  { text: torneo.deporte?.toUpperCase(), color: CU, bg: CU_DIM, border: CU_BOR },
                  { text: (FORMATO_LABELS[torneo.formato] ?? torneo.formato ?? "").toUpperCase(), color: MUTED, bg: BG, border: BORDER },
                  torneo.publicado
                    ? { text: "● PUBLICADO", color: PALETTE.success ?? "#22C55E", bg: PALETTE.successDim ?? "#F0FDF4", border: PALETTE.successBorder ?? "#BBF7D0" }
                    : { text: "○ BORRADOR",  color: HINT, bg: BG, border: BORDER },
                ].map(({ text, color, bg, border }) => text ? (
                  <span key={text} style={{
                    fontSize: 9, fontWeight: 700, color, background: bg,
                    border: `1px solid ${border}`, borderRadius: 5,
                    padding: "2px 8px", letterSpacing: "0.08em",
                  }}>{text}</span>
                ) : null)}
              </div>

              {/* Name + edit */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h2 style={{
                  margin: 0, fontSize: 22, fontWeight: 800,
                  color: TEXT, letterSpacing: "-0.025em", lineHeight: 1,
                }}>
                  {torneo.nombre}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, background: CU_DIM }}
                  whileTap={{ scale: 0.92 }}
                  transition={spring}
                  onClick={() => onNavigate("ajustes")}
                  title="Editar ajustes"
                  style={{
                    background: BG, border: `1px solid ${BORDER}`,
                    borderRadius: 7, padding: "4px 6px", cursor: "pointer",
                    display: "flex", alignItems: "center", color: HINT,
                  }}
                >
                  <Pencil size={12} />
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03, background: CU_DIM, borderColor: CU }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              onClick={onCreate}
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                background: "transparent", color: CU, border: `1.5px solid ${CU_BOR}`,
                borderRadius: 9, padding: "7px 13px",
                fontSize: 11, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
              }}
            >
              <Plus size={12} /> Nuevo torneo
            </motion.button>
          </div>

          {/* Meta pills */}
          <MetaRow torneo={torneo} />

          {/* Stat chips — flex, not full-width */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            <StatChip value={equipos.length}                  label="EQUIPOS"  icon={Users}       iconColor="#F97316" iconBg="#FFF7ED" />
            <StatChip value={partidos.length}                  label="PARTIDOS" icon={Shirt}       iconColor="#3B82F6" iconBg="#EFF6FF" />
            <StatChip value={`${finalizados}/${partidos.length}`} label="JUGADOS"  icon={LayoutGrid}  iconColor="#10B981" iconBg="#ECFDF5" />
          </div>

          {/* Checklist header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7, marginBottom: 2,
            paddingBottom: 8, borderBottom: `1px solid ${BORDER}`,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5, background: CU_DIM,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle size={10} color={CU} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: HINT, letterSpacing: "0.07em" }}>
              CONFIGURACIÓN DEL TORNEO
            </span>
          </div>

          <div>
            {checks.map((c, i) => (
              <CheckItem
                key={c.label}
                done={c.done}
                label={c.label}
                sublabel={c.sublabel}
                actionLabel={c.actionLabel}
                onAction={() => onNavigate(c.mod)}
                delay={i * 0.04}
              />
            ))}
          </div>

          {/* CTA */}
          <AnimatePresence>
            {pendingFixture && (
              <motion.button
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                whileHover={{ scale: 1.02, boxShadow: ELEV_CU }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                onClick={() => onNavigate("fixtures")}
                style={{
                  marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
                  background: CU, color: "#FFF", border: "none",
                  borderRadius: 10, padding: "10px 20px",
                  fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
                  boxShadow: ELEV_CU,
                }}
              >
                Generar fixture <ArrowRight size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Right column ── */}
        <motion.div
          {...fadeUp(0.08)}
          className="w-full lg:w-[264px] lg:flex-shrink-0"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {/* Próximo partido */}
          <div style={{
            background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`,
            boxShadow: ELEV_SM, overflow: "hidden", fontFamily: FONT,
          }}>
            {/* Header strip */}
            <div style={{
              padding: "10px 14px", borderBottom: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", gap: 7,
              background: BG,
            }}>
              <Calendar size={12} color={CU} />
              <span style={{ fontSize: 11, fontWeight: 800, color: TEXT }}>Próximo partido</span>
            </div>

            <div style={{ padding: "14px 16px" }}>
              {proximoPartido ? (
                <>
                  {proximoPartido.ronda && (
                    <div style={{
                      fontSize: 9, fontWeight: 700, color: HINT, textAlign: "center",
                      letterSpacing: "0.08em", marginBottom: 12,
                    }}>
                      JORNADA {proximoPartido.ronda}
                    </div>
                  )}

                  {/* Teams */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 6, marginBottom: 10,
                  }}>
                    {/* Local */}
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: BG, border: `2px solid ${BORDER}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 5px",
                        fontSize: 15, fontWeight: 900, color: CU,
                        overflow: "hidden",
                      }}>
                        {getEquipo(proximoPartido.equipoLocalId)?.logo
                          ? <img src={getEquipo(proximoPartido.equipoLocalId).logo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                          : getEquipoNombre(proximoPartido.equipoLocalId).charAt(0)
                        }
                      </div>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: TEXT,
                        lineHeight: 1.2, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                        maxWidth: 70, margin: "0 auto",
                      }}>
                        {getEquipoNombre(proximoPartido.equipoLocalId)}
                      </div>
                    </div>

                    {/* VS */}
                    <div style={{
                      fontSize: 11, fontWeight: 900, color: CU,
                      background: CU_DIM, border: `1.5px solid ${CU_BOR}`,
                      borderRadius: 7, padding: "4px 8px", flexShrink: 0,
                    }}>VS</div>

                    {/* Visita */}
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: BG, border: `2px solid ${BORDER}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 5px",
                        fontSize: 15, fontWeight: 900, color: MUTED,
                        overflow: "hidden",
                      }}>
                        {getEquipo(proximoPartido.equipoVisitaId)?.logo
                          ? <img src={getEquipo(proximoPartido.equipoVisitaId).logo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                          : getEquipoNombre(proximoPartido.equipoVisitaId).charAt(0)
                        }
                      </div>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: TEXT,
                        lineHeight: 1.2, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                        maxWidth: 70, margin: "0 auto",
                      }}>
                        {getEquipoNombre(proximoPartido.equipoVisitaId)}
                      </div>
                    </div>
                  </div>

                  {/* Date + venue */}
                  <div style={{
                    background: BG, borderRadius: 8, border: `1px solid ${BORDER}`,
                    padding: "8px 10px", marginBottom: 12, textAlign: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, color: MUTED, marginBottom: 2 }}>
                      <Clock size={10} />
                      {new Date(proximoPartido.fechaHora).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                      {" · "}
                      {new Date(proximoPartido.fechaHora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {proximoPartido.lugar && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 10, color: HINT }}>
                        <MapPin size={9} />{proximoPartido.lugar}
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, background: CU_DIM }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                    onClick={() => onNavigate("fixtures")}
                    style={{
                      width: "100%", background: "transparent", color: CU,
                      border: `1.5px solid ${CU_BOR}`, borderRadius: 9,
                      padding: "8px 0", fontSize: 11, fontWeight: 700,
                      fontFamily: FONT, cursor: "pointer",
                    }}
                  >
                    Ver calendario completo
                  </motion.button>
                </>
              ) : (
                <>
                  <div style={{ textAlign: "center", padding: "10px 0 12px" }}>
                    <Calendar size={28} color={CU} style={{ opacity: 0.18, marginBottom: 8 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
                      Sin partidos programados
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
                      Configura el calendario para programar los partidos automáticamente.
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: ELEV_CU }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                    onClick={() => onNavigate("fixtures")}
                    style={{
                      width: "100%", background: CU, color: "#FFF", border: "none",
                      borderRadius: 9, padding: "9px 0", fontSize: 11, fontWeight: 700,
                      fontFamily: FONT, cursor: "pointer", boxShadow: ELEV_CU,
                    }}
                  >
                    Ir a Gestión de Partidos
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <AccionesRapidas onNavigate={onNavigate} />
        </motion.div>
      </div>

      {/* Info cards */}
      <InfoCards onInfoClick={onInfoClick} />
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
