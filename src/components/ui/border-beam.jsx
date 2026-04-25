import { useEffect } from "react";

const STYLE_ID = "mui-border-beam";

export function BorderBeam({
  colorFrom = "rgba(201,151,58,0.55)",
  colorTo = "rgba(245,194,102,0.55)",
  duration = 8,
  borderWidth = 1.5,
}) {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      @property --beam-angle {
        syntax: '<angle>';
        initial-value: 0deg;
        inherits: false;
      }
      @keyframes beam-spin {
        to { --beam-angle: 360deg; }
      }
      .border-beam-wrap {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: 0;
      }
      .border-beam-wrap::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: var(--beam-bw, 1.5px);
        background: conic-gradient(
          from var(--beam-angle),
          transparent 0%,
          var(--beam-from) 20%,
          var(--beam-to) 40%,
          transparent 60%
        );
        -webkit-mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: beam-spin var(--beam-dur, 8s) linear infinite;
      }
    `;
    document.head.appendChild(s);
  }, []);

  return (
    <div
      className="border-beam-wrap"
      aria-hidden="true"
      style={{
        "--beam-from": colorFrom,
        "--beam-to": colorTo,
        "--beam-dur": `${duration}s`,
        "--beam-bw": `${borderWidth}px`,
      }}
    />
  );
}
