import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, Trophy, RefreshCw, X, Check, BarChart2, CalendarPlus, Calendar, Share2, Clock } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { generarFixture, calcularPosiciones } from "../utils/fixturesEngine";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import { showToast } from "../../../shared/ui/Toast";
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
const SUCCESS = PALETTE.success ?? "#22C55E";
const AMBER   = PALETTE.amber   ?? "#F59E0B";

const ESTADO_CFG = {
  programado: { label: "Programado",  color: PALETTE.success, dot: PALETTE.success },
  propuesto:  { label: "Propuesto",   color: HINT,            dot: HINT },
  aplazado:   { label: "Aplazado",    color: PALETTE.error ?? "#EF4444", dot: PALETTE.error ?? "#EF4444" },
  en_curso:   { label: "En curso",    color: AMBER,           dot: AMBER },
  finalizado: { label: "Finalizado",  color: CU,              dot: CU },
  pendiente:  { label: "Pendiente",   color: MUTED,           dot: MUTED },
};

const FASE_LABELS = {
  liga:          "Liga",
  grupos:        "Grupos",
  octavos:       "Octavos de final",
  cuartos:       "Cuartos de final",
  semis:         "Semifinales",
  final:         "Final",
  tercer_puesto: "Tercer puesto",
};

const BRACKET_ORDER = ["octavos", "cuartos", "semis", "final"];

// ── Match Card ────────────────────────────────────────────────────────────────

