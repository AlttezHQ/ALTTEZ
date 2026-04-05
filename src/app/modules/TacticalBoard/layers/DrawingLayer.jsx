/**
 * @component DrawingLayer
 * @description Capa 3 de la pizarra táctica v9.
 * Renderiza los trazados vectoriales (flechas, zonas de presión, líneas de corte)
 * sobre el campo en un SVG absoluto de cobertura completa.
 *
 * Consume el estado de useDrawingEngine para renderizar trazados confirmados
 * y el trazado en curso (preview en tiempo real mientras el usuario dibuja).
 *
 * Cuando una herramienta está activa, este layer captura todos los pointer events
 * para evitar que los tokens del campo reciban clicks accidentalmente.
 *
 * @prop {object}   drawingEngine  - Retorno de useDrawingEngine()
 * @prop {boolean}  isActive       - True cuando hay una herramienta de dibujo activa
 */

"use client";

import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Arrowhead marker SVG ────────────────────────────────────────────────────────
// Se genera dinámicamente por color para evitar mezcla de colores
function ArrowMarker({ id, color }) {
  return (
    <marker
      id={id}
      markerWidth="8"
      markerHeight="8"
      refX="6"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M0,0 L0,6 L8,3 z" fill={color} />
    </marker>
  );
}

// ── Cálculo de la longitud del path para animación dashoffset ──────────────────
function lineLength(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function bezierLength(x1, y1, cx, cy, x2, y2) {
  // Aproximación: longitud de la curva bezier cuadrática via 20 muestras
  let len = 0;
  let px = x1; let py = y1;
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    const bx = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2;
    const by = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t ** 2 * y2;
    len += Math.sqrt((bx - px) ** 2 + (by - py) ** 2);
    px = bx; py = by;
  }
  return len;
}

