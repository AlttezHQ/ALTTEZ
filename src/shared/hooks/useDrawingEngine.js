/**
 * @hook useDrawingEngine
 * @description Motor de estado para la capa de dibujo vectorial de la pizarra táctica.
 * Gestiona flechas, zonas de presión y líneas de corte sobre el campo SVG.
 *
 * Todos los trazados se guardan en localStorage para persistir entre recargas.
 * La capa de dibujo opera en coordenadas porcentuales (0-100) relativas al campo,
 * independiente del tamaño real del DOM — iguales que las coordenadas de los tokens.
 *
 * @param {string} [storageKey="alttez_tactical_drawings_v1"]
 * @returns {object} drawingState + handlers
 */
import { useState, useCallback, useRef } from "react";

const BASE_STORAGE_KEY = "alttez_tactical_drawings_v1";

/** Genera la clave de localStorage con namespace de club para aislamiento multi-tenancy */
function getStorageKey(clubId) {
  return clubId ? `${BASE_STORAGE_KEY}_${clubId}` : BASE_STORAGE_KEY;
}

/** Lee trazados del localStorage con fallback seguro */
function loadDrawings(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Escribe trazados al localStorage */
function saveDrawings(storageKey, drawings) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(drawings));
  } catch {
    // Ignorar errores de cuota — los trazados son efímeros
  }
}

