export function Card({ children, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 4px 28px rgba(0,0,0,0.08)",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, style = {} }) {
  return (
    <div
      style={{
        padding: "18px 22px 14px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, style = {} }) {
  return (
    <div style={{ padding: "32px 32px 28px", ...style }}>
      {children}
    </div>
  );
}
