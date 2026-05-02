import { useState } from "react";
import {
  Bell, Calendar, CheckCircle2, CircleDot, ClipboardList, Dumbbell,
  FileText, Home, MapPin, MessageCircle, Settings, Users, Wallet, XCircle, Activity,
} from "lucide-react";

const COPPER = "#CE8946";
const SIDEBAR_BG = "#111719";

const MENU = [
  { label: "Resumen",        icon: Home,         active: true },
  { label: "Plantel",        icon: Users },
  { label: "Calendario",     icon: Calendar },
  { label: "Entrenamientos", icon: Dumbbell },
  { label: "Rendimiento",    icon: Activity },
  { label: "Finanzas",       icon: Wallet },
  { label: "Asistencia",     icon: ClipboardList },
  { label: "Comunicaciones", icon: MessageCircle },
  { label: "Reportes",       icon: FileText },
  { label: "Ajustes",        icon: Settings },
];

const PLAYERS = [
  { n: 7,  name: "Marcos Álvarez",  role: "Delantero",     pct: "98%", img: "/brand/player-marcos-alvarez.png" },
  { n: 10, name: "Diego Ramírez",   role: "Mediocampista", pct: "92%", img: "/brand/player-diego-ramirez.png" },
  { n: 4,  name: "Simón Torres",    role: "Defensa",       pct: "87%", img: "/brand/player-simon-torres.png" },
  { n: 1,  name: "Lautaro Sánchez", role: "Arquero",       pct: "95%", img: "/brand/player-lautaro-sanchez.png" },
];

const LINE_COORDS = "16,96 50,72 84,78 118,51 152,62 186,42 220,33 254,20";

// ─── SVG Player Headshots ─────────────────────────────────────────────────────

const HEADSHOT_CFG = [
  { skin: "#c8a47c", hair: "#1a0800", jersey: "#1c2b4a", accent: "#CE8946" },
  { skin: "#b8956e", hair: "#2d1400", jersey: "#111719", accent: "#e0e0e0" },
  { skin: "#8a6040", hair: "#0a0a0a", jersey: "#143020", accent: "#22c55e" },
  { skin: "#d4aa7d", hair: "#7b4a18", jersey: "#7b1818", accent: "#ffffff" },
];

function PlayerHeadshotSVG({ index = 0, size = 36 }) {
  const cfg = HEADSHOT_CFG[index % 4];
  const cx = size / 2;
  const id = `phc-${index}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <clipPath id={id}><circle cx={cx} cy={cx} r={cx} /></clipPath>
      </defs>
      <rect width={size} height={size} fill={cfg.jersey} clipPath={`url(#${id})`} />
      <rect x={cx - size * 0.09} y={size * 0.61} width={size * 0.18} height={size * 0.18} fill={cfg.skin} clipPath={`url(#${id})`} />
      <ellipse cx={cx} cy={size * 0.415} rx={size * 0.235} ry={size * 0.265} fill={cfg.skin} clipPath={`url(#${id})`} />
      <ellipse cx={cx} cy={size * 0.175} rx={size * 0.255} ry={size * 0.155} fill={cfg.hair} clipPath={`url(#${id})`} />
      <circle cx={cx - size * 0.08} cy={size * 0.405} r={size * 0.030} fill="#1a0600" clipPath={`url(#${id})`} />
      <circle cx={cx + size * 0.08} cy={size * 0.405} r={size * 0.030} fill="#1a0600" clipPath={`url(#${id})`} />
      <path
        d={`M ${cx - size * 0.11} ${size * 0.625} Q ${cx} ${size * 0.655} ${cx + size * 0.11} ${size * 0.625}`}
        fill="none" stroke={cfg.accent} strokeWidth="1" opacity="0.55" clipPath={`url(#${id})`}
      />
      <circle cx={cx} cy={cx} r={cx - 0.8} fill="none" stroke="rgba(206, 137, 70,0.38)" strokeWidth="1.5" />
    </svg>
  );
}

