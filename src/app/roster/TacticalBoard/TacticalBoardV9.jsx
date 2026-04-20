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
import { PALETTE as C, ELEVATION, BROADCAST_GRADIENT } from "../../../shared/tokens/palette";
import { getAvatarUrl as avatar, getStatusStyle } from "../../../shared/utils/helpers";
import { calcSaludActual, saludColor, calcAthleteRisk } from "../../../shared/utils/rpeEngine";
import { useStore } from "../../../shared/store/useStore";
import { calcWellnessScore, getWellnessStatus } from "../../../shared/types/wellnessTypes";
import useLocalStorage from "../../../shared/hooks/useLocalStorage";
import useDragEngine from "../../../shared/hooks/useDragEngine";
import useDrawingEngine from "../../../shared/hooks/useDrawingEngine";
import ConfirmModal from "../../../shared/ui/ConfirmModal";
import PlayLibraryOverlay from "../../../shared/ui/PlayLibraryOverlay";
import TabBar from "../../../shared/ui/TabBar";
import { showToast } from "../../../shared/ui/Toast";

import FieldLayer from "./layers/FieldLayer";
import DrawingLayer from "./layers/DrawingLayer";
import PhaseTabs from "./layers/PhaseTabs";
import CommandRail from "./layers/CommandRail";
import IntelDock from "./layers/IntelDock";
import BenchRibbon from "./layers/BenchRibbon";
import GhostToken from "./tokens/GhostToken";
import HexToken from "./tokens/HexToken";
import DrawingToolbar from "./tools/DrawingToolbar";

const PHASE_LABELS = { ofensiva: "Ofensiva", defensiva: "Defensiva", balonParado: "Balón parado" };

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

