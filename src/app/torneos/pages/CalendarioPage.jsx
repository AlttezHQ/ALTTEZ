import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, Plus, X, Zap, User,
  CheckCircle, ChevronDown, ChevronUp,
} from "lucide-react";
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

const DIAS = [
  { d: 1, label: "L" }, { d: 2, label: "M" }, { d: 3, label: "X" },
  { d: 4, label: "J" }, { d: 5, label: "V" }, { d: 6, label: "S" },
  { d: 0, label: "D" },
];

const FASE_SHORT = {
  liga: "Liga", grupos: "Grupo", octavos: "8vos",
  cuartos: "4tos", semis: "Semi", final: "Final", tercer_puesto: "3°",
};

const ESTADO_COLOR = {
  programado: HINT, en_curso: PALETTE.amber ?? "#F59E0B",
  finalizado: PALETTE.success ?? "#22C55E", pendiente: HINT,
};

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: CU, letterSpacing: "0.1em", margin: "18px 0 8px", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function ConfigRow({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, marginBottom: 5, letterSpacing: "0.04em" }}>{label}</div>
      {children}
    </div>
  );
}

const inputSm = {
  border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 10px",
  fontSize: 12, color: TEXT, fontFamily: FONT, background: BG,
  outline: "none", width: "100%", boxSizing: "border-box",
};

