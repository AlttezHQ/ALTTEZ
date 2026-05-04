/**
 * @component BenchRibbon
 * @description Ribbon inferior broadcast con suplentes en formato horizontal.
 * Cada suplente es una tarjeta compacta con foto, dorsal, OVR, posCode, salud.
 * Mantiene el contrato drag-and-drop del useDragEngine (onPointerDown + refs).
 *
 * Props:
 *  bench          {Array<{ id, athlete }>}
 *  saludMap       {Map<id, { salud }>}
 *  isDrag         (type, idx) => boolean
 *  dragActivating {{ type, index } | null}
 *  benchAreaRef   {RefObject}
 *  onPointerDown  (e, type, idx) => void
 *  accent         {string}
 *
 * @version 1.0 — Broadcast Arena
 */
import { PALETTE as C } from "../../../../shared/tokens/palette";
import { getAvatarUrl as avatar } from "../../../../shared/utils/helpers";
import { saludColor } from "../../../../shared/utils/rpeEngine";

function BenchCard({ bench, _idx, saludVal, isDragged, isActivating, onPointerDown, accent }) {
  const a = bench.athlete;
  const dorsal = a?.dorsal ?? a?.number ?? "—";
  const ovr = a?.rating || 76;
  const apellido = a?.name?.split(" ").pop() || "—";

  return (
    <div
      onPointerDown={onPointerDown}
      className="tbv9-bench-card-min"
      style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 9,
        padding: "8px 12px 8px 10px",
        background: isActivating
          ? "linear-gradient(135deg, rgba(47,107,255,0.28) 0%, rgba(10,15,26,0.96) 100%)"
          : "linear-gradient(135deg, rgba(18,24,38,0.92) 0%, rgba(8,12,22,0.98) 100%)",
        border: `1px solid ${isActivating ? "rgba(255,255,255,0.42)" : C.borderHi}`,
        borderRadius: 10,
        cursor: isDragged ? "grabbing" : "grab",
        opacity: isDragged ? 0.25 : 1,
        touchAction: "none", flexShrink: 0,
        minWidth: 170,
        userSelect: "none",
        overflow: "hidden",
        boxShadow: isActivating
          ? `0 0 0 2px rgba(255,255,255,0.55), 0 8px 22px rgba(0,0,0,0.65)`
          : `0 3px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.035)`,
        transform: isActivating ? "scale(1.04)" : "scale(1)",
        transition: "transform 140ms cubic-bezier(0.34,1.56,0.64,1), border-color 140ms ease, box-shadow 140ms ease",
      }}
    >
      {/* Lateral blue bar */}
      <span style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 2,
        background: `linear-gradient(180deg, ${accent}00, ${C.blueHi}, ${accent}00)`,
        opacity: 0.85,
      }} />

      {/* Photo + OVR stack */}
      <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          overflow: "hidden",
          border: `2px solid ${saludColor(saludVal)}`,
          boxShadow: `0 0 8px ${saludColor(saludVal)}44`,
        }}>
          <img src={avatar(a?.photo)} alt="" style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "top center",
          }}/>
        </div>
        {/* OVR chip */}
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          minWidth: 18, height: 15, borderRadius: 3,
          padding: "0 4px",
          background: `linear-gradient(180deg, ${accent} 0%, ${C.blueDeep} 100%)`,
          border: "1px solid rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 900, color: "white",
          letterSpacing: "0.3px",
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 4px ${C.blueGlow}`,
        }}>
          {ovr}
        </div>
      </div>

      {/* Info stack */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 3,
        }}>
          <span style={{
            fontSize: 8, fontWeight: 900, color: C.blueHi,
            letterSpacing: "1.2px",
            padding: "1px 5px",
            background: "rgba(47,107,255,0.14)",
            border: `1px solid ${C.blueBorder}`,
            borderRadius: 3,
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          }}>
            {a?.posCode || "—"}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: C.textMuted,
            letterSpacing: "0.4px",
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          }}>
            #{dorsal}
          </span>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 800, color: "white",
          letterSpacing: "0.4px",
          textTransform: "uppercase",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
        }}>
          {apellido}
        </div>
        {/* Salud bar */}
        <div style={{
          height: 3, marginTop: 4, width: 70,
          background: "rgba(0,0,0,0.55)", borderRadius: 1, overflow: "hidden",
        }}>
          <div style={{
            width: `${saludVal}%`, height: "100%",
            background: saludColor(saludVal),
            boxShadow: `0 0 6px ${saludColor(saludVal)}66`,
          }}/>
        </div>
      </div>
    </div>
  );
}

export default function BenchRibbon({
  bench = [],
  saludMap,
  isDrag,
  dragActivating,
  benchAreaRef,
  onPointerDown,
  accent = C.blue,
}) {
  return (
    <div
      ref={benchAreaRef}
      className="tbv9-bench-ribbon"
      style={{
        position: "relative", flexShrink: 0,
        height: 92,
        background: "linear-gradient(180deg, rgba(10,15,26,0.98) 0%, rgba(4,6,14,1) 100%)",
        borderTop: `1px solid ${C.borderHi}`,
        padding: "10px 18px",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 -6px 22px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Top sweep */}
      <span style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, ${accent}00 0%, ${C.blueHi}99 50%, ${accent}00 100%)`,
      }} />

      {/* Label block */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 2,
        paddingRight: 14, borderRight: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 4, height: 4,
            borderTop: `1.5px solid ${accent}`, borderLeft: `1.5px solid ${accent}`,
            opacity: 0.85,
          }}/>
          <div style={{
            fontSize: 10, fontWeight: 900, color: "white",
            textTransform: "uppercase", letterSpacing: "2.5px",
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            textShadow: `0 0 10px ${C.blueGlow}`,
          }}>
            Banca
          </div>
        </div>
        <div style={{
          fontSize: 9, fontWeight: 900, color: C.blueHi,
          letterSpacing: "1.4px",
          padding: "1px 8px",
          background: "rgba(47,107,255,0.10)",
          border: `1px solid ${C.blueBorder}`,
          borderRadius: 999,
          alignSelf: "flex-start",
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
        }}>
          {bench.length} disp.
        </div>
      </div>

      {/* Scroll ribbon */}
      <div style={{
        flex: 1, display: "flex", gap: 10,
        overflowX: "auto", overflowY: "hidden",
        paddingBottom: 3,
      }}>
        {bench.length === 0 && (
          <div style={{
            fontSize: 10, color: C.textHint,
            padding: "8px 0",
            letterSpacing: "1.5px", textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          }}>
            Arrastra titulares para llevarlos al banco
          </div>
        )}
        {bench.map((b, i) => {
          const bSalud = b.athlete ? saludMap?.get(b.athlete.id) : null;
          const bSaludVal = bSalud?.salud ?? 100;
          const activating = dragActivating?.type === "bench" && dragActivating?.index === i;
          return (
            <BenchCard
              key={b.id}
              bench={b}
              idx={i}
              saludVal={bSaludVal}
              isDragged={isDrag?.("bench", i)}
              isActivating={activating}
              onPointerDown={e => onPointerDown?.(e, "bench", i)}
              accent={accent}
            />
          );
        })}
      </div>
    </div>
  );
}
