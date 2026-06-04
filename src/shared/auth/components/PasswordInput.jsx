import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
          fontSize: 15,
          fontWeight: 500,
          padding: "14px 44px 14px 16px",
          backgroundColor: "#FFFFFF",
          border: `1px solid ${hasError ? "#D95C5C" : "#E2D9C9"}`,
          borderRadius: 12,
          color: "#1F1F1D",
          fontFamily: "inherit",
          outline: "none",
          boxSizing: "border-box",
          boxShadow: "inset 0 1px 2px rgba(31,31,29,0.04)",
          transition: "all 0.2s ease",
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
          color: "#667085", display: "flex",
          alignItems: "center",
        }}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
