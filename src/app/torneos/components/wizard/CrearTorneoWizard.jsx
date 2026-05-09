import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Plus, X } from "lucide-react";
import { useTorneosStore } from "../../store/useTorneosStore";
import { generarFixture } from "../../utils/fixturesEngine";
import { PALETTE } from "../../../../shared/tokens/palette";

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

const SPORTS  = ["Fútbol", "Básquet", "Vóleibol", "Tenis", "Pádel", "Rugby", "Otro"];
const FORMATS = ["Todos contra todos", "Eliminación directa", "Grupos + Playoffs"];
const FASE_OPTIONS = [
  { id: "todos_contra_todos", label: "Todos contra todos", desc: "Todos los equipos se enfrentan entre sí." },
  { id: "eliminacion",        label: "Eliminación directa", desc: "Partidos de eliminación desde la primera ronda." },
  { id: "grupos_playoffs",    label: "Grupos + Playoffs", desc: "Fase de grupos seguida de eliminación directa." },
];
const FORMAT_MAP = { "Todos contra todos": "todos_contra_todos", "Eliminación directa": "eliminacion", "Grupos + Playoffs": "grupos_playoffs" };
const STEP_LABELS = ["Información básica", "Equipos", "Fases", "Confirmar"];

function WizardStepper({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "20px 0 28px" }}>
      {[1, 2, 3, 4].map((n, i) => (
        <div key={n} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: n <= step ? CU : "transparent",
            border: `2px solid ${n <= step ? CU : BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.25s",
          }}>
            {n < step
              ? <CheckCircle size={14} color="#FFF" />
              : <span style={{ fontSize: 12, fontWeight: 700, color: n === step ? "#FFF" : HINT }}>{n}</span>}
          </div>
          {i < 3 && <div style={{ flex: 1, height: 2, margin: "0 6px", background: n < step ? CU : BORDER, transition: "background 0.3s" }} />}
        </div>
      ))}
    </div>
  );
}

export default function CrearTorneoWizard({ onFinish, onBack, initialData = null }) {
  const crearTorneo     = useTorneosStore(s => s.crearTorneo);
  const actualizarTorneo = useTorneosStore(s => s.actualizarTorneo);
  const agregarEquipos  = useTorneosStore(s => s.agregarEquipos);
  const setPartidos     = useTorneosStore(s => s.setPartidos);

  const isEditing = !!initialData;
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    nombre: initialData?.nombre || "", 
    deporte: initialData?.deporte || "Fútbol", 
    formato: initialData?.formato || "todos_contra_todos",
    fecha: initialData?.fechaInicio || "", 
    fechaFin: initialData?.fechaFin || "",
    equipos: ["", ""], 
    numGrupos: initialData?.numGrupos || 2,
  });

  const update = (key, val) => setData(d => ({ ...d, [key]: val }));

  const handleNext = async () => {
    if (step < 4) { setStep(s => s + 1); return; }
    // Step 4: commit to store
    if (isEditing) {
      await actualizarTorneo(initialData.id, {
        nombre: data.nombre,
        deporte: data.deporte,
        formato: data.formato,
        fechaInicio: data.fecha,
        fechaFin: data.fechaFin,
        numGrupos: data.numGrupos
      });
    } else {
      const torneo  = await crearTorneo(data);
      const equipoNombres = data.equipos.filter(Boolean);
      if (equipoNombres.length) {
        const equipos = await agregarEquipos(torneo.id, equipoNombres);
        if (equipos.length >= 2) {
          const partidos = generarFixture(torneo, equipos);
          await setPartidos(torneo.id, partidos);
        }
      }
    }
    onFinish?.();
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: FONT }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 13, fontFamily: FONT, padding: 0 }}
        >
          <ArrowLeft size={14} />Volver
        </button>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "3px 8px" }}>
          Paso {step} de 4 · {STEP_LABELS[step - 1]}
        </span>
      </div>

      <h2 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>{isEditing ? "Editar torneo" : "Crear torneo"}</h2>
      <WizardStepper step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: EASE }}
        >

          {/* Step 1 — Básicos */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="NOMBRE DEL TORNEO">
                <input type="text" value={data.nombre} placeholder="Ej: Copa Primavera 2026"
                  onChange={e => update("nombre", e.target.value)}
                  style={inputStyle} />
              </Field>
              <Field label="DEPORTE">
                <select value={data.deporte} onChange={e => update("deporte", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <div style={{ display: "flex", gap: 16 }}>
                <Field label="FECHA DE INICIO" style={{ flex: 1 }}>
                  <input type="date" value={data.fecha} onChange={e => update("fecha", e.target.value)} style={inputStyle} />
                </Field>
                <Field label="FECHA DE FIN" style={{ flex: 1 }}>
                  <input type="date" value={data.fechaFin} onChange={e => update("fechaFin", e.target.value)} style={inputStyle} />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2 — Equipos */}
          {step === 2 && (
            <div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>Agrega los equipos participantes. Puedes agregar más después desde la sección Equipos.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.equipos.map((eq, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text" value={eq} placeholder={`Equipo ${i + 1}`}
                      onChange={e => { const next = [...data.equipos]; next[i] = e.target.value; update("equipos", next); }}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    {data.equipos.length > 2 && (
                      <button onClick={() => update("equipos", data.equipos.filter((_, j) => j !== i))}
                        style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0 10px", cursor: "pointer", color: MUTED }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => update("equipos", [...data.equipos, ""])}
                style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", background: "none", border: `1px dashed ${CU_BOR}`, borderRadius: 8, padding: "9px 0", fontSize: 12, color: CU, fontFamily: FONT, cursor: "pointer" }}
              >
                <Plus size={13} />Agregar equipo
              </button>
            </div>
          )}

          {/* Step 3 — Fases */}
          {step === 3 && (
            <div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>Elige el formato de competición.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {FASE_OPTIONS.map(opt => {
                  const sel = data.formato === opt.id;
                  return (
                    <div key={opt.id} onClick={() => update("formato", opt.id)}
                      style={{ border: `2px solid ${sel ? CU : BORDER}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: sel ? CU_DIM : CARD, transition: "all 0.15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sel ? CU : BORDER}`, background: sel ? CU : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFF" }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{opt.label}</div>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{opt.desc}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {data.formato === "grupos_playoffs" && (
                <div style={{ marginTop: 16 }}>
                  <Field label="NÚMERO DE GRUPOS">
                    <select value={data.numGrupos} onChange={e => update("numGrupos", Number(e.target.value))} style={{ ...inputStyle, appearance: "none" }}>
                      {[2, 3, 4, 6, 8].map(n => <option key={n} value={n}>{n} grupos</option>)}
                    </select>
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Confirmar */}
          {step === 4 && (
            <div>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>Revisa los datos antes de crear el torneo.</p>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                {[
                  { label: "Nombre",   value: data.nombre  || "—" },
                  { label: "Deporte",  value: data.deporte || "—" },
                  { label: "Formato",  value: FASE_OPTIONS.find(o => o.id === data.formato)?.label ?? "—" },
                  { label: "Inicio",   value: data.fecha   || "—" },
                  { label: "Finalización", value: data.fechaFin || "—" },
                  { label: "Equipos",  value: `${data.equipos.filter(Boolean).length} equipos configurados` },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                    <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={step === 1 && !data.nombre.trim()}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            background: step === 1 && !data.nombre.trim() ? BORDER : CU,
            color: step === 1 && !data.nombre.trim() ? MUTED : "#FFF",
            border: "none", borderRadius: 8, padding: "12px 18px", fontSize: 13, fontWeight: 600,
            fontFamily: FONT, cursor: step === 1 && !data.nombre.trim() ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {step < 4 ? <>Continuar <ArrowRight size={14} /></> : <>{isEditing ? "Guardar cambios" : "Crear torneo"} <CheckCircle size={14} /></>}
        </motion.button>
        <button onClick={onBack} style={{ background: "none", border: "none", color: MUTED, fontSize: 12, fontFamily: FONT, cursor: "pointer", padding: "4px 0" }}>
          Guardar borrador
        </button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  border: `1px solid ${PALETTE.border}`, borderRadius: 8,
  padding: "10px 12px", fontSize: 13, color: PALETTE.text,
  fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
  background: PALETTE.bg, outline: "none",
};
