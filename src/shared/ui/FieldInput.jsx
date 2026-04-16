/**
 * @component FieldInput
 * @description Campo de formulario oscuro reutilizable. Reemplaza los objetos
 * inp/inputStyle/fieldStyle duplicados en 8+ archivos.
 * Usa la clase .field-input definida en index.css (incluye :focus ring).
 *
 * Props:
 *  label  {string}   Etiqueta uppercase encima del campo (opcional)
 *  error  {string}   Mensaje de error; activa borde rojo (opcional)
 *  as     {"input"|"select"|"textarea"}  Default: "input"
 *  size   {"sm"|"md"}  sm=compact (calendarios), md=estándar (default)
 */
import { PALETTE as C } from "../tokens/palette";

export default function FieldInput({
  label,
  error,
  as: Tag = "input",
  size = "md",
  className = "",
  style = {},
  children,   // para <select> options
  ...rest
}) {
  const sizeStyle = size === "sm"
    ? { padding: "5px 8px", fontSize: "var(--fs-body-lg)" }
    : {};

  const errorStyle = error
    ? { borderColor: C.danger, boxShadow: `0 0 0 2px ${C.dangerBorder}` }
    : {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
      {label && (
        <div className="section-label" style={{ marginBottom: 2 }}>
          {label}
        </div>
      )}
      <Tag
        className={`field-input ${className}`}
        style={{ ...sizeStyle, ...errorStyle, ...style }}
        {...rest}
      >
        {children}
      </Tag>
      {error && (
        <div style={{ fontSize: "var(--fs-caption)", color: C.danger, marginTop: 2 }}>
          {error}
        </div>
      )}
    </div>
  );
}
