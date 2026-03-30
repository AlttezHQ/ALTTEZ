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
const GhostToken = memo(function GhostToken({ ghostRef, athlete, ovr: _ovr, isDragging }) {
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

  const apellido = athlete.name?.split(" ").pop() || "";

  /** Circular disc style — mirrors PlayerToken */
  const circleStyle = {
    width: 50,
    height: 50,
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid rgba(255,255,255,0.7)",
    background: "rgba(10,15,10,0.9)",
    pointerEvents: "none",
    userSelect: "none",
    flexShrink: 0,
  };

  return (
    <AnimatePresence>
      {isDragging && (
        <>
          {/* ── Trail shadows — circular, reduced intensity ── */}
          {TRAIL_OPACITIES.map((opacity, i) => (
            <div
              key={`trail-${i}`}
              ref={(el) => { trailDomRefs.current[i] = el; }}
              style={{
                position: "fixed",
                zIndex: 9997 - i,
                opacity,
                pointerEvents: "none",
                filter: `blur(${(i + 1) * 2.2}px)`,
              }}
            >
              <div style={{
                ...circleStyle,
                border: `2px solid rgba(255,255,255,${(opacity * 0.7).toFixed(2)})`,
                boxShadow: `0 4px 16px rgba(0,0,0,0.6)`,
              }}>
                <img
                  src={avatar(athlete.photo)}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
              </div>
            </div>
          ))}

          {/* ── Ghost principal — circular photo, sigue el cursor ── */}
          <motion.div
            ref={ghostRef}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "fixed",
              zIndex: 9999,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            {/* Circular photo */}
            <div style={{
              ...circleStyle,
              boxShadow: "0 8px 32px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.5)",
            }}>
              <img
                src={avatar(athlete.photo)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
              />
            </div>
            {/* Apellido */}
            <div style={{
              fontSize: 8,
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              textShadow: "0 1px 4px rgba(0,0,0,0.95)",
              whiteSpace: "nowrap",
              maxWidth: 60,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {apellido.length > 7 ? apellido.slice(0, 7) : apellido}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default GhostToken;
