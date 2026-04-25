import { useEffect } from "react";

const STYLE_ID = "mui-shimmer-btn";

export function ShimmerButton({ children, style = {}, disabled, ...props }) {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      @keyframes shimmer-sweep {
        0%   { transform: translateX(-120%) skewX(-15deg); }
        100% { transform: translateX(320%) skewX(-15deg); }
      }
      .shimmer-btn {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border: none;
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .shimmer-btn::after {
        content: '';
        position: absolute;
        top: -10%;
        left: 0;
        width: 28%;
        height: 120%;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255,255,255,0.22) 50%,
          transparent 100%
        );
        animation: shimmer-sweep 2.8s ease infinite;
      }
      .shimmer-btn:disabled {
        opacity: 0.72;
        cursor: not-allowed;
      }
      .shimmer-btn:disabled::after {
        display: none;
      }
    `;
    document.head.appendChild(s);
  }, []);

  return (
    <button
      className="shimmer-btn"
      disabled={disabled}
      style={{
        padding: "13px 28px",
        borderRadius: 10,
        background: "linear-gradient(135deg, #C9973A 0%, #B8832A 100%)",
        color: "white",
        fontWeight: 700,
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        boxShadow: "0 6px 20px rgba(201,151,58,0.28)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0 10px 28px rgba(201,151,58,0.40)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(201,151,58,0.28)";
      }}
      {...props}
    >
      {children}
    </button>
  );
}