// ── Componente individual por trazado ──────────────────────────────────────────
const DrawingElement = memo(function DrawingElement({ drawing, onErase, isEraser }) {
  const { id, type, color, x1, y1, x2, y2, cx, cy } = drawing;
  const markerId = `arrow-${id}`;

  const handleClick = useCallback((e) => {
    if (isEraser) {
      e.stopPropagation();
      onErase(id);
    }
  }, [isEraser, onErase, id]);

  const strokeProps = {
    stroke: color,
    strokeWidth: type === "zone" ? "0" : type === "cut" ? "0.8" : "1.2",
    fill: "none",
    strokeLinecap: "round",
    style: { cursor: isEraser ? "not-allowed" : "default" },
    onClick: handleClick,
  };

  if (type === "arrow") {
    const len = lineLength(x1, y1, x2, y2);
    return (
      <g>
        <defs><ArrowMarker id={markerId} color={color} /></defs>
        <motion.line
          x1={x1} y1={y1} x2={x2} y2={y2}
          {...strokeProps}
          markerEnd={`url(#${markerId})`}
          filter={`drop-shadow(0 0 3px ${color}88)`}
          // Animación de dibujado via stroke-dashoffset
          initial={{ strokeDashoffset: len, strokeDasharray: len }}
          animate={{ strokeDashoffset: 0, strokeDasharray: len }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </g>
    );
  }

  if (type === "curve") {
    const d = `M ${x1} ${y1} Q ${cx ?? (x1 + x2) / 2} ${cy ?? (y1 + y2) / 2} ${x2} ${y2}`;
    const len = bezierLength(x1, y1, cx ?? (x1 + x2) / 2, cy ?? (y1 + y2) / 2, x2, y2);
    return (
      <g>
        <defs><ArrowMarker id={markerId} color={color} /></defs>
        <motion.path
          d={d}
          {...strokeProps}
          markerEnd={`url(#${markerId})`}
          filter={`drop-shadow(0 0 3px ${color}88)`}
          initial={{ strokeDashoffset: len, strokeDasharray: len }}
          animate={{ strokeDashoffset: 0, strokeDasharray: len }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </g>
    );
  }

  if (type === "cut") {
    // Línea de corte: discontinua, color danger
    const len = lineLength(x1, y1, x2, y2);
    return (
      <motion.line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth="1.0"
        strokeLinecap="round"
        strokeDasharray="3 2"
        fill="none"
        filter={`drop-shadow(0 0 2px ${color}66)`}
        style={{ cursor: isEraser ? "not-allowed" : "default" }}
        onClick={handleClick}
        initial={{ strokeDashoffset: len, strokeDasharray: `3 2` }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.5, ease: "linear" }}
      />
    );
  }

  if (type === "zone") {
    // Zona de presión: ellipse semitransparente con borde neón
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    const ex = Math.min(x1, x2) + rx;
    const ey = Math.min(y1, y2) + ry;
    if (rx < 1 || ry < 1) return null;
    return (
      <motion.ellipse
        cx={ex} cy={ey} rx={rx} ry={ry}
        fill={`${color}22`}
        stroke={color}
        strokeWidth="0.7"
        filter={`drop-shadow(0 0 4px ${color}66)`}
        style={{ cursor: isEraser ? "not-allowed" : "default" }}
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    );
  }

  if (type === "free" && drawing.points?.length > 1) {
    // Trazo libre: polyline suavizada con los puntos acumulados
    const pts = drawing.points;
    // Construir SVG path via catmull-rom simplificado (lineal con redondeo)
    const d = pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
      const prev = pts[i - 1];
      // Control points para suavizado (bezier cúbico)
      const cp1x = (prev.x + p.x) / 2;
      const cp1y = prev.y;
      const cp2x = (prev.x + p.x) / 2;
      const cp2y = p.y;
      return `${acc} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    }, "");
    return (
      <motion.path
        d={d}
        stroke={color}
        strokeWidth="1.0"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`drop-shadow(0 0 3px ${color}88)`}
        style={{ cursor: isEraser ? "not-allowed" : "default" }}
        onClick={handleClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    );
  }

  return null;
});

// ── Preview del trazado en curso — memo para evitar re-renders en pointermove ──
// Fix QA-005: sin memo, InProgressElement re-renderiza con cada estado de drawings
const InProgressElement = memo(function InProgressElement({ drawing }) {
  if (!drawing) return null;
  const { type, color, x1, y1, x2, y2, cx, cy } = drawing;

  const previewStyle = {
    stroke: color,
    strokeWidth: "1.0",
    fill: "none",
    opacity: 0.65,
    strokeDasharray: "4 3",
  };

  if (type === "arrow" || type === "cut") {
    return <line x1={x1} y1={y1} x2={x2} y2={y2} {...previewStyle} />;
  }
  if (type === "curve") {
    const d = `M ${x1} ${y1} Q ${cx ?? (x1 + x2) / 2} ${cy ?? (y1 + y2) / 2} ${x2} ${y2}`;
    return <path d={d} {...previewStyle} />;
  }
  if (type === "zone") {
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    if (rx < 0.5 || ry < 0.5) return null;
    const ex = Math.min(x1, x2) + rx;
    const ey = Math.min(y1, y2) + ry;
    return (
      <ellipse
        cx={ex} cy={ey} rx={rx} ry={ry}
        fill={`${color}18`}
        stroke={color}
        strokeWidth="0.6"
        strokeDasharray="3 2"
        opacity={0.7}
      />
    );
  }
  if (type === "free" && drawing.points?.length > 1) {
    const pts = drawing.points;
    const d = pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
      return `${acc} L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    }, "");
    return (
      <path
        d={d}
        stroke={color}
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.6}
        strokeDasharray="2 1"
      />
    );
  }
  return null;
});

// ── Componente principal ───────────────────────────────────────────────────────
const DrawingLayer = memo(function DrawingLayer({ drawingEngine, isActive }) {
  const {
    drawings,
    inProgress,
    activeTool,
    drawRef,
    handleDrawPointerDown,
    handleDrawPointerMove,
    handleDrawPointerUp,
    handleEraseDrawing,
  } = drawingEngine;

  const isEraser = activeTool === "eraser";

  return (
    <svg
      ref={drawRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        // Captura eventos cuando herramienta activa; pasa a través cuando inactivo
        pointerEvents: isActive ? "all" : "none",
        cursor: isEraser ? "not-allowed" : isActive ? "crosshair" : "default",
        zIndex: 10,
        overflow: "visible",
      }}
      viewBox="0 0 105 68"
      preserveAspectRatio="none"
      onPointerDown={isActive ? handleDrawPointerDown : undefined}
      onPointerMove={isActive ? handleDrawPointerMove : undefined}
      onPointerUp={isActive ? handleDrawPointerUp : undefined}
    >
      {/* Trazados confirmados */}
      <AnimatePresence>
        {drawings.map((d) => (
          <DrawingElement
            key={d.id}
            drawing={d}
            onErase={handleEraseDrawing}
            isEraser={isEraser}
          />
        ))}
      </AnimatePresence>

      {/* Trazado en curso (preview) */}
      <InProgressElement drawing={inProgress} />
    </svg>
  );
});

export default DrawingLayer;
