/**
 * @component Scoreboard
 * @description Marcador broadcast tipo transmisión deportiva.
 * Home vs Away con score XL Orbitron, tags de equipo, venue/fecha,
 * corner-accents y bisel metálico. Lectura instantánea tipo FIFA/EA FC.
 *
 * Props:
 *  home        {{ name: string, score: number|string, logo?: string, tag?: string }}
 *  away        {{ name: string, score: number|string, logo?: string, tag?: string }}
 *  meta        {{ date?: string, venue?: string, competition?: string, status?: string }}
 *  result      {"win"|"loss"|"draw"}  (opcional, tinta el score propio)
 *  size        {"md"|"lg"}  default "md"
 *  className   {string}
 *
 * @version 1.0 — Broadcast Arena flagship
 */
import { motion } from "framer-motion";
import { PALETTE as C, ELEVATION, BROADCAST_GRADIENT } from "../tokens/palette";

const SPRING = { type: "spring", stiffness: 360, damping: 28 };

export default function Scoreboard({
  home = { name: "Home", score: 0, tag: "HOM" },
  away = { name: "Away", score: 0, tag: "AWA" },
  meta = {},
  result,
  size = "md",
  className = "",
}) {
  const SZ = size === "lg" ? {
    h: 128, scoreFs: 64, nameFs: 14, tagFs: 10, padX: 28,
  } : {
    h: 104, scoreFs: 48, nameFs: 12, tagFs: 9, padX: 22,
  };

  const resultColor = (team) => {
    if (!result) return "white";
    if (team === "home" && result === "win") return C.success;
    if (team === "home" && result === "loss") return C.danger;
    if (team === "away" && result === "win") return C.danger;
    if (team === "away" && result === "loss") return C.success;
    return "white";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className={className}
      style={{
        position: "relative",
        minHeight: SZ.h,
        background: BROADCAST_GRADIENT.statAccent,
        border: `1px solid ${C.borderHi}`,
        borderRadius: 18,
        boxShadow: ELEVATION.stat,
        overflow: "hidden",
      }}
    >
      {/* Top sweep accent */}
      <span style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${C.blue}00 0%, ${C.blue} 20%, ${C.blueHi} 50%, ${C.blue} 80%, ${C.blue}00 100%)`,
      }} />
      {/* Hairline light */}
      <span style={{
        position: "absolute", top: 3, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none",
      }} />

      {/* Corner accents */}
      <CornerMark pos="tl" />
      <CornerMark pos="tr" />
      <CornerMark pos="bl" />
      <CornerMark pos="br" />

      {/* Meta chip (top-center) */}
      {(meta.competition || meta.status) && (
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8,
          padding: "3px 10px",
          background: C.blueDim,
          border: `1px solid ${C.blueBorder}`,
          borderRadius: 999,
          fontSize: 8.5, fontWeight: 800,
          color: C.blueDeep,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          zIndex: 3,
        }}>
          {meta.status === "live" && (
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: C.danger,
              boxShadow: `0 0 8px ${C.danger}`,
              animation: "alttez-live 1.4s ease-in-out infinite",
            }} />
          )}
          {meta.competition || (meta.status === "live" ? "En vivo" : "Partido")}
        </div>
      )}

      {/* Main row: home — score — away */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        height: "100%",
        minHeight: SZ.h,
        padding: `18px ${SZ.padX}px 14px`,
        gap: 18,
        position: "relative",
      }}>
        {/* HOME */}
        <TeamBlock team={home} align="right" SZ={SZ} />

        {/* SCORE */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "0 6px",
          position: "relative",
        }}>
          <ScoreDigit value={home.score} color={resultColor("home")} fs={SZ.scoreFs} />
          <div style={{
            fontSize: Math.round(SZ.scoreFs * 0.55),
            fontWeight: 900,
            color: C.textHint,
            lineHeight: 1,
            margin: "0 2px",
          }}>—</div>
          <ScoreDigit value={away.score} color={resultColor("away")} fs={SZ.scoreFs} />
        </div>

        {/* AWAY */}
        <TeamBlock team={away} align="left" SZ={SZ} />
      </div>

      {/* Footer meta (date/venue) */}
      {(meta.date || meta.venue) && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "7px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "rgba(245,241,234,0.72)",
        }}>
          {meta.date && (
            <div style={{
              fontSize: 9, fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}>
              {meta.date}
            </div>
          )}
          {meta.venue && (
            <div style={{
              fontSize: 9, fontWeight: 600,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <PinIcon /> {meta.venue}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function TeamBlock({ team, align, SZ }) {
  const isRight = align === "right";
  const initial = (team.name || "?").charAt(0).toUpperCase();
  return (
    <div style={{
      display: "flex",
      flexDirection: isRight ? "row" : "row-reverse",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 14,
      minWidth: 0,
    }}>
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: isRight ? "flex-end" : "flex-start",
        minWidth: 0,
      }}>
        {team.tag && (
          <div style={{
            fontSize: SZ.tagFs,
            fontWeight: 900,
            color: C.blueHi,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 4,
          }}>
            {team.tag}
          </div>
        )}
        <div style={{
          fontSize: SZ.nameFs,
          fontWeight: 800,
          color: C.text,
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          lineHeight: 1.1,
          maxWidth: 180,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {team.name}
        </div>
      </div>

      {/* Crest / logo */}
      <div style={{
        width: 46, height: 46,
        borderRadius: 10,
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,241,234,0.96) 100%)",
        border: `1px solid ${C.blueBorder}`,
        boxShadow: "0 10px 24px rgba(23,26,28,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}>
        {team.logo ? (
          <img src={team.logo} alt={team.name} style={{
            width: "80%", height: "80%", objectFit: "contain",
          }} />
        ) : (
          <span style={{
            fontSize: 20, fontWeight: 900,
            color: C.text,
          }}>
            {initial}
          </span>
        )}
        {/* inner corner accents on crest */}
        <span style={{
          position: "absolute", top: 3, left: 3,
          width: 4, height: 4,
          borderTop: `1px solid ${C.blue}`, borderLeft: `1px solid ${C.blue}`,
          opacity: 0.8,
        }} />
        <span style={{
          position: "absolute", bottom: 3, right: 3,
          width: 4, height: 4,
          borderBottom: `1px solid ${C.blue}`, borderRight: `1px solid ${C.blue}`,
          opacity: 0.8,
        }} />
      </div>
    </div>
  );
}

function ScoreDigit({ value, color, fs }) {
  return (
    <motion.span
      key={String(value)}
      initial={{ scale: 1.2, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      style={{
        fontSize: fs,
        fontWeight: 900,
        color,
        lineHeight: 1,
        letterSpacing: "-2.5px",
        fontVariantNumeric: "tabular-nums",
        minWidth: `calc(${fs}px * 0.62)`,
        textAlign: "center",
      }}
    >
      {value}
    </motion.span>
  );
}

function CornerMark({ pos }) {
  const color = C.blue;
  const base = { position: "absolute", width: 12, height: 12, pointerEvents: "none", opacity: 0.85 };
  const map = {
    tl: { top: 8,    left: 8,    borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` },
    tr: { top: 8,    right: 8,   borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` },
    bl: { bottom: 8, left: 8,    borderBottom:`1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` },
    br: { bottom: 8, right: 8,   borderBottom:`1.5px solid ${color}`, borderRight: `1.5px solid ${color}` },
  };
  return <span style={{ ...base, ...map[pos] }} />;
}

function PinIcon() {
  return (
    <svg width="9" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 2C7 2 5 6 5 9c0 5 7 13 7 13s7-8 7-13c0-3-2-7-7-7z" stroke={C.textMuted} strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="9" r="2.5" stroke={C.textMuted} strokeWidth="1.5" fill="none" />
    </svg>
  );
}