function PlayerHeadshot({ index = 0, size = 36, imgSrc }) {
  const [failed, setFailed] = useState(false);
  if (!imgSrc || failed) return <PlayerHeadshotSVG index={index} size={size} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1.5px solid rgba(206, 137, 70,0.38)", boxSizing: "border-box" }}>
      <img
        src={imgSrc}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// ─── Shields ──────────────────────────────────────────────────────────────────

function AlttezShield({ width = 36, height = 42 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id="at-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c2428" />
          <stop offset="100%" stopColor="#090d0f" />
        </linearGradient>
        <linearGradient id="at-brd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8bc4e" />
          <stop offset="100%" stopColor="#9c7418" />
        </linearGradient>
        <clipPath id="at-clip">
          <path d="M20 2L4 8V23C4 33 11.5 41 20 45C28.5 41 36 33 36 23V8L20 2Z" />
        </clipPath>
      </defs>
      {/* Body */}
      <path d="M20 2L4 8V23C4 33 11.5 41 20 45C28.5 41 36 33 36 23V8L20 2Z" fill="url(#at-bg)" />
      {/* Copper border */}
      <path d="M20 2L4 8V23C4 33 11.5 41 20 45C28.5 41 36 33 36 23V8L20 2Z" fill="none" stroke="url(#at-brd)" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Inner frame */}
      <path d="M20 5.5L7 10.5V23C7 31.5 13 38.5 20 41.5C27 38.5 33 31.5 33 23V10.5L20 5.5Z" fill="none" stroke="rgba(206, 137, 70,0.22)" strokeWidth="0.65" strokeLinejoin="round" />
      {/* Top copper band */}
      <path d="M20 2L4 8V12L20 6L36 12V8L20 2Z" fill={COPPER} opacity="0.72" clipPath="url(#at-clip)" />
      {/* Horizontal divider */}
      <line x1="6.5" y1="19.5" x2="33.5" y2="19.5" stroke="rgba(206, 137, 70,0.30)" strokeWidth="0.7" />
      {/* AT monogram */}
      <text x="20" y="33.5" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="-0.5">AT</text>
      {/* Bottom accent */}
      <circle cx="20" cy="44.2" r="1.2" fill={COPPER} opacity="0.55" />
    </svg>
  );
}

function RiversideShield({ width = 36, height = 42 }) {
  const RED = "#b91c1c";
  return (
    <svg width={width} height={height} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <clipPath id="ru-clip">
          <path d="M20 2L4 8V23C4 33 11.5 41 20 45C28.5 41 36 33 36 23V8L20 2Z" />
        </clipPath>
      </defs>
      {/* White base */}
      <path d="M20 2L4 8V23C4 33 11.5 41 20 45C28.5 41 36 33 36 23V8L20 2Z" fill="#f8f8f6" stroke={RED} strokeWidth="1.8" strokeLinejoin="round" />
      {/* Inner frame */}
      <path d="M20 5.5L7 10.5V23C7 31.5 13 38.5 20 41.5C27 38.5 33 31.5 33 23V10.5L20 5.5Z" fill="none" stroke="rgba(185,28,28,0.18)" strokeWidth="0.65" strokeLinejoin="round" />
      {/* Red top band */}
      <path d="M20 2L4 8V12L20 6L36 12V8L20 2Z" fill={RED} clipPath="url(#ru-clip)" />
      {/* Horizontal divider */}
      <line x1="6.5" y1="19.5" x2="33.5" y2="19.5" stroke="rgba(185,28,28,0.25)" strokeWidth="0.7" />
      {/* Subtle center vertical stripe */}
      <rect x="17" y="20" width="6" height="21" fill={RED} opacity="0.10" clipPath="url(#ru-clip)" />
      {/* RU monogram */}
      <text x="20" y="33.5" textAnchor="middle" dominantBaseline="middle" fill={RED} fontSize="12" fontWeight="900" fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="-0.5">RU</text>
      {/* Bottom accent */}
      <circle cx="20" cy="44.2" r="1.2" fill={RED} opacity="0.50" />
    </svg>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function SidebarLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <img src="/branding/alttez-symbol-transparent.png" alt="ALTTEZ" style={{ width: 22, height: 22, objectFit: "contain", filter: "brightness(10)" }} />
      <span style={{ color: "white", fontWeight: 900, fontSize: 17, letterSpacing: "-0.05em", lineHeight: 1 }}>
        ALTTEZ<span style={{ color: COPPER }}>.</span>
      </span>
    </div>
  );
}

function InnerCard({ children, style }) {
  return (
    <div style={{ borderRadius: 14, background: "#ffffff", padding: "14px", boxShadow: "0 4px 20px rgba(0,0,0,0.055)", border: "1px solid rgba(0,0,0,0.055)", ...style }}>
      {children}
    </div>
  );
}

function CardHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#1F1F1D", lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: 8.5, color: "#a0a0a0", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ─── Inner Cards ──────────────────────────────────────────────────────────────

