export default function FieldBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <svg viewBox="0 0 900 620" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg1" cx="15%" cy="8%" r="38%">
            <stop offset="0%" stopColor="#F4E7CF" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#F4E7CF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F6F1EA" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg2" cx="85%" cy="10%" r="34%">
            <stop offset="0%" stopColor="#EFE7D8" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#EFE7D8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F6F1EA" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg3" cx="50%" cy="100%" r="48%">
            <stop offset="0%" stopColor="#EADBC0" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F6F1EA" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="900" height="620" fill="#F6F1EA" />
        <rect width="900" height="620" fill="url(#bg1)" />
        <rect width="900" height="620" fill="url(#bg2)" />
        <rect width="900" height="620" fill="url(#bg3)" />

        <rect x="0" y="0" width="450" height="310" fill="#FFFFFF" opacity="0.16" />
        <rect x="450" y="0" width="450" height="310" fill="#F7F3EC" opacity="0.18" />
        <rect x="0" y="310" width="450" height="310" fill="#F7F3EC" opacity="0.16" />
        <rect x="450" y="310" width="450" height="310" fill="#FFFFFF" opacity="0.18" />

        <rect x="0" y="0" width="900" height="620" fill="rgba(255,255,255,0.2)" />
      </svg>
    </div>
  );
}
