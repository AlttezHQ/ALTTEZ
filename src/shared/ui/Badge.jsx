/**
 * @component Badge
 * @description Chip de estado/tipo reutilizable. Reemplaza los patrones
 * css.badge(), status pill y event-type chip en ~10 archivos.
 *
 * Props:
 *  color    {string}  Color base (hex o rgba). Se auto-deriva dim (18%) y border (40%)
 *  variant  {"outline"|"solid"}  outline=fondo dim+borde (default), solid=fondo sólido
 *  size     {"xs"|"sm"}  xs=7px (tablas compactas), sm=9px (default)
 *
 * Uso:
 *  <Badge color={PALETTE.green}>pagado</Badge>
 *  <Badge color={PALETTE.danger} size="xs" variant="solid">riesgo</Badge>
 */
import { cva } from "class-variance-authority";
import { PALETTE as C } from "../tokens/palette";

/** Deriva fondo y borde a partir de un color hex o rgb */
function deriveOpacities(color) {
  // Si es hex (#RRGGBB) lo convierte a rgba para las capas semitransparentes
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return {
      dim:    `rgba(${r},${g},${b},0.18)`,
      border: `rgba(${r},${g},${b},0.4)`,
    };
  }
  // Si ya es rgba(...) extrae los componentes
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map(s => s.trim());
    const [r, g, b] = parts;
    return {
      dim:    `rgba(${r},${g},${b},0.18)`,
      border: `rgba(${r},${g},${b},0.4)`,
    };
  }
  return { dim: "rgba(255,255,255,0.1)", border: "rgba(255,255,255,0.3)" };
}

const badgeBase = cva(
  // clases base comunes
  "inline-flex items-center justify-center font-bold uppercase",
  {
    variants: {
      size: {
        xs: "",   // fontSize manejado via style (7px no está en Tailwind base)
        sm: "",   // 9px
      },
    },
    defaultVariants: { size: "sm" },
  }
);

export default function Badge({
  color = "rgba(255,255,255,0.4)",
  variant = "outline",
  size = "sm",
  className = "",
  style = {},
  children,
  ...rest
}) {
  const { dim, border } = deriveOpacities(color);
  const fontSize    = size === "xs" ? "var(--fs-badge)" : "var(--fs-label)";
  const letterSpace = "var(--ls-caps-sm)";
  const padding     = size === "xs" ? "2px 6px" : "3px 10px";
  const radius      = "var(--radius-sm)";

  const variantStyle = variant === "solid"
    ? { background: color, color: C.bgDark }
    : { background: dim, color, border: `1px solid ${border}` };

  return (
    <span
      className={badgeBase({ size, className })}
      style={{
        fontSize,
        letterSpacing: letterSpace,
        padding,
        borderRadius: radius,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...variantStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