function PlayerListCard() {
  return (
    <InnerCard>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#1F1F1D" }}>Plantel activo</span>
        <span style={{ fontSize: 8, color: "#bbb" }}>24 jugadores</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {PLAYERS.map((p, i) => (
          <div key={p.name} style={{ display: "grid", gridTemplateColumns: "14px 36px 1fr auto", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: "#aaa" }}>{p.n}</span>
            <PlayerHeadshot index={i} size={36} imgSrc={p.img} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#1F1F1D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              <div style={{ fontSize: 7, color: "#bbb" }}>{p.role}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#1F1F1D", display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                {p.pct}
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              </div>
              <div style={{ fontSize: 7, color: "#bbb" }}>Forma</div>
            </div>
          </div>
        ))}
      </div>
      <button style={{ marginTop: 10, width: "100%", textAlign: "center", fontSize: 8.5, fontWeight: 700, color: "#1F1F1D", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        Ver plantel completo →
      </button>
    </InnerCard>
  );
}

function ShieldImg({ src, FallbackSVG, width = 36, height = 42 }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <FallbackSVG width={width} height={height} />;
  return (
    <img
      src={src}
      alt=""
      style={{ width, height, objectFit: "contain", display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}

function MatchCard() {
  return (
    <InnerCard>
      <CardHead title="Próximo partido" sub="Liga Nacional · Jornada 12" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 4 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ margin: "0 auto", width: 36, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldImg src="/brand/shield-alttez-fc.png" FallbackSVG={AlttezShield} />
          </div>
          <div style={{ marginTop: 4, fontSize: 8, fontWeight: 700 }}>Alttez FC</div>
        </div>
        <div style={{ borderRadius: 999, background: "#f5f4f0", padding: "3px 7px", fontSize: 8, fontWeight: 700, color: "#999" }}>vs</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ margin: "0 auto", width: 36, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldImg src="/brand/shield-riverside-utd.png" FallbackSVG={RiversideShield} />
          </div>
          <div style={{ marginTop: 4, fontSize: 8, fontWeight: 700 }}>Riverside Utd.</div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <div style={{ fontSize: 9.5, fontWeight: 600, color: "#333" }}>Sáb, 25 May · 17:00</div>
        <div style={{ fontSize: 8, color: "#bbb" }}>Estadio Alttez</div>
      </div>
      <button style={{ marginTop: 10, width: "100%", padding: "5px", borderRadius: 7, border: "1px solid rgba(0,0,0,0.1)", background: "none", fontSize: 8.5, fontWeight: 700, cursor: "pointer", color: "#333" }}>
        Ver partido
      </button>
    </InnerCard>
  );
}

function TrainingLoadCard() {
  const fillPoly = `16,96 ${LINE_COORDS.split(" ").slice(1).join(" ")} 254,96`;
  return (
    <InnerCard>
      <CardHead title="Carga de entrenamiento" sub="Últimos 7 días" />
      <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em", color: "#1F1F1D", lineHeight: 1 }}>↑18%</div>
      <div style={{ fontSize: 8, color: "#bbb", marginBottom: 4 }}>vs semana anterior</div>
      <svg viewBox="0 0 270 112" style={{ width: "100%", height: 72, overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="crv-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={COPPER} stopOpacity="0.20" />
            <stop offset="100%" stopColor={COPPER} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[24, 48, 72, 96].map((y) => (
          <line key={y} x1="10" x2="262" y1={y} y2={y} stroke="#ede8e2" strokeWidth="0.7" />
        ))}
        <polygon points={fillPoly} fill="url(#crv-fill)" />
        <polyline points={LINE_COORDS} fill="none" stroke={COPPER} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {LINE_COORDS.split(" ").map((c, i) => {
          const [x, y] = c.split(",");
          return <circle key={i} cx={x} cy={y} r="3" fill="white" stroke={COPPER} strokeWidth="1.6" />;
        })}
        {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
          <text key={d} x={16 + i * 34} y="110" fontSize="8" fill="#c0b9b0" textAnchor="middle">{d}</text>
        ))}
      </svg>
    </InnerCard>
  );
}

function PerformanceCard() {
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <InnerCard>
      <CardHead title="Rendimiento del equipo" sub="Últimos 5 partidos" />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
          <svg viewBox="0 0 60 60" width={60} height={60} style={{ transform: "rotate(-90deg)" }}>
            <circle cx="30" cy="30" r={r} fill="none" stroke="#ede8e2" strokeWidth="7" />
            <circle cx="30" cy="30" r={r} fill="none" stroke="#1F1F1D" strokeWidth="7" strokeDasharray={`${circ * 0.72} ${circ * 0.28}`} strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: "#1F1F1D" }}>72%</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9 }}><CheckCircle2 style={{ width: 11, height: 11, color: "#22c55e" }} /> 3 Victorias</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9 }}><CircleDot style={{ width: 11, height: 11, color: "#9ca3af" }} /> 1 Empate</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9 }}><XCircle style={{ width: 11, height: 11, color: "#f87171" }} /> 1 Derrota</div>
        </div>
      </div>
    </InnerCard>
  );
}

