/**
 * @component TacticalBoard v3
 * @description Pizarra táctica rediseñada con estética EA Sports FC / FIFA 18.
 *
 * @visual-architecture
 * - Fondo: imagen de estadio con blur + overlay oscuro (layering FIFA)
 * - Campo: panel flotante con box-shadow pronunciada, césped verde con franjas
 * - Tokens: tarjetas rectangulares con número, posición, nombre y valoración
 * - Suplentes: panel inferior horizontal flotante (igual que FIFA)
 * - Detalle jugador: panel lateral al hacer click con hexágono de atributos
 * - Recomendaciones: al click en un token, muestra jugadores de esa posición
 *
 * @drag-drop
 * HTML5 nativo. dragSource guarda { type, index }.
 * Swap automático entre titulares y entre titular ↔ suplente.
 *
 * @new-features-v3
 * - Navbar superior: Plantilla / Formaciones / Instrucciones / Tácticas
 * - Badge de formación elegante junto al navbar
 * - Fondo estadio con CSS backdrop-filter blur
 * - Panel de detalle con gráfico radar hexagonal SVG
 * - Recomendaciones de posición al seleccionar un jugador
 * - Animación de entrada al panel de suplentes
 * - Efectos hover/drag premium
 *
 * @version 3.0
 * @author Elevate Sports
 */

import { useState, useRef, useCallback, useMemo } from "react";

// ─────────────────────────────────────────────
// PALETA FIFA
// ─────────────────────────────────────────────
const C = {
  neon:        "#c8ff00",
  neonDim:     "rgba(200,255,0,0.12)",
  neonBorder:  "rgba(200,255,0,0.35)",
  drag:        "#00e5ff",
  dragDim:     "rgba(0,229,255,0.18)",
  surface:     "rgba(10,14,20,0.88)",
  surfaceHi:   "rgba(255,255,255,0.06)",
  border:      "rgba(255,255,255,0.12)",
  borderHi:    "rgba(255,255,255,0.28)",
  text:        "white",
  textMuted:   "rgba(255,255,255,0.5)",
  textHint:    "rgba(255,255,255,0.25)",
  cardRed:     "#b91c1c",
  cardRedHi:   "#dc2626",
  cardGK:      "#065f46",
  cardGKHi:    "#047857",
  gold:        "#f59e0b",
  fieldGreen:  "#2d5a1b",
  fieldDark:   "#264f17",
};

// ─────────────────────────────────────────────
// FORMACIONES
// Coordenadas en % sobre media cancha
// top=5 (ataque) → top=92 (portería)
// ─────────────────────────────────────────────
const FORMATIONS = {
  "4-4-2": {
    label: "Holding",
    positions: [
      { posCode:"GK",  left:50, top:90 },
      { posCode:"LB",  left:10, top:74 },
      { posCode:"LCB", left:32, top:78 },
      { posCode:"RCB", left:68, top:78 },
      { posCode:"RB",  left:90, top:74 },
      { posCode:"LM",  left:10, top:51 },
      { posCode:"LDM", left:34, top:54 },
      { posCode:"RDM", left:66, top:54 },
      { posCode:"RM",  left:90, top:51 },
      { posCode:"LS",  left:36, top:17 },
      { posCode:"RS",  left:64, top:17 },
    ],
  },
  "4-3-3": {
    label: "Ataque",
    positions: [
      { posCode:"GK",  left:50, top:90 },
      { posCode:"LB",  left:10, top:74 },
      { posCode:"CB",  left:34, top:78 },
      { posCode:"CB",  left:66, top:78 },
      { posCode:"RB",  left:90, top:74 },
      { posCode:"CM",  left:26, top:51 },
      { posCode:"CM",  left:50, top:47 },
      { posCode:"CM",  left:74, top:51 },
      { posCode:"LW",  left:12, top:19 },
      { posCode:"ST",  left:50, top:12 },
      { posCode:"RW",  left:88, top:19 },
    ],
  },
  "3-5-2": {
    label: "Compacto",
    positions: [
      { posCode:"GK",  left:50, top:90 },
      { posCode:"CB",  left:24, top:78 },
      { posCode:"CB",  left:50, top:80 },
      { posCode:"CB",  left:76, top:78 },
      { posCode:"LWB", left:8,  top:55 },
      { posCode:"CM",  left:30, top:52 },
      { posCode:"CM",  left:50, top:49 },
      { posCode:"CM",  left:70, top:52 },
      { posCode:"RWB", left:92, top:55 },
      { posCode:"ST",  left:36, top:17 },
      { posCode:"ST",  left:64, top:17 },
    ],
  },
  "4-2-3-1": {
    label: "Control",
    positions: [
      { posCode:"GK",  left:50, top:90 },
      { posCode:"LB",  left:10, top:74 },
      { posCode:"CB",  left:34, top:78 },
      { posCode:"CB",  left:66, top:78 },
      { posCode:"RB",  left:90, top:74 },
      { posCode:"DM",  left:37, top:61 },
      { posCode:"DM",  left:63, top:61 },
      { posCode:"LW",  left:16, top:37 },
      { posCode:"CAM", left:50, top:35 },
      { posCode:"RW",  left:84, top:37 },
      { posCode:"ST",  left:50, top:12 },
    ],
  },
  "5-3-2": {
    label: "Defensivo",
    positions: [
      { posCode:"GK",  left:50, top:90 },
      { posCode:"LWB", left:7,  top:65 },
      { posCode:"CB",  left:26, top:78 },
      { posCode:"CB",  left:50, top:80 },
      { posCode:"CB",  left:74, top:78 },
      { posCode:"RWB", left:93, top:65 },
      { posCode:"CM",  left:28, top:50 },
      { posCode:"CM",  left:50, top:47 },
      { posCode:"CM",  left:72, top:50 },
      { posCode:"ST",  left:36, top:17 },
      { posCode:"ST",  left:64, top:17 },
    ],
  },
};

