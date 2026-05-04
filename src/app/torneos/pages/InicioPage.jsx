import { motion } from "framer-motion";
import {
  Plus, Download, CheckCircle, Trophy, Globe,
  BarChart2, Users, Calendar, Clock, MapPin, ArrowRight,
} from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";

const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD   = PALETTE.surface;
const BG     = PALETTE.bg;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const HINT   = PALETTE.textHint;
const BORDER = PALETTE.border;
const ELEV   = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE   = [0.22, 1, 0.36, 1];

const STEPS_STRIP = ["Crear torneo", "Agregar equipos", "Configurar fases", "Publicar"];

const FORMATO_LABELS = {
  todos_contra_todos: "Liga",
  eliminacion: "Eliminación",
  grupos_playoffs: "Grupos + Playoffs",
};

function MiniTorneosPreview() {
  const rounds = [{ label: "Cuartos", n: 4 }, { label: "Semis", n: 2 }, { label: "Final", n: 1 }];
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background: CARD, borderRadius: 10, padding: "14px 16px",
        boxShadow: ELEV, border: `1px solid ${BORDER}`, width: 210, flexShrink: 0, fontFamily: FONT,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: CU, letterSpacing: "0.08em", marginBottom: 10 }}>
        FIXTURE · FASE ELIMINATORIA
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {rounds.map(({ label, n }) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: HINT, fontWeight: 600, marginBottom: 5, letterSpacing: "0.06em" }}>{label}</div>
            {Array.from({ length: n }).map((_, i) => (
              <div key={i} style={{ height: 20, background: BG, borderRadius: 4, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 6px", gap: 4, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: CU_DIM, border: `1px solid ${CU_BOR}` }} />
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: BORDER }} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: CU, fontWeight: 600, letterSpacing: "0.06em" }}>● EN PROGRESO</div>
    </motion.div>
  );
}

function InfoCards({ onInfoClick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 20 }}>
      {[
        { icon: Globe,     title: "Página pública",    desc: "Comparte el torneo con una URL pública",             mod: "publica" },
        { icon: BarChart2, title: "Estadísticas",       desc: "Rendimiento de equipos y jugadores en tiempo real", mod: "estadisticas" },
        { icon: Users,     title: "Gestión de equipos", desc: "Administra equipos, jugadores y cuerpos técnicos",  mod: "equipos" },
      ].map(({ icon: Icon, title, desc, mod }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE, delay: 0.25 + i * 0.07 }}
          whileHover={{ y: -2 }}
          onClick={() => onInfoClick(mod)}
          style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 20, fontFamily: FONT, cursor: "pointer" }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 9, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Icon size={16} color={CU} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{desc}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Dashboard (torneo activo) ─────────────────────────────────────────────────

