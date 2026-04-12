/**
 * @component TacticalBoardV9
 * @description Pizarra táctica Next-Gen — v9.1 LANDSCAPE REDESIGN.
 *
 * Cambios v9.1:
 * - Campo LANDSCAPE 105x68 (proporciones reales FIFA), sin perspectiva 3D
 * - Toggle full pitch / half pitch
 * - PlayerToken rediseñado como disco magnético compacto (36px)
 * - PlayerDetail como overlay flotante en esquina (no sidebar)
 * - Panel de formaciones como overlay flotante (no sidebar)
 * - DrawingToolbar movida a bottom bar del campo
 * - HORIZ_FORMATIONS con posiciones correctas para landscape
 *
 * @prop {Array}  athletes  - Array de atletas del plantel
 * @prop {Array}  historial - Historial de sesiones (para calcular RPE/salud)
 * @prop {string} [clubId]  - ID del club para namespace localStorage (multi-tenancy)
 *
 * @version 9.1
 * @author @Andres-UI — bajo directiva de Julián (rediseño completo del campo)
 */

"use client";

import { useState, useRef, useCallback, useMemo, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C } from "../../../shared/tokens/palette";
import { getAvatarUrl as avatar, getStatusStyle } from "../../../shared/utils/helpers";
import { calcSaludActual, saludColor, calcAthleteRisk } from "../../../shared/utils/rpeEngine";
import { useStore } from "../../../shared/store/useStore";
import { calcWellnessScore, getWellnessStatus } from "../../../shared/types/wellnessTypes";
import useLocalStorage from "../../../shared/hooks/useLocalStorage";
import useDragEngine from "../../../shared/hooks/useDragEngine";
import useDrawingEngine from "../../../shared/hooks/useDrawingEngine";
import ConfirmModal from "../../../shared/ui/ConfirmModal";
import { showToast } from "../../../shared/ui/Toast";

import FieldLayer from "./layers/FieldLayer";
import DrawingLayer from "./layers/DrawingLayer";
import GhostToken from "./tokens/GhostToken";
import DrawingToolbar from "./tools/DrawingToolbar";

/* ── Responsive CSS ─────────────────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("tbv9-responsive")) {
  const s = document.createElement("style");
  s.id = "tbv9-responsive";
  s.textContent = `
    @media(max-width:768px){
      .tbv9-detail-overlay{bottom:80px!important;right:8px!important;width:220px!important}
      .tbv9-formation-overlay{top:44px!important;left:8px!important;width:200px!important}
      .tbv9-tabs>div{padding:0 10px!important;font-size:9px!important}
      .tbv9-subs-bar{flex-wrap:nowrap;overflow-x:auto}
    }
    @media(max-width:480px){
      .tbv9-detail-overlay{width:180px!important}
    }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FORMACIONES LANDSCAPE
   Coordenadas left/top en % del campo.
   Layout: GK en izquierda (~5% left), delanteros en derecha (~85% left).
   top: 0% = arriba, 100% = abajo. Centro vertical = 50%.
═══════════════════════════════════════════════════════════════════════════════ */
const HORIZ_FORMATIONS = {
  "4-3-3": {
    label: "Ataque",
    positions: [
      { posCode:"PO",  left:5,  top:50 },
      { posCode:"LI",  left:22, top:15 }, { posCode:"DC",  left:20, top:37 },
      { posCode:"DC",  left:20, top:63 }, { posCode:"LD",  left:22, top:85 },
      { posCode:"MC",  left:44, top:28 }, { posCode:"MC",  left:42, top:50 },
      { posCode:"MC",  left:44, top:72 },
      { posCode:"EI",  left:75, top:14 }, { posCode:"DEL", left:82, top:50 },
      { posCode:"ED",  left:75, top:86 },
    ],
  },
  "4-4-2": {
    label: "Clasico",
    positions: [
      { posCode:"PO",  left:5,  top:50 },
      { posCode:"LI",  left:22, top:14 }, { posCode:"DC",  left:20, top:36 },
      { posCode:"DC",  left:20, top:64 }, { posCode:"LD",  left:22, top:86 },
      { posCode:"MI",  left:48, top:14 }, { posCode:"MC",  left:44, top:38 },
      { posCode:"MC",  left:44, top:62 }, { posCode:"MD",  left:48, top:86 },
      { posCode:"DEL", left:80, top:36 }, { posCode:"DEL", left:80, top:64 },
    ],
  },
  "3-5-2": {
    label: "Compacto",
    positions: [
      { posCode:"PO",  left:5,  top:50 },
      { posCode:"DC",  left:20, top:25 }, { posCode:"DC",  left:20, top:50 },
      { posCode:"DC",  left:20, top:75 },
      { posCode:"MI",  left:44, top:10 }, { posCode:"MC",  left:42, top:30 },
      { posCode:"MC",  left:42, top:50 }, { posCode:"MC",  left:42, top:70 },
      { posCode:"MD",  left:44, top:90 },
      { posCode:"DEL", left:80, top:35 }, { posCode:"DEL", left:80, top:65 },
    ],
  },
  "4-2-3-1": {
    label: "Control",
    positions: [
      { posCode:"PO",  left:5,  top:50 },
      { posCode:"LI",  left:22, top:14 }, { posCode:"DC",  left:20, top:36 },
      { posCode:"DC",  left:20, top:64 }, { posCode:"LD",  left:22, top:86 },
      { posCode:"VOL", left:38, top:38 }, { posCode:"VOL", left:38, top:62 },
      { posCode:"EI",  left:60, top:14 }, { posCode:"ENG", left:62, top:50 },
      { posCode:"ED",  left:60, top:86 }, { posCode:"DEL", left:82, top:50 },
    ],
  },
  "5-3-2": {
    label: "Defensivo",
    positions: [
      { posCode:"PO",  left:5,  top:50 },
      { posCode:"LI",  left:24, top:10 }, { posCode:"DC",  left:18, top:30 },
      { posCode:"DC",  left:18, top:50 }, { posCode:"DC",  left:18, top:70 },
      { posCode:"LD",  left:24, top:90 },
      { posCode:"MC",  left:44, top:30 }, { posCode:"MC",  left:42, top:50 },
      { posCode:"MC",  left:44, top:70 },
      { posCode:"DEL", left:80, top:36 }, { posCode:"DEL", left:80, top:64 },
    ],
  },
};

