/**
 * @component CommandRail
 * @description Rail izquierdo del Tactical Board — zona de comando.
 * Consolida: formación (chip grande), vista (full/half), capa (normal/carga/recup.),
 * modo (lectura/edición), jugadas. Lenguaje broadcast premium.
 *
 * Props:
 *  formationKey         {string}
 *  onToggleFormations   {()=>void}
 *  showFormations       {boolean}
 *  viewMode             {"full"|"half"}
 *  onToggleViewMode     {()=>void}
 *  viewLayer            {"normal"|"heatmap"|"recovery"}
 *  onViewLayerChange    {(key)=>void}
 *  editMode             {boolean}
 *  onToggleEditMode     {()=>void}
 *  playsCount           {number}
 *  onOpenPlays          {()=>void}
 *  accent               {string}
 *
 * @version 1.0 — Broadcast Arena
 */
import { motion } from "framer-motion";
import { PALETTE as C, ELEVATION } from "../../../../shared/tokens/palette";

function RailBlock({ label, children, accent = C.blue }) {
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
        position: "absolute", top: 4, left: 4, width: 6, height: 6,
        borderTop: `1.5px solid ${accent}`, borderLeft: `1.5px solid ${accent}`,
        opacity: 0.85,
      }} />
      <div style={{
        fontSize: 8.5, fontWeight: 900,
        color: C.textMuted, letterSpacing: "2.2px",
        textTransform: "uppercase", marginBottom: 10,
        paddingLeft: 8,
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function CommandRail({
  formationKey,
  onToggleFormations,
  showFormations,
  viewMode,
  onToggleViewMode,
  viewLayer,
  onViewLayerChange,
  editMode = true,
  onToggleEditMode,
  playsCount = 0,
  onOpenPlays,
  accent = C.blue,
}) {
  return (
    <aside style={{
      width: 248, flexShrink: 0,
      background: "linear-gradient(180deg, rgba(6,10,18,0.98) 0%, rgba(4,7,14,1) 100%)",
      borderRight: `1px solid ${C.borderHi}`,
      padding: "14px 12px",
      display: "flex", flexDirection: "column", gap: 12,
      overflowY: "auto",
      boxShadow: "inset -1px 0 0 rgba(255,255,255,0.02)",
    }}>

      {/* ── Formación ── */}
      <RailBlock label="Formación" accent={accent}>
        <motion.button
          onClick={onToggleFormations}
          whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px",
            background: showFormations
              ? `linear-gradient(180deg, ${accent} 0%, ${C.blueDeep} 100%)`
              : "linear-gradient(135deg, rgba(47,107,255,0.10) 0%, rgba(10,15,26,0.96) 100%)",
            border: `1px solid ${showFormations ? accent : C.blueBorder}`,
            borderRadius: 8, cursor: "pointer",
            boxShadow: showFormations
              ? `inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 18px ${C.blueGlow}`
              : "inset 0 1px 0 rgba(255,255,255,0.04)",
            minHeight: "unset",
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{
              fontSize: 8.5, color: showFormations ? "rgba(255,255,255,0.75)" : C.blueHi,
              fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase",
            }}>
              Táctica
            </div>
            <div style={{
              fontSize: 22, fontWeight: 900, color: "white",
              letterSpacing: "2.5px", lineHeight: 1.05, marginTop: 2,
              textShadow: showFormations ? "0 1px 0 rgba(0,0,0,0.3)" : `0 0 16px ${C.blueGlow}`,
            }}>
              {formationKey}
            </div>
          </div>
          <span style={{
            fontSize: 12, color: showFormations ? "white" : C.blueHi,
            opacity: 0.9,
          }}>▾</span>
        </motion.button>
      </RailBlock>

      {/* ── Vista del campo ── */}
      <RailBlock label="Vista" accent={accent}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
        }}>
          {[
            { key: "full", label: "Full", icon: "▮▮" },
            { key: "half", label: "1/2",  icon: "▯▮" },
          ].map((v) => {
            const active = viewMode === v.key;
            return (
              <button
                key={v.key}
                onClick={() => { if (viewMode !== v.key) onToggleViewMode?.(); }}
                style={{
                  padding: "10px 8px",
                  background: active
                    ? `linear-gradient(180deg, ${accent} 0%, ${C.blueDeep} 100%)`
                    : "rgba(10,15,26,0.6)",
                  border: `1px solid ${active ? accent : C.border}`,
                  borderRadius: 6, cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  boxShadow: active
                    ? `inset 0 1px 0 rgba(255,255,255,0.22), 0 3px 10px ${C.blueGlow}`
                    : "inset 0 1px 0 rgba(255,255,255,0.03)",
                  minHeight: "unset",
                  transition: "background 140ms",
                }}
              >
                <span style={{
                  fontSize: 12, letterSpacing: "2px",
                  color: active ? "white" : C.textMuted,
                }}>
                  {v.icon}
                </span>
                <span style={{
                  fontSize: 8.5, fontWeight: 900,
                  color: active ? "white" : C.textMuted,
                  letterSpacing: "1.5px", textTransform: "uppercase",
                  fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                }}>
                  {v.label}
                </span>
              </button>
            );
          })}
        </div>
      </RailBlock>

      {/* ── Capa de lectura ── */}
      <RailBlock label="Capa" accent={accent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { key: "normal",   label: "Normal", hint: "Vista estándar"   },
            { key: "heatmap",  label: "Carga",  hint: "ACWR · Sobrecarga" },
            { key: "recovery", label: "Recup.", hint: "Wellness · RPE"    },
          ].map(({ key, label, hint }) => {
            const active = viewLayer === key;
            return (
              <button
                key={key}
                onClick={() => onViewLayerChange?.(key)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px",
                  background: active
                    ? "linear-gradient(90deg, rgba(47,107,255,0.22) 0%, rgba(47,107,255,0.04) 100%)"
                    : "rgba(10,15,26,0.5)",
                  border: `1px solid ${active ? C.blueBorder : C.border}`,
                  borderLeft: active ? `3px solid ${accent}` : `3px solid transparent`,
                  borderRadius: 6, cursor: "pointer", textAlign: "left",
                  transition: "all 140ms",
                  minHeight: "unset",
                }}
              >
                <div>
                  <div style={{
                    fontSize: 9.5, fontWeight: 900,
                    color: active ? "white" : "rgba(240,244,248,0.75)",
                    letterSpacing: "1.4px", textTransform: "uppercase",
                    fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: 8, fontWeight: 600,
                    color: C.textHint, marginTop: 2,
                    letterSpacing: "0.8px",
                  }}>
                    {hint}
                  </div>
                </div>
                {active && (
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: accent,
                    boxShadow: `0 0 8px ${C.blueGlow}`,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </RailBlock>

      {/* ── Modo ── */}
      <RailBlock label="Modo" accent={accent}>
        <div style={{
          display: "flex",
          padding: 3, gap: 2,
          background: "rgba(4,6,16,0.7)",
          border: `1px solid ${C.border}`,
          borderRadius: 8,
        }}>
          {[
            { key: true,  label: "Edición"  },
            { key: false, label: "Lectura" },
          ].map(({ key, label }) => {
            const active = editMode === key;
            return (
              <button
                key={String(key)}
                onClick={() => { if (editMode !== key) onToggleEditMode?.(); }}
                style={{
                  flex: 1,
                  padding: "8px 6px",
                  background: active
                    ? `linear-gradient(180deg, ${accent} 0%, ${C.blueDeep} 100%)`
                    : "transparent",
                  border: "none",
                  borderRadius: 5, cursor: "pointer",
                  color: active ? "white" : C.textMuted,
                  fontSize: 9, fontWeight: 900,
                  letterSpacing: "1.6px", textTransform: "uppercase",
                  fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                  boxShadow: active
                    ? `inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 8px ${C.blueGlow}`
                    : "none",
                  minHeight: "unset",
                  transition: "background 140ms",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </RailBlock>

      {/* ── Jugadas ── */}
      <motion.button
        onClick={onOpenPlays}
        whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
        style={{
          position: "relative",
          padding: "12px 14px",
          background: "linear-gradient(135deg, rgba(47,107,255,0.14) 0%, rgba(10,15,26,0.94) 100%)",
          border: `1px solid ${C.blueBorder}`,
          borderRadius: 10, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          minHeight: "unset",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <span style={{
          position: "absolute", top: 4, left: 4, width: 6, height: 6,
          borderTop: `1.5px solid ${accent}`, borderLeft: `1.5px solid ${accent}`,
          opacity: 0.85,
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke={C.blueHi} strokeWidth="1.8"/>
            <circle cx="12" cy="12" r="3" fill={C.blueHi} />
          </svg>
          <div style={{ textAlign: "left" }}>
            <div style={{
              fontSize: 10, fontWeight: 900, color: "white",
              letterSpacing: "1.8px", textTransform: "uppercase",
              fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
              textShadow: `0 0 10px ${C.blueGlow}`,
            }}>
              Jugadas
            </div>
            <div style={{
              fontSize: 8, color: C.textHint, marginTop: 2,
              letterSpacing: "1.1px", textTransform: "uppercase",
              fontWeight: 700,
            }}>
              Captura · Carga
            </div>
          </div>
        </div>
        {playsCount > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 900, color: "white",
            background: accent,
            padding: "2px 8px", borderRadius: 999,
            letterSpacing: "0.5px",
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            boxShadow: `0 0 10px ${C.blueGlow}`,
          }}>
            {playsCount}
          </span>
        )}
      </motion.button>

    </aside>
  );
}
