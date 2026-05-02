/**
 * @component GestionPlantilla
 * @description Módulo de gestión del plantel con dos vistas:
 *   1. LISTA   — tabla estilo FIFA con stats por jugador + panel de edición
 *   2. PIZARRA — campo táctico con formaciones + cuadro de notas lateral
 *
 * @architecture
 * GestionPlantilla (estado: tab activo, jugador seleccionado, formación, notas)
 * ├── PlayerListView   → tabla FIFA con PlayerRow + PlayerEditPanel
 * └── TacticalBoardView → campo SVG + tokens + sidebar formaciones + notas
 *
 * @props
 * - athletes    {Array}    Plantel completo desde App.jsx
 * - setAthletes {Function} Actualizador de estado global del plantel
 *
 * @state-decisions
 * - selectedPlayer se eleva a GestionPlantilla (no a cada vista)
 *   para que ambas vistas compartan el jugador seleccionado.
 * - editMode vive en PlayerEditPanel para no contaminar el estado global.
 *
 * @palette  Ver PALETTE (heredada del proyecto)
 * @version  2.0
 * @author   ALTTEZ
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TacticalBoardV9 from "./TacticalBoard/TacticalBoardV9";
import BulkAthleteUploader from "./BulkAthleteUploader";
import EmptyState from "../../shared/ui/EmptyState";
import FieldInput from "../../shared/ui/FieldInput";
import SectionLabel from "../../shared/ui/SectionLabel";
import Button from "../../shared/ui/Button";
import { PALETTE } from "../../shared/tokens/palette";
import { useStore } from "../../shared/store/useStore";
// Responsive CSS → index.css (.player-row-desktop, .plantilla-list-grid, etc.)
import { FORMATIONS_VERTICAL as FORMATIONS } from "../../shared/constants/formations";
import { getAvatarUrl, getStatusStyle } from "../../shared/utils/helpers";
import { calcSaludActual, calcAthleteRisk, saludColor } from "../../shared/utils/rpeEngine";
import { sanitizeText, sanitizeTextFinal } from "../../shared/utils/sanitize";
import { showToast } from "../../shared/ui/Toast";
import { insertAthlete, bulkInsertAthletes, saveTacticalData } from "../../shared/services/supabaseService";


// ─────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────
const listVariants = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const rowVariant = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 340, damping: 28 } },
};

const panelVariant = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
  exit:    { opacity: 0, x: 20, transition: { duration: 0.18 } },
};

// ─────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────

/**
 * @component PlayerRow
 * @description Fila de jugador en la lista estilo FIFA.
 * Muestra: posición, número, nombre, fecha nacimiento,
 * tarjetas amarillas/rojas, goles y estado.
 *
 * @why-separate-component
 * Encapsular la fila permite aplicar hover state local
 * sin re-renderizar toda la lista.
 */
