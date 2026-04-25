export function Label({ children, error = false, style = {}, ...props }) {
  return (
    <label
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        color: error ? "#DC2626" : "#6B7280",
        fontWeight: 700,
        display: "block",
        ...style,
      }}
      {...props}
    >
      {children}
    </label>
  );
}