function AttendanceCard() {
  const bars = [46, 38, 50, 42, 62, 72];
  const days = ["L", "M", "X", "J", "V", "S"];
  const maxH = 42;
  return (
    <InnerCard>
      <CardHead title="Asistencia a entrenos" sub="Esta semana" />
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: "#1F1F1D", lineHeight: 1 }}>92%</div>
      <div style={{ fontSize: 8, color: "#bbb", marginBottom: 10 }}>Promedio de asistencia</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: maxH + 16 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: i === 5 ? COPPER : "#1a1a1a", height: `${Math.round((h / 72) * maxH)}px`, minHeight: 4 }} />
            <span style={{ fontSize: 7, color: "#bbb" }}>{days[i]}</span>
          </div>
        ))}
      </div>
    </InnerCard>
  );
}

function PaymentsGridCard() {
  return (
    <InnerCard>
      <CardHead title="Pagos del mes" sub="Mayo 2024" />
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {[
          ["Matrículas", "€12.450", "Pagado",    "#16a34a"],
          ["Cuotas",     "€8.320",  "Pendiente", "#d97706"],
          ["Patrocinio", "€5.000",  "Pagado",    "#16a34a"],
        ].map(([cat, amt, status, color]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f2ede6", paddingBottom: 5 }}>
            <span style={{ fontSize: 8.5, color: "#999" }}>{cat}</span>
            <span style={{ fontSize: 9, fontWeight: 800 }}>{amt}</span>
            <span style={{ fontSize: 7.5, fontWeight: 700, color }}>● {status}</span>
          </div>
        ))}
      </div>
    </InnerCard>
  );
}

// ─── Floating Cards (named exports — positioned by parent) ────────────────────

export function FloatingSessionCard() {
  return (
    <div style={{
      width: 192,
      borderRadius: 16,
      background: SIDEBAR_BG,
      padding: "14px",
      boxShadow: "0 32px 72px rgba(0,0,0,0.32), 0 10px 24px rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderTop: "1px solid rgba(255,255,255,0.11)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Dumbbell style={{ width: 13, height: 13, color: COPPER }} />
        <span style={{ color: "white", fontSize: 10, fontWeight: 800 }}>Sesión de hoy</span>
      </div>
      <div style={{ color: "white", fontSize: 10.5, fontWeight: 700 }}>Fuerza + Resistencia</div>
      <div style={{ color: "rgba(255,255,255,0.50)", fontSize: 8.5, marginTop: 2 }}>16:30 - 18:00</div>
      <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, color: "rgba(255,255,255,0.60)" }}>
          <MapPin style={{ width: 9, height: 9 }} /> Campo 1
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, color: "rgba(255,255,255,0.60)" }}>
          <Users style={{ width: 9, height: 9 }} /> 24 jugadores convocados
        </div>
      </div>
      <button style={{ marginTop: 11, width: "100%", padding: "6px", borderRadius: 7, border: `1px solid ${COPPER}`, background: "none", fontSize: 8.5, fontWeight: 800, color: COPPER, cursor: "pointer" }}>
        Ver sesión
      </button>
    </div>
  );
}

