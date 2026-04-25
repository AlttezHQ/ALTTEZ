import { useEffect } from "react";

const STYLE_ID = "ui-select-opts";

export function Select({ hasError = false, style = {}, children, ...props }) {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      .mkt-select option {
        background: #F5F4F0;
        color: #0F0F0F;
      }
    `;
    document.head.appendChild(s);
  }, []);

  return (
    <select
      className="mkt-select"
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        background: "#F5F4F0",
        border: `1px solid ${hasError ? "#DC2626" : "rgba(0,0,0,0.08)"}`,
        color: "#0F0F0F",
        outline: "none",
        fontSize: 14,
        cursor: "pointer",
        fontFamily: "'Inter', Arial, sans-serif",
        boxSizing: "border-box",
        appearance: "auto",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectItem({ children, ...props }) {
  return <option {...props}>{children}</option>;
}
