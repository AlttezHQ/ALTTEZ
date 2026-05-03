import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PALETTE } from "../tokens/palette";
import { calcWellnessScore, getWellnessStatus } from "../types/wellnessTypes";

const WELLNESS_ITEMS = [
  { key: "sleep_quality", label: "Sueño",  icon: "🌙", labels: ["Muy mal","Malo","Regular","Bueno","Excelente"] },
  { key: "fatigue_level", label: "Fatiga", icon: "⚡", labels: ["Ninguna","Leve","Moderada","Alta","Extrema"] },
  { key: "stress_level",  label: "Estrés", icon: "🧠", labels: ["Ninguno","Leve","Moderado","Alto","Extremo"] },
  { key: "doms_level",    label: "DOMS",   icon: "💪", labels: ["Sin dolor","Leve","Moderado","Intenso","Severo"] },
];

const RPE_LABEL = (v) => !v ? "" : v <= 3 ? "BAJO" : v <= 6 ? "MODERADO" : v <= 8 ? "ALTO" : "MÁXIMO";
const RPE_COLOR = (v) => !v ? PALETTE.textMuted : v <= 3 ? "#2FA56F" : v <= 7 ? "#D89A2B" : "#D95C5C";

const STATUS_CFG = {
  P: { label: "Presente",  color: "#2FA56F", soft: "#EAF7F0", border: "rgba(47,165,111,0.24)" },
  A: { label: "Ausente",   color: "#D95C5C", soft: "#FDECEC", border: "rgba(217,92,92,0.24)" },
  L: { label: "Lesionado", color: "#D89A2B", soft: "#FFF5E0", border: "rgba(216,154,43,0.28)" },
};