/* ── Media cancha: mitad ofensiva (left 50%→100% del campo = posiciones 50-95% en %) ── */
const HALF_FORMATIONS = {
  "4-3-3": {
    label: "Ataque",
    positions: [
      { posCode:"PO",  left:5,  top:50 },  // PO queda visible para referencia
      { posCode:"LI",  left:30, top:12 }, { posCode:"DC",  left:28, top:35 },
      { posCode:"DC",  left:28, top:65 }, { posCode:"LD",  left:30, top:88 },
      { posCode:"MC",  left:52, top:25 }, { posCode:"MC",  left:50, top:50 },
      { posCode:"MC",  left:52, top:75 },
      { posCode:"EI",  left:75, top:12 }, { posCode:"DEL", left:85, top:50 },
      { posCode:"ED",  left:75, top:88 },
    ],
  },
  "4-4-2": {
    label: "Clasico",
    positions: [
      { posCode:"PO",  left:5,  top:50 },
      { posCode:"LI",  left:30, top:10 }, { posCode:"DC",  left:28, top:33 },
      { posCode:"DC",  left:28, top:67 }, { posCode:"LD",  left:30, top:90 },
      { posCode:"MI",  left:54, top:10 }, { posCode:"MC",  left:50, top:35 },
      { posCode:"MC",  left:50, top:65 }, { posCode:"MD",  left:54, top:90 },
      { posCode:"DEL", left:83, top:35 }, { posCode:"DEL", left:83, top:65 },
    ],
  },
  "3-5-2": {
    label: "Compacto",
    positions: [
      { posCode:"PO",  left:5,  top:50 },
      { posCode:"DC",  left:28, top:22 }, { posCode:"DC",  left:28, top:50 },
      { posCode:"DC",  left:28, top:78 },
      { posCode:"MI",  left:52, top:8  }, { posCode:"MC",  left:50, top:28 },
      { posCode:"MC",  left:50, top:50 }, { posCode:"MC",  left:50, top:72 },
      { posCode:"MD",  left:52, top:92 },
      { posCode:"DEL", left:83, top:35 }, { posCode:"DEL", left:83, top:65 },
    ],
  },
  "4-2-3-1": {
    label: "Control",
    positions: [
      { posCode:"PO",  left:5,  top:50 },
      { posCode:"LI",  left:30, top:10 }, { posCode:"DC",  left:28, top:33 },
      { posCode:"DC",  left:28, top:67 }, { posCode:"LD",  left:30, top:90 },
      { posCode:"VOL", left:46, top:35 }, { posCode:"VOL", left:46, top:65 },
      { posCode:"EI",  left:65, top:12 }, { posCode:"ENG", left:68, top:50 },
      { posCode:"ED",  left:65, top:88 }, { posCode:"DEL", left:85, top:50 },
    ],
  },
  "5-3-2": {
    label: "Defensivo",
    positions: [
      { posCode:"PO",  left:5,  top:50 },
      { posCode:"LI",  left:32, top:8  }, { posCode:"DC",  left:26, top:28 },
      { posCode:"DC",  left:26, top:50 }, { posCode:"DC",  left:26, top:72 },
      { posCode:"LD",  left:32, top:92 },
      { posCode:"MC",  left:52, top:28 }, { posCode:"MC",  left:50, top:50 },
      { posCode:"MC",  left:52, top:72 },
      { posCode:"DEL", left:83, top:35 }, { posCode:"DEL", left:83, top:65 },
    ],
  },
};

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
const POSITION_GROUPS = {
  GK:  ["PO"],
  DEF: ["DC","LI","LD"],
  MID: ["MC","VOL","ENG","MI","MD"],
  FWD: ["DEL","EI","ED"],
};
const getGroup = (pc) => { for (const [g,c] of Object.entries(POSITION_GROUPS)) if (c.includes(pc)) return g; return "MID"; };
const ROLE_OPTIONS = {
  GK:  ["Portero","Barredora"],
  DEF: ["Defensor","Stopper","Lateral ofensivo","Marcador"],
  MID: ["Playmaker","Box to box","Pivote","Mediapunta","Interior"],
  FWD: ["Goleador","Falso 9","Extremo","Segundo delantero"],
};

/* ── Wellness + ACWR combined risk ──────────────────────────────────────────── */
const STATUS_PRIORITY = { "red": 3, "yellow": 2, "green": 1, "unknown": 0 };
function worstStatus(a, b) {
  return STATUS_PRIORITY[a] >= STATUS_PRIORITY[b] ? a : b;
}

/* ── Mini cancha SVG para selector de formaciones ────────────────────────────── */
const MiniPitch = memo(function MiniPitch({ positions, isActive, onClick }) {
  return (
    <div onClick={onClick} style={{
      width:76, height:50,
      background: isActive ? "rgba(139,92,246,0.10)" : "rgba(255,255,255,0.03)",
      border:`1px solid ${isActive ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)"}`,
      cursor:"pointer", position:"relative", overflow:"hidden", borderRadius:4,
      transition:"all 0.15s",
    }}>
      <svg viewBox="0 0 100 66" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }}>
        <rect x="1" y="1" width="98" height="64" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
        <line x1="50" y1="1" x2="50" y2="65" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"/>
        <circle cx="50" cy="33" r="9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
        {positions.map((p, i) => (
          <circle key={i}
            cx={p.left}
            cy={p.top * 0.64 + 1}
            r="3.2"
            fill={isActive ? C.purple : "rgba(255,255,255,0.45)"}
          />
        ))}
      </svg>
    </div>
  );
});

