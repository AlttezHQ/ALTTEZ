export function Textarea({ hasError = false, style = {}, ...props }) {
  return (
    <textarea
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        background: "#F5F4F0",
        border: `1px solid ${hasError ? "#DC2626" : "rgba(0,0,0,0.08)"}`,
        color: "#0F0F0F",
        outline: "none",
        fontSize: 14,
        lineHeight: 1.7,
        transition: "border-color 180ms ease, box-shadow 180ms ease",
        boxSizing: "border-box",
        fontFamily: "'Inter', Arial, sans-serif",
        resize: "vertical",
        minHeight: 120,
        ...style,
      }}
      {...props}
    />
  );
}
