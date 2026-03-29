/**
 * @hook useDragEngine
 * @description Extrae y encapsula todo el motor de drag & drop de la pizarra táctica.
 * Implementa el patrón long-press 150ms para distinguir drag de scroll en touch.
 *
 * Responsabilidades:
 * - Gestionar el estado de drag (info, activating, nearTarget)
 * - Manejar pointer events (down, move, up) con cleanup correcto
 * - Calcular el snap al token más cercano en el campo
 * - Proporcionar callbacks para los componentes de token y campo
 *
 * @param {object} options
 * @param {React.RefObject} options.fieldRef       - Ref al contenedor del campo
 * @param {React.RefObject} options.startersRef    - Ref al array de starters (mutable)
 * @param {React.RefObject} options.benchRef       - Ref al array de bench (mutable)
 * @param {Function}        options.onSwapStarters - Callback(indexA, indexB)
 * @param {Function}        options.onBenchToField - Callback(benchIdx, fieldIdx)
 * @param {Function}        options.onFieldFreePos - Callback(fieldIdx, pctX, pctY)
 * @returns {object} dragState + handlers
 */
import { useState, useRef, useCallback, useEffect } from "react";

/** Umbral de movimiento en px antes de cancelar long-press */
const MOVE_CANCEL_THRESHOLD = 5;
/** Duración del long-press en ms antes de activar el drag */
const LONG_PRESS_DURATION = 150;
/** Radio de snap: distancia en % del campo para snap al token más cercano */
const SNAP_RADIUS = 10;

export default function useDragEngine({
  fieldRef,
  startersRef,
  benchRef,
  onSwapStarters,
  onBenchToField,
  onFieldFreePos,
}) {
  // ── Drag state ──────────────────────────────────────────────────────────────
  const [dragInfo, setDragInfo] = useState(null);
  const [dragActivating, setDragActivating] = useState(null);
  const [nearTarget, setNearTarget] = useState(null);

  // ── Internal refs (no re-render en pointer move) ────────────────────────────
  const dragInfoRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressOriginRef = useRef(null);
  const ghostRef = useRef(null);

  /** Limpia todos los event listeners y resetea el estado de drag */
  const cleanup = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressOriginRef.current = null;
    dragInfoRef.current = null;
    setDragInfo(null);
    setDragActivating(null);
    setNearTarget(null);
  }, []);

  // ── Pointer Down: inicia long-press timer ───────────────────────────────────
  const handlePointerDown = useCallback((e, type, index) => {
    // Ignorar clicks no-primarios (right click, middle)
    if (e.button !== 0 && e.button !== undefined) return;

    const startX = e.clientX;
    const startY = e.clientY;
    longPressOriginRef.current = { x: startX, y: startY };

    // Feedback visual inmediato — el usuario ve que el press registró
    setDragActivating({ type, index });

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    const cancelOnMove = (moveEvt) => {
      const dx = moveEvt.clientX - startX;
      const dy = moveEvt.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > MOVE_CANCEL_THRESHOLD) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        longPressOriginRef.current = null;
        setDragActivating(null);
        document.removeEventListener("pointermove", cancelOnMove);
        document.removeEventListener("pointerup", cancelOnUp);
      }
    };

    const cancelOnUp = () => {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      longPressOriginRef.current = null;
      setDragActivating(null);
      document.removeEventListener("pointermove", cancelOnMove);
      document.removeEventListener("pointerup", cancelOnUp);
    };

    document.addEventListener("pointermove", cancelOnMove, { passive: true });
    document.addEventListener("pointerup", cancelOnUp, { once: true });

    longPressTimerRef.current = setTimeout(() => {
      document.removeEventListener("pointermove", cancelOnMove);
      document.removeEventListener("pointerup", cancelOnUp);
      setDragActivating(null);

      e.preventDefault?.();
      const info = { type, index, x: e.clientX, y: e.clientY };
      setDragInfo(info);
      dragInfoRef.current = info;
    }, LONG_PRESS_DURATION);
  }, []);

  // ── Pointer Move + Up: activo solo cuando hay dragInfo ──────────────────────
  useEffect(() => {
    if (!dragInfo) return;

    const onMove = (e) => {
      e.preventDefault();
      // Actualizar posición del ghost (manipulación directa de DOM para 60fps)
      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX - 36}px`;
        ghostRef.current.style.top = `${e.clientY - 42}px`;
      }
      if (!fieldRef.current) return;
      const rect = fieldRef.current.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;

      // Calcular snap target más cercano
      let nearest = null;
      let minDist = SNAP_RADIUS;
      (startersRef.current || []).forEach((st, i) => {
        if (dragInfoRef.current?.type === "starter" && dragInfoRef.current?.index === i) return;
        const dx = st.currentLeft - px;
        const dy = st.currentTop - py;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDist) { minDist = d; nearest = i; }
      });
      setNearTarget((prev) => (prev === nearest ? prev : nearest));
    };

    const onUp = (e) => {
      const di = dragInfoRef.current;
      const curSt = startersRef.current || [];
      const curBn = benchRef.current || [];
      if (!di) { cleanup(); return; }

      if (fieldRef.current) {
        const rect = fieldRef.current.getBoundingClientRect();
        const inField =
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom;
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;

        // Buscar snap target al soltar
        let nearest = null;
        let minDist = SNAP_RADIUS;
        curSt.forEach((st, i) => {
          if (di.type === "starter" && di.index === i) return;
          const dx = st.currentLeft - px;
          const dy = st.currentTop - py;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minDist) { minDist = d; nearest = i; }
        });

        if (inField && nearest !== null) {
          // Drop sobre otro token → swap
          if (di.type === "starter") {
            onSwapStarters?.(di.index, nearest);
          } else if (di.type === "bench") {
            onBenchToField?.(di.index, nearest);
          }
        } else if (inField && nearest === null) {
          // Drop en posición libre → reubicar token
          if (di.type === "starter") {
            onFieldFreePos?.(di.index, px, py);
          }
        }
      }
      cleanup();
    };

    document.addEventListener("pointermove", onMove, { passive: false });
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, [dragInfo, cleanup, fieldRef, startersRef, benchRef, onSwapStarters, onBenchToField, onFieldFreePos]);

  const isDrag = useCallback(
    (type, index) => dragInfo?.type === type && dragInfo?.index === index,
    [dragInfo]
  );

  return {
    dragInfo,
    dragActivating,
    nearTarget,
    ghostRef,
    handlePointerDown,
    isDrag,
    cleanup,
  };
}
