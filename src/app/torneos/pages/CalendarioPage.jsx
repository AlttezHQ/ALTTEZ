import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
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

const FILTROS = [
  { id: "todos",      label: "Todos" },
  { id: "programado", label: "Programados" },
  { id: "en_curso",   label: "En curso" },
  { id: "finalizado", label: "Finalizados" },
];

const FASE_SHORT = { liga: "Liga", grupos: "Grupo", octavos: "8vos", cuartos: "4tos", semis: "Semi", final: "Final", tercer_puesto: "3°" };

export default function CalendarioPage({ onGoTorneos }) {
  const torneoActivoId   = useTorneosStore(s => s.torneoActivoId);
  const getTorneoById    = useTorneosStore(s => s.getTorneoById);
  const getEquipos       = useTorneosStore(s => s.getEquiposByTorneo);
  const getPartidos      = useTorneosStore(s => s.getPartidosByTorneo);
  const actualizarPartido = useTorneosStore(s => s.actualizarPartido);

  const [filtro, setFiltro] = useState("todos");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ fechaHora: "", lugar: "" });

  if (!torneoActivoId) {
    return <ModuleEmptyState icon={Calendar} title="Selecciona un torneo" subtitle="Abre un torneo para ver su calendario de partidos." ctaLabel="Ver torneos" onCta={onGoTorneos} />;
  }

  const torneo  = getTorneoById(torneoActivoId);
  const equipos = getEquipos(torneoActivoId);
  const partidos = getPartidos(torneoActivoId)
    .filter(p => p.equipoLocalId && p.equipoVisitaId)
    .sort((a, b) => {
      if (!a.fechaHora && !b.fechaHora) return a.orden - b.orden;
      if (!a.fechaHora) return 1;
      if (!b.fechaHora) return -1;
      return new Date(a.fechaHora) - new Date(b.fechaHora);
    });

  const getNombre = id => equipos.find(e => e.id === id)?.nombre ?? "TBD";
  const filtered  = filtro === "todos" ? partidos : partidos.filter(p => p.estado === filtro);

  const handleEditSave = (id) => {
    actualizarPartido(id, { fechaHora: editData.fechaHora || null, lugar: editData.lugar || null });
    setEditId(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }} style={{ fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Calendario</h2>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{torneo?.nombre} · {filtered.length} partido{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        {/* Filtros */}
        <div style={{ display: "flex", gap: 4 }}>
          {FILTROS.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              style={{
                padding: "6px 12px", borderRadius: 7, border: `1px solid ${filtro === f.id ? CU : BORDER}`,
                background: filtro === f.id ? CU_DIM : BG,
                color: filtro === f.id ? CU : MUTED,
                fontSize: 11, fontWeight: filtro === f.id ? 600 : 400,
                fontFamily: FONT, cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!partidos.length ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: MUTED, fontSize: 13 }}>
          Genera el fixture primero para ver los partidos en el calendario.
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: MUTED, fontSize: 13 }}>
          No hay partidos con el filtro seleccionado.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((p, i) => {
            const isEdit = editId === p.id;
            const fecha  = p.fechaHora ? new Date(p.fechaHora) : null;
            const estadoColor = { programado: HINT, en_curso: PALETTE.amber, finalizado: PALETTE.success, pendiente: HINT }[p.estado] ?? HINT;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
                style={{ background: CARD, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "14px 16px", boxShadow: "0 2px 8px rgba(23,26,28,0.04)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Fase badge */}
                  <div style={{ width: 48, flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: CU, background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "2px 5px" }}>
                      {FASE_SHORT[p.fase] ?? p.fase}{p.grupo ? ` ${p.grupo}` : ""}
                    </span>
                  </div>

                  {/* Teams */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 600, color: TEXT }}>{getNombre(p.equipoLocalId)}</span>
                    <span style={{ fontSize: 11, color: estadoColor, fontWeight: 700, minWidth: 48, textAlign: "center" }}>
                      {p.estado === "finalizado" ? `${p.golesLocal} – ${p.golesVisita}` : "vs"}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TEXT }}>{getNombre(p.equipoVisitaId)}</span>
                  </div>

                  {/* Date/place or edit */}
                  {isEdit ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="datetime-local" value={editData.fechaHora} onChange={e => setEditData(d => ({ ...d, fechaHora: e.target.value }))}
                        style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, fontFamily: FONT, background: BG, outline: "none", color: TEXT }} />
                      <input type="text" placeholder="Lugar" value={editData.lugar} onChange={e => setEditData(d => ({ ...d, lugar: e.target.value }))}
                        style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, fontFamily: FONT, background: BG, outline: "none", color: TEXT, width: 100 }} />
                      <button onClick={() => handleEditSave(p.id)} style={{ background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: CU, fontSize: 11 }}>✓</button>
                      <button onClick={() => setEditId(null)} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: MUTED, fontSize: 11 }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      {fecha ? (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: MUTED }}>
                            <Clock size={10} />{fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })} {fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {p.lugar && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: HINT }}><MapPin size={9} />{p.lugar}</div>}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: HINT }}>Sin fecha</span>
                      )}
                      <button
                        onClick={() => { setEditId(p.id); setEditData({ fechaHora: p.fechaHora?.slice(0, 16) ?? "", lugar: p.lugar ?? "" }); }}
                        style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: MUTED }}
                      >
                        <Clock size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
