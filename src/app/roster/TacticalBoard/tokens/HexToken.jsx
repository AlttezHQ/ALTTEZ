/**
 * @component HexToken
 * @description PlayerToken FUT-style: hexágono táctico con OVR XL, posCode chip,
 * foto clipeada, name strip bevelado. Ring de riesgo + halo de selección broadcast.
 * Sustituye al disco-foto genérico por una unidad táctica legible.
 *
 * Props (mismo contrato que el PlayerToken anterior):
 *  starter        {{ athlete, posCode, id }}
 *  salud          {{ salud: number }}
 *  riskStatus     "red" | "yellow" | "green" | "unknown"
 *  viewLayer      "normal" | "heatmap" | "recovery"
 *  isSelected     boolean
 *  isDragged      boolean
 *  isTarget       boolean          (near-target durante drag)
 *  isActivating   boolean          (acaba de aterrizar)
 *  onSelect       (e) => void
 *  onPointerDown  (e) => void
 *
 * @version 1.0 — Broadcast Arena
 */
import { memo, useState } from "react";
import { motion } from "framer-motion";
import { PALETTE as C } from "../../../../shared/tokens/palette";
import { getAvatarUrl as avatar, getStatusStyle } from "../../../../shared/utils/helpers";
import { saludColor } from "../../../../shared/utils/rpeEngine";

/* ── hex path helpers ─────────────────────────────────────────────────────── */
// Hex vertical (punta arriba). viewBox 100x110.
const HEX_PATH = "M50 3 L95 28 L95 82 L50 107 L5 82 L5 28 Z";
const HEX_VIEWBOX = "0 0 100 110";

const TOKEN_W = 56;
const TOKEN_H = 62;

const riskRGB = (r) => r === "red" ? "226,75,74" : r === "yellow" ? "239,159,39" : r === "green" ? "57,255,20" : null;

/* ── Empty slot (arrastra aquí) ───────────────────────────────────────────── */
function EmptyHex({ isTarget, posCode }) {
  return (
    <div style={{
      width: TOKEN_W, height: TOKEN_H, position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: 0.85,
    }}>
      <svg viewBox={HEX_VIEWBOX} width={TOKEN_W} height={TOKEN_H} style={{ position: "absolute", inset: 0 }}>
        <path
          d={HEX_PATH}
          fill={isTarget ? "rgba(47,107,255,0.12)" : "rgba(10,15,26,0.55)"}
          stroke={isTarget ? C.blueHi : "rgba(255,255,255,0.22)"}
          strokeWidth="1.4"
          strokeDasharray={isTarget ? "0" : "3 3"}
        />
      </svg>
      <div style={{
        position: "relative",
        fontSize: 10,
        fontWeight: 800,
        color: isTarget ? C.blueHi : "rgba(255,255,255,0.28)",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
      }}>
        {posCode || "+"}
      </div>
    </div>
  );
}