function MatchCard({ partido, equipos, arbitros, onClick, compact = false }) {
  const local   = equipos.find(e => e.id === partido.equipoLocalId);
  const visita  = equipos.find(e => e.id === partido.equipoVisitaId);
  const arbitro = arbitros?.find(a => a.id === partido.arbitroId);
  const cfg     = ESTADO_CFG[partido.estado] ?? ESTADO_CFG.pendiente;
  const fecha   = partido.fechaHora ? new Date(partido.fechaHora) : null;
  const isDone  = partido.estado === "finalizado";

  return (
    <motion.div
      whileHover={onClick ? { y: -2, boxShadow: "0 8px 24px rgba(23,26,28,0.1)" } : {}}
      onClick={onClick}
      style={{
        background: CARD, borderRadius: 12,
        border: `1px solid ${isDone ? `${CU}33` : BORDER}`,
        padding: compact ? "12px 14px" : "16px 18px",
        boxShadow: ELEV,
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s, border-color 0.2s",
        fontFamily: FONT,
      }}
    >
      {/* Top row: fase badge + status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: compact ? 8 : 12 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, color: CU,
          background: CU_DIM, border: `1px solid ${CU_BOR}`,
          borderRadius: 4, padding: "2px 6px", letterSpacing: "0.08em",
        }}>
          {FASE_LABELS[partido.fase] ?? partido.fase}
          {partido.grupo ? ` · ${partido.grupo}` : ""}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
          <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
        </div>
      </div>

      {/* Teams + Score */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Local */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, justifyContent: "flex-end", minWidth: 0 }}>
          <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: TEXT, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {local?.nombre ?? "TBD"}
          </span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: local?.color ?? CU, flexShrink: 0 }} />
        </div>

        {/* Score / VS */}
        {isDone ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            background: BG, borderRadius: 8, padding: "4px 12px",
            border: `1px solid ${BORDER}`,
          }}>
            <span style={{ fontSize: compact ? 15 : 18, fontWeight: 800, color: TEXT, minWidth: 16, textAlign: "center" }}>
              {partido.golesLocal}
            </span>
            <span style={{ fontSize: 10, color: HINT, fontWeight: 600 }}>–</span>
            <span style={{ fontSize: compact ? 15 : 18, fontWeight: 800, color: TEXT, minWidth: 16, textAlign: "center" }}>
              {partido.golesVisita}
            </span>
          </div>
        ) : (
          <div style={{
            fontSize: 11, fontWeight: 800, color: CU,
            background: CU_DIM, border: `1px solid ${CU_BOR}`,
            borderRadius: 6, padding: "4px 10px", flexShrink: 0,
            letterSpacing: "0.04em",
          }}>
            VS
          </div>
        )}

        {/* Visita */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, justifyContent: "flex-start", minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: visita?.color ?? BORDER, flexShrink: 0 }} />
          <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {visita?.nombre ?? "TBD"}
          </span>
        </div>
      </div>

      {/* Bottom row: date + sede + árbitro */}
      {!compact && (fecha || partido.lugar || arbitro) && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
          {fecha && (
            <span style={{ fontSize: 10, color: MUTED }}>
              📅 {fecha.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short" })} · {fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {partido.lugar && (
            <span style={{ fontSize: 10, color: HINT }}>🏟 {partido.lugar}</span>
          )}
          {arbitro && (
            <span style={{ fontSize: 10, color: HINT }}>👤 {arbitro.nombre}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Result Modal ──────────────────────────────────────────────────────────────

function ResultModal({ partido, equipos, onSave, onClose }) {
  const [gl, setGl] = useState(partido.golesLocal  ?? 0);
  const [gv, setGv] = useState(partido.golesVisita ?? 0);
  const local  = equipos.find(e => e.id === partido.equipoLocalId)?.nombre ?? "Local";
  const visita = equipos.find(e => e.id === partido.equipoVisitaId)?.nombre ?? "Visita";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(23,26,28,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, fontFamily: FONT }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18, ease: EASE }}
        style={{ background: CARD, borderRadius: 16, padding: 28, width: 380, boxShadow: "0 24px 64px rgba(23,26,28,0.2)", border: `1px solid ${BORDER}` }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Registrar resultado</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{local}</div>
            <input type="number" min={0} max={99} value={gl}
              onChange={e => setGl(Math.max(0, Number(e.target.value)))}
              style={{ width: 64, height: 64, textAlign: "center", fontSize: 28, fontWeight: 800, border: `2px solid ${BORDER}`, borderRadius: 12, color: TEXT, background: BG, fontFamily: FONT, outline: "none" }}
            />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: HINT, padding: "0 4px", marginTop: 20 }}>–</div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{visita}</div>
            <input type="number" min={0} max={99} value={gv}
              onChange={e => setGv(Math.max(0, Number(e.target.value)))}
              style={{ width: 64, height: 64, textAlign: "center", fontSize: 28, fontWeight: 800, border: `2px solid ${BORDER}`, borderRadius: 12, color: TEXT, background: BG, fontFamily: FONT, outline: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", fontSize: 13, color: MUTED, fontFamily: FONT, cursor: "pointer" }}>
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onSave(gl, gv)}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: CU, color: "#FFF", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Check size={14} />Guardar
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Liga view ─────────────────────────────────────────────────────────────────

function LigaView({ partidos, equipos, arbitros, onCardClick }) {
  const rounds = [...new Set(partidos.map(p => p.ronda))].sort((a, b) => a - b);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {rounds.map(round => {
        const ps = partidos.filter(p => p.ronda === round);
        return (
          <div key={round}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                FECHA {round}
              </div>
              <div style={{ flex: 1, height: 1.5, background: `linear-gradient(90deg, ${CU_BOR}, ${BORDER})` }} />
              <div style={{ fontSize: 10, color: HINT }}>
                {ps.filter(p => p.estado === "finalizado").length}/{ps.length}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
              {ps.map(p => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                  <MatchCard partido={p} equipos={equipos} arbitros={arbitros}
                    onClick={p.estado === "programado" ? () => onCardClick(p) : undefined} />
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Bracket view ──────────────────────────────────────────────────────────────

function BracketView({ partidos, equipos, arbitros, onCardClick }) {
  const fases  = BRACKET_ORDER.filter(f => partidos.some(p => p.fase === f));
  const tercer = partidos.filter(p => p.fase === "tercer_puesto");

  return (
    <div style={{ overflowX: "auto", paddingBottom: 12 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", minWidth: fases.length * 260 }}>
        {fases.map((fase, fi) => {
          const ps = partidos.filter(p => p.fase === fase).sort((a, b) => a.orden - b.orden);
          return (
            <div key={fase} style={{ flex: 1, minWidth: 220 }}>
              <div style={{ textAlign: "center", padding: "10px 16px", marginBottom: 16, borderBottom: `2px solid ${CU_BOR}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.1em" }}>
                  {(FASE_LABELS[fase] ?? fase).toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: HINT, marginTop: 2 }}>
                  {ps.filter(p => p.estado === "finalizado").length}/{ps.length}
                </div>
              </div>
              <div style={{
                display: "flex", flexDirection: "column",
                gap: 12,
                padding: "0 4px",
                paddingTop: fi * 28,
              }}>
                {ps.map(p => (
                  <MatchCard key={p.id} partido={p} equipos={equipos} arbitros={arbitros}
                    compact={true}
                    onClick={p.estado === "programado" && p.equipoLocalId && p.equipoVisitaId
                      ? () => onCardClick(p) : undefined} />
                ))}
              </div>
            </div>
          );
        })}

        {tercer.length > 0 && (
          <div style={{ minWidth: 220 }}>
            <div style={{ textAlign: "center", padding: "10px 16px", marginBottom: 16, borderBottom: `2px solid ${BORDER}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em" }}>3° PUESTO</div>
            </div>
            <div style={{ padding: "0 4px" }}>
              {tercer.map(p => (
                <MatchCard key={p.id} partido={p} equipos={equipos} arbitros={arbitros} compact={true}
                  onClick={p.estado === "programado" && p.equipoLocalId && p.equipoVisitaId ? () => onCardClick(p) : undefined} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Grupos + Playoffs view ────────────────────────────────────────────────────

function GruposView({ partidos, equipos, arbitros, onCardClick }) {
  const [tab, setTab] = useState("grupos");
  const grupoLetters    = [...new Set(equipos.map(e => e.grupo).filter(Boolean))].sort();
  const playoffPartidos = partidos.filter(p => !["grupos", "liga"].includes(p.fase));

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[{ id: "grupos", label: "Fase de Grupos" }, { id: "playoffs", label: "Playoffs" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "7px 18px", borderRadius: 7, border: "none",
              background: tab === t.id ? CU : "transparent",
              color: tab === t.id ? "#FFF" : MUTED,
              fontSize: 12, fontWeight: tab === t.id ? 700 : 400,
              fontFamily: FONT, cursor: "pointer", transition: "all 0.15s",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "grupos" ? (
          <motion.div key="grupos" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {grupoLetters.map(g => {
              const ps = partidos.filter(p => p.grupo === g);
              if (!ps.length) return null;
              return (
                <div key={g} style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: CU }}>
                      {g}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>Grupo {g}</div>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 8 }}>
                    {ps.map(p => (
                      <MatchCard key={p.id} partido={p} equipos={equipos} arbitros={arbitros}
                        onClick={p.estado === "programado" ? () => onCardClick(p) : undefined} />
                    ))}
                  </div>
                </div>
              );
            })}
            {!grupoLetters.length && (
              <div style={{ textAlign: "center", padding: "40px 0", color: MUTED, fontSize: 13 }}>
                Asigna grupos a los equipos para ver la fase de grupos.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="playoffs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {playoffPartidos.length > 0
              ? <BracketView partidos={playoffPartidos} equipos={equipos} arbitros={arbitros} onCardClick={onCardClick} />
              : <div style={{ textAlign: "center", padding: "40px 0", color: MUTED, fontSize: 13 }}>Los playoffs se habilitarán cuando finalice la fase de grupos.</div>
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function FixturesPage({ onGoTorneos }) {
  const torneoActivoId     = useTorneosStore(s => s.torneoActivoId);
  const allTorneos         = useTorneosStore(s => s.torneos);
  const allEquipos         = useTorneosStore(s => s.equipos);
  const allPartidos        = useTorneosStore(s => s.partidos);
  const allArbitros        = useTorneosStore(s => s.arbitros);
  const setPartidos        = useTorneosStore(s => s.setPartidos);
  const registrarResultado = useTorneosStore(s => s.registrarResultado);
  const autoSchedulePartidos = useTorneosStore(s => s.autoSchedulePartidos);

  const [modalPartido, setModalPartido] = useState(null);

  if (!torneoActivoId) {
    return (
      <ModuleEmptyState
        icon={List}
        title="Selecciona un torneo"
        subtitle="Abre un torneo para ver y gestionar sus fixtures."
        ctaLabel="Ver torneos"
        onCta={onGoTorneos}
      />
    );
  }

  const torneo   = allTorneos.find(t => t.id === torneoActivoId) ?? null;
  const equipos  = allEquipos.filter(e => e.torneoId === torneoActivoId);
  const partidos = allPartidos.filter(p => p.torneoId === torneoActivoId && p.equipoLocalId && p.equipoVisitaId);
  const arbitros = allArbitros.filter(a => a.torneoId === torneoActivoId);

  const handleGenerar = () => {
    if (equipos.length < 2) return;
    const ps = generarFixture(torneo, equipos);
    setPartidos(torneoActivoId, ps);
  };

  const handleAutoProgramar = () => {
    if (partidos.length === 0) {
      handleGenerar(); // Generate first if none exist
    }
    autoSchedulePartidos(torneoActivoId);
    showToast("Programación generada con éxito", "success");
  };

  const tabla = calcularPosiciones(partidos, equipos);
  const activosCount = equipos.length;
  const programadosCount = partidos.filter(p => p.estado === "programado" || p.estado === "propuesto").length;
  const finalizadosCount = partidos.filter(p => p.estado === "finalizado").length;

  const handleSaveResult = (golesLocal, golesVisita) => {
    registrarResultado(modalPartido.id, golesLocal, golesVisita);
    setModalPartido(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={{ fontFamily: FONT }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Fixtures</h2>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
            {torneo?.nombre} · {partidos.length} partido{partidos.length !== 1 ? "s" : ""}
            {partidos.length > 0 && ` · ${partidos.filter(p => p.estado === "finalizado").length} finalizados`}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleGenerar}
          disabled={equipos.length < 2}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: equipos.length < 2 ? BORDER : (partidos.length > 0 ? CU_DIM : CU),
            color: equipos.length < 2 ? MUTED : (partidos.length > 0 ? CU : "#FFF"),
            border: partidos.length > 0 ? `1px solid ${CU_BOR}` : "none",
            borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600,
            fontFamily: FONT, cursor: equipos.length < 2 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          <RefreshCw size={13} />
          {partidos.length > 0 ? "Regenerar fixture" : "Generar fixture base"}
        </motion.button>
      </div>

      {partidos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 40 }}>
          {/* Left: Tabla de Posiciones */}
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: ELEV, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart2 size={18} color={CU} />
                <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Tabla de posiciones</span>
              </div>
            </div>
            
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "center" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                    <th style={{ padding: "12px 8px", color: MUTED, fontWeight: 600, width: 40 }}>Pos</th>
                    <th style={{ padding: "12px 8px", color: MUTED, fontWeight: 600, textAlign: "left" }}>Equipo</th>
                    <th style={{ padding: "12px 8px", color: MUTED, fontWeight: 600 }}>PJ</th>
                    <th style={{ padding: "12px 8px", color: MUTED, fontWeight: 600 }}>PG</th>
                    <th style={{ padding: "12px 8px", color: MUTED, fontWeight: 600 }}>PE</th>
                    <th style={{ padding: "12px 8px", color: MUTED, fontWeight: 600 }}>PP</th>
                    <th style={{ padding: "12px 8px", color: MUTED, fontWeight: 600 }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.map((t, i) => (
                    <tr key={t.equipoId} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: i < 3 ? CU : BG, color: i < 3 ? "#FFF" : TEXT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, margin: "0 auto" }}>{i + 1}</div>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, color: TEXT, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: equipos.find(e => e.id === t.equipoId)?.color || CU }} />
                        {t.nombre}
                      </td>
                      <td style={{ padding: "12px 8px" }}>{t.pj}</td>
                      <td style={{ padding: "12px 8px" }}>{t.pg}</td>
                      <td style={{ padding: "12px 8px" }}>{t.pe}</td>
                      <td style={{ padding: "12px 8px" }}>{t.pp}</td>
                      <td style={{ padding: "12px 8px", fontWeight: 800, color: CU }}>{t.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Programación y Autogenerador */}
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: ELEV, padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Calendar size={18} color={TEXT} />
              <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Programación Inteligente</span>
            </div>
            
            <div style={{ background: BG, borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 20, border: `1px solid ${BORDER}` }}>
              <Calendar size={32} color={CU} style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Próxima fecha</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 16 }}>
                El motor asignará automáticamente fechas y horas a los partidos pendientes, evitando superposiciones.
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleAutoProgramar}
                style={{ width: "100%", padding: "12px", background: CU, color: "#FFF", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <CalendarPlus size={16} /> Auto-programar Fixture
              </motion.button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: MUTED, display: "flex", alignItems: "center", gap: 6 }}><List size={14}/> Equipos activos</span>
                <span style={{ fontWeight: 700, color: TEXT }}>{activosCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: MUTED, display: "flex", alignItems: "center", gap: 6 }}><Clock size={14}/> Por jugar / Propuestos</span>
                <span style={{ fontWeight: 700, color: TEXT }}>{programadosCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: MUTED, display: "flex", alignItems: "center", gap: 6 }}><Check size={14}/> Finalizados</span>
                <span style={{ fontWeight: 700, color: TEXT }}>{finalizadosCount}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                style={{ marginTop: 12, width: "100%", padding: "10px", background: "#25D36615", color: "#128C7E", borderRadius: 8, border: "1px solid #25D36630", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Share2 size={14} /> Compartir propuesta a Clubes
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {partidos.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={22} color={CU} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Sin fixture generado</div>
          <div style={{ fontSize: 13, color: MUTED, maxWidth: 340, lineHeight: 1.6 }}>
            {equipos.length < 2
              ? "Agrega al menos 2 equipos para poder generar el fixture."
              : "Haz clic en \"Generar fixture\" para crear los partidos automáticamente."}
          </div>
        </div>
      )}

      {partidos.length > 0 && torneo?.formato === "todos_contra_todos" && (
        <LigaView partidos={partidos} equipos={equipos} arbitros={arbitros} onCardClick={setModalPartido} />
      )}
      {partidos.length > 0 && torneo?.formato === "eliminacion" && (
        <BracketView partidos={partidos} equipos={equipos} arbitros={arbitros} onCardClick={setModalPartido} />
      )}
      {partidos.length > 0 && torneo?.formato === "grupos_playoffs" && (
        <GruposView partidos={partidos} equipos={equipos} arbitros={arbitros} onCardClick={setModalPartido} />
      )}

      <AnimatePresence>
        {modalPartido && (
          <ResultModal
            partido={modalPartido} equipos={equipos}
            onSave={handleSaveResult}
            onClose={() => setModalPartido(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
