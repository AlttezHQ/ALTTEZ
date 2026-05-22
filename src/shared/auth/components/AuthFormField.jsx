import { PALETTE } from "../../tokens/palette";

/**
 * @component AuthFormField
 * @description Campo de formulario reutilizable para pantallas de auth.
 * Incluye label, children slot y mensaje de error inline.
 */
export function AuthFormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", fontSize: 10,
        color: PALETTE.textMuted, marginBottom: 6, fontWeight: 600,
      }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: 10, color: PALETTE.danger, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Estilo base para inputs de auth. Acepta hasError para border rojo.
 */
export function mkAuthInput(hasError) {
  return {
    width: "100%",
    fontSize: "14px",
    padding: "12px 16px",
    background: "var(--color-surface)",
    border: `1px solid ${hasError ? "var(--color-danger)" : "var(--color-border-hi)"}`,
    borderRadius: 12,
    color: "var(--color-text)",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "var(--shadow-subtle)",
  };
}
