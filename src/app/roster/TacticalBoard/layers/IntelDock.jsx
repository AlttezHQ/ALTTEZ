/**
 * @component IntelDock
 * @description Dock derecho del Tactical Board — zona de inteligencia.
 * Cuando hay jugador seleccionado: tarjeta FUT con OVR, atributos, salud, acciones.
 * Sin selección: resumen de equipo (fase, instrucciones, tácticas cortas).
 *
 * Props:
 *  selectedStarter  {{ athlete, posCode } | null}
 *  historial        {Array}
 *  phase            {"ofensiva" | "defensiva" | "balonParado"}
 *  phaseLabel       {string}
 *  instructions     {string}
 *  onInstructions   {(text)=>void}
 *  tacticas         {string}
 *  onTacticas       {(text)=>void}
 *  onSeeFullDetail  {()=>void}
 *  onSwapSimilar    {(athlete)=>void}
 *  allAthletes      {Array}
 *  accent           {string}
 *
 * @version 1.0 — Broadcast Arena
 */
import { PALETTE as C } from "../../../../shared/tokens/palette";
import { getAvatarUrl as avatar, getStatusStyle } from "../../../../shared/utils/helpers";
import { calcSaludActual, saludColor } from "../../../../shared/utils/rpeEngine";

const POSITION_GROUPS = {
  GK:  ["GK"],
  DEF: ["LB","LWB","CB","RB","RWB"],
  MID: ["CDM","CM","CAM","LM","RM","LW","RW"],
  ATT: ["ST","CF","LF","RF"],
};
const getGroup = (pc) => {
  for (const [g, c] of Object.entries(POSITION_GROUPS)) if (c.includes(pc)) return g;
  return "MID";
};

/* ── Tier color by OVR ───────────────────────────────────────────────────── */
function ovrTier(ovr) {
  if (ovr >= 85) return { bg: "linear-gradient(135deg,#FFE38A 0%,#D4A024 55%,#8A6414 100%)", fg: "#1A1205", label: "GOLD" };
  if (ovr >= 78) return { bg: "linear-gradient(135deg,#E2E8EF 0%,#9AA3AF 55%,#545B66 100%)", fg: "#0B0E14", label: "SILVER" };
  if (ovr >= 70) return { bg: "linear-gradient(135deg,#C98A5A 0%,#8E5A34 55%,#4E2E17 100%)", fg: "#1A0E05", label: "BRONZE" };
  return { bg: `linear-gradient(135deg,${C.blue} 0%,${C.blueDeep} 100%)`, fg: "#fff", label: "ROOKIE" };
}