/* ── HexToken principal ───────────────────────────────────────────────────── */
const HexToken = memo(function HexToken({
  starter, salud, riskStatus = "unknown", viewLayer = "normal",
  isSelected, isDragged, isTarget, isActivating, onSelect, onPointerDown,
}) {
  const [hovered, setHovered] = useState(false);
  const athlete = starter.athlete;

  if (!athlete) {
    return <EmptyHex isTarget={isTarget} posCode={starter.posCode} />;
  }

  const saludVal = salud?.salud ?? 100;
  const dorsal = athlete.dorsal ?? athlete.number ?? null;
  const apellido = (athlete.name?.split(" ").pop() || "").toUpperCase();
  const ovr = athlete.rating || Math.floor(68 + ((athlete.id % 22) + Math.min(saludVal, 99) / 5));
  const isActive = isSelected || isActivating;
  const isHover = hovered && !isDragged;
  const clipId = `hexclip-${athlete.id}`;

  /* Borde primario — salud por defecto, blue si selected/target, blanco si activating */
  const border = isActivating
    ? "rgba(255,255,255,0.95)"
    : isTarget
      ? C.blueHi
      : isSelected
        ? C.blueHi
        : saludColor(saludVal);

  /* OVR color — FUT style: oro/plata/bronce por rating */
  const ovrTier =
    ovr >= 85 ? { bg: "linear-gradient(180deg,#FFE082 0%,#FFB300 100%)", txt: "#3C2800" }
    : ovr >= 78 ? { bg: "linear-gradient(180deg,#E0E0E0 0%,#9E9E9E 100%)", txt: "#1C1C1C" }
    : ovr >= 70 ? { bg: "linear-gradient(180deg,#D7B28C 0%,#8D5A2C 100%)", txt: "#2A1708" }
    : { bg: "linear-gradient(180deg,#3F51B5 0%,#1A237E 100%)", txt: "white" };

  const riskRgb = riskRGB(riskStatus);

  const scale = isActivating ? 1.12 : isTarget ? 1.08 : isActive && !isDragged ? 1.05 : isHover ? 1.03 : 1;

  /* layer overlay opacity */
  const layerOverlay = viewLayer !== "normal" && athlete.status === "P"
    ? riskStatus === "red"    ? "rgba(226,75,74,0.45)"
    : riskStatus === "yellow" ? "rgba(239,159,39,0.32)"
    : riskStatus === "green"  ? "rgba(29,158,117,0.20)"
    : "rgba(255,255,255,0.05)"
    : null;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        userSelect: "none",
        pointerEvents: "auto",
      }}
    >
      {/* ── Hex container ── */}
      <motion.div
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={onPointerDown}
        animate={{ scale }}
        transition={
          isActivating
            ? { type: "spring", stiffness: 540, damping: 18 }
            : { type: "spring", stiffness: 380, damping: 26 }
        }
        style={{
          position: "relative",
          width: TOKEN_W, height: TOKEN_H,
          cursor: isDragged ? "grabbing" : "grab",
          touchAction: "none",
          opacity: isDragged ? 0.18 : 1,
          filter: isActive
            ? `drop-shadow(0 0 12px ${C.blueGlow}) drop-shadow(0 4px 10px rgba(0,0,0,0.7))`
            : riskRgb && riskStatus !== "green"
              ? `drop-shadow(0 0 8px rgba(${riskRgb},0.55)) drop-shadow(0 3px 8px rgba(0,0,0,0.6))`
              : "drop-shadow(0 3px 8px rgba(0,0,0,0.65))",
          transition: "filter 160ms ease, opacity 120ms",
        }}
      >
        {/* Risk pulse ring (solo rojo) */}
        {riskStatus === "red" && (
          <motion.svg
            viewBox={HEX_VIEWBOX}
            width={TOKEN_W + 12} height={TOKEN_H + 12}
            style={{ position: "absolute", top: -6, left: -6, pointerEvents: "none" }}
            animate={{ opacity: [0.75, 0, 0.75], scale: [1, 1.12, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d={HEX_PATH} fill="none" stroke="rgba(226,75,74,0.55)" strokeWidth="2" />
          </motion.svg>
        )}

        <svg viewBox={HEX_VIEWBOX} width={TOKEN_W} height={TOKEN_H}>
          <defs>
            <clipPath id={clipId}>
              <path d={HEX_PATH} />
            </clipPath>
            <linearGradient id={`hexbg-${athlete.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stopColor="rgba(47,107,255,0.22)" />
              <stop offset="55%" stopColor="rgba(8,14,26,0.98)" />
              <stop offset="100%" stopColor="rgba(4,6,14,1)" />
            </linearGradient>
            <linearGradient id={`hexbevel-${athlete.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0)" />
              <stop offset="80%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
            </linearGradient>
          </defs>

          {/* Hex background fill (profundidad metálica) */}
          <path d={HEX_PATH} fill={`url(#hexbg-${athlete.id})`} />

          {/* Photo clipped — ocupa hex */}
          <g clipPath={`url(#${clipId})`}>
            <image
              href={avatar(athlete.photo)}
              x="0" y="0" width="100" height="110"
              preserveAspectRatio="xMidYMin slice"
              opacity={athlete.status !== "P" ? 0.35 : 0.88}
            />
            {/* Gradient overlay — inferior más oscuro (para legibilidad) */}
            <rect x="0" y="55" width="100" height="55" fill="url(#hexbevel-${athlete.id})" opacity="1" />
            <rect x="0" y="0" width="100" height="110" fill="rgba(4,6,14,0.15)" />
            {/* Layer overlay (heatmap/recovery) */}
            {layerOverlay && (
              <rect x="0" y="0" width="100" height="110" fill={layerOverlay} />
            )}
          </g>

          {/* Hex border principal */}
          <path
            d={HEX_PATH}
            fill="none"
            stroke={border}
            strokeWidth={isActive ? 2.6 : 2}
            opacity={isDragged ? 0.4 : 1}
          />
          {/* Bevel hairline interior */}
          <path
            d={HEX_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.6"
            transform="translate(0.6,0.6)"
          />

          {/* POSCODE strip (parte inferior interior) */}
          <g>
            <rect x="5" y="82" width="90" height="15" fill="rgba(4,6,14,0.82)" clipPath={`url(#${clipId})`} />
            <text
              x="50" y="92"
              textAnchor="middle"
              fill={C.blueHi}
              style={{
                fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "1.4px",
                textTransform: "uppercase",
              }}
            >
              {starter.posCode}
            </text>
          </g>
        </svg>

        {/* OVR badge (FUT gold/silver/bronze) — top-left */}
        <div style={{
          position: "absolute",
          top: -6, left: -4,
          minWidth: 22, height: 22,
          borderRadius: 5,
          padding: "0 4px",
          background: ovrTier.bg,
          color: ovrTier.txt,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "-0.5px",
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.55)",
          border: "1px solid rgba(0,0,0,0.35)",
          zIndex: 3,
          lineHeight: 1,
        }}>
          {ovr}
        </div>

        {/* Dorsal — top-right chip */}
        {dorsal !== null && (
          <div style={{
            position: "absolute",
            top: -4, right: -4,
            minWidth: 18, height: 18,
            padding: "0 4px",
            borderRadius: 9,
            background: "linear-gradient(180deg, rgba(47,107,255,0.95), rgba(29,78,216,1))",
            border: `1px solid ${C.blueHi}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9,
            fontWeight: 900,
            color: "white",
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px ${C.blueGlow}`,
            textShadow: "0 1px 0 rgba(0,0,0,0.25)",
            letterSpacing: "-0.3px",
            zIndex: 3,
            lineHeight: 1,
          }}>
            {dorsal}
          </div>
        )}

        {/* Status stamp (LES/AUS) */}
        {athlete.status !== "P" && (
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%) rotate(-12deg)",
            padding: "2px 8px",
            background: "rgba(226,75,74,0.9)",
            border: "1.5px solid rgba(255,255,255,0.55)",
            borderRadius: 3,
            fontSize: 9,
            fontWeight: 900,
            color: "white",
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            zIndex: 4,
            boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
          }}>
            {athlete.status === "L" ? "LES" : "AUS"}
          </div>
        )}

        {/* Selection corner brackets (halo broadcast) */}
        {isActive && (
          <>
            <span style={{ position: "absolute", top: -4,    left: -4,   width: 7, height: 7, borderTop: `1.5px solid ${C.blueHi}`, borderLeft: `1.5px solid ${C.blueHi}`, boxShadow: `0 0 6px ${C.blueGlow}` }} />
            <span style={{ position: "absolute", top: -4,    right: -4,  width: 7, height: 7, borderTop: `1.5px solid ${C.blueHi}`, borderRight: `1.5px solid ${C.blueHi}`, boxShadow: `0 0 6px ${C.blueGlow}` }} />
            <span style={{ position: "absolute", bottom: -4, left: -4,   width: 7, height: 7, borderBottom: `1.5px solid ${C.blueHi}`, borderLeft: `1.5px solid ${C.blueHi}`, boxShadow: `0 0 6px ${C.blueGlow}` }} />
            <span style={{ position: "absolute", bottom: -4, right: -4,  width: 7, height: 7, borderBottom: `1.5px solid ${C.blueHi}`, borderRight: `1.5px solid ${C.blueHi}`, boxShadow: `0 0 6px ${C.blueGlow}` }} />
          </>
        )}
      </motion.div>

      {/* Name strip bevel metálico */}
      <div style={{
        marginTop: 3,
        padding: "2px 8px",
        maxWidth: 78,
        background: isActive
          ? `linear-gradient(180deg, ${C.blue} 0%, ${C.blueDeep} 100%)`
          : "linear-gradient(180deg, rgba(18,22,36,0.95) 0%, rgba(4,6,14,0.98) 100%)",
        border: `1px solid ${isActive ? C.blueHi : "rgba(255,255,255,0.08)"}`,
        borderRadius: 3,
        fontSize: 8.5,
        fontWeight: 900,
        color: isActive ? "white" : "rgba(255,255,255,0.88)",
        letterSpacing: "1.4px",
        textTransform: "uppercase",
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
        textAlign: "center",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        boxShadow: isActive
          ? `inset 0 1px 0 rgba(255,255,255,0.28), 0 2px 8px ${C.blueGlow}`
          : "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.7)",
        textShadow: isActive ? "0 1px 0 rgba(0,0,0,0.25)" : "0 1px 2px rgba(0,0,0,0.8)",
        lineHeight: 1.3,
      }}>
        {apellido.length > 9 ? apellido.slice(0, 9) : apellido}
      </div>

      {/* Health micro-bar */}
      <div style={{
        marginTop: 2,
        width: 40, height: 3,
        borderRadius: 2,
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${Math.max(6, Math.min(100, saludVal))}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${saludColor(saludVal)} 0%, ${saludColor(saludVal)} 100%)`,
          boxShadow: `0 0 6px ${saludColor(saludVal)}88`,
        }} />
      </div>
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

export default HexToken;
