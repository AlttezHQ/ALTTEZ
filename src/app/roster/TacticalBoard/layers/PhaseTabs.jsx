/**
 * @component PhaseTabs
 * @description HUD de fase táctica encima del pitch stage.
 * 3 estados: Ofensiva / Defensiva / Balón parado.
 * Estilo broadcast: Orbitron, underline glow azul, corner-accent.
 *
 * Props:
 *  phase     {"ofensiva" | "defensiva" | "balonParado"}
 *  onChange  (key) => void
 *  accent    {string}
 *
 * @version 1.0 — Broadcast Arena
 */
import { motion } from "framer-motion";
import { PALETTE as C } from "../../../../shared/tokens/palette";

const PHASES = [
  { key: "ofensiva",    code: "OFF", label: "Ofensiva",     hint: "Ataque posicional" },
  { key: "defensiva",   code: "DEF", label: "Defensiva",    hint: "Repliegue / presión" },
  { key: "balonParado", code: "ABP", label: "Balón parado", hint: "Córners · Tiros libres" },
];

export default function PhaseTabs({ phase = "ofensiva", onChange, accent = C.blue }) {
  return (
    <div style={{
      position: "relative",
      display: "flex",
      alignItems: "stretch",
      gap: 0,
      height: 40,
      background: "linear-gradient(180deg, rgba(6,10,18,0.95) 0%, rgba(10,15,26,0.82) 100%)",
      borderBottom: `1px solid ${C.borderHi}`,
      paddingLeft: 14,
      flexShrink: 0,
    }}>
      {/* Corner accent izquierdo */}
      <span style={{
        position: "absolute", top: 4, left: 4, width: 6, height: 6,
        borderTop: `1.5px solid ${accent}`, borderLeft: `1.5px solid ${accent}`,
        opacity: 0.85,
      }} />

      {/* Label "FASE" */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        paddingRight: 16, marginRight: 4,
        borderRight: `1px solid ${C.border}`,
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: accent,
          boxShadow: `0 0 10px ${C.blueGlow}, 0 0 20px ${C.blueGlow}`,
        }} />
        <span style={{
          fontSize: 9, fontWeight: 900, color: C.textMuted,
          textTransform: "uppercase", letterSpacing: "2.5px",
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
        }}>
          Fase
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "stretch", flex: 1 }}>
        {PHASES.map((p) => {
          const active = p.key === phase;
          return (
            <motion.button
              key={p.key}
              onClick={() => onChange?.(p.key)}
              whileHover={{ y: -1 }}
              style={{
                position: "relative",
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                justifyContent: "center", gap: 1,
                padding: "0 18px",
                background: active
                  ? "linear-gradient(180deg, rgba(47,107,255,0.14) 0%, rgba(47,107,255,0.02) 100%)"
                  : "transparent",
                border: "none",
                cursor: "pointer",
                minHeight: "unset",
                borderRight: `1px solid ${C.border}`,
                transition: "background 160ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 8.5, fontWeight: 900,
                  color: active ? accent : C.textMuted,
                  letterSpacing: "1.6px", opacity: active ? 1 : 0.75,
                  fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                }}>
                  {p.code}
                </span>
                <span style={{
                  fontSize: 10.5, fontWeight: 800,
                  color: active ? "white" : "rgba(240,244,248,0.62)",
                  textTransform: "uppercase", letterSpacing: "1.2px",
                  fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                  textShadow: active ? `0 0 14px ${C.blueGlow}` : "none",
                }}>
                  {p.label}
                </span>
              </div>
              <span style={{
                fontSize: 8, color: active ? "rgba(240,244,248,0.55)" : C.textHint,
                letterSpacing: "1px", fontWeight: 600,
                fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
              }}>
                {p.hint}
              </span>

              {/* Underline glow active */}
              {active && (
                <motion.span
                  layoutId="phase-active"
                  style={{
                    position: "absolute", bottom: 0, left: 8, right: 8, height: 2,
                    background: `linear-gradient(90deg, ${accent}00 0%, ${accent} 50%, ${accent}00 100%)`,
                    boxShadow: `0 0 12px ${C.blueGlow}`,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Timecode decorativo a la derecha */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "0 14px",
        borderLeft: `1px solid ${C.border}`,
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700, color: C.textMuted,
          letterSpacing: "1.8px", textTransform: "uppercase",
          fontFamily: '"JetBrains Mono","Orbitron",monospace',
        }}>
          HUD · 11v11
        </span>
      </div>
    </div>
  );
}