function ScoreRing({ score, wstatus }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const color = wstatus === "green" ? "#2FA56F" : wstatus === "yellow" ? "#D89A2B" : "#D95C5C";
  const lbl   = wstatus === "green" ? "ÓPTIMO" : wstatus === "yellow" ? "PRECAUCIÓN" : "RIESGO";
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" style={{ flexShrink: 0, overflow: "visible" }}>
      <circle cx="44" cy="44" r={r} fill="none" stroke="#E9E2D7" strokeWidth="5"/>
      <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * circ} ${circ}`}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dasharray 500ms ease, stroke 300ms ease" }}
      />
      <text x="44" y="41" textAnchor="middle" fill="#171A1C" fontSize="20" fontWeight="800"
        fontFamily="Manrope,sans-serif">{Math.round(score)}</text>
      <text x="44" y="55" textAnchor="middle" fill={color} fontSize="7.5" fontWeight="700"
        letterSpacing="0.5">{lbl}</text>
    </svg>
  );
}

function SegScale({ value, min, max, onChange, wide, allowDeselect }) {
  const btns = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className={`wdr-scale${wide ? " wdr-scale-wide" : ""}`}>
      {btns.map(n => (
        <button key={n} type="button"
          className={`wdr-scale-btn${value === n ? " is-sel" : ""}`}
          onClick={() => onChange(allowDeselect && value === n ? null : n)}
        >{n}</button>
      ))}
    </div>
  );
}

export default function WellnessDrawer({
  athlete,
  athleteIdx,
  visibleAthletes,
  clubId,
  onClose,
  onSaveAndNext,
  onSelect,
}) {
  const [vals, setVals] = useState({ sleep_quality: 3, fatigue_level: 3, stress_level: 3, doms_level: 3 });
  const [rpe, setRpe] = useState(null);
  const [status, setStatus] = useState("P");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!athlete) return;
    setRpe(athlete.rpe ?? null);
    setStatus(athlete.status ?? "P");
    setNotes("");
    setVals({ sleep_quality: 3, fatigue_level: 3, stress_level: 3, doms_level: 3 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athlete?.id]);

  if (!athlete) return null;

  const score = calcWellnessScore(vals);
  const ws    = getWellnessStatus(score);
  const wsColor = ws.status === "green" ? "#2FA56F" : ws.status === "yellow" ? "#D89A2B" : "#D95C5C";

  const curPos  = visibleAthletes.findIndex(({ index }) => index === athleteIdx);
  const prevItem = curPos > 0 ? visibleAthletes[curPos - 1] : null;
  const nextItem = curPos < visibleAthletes.length - 1 ? visibleAthletes[curPos + 1] : null;

  const buildLog = () => ({
    club_id:       clubId || null,
    athlete_id:    athlete.id,
    logged_at:     new Date().toISOString(),
    ...vals,
    wellness_score: score,
    notes:         notes || null,
  });

  const handleSaveAndNext = () => {
    onSaveAndNext(athleteIdx, buildLog(), rpe, status, nextItem?.index ?? null);
  };

  const cfg = STATUS_CFG[status] || STATUS_CFG.P;

  return (
    <motion.aside
      className="wdr-panel"
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 32, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      aria-label={`Detalle de ${athlete.name}`}
    >
      {/* ── Header ── */}
      <div className="wdr-hdr">
        <div className="wdr-hdr-left">
          <button type="button" className="wdr-close" onClick={onClose} aria-label="Cerrar panel">
            <X size={17} strokeWidth={2.2} />
          </button>
          <div>
            <div className="wdr-athlete-nm">{athlete.name}</div>
            <div className="wdr-athlete-sub">
              {[athlete.posCode, athlete.pos].filter(Boolean).join(" · ")}
              {" · Sesión de hoy"}
            </div>
          </div>
        </div>
        <div className="wdr-hdr-nav">
          <button type="button" className="wdr-nav-btn"
            onClick={() => prevItem && onSelect(prevItem.index)}
            disabled={!prevItem} aria-label="Jugador anterior">
            <ChevronLeft size={16}/>
          </button>
          <button type="button" className="wdr-nav-btn"
            onClick={() => nextItem && onSelect(nextItem.index)}
            disabled={!nextItem} aria-label="Siguiente jugador">
            <ChevronRight size={16}/>
          </button>
        </div>
      </div>

      {/* ── Session / status bar ── */}
      <div className="wdr-session-bar">
        <span className="wdr-session-lbl">Sesión · Hoy</span>
        <span className="wdr-status-badge" style={{
          background: cfg.soft,
          color: cfg.color,
          borderColor: cfg.border,
        }}>
          {cfg.label.toUpperCase()}
        </span>
      </div>

      {/* ── Scrollable body ── */}
      <div className="wdr-body">

        {/* Score ring */}
        <div className="wdr-score-row">
          <div className="wdr-score-info">
            <div className="wdr-score-lbl">Wellness Score</div>
            <div className="wdr-score-num" style={{ color: wsColor }}>{Math.round(score)}</div>
            <div className="wdr-score-status" style={{ color: wsColor }}>{ws.label}</div>
            <div className="wdr-score-hint">
              {ws.status === "yellow" ? "Monitorear carga y recuperación." :
               ws.status === "red"    ? "Reducir carga. Riesgo elevado."  :
               "Estado óptimo. Continuar plan."}
            </div>
          </div>
          <ScoreRing score={score} wstatus={ws.status} />
        </div>

        {/* Status selector */}
        <div className="wdr-status-row">
          {Object.entries(STATUS_CFG).map(([s, c]) => (
            <button key={s} type="button"
              className={`wdr-status-pill${status === s ? " is-sel" : ""}`}
              style={status === s ? { background: c.soft, color: c.color, borderColor: c.border } : undefined}
              onClick={() => setStatus(s)}
            >{c.label}</button>
          ))}
        </div>

        <div className="wdr-sep" />

        {/* Wellness inputs */}
        <div className="wdr-section-hd">Registra cómo te sientes hoy</div>
        {WELLNESS_ITEMS.map(({ key, label, icon, labels }) => {
          const val = vals[key];
          const inv = key !== "sleep_quality";
          const lc  = inv
            ? (val <= 2 ? "#2FA56F" : val <= 3 ? "#D89A2B" : "#D95C5C")
            : (val >= 4 ? "#2FA56F" : val >= 3 ? "#D89A2B" : "#D95C5C");
          return (
            <div key={key} className="wdr-row">
              <div className="wdr-row-hd">
                <span className="wdr-row-icon">{icon}</span>
                <span className="wdr-row-name">{label}</span>
                <span className="wdr-row-val" style={{ color: lc }}>{labels[val - 1].toUpperCase()}</span>
              </div>
              <SegScale
                value={val} min={1} max={5}
                onChange={v => setVals(p => ({ ...p, [key]: v }))}
              />
            </div>
          );
        })}

        <div className="wdr-sep" />

        {/* RPE */}
        <div className="wdr-section-hd">Percepción de esfuerzo de la sesión (RPE)</div>
        {status === "P" ? (
          <>
            <SegScale value={rpe ?? 0} min={1} max={10} onChange={setRpe} wide allowDeselect />
            <div className="wdr-rpe-info">
              {rpe ? (
                <>
                  <span>RPE seleccionado: <strong>{rpe}</strong></span>
                  <span style={{ color: RPE_COLOR(rpe), fontWeight: 700 }}>{RPE_LABEL(rpe)}</span>
                </>
              ) : <span style={{ color: "#98A2B3" }}>Sin RPE seleccionado</span>}
            </div>
          </>
        ) : (
          <p className="wdr-rpe-off">Solo disponible para deportistas presentes</p>
        )}

        <div className="wdr-sep" />

        {/* Notes */}
        <div className="wdr-section-hd">Notas (opcional)</div>
        <div className="wdr-notes-wrap">
          <textarea
            className="wdr-notes"
            value={notes}
            onChange={e => setNotes(e.target.value.slice(0, 200))}
            placeholder="Escribe una nota sobre tu estado, molestias o comentarios..."
            rows={3}
            maxLength={200}
          />
          <span className="wdr-notes-cnt">{notes.length}/200</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="wdr-actions">
        <button type="button" className="wdr-btn-cancel" onClick={onClose}>Cancelar</button>
        <button type="button" className="wdr-btn-save" onClick={handleSaveAndNext}>
          Guardar y siguiente →
        </button>
      </div>

      {/* ── Footer nav ── */}
      <div className="wdr-footer">
        {prevItem ? (
          <button type="button" className="wdr-foot-btn" onClick={() => onSelect(prevItem.index)}>
            <ChevronLeft size={13}/> Anterior: {prevItem.athlete.name.split(" ")[0]}
          </button>
        ) : <span />}
        {nextItem ? (
          <button type="button" className="wdr-foot-btn" onClick={() => onSelect(nextItem.index)}>
            Siguiente: {nextItem.athlete.name.split(" ")[0]} <ChevronRight size={13}/>
          </button>
        ) : <span />}
      </div>
    </motion.aside>
  );
}