// Grupos de posición para recomendaciones
const POSITION_GROUPS = {
  GK:  ["GK"],
  DEF: ["CB","LB","RB","LCB","RCB","LWB","RWB"],
  MID: ["CM","DM","LDM","RDM","CAM","LM","RM","LW","RW","LWB","RWB"],
  FWD: ["ST","LS","RS","CF"],
};

const getPositionGroup = (posCode) => {
  for (const [group, codes] of Object.entries(POSITION_GROUPS)) {
    if (codes.includes(posCode)) return group;
  }
  return "MID";
};

// ─────────────────────────────────────────────
// GRÁFICO RADAR HEXAGONAL
// Dibuja los 6 atributos del jugador como hexágono SVG.
// ─────────────────────────────────────────────
function HexRadar({ attrs, size = 80 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.38;

  // 6 vértices del hexágono base, empezando desde arriba
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  // Escala cada atributo (0–99) al radio correspondiente
  const attrKeys = Object.keys(attrs);
  const dataPoints = hexPoints.map((pt, i) => {
    const scale = (attrs[attrKeys[i]] || 50) / 99;
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return {
      x: cx + r * scale * Math.cos(angle),
      y: cy + r * scale * Math.sin(angle),
    };
  });

  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid hexagonal de fondo */}
      {[0.33, 0.66, 1].map((scale, si) => (
        <polygon
          key={si}
          points={hexPoints.map(p => `${(cx + (p.x - cx) * scale).toFixed(1)},${(cy + (p.y - cy) * scale).toFixed(1)}`).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
      ))}
      {/* Líneas radiales */}
      {hexPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
      ))}
      {/* Área de datos */}
      <path d={toPath(dataPoints)} fill="rgba(200,255,0,0.22)" stroke={C.neon} strokeWidth="1.2"/>
      {/* Puntos de datos */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="1.8" fill={C.neon}/>
      ))}
      {/* Etiquetas */}
      {hexPoints.map((p, i) => {
        const label = attrKeys[i]?.slice(0, 3).toUpperCase() || "";
        const lx = cx + (p.x - cx) * 1.28;
        const ly = cy + (p.y - cy) * 1.28;
        return (
          <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
            fontSize="5.5" fill="rgba(255,255,255,0.55)" fontFamily="Arial Narrow, Arial, sans-serif" fontWeight="700">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
// TARJETA DE JUGADOR EN EL CAMPO
// Diseño rectangular con número, posición, nombre y rating
// ─────────────────────────────────────────────
function PlayerCard({ starter, isSelected, isDragged, isTarget, onSelect, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }) {
  const [hovered, setHovered] = useState(false);
  const isGK     = starter.posCode === "GK";
  const athlete  = starter.athlete;
  const rating   = athlete?.rating || Math.floor(70 + Math.random() * 20);
  const active   = isSelected || hovered;

  const cardBg   = isTarget
    ? C.dragDim
    : isGK
      ? (active ? C.cardGKHi : C.cardGK)
      : (active ? C.cardRedHi : C.cardRed);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      style={{
        position:   "relative",
        width:      58,
        background: cardBg,
        border:     `${isSelected ? 2 : 1}px solid ${isSelected ? C.neon : isTarget ? C.drag : active ? C.borderHi : C.border}`,
        boxShadow:  isSelected
          ? `0 0 0 1px ${C.neon}, 0 0 14px rgba(200,255,0,0.35)`
          : isTarget
            ? `0 0 0 1px ${C.drag}, 0 0 12px ${C.dragDim}`
            : active
              ? "0 4px 16px rgba(0,0,0,0.7)"
              : "0 2px 8px rgba(0,0,0,0.5)",
        cursor:     "grab",
        opacity:    isDragged ? 0.25 : 1,
        transform:  `scale(${isTarget ? 1.08 : active && !isDragged ? 1.04 : 1})`,
        transition: "transform 180ms ease, box-shadow 180ms ease, opacity 120ms",
        userSelect: "none",
        pointerEvents: isDragged ? "none" : "auto",
        borderRadius: 3,
        overflow:   "hidden",
      }}
    >
      {/* Franja superior de color por posición */}
      <div style={{ height: 3, background: isGK ? "#10b981" : isSelected ? C.neon : "#f87171", transition:"background 200ms" }}/>

      {/* Rating y posición */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 5px 1px" }}>
        <div style={{ fontSize:13, fontWeight:900, color: C.text, lineHeight:1, letterSpacing:"-0.5px" }}>
          {rating}
        </div>
        <div style={{ fontSize:7, color: isGK ? "#6ee7b7" : "rgba(255,200,200,0.8)", textTransform:"uppercase", fontWeight:700, letterSpacing:"0.3px" }}>
          {starter.posCode}
        </div>
      </div>

      {/* Nombre */}
      <div style={{ padding:"1px 5px 4px", fontSize:7, color: C.text, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {athlete?.name?.split(" ").pop() || starter.posCode}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PANEL DETALLE + RECOMENDACIONES
// Aparece al hacer click en un jugador del campo
// ─────────────────────────────────────────────
function PlayerDetailPanel({ starter, allAthletes, onSwapRecommended, onClose }) {
  if (!starter) return null;
  const athlete = starter.athlete;
  const group   = getPositionGroup(starter.posCode);

  // Jugadores recomendados de la misma posición que no son titulares
  const recommended = allAthletes.filter(a =>
    getPositionGroup(a.posCode) === group &&
    a.id !== athlete?.id
  ).slice(0, 4);

  const attrs = {
    Ritmo:   athlete?.speed    || 78,
    Tiro:    athlete?.shooting || 72,
    Pases:   athlete?.passing  || 80,
    Regate:  athlete?.dribble  || 75,
    Defensa: athlete?.defense  || 65,
    Físico:  athlete?.physical || 77,
  };

  return (
    <div style={{
      position:    "absolute",
      top:         10,
      left:        10,
      width:       200,
      background:  "rgba(8,12,20,0.96)",
      border:      `1px solid ${C.neonBorder}`,
      boxShadow:   `0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,255,0,0.1)`,
      zIndex:      40,
      borderRadius:4,
      overflow:    "hidden",
    }}>
      {/* Header */}
      <div style={{ background:"rgba(200,255,0,0.08)", borderBottom:`1px solid ${C.border}`, padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:14, fontWeight:900, color: C.text, textTransform:"uppercase", letterSpacing:"-0.5px", lineHeight:1 }}>
            {athlete?.name?.split(" ").pop() || starter.posCode}
          </div>
          <div style={{ fontSize:9, color: C.neon, textTransform:"uppercase", letterSpacing:"1px", marginTop:2 }}>
            {starter.posCode} · {athlete?.pos || "—"}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ fontSize:22, fontWeight:900, color: C.neon, lineHeight:1 }}>
            {athlete?.rating || 82}
          </div>
          <div style={{ fontSize:7, color: C.textHint, textTransform:"uppercase", letterSpacing:"1px" }}>OVR</div>
        </div>
        <div onClick={onClose} style={{ fontSize:14, color: C.textMuted, cursor:"pointer", padding:"2px 6px", marginLeft:4 }}>✕</div>
      </div>

      {/* Radar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"10px 0 6px" }}>
        <HexRadar attrs={attrs} size={96}/>
      </div>

      {/* Atributos en lista */}
      <div style={{ padding:"4px 12px 10px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3px 12px" }}>
        {Object.entries(attrs).map(([k, v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:9, color: C.textMuted, textTransform:"uppercase", letterSpacing:"0.3px" }}>{k}</span>
            <span style={{ fontSize:10, fontWeight:700, color: v >= 80 ? C.neon : v >= 70 ? C.gold : C.textMuted }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Recomendados */}
      {recommended.length > 0 && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"8px 12px" }}>
          <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"1.5px", color: C.textHint, marginBottom:6 }}>
            Jugadores similares
          </div>
          {recommended.map(a => (
            <div
              key={a.id}
              onClick={() => onSwapRecommended(a)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", marginBottom:3, background: C.surfaceHi, border:`1px solid ${C.border}`, cursor:"pointer", borderRadius:2 }}
            >
              <div style={{ fontSize:13, fontWeight:900, color: C.neon, minWidth:24 }}>
                {a.rating || Math.floor(70 + Math.random() * 18)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:9, color: C.text, fontWeight:700, textTransform:"uppercase", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {a.name?.split(" ").pop() || "—"}
                </div>
                <div style={{ fontSize:7, color: C.textMuted, textTransform:"uppercase" }}>{a.posCode}</div>
              </div>
              <div style={{ fontSize:8, color: C.neon, textTransform:"uppercase", letterSpacing:"0.5px" }}>↑ Cambiar</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TARJETA EN EL BANCO
// ─────────────────────────────────────────────
function BenchCard({ benchItem, isDragged, isTarget, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }) {
  const [hovered, setHovered] = useState(false);
  const athlete = benchItem.athlete;
  const isGK    = athlete?.posCode === "GK";
  const rating  = athlete?.rating || Math.floor(70 + Math.random() * 18);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    "flex",
        flexDirection:"column",
        alignItems: "center",
        gap:        4,
        padding:    "6px 8px",
        width:      72,
        flexShrink: 0,
        background: isDragged ? C.dragDim : hovered ? C.surfaceHi : "rgba(255,255,255,0.04)",
        border:     `1px solid ${isDragged ? C.drag : isTarget ? C.drag : hovered ? C.borderHi : C.border}`,
        cursor:     "grab",
        opacity:    isDragged ? 0.35 : 1,
        transform:  `scale(${isTarget ? 1.06 : hovered ? 1.03 : 1})`,
        transition: "all 180ms ease",
        borderRadius:3,
      }}
    >
      {/* Rating grande */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%" }}>
        <div style={{ fontSize:16, fontWeight:900, color: C.neon, lineHeight:1 }}>{rating}</div>
        <div style={{ fontSize:7, color: isGK ? "#6ee7b7" : C.textMuted, textTransform:"uppercase", fontWeight:700 }}>
          {athlete?.posCode || "—"}
        </div>
      </div>
      {/* Color strip */}
      <div style={{ width:"100%", height:2, background: isGK ? "#10b981" : C.cardRed, borderRadius:1 }}/>
      {/* Nombre */}
      <div style={{ fontSize:8, color: C.text, fontWeight:700, textTransform:"uppercase", textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", width:"100%" }}>
        {athlete?.name?.split(" ").pop() || "—"}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function TacticalBoard({ athletes = [] }) {
  const [activeTab,    setActiveTab]    = useState("plantilla");
  const [formationKey, setFormationKey] = useState("4-4-2");
  const [showFormMenu, setShowFormMenu] = useState(false);
  const [dragging,     setDragging]     = useState(null);
  const [dropTarget,   setDropTarget]   = useState(null);
  const [selectedIdx,  setSelectedIdx]  = useState(null);

  const [starters, setStarters] = useState(() =>
    FORMATIONS["4-4-2"].positions.map((pos, i) => ({
      ...pos,
      currentLeft: pos.left,
      currentTop:  pos.top,
      athlete:     athletes[i] || null,
      id:          `starter-${i}`,
    }))
  );
  const [bench, setBench] = useState(() =>
    athletes.slice(11).map((a, i) => ({ athlete: a, id:`bench-${i}` }))
  );

  const fieldRef = useRef(null);

  const selectedStarter = selectedIdx !== null ? starters[selectedIdx] : null;

  // ── Cambio de formación ─────────────────────
  const handleFormationChange = useCallback((key) => {
    setFormationKey(key);
    setShowFormMenu(false);
    const newPos = FORMATIONS[key].positions;
    setStarters(prev => prev.map((s, i) => ({
      ...s,
      posCode:     newPos[i]?.posCode    ?? s.posCode,
      currentLeft: newPos[i]?.left       ?? s.currentLeft,
      currentTop:  newPos[i]?.top        ?? s.currentTop,
    })));
  }, []);

  // ── Drag ────────────────────────────────────
  const handleDragStart = useCallback((e, type, index) => {
    setDragging({ type, index });
    setSelectedIdx(null);
    e.dataTransfer.effectAllowed = "move";
    const g = document.createElement("div");
    g.style.cssText = "position:absolute;top:-9999px;";
    document.body.appendChild(g);
    e.dataTransfer.setDragImage(g, 0, 0);
    setTimeout(() => document.body.removeChild(g), 0);
  }, []);

  const handleFieldDrop = useCallback((e) => {
    e.preventDefault();
    if (!dragging || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const left = Math.min(Math.max(((e.clientX - rect.left)  / rect.width)  * 100, 5), 95);
    const top  = Math.min(Math.max(((e.clientY - rect.top)   / rect.height) * 100, 5), 95);

    if (dragging.type === "starter") {
      setStarters(prev => prev.map((s, i) => i === dragging.index ? { ...s, currentLeft: left, currentTop: top } : s));
    } else if (dragging.type === "bench") {
      const entering = bench[dragging.index];
      const emptyIdx = starters.findIndex(s => !s.athlete);
      if (emptyIdx >= 0) {
        setStarters(prev => prev.map((s, i) => i === emptyIdx ? { ...s, athlete: entering.athlete, currentLeft: left, currentTop: top } : s));
        setBench(prev => prev.filter((_, i) => i !== dragging.index));
      }
    }
    setDragging(null); setDropTarget(null);
  }, [dragging, bench, starters]);

  const handlePlayerDrop = useCallback((e, targetType, targetIndex) => {
    e.preventDefault(); e.stopPropagation();
    if (!dragging) return;

    if (dragging.type === "starter" && targetType === "starter") {
      setStarters(prev => {
        const next = [...prev];
        const src = { currentLeft: next[dragging.index].currentLeft, currentTop: next[dragging.index].currentTop };
        const dst = { currentLeft: next[targetIndex].currentLeft,    currentTop: next[targetIndex].currentTop    };
        next[dragging.index] = { ...next[dragging.index], ...dst };
        next[targetIndex]    = { ...next[targetIndex],    ...src };
        return next;
      });
    } else if (dragging.type === "bench" && targetType === "starter") {
      const entering = bench[dragging.index];
      const leaving  = starters[targetIndex].athlete;
      setStarters(prev => prev.map((s, i) => i === targetIndex ? { ...s, athlete: entering.athlete } : s));
      setBench(prev => {
        const next = prev.filter((_, i) => i !== dragging.index);
        return leaving ? [...next, { athlete: leaving, id:`bench-${Date.now()}` }] : next;
      });
    } else if (dragging.type === "starter" && targetType === "bench") {
      const leaving  = starters[dragging.index].athlete;
      const entering = bench[targetIndex];
      setStarters(prev => prev.map((s, i) => i === dragging.index ? { ...s, athlete: entering.athlete } : s));
      setBench(prev => {
        const next = prev.filter((_, i) => i !== targetIndex);
        return leaving ? [...next, { athlete: leaving, id:`bench-${Date.now()}` }] : next;
      });
    }
    setDragging(null); setDropTarget(null);
  }, [dragging, bench, starters]);

  // ── Swap desde recomendaciones ──────────────
  const handleSwapFromRecommended = useCallback((newAthlete) => {
    if (selectedIdx === null) return;
    const leavingAthlete = starters[selectedIdx].athlete;
    setStarters(prev => prev.map((s, i) => i === selectedIdx ? { ...s, athlete: newAthlete } : s));
    if (leavingAthlete) {
      setBench(prev => [...prev, { athlete: leavingAthlete, id:`bench-${Date.now()}` }]);
    }
    setBench(prev => prev.filter(b => b.athlete?.id !== newAthlete.id));
    setSelectedIdx(null);
  }, [selectedIdx, starters]);

  const isDraggingThis = (type, idx) => dragging?.type === type && dragging?.index === idx;

  const TABS = ["plantilla","formaciones","instrucciones","tácticas"];

  return (
    <div style={{
      position:   "relative",
      height:     "100%",
      minHeight:  0,
      background: "#0d1117",
      fontFamily: "'Arial Narrow', Arial, sans-serif",
      display:    "flex",
      flexDirection:"column",
      overflow:   "hidden",
    }}>

      {/* ── FONDO ESTADIO CON BLUR ──────────────
          Usamos un gradiente que simula la perspectiva
          del estadio FIFA: oscuro arriba, verde difuminado abajo */}
      <div style={{
        position:   "absolute",
        inset:      0,
        background: "radial-gradient(ellipse at 50% 110%, rgba(20,60,10,0.7) 0%, rgba(5,10,20,0.95) 60%)",
        zIndex:     0,
      }}/>

      {/* ── NAVBAR SUPERIOR ──────────────────── */}
      <div style={{ position:"relative", zIndex:10, display:"flex", alignItems:"stretch", background:"rgba(0,0,0,0.82)", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        {TABS.map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding:       "0 18px",
              height:        36,
              display:       "flex",
              alignItems:    "center",
              fontSize:      10,
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight:    700,
              color:         activeTab === tab ? C.text : C.textMuted,
              cursor:        "pointer",
              borderBottom:  activeTab === tab ? `2px solid ${C.neon}` : "2px solid transparent",
              background:    activeTab === tab ? C.neonDim : "transparent",
              transition:    "all 150ms",
            }}
          >
            {tab}
          </div>
        ))}

        {/* Badge de formación */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:0, paddingRight:16, position:"relative" }}>
          <div
            onClick={() => setShowFormMenu(v => !v)}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"0 14px", height:36, background:"rgba(200,255,0,0.08)", border:`1px solid ${C.neonBorder}`, cursor:"pointer" }}
          >
            <div style={{ fontSize:16, fontWeight:900, color: C.neon, letterSpacing:"-1px", lineHeight:1 }}>
              {formationKey}
            </div>
            <div style={{ display:"flex", flexDirection:"column" }}>
              <div style={{ fontSize:7, color: C.neon, textTransform:"uppercase", letterSpacing:"1.5px", lineHeight:1 }}>
                {FORMATIONS[formationKey].label}
              </div>
              <div style={{ fontSize:7, color: C.textHint, textTransform:"uppercase", letterSpacing:"1px", marginTop:1 }}>
                ▼ Cambiar
              </div>
            </div>
          </div>
          {showFormMenu && (
            <div style={{ position:"absolute", top:"100%", right:0, background:"rgba(5,10,20,0.98)", border:`1px solid ${C.border}`, zIndex:30, minWidth:160 }}>
              {Object.entries(FORMATIONS).map(([key, f]) => (
                <div key={key} onClick={() => handleFormationChange(key)}
                  style={{ padding:"8px 14px", fontSize:11, color: formationKey===key ? C.neon : C.textMuted, cursor:"pointer", borderBottom:`1px solid rgba(255,255,255,0.04)`, background: formationKey===key ? C.neonDim : "transparent", fontWeight: formationKey===key ? 700 : 400, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontWeight:700, marginRight:10 }}>{key}</span>
                  <span style={{ fontSize:9 }}>{f.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL ─────────────────── */}
      <div style={{ flex:1, display:"flex", minHeight:0, position:"relative", zIndex:5 }}>

        {/* ── CAMPO FLOTANTE ─────────────────── */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"10px 12px 80px 12px" }}>
          <div
            ref={fieldRef}
            onDragOver={e => e.preventDefault()}
            onDrop={handleFieldDrop}
            onClick={() => { setShowFormMenu(false); }}
            style={{
              position:   "relative",
              width:      "100%",
              // Media cancha con proporciones correctas
              aspectRatio:"68 / 52",
              maxHeight:  "calc(100vh - 200px)",
              background: `
                repeating-linear-gradient(
                  180deg,
                  rgba(0,0,0,0) 0px, rgba(0,0,0,0) 28px,
                  rgba(0,0,0,0.08) 28px, rgba(0,0,0,0.08) 56px
                ),
                linear-gradient(180deg, #2d5e1a 0%, #337a1c 40%, #2d5e1a 100%)
              `,
              border:     `2px solid rgba(255,255,255,0.2)`,
              borderRadius:4,
              overflow:   "hidden",
              cursor:     "crosshair",
              // Sombra pronunciada — efecto panel flotante FIFA
              boxShadow:  "0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {/* SVG líneas del campo */}
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
              viewBox="0 0 68 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="66" height="50" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4"/>
              <line x1="1" y1="1" x2="67" y2="1" stroke="rgba(255,255,255,0.7)" strokeWidth="0.6"/>
              <path d="M 25.5 1 A 9 9 0 0 0 42.5 1" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4"/>
              <rect x="11" y="33" width="46" height="18" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4"/>
              <rect x="22" y="41" width="24" height="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.35"/>
              <circle cx="34" cy="44" r="0.5" fill="rgba(255,255,255,0.6)"/>
              <path d="M 14 33 A 9 9 0 0 1 54 33" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35"/>
              <rect x="24.5" y="51" width="19" height="2.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5"/>
              <path d="M 1 3 A 1.5 1.5 0 0 0 3 1"  fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.35"/>
              <path d="M 67 3 A 1.5 1.5 0 0 1 65 1" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.35"/>
            </svg>

            {/* Tokens de titulares */}
            {starters.map((starter, i) => (
              <div key={starter.id}
                style={{ position:"absolute", left:`${starter.currentLeft}%`, top:`${starter.currentTop}%`, transform:"translate(-50%,-50%)", zIndex: isDraggingThis("starter",i) ? 1 : selectedIdx===i ? 15 : 5 }}>
                <PlayerCard
                  starter={starter}
                  isSelected={selectedIdx === i}
                  isDragged={isDraggingThis("starter", i)}
                  isTarget={dropTarget === i}
                  onSelect={(e) => { e.stopPropagation(); setSelectedIdx(selectedIdx===i ? null : i); }}
                  onDragStart={e => handleDragStart(e, "starter", i)}
                  onDragEnd={() => { setDragging(null); setDropTarget(null); }}
                  onDragOver={e => { e.preventDefault(); setDropTarget(i); }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={e => handlePlayerDrop(e, "starter", i)}
                />
              </div>
            ))}

            {/* Panel de detalle del jugador seleccionado */}
            {selectedStarter && (
              <PlayerDetailPanel
                starter={selectedStarter}
                allAthletes={athletes}
                onSwapRecommended={handleSwapFromRecommended}
                onClose={() => setSelectedIdx(null)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── BANCO INFERIOR FLOTANTE ──────────────
          Posicionado sobre el campo, panel horizontal
          idéntico al estilo FIFA */}
      <div style={{
        position:  "absolute",
        bottom:    0,
        left:      0,
        right:     0,
        zIndex:    20,
        background:"rgba(8,12,20,0.92)",
        borderTop: `1px solid ${C.border}`,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.6)",
      }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          if (dragging?.type === "starter") {
            const leaving = starters[dragging.index].athlete;
            if (leaving) {
              setBench(prev => [...prev, { athlete: leaving, id:`bench-${Date.now()}` }]);
              setStarters(prev => prev.map((s,i) => i===dragging.index ? {...s, athlete:null} : s));
            }
            setDragging(null);
          }
        }}
      >
        <div style={{ padding:"6px 14px", display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"2px", color: C.textHint, marginRight:8, flexShrink:0 }}>
            Suplentes
          </div>
          <div style={{ display:"flex", gap:6, overflowX:"auto", flex:1 }}>
            {bench.map((b, i) => (
              <BenchCard
                key={b.id}
                benchItem={b}
                isDragged={isDraggingThis("bench", i)}
                isTarget={dropTarget === `bench-${i}`}
                onDragStart={e => handleDragStart(e, "bench", i)}
                onDragEnd={() => setDragging(null)}
                onDragOver={e => { e.preventDefault(); setDropTarget(`bench-${i}`); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={e => handlePlayerDrop(e, "bench", i)}
              />
            ))}
            {bench.length === 0 && (
              <div style={{ fontSize:10, color: C.textHint, padding:"10px 0" }}>
                Arrastra titulares aquí para enviarlos al banco
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