/** Genera un ID único para cada trazado */
function uid() {
  return `draw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Tipos de herramienta disponibles.
 * @typedef {"arrow" | "curve" | "zone" | "cut" | "free" | "eraser" | null} DrawTool
 */

/**
 * Colores neón disponibles para los trazados.
 */
export const DRAW_COLORS = [
  { id: "neon",   hex: "#22C55E", label: "Neon Green"   },
  { id: "violet", hex: "#8B5CF6", label: "Violet"       },
  { id: "amber",  hex: "#EF9F27", label: "Amber"        },
  { id: "danger", hex: "#E24B4A", label: "Red"          },
  { id: "ice",    hex: "#00E5FF", label: "Ice Blue"     },
];

/**
 * @param {string} [clubId] - ID del club para namespace de localStorage (multi-tenancy).
 *   Requerido en producción para aislar trazados entre clubs en dispositivos compartidos.
 *   Si no se provee, usa la clave global (solo válido en dev/testing).
 */
export default function useDrawingEngine(clubId) {
  const storageKey = getStorageKey(clubId);
  const [drawings, setDrawings] = useState(() => loadDrawings(storageKey));
  const [activeTool, setActiveTool] = useState(null);
  const [activeColor, setActiveColor] = useState(DRAW_COLORS[0].hex);
  const [inProgress, setInProgress] = useState(null); // trazado en curso (antes de confirmar)

  // Ref para el contenedor del campo — se asigna externamente via drawRef
  const drawRef = useRef(null);

  /**
   * Convierte coordenadas de cliente (px) a unidades del campo SVG.
   * El DrawingLayer usa viewBox "0 0 105 68" (proporciones reales FIFA landscape).
   * Los trazados se almacenan en estas unidades para ser independientes del tamaño DOM.
   */
  const clientToField = useCallback((clientX, clientY) => {
    if (!drawRef.current) return { x: 0, y: 0 };
    const rect = drawRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(105, ((clientX - rect.left) / rect.width) * 105)),
      y: Math.max(0, Math.min(68,  ((clientY - rect.top)  / rect.height) * 68)),
    };
  }, []);

  // ── Pointer Down: inicia un nuevo trazado ────────────────────────────────────
  const handleDrawPointerDown = useCallback((e) => {
    if (!activeTool || activeTool === "eraser") return;
    e.preventDefault();
    e.stopPropagation();

    const { x, y } = clientToField(e.clientX, e.clientY);

    if (activeTool === "zone") {
      // Zona: el pointerDown marca el origen, pointerMove define el tamaño
      setInProgress({ id: uid(), type: "zone", color: activeColor, x1: x, y1: y, x2: x, y2: y });
    } else if (activeTool === "arrow" || activeTool === "cut") {
      // Flecha/corte: primer punto = origen, pointerUp = destino
      setInProgress({ id: uid(), type: activeTool, color: activeColor, x1: x, y1: y, x2: x, y2: y });
    } else if (activeTool === "curve") {
      // Curva: bezier cuadrática via punto de control automático (perpendicular al medio)
      setInProgress({ id: uid(), type: "curve", color: activeColor, x1: x, y1: y, cx: x, cy: y, x2: x, y2: y, phase: 1 });
    } else if (activeTool === "free") {
      // Trazo libre: acumula puntos en un array hasta pointerUp
      setInProgress({ id: uid(), type: "free", color: activeColor, points: [{ x, y }] });
    }
  }, [activeTool, activeColor, clientToField]);

  // ── Pointer Move: actualiza el trazado en curso ──────────────────────────────
  const handleDrawPointerMove = useCallback((e) => {
    if (!inProgress) return;
    e.preventDefault();
    const { x, y } = clientToField(e.clientX, e.clientY);

    setInProgress((prev) => {
      if (!prev) return null;
      if (prev.type === "zone") {
        return { ...prev, x2: x, y2: y };
      }
      if (prev.type === "arrow" || prev.type === "cut") {
        return { ...prev, x2: x, y2: y };
      }
      if (prev.type === "curve" && prev.phase === 1) {
        // Control point = punto medio entre origen y cursor, desplazado perpendicular
        const mx = (prev.x1 + x) / 2;
        const my = (prev.y1 + y) / 2;
        const dx = x - prev.x1;
        const dy = y - prev.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        // Perpendicular normalizada con curvatura del 25%
        const cx = len > 0 ? mx - (dy / len) * len * 0.25 : mx;
        const cy = len > 0 ? my + (dx / len) * len * 0.25 : my;
        return { ...prev, x2: x, y2: y, cx, cy };
      }
      if (prev.type === "free") {
        // Acumular punto con threshold mínimo (evitar duplicados)
        const last = prev.points[prev.points.length - 1];
        const dx = x - last.x;
        const dy = y - last.y;
        if (dx * dx + dy * dy < 0.5) return prev; // menos de 0.7% de campo — ignorar
        return { ...prev, points: [...prev.points, { x, y }] };
      }
      return prev;
    });
  }, [inProgress, clientToField]);

  // ── Pointer Up: confirma el trazado ─────────────────────────────────────────
  const handleDrawPointerUp = useCallback((e) => {
    if (!inProgress) return;
    e.preventDefault();
    const { x, y } = clientToField(e.clientX, e.clientY);

    // Trazado libre: confirmar si tiene suficientes puntos
    if (inProgress.type === "free") {
      if (inProgress.points.length < 3) {
        setInProgress(null);
        return;
      }
      const finalPoints = [...inProgress.points, { x, y }];
      const finalDrawing = { ...inProgress, points: finalPoints };
      const updated = [...drawings, finalDrawing];
      setDrawings(updated);
      saveDrawings(storageKey, updated);
      setInProgress(null);
      return;
    }

    // Ignorar trazados demasiado pequeños (clicks accidentales)
    const dx = x - inProgress.x1;
    const dy = y - inProgress.y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2.5 && inProgress.type !== "zone") {
      setInProgress(null);
      return;
    }

    const finalDrawing = { ...inProgress, x2: x, y2: y };
    const updated = [...drawings, finalDrawing];
    setDrawings(updated);
    saveDrawings(storageKey, updated);
    setInProgress(null);
  }, [inProgress, drawings, clientToField, storageKey]);

  // ── Eraser: elimina el trazado clickeado ────────────────────────────────────
  const handleEraseDrawing = useCallback((drawId) => {
    const updated = drawings.filter((d) => d.id !== drawId);
    setDrawings(updated);
    saveDrawings(storageKey, updated);
  }, [drawings, storageKey]);

  // ── Limpiar todos los trazados ───────────────────────────────────────────────
  const clearAllDrawings = useCallback(() => {
    setDrawings([]);
    saveDrawings(storageKey, []);
    setInProgress(null);
  }, [storageKey]);

  const replaceDrawings = useCallback((next) => {
    const safe = Array.isArray(next) ? next : [];
    setDrawings(safe);
    saveDrawings(storageKey, safe);
    setInProgress(null);
  }, [storageKey]);

  return {
    drawings,
    inProgress,
    activeTool,
    setActiveTool,
    activeColor,
    setActiveColor,
    drawRef,
    handleDrawPointerDown,
    handleDrawPointerMove,
    handleDrawPointerUp,
    handleEraseDrawing,
    clearAllDrawings,
    replaceDrawings,
  };
}
