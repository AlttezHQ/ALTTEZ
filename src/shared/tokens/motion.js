/**
 * @module motion
 * @description Constantes de motion centralizadas para ALTTEZ.
 * Estilo "broadcast deportivo": decidido, con peso, no SaaS suave.
 *
 * @version 1.0
 * @author ALTTEZ
 */

// ── Framer Motion springs ────────────────────
export const SPRING = {
  default: { type: "spring", stiffness: 320, damping: 28 },
  snappy:  { type: "spring", stiffness: 420, damping: 32 },
  gentle:  { type: "spring", stiffness: 240, damping: 26 },
};

// ── CSS-compatible easing ────────────────────
export const EASE = {
  fast: { duration: 0.15, ease: [0.2, 0, 0, 1] },
  base: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
  slow: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
};

// ── Entrance variants ────────────────────────
export const FADE_UP = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export const SCALE_IN = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
};

// ── Stagger (único valor en todo el sistema) ──
export const STAGGER = 0.06;
