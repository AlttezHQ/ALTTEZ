/**
 * @component Button
 * @description Botón reutilizable con variantes. Reemplaza 20+ estilos inline
 * de botón distribuidos en todos los módulos.
 *
 * Props:
 *  variant  {"primary"|"ghost"|"capsule"|"icon"}
 *    primary  — fondo neon/accent, texto oscuro, glow en hover
 *    ghost    — transparente, borde+texto colored
 *    capsule  — pill pequeño uppercase (ACTUALIZAR, EDITAR…)
 *    icon     — sin texto, cuadrado compacto (botones X, close)
 *  accent   {string}  Color override (default: PALETTE.neon)
 *  size     {"sm"|"md"|"lg"}
 *  loading  {boolean}  Muestra spinner, deshabilita interacción
 *  as       {React.ElementType}  Para usar con motion.button etc.
 */
import { motion } from "framer-motion";
import { cva } from "class-variance-authority";
import { PALETTE as C } from "../tokens/palette";

const SPRING = { type: "spring", stiffness: 320, damping: 28 };

const btnBase = cva(
  "inline-flex items-center justify-center font-bold cursor-pointer select-none touch-manip transition-colors",
  {
    variants: {
      variant: {
        primary: "",
        ghost:   "",
        capsule: "uppercase",
        icon:    "",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

// Tamaños de padding y font por variante×tamaño
const SIZES = {
  primary: { sm: { p: "7px 16px", fs: "var(--fs-label)" }, md: { p: "10px 22px", fs: "var(--fs-body-lg)" }, lg: { p: "13px 28px", fs: "var(--fs-subhead)" } },
  ghost:   { sm: { p: "7px 14px", fs: "var(--fs-label)" }, md: { p: "9px 18px",  fs: "var(--fs-body-lg)" }, lg: { p: "11px 24px", fs: "var(--fs-subhead)" } },
  capsule: { sm: { p: "3px 10px", fs: "var(--fs-badge)"  }, md: { p: "4px 12px",  fs: "var(--fs-label)"  }, lg: { p: "5px 14px",  fs: "var(--fs-caption)" } },
  icon:    { sm: { p: "6px",      fs: "var(--fs-body-lg)"}, md: { p: "8px",       fs: "var(--fs-subhead)"}, lg: { p: "10px",      fs: "var(--fs-title-sm)"} },
};

export default function Button({
  variant = "primary",
  accent = C.neon,
  size = "md",
  loading = false,
  disabled = false,
  as: Tag = motion.button,
  className = "",
  style = {},
  children,
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const { p, fs } = SIZES[variant]?.[size] ?? SIZES.primary.md;

  // Estilos base por variante
  const variantStyle = (() => {
    switch (variant) {
      case "primary":
        return {
          background: accent,
          color: C.bgDark,
          border: "none",
          boxShadow: `0 4px 16px ${accent}44`,
        };
      case "ghost":
        return {
          background: "transparent",
          color: accent,
          border: `1px solid ${accent}55`,
        };
      case "capsule":
        return {
          background: "transparent",
          color: accent,
          border: `1px solid ${accent}44`,
          borderRadius: "var(--radius-pill)",
          letterSpacing: "var(--ls-caps-sm)",
        };
      case "icon":
        return {
          background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "var(--radius-md)",
        };
      default:
        return {};
    }
  })();

  const motionProps = Tag === motion.button || Tag?.toString?.().includes("motion")
    ? {
        whileHover: isDisabled ? {} : { scale: 1.04, boxShadow: variant === "primary" ? `0 0 18px ${accent}55` : undefined },
        whileTap:   isDisabled ? {} : { scale: 0.97 },
        transition: SPRING,
      }
    : {};

  return (
    <Tag
      className={btnBase({ variant, size, className })}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      style={{
        padding: p,
        fontSize: fs,
        fontWeight: "var(--fw-bold)",
        borderRadius: variant === "capsule" ? "var(--radius-pill)" : "var(--radius-md)",
        opacity: isDisabled ? 0.45 : 1,
        minHeight: size === "sm" ? 32 : "44px",
        gap: "var(--sp-2)",
        outline: "none",
        fontFamily: "inherit",
        ...variantStyle,
        ...style,
      }}
      {...motionProps}
      {...rest}
    >
      {loading ? <Spinner /> : children}
    </Tag>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        border: "2px solid rgba(0,0,0,0.2)",
        borderTopColor: C.bgDark,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
      }}
    />
  );
}