function DockBlock({ label, children, accent = C.blue }) {
  return (
    <div style={{
      position: "relative",
      padding: "12px 14px 14px",
      background: "linear-gradient(180deg, rgba(14,20,34,0.88) 0%, rgba(8,12,22,0.96) 100%)",
      border: `1px solid ${C.borderHi}`,
      borderRadius: 10,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    }}>
      <span style={{
        position: "absolute", top: 4, right: 4, width: 6, height: 6,
        borderTop: `1.5px solid ${accent}`, borderRight: `1.5px solid ${accent}`,
        opacity: 0.85,
      }} />
      <div style={{
        fontSize: 8.5, fontWeight: 900,
        color: C.textMuted, letterSpacing: "2.2px",
        textTransform: "uppercase", marginBottom: 10,
        paddingRight: 8, textAlign: "right",
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function AttrRow({ label, value, accent = C.blue }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{
        width: 42, fontSize: 8.5, fontWeight: 900,
        color: C.textMuted, letterSpacing: "1.4px",
        textTransform: "uppercase",
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
      }}>{label}</span>
      <div style={{
        flex: 1, height: 6,
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: `linear-gradient(90deg, ${accent} 0%, ${C.blueHi} 100%)`,
          boxShadow: `0 0 8px ${C.blueGlow}`,
        }} />
      </div>
      <span style={{
        width: 22, textAlign: "right",
        fontSize: 11, fontWeight: 900, color: "white",
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
      }}>{value}</span>
    </div>
  );
}

export default function IntelDock({
  selectedStarter,
  historial = [],
  phase,
  phaseLabel,
  instructions,
  onInstructions,
  tacticas,
  onTacticas,
  onSeeFullDetail,
  accent = C.blue,
}) {

  const athlete = selectedStarter?.athlete;

  /* ── EMPTY STATE / TEAM HUD ─────────────────────────────────────────── */
  if (!athlete) {
    return (
      <aside style={{
        width: 278, flexShrink: 0,
        background: "linear-gradient(180deg, rgba(6,10,18,0.98) 0%, rgba(4,7,14,1) 100%)",
        borderLeft: `1px solid ${C.borderHi}`,
        padding: "14px 12px",
        display: "flex", flexDirection: "column", gap: 12,
        overflowY: "auto",
      }}>
        {/* Fase actual */}
        <DockBlock label="Fase activa" accent={accent}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 4px",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 10px ${C.blueGlow}, 0 0 22px ${C.blueGlow}`,
            }} />
            <div style={{
              fontSize: 14, fontWeight: 900, color: "white",
              letterSpacing: "2px", textTransform: "uppercase",
              fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
              textShadow: `0 0 14px ${C.blueGlow}`,
            }}>
              {phaseLabel || "Ofensiva"}
            </div>
          </div>
        </DockBlock>

        {/* Instrucciones */}
        <DockBlock label="Instrucciones" accent={accent}>
          <textarea
            value={instructions || ""}
            onChange={e => onInstructions?.(e.target.value)}
            placeholder="Presión alta · Salida corta · Repliegue intensivo…"
            style={{
              width: "100%", minHeight: 82,
              background: "rgba(4,7,14,0.7)",
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: "white", fontSize: 11,
              fontFamily: "inherit",
              padding: 10, outline: "none", resize: "vertical",
              letterSpacing: "0.2px",
              lineHeight: 1.45,
            }}
          />
        </DockBlock>

        {/* Tácticas */}
        <DockBlock label="Notas tácticas" accent={accent}>
          <textarea
            value={tacticas || ""}
            onChange={e => onTacticas?.(e.target.value)}
            placeholder="Aprovechar carril derecho · Marcar al #10 rival…"
            style={{
              width: "100%", minHeight: 82,
              background: "rgba(4,7,14,0.7)",
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: "white", fontSize: 11,
              fontFamily: "inherit",
              padding: 10, outline: "none", resize: "vertical",
              letterSpacing: "0.2px",
              lineHeight: 1.45,
            }}
          />
        </DockBlock>

        {/* Hint */}
        <div style={{
          fontSize: 8.5, color: C.textHint,
          textAlign: "center", padding: "4px 8px",
          letterSpacing: "1.4px", textTransform: "uppercase",
          fontWeight: 700,
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
        }}>
          Selecciona un jugador para ver su ficha
        </div>
      </aside>
    );
  }

  /* ── PLAYER CARD ─────────────────────────────────────────────────────── */
  const { salud } = calcSaludActual(athlete.rpe, historial, athlete.id);
  const saludVal = salud ?? 100;
  const attrs = {
    Ritmo:   athlete.speed    || 78,
    Tiro:    athlete.shooting || 72,
    Pases:   athlete.passing  || 80,
    Regate:  athlete.dribble  || 75,
    Defensa: athlete.defense  || 65,
    Físico:  athlete.physical || 77,
  };
  const ovr = athlete.rating || Math.round(Object.values(attrs).reduce((a,b)=>a+b,0)/6);
  const tier = ovrTier(ovr);
  const group = getGroup(selectedStarter.posCode);
  const statusStyle = getStatusStyle(athlete.status);
  const dorsal = athlete.dorsal ?? athlete.number ?? "—";

  return (
    <aside style={{
      width: 278, flexShrink: 0,
      background: "linear-gradient(180deg, rgba(6,10,18,0.98) 0%, rgba(4,7,14,1) 100%)",
      borderLeft: `1px solid ${C.borderHi}`,
      padding: "14px 12px",
      display: "flex", flexDirection: "column", gap: 12,
      overflowY: "auto",
    }}>

      {/* ── Card header FUT-style ── */}
      <div style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${C.borderHi}`,
        background: "linear-gradient(180deg, rgba(14,20,34,0.92) 0%, rgba(8,12,22,0.98) 100%)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>
        <span style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${accent}00 0%, ${accent} 50%, ${accent}00 100%)`,
          boxShadow: `0 0 10px ${C.blueGlow}`,
        }} />

        {/* Photo strip */}
        <div style={{
          position: "relative", height: 128, overflow: "hidden",
          background: "radial-gradient(120% 80% at 50% 0%, rgba(47,107,255,0.18) 0%, transparent 70%)",
        }}>
          <img src={avatar(athlete.photo)} alt="" style={{
            width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center",
            filter: "brightness(0.82) contrast(1.05)",
          }}/>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(6,10,18,1) 0%, rgba(6,10,18,0.25) 50%, transparent 100%)",
          }} />

          {/* OVR badge top-left */}
          <div style={{
            position: "absolute", top: 10, left: 10,
            width: 46, height: 46, borderRadius: 8,
            background: tier.bg,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(0,0,0,0.35)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.35)",
          }}>
            <div style={{
              fontSize: 18, fontWeight: 900, color: tier.fg,
              letterSpacing: "0.5px", lineHeight: 1,
              fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
              textShadow: "0 1px 1px rgba(0,0,0,0.3)",
            }}>
              {ovr}
            </div>
            <div style={{
              fontSize: 7.5, fontWeight: 900, color: tier.fg,
              letterSpacing: "0.8px", marginTop: 1, opacity: 0.78,
              fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            }}>
              {selectedStarter.posCode}
            </div>
          </div>

          {/* Dorsal chip top-right */}
          <div style={{
            position: "absolute", top: 10, right: 10,
            padding: "4px 10px",
            background: `linear-gradient(180deg, ${accent} 0%, ${C.blueDeep} 100%)`,
            border: `1px solid ${accent}`,
            borderRadius: 6,
            fontSize: 13, fontWeight: 900, color: "white",
            letterSpacing: "0.5px", lineHeight: 1,
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            textShadow: "0 1px 1px rgba(0,0,0,0.4)",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 3px 10px ${C.blueGlow}`,
          }}>
            #{dorsal}
          </div>

          {/* Name at bottom */}
          <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
            <div style={{
              fontSize: 15, fontWeight: 900, color: "white",
              textTransform: "uppercase", letterSpacing: "-0.4px",
              lineHeight: 1.1,
              textShadow: "0 2px 8px rgba(0,0,0,0.85)",
              fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            }}>
              {athlete.name}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, marginTop: 4,
            }}>
              <span style={{
                fontSize: 8, fontWeight: 900, color: statusStyle.color,
                letterSpacing: "1.4px", textTransform: "uppercase",
                background: "rgba(4,7,14,0.85)",
                border: `1px solid ${statusStyle.color}55`,
                padding: "2px 6px", borderRadius: 3,
                fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
              }}>
                {athlete.status === "P" ? "Disponible" : athlete.status === "L" ? "Lesionado" : "Ausente"}
              </span>
              <span style={{
                fontSize: 8, color: C.textMuted,
                letterSpacing: "1.2px", textTransform: "uppercase",
                fontWeight: 700,
                fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
              }}>
                {group}
              </span>
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div style={{ padding: "12px 14px 10px" }}>
          {Object.entries(attrs).map(([k, v]) => (
            <AttrRow key={k} label={k} value={v} accent={accent} />
          ))}
        </div>

        {/* Health bar */}
        <div style={{
          padding: "10px 14px 12px",
          borderTop: `1px solid ${C.border}`,
          background: "rgba(4,7,14,0.5)",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 5,
          }}>
            <span style={{
              fontSize: 8.5, fontWeight: 900,
              color: C.textMuted, letterSpacing: "1.6px",
              textTransform: "uppercase",
              fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            }}>
              Salud
            </span>
            <span style={{
              fontSize: 11, fontWeight: 900, color: saludColor(saludVal),
              fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            }}>
              {Math.round(saludVal)}%
            </span>
          </div>
          <div style={{
            height: 5, background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              width: `${saludVal}%`, height: "100%",
              background: saludColor(saludVal),
              boxShadow: `0 0 8px ${saludColor(saludVal)}66`,
            }} />
          </div>
        </div>

        {/* Actions */}
        {onSeeFullDetail && (
          <button
            onClick={onSeeFullDetail}
            style={{
              width: "100%", padding: "10px 12px",
              background: "linear-gradient(135deg, rgba(47,107,255,0.14) 0%, rgba(10,15,26,0.92) 100%)",
              border: "none",
              borderTop: `1px solid ${C.border}`,
              borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
              color: C.blueHi,
              fontSize: 9.5, fontWeight: 900,
              letterSpacing: "1.8px", textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
              minHeight: "unset",
            }}
          >
            Ver ficha completa →
          </button>
        )}
      </div>

    </aside>
  );
}
