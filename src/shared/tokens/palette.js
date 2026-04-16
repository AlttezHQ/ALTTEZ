/**
 * @module palette
 * @description Paleta de colores centralizada para todo ALTTEZ.
 * Unifica las definiciones que existian en Home.jsx, GestionPlantilla.jsx y TacticalBoard.jsx.
 *
 * @version 2.0
 * @author ALTTEZ
 */

export const PALETTE = {
  // ── Neon (acento principal) ────────────────
  neon:        "#c8ff00",
  neonGlow:    "rgba(200,255,0,0.55)",
  neonDim:     "rgba(200,255,0,0.08)",
  neonBorder:  "rgba(200,255,0,0.22)",

  // ── Amber ──────────────────────────────────
  amber:       "#EF9F27",
  amberDim:    "rgba(239,159,39,0.12)",
  amberBorder: "rgba(239,159,39,0.4)",

  // ── Green ──────────────────────────────────
  green:       "#1D9E75",
  greenDim:    "rgba(29,158,117,0.18)",
  greenBorder: "rgba(29,158,117,0.4)",
  greenBright: "#00ff88",       // estado online / reconectado

  // ── Violet / admin ─────────────────────────
  purple:       "#7F77DD",      // alias legacy — mantener para compatibilidad
  purpleVibrant: "#8B5CF6",     // violet-500, usado en EmptyState y modales
  purpleVibrantDim:    "rgba(139,92,246,0.10)",
  purpleVibrantBorder: "rgba(139,92,246,0.28)",
  purpleVibrantGlow:   "rgba(139,92,246,0.22)",
  violetAccent: "#7C3AED",
  violetDim:    "rgba(124,58,237,0.12)",
  violetBorder: "rgba(124,58,237,0.35)",
  violetGlow:   "rgba(124,58,237,0.4)",
  violetRing:   "rgba(124,58,237,0.3)",

  // ── Danger ─────────────────────────────────
  danger:      "#E24B4A",
  dangerDim:   "rgba(226,75,74,0.12)",
  dangerBorder:"rgba(226,75,74,0.35)",

  // ── Drag (pizarra táctica) ─────────────────
  drag:        "#00e5ff",
  dragDim:     "rgba(0,229,255,0.15)",

  // ── Fondos y superficies ───────────────────
  bg:           "#030408",
  bgDark:       "#0a0a0a",      // texto oscuro sobre neon
  surface:      "rgba(0,0,0,0.92)",
  surfaceHi:    "rgba(0,0,0,0.6)",
  surfaceGlass: "linear-gradient(135deg,rgba(20,20,30,0.95),rgba(12,12,22,0.98))",
  surfaceModal: "rgba(10,10,20,0.97)",

  // ── Bordes ─────────────────────────────────
  border:      "rgba(255,255,255,0.07)",
  borderHi:    "rgba(255,255,255,0.2)",

  // ── Texto ──────────────────────────────────
  text:        "white",
  textMuted:   "rgba(255,255,255,0.4)",
  textHint:    "rgba(255,255,255,0.22)",

  // ── Misc ───────────────────────────────────
  whatsapp:    "#25D366",
  yellowCard:  "#f0c030",
};
