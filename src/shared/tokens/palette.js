/**
 * @module palette
 * @description Paleta de colores y tokens visuales de ALTTEZ.
 * Identidad "Broadcast Arena": negro profundo + azul eléctrico ALTTEZ + blanco,
 * con capa de elevación, bisel y gradientes tipo transmisión deportiva.
 *
 * @version 4.0
 * @author ALTTEZ
 */

export const PALETTE = {

  // ── ALTTEZ Blue — acento principal de marca ───────
  blue:        "#2F6BFF",
  blueHi:      "#5B9DFF",
  blueDeep:    "#1D4ED8",
  blueDim:     "rgba(47,107,255,0.08)",
  blueBorder:  "rgba(47,107,255,0.20)",
  blueGlow:    "rgba(47,107,255,0.35)",
  blueFocus:   "rgba(47,107,255,0.55)",
  blueIce:     "#38BDF8",

  // ── Superficies — escala navy ─────────────────────
  bg:          "#06080E",
  bgDeep:      "#040610",
  bgPanel:     "#0A0F1A",
  bgElevated:  "#111827",
  surface:     "rgba(6,8,14,0.95)",
  surfaceGlass:"linear-gradient(135deg, rgba(10,15,26,0.96), rgba(6,10,20,0.99))",

  // ── Texto ─────────────────────────────────────────
  text:        "#F0F4F8",
  textMuted:   "rgba(240,244,248,0.50)",
  textHint:    "rgba(240,244,248,0.25)",
  bgDark:      "#06080E",

  // ── Bordes ────────────────────────────────────────
  border:      "rgba(47,107,255,0.10)",
  borderHi:    "rgba(240,244,248,0.12)",
  borderFocus: "rgba(47,107,255,0.55)",

  // ── Success ───────────────────────────────────────
  success:      "#10B981",
  successDim:   "rgba(16,185,129,0.10)",
  successBorder:"rgba(16,185,129,0.28)",

  // ── Amber / Championship Gold ─────────────────────
  amber:       "#F59E0B",
  amberDim:    "rgba(245,158,11,0.10)",
  amberBorder: "rgba(245,158,11,0.28)",

  // ── Danger ────────────────────────────────────────
  danger:      "#EF4444",
  dangerDim:   "rgba(239,68,68,0.10)",
  dangerBorder:"rgba(239,68,68,0.28)",

  // ── Funcionales ───────────────────────────────────
  drag:        "#38BDF8",
  dragDim:     "rgba(56,189,248,0.15)",
  whatsapp:    "#25D366",
  yellowCard:  "#f0c030",

  // ── Backward compat (DEPRECATED — migrar en fases 2-4) ──
  neon:        "#2F6BFF",
  neonGlow:    "rgba(47,107,255,0.35)",
  neonDim:     "rgba(47,107,255,0.08)",
  neonBorder:  "rgba(47,107,255,0.20)",
  green:       "#10B981",
  greenDim:    "rgba(16,185,129,0.10)",
  greenBorder: "rgba(16,185,129,0.28)",
  greenBright: "#38BDF8",
  purple:      "#2F6BFF",
  purpleVibrant:      "#5B9DFF",
  purpleVibrantDim:   "rgba(47,107,255,0.08)",
  purpleVibrantBorder:"rgba(47,107,255,0.20)",
  purpleVibrantGlow:  "rgba(47,107,255,0.35)",
  violetAccent:"#1D4ED8",
  violetDim:   "rgba(47,107,255,0.08)",
  violetBorder:"rgba(47,107,255,0.20)",
  violetGlow:  "rgba(47,107,255,0.35)",
  violetRing:  "rgba(47,107,255,0.30)",
  surfaceHi:   "rgba(6,8,14,0.6)",
  surfaceModal:"rgba(6,8,14,0.97)",
};

// ── Broadcast Arena — sistema de elevación y bisel ──
// Capas inspiradas en transmisión deportiva: composición con peso,
// no planitud SaaS. Cada capa mezcla sombra externa + bisel interno.
export const ELEVATION = {
  flat:  "none",
  // Card en reposo: sombra ligera + bisel superior tenue (luz de arriba)
  card:  "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.45)",
  // Card elevada al hover: sombra más marcada + acento azul
  cardHi:"0 1px 0 rgba(255,255,255,0.06) inset, 0 14px 40px rgba(0,0,0,0.60), 0 0 0 1px rgba(47,107,255,0.18)",
  // Panel grande (modales, sheets)
  panel: "0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 80px rgba(0,0,0,0.70)",
  // Stat broadcast: luz superior definida + halo azul inferior
  stat:  "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 0 rgba(255,255,255,0.02) inset, 0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(47,107,255,0.12)",
  statHi:"0 1px 0 rgba(255,255,255,0.10) inset, 0 18px 56px rgba(0,0,0,0.65), 0 0 0 1px rgba(47,107,255,0.32), 0 0 32px rgba(47,107,255,0.20)",
};

// Bordes con bisel (simulan chapa metálica / tarjeta de trading FUT)
export const BEVEL = {
  top:    "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%)",
  topHi:  "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 50%)",
  sheen:  "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 45%, rgba(47,107,255,0.08) 100%)",
};

// Gradientes direccionales tipo overlay de transmisión
export const BROADCAST_GRADIENT = {
  // Fondo de stat-card: negro profundo con luz azul en esquina superior izquierda
  stat:      "linear-gradient(135deg, rgba(47,107,255,0.10) 0%, rgba(10,15,26,0.98) 45%, rgba(4,6,16,1) 100%)",
  statAccent:"linear-gradient(135deg, rgba(47,107,255,0.22) 0%, rgba(10,15,26,0.96) 50%, rgba(4,6,16,1) 100%)",
  // Hero / arena principal
  arena:     "radial-gradient(120% 80% at 0% 0%, rgba(47,107,255,0.14) 0%, rgba(6,8,14,0) 55%), radial-gradient(100% 80% at 100% 100%, rgba(29,78,216,0.10) 0%, rgba(6,8,14,0) 60%), #06080E",
  // Topbar broadcast: oscuro con luz horizontal
  topbar:    "linear-gradient(180deg, rgba(10,15,26,0.98) 0%, rgba(6,8,14,0.96) 100%)",
  // Barra de acento superior en cards (3px)
  accentBar: "linear-gradient(90deg, rgba(47,107,255,0) 0%, #2F6BFF 20%, #5B9DFF 50%, #2F6BFF 80%, rgba(47,107,255,0) 100%)",
  // Live / active tab sweep
  liveBar:   "linear-gradient(90deg, #2F6BFF 0%, #5B9DFF 50%, #2F6BFF 100%)",
};

// Esquinas angulares / corner-accents (decoración tipo HUD broadcast)
export const CORNER_ACCENT = {
  // clip-path: corta las esquinas para silueta angular
  tile:    "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
  tileLg:  "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)",
};

// Radios consistentes
export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};