export default function CalendarioPage({ onGoTorneos }) {
  const torneoActivoId  = useTorneosStore(s => s.torneoActivoId);
  const allTorneos      = useTorneosStore(s => s.torneos);
  const allEquipos      = useTorneosStore(s => s.equipos);
  const allPartidos     = useTorneosStore(s => s.partidos);
  const allSedes        = useTorneosStore(s => s.sedes);
  const allArbitros     = useTorneosStore(s => s.arbitros);
  const actualizarPartido = useTorneosStore(s => s.actualizarPartido);
  const actualizarCfg   = useTorneosStore(s => s.actualizarSchedulingConfig);
  const agregarSede     = useTorneosStore(s => s.agregarSede);
  const eliminarSede    = useTorneosStore(s => s.eliminarSede);
  const agregarArbitro  = useTorneosStore(s => s.agregarArbitro);
  const eliminarArbitro = useTorneosStore(s => s.eliminarArbitro);
  const autoSchedule    = useTorneosStore(s => s.autoSchedulePartidos);

  const [newSede,    setNewSede]    = useState({ nombre: "", direccion: "" });
  const [newArbitro, setNewArbitro] = useState({ nombre: "", contacto: "" });
  const [editId,     setEditId]     = useState(null);
  const [editData,   setEditData]   = useState({ fechaHora: "", lugar: "" });
  const [scheduled,  setScheduled]  = useState(null); // count after auto-schedule
  const [collapsed,  setCollapsed]  = useState(false);

  if (!torneoActivoId) {
    return (
      <ModuleEmptyState
        icon={Calendar}
        title="Selecciona un torneo"
        subtitle="Abre un torneo para ver y programar su calendario de partidos."
        ctaLabel="Ver torneos"
        onCta={onGoTorneos}
      />
    );
  }

  const torneo  = allTorneos.find(t => t.id === torneoActivoId) ?? null;
  const equipos = allEquipos.filter(e => e.torneoId === torneoActivoId);
  const partidos = allPartidos
    .filter(p => p.torneoId === torneoActivoId && p.equipoLocalId && p.equipoVisitaId)
    .sort((a, b) => {
      if (!a.fechaHora && !b.fechaHora) return a.orden - b.orden;
      if (!a.fechaHora) return 1;
      if (!b.fechaHora) return -1;
      return new Date(a.fechaHora) - new Date(b.fechaHora);
    });
  const sedes    = allSedes.filter(s => s.torneoId === torneoActivoId);
  const arbitros = allArbitros.filter(a => a.torneoId === torneoActivoId);
  const cfg     = torneo?.schedulingConfig ?? {};

  const getNombre = id => equipos.find(e => e.id === id)?.nombre ?? "TBD";

  // Group partidos by date
  const grouped = {};
  for (const p of partidos) {
    const key = p.fechaHora
      ? new Date(p.fechaHora).toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "short" })
      : "Sin fecha";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  const handleAutoSchedule = async () => {
    const count = await autoSchedule(torneoActivoId);
    setScheduled(count);
    setTimeout(() => setScheduled(null), 4000);
  };

  const handleEditSave = async id => {
    await actualizarPartido(id, {
      fechaHora: editData.fechaHora || null,
      lugar:     editData.lugar     || null,
    });
    setEditId(null);
  };

  const toggleDia = async d => {
    const dias = cfg.diasDisponibles ?? [];
    const next = dias.includes(d) ? dias.filter(x => x !== d) : [...dias, d];
    await actualizarCfg(torneoActivoId, { diasDisponibles: next });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={{ fontFamily: FONT, display: "flex", gap: 20, alignItems: "flex-start" }}
    >
      {/* ── LEFT CONFIG PANEL ─────────────────────────────────────────── */}
      <div style={{
        width: 268, flexShrink: 0, background: CARD,
        borderRadius: 14, border: `1px solid ${BORDER}`,
        padding: "18px 16px", boxShadow: ELEV,
      }}>
        {/* Panel header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>Configuración</span>
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 0 }}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              {/* Días disponibles */}
              <SectionLabel>Días disponibles</SectionLabel>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {DIAS.map(({ d, label }) => {
                  const active = (cfg.diasDisponibles ?? []).includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDia(d)}
                      style={{
                        width: 30, height: 30, borderRadius: 6,
                        border: `1.5px solid ${active ? CU : BORDER}`,
                        background: active ? CU_DIM : "transparent",
                        color: active ? CU : MUTED,
                        fontSize: 11, fontWeight: active ? 700 : 400,
                        fontFamily: FONT, cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Horario */}
              <SectionLabel>Horario de juego</SectionLabel>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: HINT, marginBottom: 3 }}>INICIO</div>
                  <input type="time" value={cfg.horaInicio ?? "10:00"}
                    onChange={e => actualizarCfg(torneoActivoId, { horaInicio: e.target.value })}
                    style={inputSm} />
                </div>
                <div style={{ color: HINT, paddingTop: 14, fontSize: 12 }}>→</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: HINT, marginBottom: 3 }}>FIN</div>
                  <input type="time" value={cfg.horaFin ?? "22:00"}
                    onChange={e => actualizarCfg(torneoActivoId, { horaFin: e.target.value })}
                    style={inputSm} />
                </div>
              </div>

              {/* Duración + Descanso + MaxDia */}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <ConfigRow label="DURACIÓN (MIN)">
                  <input type="number" min={30} max={240} value={cfg.duracionMin ?? 90}
                    onChange={e => actualizarCfg(torneoActivoId, { duracionMin: Number(e.target.value) })}
                    style={{ ...inputSm, width: 70 }} />
                </ConfigRow>
                <ConfigRow label="DESCANSO">
                  <input type="number" min={0} max={14} value={cfg.descansoDias ?? 2}
                    onChange={e => actualizarCfg(torneoActivoId, { descansoDias: Number(e.target.value) })}
                    style={{ ...inputSm, width: 50 }} />
                </ConfigRow>
                <ConfigRow label="MÁX/DÍA">
                  <input type="number" min={1} max={20} value={cfg.maxPartidosDia ?? 3}
                    onChange={e => actualizarCfg(torneoActivoId, { maxPartidosDia: Number(e.target.value) })}
                    style={{ ...inputSm, width: 50 }} />
                </ConfigRow>
              </div>

              {/* Sedes */}
              <SectionLabel>Sedes</SectionLabel>
              {sedes.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <MapPin size={11} color={CU} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.nombre}</span>
                  <button onClick={async () => await eliminarSede(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: HINT, padding: 0 }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text" placeholder="Nombre de la sede" value={newSede.nombre}
                  onChange={e => setNewSede(v => ({ ...v, nombre: e.target.value }))}
                  onKeyDown={async e => {
                    if (e.key === "Enter" && newSede.nombre.trim()) {
                      await agregarSede(torneoActivoId, newSede);
                      setNewSede({ nombre: "", direccion: "" });
                    }
                  }}
                  style={{ ...inputSm, flex: 1 }}
                />
                <button
                  onClick={async () => {
                    if (!newSede.nombre.trim()) return;
                    await agregarSede(torneoActivoId, newSede);
                    setNewSede({ nombre: "", direccion: "" });
                  }}
                  style={{ background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 6, padding: "0 8px", cursor: "pointer", color: CU }}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Árbitros */}
              <SectionLabel>Árbitros</SectionLabel>
              {arbitros.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <User size={11} color={CU} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nombre}</span>
                  <button onClick={async () => await eliminarArbitro(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: HINT, padding: 0 }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text" placeholder="Nombre del árbitro" value={newArbitro.nombre}
                  onChange={e => setNewArbitro(v => ({ ...v, nombre: e.target.value }))}
                  onKeyDown={async e => {
                    if (e.key === "Enter" && newArbitro.nombre.trim()) {
                      await agregarArbitro(torneoActivoId, newArbitro);
                      setNewArbitro({ nombre: "", contacto: "" });
                    }
                  }}
                  style={{ ...inputSm, flex: 1 }}
                />
                <button
                  onClick={async () => {
                    if (!newArbitro.nombre.trim()) return;
                    await agregarArbitro(torneoActivoId, newArbitro);
                    setNewArbitro({ nombre: "", contacto: "" });
                  }}
                  style={{ background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 6, padding: "0 8px", cursor: "pointer", color: CU }}
                >
                  <Plus size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-schedule button */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleAutoSchedule}
          disabled={partidos.length === 0}
          style={{
            marginTop: 16, width: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 7,
            background: partidos.length === 0 ? BORDER : CU,
            color: partidos.length === 0 ? MUTED : "#FFF",
            border: "none", borderRadius: 8, padding: "11px 0",
            fontSize: 13, fontWeight: 600, fontFamily: FONT,
            cursor: partidos.length === 0 ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          <Zap size={14} />
          Programar automáticamente
        </motion.button>

        <AnimatePresence>
          {scheduled !== null && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: PALETTE.success ?? "#22C55E" }}
            >
              <CheckCircle size={13} />
              {scheduled} partido{scheduled !== 1 ? "s" : ""} programado{scheduled !== 1 ? "s" : ""}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── RIGHT SCHEDULE LIST ────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>Calendario</h2>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
              {torneo?.nombre} · {partidos.length} partido{partidos.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {partidos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: MUTED, fontSize: 13 }}>
            Genera el fixture primero, luego programa el calendario.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {Object.entries(grouped).map(([dateLabel, ps]) => (
              <div key={dateLabel}>
                {/* Date group header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: CU,
                    textTransform: "capitalize", letterSpacing: "0.02em",
                  }}>
                    {dateLabel}
                  </div>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${CU_BOR}, ${BORDER})` }} />
                  <div style={{ fontSize: 10, color: HINT }}>
                    {ps.length} partido{ps.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {ps.map(p => {
                    const isEdit = editId === p.id;
                    const fecha  = p.fechaHora ? new Date(p.fechaHora) : null;
                    const estadoColor = ESTADO_COLOR[p.estado] ?? HINT;
                    const arbitroNombre = arbitros.find(a => a.id === p.arbitroId)?.nombre;

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: EASE }}
                        style={{
                          background: CARD, borderRadius: 10,
                          border: `1px solid ${BORDER}`,
                          padding: isEdit ? "14px 16px" : "12px 16px",
                          boxShadow: "0 2px 8px rgba(23,26,28,0.04)",
                        }}
                      >
                        {isEdit ? (
                          /* Edit mode */
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: CU }}>
                                {getNombre(p.equipoLocalId)} vs {getNombre(p.equipoVisitaId)}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                              <input type="datetime-local" value={editData.fechaHora}
                                onChange={e => setEditData(d => ({ ...d, fechaHora: e.target.value }))}
                                style={{ ...inputSm, width: "auto", flex: 1, minWidth: 180 }} />
                              <input type="text" placeholder="Sede / Lugar" value={editData.lugar}
                                onChange={e => setEditData(d => ({ ...d, lugar: e.target.value }))}
                                style={{ ...inputSm, width: "auto", flex: 1, minWidth: 120 }} />
                              <button onClick={() => handleEditSave(p.id)}
                                style={{ background: CU_DIM, border: `1px solid ${CU_BOR}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: CU, fontSize: 12, fontFamily: FONT }}>
                                Guardar
                              </button>
                              <button onClick={() => setEditId(null)}
                                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: MUTED }}>
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View mode */
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {/* Fase badge */}
                            <span style={{
                              fontSize: 9, fontWeight: 700, color: CU,
                              background: CU_DIM, border: `1px solid ${CU_BOR}`,
                              borderRadius: 4, padding: "2px 6px", flexShrink: 0,
                              whiteSpace: "nowrap",
                            }}>
                              {FASE_SHORT[p.fase] ?? p.fase}{p.grupo ? ` ${p.grupo}` : ""}
                            </span>

                            {/* Teams */}
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                              <span style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {getNombre(p.equipoLocalId)}
                              </span>
                              <span style={{
                                fontSize: 11, fontWeight: 700, color: estadoColor,
                                minWidth: 40, textAlign: "center", flexShrink: 0,
                              }}>
                                {p.estado === "finalizado" ? `${p.golesLocal} – ${p.golesVisita}` : "vs"}
                              </span>
                              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {getNombre(p.equipoVisitaId)}
                              </span>
                            </div>

                            {/* Meta: time + sede + árbitro */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                              {fecha && (
                                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: MUTED }}>
                                  <Clock size={9} />
                                  {fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              )}
                              {p.lugar && (
                                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: HINT }}>
                                  <MapPin size={9} />{p.lugar}
                                </div>
                              )}
                              {arbitroNombre && (
                                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: HINT }}>
                                  <User size={9} />{arbitroNombre}
                                </div>
                              )}
                              {!fecha && <span style={{ fontSize: 10, color: HINT }}>Sin fecha</span>}
                            </div>

                            {/* Edit button */}
                            <button
                              onClick={() => { setEditId(p.id); setEditData({ fechaHora: p.fechaHora?.slice(0, 16) ?? "", lugar: p.lugar ?? "" }); }}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: MUTED, flexShrink: 0 }}
                            >
                              <Clock size={11} />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