function PlayerRow({ athlete, isSelected, onSelect, index }) {
  const [hovered, setHovered] = useState(false);
  const statusStyle = getStatusStyle(athlete.status);
  const isActive = isSelected || hovered;

  const rowBase = {
    cursor:      "pointer",
    background:  isSelected
      ? "linear-gradient(180deg, rgba(244,231,207,0.82), rgba(255,255,255,0.98))"
      : hovered
        ? "linear-gradient(180deg, rgba(245,241,234,0.88), rgba(255,255,255,0.98))"
        : index % 2 === 0 ? "rgba(245,241,234,0.44)" : "transparent",
    borderLeft:  isSelected ? `3px solid ${PALETTE.bronce}` : "3px solid transparent",
    borderBottom:`1px solid ${PALETTE.border}`,
    boxShadow:   isSelected ? `inset 0 0 0 1px ${PALETTE.bronceBorder}` : "none",
    transition:  "background 150ms ease, box-shadow 150ms ease",
  };

  return (
    <>
      {/* Desktop row — grid layout */}
      <div
        className="player-row-desktop"
        onClick={() => onSelect(athlete)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...rowBase,
          gridTemplateColumns: "32px 28px 1fr 80px 30px 30px 30px 60px",
          alignItems:          "center",
          padding:             "0 12px",
          height:              38,
        }}
      >
        <div style={{ fontSize:10, color: isActive ? PALETTE.bronce : PALETTE.textMuted, fontWeight:700, textTransform:"uppercase" }}>
          {athlete.posCode}
        </div>
        <div style={{ fontSize:12, fontWeight:700, color: isActive ? PALETTE.text : PALETTE.textMuted, textAlign:"center" }}>
          {athlete.id}
        </div>
        <div style={{ fontSize:11, color: isActive ? PALETTE.text : PALETTE.textMuted, fontWeight: isSelected ? 600 : 400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {athlete.name}
        </div>
        <div style={{ fontSize:9, color: PALETTE.textMuted, textAlign:"center" }}>
          {athlete.dob || "—"}
        </div>
        <div style={{ display:"flex", justifyContent:"center" }}>
          <div style={{ width:10, height:14, background: (athlete.yellowCards||0) > 0 ? PALETTE.yellowCard : "rgba(255,255,255,0.1)", borderRadius:1, fontSize:8, color:PALETTE.bgDark, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
            {athlete.yellowCards || 0}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"center" }}>
          <div style={{ width:10, height:14, background: (athlete.redCards||0) > 0 ? PALETTE.danger : "rgba(255,255,255,0.1)", borderRadius:1, fontSize:8, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
            {athlete.redCards || 0}
          </div>
        </div>
        <div style={{ fontSize:11, color: (athlete.goals||0) > 0 ? PALETTE.bronce : PALETTE.textMuted, textAlign:"center", fontWeight:700 }}>
          {athlete.goals || 0}
        </div>
        <div style={{ fontSize:9, color: statusStyle.color, textTransform:"uppercase", letterSpacing:"0.5px", textAlign:"right" }}>
          {statusStyle.label}
        </div>
      </div>

      {/* Mobile card row — POS | Nombre | Status */}
      <div
        className="player-row-mobile"
        onClick={() => onSelect(athlete)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...rowBase,
          display:        "flex",
          alignItems:     "center",
          padding:        "10px 14px",
          gap:            10,
          minHeight:      48,
        }}
      >
        {/* Position badge */}
        <div style={{
          fontSize:9, fontWeight:700, textTransform:"uppercase",
          color: isActive ? PALETTE.bronce : PALETTE.textMuted,
          background: isActive ? `${PALETTE.bronce}18` : PALETTE.bgDeep,
          border: `1px solid ${isActive ? PALETTE.bronceBorder : PALETTE.border}`,
          padding: "3px 6px", borderRadius:3, flexShrink:0, minWidth:32, textAlign:"center",
        }}>
          {athlete.posCode}
        </div>

        {/* Name + secondary info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight: isSelected ? 600 : 400, color: isActive ? PALETTE.text : PALETTE.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {athlete.name}
          </div>
          <div style={{ fontSize:9, color: PALETTE.textMuted, marginTop:2 }}>
            #{athlete.id}
            {athlete.goals > 0 && <span style={{ color: PALETTE.bronce, marginLeft:8 }}>{athlete.goals}G</span>}
            {(athlete.yellowCards||0) > 0 && <span style={{ color:PALETTE.yellowCard, marginLeft:6 }}>T.A:{athlete.yellowCards}</span>}
          </div>
        </div>

        {/* Status */}
        <div style={{ fontSize:9, color: statusStyle.color, textTransform:"uppercase", letterSpacing:"0.5px", flexShrink:0 }}>
          {statusStyle.label}
        </div>
      </div>
    </>
  );
}

/**
 * @component PlayerEditPanel
 * @description Panel lateral derecho para ver y editar
 * la ficha completa de un jugador seleccionado.
 * Tiene dos modos: vista (lectura) y edición.
 *
 * @why-edit-mode-local
 * El modo de edición es transitorio y solo relevante
 * para este panel — no necesita subir al estado global.
 * Solo al "Guardar" se propaga el cambio hacia arriba.
 */
function PlayerEditPanel({ athlete, onUpdate, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft]       = useState({ ...athlete });
  const photoInputRef            = useRef(null);

  /** Convierte la imagen seleccionada a base64 y la guarda en draft */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDraft(prev => ({ ...prev, photo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const historial    = useStore(state => state.historial);
  const wellnessLogs = useStore(state => state.wellnessLogs);
  const rpeResult = calcSaludActual(athlete?.rpe ?? null, historial, athlete?.id ?? null);
  const risk = calcAthleteRisk(athlete?.id ?? null, historial, athlete?.rpe ?? null);

  // Extrae los últimos 7 RPEs del atleta del historial (cronológico)
  const rpeSparkData = (() => {
    const id = String(athlete?.id ?? "");
    const pts = [];
    for (const s of historial) {
      if (pts.length >= 7) break;
      const rpe = s.rpeByAthlete?.[id] ?? s.rpeByAthlete?.[Number(id)] ?? null;
      if (rpe != null && rpe >= 1 && rpe <= 10) pts.push(rpe);
    }
    return pts.reverse();
  })();

  // Últimos 7 wellness scores del atleta
  const wellnessSparkData = (() => {
    return (wellnessLogs || [])
      .filter(l => String(l.athlete_id) === String(athlete?.id ?? ""))
      .slice(0, 7)
      .map(l => l.wellness_score)
      .reverse();
  })();

  if (!athlete) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color: PALETTE.textHint, gap:12 }}>
      <div style={{ fontSize:28, opacity:0.3 }}>👤</div>
      <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"1.5px" }}>Selecciona un deportista</div>
    </div>
  );

  const statusStyle = getStatusStyle(draft.status);

  /** Persiste los cambios del draft hacia App.jsx */
  const handleSave = () => {
    onUpdate(draft);
    setEditMode(false);
  };

  /** Descarta cambios y vuelve al modo vista */
  const handleCancel = () => {
    setDraft({ ...athlete });
    setEditMode(false);
  };

  const readStyle = {
    background: "rgba(255,255,255,0.03)",
    border:     "1px solid rgba(255,255,255,0.06)",
    padding:    "6px 10px",
    fontSize:   11,
    color:      PALETTE.text,
    fontFamily: "inherit",
    width:      "100%",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto", minHeight:0 }}>

      {/* Header del panel */}
      <div style={{ padding:"14px 16px", background:"linear-gradient(180deg,#FFFFFF 0%,#F8F5EF 100%)", borderBottom:`1px solid ${PALETTE.border}`, display:"flex", alignItems:"flex-start", gap:12 }}>
        {/* Avatar con overlay de cambio de foto en editMode */}
        <div
          style={{ position:"relative", flexShrink:0, cursor: editMode ? "pointer" : "default" }}
          onClick={() => editMode && photoInputRef.current?.click()}
        >
          <img
            src={getAvatarUrl(draft.photo)}
            alt={draft.name}
            style={{ width:64, height:64, borderRadius:"50%", border:`2px solid ${editMode ? PALETTE.purple : PALETTE.bronce}`, objectFit:"cover", display:"block", boxShadow: editMode ? `0 0 16px ${PALETTE.purpleVibrantGlow},0 4px 12px rgba(0,0,0,0.6)` : `0 0 16px rgba(57,255,20,0.35),0 4px 12px rgba(0,0,0,0.6)`, transition:"border-color 200ms, box-shadow 200ms" }}
          />
          {editMode && (
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(0,0,0,0.55)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={PALETTE.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke={PALETTE.purple} strokeWidth="2"/>
              </svg>
              <span style={{ fontSize:7, color: PALETTE.purple, textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:700, lineHeight:1 }}>Cambiar</span>
            </div>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display:"none" }}
            tabIndex={-1}
          />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:PALETTE.text, textTransform:"uppercase", letterSpacing:"-0.3px", lineHeight:1.1 }}>{draft.name}</div>
          <div style={{ fontSize:10, color: PALETTE.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:3 }}>{draft.pos}</div>
          <div style={{ fontSize:9, color: statusStyle.color, textTransform:"uppercase", letterSpacing:"0.5px", marginTop:2 }}>{statusStyle.label}</div>
        </div>
        <div onClick={onClose} style={{ fontSize:16, color: PALETTE.textMuted, cursor:"pointer", padding:"2px 6px" }}>✕</div>
      </div>

      {/* ══════════════════════════════════════════
          PERFORMANCE ELITE — BENTO GRID
      ══════════════════════════════════════════ */}
      <div style={{ padding:"14px 16px", borderBottom:`1px solid rgba(255,255,255,0.05)` }}>

        {/* Label sección */}
        <SectionLabel accent={PALETTE.violetAccent} style={{ marginBottom:10, letterSpacing:"3px", color:"rgba(255,255,255,0.2)" }}>
          Performance Intel
        </SectionLabel>

        {/* Bento row 1: Salud + ACWR lado a lado */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:6 }}>

          {/* Celda salud — circular gauge SVG */}
          <div style={{
            background:"linear-gradient(180deg,#FFFFFF 0%,#F8F5EF 100%)",
            border:`1px solid ${rpeResult.color}22`,
            borderRadius:10,
            padding:"10px 8px",
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            boxShadow:`0 0 20px ${rpeResult.color}08`,
          }}>
            {/* Full circle SVG gauge */}
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
              <circle
                cx="26" cy="26" r="21"
                fill="none"
                stroke={rpeResult.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(rpeResult.salud / 100) * 131.9} 131.9`}
                strokeDashoffset="33"
                transform="rotate(-90 26 26)"
                style={{ transition:"stroke-dasharray 800ms cubic-bezier(0.34,1.56,0.64,1), stroke 400ms ease" }}
              />
              <defs>
                <filter id={`glow-${athlete.id}`}>
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <circle
                cx="26" cy="26" r="21"
                fill="none"
                stroke={rpeResult.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${(rpeResult.salud / 100) * 131.9} 131.9`}
                strokeDashoffset="33"
                transform="rotate(-90 26 26)"
                filter={`url(#glow-${athlete.id})`}
                opacity="0.6"
                style={{ transition:"stroke-dasharray 800ms cubic-bezier(0.34,1.56,0.64,1)" }}
              />
              <text x="26" y="24" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="'JetBrains Mono',monospace">
                {rpeResult.salud}
              </text>
              <text x="26" y="33" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6" fontWeight="500">
                SALUD
              </text>
            </svg>
            <div style={{ fontSize:8, color:rpeResult.color, textTransform:"uppercase", letterSpacing:"0.5px", textAlign:"center", lineHeight:1.2 }}>
              {rpeResult.riskLevel === "sin_datos" ? "Sin datos" :
               rpeResult.riskLevel === "optimo" ? "Óptimo" :
               rpeResult.riskLevel === "precaucion" ? "Precaución" : "En riesgo"}
            </div>
          </div>

          {/* Celda ACWR */}
          <div style={{
            background:"linear-gradient(180deg,#FFFFFF 0%,#F8F5EF 100%)",
            border:`1px solid ${
              risk.status==="red" ? "rgba(226,75,74,0.2)" :
              risk.status==="yellow" ? "rgba(239,159,39,0.2)" :
              risk.status==="green" ? "rgba(29,158,117,0.2)" : "rgba(255,255,255,0.06)"
            }`,
            borderRadius:10,
            padding:"10px 8px",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4,
          }}>
            <div style={{ fontSize:7, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"2px", fontFamily:"'JetBrains Mono',monospace" }}>ACWR</div>
            <div style={{
              fontSize:26, fontWeight:900, lineHeight:1,
              fontFamily:"'JetBrains Mono',monospace",
              color: risk.status==="red" ? "#E24B4A" : risk.status==="yellow" ? "#EF9F27" : risk.status==="green" ? "#1D9E75" : "rgba(255,255,255,0.3)",
              textShadow: risk.status==="red" ? "0 0 20px rgba(226,75,74,0.5)" : risk.status==="green" ? "0 0 20px rgba(29,158,117,0.4)" : "none",
            }}>
              {risk.ratio !== null ? risk.ratio.toFixed(2) : "—"}
            </div>
            <div style={{
              fontSize:7, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px",
              padding:"2px 8px", borderRadius:20,
              background: risk.status==="red" ? "rgba(226,75,74,0.15)" : risk.status==="yellow" ? "rgba(239,159,39,0.15)" : risk.status==="green" ? "rgba(29,158,117,0.15)" : "rgba(255,255,255,0.04)",
              color: risk.status==="red" ? "#E24B4A" : risk.status==="yellow" ? "#EF9F27" : risk.status==="green" ? "#1D9E75" : "rgba(255,255,255,0.3)",
            }}>
              {risk.status==="red" ? "Peligro" : risk.status==="yellow" ? "Atención" : risk.status==="green" ? "Óptimo" : "Sin datos"}
            </div>
            {risk.trend && risk.trend !== "stable" && (
              <div style={{ fontSize:10, color: risk.trend==="up" ? "#E24B4A" : "#1D9E75" }}>
                {risk.trend === "up" ? "↑" : "↓"}
              </div>
            )}
          </div>
        </div>

        {/* Bento row 2: Sparklines */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:6 }}>

          {/* RPE Sparkline */}
          <div style={{
            background:"rgba(255,255,255,0.02)",
            border:"1px solid rgba(255,255,255,0.05)",
            borderRadius:8, padding:"8px",
          }}>
            <div style={{ fontSize:7, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:5, fontFamily:"'JetBrains Mono',monospace" }}>RPE 7d</div>
            {rpeSparkData.length > 0 ? (
              <svg width="100%" height="28" viewBox={`0 0 ${Math.max(rpeSparkData.length * 10, 60)} 28`} preserveAspectRatio="none">
                {rpeSparkData.map((v, i) => {
                  const barH = Math.max(Math.round((v / 10) * 22), 2);
                  const barColor = v <= 3 ? "#1D9E75" : v <= 7 ? "#EF9F27" : "#E24B4A";
                  return (
                    <rect
                      key={i}
                      x={i * 10 + 1}
                      y={26 - barH}
                      width={7}
                      height={barH}
                      rx={2}
                      fill={barColor}
                      opacity={i === rpeSparkData.length - 1 ? 1 : 0.4 + (i / rpeSparkData.length) * 0.4}
                    />
                  );
                })}
              </svg>
            ) : (
              <div style={{ height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"rgba(255,255,255,0.15)" }}>sin datos</div>
            )}
          </div>

          {/* Wellness Sparkline */}
          <div style={{
            background:"rgba(255,255,255,0.02)",
            border:"1px solid rgba(255,255,255,0.05)",
            borderRadius:8, padding:"8px",
          }}>
            <div style={{ fontSize:7, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:5, fontFamily:"'JetBrains Mono',monospace" }}>WELLNESS</div>
            {wellnessSparkData.length > 0 ? (
              <svg width="100%" height="28" viewBox={`0 0 ${Math.max(wellnessSparkData.length * 10, 60)} 28`} preserveAspectRatio="none">
                {wellnessSparkData.map((v, i) => {
                  const barH = Math.max(Math.round((v / 100) * 22), 2);
                  const barColor = v >= 70 ? "#1D9E75" : v >= 40 ? "#EF9F27" : "#E24B4A";
                  return (
                    <rect key={i} x={i * 10 + 1} y={26 - barH} width={7} height={barH} rx={2}
                      fill={barColor} opacity={i === wellnessSparkData.length - 1 ? 1 : 0.4 + (i / wellnessSparkData.length) * 0.4}
                    />
                  );
                })}
              </svg>
            ) : (
              <div style={{ height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"rgba(255,255,255,0.15)" }}>sin datos</div>
            )}
          </div>
        </div>

        {/* Predictive Insight — Electric Violet container */}
        <div style={{
          background:`linear-gradient(135deg,${PALETTE.violetDim},rgba(79,32,168,0.06))`,
          border:`1px solid rgba(124,58,237,0.25)`,
          borderRadius:8,
          padding:"10px 12px",
          position:"relative",
          overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:-1, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${PALETTE.violetGlow},transparent)` }}/>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:PALETTE.violetAccent, boxShadow:`0 0 6px ${PALETTE.violetGlow}` }}/>
            <div style={{ fontSize:7, fontWeight:800, textTransform:"uppercase", letterSpacing:"2.5px", color:`rgba(124,58,237,0.9)`, fontFamily:"'JetBrains Mono',monospace" }}>
              Predictive Insight
            </div>
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)", lineHeight:1.6, fontStyle:"italic" }}>
            {risk.suggestion || "Registra datos de entrenamiento para activar el análisis predictivo."}
          </div>
          {risk.ratio !== null && (
            <div style={{ marginTop:5, fontSize:8, color:`rgba(124,58,237,0.6)`, fontFamily:"'JetBrains Mono',monospace" }}>
              ratio:{risk.ratio?.toFixed(2)} · trend:{risk.trend || "—"} · 7d_avg:{rpeResult.rpeAvg7d ?? "—"}
            </div>
          )}
        </div>

      </div>

      {/* Métricas del ciclo */}
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${PALETTE.border}` }}>
        <SectionLabel accent={PALETTE.purple} style={{ marginBottom:10 }}>Métricas del ciclo</SectionLabel>
        {[
          { label:"Asistencia", value:"100%", pct:100, color: PALETTE.green  },
          { label:"RPE prom.",  value: draft.rpe ?? "—", pct:(draft.rpe||0)*10, color: PALETTE.amber  },
        ].map(m => (
          <div key={m.label} style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:10, color: PALETTE.textMuted, textTransform:"uppercase", letterSpacing:"0.5px" }}>{m.label}</span>
              <span style={{ fontSize:11, fontWeight:600, color:m.color }}>{m.value}</span>
            </div>
            <div style={{ height:3, background:"rgba(255,255,255,0.08)", borderRadius:2 }}>
              <div style={{ width:`${m.pct}%`, height:"100%", background:m.color, borderRadius:2 }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Ficha editable */}
      <div style={{ padding:"12px 16px", flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <SectionLabel accent={PALETTE.purple} style={{ marginBottom:12 }}>Ficha del deportista</SectionLabel>
          {!editMode && (
            <div
              onClick={() => setEditMode(true)}
              style={{ fontSize:9, color: PALETTE.bronce, textTransform:"uppercase", letterSpacing:"1px", cursor:"pointer", border:`1px solid ${PALETTE.bronceBorder}`, padding:"3px 10px" }}
            >
              Editar
            </div>
          )}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { label:"Nombre completo", key:"name",    type:"text"   },
            { label:"Posición",        key:"pos",     type:"text"   },
            { label:"Número dorsal",   key:"id",      type:"number" },
            { label:"Fecha nacimiento",key:"dob",     type:"date"   },
            { label:"Contacto",        key:"contact", type:"text"   },
            { label:"Goles",           key:"goals",   type:"number" },
            { label:"T. Amarillas",    key:"yellowCards", type:"number" },
            { label:"T. Rojas",        key:"redCards",    type:"number" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              {editMode ? (
                <FieldInput
                  label={label}
                  type={type}
                  value={draft[key] ?? ""}
                  onChange={e => setDraft(prev => ({ ...prev, [key]: type === "number" ? +e.target.value : e.target.value }))}
                  size="sm"
                />
              ) : (
                <>
                  <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"1px", color: PALETTE.textHint, marginBottom:3 }}>{label}</div>
                  <div style={{ ...readStyle, color: draft[key] ? PALETTE.text : PALETTE.textHint }}>
                    {draft[key] || "—"}
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Estado */}
          <div>
            {editMode ? (
              <FieldInput
                label="Estado"
                as="select"
                value={draft.status}
                onChange={e => setDraft(prev => ({ ...prev, status: e.target.value }))}
                size="sm"
                style={{ background:"rgba(255,255,255,0.06)" }}
              >
                <option value="P">Disponible</option>
                <option value="A">Ausente</option>
                <option value="L">Lesionado</option>
              </FieldInput>
            ) : (
              <>
                <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"1px", color: PALETTE.textHint, marginBottom:3 }}>Estado</div>
                <div style={{ ...readStyle, color: statusStyle.color }}>{statusStyle.label}</div>
              </>
            )}
          </div>
        </div>

        {/* Acciones de edición */}
        {editMode && (
          <div style={{ display:"flex", gap:8, marginTop:14 }}>
            <Button onClick={handleSave} variant="primary" size="sm" accent={PALETTE.bronce} style={{ flex:1 }}>
              Guardar
            </Button>
            <Button onClick={handleCancel} variant="ghost" size="sm" accent={PALETTE.textMuted} style={{ flex:1 }}>
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Posiciones disponibles (16 pos_codes del dominio) ───────────────────────
const POS_OPTIONS = [
  { code: "GK",  label: "Portero (GK)"            },
  { code: "CB",  label: "Defensa central (CB)"    },
  { code: "LB",  label: "Lateral izquierdo (LB)"  },
  { code: "RB",  label: "Lateral derecho (RB)"    },
  { code: "LWB", label: "Carrilero izq. (LWB)"    },
  { code: "RWB", label: "Carrilero der. (RWB)"    },
  { code: "CDM", label: "Mediocampista def. (CDM)" },
  { code: "CM",  label: "Mediocampista (CM)"       },
  { code: "CAM", label: "Mediapunta (CAM)"         },
  { code: "LM",  label: "Extremo izq. med. (LM)"  },
  { code: "RM",  label: "Extremo der. med. (RM)"  },
  { code: "LW",  label: "Extremo izquierdo (LW)"  },
  { code: "RW",  label: "Extremo derecho (RW)"    },
  { code: "SS",  label: "Segundo delantero (SS)"  },
  { code: "ST",  label: "Delantero centro (ST)"   },
  { code: "CF",  label: "Centro delantero (CF)"   },
];

const EMPTY_DRAFT = {
  nombre: "", apellido: "", posCode: "ST",
  dorsal: "", dob: "", contacto: "", documento: "",
  photo: null,
};

/**
 * @component AddAthleteModal
 * @description Modal glassmorphism para crear un deportista individual.
 * Usa sanitizeText en onChange y sanitizeTextFinal en submit.
 * Llama a insertAthlete() de supabaseService y actualiza estado local.
 */
function AddAthleteModal({ onClose, onSave }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const photoInputRef        = useRef(null);

  /** Convierte imagen a base64 y guarda en draft.photo */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDraft(prev => ({ ...prev, photo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const set = (field) => (e) => {
    const value = (field === "dob")
      ? e.target.value
      : sanitizeText(e.target.value);
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    const nombre   = sanitizeTextFinal(draft.nombre);
    const apellido = sanitizeTextFinal(draft.apellido);
    if (!nombre || nombre.length < 2) errs.nombre = "Obligatorio";
    if (!apellido || apellido.length < 2) errs.apellido = "Obligatorio";
    if (!draft.posCode) errs.posCode = "Obligatorio";
    if (draft.dorsal && (isNaN(+draft.dorsal) || +draft.dorsal < 1 || +draft.dorsal > 99))
      errs.dorsal = "1–99";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    const posOpt = POS_OPTIONS.find((p) => p.code === draft.posCode);
    const newAthlete = {
      name:               `${sanitizeTextFinal(draft.nombre)} ${sanitizeTextFinal(draft.apellido)}`.trim(),
      pos:                posOpt?.label || draft.posCode,
      posCode:            draft.posCode,
      id:                 draft.dorsal ? +draft.dorsal : Math.floor(Math.random() * 900) + 100,
      dob:                draft.dob || null,
      contact:            sanitizeTextFinal(draft.contacto) || "",
      documento_identidad: sanitizeTextFinal(draft.documento) || "",
      photo:              draft.photo || null,
      status:             "P",
      available:          true,
      goals:              0,
      yellowCards:        0,
      redCards:           0,
    };

    // Intentar persistir en Supabase; si no hay conexion, solo local
    const saved = await insertAthlete(newAthlete);
    if (saved) {
      onSave(saved);
      showToast(`Deportista ${newAthlete.name} creado en la nube`, "success");
    } else {
      // Fallback offline-first
      onSave({ ...newAthlete, _localOnly: true });
      showToast(`Deportista ${newAthlete.name} guardado localmente`, "info");
    }
    setSaving(false);
    onClose();
  };


  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="modal-fullscreen"
        style={{
          background: "rgba(12,12,22,0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderTop: `2px solid ${PALETTE.bronce}`,
          borderRadius: 10,
          width: "100%", maxWidth: 520,
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div className="modal-fullscreen-header" style={{
          padding: "18px 24px 14px",
          borderBottom: `1px solid ${PALETTE.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: PALETTE.text }}>
              Incorporar deportista
            </div>
            <div style={{ fontSize: 9, color: PALETTE.textHint, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 3 }}>
              Nuevo registro en la plantilla
            </div>
          </div>
          <div
            onClick={onClose}
            style={{ fontSize: 16, color: PALETTE.textMuted, cursor: "pointer", padding: "4px 8px" }}
          >
            ✕
          </div>
        </div>

        {/* Body */}
        <div className="modal-fullscreen-body" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Foto del deportista */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <div
              style={{ position:"relative", cursor:"pointer" }}
              onClick={() => photoInputRef.current?.click()}
            >
              <img
                src={getAvatarUrl(draft.photo)}
                alt="foto del deportista"
                style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", border:`2px solid ${draft.photo ? PALETTE.purple : "rgba(255,255,255,0.15)"}`, display:"block", boxShadow: draft.photo ? `0 0 18px ${PALETTE.purpleVibrantGlow},0 4px 12px rgba(0,0,0,0.6)` : "0 4px 12px rgba(0,0,0,0.5)", transition:"border-color 250ms, box-shadow 250ms" }}
              />
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={PALETTE.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke={PALETTE.purple} strokeWidth="2"/>
                </svg>
                <span style={{ fontSize:7, color: PALETTE.purple, textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:700, lineHeight:1 }}>Foto</span>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display:"none" }}
                tabIndex={-1}
              />
            </div>
            <motion.div
              onClick={() => photoInputRef.current?.click()}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{ fontSize:9, padding:"4px 14px", cursor:"pointer", textTransform:"uppercase", letterSpacing:"1px", border:`1px solid ${PALETTE.purple}`, color: PALETTE.purple, borderRadius:20, background:PALETTE.purpleVibrantDim, fontWeight:600, minHeight:28, display:"flex", alignItems:"center" }}
            >
              {draft.photo ? "Cambiar foto" : "Subir foto"}
            </motion.div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldInput label="Nombre *" type="text" placeholder="Julian" value={draft.nombre} onChange={set("nombre")} error={errors.nombre} />
            <FieldInput label="Apellido *" type="text" placeholder="Perez" value={draft.apellido} onChange={set("apellido")} error={errors.apellido} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 16 }}>
            <FieldInput label="Posición *" as="select" value={draft.posCode} onChange={set("posCode")} error={errors.posCode} style={{ background: "rgba(20,20,32,0.95)", cursor: "pointer" }}>
              {POS_OPTIONS.map((p) => (
                <option key={p.code} value={p.code}>{p.label}</option>
              ))}
            </FieldInput>
            <FieldInput label="Dorsal" type="number" min="1" max="99" placeholder="10" value={draft.dorsal} onChange={set("dorsal")} error={errors.dorsal} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldInput label="Fecha de nacimiento" type="date" value={draft.dob} onChange={set("dob")} style={{ colorScheme: "light" }} />
            <FieldInput label="Contacto" type="text" placeholder="+57 300 0000000" value={draft.contacto} onChange={set("contacto")} />
          </div>

          <FieldInput label="Documento de identidad" type="text" placeholder="1234567890" value={draft.documento} onChange={set("documento")} />
        </div>

        {/* Footer */}
        <div className="modal-fullscreen-footer" style={{
          padding: "14px 24px 18px",
          borderTop: `1px solid ${PALETTE.border}`,
          display: "flex", gap: 10,
        }}>
          <Button
            onClick={handleSave}
            loading={saving}
            variant="primary"
            accent={PALETTE.bronce}
            style={{ flex: 1 }}
          >
            Confirmar registro
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            accent={PALETTE.textMuted}
          >
            Cancelar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * @component BulkUploaderModal
 * @description Wrapper modal para BulkAthleteUploader.
 * Conecta onCommit con bulkInsertAthletes() de supabaseService.
 */
function BulkUploaderModal({ onClose, onSaveAll }) {
  const handleCommit = async (validRows) => {
    if (!validRows.length) { showToast("No hay filas validas para importar", "warning"); return; }

    const result = await bulkInsertAthletes(validRows, "import.csv", 0);
    if (result.success) {
      showToast(`${result.inserted} deportistas importados correctamente`, "success");
      // Convertir filas al schema local y propagar al estado
      const newAthletes = validRows.map((r, i) => ({
        name:        r.name    || "",
        pos:         r.pos     || "General",
        posCode:     r.posCode || "GEN",
        id:          200 + i,
        dob:         r.dob     || null,
        contact:     r.contact || "",
        status:      "P",
        available:   true,
        goals:       0,
        yellowCards: 0,
        redCards:    0,
      }));
      onSaveAll(newAthletes);
    } else {
      showToast(`Error en importacion: ${result.errors.join(", ")}`, "error");
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.80)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="modal-fullscreen"
        style={{
          width: "100%", maxWidth: 760,
          background: "rgba(12,12,22,0.98)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderTop: `2px solid ${PALETTE.purple}`,
          borderRadius: 10,
          boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 22px",
          borderBottom: `1px solid ${PALETTE.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: PALETTE.text }}>
            Carga masiva de plantilla — CSV
          </div>
          <div onClick={onClose} style={{ fontSize: 16, color: PALETTE.textMuted, cursor: "pointer", padding: "2px 8px" }}>✕</div>
        </div>
        <div style={{ padding: "16px 22px 22px" }}>
          <BulkAthleteUploader
            onCommit={handleCommit}
            onCancel={onClose}
          />
        </div>
      </motion.div>
    </div>
  );
}

/**
 * @component PlayerListView
 * @description Vista de lista completa del plantel estilo FIFA.
 * Columnas: posición, número, nombre, fecha nacimiento,
 * tarjetas amarillas/rojas, goles, estado.
 * Panel derecho: edición del jugador seleccionado.
 */
function PlayerListView({ athletes, onUpdateAthlete, onAddAthlete, onAddBulk }) {
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [sortKey, setSortKey]                 = useState("posCode");
  const [filterStatus, setFilterStatus]       = useState("all");
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showBulkModal, setShowBulkModal]     = useState(false);

  // Ordena y filtra la lista de forma derivada (sin estado extra)
  const displayedAthletes = [...athletes]
    .filter(a => filterStatus === "all" || a.status === filterStatus)
    .sort((a, b) => {
      if (sortKey === "name")    return a.name.localeCompare(b.name);
      if (sortKey === "posCode") return a.posCode.localeCompare(b.posCode);
      if (sortKey === "goals")   return (b.goals || 0) - (a.goals || 0);
      return 0;
    });

  const headerCell = (label, key) => ({
    fontSize:      8,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color:         sortKey === key ? PALETTE.bronce : PALETTE.textHint,
    cursor:        "pointer",
    fontWeight:    sortKey === key ? 700 : 400,
  });

  return (
    <div className="plantilla-list-grid" style={{ display:"grid", gridTemplateColumns:"1fr 260px", height:"100%", minHeight:0 }}>

      {/* ── LISTA ─────────────────────────────── */}
      <div style={{ display:"flex", flexDirection:"column", minHeight:0 }}>

        {/* Controles de filtro, orden y acciones */}
        <div style={{ padding:"12px", background:PALETTE.bgDeep, borderBottom:`1px solid ${PALETTE.border}`, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <div style={{ fontSize:9, color: PALETTE.textMuted, textTransform:"uppercase", letterSpacing:"1px" }}>
            {displayedAthletes.length} deportistas
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {[["all","Todos"],["P","Disponibles"],["L","Lesionados"],["A","Ausentes"]].map(([v,l]) => (
              <div
                key={v}
                onClick={() => setFilterStatus(v)}
                style={{ fontSize:9, padding:"4px 10px", cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.5px", borderRadius:20, background: filterStatus===v ? PALETTE.bronceDim : PALETTE.surface, border:`1px solid ${filterStatus===v ? PALETTE.bronce : PALETTE.border}`, color: filterStatus===v ? PALETTE.bronce : PALETTE.textMuted, boxShadow: "none", transition:"all 0.18s" }}
              >
                {l}
              </div>
            ))}
          </div>
          {/* Action buttons — pushed to the right */}
          <div className="plantilla-actions" style={{ display:"flex", gap:8, marginLeft:"auto" }}>
            <motion.div
              onClick={() => setShowBulkModal(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontSize: 9, padding: "4px 12px", cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "1px",
                background: "transparent",
                border: `1px solid ${PALETTE.purple}`,
                color: PALETTE.purple, borderRadius: 3,
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={PALETTE.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Importar CSV
            </motion.div>
            <motion.div
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.03, boxShadow: `0 0 12px ${PALETTE.bronceGlow}` }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontSize: 9, padding: "4px 14px", cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "1px",
                background: PALETTE.bronce,
                border: "none",
                color: PALETTE.bgDark, borderRadius: 3, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke={PALETTE.bgDark} strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              Incorporar deportista
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showAddModal && (
            <AddAthleteModal
              onClose={() => setShowAddModal(false)}
              onSave={(newAthlete) => {
                onAddAthlete(newAthlete);
                setShowAddModal(false);
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showBulkModal && (
            <BulkUploaderModal
              onClose={() => setShowBulkModal(false)}
              onSaveAll={(newAthletes) => {
                onAddBulk(newAthletes);
                setShowBulkModal(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Cabecera de la tabla — hidden on mobile (card view takes over) */}
        <div className="plantilla-table-header" style={{ display:"grid", gridTemplateColumns:"32px 28px 1fr 80px 30px 30px 30px 60px", padding:"6px 12px", background:PALETTE.surface, borderBottom:`1px solid ${PALETTE.border}` }}>
          <div onClick={() => setSortKey("posCode")} style={headerCell("POS","posCode")}>POS</div>
          <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"1px", color: PALETTE.textHint, textAlign:"center" }}>#</div>
          <div onClick={() => setSortKey("name")} style={headerCell("Nombre","name")}>Nombre</div>
          <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"1px", color: PALETTE.textHint, textAlign:"center" }}>Nacimiento</div>
          <div style={{ fontSize:8, color:PALETTE.yellowCard, textAlign:"center" }}>🟨</div>
          <div style={{ fontSize:8, color: PALETTE.danger, textAlign:"center" }}>🟥</div>
          <div onClick={() => setSortKey("goals")} style={{ ...headerCell("GOL","goals"), textAlign:"center" }}>GOL</div>
          <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"1px", color: PALETTE.textHint, textAlign:"right" }}>Estado</div>
        </div>

        {/* Filas de jugadores — staggered entry / empty state */}
        <motion.div
          variants={listVariants}
          initial="initial"
          animate="animate"
          style={{ flex:1, overflowY:"auto" }}
        >
          {displayedAthletes.length === 0 ? (
            <EmptyState
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={PALETTE.purpleVibrant} strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke={PALETTE.purpleVibrant} strokeWidth="1.8"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={PALETTE.purpleVibrant} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              }
              title={athletes.length === 0 ? "Tu plantilla está lista para crecer" : "No hay jugadores con ese filtro"}
              subtitle={
                athletes.length === 0
                  ? "Agrega tu primer deportista o importa una lista completa"
                  : "Prueba cambiando el estado o el orden de la lista"
              }
              actionLabel={athletes.length === 0 ? "Agregar deportista" : undefined}
              onAction={athletes.length === 0 ? () => setShowAddModal(true) : undefined}
              secondaryLabel={athletes.length === 0 ? "Importar CSV" : undefined}
              onSecondary={athletes.length === 0 ? () => setShowBulkModal(true) : undefined}
            />
          ) : (
            displayedAthletes.map((a, i) => (
              <motion.div key={a.id} variants={rowVariant}>
                <PlayerRow
                  athlete={a}
                  index={i}
                  isSelected={selectedAthlete?.id === a.id}
                  onSelect={setSelectedAthlete}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* ── PANEL EDICIÓN — slide in from right (desktop only) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedAthlete?.id ?? "empty"}
          className="plantilla-edit-panel"
          variants={panelVariant}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ background:PALETTE.surface, borderLeft:`1px solid ${PALETTE.border}`, boxShadow:"-10px 0 28px rgba(23,26,28,0.08)", overflow:"hidden", display:"flex", flexDirection:"column", minHeight:0 }}
        >
          <PlayerEditPanel
            athlete={selectedAthlete}
            onUpdate={(updated) => {
              onUpdateAthlete(updated);
              setSelectedAthlete(updated);
            }}
            onClose={() => setSelectedAthlete(null)}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * @component TacticalBoardView
 * @description Vista de pizarra táctica con campo de fútbol,
 * tokens de jugadores, selector de formaciones y cuadro de notas.
 */
function TacticalBoardView({ athletes }) {
  const [formation,    setFormation]    = useState("4-3-3");
  const [selectedIdx,  setSelectedIdx]  = useState(null);
  const [tacticalNote, setTacticalNote] = useState("");
  const [savingTactics, setSavingTactics] = useState(false);
  const [exportingPDF,  setExportingPDF]  = useState(false);

  /** Guarda formacion y notas en Supabase */
  const handleSaveFormation = async () => {
    if (savingTactics) return;
    setSavingTactics(true);
    const starters = athletes.filter(a => a.available).slice(0, 11);
    const rolesData = starters.reduce((acc, a, i) => {
      acc[i] = { id: a.id, name: a.name, posCode: a.posCode };
      return acc;
    }, {});
    const ok = await saveTacticalData(rolesData, tacticalNote, formation);
    showToast(ok ? "Formacion guardada correctamente" : "Guardado localmente (sin conexion)", ok ? "success" : "info");
    setSavingTactics(false);
  };

  /** Exporta el campo tactico como imagen PNG usando html2canvas */
  const handleExportPDF = async () => {
    if (exportingPDF) return;
    setExportingPDF(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const target = document.getElementById("tactical-field-capture");
      if (!target) { showToast("No se encontro el campo para exportar", "error"); setExportingPDF(false); return; }
      const canvas = await html2canvas(target, { backgroundColor: "#0a1f08", scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `formacion-${formation}-${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Imagen exportada correctamente", "success");
    } catch {
      showToast("Error al exportar — intenta de nuevo", "error");
    }
    setExportingPDF(false);
  };

  const starters   = athletes.filter(a => a.available).slice(0, 11);
  const bench      = athletes.filter((_, i) => i >= 11).slice(0, 7);
  const positions  = FORMATIONS[formation];
  const selected   = selectedIdx !== null ? starters[selectedIdx] : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"170px 1fr 220px", height:"100%", minHeight:0 }}>

      {/* ── SIDEBAR IZQ: formaciones + suplentes ── */}
      <div style={{ background: PALETTE.surface, borderRight:`1px solid ${PALETTE.border}`, display:"flex", flexDirection:"column", overflowY:"auto" }}>

        <div style={{ padding:"10px 14px 6px" }}>
          <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"2px", color: PALETTE.textHint, marginBottom:8 }}>Formación activa</div>
          {Object.keys(FORMATIONS).map(f => (
            <div
              key={f}
              onClick={() => { setFormation(f); setSelectedIdx(null); }}
              style={{ padding:"7px 10px", fontSize:11, color: formation===f ? PALETTE.bronce : PALETTE.textMuted, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${PALETTE.border}`, background: formation===f ? PALETTE.bronceDim : "transparent", borderLeft: formation===f ? `2px solid ${PALETTE.bronce}` : "2px solid transparent", marginBottom:1 }}
            >
              {f}
              {formation===f && <span style={{ fontSize:8, color: PALETTE.bronce }}>●</span>}
            </div>
          ))}
        </div>

        <div style={{ padding:"10px 14px 6px", borderTop:`1px solid ${PALETTE.border}`, marginTop:4 }}>
          <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"2px", color: PALETTE.textHint, marginBottom:8 }}>Suplentes</div>
          {bench.map(a => (
            <div key={a.id} style={{ padding:"6px 8px", display:"flex", alignItems:"center", gap:8, borderBottom:`1px solid rgba(255,255,255,0.04)`, cursor:"pointer" }}>
              <img
                src={getAvatarUrl(a.photo)}
                alt={a.name}
                style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover", border:`1px solid ${a.status==="L" ? PALETTE.danger : "rgba(255,255,255,0.12)"}` }}
              />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.7)", textTransform:"uppercase", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.name.split(" ")[0]}</div>
                <div style={{ fontSize:7, color: PALETTE.textHint, textTransform:"uppercase" }}>{a.posCode}</div>
              </div>
              <div style={{ width:5, height:5, borderRadius:"50%", background: getStatusStyle(a.status).color, flexShrink:0 }}/>
            </div>
          ))}
        </div>
      </div>

      {/* ── CAMPO TÁCTICO ─────────────────────── */}
      <div id="tactical-field-capture" style={{ display:"flex", flexDirection:"column", minHeight:0 }}>
        <div style={{ padding:"8px 14px", background:"rgba(0,0,0,0.7)", borderBottom:`1px solid ${PALETTE.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color: PALETTE.textMuted }}>
            Formación {formation}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <motion.div
              onClick={handleSaveFormation}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontSize: 9, padding: "4px 12px",
                background: "transparent",
                border: `1px solid rgba(255,255,255,0.18)`,
                color: savingTactics ? PALETTE.bronce : PALETTE.textMuted,
                cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {savingTactics ? "Guardando..." : "Guardar"}
            </motion.div>
            <motion.div
              onClick={() => showToast("Selecciona el partido en Match Center para usar esta formación", "info")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontSize: 9, padding: "4px 12px",
                background: PALETTE.bronce, color: PALETTE.bgDark,
                cursor: "pointer", textTransform: "uppercase",
                letterSpacing: "1px", fontWeight: 700,
              }}
            >
              Usar en partido →
            </motion.div>
          </div>
        </div>

        <div style={{ position:"relative", flex:1 }}>
          {/* Campo SVG */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 500 560" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#0a1f08"/>
                <stop offset="50%"  stopColor="#0d2a0a"/>
                <stop offset="100%" stopColor="#0a1f08"/>
              </linearGradient>
            </defs>
            <rect width="500" height="560" fill="url(#grass)"/>
            {/* Franjas de césped alternadas */}
            {[0,1,2,3,4,5,6].map(i => (
              <rect key={i} x="0" y={i*80} width="500" height="40" fill="rgba(255,255,255,0.015)"/>
            ))}
            {/* Líneas del campo */}
            <rect x="25" y="15" width="450" height="530" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2"/>
            <line x1="25" y1="280" x2="475" y2="280" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
            <circle cx="250" cy="280" r="65" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5"/>
            <circle cx="250" cy="280" r="3" fill="rgba(255,255,255,0.3)"/>
            {/* Área grande */}
            <rect x="25" y="155" width="150" height="210" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2"/>
            <rect x="325" y="155" width="150" height="210" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2"/>
            {/* Área pequeña */}
            <rect x="25" y="210" width="62" height="100" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
            <rect x="413" y="210" width="62" height="100" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
            {/* Puntos de penalti */}
            <circle cx="105" cy="280" r="3" fill="rgba(255,255,255,0.2)"/>
            <circle cx="395" cy="280" r="3" fill="rgba(255,255,255,0.2)"/>
            {/* Semicírculos de área */}
            <path d="M 175 155 A 65 65 0 0 0 175 365" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
            <path d="M 325 155 A 65 65 0 0 1 325 365" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
          </svg>

          {/* Tokens de jugadores */}
          {starters.map((athlete, i) => {
            const position  = positions[i];
            if (!position) return null;
            const isSelected = selectedIdx === i;

            return (
              <div
                key={athlete.id}
                onClick={() => setSelectedIdx(isSelected ? null : i)}
                style={{
                  position:  "absolute",
                  left:      position.left,
                  top:       position.top,
                  transform: "translate(-50%,-50%)",
                  display:   "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap:       2,
                  cursor:    "pointer",
                  zIndex:    5,
                  // Glow en selección
                  filter:    isSelected ? `drop-shadow(0 0 6px ${PALETTE.bronce})` : "none",
                  transition:"filter 200ms",
                }}
              >
                <div style={{
                  width:      52,
                  background: "rgba(5,10,5,0.95)",
                  border:     `${isSelected ? 2 : 1}px solid ${isSelected ? PALETTE.bronce : "rgba(206, 137, 70,0.25)"}`,
                  overflow:   "hidden",
                  textAlign:  "center",
                }}>
                  <img
                    src={getAvatarUrl(athlete.photo)}
                    alt={athlete.name}
                    style={{ width:"100%", height:44, objectFit:"cover", objectPosition:"top", display:"block" }}
                  />
                  <div style={{ padding:"2px 3px 3px", background:"rgba(0,0,0,0.7)" }}>
                    <div style={{ fontSize:7, color: PALETTE.text, textTransform:"uppercase", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {athlete.name.split(" ")[0]}
                    </div>
                    <div style={{ fontSize:6, color: PALETTE.bronce, textTransform:"uppercase", marginTop:1 }}>{position.posCode}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PANEL DERECHO: info + notas ─────── */}
      <div style={{ background:PALETTE.surface, borderLeft:`1px solid ${PALETTE.border}`, display:"flex", flexDirection:"column" }}>

        {/* Info del jugador seleccionado en el campo */}
        {selected ? (
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${PALETTE.border}` }}>
            <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"2px", color: PALETTE.textHint, marginBottom:10 }}>Titular seleccionado</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <img src={getAvatarUrl(selected.photo)} alt={selected.name} style={{ width:46, height:46, borderRadius:"50%", border:`2px solid ${PALETTE.bronce}`, objectFit:"cover" }}/>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color: PALETTE.text, textTransform:"uppercase" }}>{selected.name}</div>
                <div style={{ fontSize:9, color: PALETTE.bronce, textTransform:"uppercase", marginTop:2 }}>{selected.pos}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                { label:"Goles",    value: selected.goals      || 0 },
                { label:"T. Amar.", value: selected.yellowCards || 0, color:PALETTE.yellowCard },
                { label:"T. Rojas", value: selected.redCards   || 0, color: PALETTE.danger },
                { label:"RPE prom.",value: selected.rpe        || "—" },
              ].map(m => (
                <div key={m.label} style={{ background:"#FFFFFF", padding:"6px 8px" }}>
                  <div style={{ fontSize:7, color: PALETTE.textHint, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:2 }}>{m.label}</div>
                  <div style={{ fontSize:14, fontWeight:700, color: m.color || PALETTE.text }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${PALETTE.border}` }}>
            <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"2px", color: PALETTE.textHint, marginBottom:8 }}>Toca un jugador en el campo</div>
            <div style={{ fontSize:11, color: PALETTE.textHint, opacity:0.5 }}>para ver sus datos</div>
          </div>
        )}

        {/* Cuadro de notas tácticas */}
        <div style={{ flex:1, padding:"12px 16px", display:"flex", flexDirection:"column" }}>
          <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"2px", color: PALETTE.textHint, marginBottom:8 }}>Notas tácticas</div>
          <textarea
            value={tacticalNote}
            onChange={e => setTacticalNote(e.target.value)}
            placeholder="Anotaciones del partido, instrucciones, presión alta, bloques defensivos..."
            style={{
              flex:       1,
              background:"#FFFFFF",
              border:     `1px solid ${PALETTE.border}`,
              padding:    "10px 12px",
              fontSize:   11,
              color:      PALETTE.text,
              fontFamily: "inherit",
              outline:    "none",
              resize:     "none",
              lineHeight: 1.7,
              minHeight:  120,
            }}
          />
          <div style={{ fontSize:9, color: PALETTE.textHint, marginTop:6, textAlign:"right" }}>
            {tacticalNote.length} caracteres
          </div>
        </div>

        {/* Acciones del campo */}
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${PALETTE.border}`, display:"flex", flexDirection:"column", gap:6 }}>
          <motion.div
            onClick={handleSaveFormation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: 8, borderRadius: 3,
              background: savingTactics ? `${PALETTE.bronce}60` : PALETTE.bronce,
              color: PALETTE.bgDark, fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "1px",
              cursor: savingTactics ? "not-allowed" : "pointer", textAlign: "center",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {savingTactics ? (
              <>
                <div style={{ width: 10, height: 10, borderStyle: "solid", borderWidth: 2, borderColor: `${PALETTE.bgDark} ${PALETTE.bgDark} ${PALETTE.bgDark} transparent`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Guardando...
              </>
            ) : "Guardar formacion"}
          </motion.div>
          <motion.div
            onClick={handleExportPDF}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: 8, borderRadius: 3,
              background: "transparent",
              border: `1px solid rgba(255,255,255,0.15)`,
              color: exportingPDF ? PALETTE.bronce : PALETTE.textMuted,
              fontSize: 10, textTransform: "uppercase", letterSpacing: "1px",
              cursor: exportingPDF ? "not-allowed" : "pointer", textAlign: "center",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {exportingPDF ? (
              <>
                <div style={{ width: 10, height: 10, borderStyle: "solid", borderWidth: 2, borderColor: `${PALETTE.bronce} ${PALETTE.bronce} ${PALETTE.bronce} transparent`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Exportando...
              </>
            ) : "Exportar imagen"}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE RAÍZ
// ─────────────────────────────────────────────
export default function GestionPlantilla({ clubId = "" }) {
  const athletes = useStore(state => state.athletes);
  const setAthletes = useStore(state => state.setAthletes);
  const historial = useStore(state => state.historial);

  const [activeTab, setActiveTab] = useState("lista");

  /**
   * Actualiza un jugador en el estado global.
   * Busca por ID para no depender del índice (que puede cambiar con filtros).
   */
  const handleUpdateAthlete = (updatedAthlete) => {
    setAthletes(prev =>
      prev.map(a => a.id === updatedAthlete.id ? { ...a, ...updatedAthlete } : a)
    );
  };

  /** Agrega un deportista individual al plantel */
  const handleAddAthlete = (newAthlete) => {
    setAthletes(prev => [...prev, newAthlete]);
  };

  /** Agrega multiples deportistas (carga masiva CSV) */
  const handleAddBulk = (newAthletes) => {
    setAthletes(prev => [...prev, ...newAthletes]);
  };

  const tabs = [
    { key:"lista",   label:"Plantilla"       },
    { key:"pizarra", label:"Pizarra táctica" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 80px)", minHeight:0, background:PALETTE.bg }}>

      {/* Tabs de navegación interna */}
      <div style={{ display:"flex", alignItems:"stretch", height:36, background:PALETTE.bgDeep, borderBottom:`1px solid ${PALETTE.border}`, flexShrink:0 }}>
        {tabs.map(({ key, label }) => (
          <div
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding:        "0 20px",
              fontSize:       10,
              textTransform:  "uppercase",
              letterSpacing:  "2px",
              color:          activeTab === key ? PALETTE.text : PALETTE.textMuted,
              display:        "flex",
              alignItems:     "center",
              cursor:         "pointer",
              borderRight:    `1px solid ${PALETTE.border}`,
              borderBottom:   activeTab === key ? `2px solid ${PALETTE.bronce}` : "2px solid transparent",
              background:     activeTab === key ? PALETTE.bronceDim : PALETTE.bgDeep,
              transition:     "all 150ms",
            }}
          >
            {label}
          </div>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", padding:"0 16px", fontSize:9, color: PALETTE.textHint, textTransform:"uppercase", letterSpacing:"1px" }}>
          {athletes.length} jugadores · {athletes.filter(a=>a.status==="P").length} disponibles
        </div>
      </div>

      {/* Contenido de la tab activa */}
      <div style={{ flex:1, minHeight:0, overflow:"hidden" }}>
        {activeTab === "lista" && (
          <PlayerListView
            athletes={athletes}
            onUpdateAthlete={handleUpdateAthlete}
            onAddAthlete={handleAddAthlete}
            onAddBulk={handleAddBulk}
          />
        )}
        {activeTab === "pizarra" && (
          <TacticalBoardV9 athletes={athletes} historial={historial} clubId={clubId} />
        )}
      </div>
    </div>
  );
}


