import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar as CalendarIcon, Clock, MapPin, Plus, Flag, CheckCircle, Circle, PlayCircle, XCircle } from "lucide-react";
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

import { useTorneosStore } from "../store/useTorneosStore";

export default function ProgramacionPage() {
  const torneoActivoId = useTorneosStore(s => s.torneoActivoId);
  const torneos = useTorneosStore(s => s.torneos);
  const equipos = useTorneosStore(s => s.equipos);
  const sedes = useTorneosStore(s => s.sedes);
  const arbitros = useTorneosStore(s => s.arbitros);
  const allPartidos = useTorneosStore(s => s.partidos);
  const actualizarPartido = useTorneosStore(s => s.actualizarPartido);
  const reprogramarPartido = useTorneosStore(s => s.reprogramarPartido);
  const reprogramarPartidoAvanzado = useTorneosStore(s => s.reprogramarPartidoAvanzado);

  const [selectedPartidoId, setSelectedPartidoId] = useState(null);
  const [solicitadoPor, setSolicitadoPor] = useState("ambos");
  const [partidoReemplazoId, setPartidoReemplazoId] = useState("");

  const [form, setForm] = useState({
    fecha: "",
    hora: "",
    sedeId: "",
    arbitroId: "",
    estado: "programado",
    notas: "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const torneo = torneos.find(t => t.id === torneoActivoId);
  const partidosTorneo = allPartidos.filter(p => p.torneoId === torneoActivoId);
  
  // Agrupar por jornada/ronda
  const rondas = [...new Set(partidosTorneo.map(p => p.ronda).filter(Boolean))].sort((a,b) => a - b);
  const [selectedRonda, setSelectedRonda] = useState(rondas[0] ?? null);

  const partidosRonda = partidosTorneo.filter(p => p.ronda === selectedRonda);
  const selectedPartido = partidosRonda.find(p => p.id === selectedPartidoId);

  const inp = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1px solid ${BORDER}`, background: BG,
    fontFamily: FONT, fontSize: 13, color: TEXT, outline: "none",
    boxSizing: "border-box"
  };

  const lbl = {
    display: "block", fontSize: 11, fontWeight: 600, color: MUTED,
    marginBottom: 6, fontFamily: FONT
  };

  return (
    <div style={{ fontFamily: FONT }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
          Programación de partidos
        </h1>
        <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
          Configura partidos por torneo y jornada
        </p>
      </div>

      {/* Top filters */}
      <div style={{
        background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`,
        padding: "16px 20px", display: "flex", gap: 20, marginBottom: 24,
        boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ ...lbl, color: CU }}>Torneo / Categoría</label>
          <div style={{ position: "relative" }}>
            <select style={{ ...inp, appearance: "none", paddingLeft: 38, cursor: "not-allowed", border: `1px solid ${CU_BOR}`, color: TEXT }} disabled>
              <option>{torneo ? torneo.nombre : "Selecciona un torneo"}</option>
            </select>
            <Trophy size={16} color={CU} style={{ position: "absolute", left: 14, top: 11 }} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ ...lbl, color: CU }}>Fecha / Jornada</label>
          <div style={{ position: "relative" }}>
            <select 
              style={{ ...inp, appearance: "none", paddingLeft: 38, cursor: "pointer", border: `1px solid ${CU_BOR}`, color: TEXT }}
              value={selectedRonda || ""}
              onChange={e => setSelectedRonda(Number(e.target.value))}
            >
              {rondas.map(r => (
                <option key={r} value={r}>Jornada {r}</option>
              ))}
              {rondas.length === 0 && <option>Sin jornadas</option>}
            </select>
            <CalendarIcon size={16} color={CU} style={{ position: "absolute", left: 14, top: 11 }} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        
        {/* Form Container */}
        <div style={{
          background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`,
          padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.02)", opacity: selectedPartido ? 1 : 0.5, pointerEvents: selectedPartido ? "auto" : "none"
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "0 0 24px" }}>
            {selectedPartido ? "Editar partido" : "Selecciona un partido"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center", marginBottom: 20 }}>
            <div style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: TEXT }}>
              {selectedPartido ? equipos.find(e => e.id === selectedPartido.equipoLocalId)?.nombre : "Local"}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: CU, background: CU_DIM, padding: "4px 8px", borderRadius: 6 }}>VS</div>
            <div style={{ textAlign: "left", fontSize: 14, fontWeight: 700, color: TEXT }}>
              {selectedPartido ? equipos.find(e => e.id === selectedPartido.equipoVisitaId)?.nombre : "Visitante"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={lbl}>Fecha</label>
              <div style={{ position: "relative" }}>
                <input type="date" style={{ ...inp, paddingLeft: 38 }} value={form.fecha} onChange={e => update("fecha", e.target.value)} />
                <CalendarIcon size={16} color={MUTED} style={{ position: "absolute", left: 12, top: 11 }} />
              </div>
            </div>
            <div>
              <label style={lbl}>Hora</label>
              <div style={{ position: "relative" }}>
                <input type="time" style={{ ...inp, paddingLeft: 38 }} value={form.hora} onChange={e => update("hora", e.target.value)} />
                <Clock size={16} color={MUTED} style={{ position: "absolute", left: 12, top: 11 }} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={lbl}>Sede</label>
              <div style={{ position: "relative" }}>
                <select style={{ ...inp, paddingLeft: 38 }} value={form.sedeId} onChange={e => update("sedeId", e.target.value)}>
                  <option value="">Seleccionar sede...</option>
                  {sedes.filter(s => s.torneoId === torneoActivoId).map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
                <MapPin size={16} color={MUTED} style={{ position: "absolute", left: 12, top: 11 }} />
              </div>
            </div>
            <div>
              <label style={lbl}>Árbitro</label>
              <div style={{ position: "relative" }}>
                <select style={{ ...inp, paddingLeft: 38 }} value={form.arbitroId} onChange={e => update("arbitroId", e.target.value)}>
                  <option value="">Seleccionar árbitro...</option>
                  {arbitros.filter(a => a.torneoId === torneoActivoId).map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
                <Flag size={16} color={MUTED} style={{ position: "absolute", left: 12, top: 11 }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Estado</label>
            <div style={{ position: "relative" }}>
              <select style={{ ...inp, paddingLeft: 38 }} value={form.estado} onChange={e => update("estado", e.target.value)}>
                <option value="propuesto">Propuesto</option>
                <option value="programado">Programado</option>
                <option value="aplazado">Aplazado</option>
              </select>
              <Circle size={16} color={form.estado === "aplazado" ? PALETTE.error : MUTED} style={{ position: "absolute", left: 12, top: 11 }} />
            </div>
          </div>

          {form.estado === "aplazado" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginBottom: 20, padding: 12, background: "rgba(239, 68, 68, 0.05)", borderRadius: 8, border: `1px dashed rgba(239, 68, 68, 0.3)` }}>
              <label style={lbl}>Aplazamiento solicitado por:</label>
              <select style={{ ...inp, marginBottom: 12 }} value={solicitadoPor} onChange={e => {
                setSolicitadoPor(e.target.value);
                setPartidoReemplazoId("");
              }}>
                <option value="ambos">Ambos / Fuerza Mayor</option>
                <option value={selectedPartido?.equipoLocalId}>{equipos.find(e => e.id === selectedPartido?.equipoLocalId)?.nombre}</option>
                <option value={selectedPartido?.equipoVisitaId}>{equipos.find(e => e.id === selectedPartido?.equipoVisitaId)?.nombre}</option>
              </select>

              {solicitadoPor !== "ambos" && (
                <>
                  <label style={lbl}>Adelantar partido para el equipo disponible:</label>
                  <select style={{ ...inp }} value={partidoReemplazoId} onChange={e => setPartidoReemplazoId(e.target.value)}>
                    <option value="">No adelantar (Dejar libre)</option>
                    {(() => {
                      const equipoDisponibleId = solicitadoPor === selectedPartido?.equipoLocalId ? selectedPartido?.equipoVisitaId : selectedPartido?.equipoLocalId;
                      const futuros = allPartidos.filter(p => 
                        p.id !== selectedPartido?.id &&
                        (p.equipoLocalId === equipoDisponibleId || p.equipoVisitaId === equipoDisponibleId) &&
                        p.estado !== "finalizado" && p.estado !== "en_curso"
                      );
                      
                      return futuros.map(p => {
                        const rivalId = p.equipoLocalId === equipoDisponibleId ? p.equipoVisitaId : p.equipoLocalId;
                        const rival = equipos.find(e => e.id === rivalId);
                        return <option key={p.id} value={p.id}>vs {rival?.nombre} (Fase: {p.fase})</option>;
                      });
                    })()}
                  </select>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.4 }}>
                    El partido seleccionado ocupará la fecha/hora actual, y el partido original será movido al final del fixture.
                  </div>
                </>
              )}
            </motion.div>
          )}

          {form.estado === "aplazado" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginBottom: 20, padding: 12, background: "rgba(239, 68, 68, 0.05)", borderRadius: 8, border: `1px dashed rgba(239, 68, 68, 0.3)` }}>
              <label style={lbl}>Aplazamiento solicitado por:</label>
              <select style={{ ...inp, marginBottom: 12 }} value={solicitadoPor} onChange={e => {
                setSolicitadoPor(e.target.value);
                setPartidoReemplazoId("");
              }}>
                <option value="ambos">Ambos / Fuerza Mayor</option>
                <option value={selectedPartido?.equipoLocalId}>{equipos.find(e => e.id === selectedPartido?.equipoLocalId)?.nombre}</option>
                <option value={selectedPartido?.equipoVisitaId}>{equipos.find(e => e.id === selectedPartido?.equipoVisitaId)?.nombre}</option>
              </select>

              {solicitadoPor !== "ambos" && (
                <>
                  <label style={lbl}>Adelantar partido para el equipo disponible:</label>
                  <select style={{ ...inp }} value={partidoReemplazoId} onChange={e => setPartidoReemplazoId(e.target.value)}>
                    <option value="">No adelantar (Dejar libre)</option>
                    {(() => {
                      const equipoDisponibleId = solicitadoPor === selectedPartido?.equipoLocalId ? selectedPartido?.equipoVisitaId : selectedPartido?.equipoLocalId;
                      // Buscar futuros partidos del equipo disponible
                      const futuros = allPartidos.filter(p => 
                        p.id !== selectedPartido?.id &&
                        (p.equipoLocalId === equipoDisponibleId || p.equipoVisitaId === equipoDisponibleId) &&
                        p.estado !== "finalizado" && p.estado !== "en_curso"
                      );
                      
                      return futuros.map(p => {
                        const rivalId = p.equipoLocalId === equipoDisponibleId ? p.equipoVisitaId : p.equipoLocalId;
                        const rival = equipos.find(e => e.id === rivalId);
                        return <option key={p.id} value={p.id}>vs {rival?.nombre} (Fase: {p.fase})</option>;
                      });
                    })()}
                  </select>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.4 }}>
                    El partido seleccionado ocupará la fecha/hora actual, y el partido original será movido al final del fixture.
                  </div>
                </>
              )}
            </motion.div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={lbl}>Notas (opcional)</label>
            <textarea 
              style={{ ...inp, minHeight: 80, resize: "vertical" }}
              placeholder="Agregar notas del partido..."
              value={form.notas}
              onChange={e => update("notas", e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPartidoId(null)}
              style={{
                padding: "10px 20px", borderRadius: 10, border: `1px solid ${BORDER}`,
                background: BG, color: TEXT, fontSize: 13, fontWeight: 600,
                fontFamily: FONT, cursor: "pointer"
              }}
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={async () => {
                if (form.estado === "aplazado") {
                  if (partidoReemplazoId) {
                    await reprogramarPartidoAvanzado(selectedPartidoId, partidoReemplazoId);
                  } else {
                    await reprogramarPartido(selectedPartidoId);
                  }
                } else {
                  const d = new Date(form.fecha + "T" + (form.hora || "00:00") + ":00");
                  await actualizarPartido(selectedPartidoId, {
                    fechaHora: d.toISOString(),
                    sedeId: form.sedeId,
                    arbitroId: form.arbitroId,
                    estado: form.estado,
                    notas: form.notas,
                  });
                }
                setSelectedPartidoId(null);
              }}
              style={{
                padding: "10px 20px", borderRadius: 10, border: "none",
                background: form.estado === "aplazado" ? PALETTE.error : `linear-gradient(135deg, ${CU}, #A66F38)`, color: "#FFF",
                fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8
              }}
            >
              {form.estado === "aplazado" ? <XCircle size={16} /> : <CheckCircle size={16} />}
              {form.estado === "aplazado" ? "Aplazar y reprogramar" : "Guardar cambios"}
            </motion.button>
          </div>
        </div>

        {/* Partidos List */}
        <div style={{
          background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`,
          padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.02)", maxHeight: "calc(100vh - 200px)", overflowY: "auto"
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "0 0 20px" }}>Jornada {selectedRonda}</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {partidosRonda.map(p => {
              const local = equipos.find(e => e.id === p.equipoLocalId);
              const visita = equipos.find(e => e.id === p.equipoVisitaId);
              const selected = selectedPartidoId === p.id;
              
              let color = MUTED;
              if (p.estado === "propuesto") color = HINT;
              if (p.estado === "programado") color = PALETTE.success;
              if (p.estado === "aplazado") color = PALETTE.error;
              
              return (
                <div 
                  key={p.id}
                  onClick={() => {
                    setSelectedPartidoId(p.id);
                    setSolicitadoPor("ambos");
                    setPartidoReemplazoId("");
                    const d = p.fechaHora ? new Date(p.fechaHora) : null;
                    setForm({
                      fecha: d ? d.toISOString().slice(0, 10) : "",
                      hora: d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "",
                      sedeId: p.sedeId || "",
                      arbitroId: p.arbitroId || "",
                      estado: p.estado || "propuesto",
                      notas: p.notas || ""
                    });
                  }}
                  style={{
                    padding: 12, borderRadius: 10, border: `1px solid ${selected ? CU : BORDER}`,
                    background: selected ? CU_DIM : BG, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase" }}>{p.estado}</span>
                    {p.fechaHora && (
                      <span style={{ fontSize: 10, color: MUTED }}>
                        {new Date(p.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>{local?.nombre || "TBD"}</span>
                    <span style={{ fontSize: 10, color: HINT }}>vs</span>
                    <span>{visita?.nombre || "TBD"}</span>
                  </div>
                </div>
              );
            })}
            
            {partidosRonda.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CalendarIcon size={20} color={CU} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Sin partidos</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