export function FloatingBarCard() {
  const bars = [56, 66, 82, 100];
  return (
    <div style={{
      width: 172,
      borderRadius: 14,
      background: "white",
      padding: "13px",
      boxShadow: "0 22px 52px rgba(0,0,0,0.13), 0 5px 14px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
      borderLeft: "2.5px solid rgba(206, 137, 70,0.45)",
    }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, color: "#1F1F1D" }}>Carga de entrenamiento</div>
      <div style={{ fontSize: 7.5, color: "#bbb", marginBottom: 10 }}>Últimas 4 semanas</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: i === 3 ? COPPER : "#1a1a1a", height: `${Math.round((h / 100) * 44)}px` }} />
            <span style={{ fontSize: 7, color: "#bbb" }}>S{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FloatingDonutCard() {
  const r = 26, circ = 2 * Math.PI * r;
  const paid = circ * 0.82, pending = circ * 0.13, overdue = circ * 0.05;
  return (
    <div style={{
      width: 196,
      borderRadius: 14,
      background: "white",
      padding: "13px",
      boxShadow: "0 16px 40px rgba(0,0,0,0.09), 0 3px 10px rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.06)",
      borderTop: "2.5px solid rgba(206, 137, 70,0.40)",
    }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, color: "#1F1F1D", marginBottom: 10 }}>Pagos del mes</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", width: 58, height: 58, flexShrink: 0 }}>
          <svg viewBox="0 0 60 60" width={58} height={58} style={{ transform: "rotate(-90deg)" }}>
            <circle cx="30" cy="30" r={r} fill="none" stroke="#f2ede6" strokeWidth="7" />
            <circle cx="30" cy="30" r={r} fill="none" stroke="#2f9666" strokeWidth="7" strokeDasharray={`${paid} ${circ - paid}`} strokeLinecap="butt" />
            <circle cx="30" cy="30" r={r} fill="none" stroke="#e6a13e" strokeWidth="7" strokeDasharray={`${pending} ${circ - pending}`} strokeDashoffset={`${-paid}`} strokeLinecap="butt" />
            <circle cx="30" cy="30" r={r} fill="none" stroke="#e45858" strokeWidth="7" strokeDasharray={`${overdue} ${circ - overdue}`} strokeDashoffset={`${-(paid + pending)}`} strokeLinecap="butt" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: "#1F1F1D", textAlign: "center" }}>€20.770</div>
            <div style={{ fontSize: 6.5, color: "#bbb" }}>Total</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 8.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2f9666", flexShrink: 0 }} />
            Pagado <b>82%</b>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e6a13e", flexShrink: 0 }} />
            Pendiente <b>13%</b>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e45858", flexShrink: 0 }} />
            Vencido <b>5%</b>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DashboardPreview() {
  return (
    <div style={{ overflow: "hidden", borderRadius: 20, background: "white", boxShadow: "0 2px 0 rgba(255,255,255,0.8) inset, 0 32px 96px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)", border: "1px solid rgba(0,0,0,0.10)", outline: "1.5px solid rgba(255,255,255,0.75)", display: "flex", flexDirection: "column" }}>
      {/* Window chrome */}
      <div style={{ height: 32, background: "#0f1315", display: "flex", alignItems: "center", padding: "0 14px", gap: 6, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", flexShrink: 0 }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", flexShrink: 0 }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
        <div style={{ marginLeft: "auto" }}>
          <div style={{ width: 120, height: 16, borderRadius: 4, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }} />
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "152px 1fr", flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ background: `linear-gradient(180deg, ${SIDEBAR_BG} 0%, #0c1012 100%)`, padding: "18px 13px", display: "flex", flexDirection: "column", minHeight: 520 }}>
          <SidebarLogo />
          <nav style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 1 }}>
            {MENU.map(({ label, icon: Icon, active }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 9px", borderRadius: 9, fontSize: 9.5, fontWeight: active ? 700 : 400, color: active ? "white" : "rgba(255,255,255,0.52)", background: active ? "rgba(255,255,255,0.055)" : "none", boxShadow: active ? `inset 2.5px 0 0 ${COPPER}` : "none", cursor: "pointer" }}>
                <Icon style={{ width: 12, height: 12, color: active ? COPPER : "rgba(255,255,255,0.42)", flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </nav>
          <div style={{ marginTop: "auto", borderRadius: 9, border: "1px solid rgba(255,255,255,0.07)", padding: "9px 10px", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "#14191c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 900, color: "white", border: `1px solid rgba(206, 137, 70,0.35)`, flexShrink: 0 }}>AT</div>
              <div>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Club Alttez FC</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.38)" }}>Temporada 24/25</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ background: "#fbfaf8", padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.03em", color: "#1F1F1D", margin: 0 }}>Bienvenido, Entrenador</h3>
              <p style={{ fontSize: 8.5, color: "#a0a0a0", margin: "3px 0 0" }}>Aquí tienes un resumen completo de tu club.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Bell style={{ width: 13, height: 13, color: "#999" }} />
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, rgba(206, 137, 70,0.3), rgba(206, 137, 70,0.6))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: COPPER, border: "2px solid white" }}>E</div>
              <div>
                <div style={{ fontSize: 8.5, fontWeight: 700 }}>Entrenador</div>
                <div style={{ fontSize: 7, color: "#bbb" }}>Staff</div>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
            <PlayerListCard />
            <MatchCard />
            <TrainingLoadCard />
            <PerformanceCard />
            <AttendanceCard />
            <PaymentsGridCard />
          </div>
        </main>
      </div>
    </div>
  );
}
