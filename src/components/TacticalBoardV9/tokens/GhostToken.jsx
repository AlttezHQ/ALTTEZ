/**
 * @component GhostToken
 * @description Ghost de arrastre con trail dinámico para la pizarra táctica v9.
 * Muestra el token siendo arrastrado con un efecto de estela de 3 sombras decrecientes
 * en opacidad, implementado via ring buffer de 3 posiciones.
 *
 * El ring buffer se actualiza en cada pointermove a 60fps sin re-renders de React
 * (manipulación directa de DOM). Las posiciones del trail se aplican via refs a los
 * elementos DOM de cada sombra.
 *
 * @prop {React.Ref}  ghostRef   - Ref del contenedor principal (posición actual = cursor)
 * @prop {object}     athlete    - Datos del atleta que se arrastra
 * @prop {number}     ovr        - Valor OVR calculado
 * @prop {boolean}    isDragging - Controla visibilidad del ghost
 */

"use client";

import { useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvatarUrl as avatar } from "../../../utils/helpers";
import { PALETTE as C } from "../../../constants/palette";

/** Número de sombras del trail */
const TRAIL_COUNT = 3;

/** Opacidades decrecientes para el trail [inmediato, medio, lejano] */
const TRAIL_OPACITIES = [0.30, 0.18, 0.09];

/** Tamaño del ring buffer de posiciones */
const RING_SIZE = TRAIL_COUNT + 1;

/**
 * GhostToken — componente de presentación puro.
 * El posicionamiento se gestiona externamente via refs (manipulación DOM directa).
 *
 * Pattern del ring buffer:
 * - trailDomRefs: array de refs directas a los nodos DOM de cada sombra
 * - posBuffer: ring buffer circular de posiciones [{ x, y }]
 * - bufferHead: índice del próximo slot a escribir
 */
const GhostToken = memo(function GhostToken({ ghostRef, athlete, ovr, isDragging }) {
  // Refs directas a los nodos DOM de las sombras del trail
  const trailDomRefs = useRef(new Array(TRAIL_COUNT).fill(null));
  const posBuffer = useRef(Array.from({ length: RING_SIZE }, () => ({ x: -300, y: -300 })));
  const bufferHead = useRef(0);
  const rafId = useRef(null);

  // Suscribirse al movimiento del ghost principal para actualizar el trail via RAF
  useEffect(() => {
    if (!isDragging) {
      // Reset posiciones del trail al salir del drag
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      posBuffer.current = Array.from({ length: RING_SIZE }, () => ({ x: -300, y: -300 }));
      bufferHead.current = 0;
      return;
    }

    if (!ghostRef.current) return;
    const ghostEl = ghostRef.current;

    const updateTrail = () => {
      const x = parseFloat(ghostEl.style.left) || 0;
      const y = parseFloat(ghostEl.style.top) || 0;

      // Escribir posición actual en el ring buffer
      posBuffer.current[bufferHead.current] = { x, y };
      bufferHead.current = (bufferHead.current + 1) % RING_SIZE;

      // Leer posiciones históricas y aplicar directamente al DOM
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const el = trailDomRefs.current[i];
        if (!el) continue;
        // trail[0] = posición de hace 1 frame, trail[2] = hace 3 frames
        const offset = i + 1;
        const idx = (bufferHead.current - 1 - offset + RING_SIZE) % RING_SIZE;
        const pos = posBuffer.current[idx];
        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
      }

      rafId.current = requestAnimationFrame(updateTrail);
    };

    rafId.current = requestAnimationFrame(updateTrail);
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [isDragging, ghostRef]);

  if (!athlete) return null;

  const tokenStyle = {
    width: 68,
    pointerEvents: "none",
    userSelect: "none",
    borderRadius: 3,
    overflow: "hidden",
    border: `2px solid ${C.neon}`,
    background: "rgba(5,12,5,0.92)",
  };

  return (
    <AnimatePresence>
      {isDragging && (
        <>
          {/* ── Trail shadows (posición relativa al cursor, gestionada via RAF) ── */}
          {TRAIL_OPACITIES.map((opacity, i) => (
            <div
              key={`trail-${i}`}
              ref={(el) => { trailDomRefs.current[i] = el; }}
              style={{
                position: "fixed",
                zIndex: 9997 - i,
                opacity,
                pointerEvents: "none",
                // blur progresivo: sombra más cercana = menos blur, más lejana = más blur
                filter: `blur(${(i + 1) * 1.8}px)`,
              }}
            >
              <div style={{
                ...tokenStyle,
                border: `2px solid ${C.neon}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
                boxShadow: `0 0 ${6 + i * 3}px ${C.neon}${Math.round(opacity * 180).toString(16).padStart(2, "0")}`,
              }}>
                <div style={{ height: 3, background: C.neon, opacity: opacity * 3 }} />
                <div style={{ width: 68, height: 56, overflow: "hidden" }}>
                  <img src={avatar(athlete.photo)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                </div>
              </div>
            </div>
          ))}

          {/* ── Ghost principal — sigue el cursor con spring ── */}
          <motion.div
            ref={ghostRef}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1.08 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "fixed",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            {/* OVR badge */}
            <div style={{ fontSize: 15, fontWeight: 900, color: C.neon, textShadow: `0 0 12px ${C.neon}`, lineHeight: 1, textAlign: "center", marginBottom: 2 }}>
              {ovr}
            </div>
            {/* Token con glow neón máximo */}
            <div style={{
              ...tokenStyle,
              boxShadow: `0 12px 40px rgba(0,0,0,0.95), 0 0 0 2px ${C.neon}, 0 0 24px ${C.neon}88, 0 0 48px ${C.neon}33`,
            }}>
              <div style={{ height: 3, background: C.neon }} />
              <div style={{ width: 68, height: 56, overflow: "hidden" }}>
                <img src={avatar(athlete.photo)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
              </div>
              <div style={{ padding: "3px 4px 4px", background: "rgba(0,0,0,0.85)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 8, color: C.neon, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "center", letterSpacing: "0.3px" }}>
                  {athlete.name?.split(" ").pop()}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default GhostToken;