/* PlayerToken removed — see ./tokens/HexToken.jsx (FUT-style hexagonal token). */

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
function FormationsOverlay({ formationKey, onSelect, onClose, onHover }) {
  return (
    <motion.div
      className="tbv9-formation-overlay"
      initial={{ opacity:0, scale:0.92, y:-8 }}
      animate={{ opacity:1, scale:1, y:0 }}
      exit={{ opacity:0, scale:0.92, y:-8 }}
      transition={{ type:"spring", stiffness:340, damping:26 }}
      style={{
        position: "absolute",
        top: 60,
        left: 14,
        width: 240,
        background: BROADCAST_GRADIENT.stat,
        border: `1px solid ${C.borderHi}`,
        borderRadius: 12,
        zIndex: 50,
        boxShadow: ELEVATION.panel,
        overflow: "hidden",
      }}
    >
      {/* Top sweep */}
      <span style={{
        position:"absolute", top:0, left:0, right:0, height:2,
        background:`linear-gradient(90deg, ${C.blue}00 0%, ${C.blue} 30%, ${C.blueHi} 50%, ${C.blue} 70%, ${C.blue}00 100%)`,
        boxShadow:`0 0 12px ${C.blueGlow}`,
      }} />
      <span style={{
        position:"absolute", top:6, left:6, width:6, height:6,
        borderTop:`1.5px solid ${C.blue}`, borderLeft:`1.5px solid ${C.blue}`, opacity:0.8,
      }} />

      <div style={{
        padding:"14px 14px 8px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        borderBottom:`1px solid ${C.border}`,
      }}>
        <div style={{
          fontSize:10, fontWeight:900,
          textTransform:"uppercase", letterSpacing:"2.5px",
          color:"white",
          fontFamily:'"Orbitron","Exo 2",Arial,sans-serif',
          paddingLeft:10,
          textShadow:`0 0 10px ${C.blueGlow}`,
        }}>
          Formación
        </div>
        <motion.div onClick={onClose} whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
          style={{ cursor:"pointer", color:"rgba(255,255,255,0.5)", fontSize:12, padding:"2px 6px" }}>✕</motion.div>
      </div>
      <div style={{ padding:"10px 12px 14px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {Object.entries(HORIZ_FORMATIONS).map(([key, f]) => {
          const active = formationKey === key;
          return (
            <div key={key}
              style={{ textAlign:"center", cursor:"pointer" }}
              onClick={()=>{ onSelect(key); onClose(); onHover?.(null); }}
              onMouseEnter={() => onHover?.(key)}
              onMouseLeave={() => onHover?.(null)}
            >
              <MiniPitch positions={f.positions} isActive={active} onClick={()=>{ onSelect(key); onClose(); }} />
              <div style={{
                fontSize:10.5, fontWeight:900, marginTop:6,
                color: active ? "white" : C.textMuted,
                padding:"3px 10px",
                background: active
                  ? `linear-gradient(180deg, ${C.blue} 0%, ${C.blueDeep} 100%)`
                  : "rgba(47,107,255,0.06)",
                border: `1px solid ${active ? C.blue : C.blueBorder}`,
                borderRadius:6, display:"inline-block",
                transition:"all 0.15s",
                fontFamily:'"Orbitron","Exo 2",Arial,sans-serif',
                letterSpacing:"1.2px",
                boxShadow: active
                  ? `inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 8px ${C.blueGlow}`
                  : "none",
                textShadow: active ? "0 1px 0 rgba(0,0,0,0.25)" : "none",
              }}>{key}</div>
              <div style={{
                fontSize:8, color:C.textHint, marginTop:4,
                letterSpacing:"1.5px", textTransform:"uppercase",
                fontFamily:'"Orbitron","Exo 2",Arial,sans-serif',
                fontWeight:700,
              }}>{f.label}</div>
            </div>
          );
        })}
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
  const [plays, setPlays] = useLocalStorage(`alttez_plays_v1${ns}`, []);
  const [showPlays, setShowPlays] = useState(false);
  const [phase, setPhase] = useLocalStorage(`alttez_phase${ns}`, "ofensiva");
  const [editMode, setEditMode] = useState(true);
  const [hoveredFormation, setHoveredFormation] = useState(null);

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

  const resetStarterPos = useCallback((idx) => {
    const src = viewMode === "half" ? HALF_FORMATIONS : HORIZ_FORMATIONS;
    const home = src[formationKey]?.positions?.[idx] ?? HORIZ_FORMATIONS[formationKey].positions[idx];
    if (!home) return;
    setStarters(prev => prev.map((s, i) => i === idx ? { ...s, currentLeft: home.left, currentTop: home.top } : s));
  }, [formationKey, viewMode]);

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

  // ── PlayLibrary: captura y restauración ───────────────────────────────────
  const capturePlay = useCallback((name) => {
    const snap = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      formationKey,
      viewMode,
      starters: starters.map(s => ({
        posCode: s.posCode,
        left: s.currentLeft,
        top: s.currentTop,
        athleteId: s.athlete?.id ?? null,
      })),
      drawings: drawingEngine?.drawings ?? [],
      createdAt: Date.now(),
    };
    setPlays(prev => [snap, ...prev].slice(0, 40));
    showToast(`Jugada "${name}" capturada`, "success");
  }, [formationKey, viewMode, starters, drawingEngine, setPlays]);

  const loadPlay = useCallback((play) => {
    if (!play?.starters) return;
    setFormationKey(play.formationKey || "4-3-3");
    setStarters(prev => {
      return play.starters.map((snap, i) => {
        const athlete = snap.athleteId
          ? athletes.find(a => a.id === snap.athleteId) || prev[i]?.athlete || null
          : prev[i]?.athlete || null;
        return {
          posCode: snap.posCode,
          left: snap.left, top: snap.top,
          currentLeft: snap.left, currentTop: snap.top,
          athlete,
          id: `s${i}`,
          stagger: i * 0.025,
        };
      });
    });
    if (drawingEngine?.replaceDrawings && Array.isArray(play.drawings)) {
      drawingEngine.replaceDrawings(play.drawings);
    }
    setShowPlays(false);
    showToast(`Jugada "${play.name}" cargada`, "success");
  }, [athletes, drawingEngine]);

  const deletePlay = useCallback((id) => {
    setPlays(prev => prev.filter(p => p.id !== id));
  }, [setPlays]);

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

  // ── Team stats (HUD chip) ─────────────────────────────────────────────────
  const teamStats = useMemo(() => {
    const active = starters.filter(s => s.athlete);
    if (!active.length) return null;
    const ovrSum = active.reduce((sum, s) => {
      const a = s.athlete;
      const ovr = a.rating || Math.round(((a.speed||78)+(a.shooting||72)+(a.passing||80)+(a.dribble||75)+(a.defense||65)+(a.physical||77))/6);
      return sum + ovr;
    }, 0);
    const saludSum = active.reduce((sum, s) => sum + (saludMap.get(s.athlete.id)?.salud ?? 100), 0);
    const redCount = active.filter(s => riskMap.get(s.athlete.id)?.status === "red").length;
    return {
      count: active.length,
      ovrAvg: Math.round(ovrSum / active.length),
      saludAvg: Math.round(saludSum / active.length),
      redCount,
    };
  }, [starters, saludMap, riskMap]);

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

      {/* ── TOPBAR BROADCAST — tabs + controles de campo ── */}
      <div style={{
        position: "relative",
        display:"flex", alignItems:"stretch", minHeight: 52,
        background: BROADCAST_GRADIENT.topbar,
        borderBottom:`1px solid ${C.borderHi}`,
        flexShrink:0,
        boxShadow: ELEVATION.flat,
        paddingLeft: 14,
      }}>
        {/* Top sweep */}
        <span style={{
          position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg, ${C.blue}00 0%, ${C.blue} 25%, ${C.blueHi} 50%, ${C.blue} 75%, ${C.blue}00 100%)`,
          boxShadow:`0 0 12px ${C.blueGlow}`,
        }} />

        {/* Brand chip ALTTEZ */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          paddingRight: 14, marginRight: 12, alignSelf:"center",
          borderRight:`1px solid ${C.border}`,
          paddingBlock: 8,
        }}>
          <img
            src="/branding/alttez-symbol-transparent.png"
            alt="ALTTEZ"
            style={{ height:20, width:"auto", filter:`drop-shadow(0 0 10px ${C.blueGlow})` }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
          <div style={{
            fontSize:9, fontWeight:900, color:"white",
            textTransform:"uppercase", letterSpacing:"2.5px",
            fontFamily:'"Orbitron","Exo 2",Arial,sans-serif',
          }}>
            Tactical
          </div>
        </div>

        {/* Tabs — TabBar broadcast */}
        <div className="tbv9-tabs" style={{ display:"flex", alignSelf:"stretch", flex:"0 1 auto" }}>
          <TabBar
            tabs={TABS.map(t => t.label)}
            active={TABS.find(t => t.key === activeTab)?.label}
            onChange={(label) => {
              const entry = TABS.find(t => t.label === label);
              if (entry) setActiveTab(entry.key);
            }}
            scrollable
            style={{ borderBottom:"none" }}
          />
        </div>

        {/* Controles — solo acceso a Partido. Resto vive en CommandRail. */}
        <div style={{
          display:"flex", alignItems:"center",
          padding:"0 14px 0 14px", gap:8,
          marginLeft:"auto", flexShrink:0,
        }}>
          <motion.button
            onClick={() => showToast("Guarda la formación y accede desde Match Center", "info")}
            whileHover={{ y:-1, boxShadow:`inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 28px ${C.blueGlow}` }}
            whileTap={{ scale:0.97 }}
            style={{
              padding:"8px 16px",
              fontSize:9.5,
              textTransform:"uppercase", letterSpacing:"1.8px",
              background:`linear-gradient(180deg, ${C.blue} 0%, ${C.blue} 60%, ${C.blueDeep} 100%)`,
              color:"white",
              cursor:"pointer", fontWeight:900,
              borderRadius:6,
              border:`1px solid ${C.blue}`,
              fontFamily:'"Orbitron","Exo 2",Arial,sans-serif',
              boxShadow:`inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 14px ${C.blueGlow}`,
              textShadow:"0 1px 0 rgba(0,0,0,0.25)",
              minHeight:"unset",
            }}
          >
            Partido →
          </motion.button>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL ── */}
      {(activeTab === "plantilla") && (
        <div style={{ flex:1, display:"flex", minHeight:0, overflow:"hidden", position:"relative" }}>

          {/* ── COMMAND RAIL (izq) ── */}
          <CommandRail
            formationKey={formationKey}
            onToggleFormations={() => setShowFormations(v => !v)}
            showFormations={showFormations}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
            viewLayer={viewLayer}
            onViewLayerChange={setViewLayer}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(v => !v)}
            playsCount={plays.length}
            onOpenPlays={() => setShowPlays(true)}
          />

          {/* ── PITCH STAGE (centro) ── */}
          <div style={{
            flex:1, display:"flex", flexDirection:"column", minWidth:0, minHeight:0,
            background:"radial-gradient(120% 80% at 50% 0%, rgba(47,107,255,0.05) 0%, transparent 70%), linear-gradient(180deg, rgba(6,10,18,1) 0%, rgba(2,4,10,1) 100%)",
          }}>

            {/* PhaseTabs */}
            <PhaseTabs phase={phase} onChange={setPhase} />

            {/* Pitch stage — FieldLayer ya trae su propio marco + corner brackets */}
            <div style={{
              flex:1, position:"relative", minHeight:0, minWidth:0,
              display:"flex", flexDirection:"column",
            }}>
                <FieldLayer ref={fieldRef} viewMode={viewMode} phase={phase}>

                  {/* DrawingLayer */}
                  <DrawingLayer drawingEngine={drawingEngine} isActive={isDrawingActive} />

                  {/* Layer overlay — heatmap (riesgo) / recovery (salud) */}
                  {viewLayer !== "normal" && (
                    <svg
                      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:1 }}
                      viewBox="0 0 100 100" preserveAspectRatio="none"
                    >
                      <defs>
                        <radialGradient id="blob-red" cx="50%" cy="50%" r="50%">
                          <stop offset="0%"  stopColor="rgba(226,75,74,0.55)"/>
                          <stop offset="60%" stopColor="rgba(226,75,74,0.18)"/>
                          <stop offset="100%" stopColor="rgba(226,75,74,0)"/>
                        </radialGradient>
                        <radialGradient id="blob-yellow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%"  stopColor="rgba(239,159,39,0.45)"/>
                          <stop offset="60%" stopColor="rgba(239,159,39,0.14)"/>
                          <stop offset="100%" stopColor="rgba(239,159,39,0)"/>
                        </radialGradient>
                        <radialGradient id="blob-green" cx="50%" cy="50%" r="50%">
                          <stop offset="0%"  stopColor="rgba(29,158,117,0.38)"/>
                          <stop offset="60%" stopColor="rgba(29,158,117,0.12)"/>
                          <stop offset="100%" stopColor="rgba(29,158,117,0)"/>
                        </radialGradient>
                      </defs>
                      {starters.map((st) => {
                        if (!st.athlete) return null;
                        const r = riskMap.get(st.athlete.id)?.status ?? "unknown";
                        const s = saludMap.get(st.athlete.id)?.salud ?? 100;
                        let fill = null;
                        if (viewLayer === "heatmap") {
                          if (r === "red") fill = "url(#blob-red)";
                          else if (r === "yellow") fill = "url(#blob-yellow)";
                        } else if (viewLayer === "recovery") {
                          if (s < 55) fill = "url(#blob-red)";
                          else if (s < 75) fill = "url(#blob-yellow)";
                          else fill = "url(#blob-green)";
                        }
                        if (!fill) return null;
                        return (
                          <ellipse key={st.id}
                            cx={st.currentLeft} cy={st.currentTop}
                            rx="14" ry="10" fill={fill}
                          />
                        );
                      })}
                    </svg>
                  )}

                  {/* Team shape guides — solo en "normal" sin selección */}
                  {viewLayer === "normal" && selectedIdx === null && (
                    <svg
                      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:1 }}
                      viewBox="0 0 100 100" preserveAspectRatio="none"
                    >
                      {["DEF","MID","FWD"].map(group => {
                        const members = starters.filter(s => s.athlete && getGroup(s.posCode) === group);
                        if (members.length < 2) return null;
                        const avgY = members.reduce((sum,m)=>sum+m.currentTop,0)/members.length;
                        const minX = Math.min(...members.map(m=>m.currentLeft));
                        const maxX = Math.max(...members.map(m=>m.currentLeft));
                        return (
                          <line key={group}
                            x1={minX} y1={avgY} x2={maxX} y2={avgY}
                            stroke="rgba(91,157,255,0.26)" strokeWidth="0.16"
                            strokeDasharray="0.9 1.1"
                            vectorEffect="non-scaling-stroke"
                          />
                        );
                      })}
                    </svg>
                  )}

                  {/* Team HUD chip — XI telemetry (top-left del pitch) */}
                  {teamStats && (
                    <div style={{
                      position:"absolute", top:16, left:32,
                      display:"flex", alignItems:"center", gap:10,
                      padding:"5px 11px",
                      background:"rgba(4,6,16,0.72)",
                      border:`1px solid ${C.blueBorder}`,
                      borderRadius:999,
                      pointerEvents:"none",
                      zIndex:3,
                      boxShadow:`inset 0 1px 0 rgba(255,255,255,0.05), 0 0 14px ${C.blueGlow}`,
                      fontFamily:'"Orbitron","Exo 2",Arial,sans-serif',
                    }}>
                      <span style={{ fontSize:8, fontWeight:900, color:C.blueHi, letterSpacing:"2px", textTransform:"uppercase" }}>
                        XI · {teamStats.count}
                      </span>
                      <span style={{ width:1, height:10, background:"rgba(255,255,255,0.14)" }} />
                      <span style={{ fontSize:9, fontWeight:900, color:"white", letterSpacing:"0.8px" }}>
                        OVR <span style={{ color:C.blueHi }}>{teamStats.ovrAvg}</span>
                      </span>
                      <span style={{ fontSize:9, fontWeight:900, color:"white", letterSpacing:"0.8px" }}>
                        SAL <span style={{ color: teamStats.saludAvg >= 75 ? "#1D9E75" : teamStats.saludAvg >= 55 ? "#EF9F27" : "#E24B4A" }}>{teamStats.saludAvg}</span>
                      </span>
                      {teamStats.redCount > 0 && (
                        <>
                          <span style={{ width:1, height:10, background:"rgba(255,255,255,0.14)" }} />
                          <span style={{ fontSize:9, fontWeight:900, color:"#E24B4A", letterSpacing:"0.8px" }}>
                            ⚠ {teamStats.redCount}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Line-mate connector SVG — solo cuando hay selección */}
                  {selectedIdx !== null && selStarter?.posCode && (
                    <svg
                      style={{
                        position:"absolute", inset:0, width:"100%", height:"100%",
                        pointerEvents:"none", zIndex:2,
                      }}
                      viewBox="0 0 100 100" preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="linemate-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%"  stopColor={C.blueHi} stopOpacity="0.85"/>
                          <stop offset="100%" stopColor={C.blueHi} stopOpacity="0.35"/>
                        </linearGradient>
                      </defs>
                      {starters.map((st, i) => {
                        if (i === selectedIdx) return null;
                        if (getGroup(st.posCode) !== getGroup(selStarter.posCode)) return null;
                        return (
                          <line key={st.id}
                            x1={selStarter.currentLeft} y1={selStarter.currentTop}
                            x2={st.currentLeft} y2={st.currentTop}
                            stroke="url(#linemate-grad)"
                            strokeWidth="0.35"
                            strokeDasharray="1.2 0.8"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        );
                      })}
                    </svg>
                  )}

                  {/* PlayersLayer */}
                  {starters.map((st, i) => {
                    const hasSelection = selectedIdx !== null;
                    const sameGroup = hasSelection && selStarter?.posCode &&
                      getGroup(st.posCode) === getGroup(selStarter.posCode);
                    const isSelectedToken = selectedIdx === i;
                    const isLinemate = hasSelection && !isSelectedToken && sameGroup;
                    const isDimmed = hasSelection && !isSelectedToken && !sameGroup;
                    const previewSrc = hoveredFormation
                      ? (viewMode === "half" ? HALF_FORMATIONS : HORIZ_FORMATIONS)[hoveredFormation]?.positions
                      : null;
                    const previewPos = previewSrc?.[i];
                    const displayLeft = previewPos ? previewPos.left : st.currentLeft;
                    const displayTop  = previewPos ? previewPos.top  : st.currentTop;
                    return (
                      <motion.div key={st.id}
                        animate={{ left:`${displayLeft}%`, top:`${displayTop}%` }}
                        transition={{ type:"spring", stiffness: hoveredFormation ? 260 : 320, damping: hoveredFormation ? 28 : 30, mass:0.55, delay: hoveredFormation ? 0 : (st.stagger||0) }}
                        style={{
                          position:"absolute", transform:"translate(-50%,-50%)",
                          zIndex: isDrag("starter",i)?1 : isSelectedToken?15 : isLinemate?8 : 5,
                          pointerEvents: (isDrawingActive || !editMode) ? "none" : "auto",
                          willChange: "left, top, transform",
                        }}>
                        <HexToken
                          starter={st}
                          salud={st.athlete ? saludMap.get(st.athlete.id) : null}
                          riskStatus={st.athlete ? worstStatus(
                            riskMap.get(st.athlete.id)?.status ?? "unknown",
                            wellnessMap.get(st.athlete.id) ?? "unknown"
                          ) : "unknown"}
                          viewLayer={viewLayer}
                          isSelected={isSelectedToken}
                          isDragged={isDrag("starter",i)}
                          isTarget={nearTarget===i}
                          isActivating={dragActivating?.type==="starter"&&dragActivating?.index===i}
                          dimmed={isDimmed}
                          linemate={isLinemate}
                          onSelect={e=>{ e.stopPropagation(); setSelectedIdx(p=>p===i?null:i); }}
                          onPointerDown={e => editMode ? handlePointerDown(e,"starter",i) : e.stopPropagation()}
                        />
                      </motion.div>
                    );
                  })}

                  {/* Inline quick-action pill — sobre el token seleccionado */}
                  {selStarter?.athlete && !isDrag("starter", selectedIdx) && !isDrawingActive && editMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.92 }}
                      transition={{ type: "spring", stiffness: 420, damping: 26 }}
                      style={{
                        position: "absolute",
                        left: `${selStarter.currentLeft}%`,
                        top: `${Math.max(selStarter.currentTop - 11, 3)}%`,
                        transform: "translate(-50%, -100%)",
                        zIndex: 18,
                        display: "flex", alignItems: "center", gap: 2,
                        padding: "3px 5px",
                        background: "rgba(4,6,16,0.96)",
                        border: `1px solid ${C.blueBorder}`,
                        borderRadius: 999,
                        boxShadow: `0 6px 18px rgba(0,0,0,0.6), 0 0 14px ${C.blueGlow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                        whiteSpace: "nowrap",
                      }}
                    >
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); resetStarterPos(selectedIdx); }}
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.94 }}
                        title="Volver a posición de formación"
                        style={{
                          padding: "4px 9px",
                          fontSize: 8.5, fontWeight: 900,
                          color: "white",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          letterSpacing: "1.4px",
                          textTransform: "uppercase",
                          borderRadius: 999,
                        }}
                      >↺ Reset</motion.button>

                      <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.14)" }} />

                      <motion.button
                        onClick={(e) => { e.stopPropagation(); setActiveTab("roles"); }}
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.94 }}
                        title="Ir a la ficha táctica"
                        style={{
                          padding: "4px 9px",
                          fontSize: 8.5, fontWeight: 900,
                          color: C.blueHi,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          letterSpacing: "1.4px",
                          textTransform: "uppercase",
                          borderRadius: 999,
                        }}
                      >⟶ Ficha</motion.button>
                    </motion.div>
                  )}

                </FieldLayer>

                {/* DrawingToolbar flotante en el borde inferior del pitch */}
                {editMode && (
                  <DrawingToolbar
                    drawingEngine={drawingEngine}
                    onClearAll={() => setConfirmAction({
                      title: "Limpiar pizarra",
                      message: "Se eliminarán todos los trazados. Esta acción no se puede deshacer.",
                      onConfirm: () => { drawingEngine.clearAllDrawings(); setConfirmAction(null); },
                    })}
                  />
                )}

                {/* Formations overlay */}
                <AnimatePresence>
                  {showFormations && (
                    <FormationsOverlay
                      key="formations"
                      formationKey={formationKey}
                      onSelect={changeFormation}
                      onClose={() => { setShowFormations(false); setHoveredFormation(null); }}
                      onHover={setHoveredFormation}
                    />
                  )}
                </AnimatePresence>
            </div>

            {/* BenchRibbon */}
            <BenchRibbon
              bench={bench}
              saludMap={saludMap}
              isDrag={isDrag}
              dragActivating={dragActivating}
              benchAreaRef={benchAreaRef}
              onPointerDown={handlePointerDown}
            />
          </div>

          {/* ── INTEL DOCK (der) ── */}
          <IntelDock
            selectedStarter={selStarter}
            historial={historial}
            phase={phase}
            phaseLabel={PHASE_LABELS[phase]}
            instructions={instructionsText}
            onInstructions={setInstructionsText}
            tacticas={tacticasText}
            onTacticas={setTacticasText}
            onSeeFullDetail={selStarter?.athlete ? () => setActiveTab("roles") : undefined}
          />
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

      {/* Play Library overlay — captura y restauración */}
      <PlayLibraryOverlay
        open={showPlays}
        onClose={() => setShowPlays(false)}
        plays={plays}
        onCapture={capturePlay}
        onLoad={loadPlay}
        onDelete={deletePlay}
      />
    </div>
  );
}
