import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, RefreshCw, Edit2, Check, X } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { generarFixture } from "../utils/fixturesEngine";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
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

const FASE_LABELS = {
  liga: "Liga", grupos: "Grupos", octavos: "Octavos de final",
  cuartos: "Cuartos de final", semis: "Semifinales",
  final: "Final", tercer_puesto: "Tercer puesto",
};

function EstadoBadge({ estado }) {
  const cfg = {
    programado: { label: "Programado", color: MUTED,           bg: BG },
    en_curso:   { label: "En curso",   color: PALETTE.amber,   bg: PALETTE.amberDim },
    finalizado: { label: "Finalizado", color: PALETTE.success, bg: PALETTE.successDim },
    bye:        { label: "BYE",        color: HINT,            bg: BG },
    pendiente:  { label: "Pendiente",  color: HINT,            bg: BG },
  }[estado] ?? { label: estado, color: MUTED, bg: BG };

  return (
    <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.bg, borderRadius: 4, padding: "2px 7px", border: `1px solid ${cfg.color}33` }}>
      {cfg.label}
    </span>
  );
}

function ResultadoModal({ partido, equipos, onClose, onSave }) {
  const [gl, setGl] = useState(partido.golesLocal ?? 0);
  const [gv, setGv] = useState(partido.golesVisita ?? 0);
  const local  = equipos.find(e => e.id === partido.equipoLocalId);
  const visita = equipos.find(e => e.id === partido.equipoVisitaId);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(23,26,28,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, fontFamily: FONT }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        style={{ background: CARD, borderRadius: 14, width: 380, padding: 28, boxShadow: "0 24px 64px rgba(23,26,28,0.18)", border: `1px solid ${BORDER}` }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Registrar resultado</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}><X size={16} /></button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{local?.nombre ?? "Local"}</div>
            <input
              type="number" min={0} value={gl}
              onChange={e => setGl(Number(e.target.value))}
              style={{ width: 64, textAlign: "center", fontSize: 24, fontWeight: 700, color: TEXT, border: `2px solid ${CU}`, borderRadius: 10, padding: "8px 0", background: CU_DIM, outline: "none", fontFamily: FONT }}
            />
          </div>
          <span style={{ fontSize: 18, color: HINT, fontWeight: 700 }}>–</span>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{visita?.nombre ?? "Visita"}</div>
            <input
              type="number" min={0} value={gv}
              onChange={e => setGv(Number(e.target.value))}
              style={{ width: 64, textAlign: "center", fontSize: 24, fontWeight: 700, color: TEXT, border: `2px solid ${CU}`, borderRadius: 10, padding: "8px 0", background: CU_DIM, outline: "none", fontFamily: FONT }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", fontSize: 13, color: MUTED, fontFamily: FONT, cursor: "pointer" }}>Cancelar</button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onSave(partido.id, gl, gv)}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: CU, color: "#FFF", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
          >
            Guardar
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function FixturesPage({ onGoTorneos }) {
  const torneoActivoId     = useTorneosStore(s => s.torneoActivoId);
  const getTorneoById      = useTorneosStore(s => s.getTorneoById);
  const getEquipos         = useTorneosStore(s => s.getEquiposByTorneo);
  const getPartidos        = useTorneosStore(s => s.getPartidosByTorneo);
  const setPartidos        = useTorneosStore(s => s.setPartidos);
  const registrarResultado = useTorneosStore(s => s.registrarResultado);

  const [modalPartido, setModalPartido] = useState(null);

  if (!torneoActivoId) {
    return <ModuleEmptyState icon={List} title="Selecciona un torneo" subtitle="Abre un torneo para ver y gestionar sus fixtures." ctaLabel="Ver torneos" onCta={onGoTorneos} />;
  }

  const torneo  = getTorneoById(torneoActivoId);
  const equipos = getEquipos(torneoActivoId);
  const partidos = getPartidos(torneoActivoId);

  const handleGenerar = () => {
    if (!window.confirm("¿Regenerar el fixture? Se perderán los resultados actuales.")) return;
    const nuevo = generarFixture(torneo, equipos);
    setPartidos(torneoActivoId, nuevo);
  };

  const handleGuardarResultado = (id, gl, gv) => {
    registrarResultado(id, gl, gv);
    setModalPartido(null);
  };

  // Agrupar por fase
  const fases = [...new Set(partidos.map(p => p.fase))];

  const getNombre = (id) => equipos.find(e => e.id === id)?.nombre ?? "TBD";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }} style={{ fontFamily: FONT }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Fixtures</h2>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{torneo?.nombre} · {partidos.length} partido{partidos.length !== 1 ? "s" : ""}</div>
        </div>
        {equipos.length >= 2 && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleGenerar}
            style={{ display: "flex", alignItems: "center", gap: 7, background: BG, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
          >
            <RefreshCw size={14} />{partidos.length > 0 ? "Regenerar" : "Generar fixture"}
          </motion.button>
        )}
      </div>

      {partidos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: MUTED, fontSize: 13, lineHeight: 1.7 }}>
          {equipos.length < 2
            ? "Necesitas al menos 2 equipos para generar un fixture.\nAgrega equipos en la sección Equipos."
            : "Haz clic en \"Generar fixture\" para crear los partidos automáticamente."}
        </div>
      ) : (
        fases.map(fase => {
          const ps = partidos.filter(p => p.fase === fase).sort((a, b) => {
            if (a.grupo && b.grupo && a.grupo !== b.grupo) return a.grupo.localeCompare(b.grupo);
            return a.orden - b.orden;
          });
          return (
            <div key={fase} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
                {FASE_LABELS[fase] ?? fase}
              </div>
              <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: ELEV }}>
                {ps.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: i < ps.length - 1 ? `1px solid ${BORDER}` : "none", gap: 12 }}>
                    {/* Grupo badge */}
                    {p.grupo && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: CU, background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "1px 6px", flexShrink: 0 }}>
                        Grupo {p.grupo}
                      </span>
                    )}

                    {/* Teams & score */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {getNombre(p.equipoLocalId)}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        {p.estado === "finalizado" ? (
                          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, minWidth: 44, textAlign: "center" }}>
                            {p.golesLocal} – {p.golesVisita}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: HINT, minWidth: 44, textAlign: "center" }}>vs</span>
                        )}
                      </div>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {getNombre(p.equipoVisitaId)}
                      </span>
                    </div>

                    <EstadoBadge estado={p.estado} />

                    {/* Edit result */}
                    {p.equipoLocalId && p.equipoVisitaId && p.estado !== "bye" && (
                      <button
                        onClick={() => setModalPartido(p)}
                        style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: MUTED, flexShrink: 0 }}
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      <AnimatePresence>
        {modalPartido && (
          <ResultadoModal
            partido={modalPartido}
            equipos={equipos}
            onClose={() => setModalPartido(null)}
            onSave={handleGuardarResultado}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
