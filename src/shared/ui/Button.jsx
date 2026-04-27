/**
 * @component Button
 * @description Botón broadcast de ALTTEZ con bisel superior, acentos angulares
 * y feedback snappy. Variantes: primary / ghost / capsule / icon.
 *
 * Props:
 *  variant  {"primary"|"ghost"|"capsule"|"icon"}
 *    primary  — fondo azul ALTTEZ con bisel + sombra azul; texto blanco
 *    ghost    — transparente con borde azul y hairline interior; texto accent
 *    capsule  — pill uppercase compacto (acciones secundarias)
 *    icon     — cuadrado compacto (X, close, iconos breves)
 *  accent   {string}  Color override (default: PALETTE.blue)
 *  size     {"sm"|"md"|"lg"}
 *  loading  {boolean} Spinner + deshabilita interacción
 *  as       {React.ElementType}  Para usar con motion.button etc.
 *
 * @version 2.0 — Broadcast Arena
 */
import { motion } from "framer-motion";
import { cva } from "class-variance-authority";
import { PALETTE as C } from "../tokens/palette";
import { SPRING as SPRINGS } from "../tokens/motion";

const SPRING = SPRINGS.snappy;

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
      size: { sm: "", md: "", lg: "" },
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
  accent = C.blue,
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
          background: `linear-gradient(135deg, ${accent} 0%, ${C.blueDeep} 100%)`,
          color: "#FFFFFF",
          border: `1px solid ${accent}`,
          boxShadow: "0 10px 24px rgba(201,151,58,0.18)",
        };
      case "ghost":
        return {
          background: "#FFFFFF",
          color: C.text,
          border: `1px solid ${C.border}`,
          boxShadow: "0 4px 14px rgba(23,26,28,0.05)",
        };
      case "capsule":
        return {
          background: C.blueDim,
          color: accent,
          border: `1px solid ${C.blueBorder}`,
          borderRadius: "var(--radius-pill)",
          letterSpacing: "var(--ls-caps-sm)",
          boxShadow: "none",
        };
      case "icon":
        return {
          background: C.bgDeep,
          color: C.textMuted,
          border: `1px solid ${C.border}`,
          borderRadius: "var(--radius-md)",
          boxShadow: "none",
        };
      default:
        return {};
    }
  })();

  const motionProps = Tag === motion.button || Tag?.toString?.().includes("motion")
    ? {
        whileHover: isDisabled ? {} : (
          variant === "primary"
            ? { y: -1, boxShadow: "0 14px 28px rgba(201,151,58,0.24)" }
            : variant === "ghost"
              ? { y: -1, borderColor: `${accent}`, color: `${accent}` }
              : { scale: 1.03 }
        ),
        whileTap:   isDisabled ? {} : { scale: 0.97, y: 0 },
        transition: SPRING,
      }
    : {};

  return (
    <Tag
      className={btnBase({ variant, size, className })}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      style={{
        position: "relative",
        padding: p,
        fontSize: fs,
        fontWeight: "var(--fw-bold)",
        borderRadius: variant === "capsule" ? "var(--radius-pill)" : "var(--radius-md)",
        opacity: isDisabled ? 0.45 : 1,
        minHeight: size === "sm" ? 32 : "44px",
        gap: "var(--sp-2)",
        outline: "none",
        fontFamily: "inherit",
        letterSpacing: variant === "primary" || variant === "ghost" ? "0.04em" : undefined,
        textTransform: variant === "primary" ? "uppercase" : undefined,
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
        border: "2px solid rgba(255,255,255,0.35)",
        borderTopColor: "#FFFFFF",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
      }}
    />
  );
}
