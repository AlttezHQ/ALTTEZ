/**
 * @component DrawingToolbar
 * @description Rail vertical de herramientas de dibujo — v9.2 LEFT RAIL.
 * Anclada al borde izquierdo del pitch stage, tools apilados en columna,
 * panel de colores que se despliega hacia la derecha.
 *
 * @prop {object}   drawingEngine - Retorno de useDrawingEngine()
 * @prop {Function} onClearAll    - Callback para "Limpiar todo"
 */

"use client";

import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DRAW_COLORS } from "../../../../shared/hooks/useDrawingEngine";

/** Definiciones de herramientas */
const TOOLS = [
  {
    id: "arrow",
    label: "Flecha",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <line x1="3" y1="15" x2="15" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15 3 L10 3 M15 3 L15 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "curve",
    label: "Curva",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M3 15 Q9 3 15 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M15 6 L11 4 M15 6 L14 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "zone",
    label: "Zona",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <ellipse cx="9" cy="9" rx="6.5" ry="4.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <text x="9" y="12" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="700">P</text>
      </svg>
    ),
  },
  {
    id: "cut",
    label: "Corte",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 2" />
        <circle cx="3" cy="9" r="1.5" fill="currentColor" />
        <circle cx="15" cy="9" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "free",
    label: "Libre",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M3 14 C5 10, 7 12, 9 8 C11 4, 13 6, 15 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "eraser",
    label: "Borrar",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M10 4 L14 8 L7 15 L3 15 L3 11 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
        <line x1="8" y1="6" x2="12" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="3" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M5 3 L6 1 L10 1 L11 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="0.4" />
    <path d="M4 5 L4.5 14 L11.5 14 L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="7" y1="7" x2="7" y2="12" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
    <line x1="9" y1="7" x2="9" y2="12" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const DrawingToolbar = memo(function DrawingToolbar({ drawingEngine, onClearAll }) {
  const { activeTool, setActiveTool, activeColor, setActiveColor } = drawingEngine;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToolClick = (toolId) => {
    setActiveTool((prev) => (prev === toolId ? null : toolId));
    if (!isExpanded) setIsExpanded(true);
  };

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: 10,
      transform: "translateY(-50%)",
      zIndex: 20,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      pointerEvents: "none",
    }}>

      {/* Rail vertical principal */}
      <div style={{
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        background: "rgba(5,8,16,0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 28,
        padding: "8px 5px",
        boxShadow: "6px 0 22px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
      }}>
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <motion.div
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              title={tool.label}
              style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: isActive
                  ? `linear-gradient(135deg, ${activeColor}28, ${activeColor}0e)`
                  : "transparent",
                border: isActive
                  ? `1.5px solid ${activeColor}`
                  : "1px solid transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: isActive ? activeColor : "rgba(255,255,255,0.45)",
                transition: "background 0.12s, border 0.12s, color 0.12s",
                flexShrink: 0,
              }}
            >
              {tool.icon}
            </motion.div>
          );
        })}

        {/* Separador horizontal */}
        <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.1)", margin: "3px 0", flexShrink: 0 }} />

        {/* Botón toggle paleta de colores */}
        <motion.div
          onClick={() => setIsExpanded(v => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          title={isExpanded ? "Cerrar colores" : "Colores"}
          style={{
            width: 36, height: 36,
            borderRadius: "50%",
            background: isExpanded ? `${activeColor}18` : "transparent",
            border: isExpanded ? `1.5px solid ${activeColor}66` : "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.14s",
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 14, height: 14,
            borderRadius: "50%",
            background: activeColor,
            border: "1.5px solid rgba(255,255,255,0.55)",
          }} />
        </motion.div>
      </div>

      {/* Panel de colores expandido — a la derecha */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            style={{
              pointerEvents: "auto",
              background: "rgba(5,8,16,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10,
              padding: "6px 6px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              boxShadow: "6px 0 28px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {DRAW_COLORS.map((c) => {
              const isSelected = activeColor === c.hex;
              return (
                <motion.div
                  key={c.id}
                  onClick={() => setActiveColor(c.hex)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.88 }}
                  title={c.label}
                  style={{
                    width: 30, height: 30,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    borderRadius: 6,
                    background: isSelected ? `${c.hex}14` : "transparent",
                  }}
                >
                  <div style={{
                    width: isSelected ? 18 : 14,
                    height: isSelected ? 18 : 14,
                    borderRadius: "50%",
                    background: c.hex,
                    border: isSelected ? `2px solid rgba(255,255,255,0.75)` : "1.5px solid transparent",
                    boxShadow: isSelected ? `0 0 6px ${c.hex}88` : "none",
                    transition: "all 0.12s",
                  }} />
                </motion.div>
              );
            })}

            {/* Separador horizontal */}
            <div style={{ width: 22, height: 1, background: "rgba(255,255,255,0.1)", margin: "2px auto", flexShrink: 0 }} />

            {/* Limpiar todo */}
            <motion.div
              onClick={onClearAll}
              whileHover={{ scale: 1.12, background: "rgba(226,75,74,0.18)" }}
              whileTap={{ scale: 0.9 }}
              title="Limpiar todos los trazados"
              style={{
                width: 30, height: 30,
                borderRadius: 6,
                background: "rgba(226,75,74,0.08)",
                border: "1px solid rgba(226,75,74,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#E24B4A",
                transition: "background 0.14s",
              }}
            >
              <TrashIcon />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default DrawingToolbar;
