/**
 * @component GlassPanel
 * @description Superficie glassmorphism reutilizable. Reemplaza el patrón
 * background:surfaceGlass + backdropFilter:blur(20px) duplicado en ~14 archivos.
 *
 * Props:
 *  accent     {string}  Color para border-top de 3px (opcional)
 *  padding    {"sm"|"md"|"lg"}  sm=12px, md=16px (default), lg=24px
 *  as         {string}  Elemento HTML (default "div")
 *  className  {string}  Clases adicionales
 *  style      {object}  Estilos inline de escape
 */
export default function GlassPanel({
  accent,
  padding = "md",
  as: Tag = "div",
  className = "",
  style = {},
  children,
  ...rest
}) {
  const PADDING = { sm: "var(--sp-3)", md: "var(--sp-4)", lg: "var(--sp-6)" };

  return (
    <Tag
      className={`glass-panel ${className}`}
      style={{
        padding: PADDING[padding] ?? PADDING.md,
        ...(accent ? { borderTop: `3px solid ${accent}` } : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