function CheckItem({ done, label, sublabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        background: done ? CU : "transparent",
        border: `1.5px solid ${done ? CU : BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {done && <CheckCircle size={12} color="#FFF" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: done ? 600 : 400, color: done ? TEXT : MUTED }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: HINT, marginTop: 1 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

function StatChip({ value, label }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 16px", background: BG, borderRadius: 8, border: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: CU, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 10, color: HINT, fontWeight: 600, marginTop: 2, letterSpacing: "0.04em" }}>{label}</div>
    </div>
  );
}

function ActiveDashboard({ torneo, equipos, partidos, _sedes, onInfoClick, onNavigate }) {
  const finalizados  = partidos.filter(p => p.estado === "finalizado").length;
  const programados  = partidos.filter(p => p.fechaHora).length;
  const schedPct     = partidos.length > 0 ? programados / partidos.length : 0;

  const checks = [
    { done: true,                         label: "Torneo creado",           sublabel: torneo.deporte },
    { done: equipos.length >= 2,          label: "Equipos",                 sublabel: equipos.length >= 2 ? `${equipos.length} equipos registrados` : "Agrega al menos 2 equipos" },
    { done: partidos.length > 0,          label: "Fixture generado",        sublabel: partidos.length > 0 ? `${partidos.length} partidos` : "Genera el fixture desde Fixtures" },
    { done: schedPct >= 0.5,              label: "Calendario programado",   sublabel: partidos.length > 0 ? `${programados} de ${partidos.length} partidos programados` : "Configura el calendario" },
    { done: torneo.publicado,             label: "Torneo publicado",        sublabel: torneo.publicado ? "URL pública activa" : "Publica para compartir el fixture" },
  ];

  const nextStep = checks.find(c => !c.done);

  const NEXT_ACTIONS = {
    "Equipos":               { label: "Agregar equipos", mod: "equipos" },
    "Fixture generado":      { label: "Generar fixture",  mod: "fixtures" },
    "Calendario programado": { label: "Programar calendario", mod: "calendario" },
    "Torneo publicado":      { label: "Publicar torneo",  mod: "ajustes" },
  };
  const nextAction = nextStep ? NEXT_ACTIONS[nextStep.label] : null;

  // Próximo partido
  const now = new Date();
  const proximoPartido = partidos
    .filter(p => p.fechaHora && new Date(p.fechaHora) > now && p.equipoLocalId && p.equipoVisitaId)
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))[0];

  const getEquipoNombre = id => equipos.find(e => e.id === id)?.nombre ?? "TBD";

  return (
    <>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Main dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{ flex: 1, background: CARD, borderRadius: 16, boxShadow: ELEV, border: `1px solid ${BORDER}`, padding: 28, minWidth: 0 }}
        >
          {/* Torneo header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: CU, background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "2px 7px", letterSpacing: "0.08em" }}>
                  {torneo.deporte.toUpperCase()}
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, color: MUTED, background: BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "2px 7px", letterSpacing: "0.08em" }}>
                  {(FORMATO_LABELS[torneo.formato] ?? torneo.formato).toUpperCase()}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  color: torneo.publicado ? (PALETTE.success ?? "#22C55E") : HINT,
                  background: torneo.publicado ? (PALETTE.successDim ?? "#F0FDF4") : BG,
                  border: `1px solid ${torneo.publicado ? (PALETTE.successBorder ?? "#BBF7D0") : BORDER}`,
                  borderRadius: 4, padding: "2px 7px", letterSpacing: "0.08em",
                }}>
                  {torneo.publicado ? "● PUBLICADO" : "○ BORRADOR"}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em", fontFamily: FONT }}>
                {torneo.nombre}
              </h2>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <StatChip value={equipos.length} label="EQUIPOS" />
            <StatChip value={partidos.length} label="PARTIDOS" />
            <StatChip value={`${finalizados}/${partidos.length}`} label="JUGADOS" />
          </div>

          {/* Progress checklist */}
          <div style={{ borderTop: `1px solid ${BORDER}` }}>
            {checks.map(c => (
              <CheckItem key={c.label} done={c.done} label={c.label} sublabel={c.sublabel} />
            ))}
          </div>

          {/* Next action CTA */}
          {nextAction && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(nextAction.mod)}
              style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
            >
              {nextAction.label} <ArrowRight size={13} />
            </motion.button>
          )}
        </motion.div>

        {/* Right — Próximo partido card */}
        <motion.div
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.1 }}
          style={{ width: 280, flexShrink: 0, background: CARD, borderRadius: 16, boxShadow: ELEV, border: `1px solid ${BORDER}`, padding: 24, fontFamily: FONT }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Calendar size={14} color={CU} />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>Próximo partido</span>
          </div>

          {proximoPartido ? (
            <>
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, textAlign: "right", flex: 1 }}>
                    {getEquipoNombre(proximoPartido.equipoLocalId)}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: CU, background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 6, padding: "3px 8px" }}>
                    vs
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, textAlign: "left", flex: 1 }}>
                    {getEquipoNombre(proximoPartido.equipoVisitaId)}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 12, color: MUTED }}>
                    <Clock size={11} />
                    {new Date(proximoPartido.fechaHora).toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short" })}
                    {" · "}
                    {new Date(proximoPartido.fechaHora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {proximoPartido.lugar && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, color: HINT }}>
                      <MapPin size={10} />{proximoPartido.lugar}
                    </div>
                  )}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate("calendario")}
                style={{ width: "100%", marginTop: 10, background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "9px 0", fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
              >
                Ver calendario completo
              </motion.button>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Calendar size={28} color={CU} style={{ opacity: 0.3, marginBottom: 10 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Sin partidos programados</div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                  Configura el calendario para programar los partidos automáticamente.
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate("calendario")}
                style={{ width: "100%", background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
              >
                Ir al calendario
              </motion.button>
            </>
          )}
        </motion.div>
      </div>

      <InfoCards onInfoClick={onInfoClick} />
    </>
  );
}

// ── Static welcome (no torneos) ───────────────────────────────────────────────

function WelcomeScreen({ onCreate, onImport, onInfoClick }) {
  return (
    <>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{ flex: 1, background: CARD, borderRadius: 16, boxShadow: ELEV, border: `1px solid ${BORDER}`, padding: 32, display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}
        >
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: TEXT, lineHeight: 1.15, letterSpacing: "-0.02em", fontFamily: FONT }}>
                Bienvenido a<br />ALTTEZ Torneos
              </h1>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: MUTED, lineHeight: 1.6, fontFamily: FONT }}>
                Gestiona torneos, fases y fixtures desde un solo lugar.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCreate}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>
                  <Plus size={14} />Crear torneo
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onImport}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>
                  <Download size={14} />Importar datos
                </motion.button>
              </div>
            </div>
            <MiniTorneosPreview />
          </div>
          {/* Steps strip */}
          <div style={{ display: "flex", alignItems: "center", borderTop: `1px solid ${BORDER}`, paddingTop: 18 }}>
            {STEPS_STRIP.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? CU : CU_DIM, border: `1.5px solid ${i === 0 ? CU : CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {i === 0 ? <CheckCircle size={12} color="#FFF" /> : <span style={{ fontSize: 10, fontWeight: 700, color: CU }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? TEXT : HINT, fontFamily: FONT, whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 1.5, margin: "0 8px", background: `linear-gradient(90deg, ${CU_BOR}, ${BORDER})` }} />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick start card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
          style={{ width: 300, flexShrink: 0, background: CARD, borderRadius: 16, boxShadow: ELEV, border: `1px solid ${BORDER}`, padding: 24, fontFamily: FONT }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Crear tu primer torneo</div>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
            Completa el formulario para crear tu primer torneo en minutos.
          </p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCreate}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: CU, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>
            Comenzar →
          </motion.button>
        </motion.div>
      </div>

      <InfoCards onInfoClick={onInfoClick} />

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ marginTop: 32, padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: FONT }}
      >
        <Trophy size={32} color={CU} style={{ opacity: 0.3 }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginTop: 4 }}>Aún no hay torneos creados</div>
        <div style={{ fontSize: 12, color: MUTED, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          Crea tu primer torneo para comenzar.
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCreate}
          style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 7, background: "transparent", color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>
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
      />
    );
  }

  return (
    <WelcomeScreen
      onCreate={onCreate}
      onImport={onImport}
      onInfoClick={onInfoClick}
    />
  );
}
