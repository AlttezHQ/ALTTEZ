import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PALETTE } from "../../tokens/palette";

/**
 * @component PasswordInput
 * @description Input de contraseña con toggle para ver/ocultar texto.
 * Compatible con los estilos de auth de ALTTEZ.
 */
export default function PasswordInput({ value, onChange, onKeyDown, placeholder, hasError, autoComplete = "current-password", id }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          fontSize: 13,
          padding: "11px 40px 11px 13px",
          background: PALETTE.surface,
          border: `1px solid ${hasError ? PALETTE.danger : PALETTE.border}`,
          borderRadius: 12,
          color: PALETTE.text,
          fontFamily: "inherit",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible(v => !v)}
        style={{
          position: "absolute", right: 12, top: "50%",
          transform: "translateY(-50%)",
          background: "none", border: "none",
          cursor: "pointer", padding: 2,
          color: PALETTE.textMuted, display: "flex",
          alignItems: "center",
        }}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