/* ── HexRadar ────────────────────────────────────────────────────────────────── */
const HexRadar = memo(function HexRadar({ attrs, size=110 }) {
  const cx=size/2, cy=size/2, r=size*0.36;
  const keys=Object.keys(attrs);
  const hex=keys.map((_,i)=>{const a=(Math.PI/3)*i-Math.PI/2;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};});
  const data=keys.map((k,i)=>{const s=Math.min((attrs[k]||50)/99,1);const a=(Math.PI/3)*i-Math.PI/2;return{x:cx+r*s*Math.cos(a),y:cy+r*s*Math.sin(a)};});
  const toP=pts=>pts.map((p,i)=>`${i===0?"M":"L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")+" Z";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.33,0.66,1].map((s,si)=>(<polygon key={si} points={hex.map(p=>`${(cx+(p.x-cx)*s).toFixed(1)},${(cy+(p.y-cy)*s).toFixed(1)}`).join(" ")} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>))}
      {hex.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>)}
      <path d={toP(data)} fill="rgba(139,92,246,0.12)" stroke={C.purple} strokeWidth="1.5"/>
      {data.map((p,i)=><circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.2" fill={C.purple}/>)}
      {hex.map((p,i)=>{const lx=cx+(p.x-cx)*1.3,ly=cy+(p.y-cy)*1.3;return(<text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill="rgba(255,255,255,0.45)" fontWeight="700">{keys[i]?.slice(0,3).toUpperCase()}</text>);})}
    </svg>
  );
});

/* ── Barra de salud ─────────────────────────────────────────────────────────── */
function HealthBar({ salud, width = 48 }) {
  return (
    <div style={{ width, height:2, background:"rgba(0,0,0,0.5)", borderRadius:1, overflow:"hidden" }}>
      <motion.div initial={{width:0}} animate={{width:`${salud}%`}} transition={{duration:0.5}}
        style={{ height:"100%", background: saludColor(salud), borderRadius:1 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PLAYER TOKEN — Circular photo token (Champions League broadcast style)
   44px circle with athlete photo, health-color border, dorsal badge, name below.
   No neon glow — clean, professional, broadcast-quality.
═══════════════════════════════════════════════════════════════════════════════ */
const PlayerToken = memo(function PlayerToken({
  starter, salud, riskStatus = "unknown", viewLayer = "normal",
  isSelected, isDragged, isTarget, isActivating, onSelect, onPointerDown
}) {
  const [hovered, setHovered] = useState(false);
  const athlete = starter.athlete;

  /* ── Slot vacío ── */
  if (!athlete) {
    return (
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border:`1.5px dashed ${isTarget ? "rgba(0,229,255,0.55)" : "rgba(255,255,255,0.15)"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        background: isTarget ? "rgba(0,229,255,0.06)" : "rgba(255,255,255,0.02)",
        transition:"all 0.12s",
      }}>
        <div style={{ fontSize:16, color:"rgba(255,255,255,0.18)", lineHeight:1 }}>+</div>
      </div>
    );
  }

  const saludVal = salud?.salud ?? 100;
  const dorsal = athlete.dorsal ?? athlete.number ?? null;
  const apellido = athlete.name?.split(" ").pop() || "";
  const isActive = isSelected || isActivating;
  const isHover = hovered && !isDragged;

  /* Border color: salud-based, no neon explosion. Selected = white ring. */
  const borderColor = isActivating
    ? "rgba(255,255,255,0.9)"
    : isTarget ? "rgba(0,229,255,0.7)"
    : isSelected ? "rgba(255,255,255,0.85)"
    : saludColor(saludVal);

  /* Neon glow color driven by riskStatus */
  const riskGlowColor = riskStatus === "red" ? "226,75,74" : riskStatus === "yellow" ? "239,159,39" : riskStatus === "green" ? "57,255,20" : null;

  const discShadow = isActivating
    ? `0 0 0 3px rgba(255,255,255,0.25), 0 6px 20px rgba(0,0,0,0.8)`
    : isTarget ? `0 0 0 2px rgba(0,229,255,0.4), 0 4px 16px rgba(0,0,0,0.7)`
    : isSelected ? `0 0 0 3px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.75)`
    : riskGlowColor ? `0 0 12px rgba(${riskGlowColor},0.45), 0 0 24px rgba(${riskGlowColor},0.2), 0 2px 8px rgba(0,0,0,0.7)`
    : isHover ? `0 4px 14px rgba(0,0,0,0.8)`
    : `0 2px 8px rgba(0,0,0,0.7)`;

  const scale = isActivating ? 1.12 : isTarget ? 1.08 : isActive && !isDragged ? 1.05 : isHover ? 1.03 : 1;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, userSelect:"none" }}>

      {/* Circular photo disc */}
      <div style={{ position:"relative", width:44, height:44 }}>
        <motion.div
          onClick={onSelect}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onPointerDown={onPointerDown}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: `2px solid ${borderColor}`,
            background: "rgba(10,15,10,0.9)",
            cursor: isDragged ? "grabbing" : "grab",
            touchAction: "none",
            opacity: isDragged ? 0.15 : 1,
            transform: `scale(${scale})`,
            boxShadow: discShadow,
            transition: isActivating
              ? "transform 120ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 120ms ease, border-color 120ms ease"
              : "transform 180ms ease, box-shadow 180ms ease, opacity 120ms, border-color 180ms",
            position: "relative",
            overflow: "hidden",
            /* 44px is already the touch target */
          }}
        >
          {/* Athlete photo — fills the circle */}
          <img
            src={avatar(athlete.photo)}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              display: "block",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          {/* Status overlay (injury/absence) */}
          {athlete.status !== "P" && (
            <div style={{
              position:"absolute", inset:0, borderRadius:"50%",
              background:"rgba(0,0,0,0.62)",
              display:"flex", alignItems:"center", justifyContent:"center",
              zIndex:2,
            }}>
              <div style={{ fontSize:7, fontWeight:900, color:getStatusStyle(athlete.status).color, letterSpacing:"0.5px" }}>
                {athlete.status==="L"?"LES":"AUS"}
              </div>
            </div>
          )}

          {/* Layer Mode Overlay */}
          {viewLayer !== "normal" && athlete.status === "P" && (
            <div style={{
              position:"absolute", inset:0, borderRadius:"50%",
              background: viewLayer === "heatmap"
                // Heatmap: overlay según riskStatus (carga ACWR)
                ? riskStatus === "red"    ? "rgba(226,75,74,0.5)"
                : riskStatus === "yellow" ? "rgba(239,159,39,0.35)"
                : riskStatus === "green"  ? "rgba(29,158,117,0.2)"
                : "rgba(255,255,255,0.05)"
                // Recovery: overlay según salud (wellnessMap ya mezclado en riskStatus)
                : riskStatus === "red"    ? "rgba(226,75,74,0.45)"
                : riskStatus === "yellow" ? "rgba(239,159,39,0.3)"
                : riskStatus === "green"  ? "rgba(57,255,20,0.2)"
                : "rgba(255,255,255,0.05)",
              zIndex:1,
              pointerEvents:"none",
              transition:"background 300ms ease",
            }}/>
          )}
        </motion.div>

        {/* Dorsal badge — bottom-right corner of the circle */}
        <div style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          minWidth: 14,
          height: 14,
          borderRadius: 7,
          background: "rgba(10,10,16,0.92)",
          border: `1px solid rgba(255,255,255,0.25)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 3px",
          zIndex: 3,
        }}>
          <div style={{
            fontSize: 8,
            fontWeight: 800,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}>
            {dorsal !== null ? (typeof dorsal === "number" ? dorsal : dorsal) : starter.posCode?.slice(0,2)}
          </div>
        </div>

        {/* ── Neon Vitality Ring ── */}
        {athlete && riskStatus !== "unknown" && riskStatus !== "green" && (
          <div style={{
            position:"absolute", inset:-5, borderRadius:"50%",
            border:`1.5px solid ${riskStatus==="red" ? "rgba(226,75,74,0.7)" : "rgba(239,159,39,0.6)"}`,
            boxShadow: riskStatus==="red"
              ? `0 0 8px rgba(226,75,74,0.5), inset 0 0 6px rgba(226,75,74,0.1)`
              : `0 0 6px rgba(239,159,39,0.4)`,
            pointerEvents:"none", zIndex:0,
          }}/>
        )}

        {/* ── Pulse animation: solo rojo (Engine Alert) ── */}
        {athlete && riskStatus === "red" && (
          <motion.div
            style={{
              position:"absolute", inset:-8, borderRadius:"50%",
              border:"1.5px solid rgba(226,75,74,0.4)",
              boxShadow:"0 0 16px rgba(226,75,74,0.3)",
              pointerEvents:"none", zIndex:0,
            }}
            animate={{
              opacity: [0.8, 0, 0.8],
              scale:   [1,   1.2, 1],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* Apellido debajo del círculo */}
      <div style={{
        fontSize: 8,
        fontWeight: 600,
        color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
        textShadow: "0 1px 4px rgba(0,0,0,0.95)",
        whiteSpace: "nowrap",
        maxWidth: 52,
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center",
        transition: "color 0.15s",
      }}>
        {apellido.length > 7 ? apellido.slice(0, 7) : apellido}
      </div>

      {viewLayer === "heatmap" && riskStatus !== "unknown" && (
        <div style={{ fontSize:7, color:
          riskStatus==="red" ? "#E24B4A" : riskStatus==="yellow" ? "#EF9F27" : "#1D9E75",
          letterSpacing:"0.5px", lineHeight:1, marginTop:1,
          fontFamily:"'JetBrains Mono',monospace",
        }}>
          {riskStatus.toUpperCase()}
        </div>
      )}

      {/* Barra de salud compacta — neon green ONLY here, by design */}
      <HealthBar salud={saludVal} width={36} />
    </div>
  );
}, (prev, next) =>
  prev.starter?.athlete?.id === next.starter?.athlete?.id &&
  prev.starter?.posCode === next.starter?.posCode &&
  prev.salud?.salud === next.salud?.salud &&
  prev.riskStatus === next.riskStatus &&
  prev.viewLayer === next.viewLayer &&
  prev.isSelected === next.isSelected &&
  prev.isDragged === next.isDragged &&
  prev.isTarget === next.isTarget &&
  prev.isActivating === next.isActivating
);

/* ═══════════════════════════════════════════════════════════════════════════════
   PLAYER DETAIL OVERLAY — Panel flotante en la esquina inferior derecha
   No comprime el campo — se superpone sobre él.
═══════════════════════════════════════════════════════════════════════════════ */
function PlayerDetailOverlay({ starter, allAthletes, historial, onClose, onSwapSimilar }) {
  const athlete = starter?.athlete;
  if (!athlete) return null;
  const { salud, rpeAvg7d } = calcSaludActual(athlete.rpe, historial, athlete.id);
  const attrs = {
    Ritmo:athlete.speed||78, Tiro:athlete.shooting||72, Pases:athlete.passing||80,
    Regate:athlete.dribble||75, Defensa:athlete.defense||65, Fisico:athlete.physical||77
  };
  const ovr = athlete.rating || Math.round(Object.values(attrs).reduce((a,b)=>a+b,0)/6);
  const group = getGroup(starter.posCode);
  const similar = allAthletes.filter(a => getGroup(a.posCode)===group && a.id!==athlete.id).slice(0,3);
  const statusStyle = getStatusStyle(athlete.status);

  return (
    <motion.div
      className="tbv9-detail-overlay"
      initial={{ opacity:0, scale:0.92, y:10 }}
      animate={{ opacity:1, scale:1, y:0 }}
      exit={{ opacity:0, scale:0.92, y:10 }}
      transition={{ type:"spring", stiffness:340, damping:26 }}
      style={{
        position: "absolute",
        bottom: 90,
        right: 14,
        width: 240,
        background: "rgba(6,10,18,0.97)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        zIndex: 50,
        overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)",
        maxHeight: "calc(100% - 120px)",
        overflowY: "auto",
      }}
    >
      {/* Header con foto */}
      <div style={{ position:"relative", height:130, overflow:"hidden", flexShrink:0 }}>
        <img src={avatar(athlete.photo)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", filter:"brightness(0.65)" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(6,10,18,1) 0%, rgba(6,10,18,0.2) 55%, transparent 100%)" }} />
        <div style={{ position:"absolute", bottom:10, left:12, right:12 }}>
          <div style={{ fontSize:8, color:C.purple, fontWeight:700, textTransform:"uppercase", letterSpacing:"2px" }}>{starter.posCode}</div>
          <div style={{ fontSize:16, fontWeight:900, color:"white", textTransform:"uppercase", letterSpacing:"-0.5px", lineHeight:1.1 }}>{athlete.name}</div>
          <div style={{ fontSize:9, color:statusStyle.color, marginTop:2 }}>{athlete.status==="P"?"Disponible":"No disponible"}</div>
        </div>
        <div style={{ position:"absolute", top:10, right:10, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ fontSize:26, fontWeight:900, color:"rgba(255,255,255,0.95)", lineHeight:1 }}>{ovr}</div>
          <motion.div onClick={onClose}
            whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }}
            style={{ width:24, height:24, borderRadius:"50%", background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(255,255,255,0.6)", fontSize:12 }}>
            ✕
          </motion.div>
        </div>
      </div>

      {/* Salud */}
      <div style={{ padding:"8px 12px", borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <div style={{ fontSize:8, color:C.textMuted, textTransform:"uppercase", letterSpacing:"1px" }}>Salud</div>
          <div style={{ fontSize:11, fontWeight:700, color:saludColor(salud) }}>{salud}%</div>
        </div>
        <HealthBar salud={salud} width="100%" />
        {rpeAvg7d > 0 && (
          <div style={{ marginTop:5, fontSize:8, color:C.textHint }}>RPE 7d avg: <span style={{ color:C.amber }}>{rpeAvg7d.toFixed(1)}</span></div>
        )}
      </div>

      {/* Radar */}
      <div style={{ padding:"8px 12px", display:"flex", justifyContent:"center" }}>
        <HexRadar attrs={attrs} size={110} />
      </div>

      {/* Similares */}
      {similar.length > 0 && (
        <div style={{ padding:"0 12px 12px" }}>
          <div style={{ fontSize:8, color:C.textHint, textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Alternativas</div>
          {similar.map(a => (
            <div key={a.id} onClick={()=>onSwapSimilar(a)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", cursor:"pointer", background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.06)`, borderRadius:6, marginBottom:3, transition:"all 0.12s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
              <div style={{ width:22, height:22, borderRadius:"50%", overflow:"hidden", border:`1px solid rgba(255,255,255,0.1)` }}>
                <img src={avatar(a.photo)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <div style={{ fontSize:10, color:"white", fontWeight:600 }}>{a.name.split(" ").pop()}</div>
              <div style={{ marginLeft:"auto", fontSize:8, color:C.purple }}>{a.posCode}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FORMATIONS OVERLAY — Panel flotante en la esquina superior izquierda
═══════════════════════════════════════════════════════════════════════════════ */
function FormationsOverlay({ formationKey, onSelect, onClose }) {
  return (
    <motion.div
      className="tbv9-formation-overlay"
      initial={{ opacity:0, scale:0.92, y:-8 }}
      animate={{ opacity:1, scale:1, y:0 }}
      exit={{ opacity:0, scale:0.92, y:-8 }}
      transition={{ type:"spring", stiffness:340, damping:26 }}
      style={{
        position: "absolute",
        top: 50,
        left: 14,
        width: 220,
        background: "rgba(6,10,18,0.97)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        zIndex: 50,
        boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding:"12px 14px 6px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:C.textHint, borderLeft:`2px solid ${C.purple}`, paddingLeft:8 }}>Formacion</div>
        <motion.div onClick={onClose} whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
          style={{ cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:12, padding:"2px 6px" }}>✕</motion.div>
      </div>
      <div style={{ padding:"6px 12px 12px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {Object.entries(HORIZ_FORMATIONS).map(([key, f]) => (
          <div key={key} style={{ textAlign:"center", cursor:"pointer" }} onClick={()=>{ onSelect(key); onClose(); }}>
            <MiniPitch positions={f.positions} isActive={formationKey===key} onClick={()=>{ onSelect(key); onClose(); }} />
            <div style={{
              fontSize:11, fontWeight:700, marginTop:4,
              color: formationKey===key ? "rgba(255,255,255,0.95)" : C.textMuted,
              padding:"2px 6px",
              background: formationKey===key ? "rgba(139,92,246,0.14)" : "transparent",
              border: formationKey===key ? `1px solid rgba(139,92,246,0.35)` : "1px solid transparent",
              borderRadius:16, display:"inline-block",
              transition:"all 0.15s",
            }}>{key}</div>
            <div style={{ fontSize:8, color:C.textHint, marginTop:2 }}>{f.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════════════════ */
export default function TacticalBoardV9({ athletes = [], historial = [], clubId = "" }) {
  const ns = clubId ? `_${clubId}` : "";

  const [formationKey, setFormationKey] = useState("4-3-3");
  const [viewMode, setViewMode] = useState("full");          // "full" | "half"
  const [viewLayer, setViewLayer] = useState("normal");      // "normal" | "heatmap" | "recovery"
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showFormations, setShowFormations] = useState(false);
  const [activeTab, setActiveTab] = useState("plantilla");
  const [rolesData, setRolesData] = useLocalStorage(`alttez_roles_v2${ns}`, {});
  const [instructionsText, setInstructionsText] = useLocalStorage(`alttez_instructions${ns}`, "");
  const [tacticasText, setTacticasText] = useLocalStorage(`alttez_tacticas${ns}`, "");
  const [confirmAction, setConfirmAction] = useState(null);

  // Usa HORIZ_FORMATIONS como base — landscape correcto

  const [starters, setStarters] = useState(() =>
    HORIZ_FORMATIONS["4-3-3"].positions.map((pos, i) => ({
      ...pos, currentLeft:pos.left, currentTop:pos.top,
      athlete: athletes[i] || null, id:`s${i}`,
    }))
  );
  const [bench, setBench] = useState(() =>
    athletes.slice(11).map((a, i) => ({ athlete:a, id:`b${i}` }))
  );

  const fieldRef = useRef(null);
  const benchAreaRef = useRef(null);
  const startersRef = useRef(starters);
  const benchRef = useRef(bench);
  useEffect(() => { startersRef.current = starters; }, [starters]);
  useEffect(() => { benchRef.current = bench; }, [bench]);

  // ── Callbacks del drag engine ─────────────────────────────────────────────
  const handleSwapStarters = useCallback((idxA, idxB) => {
    setStarters(p => {
      const n = [...p];
      const t = n[idxA].athlete;
      n[idxA] = { ...n[idxA], athlete: n[idxB].athlete };
      n[idxB] = { ...n[idxB], athlete: t };
      return n;
    });
  }, []);

  const handleBenchToField = useCallback((benchIdx, fieldIdx) => {
    const entering = benchRef.current[benchIdx];
    const leaving = startersRef.current[fieldIdx]?.athlete;
    setStarters(p => p.map((s, i) => i === fieldIdx ? { ...s, athlete: entering?.athlete } : s));
    setBench(p => {
      const next = p.filter((_, i) => i !== benchIdx);
      if (leaving) return [...next, { athlete: leaving, id:`b${Date.now()}` }];
      return next;
    });
  }, []);

  const handleFieldFreePos = useCallback((fieldIdx, pctX, pctY) => {
    const left = Math.min(Math.max(pctX, 3), 97);
    const top = Math.min(Math.max(pctY, 3), 97);
    setStarters(p => p.map((s, i) => i === fieldIdx ? { ...s, currentLeft: left, currentTop: top } : s));
  }, []);

  const { dragInfo, dragActivating, nearTarget, ghostRef, handlePointerDown, isDrag } = useDragEngine({
    fieldRef, startersRef, benchRef,
    onSwapStarters: handleSwapStarters,
    onBenchToField: handleBenchToField,
    onFieldFreePos: handleFieldFreePos,
  });

  const drawingEngine = useDrawingEngine(clubId);
  const isDrawingActive = drawingEngine.activeTool !== null;

  // ── Cambio de formación ───────────────────────────────────────────────────
  const changeFormation = useCallback((key) => {
    setFormationKey(key);
    setSelectedIdx(null);
    const src = viewMode === "half" ? HALF_FORMATIONS : HORIZ_FORMATIONS;
    const np = src[key]?.positions ?? HORIZ_FORMATIONS[key].positions;
    setStarters(prev => np.map((pos, i) => {
      const g = getGroup(pos.posCode);
      const stagger = g==="GK"?0 : g==="DEF"?0.04 : g==="MID"?0.09 : 0.14;
      return { ...pos, currentLeft:pos.left, currentTop:pos.top, athlete:prev[i]?.athlete??null, id:prev[i]?.id??`s${i}`, stagger };
    }));
  }, [viewMode]);

  // ── Toggle viewMode ───────────────────────────────────────────────────────
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const next = prev === "full" ? "half" : "full";
      const src = next === "half" ? HALF_FORMATIONS : HORIZ_FORMATIONS;
      const np = src[formationKey]?.positions ?? HORIZ_FORMATIONS[formationKey].positions;
      setStarters(prev2 => np.map((pos, i) => ({
        ...pos, currentLeft:pos.left, currentTop:pos.top,
        athlete:prev2[i]?.athlete??null, id:prev2[i]?.id??`s${i}`, stagger: 0,
      })));
      return next;
    });
    setSelectedIdx(null);
  }, [formationKey]);

  // ── Salud map ─────────────────────────────────────────────────────────────
  const saludMap = useMemo(() => {
    const m = new Map();
    athletes.forEach(a => m.set(a.id, calcSaludActual(a.rpe, historial, a.id)));
    return m;
  }, [athletes, historial]);

  // ── Risk map (ACWR) ───────────────────────────────────────────────────────
  const riskMap = useMemo(() => {
    const m = new Map();
    athletes.forEach(a => m.set(a.id, calcAthleteRisk(a.id, historial, a.rpe)));
    return m;
  }, [athletes, historial]);

  // ── Wellness map (daily check-in) ─────────────────────────────────────────
  const wellnessLogs = useStore(state => state.wellnessLogs);
  const wellnessMap = useMemo(() => {
    const m = new Map();
    const today = new Date().toDateString();
    athletes.forEach(a => {
      const athleteLogs = wellnessLogs.filter(
        l => String(l.athlete_id) === String(a.id) &&
             new Date(l.logged_at).toDateString() === today
      );
      if (athleteLogs.length === 0) {
        m.set(a.id, "unknown");
        return;
      }
      // Tomar el log más reciente de hoy
      const latest = athleteLogs.sort((x, y) => new Date(y.logged_at) - new Date(x.logged_at))[0];
      try {
        const score = calcWellnessScore(latest);
        m.set(a.id, getWellnessStatus(score).status);
      } catch {
        m.set(a.id, "unknown");
      }
    });
    return m;
  }, [athletes, wellnessLogs]);

  // ── Swap similar ──────────────────────────────────────────────────────────
  const doSwap = useCallback((na) => {
    if (selectedIdx === null) return;
    const lv = starters[selectedIdx].athlete;
    setStarters(p => p.map((s, i) => i === selectedIdx ? { ...s, athlete: na } : s));
    if (lv) setBench(p => [...p, { athlete:lv, id:`b${Date.now()}` }]);
    setBench(p => p.filter(b => b.athlete?.id !== na.id));
    setSelectedIdx(null);
  }, [selectedIdx, starters]);

  const swapSimilar = useCallback((na) => {
    const current = selectedIdx !== null ? starters[selectedIdx]?.athlete : null;
    setConfirmAction({
      title: "Cambiar jugador",
      message: `Reemplazar a ${current?.name?.split(" ").pop()||"titular"} por ${na.name.split(" ").pop()}?`,
      onConfirm: () => { doSwap(na); setConfirmAction(null); },
    });
  }, [selectedIdx, starters, doSwap]);

  const ghostAthlete = dragInfo
    ? (dragInfo.type === "starter" ? starters[dragInfo.index]?.athlete : bench[dragInfo.index]?.athlete)
    : null;
  const ghostOvr = ghostAthlete
    ? (ghostAthlete.rating || Math.round(((ghostAthlete.speed||78)+(ghostAthlete.shooting||72)+(ghostAthlete.passing||80)+(ghostAthlete.dribble||75)+(ghostAthlete.defense||65)+(ghostAthlete.physical||77))/6))
    : 0;

  const selStarter = selectedIdx !== null ? starters[selectedIdx] : null;

  const TABS = [
    { key:"plantilla",     label:"Plantilla" },
    { key:"roles",         label:"Roles" },
    { key:"instrucciones", label:"Instruc." },
    { key:"tacticas",      label:"Tacticas" },
  ];

  const ta = {
    width:"100%", minHeight:200,
    background:"linear-gradient(135deg,rgba(16,16,26,0.95),rgba(10,10,18,0.98))",
    border:`1px solid rgba(255,255,255,0.08)`, color:"white", fontSize:12,
    fontFamily:"inherit", padding:14, outline:"none", resize:"vertical",
    lineHeight:1.7, borderRadius:8,
    boxShadow:"0 4px 20px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)",
  };

  return (
    <div style={{
      display:"flex", flexDirection:"column", height:"100%",
      background:"linear-gradient(180deg,#0a0f1a,#060a12)",
      overflow:"hidden",
    }}>

      {/* ── TOPBAR: tabs + controles de campo ── */}
      <div style={{
        display:"flex", alignItems:"stretch", height:40,
        background:"rgba(5,6,12,0.98)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        borderBottom:`1px solid rgba(255,255,255,0.06)`,
        flexShrink:0,
        boxShadow:"0 2px 12px rgba(0,0,0,0.5)",
      }}>
        {/* Tabs */}
        <div className="tbv9-tabs" style={{ display:"flex", alignItems:"stretch", overflowX:"auto" }}>
          {TABS.map(t => (
            <div key={t.key} onClick={()=>setActiveTab(t.key)}
              style={{
                padding:"0 16px", fontSize:10, fontWeight:700,
                textTransform:"uppercase", letterSpacing:"2px",
                color:activeTab===t.key?"rgba(255,255,255,0.92)":C.textMuted,
                display:"flex", alignItems:"center", cursor:"pointer",
                borderBottom:activeTab===t.key?`2px solid rgba(255,255,255,0.7)`:"2px solid transparent",
                background:activeTab===t.key?"rgba(255,255,255,0.04)":"transparent",
                whiteSpace:"nowrap",
                transition:"color 0.14s,background 0.14s",
              }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* Separador */}
        <div style={{ width:1, background:"rgba(255,255,255,0.06)", margin:"8px 0", flexShrink:0 }} />

        {/* Controles de campo — formación + view toggle */}
        <div style={{ display:"flex", alignItems:"center", padding:"0 12px", gap:8, marginLeft:"auto" }}>
          {/* Indicador de formación — click abre overlay */}
          <motion.div
            onClick={() => setShowFormations(v => !v)}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"4px 10px", borderRadius:6, cursor:"pointer",
              background: showFormations ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)",
              border: showFormations ? `1px solid ${C.purple}55` : "1px solid rgba(255,255,255,0.1)",
              transition:"all 0.14s",
            }}
          >
            <div style={{ fontSize:7, fontWeight:700, color:C.purple, textTransform:"uppercase", letterSpacing:"1px", padding:"1px 5px", border:`1px solid ${C.purple}55`, borderRadius:3 }}>V9</div>
            <div style={{ fontSize:10, fontWeight:700, color: showFormations ? C.purple : "white", letterSpacing:"1px" }}>{formationKey}</div>
            <div style={{ fontSize:8, color: showFormations ? C.purple : C.textMuted }}>▾</div>
          </motion.div>

          {/* Toggle Full / Half */}
          <motion.div
            onClick={toggleViewMode}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"4px 10px", borderRadius:6, cursor:"pointer",
              background: viewMode==="half" ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.05)",
              border: viewMode==="half" ? `1px solid rgba(139,92,246,0.4)` : "1px solid rgba(255,255,255,0.1)",
              transition:"all 0.14s",
            }}
          >
            {/* Mini campo icon */}
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
              <rect x="0.5" y="0.5" width="15" height="10" rx="0.5" stroke={viewMode==="half"?C.purple:"rgba(255,255,255,0.3)"} strokeWidth="0.8"/>
              <line x1="8" y1="0.5" x2="8" y2="10.5" stroke={viewMode==="half"?C.purple:"rgba(255,255,255,0.25)"} strokeWidth="0.6"/>
              {viewMode==="half" && <rect x="8" y="0.5" width="7.5" height="10" fill="rgba(139,92,246,0.1)"/>}
            </svg>
            <div style={{ fontSize:9, fontWeight:700, color: viewMode==="half" ? C.purple : C.textMuted, textTransform:"uppercase", letterSpacing:"0.5px" }}>
              {viewMode==="half" ? "1/2" : "Full"}
            </div>
          </motion.div>

          {/* Layer Mode Selector */}
          <div style={{
            display:"flex", gap:1,
            background:"rgba(0,0,0,0.5)",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:6, padding:2, flexShrink:0,
          }}>
            {[
              { key:"normal",   label:"Normal",  icon:"⬤" },
              { key:"heatmap",  label:"Carga",   icon:"🔥" },
              { key:"recovery", label:"Recup.",  icon:"💧" },
            ].map(({ key, label, icon }) => (
              <div
                key={key}
                onClick={() => setViewLayer(key)}
                style={{
                  padding:"3px 8px",
                  fontSize:8,
                  fontWeight: viewLayer===key ? 700 : 400,
                  textTransform:"uppercase",
                  letterSpacing:"0.5px",
                  cursor:"pointer",
                  borderRadius:4,
                  background: viewLayer===key ? "rgba(124,58,237,0.3)" : "transparent",
                  color: viewLayer===key ? "#7C3AED" : "rgba(255,255,255,0.35)",
                  border: viewLayer===key ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
                  transition:"all 150ms ease",
                  whiteSpace:"nowrap",
                }}
              >
                {icon} {label}
              </div>
            ))}
          </div>

          <motion.div
            onClick={() => showToast("Guarda la formación y accede desde Match Center", "info")}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
            style={{ padding:"4px 12px", fontSize:9, textTransform:"uppercase", letterSpacing:"1px", background:C.amber, color:"#1a0f00", cursor:"pointer", fontWeight:700, borderRadius:4 }}
          >
            Partido
          </motion.div>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL ── */}
      {(activeTab === "plantilla") && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflow:"hidden", position:"relative" }}>

          {/* Campo + overlays */}
          <div style={{ flex:1, position:"relative", minHeight:0, display:"flex", flexDirection:"column" }}>
            <FieldLayer ref={fieldRef} viewMode={viewMode}>

              {/* DrawingLayer: Capa 3 — vectores SVG */}
              <DrawingLayer drawingEngine={drawingEngine} isActive={isDrawingActive} />

              {/* PlayersLayer: Capa 2 — discos magnéticos */}
              {starters.map((st, i) => (
                <motion.div key={st.id}
                  animate={{ left:`${st.currentLeft}%`, top:`${st.currentTop}%` }}
                  transition={{ type:"spring", stiffness:190, damping:16, mass:0.7, delay:st.stagger||0 }}
                  style={{
                    position:"absolute", transform:"translate(-50%,-50%)",
                    zIndex: isDrag("starter",i)?1 : selectedIdx===i?15 : 5,
                    pointerEvents: isDrawingActive ? "none" : "auto",
                  }}>
                  <PlayerToken
                    starter={st}
                    salud={st.athlete ? saludMap.get(st.athlete.id) : null}
                    riskStatus={st.athlete ? worstStatus(
                      riskMap.get(st.athlete.id)?.status ?? "unknown",
                      wellnessMap.get(st.athlete.id) ?? "unknown"
                    ) : "unknown"}
                    viewLayer={viewLayer}
                    isSelected={selectedIdx===i}
                    isDragged={isDrag("starter",i)}
                    isTarget={nearTarget===i}
                    isActivating={dragActivating?.type==="starter"&&dragActivating?.index===i}
                    onSelect={e=>{ e.stopPropagation(); setSelectedIdx(p=>p===i?null:i); }}
                    onPointerDown={e=>handlePointerDown(e,"starter",i)}
                  />
                </motion.div>
              ))}

            </FieldLayer>

            {/* DrawingToolbar como barra flotante en el borde inferior del campo */}
            <DrawingToolbar
              drawingEngine={drawingEngine}
              onClearAll={() => setConfirmAction({
                title: "Limpiar pizarra",
                message: "Se eliminarán todos los trazados. Esta acción no se puede deshacer.",
                onConfirm: () => { drawingEngine.clearAllDrawings(); setConfirmAction(null); },
              })}
            />

            {/* Player detail overlay */}
            <AnimatePresence>
              {selStarter?.athlete && (
                <PlayerDetailOverlay
                  key="player-detail"
                  starter={selStarter}
                  allAthletes={athletes}
                  historial={historial}
                  onClose={() => setSelectedIdx(null)}
                  onSwapSimilar={swapSimilar}
                />
              )}
            </AnimatePresence>

            {/* Formations overlay */}
            <AnimatePresence>
              {showFormations && (
                <FormationsOverlay
                  key="formations"
                  formationKey={formationKey}
                  onSelect={changeFormation}
                  onClose={() => setShowFormations(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Suplentes */}
          <div ref={benchAreaRef} style={{
            flexShrink:0,
            background:"linear-gradient(135deg,rgba(8,10,18,0.98),rgba(5,6,12,0.99))",
            backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
            borderTop:`1px solid rgba(255,255,255,0.06)`,
            padding:"8px 14px",
            boxShadow:"0 -4px 20px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.03)",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
              <div style={{ fontSize:10, fontWeight:900, textTransform:"uppercase", letterSpacing:"2px", color:"white" }}>Suplentes</div>
              <div style={{ fontSize:9, color:C.textMuted }}>({bench.length})</div>
            </div>
            <div className="tbv9-subs-bar" style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:3 }}>
              {bench.map((b, i) => {
                const bSalud = b.athlete ? saludMap.get(b.athlete.id) : null;
                const bSaludVal = bSalud?.salud ?? 100;
                const _bOvr = b.athlete?.rating || Math.floor(72+(b.athlete?.id%20||0));
                const isActivatingBench = dragActivating?.type==="bench"&&dragActivating?.index===i;
                return (
                  <div key={b.id}
                    onPointerDown={e=>handlePointerDown(e,"bench",i)}
                    style={{
                      display:"flex", alignItems:"center", gap:8,
                      padding:"6px 10px",
                      background:"linear-gradient(135deg,rgba(18,20,30,0.92),rgba(10,12,22,0.96))",
                      border:`1px solid ${isActivatingBench ? "rgba(255,255,255,0.45)" : saludColor(bSaludVal)+"38"}`,
                      cursor:isDrag("bench",i)?"grabbing":"grab",
                      opacity:isDrag("bench",i)?0.25:1,
                      touchAction:"none", flexShrink:0, borderRadius:8,
                      minWidth:130, userSelect:"none",
                      boxShadow:isActivatingBench
                        ?`0 0 0 2px rgba(255,255,255,0.5), 0 4px 16px rgba(0,0,0,0.6)`
                        :`0 3px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)`,
                      transform:isActivatingBench?"scale(1.05)":"scale(1)",
                      transition:"box-shadow 120ms ease, transform 120ms cubic-bezier(0.34,1.56,0.64,1), border-color 120ms ease",
                    }}>
                    {/* Photo */}
                    <div style={{ width:32, height:32, borderRadius:"50%", overflow:"hidden", border:`2px solid ${saludColor(bSaludVal)}`, flexShrink:0 }}>
                      <img src={avatar(b.athlete?.photo)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center" }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
                        <div style={{ fontSize:8, fontWeight:700, color:C.textMuted, textTransform:"uppercase" }}>{b.athlete?.posCode}</div>
                        <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.85)", textTransform:"uppercase", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {b.athlete?.name?.split(" ").pop() || "—"}
                        </div>
                      </div>
                      {bSalud && <HealthBar salud={bSalud.salud} width={44} />}
                    </div>
                  </div>
                );
              })}
              {bench.length === 0 && (
                <div style={{ fontSize:10, color:C.textHint, padding:"8px 0" }}>
                  Arrastra titulares aqui para suplirlos
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ROLES ── */}
      {activeTab === "roles" && (
        <div style={{ flex:1, padding:20, overflowY:"auto" }}>
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:C.textHint, marginBottom:16, borderLeft:`2px solid ${C.purple}`, paddingLeft:8 }}>Asignacion de roles por posicion</div>
          <div style={{ maxWidth:560 }}>
            {starters.filter(s=>s.athlete).map((s, i) => {
              const group = getGroup(s.posCode);
              const options = ROLE_OPTIONS[group] || ROLE_OPTIONS.MID;
              const currentRole = rolesData[s.athlete.id] || options[0];
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 12px", borderBottom:`1px solid rgba(255,255,255,0.05)`, background:i%2===0?"linear-gradient(135deg,rgba(18,18,28,0.7),rgba(12,12,20,0.8))":"transparent", transition:"background 150ms" }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", overflow:"hidden", border:`1px solid rgba(255,255,255,0.1)`, flexShrink:0 }}>
                    <img src={avatar(s.athlete.photo)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.55)", textTransform:"uppercase", width:34 }}>{s.posCode}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"white", textTransform:"uppercase", flex:1 }}>{s.athlete.name.split(" ").pop()}</div>
                  <div style={{ fontSize:12, color:C.textMuted, margin:"0 6px" }}>→</div>
                  <select value={currentRole} onChange={e=>setRolesData(prev=>({...prev,[s.athlete.id]:e.target.value}))}
                    style={{ fontSize:12, padding:"5px 8px", background:"linear-gradient(135deg,rgba(20,20,32,0.98),rgba(14,14,24,0.99))", border:`1px solid rgba(255,255,255,0.1)`, color:"white", fontFamily:"inherit", outline:"none", minWidth:140, cursor:"pointer", borderRadius:6 }}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: INSTRUCCIONES ── */}
      {activeTab === "instrucciones" && (
        <div style={{ flex:1, padding:20, overflowY:"auto" }}>
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:C.textHint, marginBottom:12, borderLeft:`2px solid ${C.purple}`, paddingLeft:8 }}>Instrucciones de equipo</div>
          <textarea value={instructionsText} onChange={e=>setInstructionsText(e.target.value)} placeholder="Presion alta. Salida corta desde el portero. Repliegue intensivo al perder el balon..." style={ta} />
        </div>
      )}

      {/* ── TAB: TACTICAS ── */}
      {activeTab === "tacticas" && (
        <div style={{ flex:1, padding:20, overflowY:"auto" }}>
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:C.textHint, marginBottom:12, borderLeft:`2px solid ${C.purple}`, paddingLeft:8 }}>Notas tacticas del partido</div>
          <textarea value={tacticasText} onChange={e=>setTacticasText(e.target.value)} placeholder="Aprovechar el carril derecho. Vigilar al #10 rival. Juego de segunda pelota en mediocentro..." style={ta} />
        </div>
      )}

      {/* Ghost token con trail */}
      <GhostToken ghostRef={ghostRef} athlete={ghostAthlete} ovr={ghostOvr} isDragging={!!dragInfo} />

      {/* Confirm modal */}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
