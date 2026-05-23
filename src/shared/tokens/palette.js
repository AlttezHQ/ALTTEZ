export const PALETTE = {
  bronce: "#C27A42",
  bronceHi: "#D48E56",
  bronceDeep: "#A16233",
  bronceDim: "rgba(194, 122, 66, 0.12)",
  bronceBorder: "rgba(194, 122, 66, 0.28)",
  bronceGlow: "rgba(194, 122, 66, 0.18)",
  bronceFocus: "rgba(194, 122, 66, 0.34)",
  bronceIce: "#0F111A",

  blue: "#3F6DB5",
  blueHi: "#5A86C9",
  blueDeep: "#2A4F89",
  blueDim: "rgba(63, 109, 181, 0.12)",
  blueBorder: "rgba(63, 109, 181, 0.28)",
  blueGlow: "rgba(63, 109, 181, 0.18)",
  blueFocus: "rgba(63, 109, 181, 0.34)",
  blueIce: "#0F111A",

  bg: "var(--color-bg, #0F111A)",
  bgDeep: "var(--color-bg-panel, #181B2A)",
  bgPanel: "var(--color-bg-panel, #181B2A)",
  bgElevated: "var(--color-bg-elevated, #21253A)",
  surface: "var(--color-surface, #181B2A)",
  surfaceGlass: "var(--color-surface-glass)",

  text: "var(--color-text, #F5F7FA)",
  textMuted: "var(--color-text-muted, #9EACBF)",
  textHint: "var(--color-text-hint, #6F7D93)",
  bgDark: "var(--color-bg, #0F111A)", /* Maps to adaptive bg now */

  border: "var(--color-border, #22273F)",
  borderHi: "var(--color-border-hi, #323B5C)",
  borderFocus: "rgba(194, 122, 66, 0.34)",

  success: "#22C55E",
  successDim: "rgba(34,197,94,0.10)",
  successBorder: "rgba(34,197,94,0.24)",

  amber: "#F5BE05",
  amberDim: "rgba(245,190,5,0.10)",
  amberBorder: "rgba(245,190,5,0.24)",

  danger: "#EF4444",
  dangerDim: "rgba(239,68,68,0.10)",
  dangerBorder: "rgba(239,68,68,0.24)",

  drag: "#C27A42",
  dragDim: "rgba(194, 122, 66, 0.12)",
  whatsapp: "#25D366",
  yellowCard: "#F5BE05",

  neon: "#C27A42",
  neonGlow: "rgba(194, 122, 66, 0.18)",
  neonDim: "rgba(194, 122, 66, 0.12)",
  neonBorder: "rgba(194, 122, 66, 0.28)",
  green: "#22C55E",
  greenDim: "rgba(34,197,94,0.10)",
  greenBorder: "rgba(34,197,94,0.24)",
  greenBright: "#22C55E",
  purple: "#C27A42",
  purpleVibrant: "#D48E56",
  purpleVibrantDim: "rgba(194, 122, 66, 0.12)",
  purpleVibrantBorder: "rgba(194, 122, 66, 0.28)",
  purpleVibrantGlow: "rgba(194, 122, 66, 0.18)",
  violetAccent: "#A16233",
  violetDim: "rgba(194, 122, 66, 0.12)",
  violetBorder: "rgba(194, 122, 66, 0.28)",
  violetGlow: "rgba(194, 122, 66, 0.18)",
  violetRing: "rgba(194, 122, 66, 0.22)",
  surfaceHi: "#2A2E33",
  surfaceModal: "rgba(26,29,32,0.98)",
};

export const ELEVATION = {
  flat: "none",
  card: "0 10px 28px rgba(31,31,29,0.07)",
  cardHi: "0 16px 34px rgba(31,31,29,0.10), 0 0 0 1px rgba(206, 137, 70, 0.12)",
  panel: "0 26px 72px rgba(31,31,29,0.16)",
  stat: "0 12px 32px rgba(31,31,29,0.08)",
  statHi: "0 18px 40px rgba(31,31,29,0.12), 0 0 0 1px rgba(206, 137, 70, 0.14)",
};

export const BEVEL = {
  top: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 42%)",
  topHi: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 55%)",
  sheen: "linear-gradient(135deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 45%, rgba(206, 137, 70, 0.06) 100%)",
};

export const BROADCAST_GRADIENT = {
  stat: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,241,234,0.97) 100%)",
  statAccent: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,231,207,0.62) 100%)",
  arena: "linear-gradient(180deg, #F6F1EA 0%, #EDE8D0 100%)",
  topbar: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(246,241,234,0.96) 100%)",
  accentBar: "linear-gradient(90deg, rgba(206, 137, 70, 0) 0%, #CE8946 25%, #D8A06B 50%, #CE8946 75%, rgba(206, 137, 70, 0) 100%)",
  liveBar: "linear-gradient(90deg, #CE8946 0%, #D8A06B 50%, #CE8946 100%)",
};

export const CORNER_ACCENT = {
  tile: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
  tileLg: "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)",
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};
