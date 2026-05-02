/**
 * @component PlayLibraryOverlay
 * @description Overlay broadcast para capturar, listar y recuperar "Jugadas"
 * guardadas de la pizarra táctica (starters + formación + drawings).
 *
 * Se persiste en localStorage bajo `alttez_plays_v1{ns}`.
 * Cada jugada: { id, name, formationKey, starters, drawings, createdAt }
 *
 * Props:
 *  open         {boolean}
 *  onClose      {()=>void}
 *  plays        {Array<Play>}
 *  onCapture    {(name: string)=>void}   Guarda la jugada actual
 *  onLoad       {(play: Play)=>void}
 *  onDelete     {(id: string)=>void}
 *  accent       {string}   default: PALETTE.bronce
 *
 * @version 1.0 — Broadcast Arena
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE as C, ELEVATION, BROADCAST_GRADIENT } from "../tokens/palette";

const SPRING = { type: "spring", stiffness: 360, damping: 28 };

export default function PlayLibraryOverlay({
  open,
  onClose,
  plays = [],
  onCapture,
  onLoad,
  onDelete,
  accent = C.blue,
}) {
  const [name, setName] = useState("");

  const handleCapture = () => {
    const clean = (name || "").trim() || `Jugada ${plays.length + 1}`;
    onCapture?.(clean);
    setName("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          style={{
            position: "absolute", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 18,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={SPRING}
            onClick={e => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 560,
              maxHeight: "84vh",
              background: BROADCAST_GRADIENT.stat,
              border: `1px solid ${C.borderHi}`,
              borderRadius: 12,
              boxShadow: ELEVATION.panel,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top sweep */}
            <span style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, ${accent}00 0%, ${accent} 20%, ${C.blueHi} 50%, ${accent} 80%, ${accent}00 100%)`,
              boxShadow: `0 0 14px ${accent}88`,
            }} />
            <span style={{
              position: "absolute", top: 3, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0) 100%)",
              pointerEvents: "none",
            }} />

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              padding: "18px 20px 14px",
              borderBottom: `1px solid ${C.borderHi}`,
              position: "relative",
            }}>
              <span style={{
                position: "absolute", top: 10, left: 10, width: 6, height: 6,
                borderTop: `1.5px solid ${accent}`, borderLeft: `1.5px solid ${accent}`, opacity: 0.8,
              }} />
              <div style={{ paddingLeft: 8 }}>
                <div style={{
                  fontSize: 13, fontWeight: 900, color: "white",
                  textTransform: "uppercase", letterSpacing: "2.5px",
                  fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                  textShadow: `0 0 16px ${C.blueGlow}`,
                }}>
                  Librería de jugadas
                </div>
                <div style={{
                  fontSize: 9.5, color: C.textMuted, marginTop: 5,
                  letterSpacing: "1.5px", textTransform: "uppercase",
                  fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                  fontWeight: 700,
                }}>
                  Captura la pizarra actual · Restaura con un clic
                </div>
              </div>
              <button onClick={onClose} aria-label="Cerrar" style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 6,
                color: C.textMuted, padding: "4px 10px",
                cursor: "pointer", fontWeight: 700, fontSize: 14,
                minHeight: "unset",
              }}>✕</button>
            </div>

            {/* Capture row */}
            <div style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${C.border}`,
              background: "rgba(4,6,16,0.4)",
              display: "flex", gap: 10, alignItems: "center",
            }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleCapture(); }}
                placeholder="Nombre de la jugada"
                className="field-input"
                style={{
                  flex: 1, fontSize: 12,
                  padding: "10px 12px",
                  letterSpacing: "0.3px",
                }}
              />
              <button
                onClick={handleCapture}
                style={{
                  padding: "10px 18px",
                  background: `linear-gradient(180deg, ${accent} 0%, ${accent} 60%, ${C.blueDeep} 100%)`,
                  border: `1px solid ${accent}`,
                  borderRadius: 6,
                  color: "white",
                  fontSize: 10, fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: "1.6px",
                  cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 14px ${C.blueGlow}`,
                  textShadow: "0 1px 0 rgba(0,0,0,0.25)",
                }}
              >
                Capturar ●
              </button>
            </div>

            {/* Plays list */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "12px 14px 18px",
            }}>
              {plays.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "40px 16px",
                  fontSize: 11, color: C.textMuted,
                  letterSpacing: "1.5px", textTransform: "uppercase",
                  fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
                  fontWeight: 700,
                }}>
                  Sin jugadas guardadas<br />
                  <span style={{ fontSize: 9, color: C.textHint, fontWeight: 600 }}>
                    Captura la formación actual para comenzar
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {plays.map(p => (
                    <PlayRow
                      key={p.id}
                      play={p}
                      onLoad={() => onLoad?.(p)}
                      onDelete={() => onDelete?.(p.id)}
                      accent={accent}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlayRow({ play, onLoad, onDelete, accent }) {
  const date = play.createdAt
    ? new Date(play.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";
  return (
    <div style={{
      position: "relative",
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 14px 11px 16px",
      background: "linear-gradient(135deg, rgba(47,107,255,0.06) 0%, rgba(10,15,26,0.92) 100%)",
      border: `1px solid ${C.borderHi}`,
      borderRadius: 8,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      overflow: "hidden",
    }}>
      <span style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 2,
        background: `linear-gradient(180deg, ${accent}00, ${C.blueHi}, ${accent}00)`,
        boxShadow: `0 0 8px ${C.blueGlow}`,
      }} />
      <div style={{
        padding: "3px 8px",
        background: "rgba(47,107,255,0.14)",
        border: `1px solid ${C.blueBorder}`,
        borderRadius: 4,
        fontSize: 9, fontWeight: 900, color: C.blueHi,
        textTransform: "uppercase", letterSpacing: "1.4px",
        fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
        flexShrink: 0,
      }}>
        {play.formationKey || "—"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: "white",
          letterSpacing: "0.6px",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          textTransform: "uppercase",
        }}>
          {play.name}
        </div>
        {date && (
          <div style={{
            fontSize: 8.5, color: C.textMuted, marginTop: 3,
            letterSpacing: "1.5px", textTransform: "uppercase",
            fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
            fontWeight: 700,
          }}>
            {date}
          </div>
        )}
      </div>
      <button
        onClick={onLoad}
        style={{
          padding: "6px 12px",
          background: "rgba(47,107,255,0.12)",
          border: `1px solid ${C.blueBorder}`,
          borderRadius: 5,
          color: C.blueHi, fontSize: 9, fontWeight: 800,
          textTransform: "uppercase", letterSpacing: "1.4px",
          cursor: "pointer", whiteSpace: "nowrap",
          fontFamily: '"Orbitron","Exo 2",Arial,sans-serif',
          minHeight: "unset",
        }}
      >
        Cargar
      </button>
      <button
        onClick={onDelete}
        aria-label="Eliminar"
        style={{
          padding: "6px 9px",
          background: "rgba(239,68,68,0.08)",
          border: `1px solid ${C.danger}44`,
          borderRadius: 5,
          color: C.danger, fontSize: 11, fontWeight: 800,
          cursor: "pointer",
          minHeight: "unset",
        }}
      >
        ✕
      </button>
    </div>
  );
}
