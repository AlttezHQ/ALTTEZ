/**
 * @component SportsCRMPage
 * @description Pagina de producto dedicada para Elevate Sports CRM.
 * Ruta: /servicios/sports-crm
 * NO es un resumen — es la pagina de producto completa.
 * Incluye sección "Así se ve Elevate Sports" con mini-previews CSS/SVG del UI real.
 * @author @Desarrollador (Andres) + @Arquitecto (Carlos) v2.0
 */
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PALETTE as C } from "../../constants/palette";
import { usePageTitle } from "../../hooks/usePageTitle";

// ── Mini UI Previews — representaciones visuales CSS/SVG de los módulos reales ──

/**
 * Preview del Dashboard/Home: stats cards + actividad reciente
 */
function PreviewDashboard() {
  return (
    <div style={{
      width: "100%", background: "#050a14",
      borderRadius: 10, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
      fontFamily: "monospace",
    }}>
      {/* Topbar simulada */}
      <div style={{
        height: 28, background: "rgba(10,10,15,0.9)",
        borderBottom: "1px solid rgba(200,255,0,0.15)",
        display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8ff00" }} />
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Elevate Dashboard
        </div>
        <div style={{ marginLeft: "auto", fontSize: 7, color: "#EF9F27", background: "rgba(239,159,39,0.15)", padding: "1px 6px", borderRadius: 3 }}>
          DEMO
        </div>
      </div>
      {/* Stats cards */}
      <div style={{ padding: "10px 12px 8px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
        {[
          { label: "Plantilla", val: "15", color: "#c8ff00" },
          { label: "Sesiones", val: "14", color: "#7C3AED" },
          { label: "Carga RPE", val: "5.2", color: "#EF9F27" },
          { label: "Partidos", val: "4", color: "#00e5ff" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 6, padding: "6px 8px",
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Activity bars */}
      <div style={{ padding: "0 12px 10px" }}>
        <div style={{ fontSize: 6, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Carga semanal</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 28 }}>
          {[40, 65, 55, 80, 45, 70, 50].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`,
              background: `linear-gradient(180deg, #c8ff00 0%, rgba(200,255,0,0.3) 100%)`,
              borderRadius: "2px 2px 0 0", opacity: 0.7,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Preview de la Pizarra Táctica — campo de fútbol con jugadores posicionados
 */
function PreviewTacticalBoard() {
  const positions = [
    // GK
    { x: 50, y: 85, num: 1, color: "#EF9F27" },
    // Defensas
    { x: 20, y: 68, num: 2, color: "#c8ff00" },
    { x: 38, y: 70, num: 5, color: "#c8ff00" },
    { x: 62, y: 70, num: 6, color: "#c8ff00" },
    { x: 80, y: 68, num: 3, color: "#c8ff00" },
    // Medios
    { x: 28, y: 50, num: 8, color: "#7C3AED" },
    { x: 50, y: 48, num: 10, color: "#7C3AED" },
    { x: 72, y: 50, num: 7, color: "#7C3AED" },
    // Delanteros
    { x: 35, y: 28, num: 11, color: "#00e5ff" },
    { x: 65, y: 28, num: 9, color: "#00e5ff" },
    { x: 50, y: 20, num: 4, color: "#00e5ff" },
  ];
  return (
    <div style={{
      width: "100%", aspectRatio: "3/2",
      background: "linear-gradient(180deg, #1a3a1a 0%, #0d2a0d 100%)",
      borderRadius: 10, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
      position: "relative",
    }}>
      {/* Líneas del campo SVG */}
      <svg width="100%" height="100%" viewBox="0 0 300 200" style={{ position: "absolute", inset: 0 }}>
        {/* Contorno */}
        <rect x="10" y="10" width="280" height="180" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        {/* Línea central */}
        <line x1="150" y1="10" x2="150" y2="190" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
        {/* Círculo central */}
        <circle cx="150" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
        {/* Área grande superior */}
        <rect x="90" y="10" width="120" height="35" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>
        {/* Área grande inferior */}
        <rect x="90" y="155" width="120" height="35" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>
        {/* Área chica superior */}
        <rect x="120" y="10" width="60" height="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
        {/* Área chica inferior */}
        <rect x="120" y="174" width="60" height="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
      </svg>
      {/* Jugadores */}
      {positions.map((p) => (
        <div key={p.num} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          transform: "translate(-50%, -50%)",
          width: 16, height: 16, borderRadius: "50%",
          background: p.color,
          border: "1.5px solid rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 5, fontWeight: 800, color: "#0a0a0f",
          boxShadow: `0 0 6px ${p.color}88`,
          zIndex: 2,
        }}>
          {p.num}
        </div>
      ))}
      {/* Label */}
      <div style={{
        position: "absolute", bottom: 6, left: 0, right: 0,
        textAlign: "center", fontSize: 7,
        color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.5px",
      }}>
        4-3-3 · Elevate Tactical Board
      </div>
    </div>
  );
}

/**
 * Preview del módulo de Entrenamiento — tabla de plantilla con RPE semáforo
 */
function PreviewEntrenamiento() {
  const roster = [
    { name: "A. García",     pos: "POR", rpe: 3, salud: 70, status: "green"  },
    { name: "C. Martínez",   pos: "DEF", rpe: 7, salud: 30, status: "red"    },
    { name: "L. Rodríguez",  pos: "MED", rpe: 5, salud: 50, status: "yellow" },
    { name: "J. Pérez",      pos: "DEL", rpe: 2, salud: 80, status: "green"  },
    { name: "R. López",      pos: "DEF", rpe: 6, salud: 40, status: "yellow" },
  ];
  const statusColor = { green: "#1D9E75", yellow: "#EF9F27", red: "#E24B4A" };

  return (
    <div style={{
      width: "100%",
      background: "#050a14",
      borderRadius: 10, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Header */}
      <div style={{
        padding: "8px 12px",
        background: "rgba(124,58,237,0.08)",
        borderBottom: "1px solid rgba(124,58,237,0.2)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#7C3AED" }} />
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Sesión de entrenamiento · RPE Borg CR-10
        </div>
      </div>
      {/* Tabla */}
      <div style={{ padding: "6px 0" }}>
        {roster.map((a, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center",
            padding: "4px 12px", gap: 8,
            borderBottom: i < roster.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: `${statusColor[a.status]}22`,
              border: `1px solid ${statusColor[a.status]}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 5, fontWeight: 700, color: statusColor[a.status], flexShrink: 0,
            }}>
              {a.pos.slice(0, 1)}
            </div>
            <div style={{ flex: 1, fontSize: 7, color: "rgba(255,255,255,0.7)" }}>{a.name}</div>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", width: 20 }}>{a.pos}</div>
            {/* RPE indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)" }}>RPE</div>
              <div style={{
                fontSize: 8, fontWeight: 800,
                color: statusColor[a.status],
                background: `${statusColor[a.status]}18`,
                padding: "1px 5px", borderRadius: 3,
              }}>
                {a.rpe}
              </div>
            </div>
            {/* Barra de salud */}
            <div style={{ width: 40, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                width: `${a.salud}%`, height: "100%",
                background: `linear-gradient(90deg, ${statusColor[a.status]}, ${statusColor[a.status]}88)`,
                borderRadius: 2,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Preview del Match Center — ficha de partido con Spider chart simplificado
 */
function PreviewMatchCenter() {
  // Polígono radar simplificado para 6 métricas
  const metrics = [
    { label: "Goles",    val: 0.85 },
    { label: "Asist.",   val: 0.70 },
    { label: "Duelos",   val: 0.60 },
    { label: "Recup.",   val: 0.75 },
    { label: "Minutos",  val: 0.90 },
    { label: "Presión",  val: 0.55 },
  ];

  const cx = 50, cy = 50, r = 36;
  const n = metrics.length;
  const getPoint = (i, scale) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + r * scale * Math.cos(angle),
      y: cy + r * scale * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const playerPoints = metrics.map((m, i) => getPoint(i, m.val));
  const polyPath = playerPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div style={{
      width: "100%",
      background: "#050a14",
      borderRadius: 10, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Header resultado */}
      <div style={{
        padding: "8px 12px",
        background: "rgba(0,229,255,0.06)",
        borderBottom: "1px solid rgba(0,229,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "1px" }}>Match Center</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>Atlético Sur</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#c8ff00", letterSpacing: "2px" }}>3 - 1</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>Mi Club</div>
        </div>
      </div>
      {/* Spider + stats */}
      <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", gap: 12 }}>
        {/* Spider SVG */}
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
          {/* Grid */}
          {gridLevels.map((scale, li) => {
            const pts = Array.from({ length: n }, (_, i) => getPoint(i, scale));
            const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
            return <path key={li} d={path} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />;
          })}
          {/* Axes */}
          {Array.from({ length: n }, (_, i) => {
            const outer = getPoint(i, 1.0);
            return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />;
          })}
          {/* Player area */}
          <path d={polyPath} fill="rgba(200,255,0,0.12)" stroke="#c8ff00" strokeWidth="1.2" />
          {/* Dots */}
          {playerPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill="#c8ff00" />
          ))}
          {/* Labels */}
          {metrics.map((m, i) => {
            const lp = getPoint(i, 1.35);
            return (
              <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="4.5" fill="rgba(255,255,255,0.4)" fontFamily="monospace">
                {m.label}
              </text>
            );
          })}
        </svg>
        {/* Top scorers */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 6, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Top Elevate Score</div>
          {[
            { name: "A. García",   score: 9.2, pos: "DEL" },
            { name: "J. Pérez",    score: 7.8, pos: "MED" },
            { name: "L. Castro",   score: 6.5, pos: "DEF" },
          ].map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
            }}>
              <div style={{ fontSize: 6, color: "rgba(255,255,255,0.25)", width: 8 }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 7, color: "rgba(255,255,255,0.65)" }}>{p.name}</div>
              <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", marginRight: 4 }}>{p.pos}</div>
              <div style={{
                fontSize: 8, fontWeight: 800, color: "#c8ff00",
                background: "rgba(200,255,0,0.1)", padding: "1px 6px", borderRadius: 3,
              }}>
                {p.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Preview del módulo de Finanzas — semáforo de recaudo + movimientos
 */
function PreviewFinanzas() {
  const recaudo = 68; // porcentaje del mes
  return (
    <div style={{
      width: "100%",
      background: "#050a14",
      borderRadius: 10, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Header */}
      <div style={{
        padding: "8px 12px",
        background: "rgba(239,159,39,0.06)",
        borderBottom: "1px solid rgba(239,159,39,0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "1px" }}>Finanzas del Club</div>
        <div style={{ fontSize: 7, color: "#EF9F27" }}>Mar 2026</div>
      </div>
      <div style={{ padding: "10px 12px" }}>
        {/* Recaudo */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>Recaudo mensual</div>
            <div style={{ fontSize: 8, fontWeight: 800, color: "#EF9F27" }}>{recaudo}%</div>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${recaudo}%`, height: "100%",
              background: "linear-gradient(90deg, #EF9F27, #c8ff00)",
              borderRadius: 3,
            }} />
          </div>
        </div>
        {/* Movimientos */}
        {[
          { desc: "Mensualidad A. García", tipo: "ingreso",  val: "+$120.000" },
          { desc: "Arriendo cancha",       tipo: "egreso",   val: "-$350.000" },
          { desc: "Mensualidad L. Pérez",  tipo: "ingreso",  val: "+$120.000" },
        ].map((m, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "4px 0",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
              background: m.tipo === "ingreso" ? "#1D9E75" : "#E24B4A",
            }} />
            <div style={{ flex: 1, fontSize: 6.5, color: "rgba(255,255,255,0.5)" }}>{m.desc}</div>
            <div style={{ fontSize: 7, fontWeight: 700, color: m.tipo === "ingreso" ? "#1D9E75" : "#E24B4A" }}>
              {m.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sección "Así se ve Elevate Sports" ──

const PREVIEW_SLIDES = [
  {
    id: "dashboard",
    title: "Dashboard Operativo",
    description: "Vista ejecutiva con métricas clave del club en tiempo real. Carga semanal, estado del plantel, finanzas y próximos partidos en un vistazo.",
    tag: "Home",
    tagColor: C.neon,
    Preview: PreviewDashboard,
  },
  {
    id: "tactical",
    title: "Pizarra Táctica FIFA",
    description: "Editor de formaciones drag & drop inspirado en FIFA. Posiciona tus 11 titulares, define la táctica y compártela con el plantel antes del partido.",
    tag: "Gestión Plantilla",
    tagColor: "#7C3AED",
    Preview: PreviewTacticalBoard,
  },
  {
    id: "entrenamiento",
    title: "Control de Carga RPE",
    description: "Registro individual de esfuerzo percibido (Borg CR-10) por sesión. El semáforo de readiness detecta sobrecarga antes de que se convierta en lesión.",
    tag: "Entrenamiento",
    tagColor: "#7C3AED",
    Preview: PreviewEntrenamiento,
  },
  {
    id: "matchcenter",
    title: "Match Center",
    description: "Estadísticas post-partido con Elevate Score propio. Spider chart por jugador, recomendaciones automáticas y cruce de datos con fatiga acumulada.",
    tag: "Match Center",
    tagColor: "#00e5ff",
    Preview: PreviewMatchCenter,
  },
  {
    id: "finanzas",
    title: "Finanzas del Club",
    description: "Control de mensualidades, caja de movimientos y semáforo de recaudo mensual. Reportes ejecutivos listos para la junta directiva.",
    tag: "Administración",
    tagColor: C.amber,
    Preview: PreviewFinanzas,
  },
];

function ProductPreviewSection({ navigate }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  const slide = PREVIEW_SLIDES[active];
  const ActivePreview = slide.Preview;

  return (
    <section
      ref={ref}
      style={{
        padding: "80px 32px",
        background: "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.04) 50%, transparent 100%)",
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Título sección */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 16,
            background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)",
            fontSize: 10, fontWeight: 600, letterSpacing: "1.5px",
            textTransform: "uppercase", color: "#7C3AED", marginBottom: 20,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7C3AED" }} />
            Así se ve Elevate Sports
          </div>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 40px)",
            fontWeight: 800, color: "white",
            margin: "0 0 14px",
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
          }}>
            El producto, antes de registrarte
          </h2>
          <p style={{ fontSize: 14, color: C.textMuted, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Cada módulo fue diseñado con un cuerpo técnico real. Sin plantillas genéricas.
            Sin dashboards de relleno. Solo lo que importa para operar un club de alto nivel.
          </p>
        </motion.div>

        {/* Tabs de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="scrm-preview-tabs"
          style={{
            display: "flex", gap: 6, marginBottom: 32,
            flexWrap: "wrap", justifyContent: "center",
          }}
        >
          {PREVIEW_SLIDES.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "6px 16px",
                fontSize: 11, fontWeight: active === i ? 700 : 400,
                textTransform: "uppercase", letterSpacing: "1px",
                borderRadius: 20, border: "1px solid",
                borderColor: active === i ? s.tagColor : "rgba(255,255,255,0.1)",
                background: active === i ? `${s.tagColor}18` : "transparent",
                color: active === i ? s.tagColor : C.textMuted,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {s.tag}
            </motion.button>
          ))}
        </motion.div>

        {/* Preview panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="scrm-preview-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 40, alignItems: "center",
          }}
        >
          {/* Panel de preview */}
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: 20,
              background: "rgba(255,255,255,0.015)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: 16,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Barra de "ventana" */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6, marginBottom: 14,
            }}>
              {["#E24B4A", "#EF9F27", "#1D9E75"].map((col) => (
                <div key={col} style={{ width: 8, height: 8, borderRadius: "50%", background: col, opacity: 0.7 }} />
              ))}
              <div style={{
                flex: 1, height: 18,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 4, marginLeft: 8,
                display: "flex", alignItems: "center", paddingLeft: 10,
              }}>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)" }}>elevate-sports.app / crm</div>
              </div>
            </div>
            <ActivePreview />
          </motion.div>

          {/* Info del módulo */}
          <motion.div
            key={`info-${slide.id}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 10px", borderRadius: 10,
              background: `${slide.tagColor}18`,
              border: `1px solid ${slide.tagColor}35`,
              fontSize: 9, fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", color: slide.tagColor,
              marginBottom: 16,
            }}>
              {slide.tag}
            </div>
            <h3 style={{
              fontSize: "clamp(20px, 3vw, 30px)",
              fontWeight: 800, color: "white",
              margin: "0 0 14px",
              fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            }}>
              {slide.title}
            </h3>
            <p style={{
              fontSize: 13, color: C.textMuted, lineHeight: 1.8, margin: "0 0 24px",
            }}>
              {slide.description}
            </p>

            {/* Navegación de slides */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <motion.button
                onClick={() => setActive((a) => (a - 1 + PREVIEW_SLIDES.length) % PREVIEW_SLIDES.length)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "white",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>

              <div style={{ display: "flex", gap: 5 }}>
                {PREVIEW_SLIDES.map((_, i) => (
                  <div key={i} onClick={() => setActive(i)} style={{
                    width: i === active ? 18 : 6, height: 6,
                    borderRadius: 3,
                    background: i === active ? slide.tagColor : "rgba(255,255,255,0.15)",
                    transition: "all 0.25s",
                    cursor: "pointer",
                  }} />
                ))}
              </div>

              <motion.button
                onClick={() => setActive((a) => (a + 1) % PREVIEW_SLIDES.length)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "white",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 24px ${C.neonGlow}` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/crm?demo=true")}
              style={{
                marginTop: 28, padding: "12px 32px",
                fontSize: 12, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "1.5px",
                background: C.neon, color: "#0a0a0f",
                border: "none", borderRadius: 8, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Probar ahora — gratis
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .scrm-preview-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .scrm-preview-tabs { gap: 4px !important; }
        }
      `}</style>
    </section>
  );
}

const MODULES = [
  {
    title: "Gestion de Plantilla",
    description: "Registro completo de la plantilla con posicion, disponibilidad, estado fisico y datos de contacto de cada deportista. Visualizacion tipo FIFA con pizarra tactica interactiva y formaciones drag & drop.",
    accent: C.neon,
    features: ["Registro de plantilla", "Pizarra tactica FIFA", "Formaciones drag & drop", "Historial de disponibilidad", "Perfiles individuales"],
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="18" cy="22" r="3" fill="currentColor" opacity="0.5"/>
        <circle cx="30" cy="22" r="3" fill="currentColor" opacity="0.5"/>
        <circle cx="24" cy="30" r="3" fill="currentColor" opacity="0.5"/>
        <line x1="24" y1="10" x2="24" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
        <circle cx="24" cy="19" r="8" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
      </svg>
    ),
  },
  {
    title: "Ciencia RPE",
    description: "Motor de fatiga basado en la escala Borg CR-10. Cada sesion registra la percepcion de esfuerzo de cada deportista. El sistema calcula el indice de readiness, genera alertas de sobrecarga antes de que ocurra la lesion y toma health snapshots post-sesion.",
    accent: "#7C3AED",
    features: ["Escala Borg CR-10", "Semaforo de readiness", "Alertas de sobrecarga", "Health Snapshots automaticos", "Historial de carga aguda/cronica"],
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M8 36l8-14 7 8 6-12 7 6 4-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="14" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M24 20v6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 14h8" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
  },
  {
    title: "Finanzas del Club",
    description: "Administracion financiera integral del club. Control de mensualidades por deportista, registro de movimientos de caja, semaforo de recaudo mensual y exportacion de reportes ejecutivos para la junta directiva.",
    accent: C.amber,
    features: ["Control de mensualidades", "Caja de movimientos", "Semaforo de recaudo", "Reportes ejecutivos PDF", "Balance automatico"],
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="14" width="32" height="20" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 22h32" stroke="currentColor" strokeWidth="1"/>
        <circle cx="36" cy="30" r="2.5" fill="currentColor" opacity="0.5"/>
        <path d="M14 30h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 26h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
];

const STATS = [
  { value: "6", label: "Modulos integrados", accent: C.neon },
  { value: "15+", label: "Clubes en piloto", accent: "#7C3AED" },
  { value: "500+", label: "Atletas gestionados", accent: C.amber },
  { value: "<3s", label: "Tiempo de carga", accent: "#00e5ff" },
];

function ModuleCard({ mod, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="scrm-module-card"
      style={{
        display: "grid",
        gridTemplateColumns: index % 2 === 0 ? "1fr 1.2fr" : "1.2fr 1fr",
        gap: 40,
        alignItems: "center",
        padding: "60px 0",
        borderBottom: index < MODULES.length - 1 ? `1px solid ${C.border}` : "none",
      }}
    >
      {/* Info side */}
      <div className="scrm-module-info" style={{ order: index % 2 === 0 ? 1 : 2 }}>
        <div style={{ color: mod.accent, marginBottom: 16 }}>{mod.icon}</div>
        <h3 style={{
          fontSize: 28, fontWeight: 800, color: "white",
          margin: "0 0 16px",
          fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        }}>
          {mod.title}
        </h3>
        <p style={{
          fontSize: 14, color: C.textMuted, lineHeight: 1.8,
          margin: "0 0 24px",
        }}>
          {mod.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {mod.features.map((f, i) => (
            <span key={i} style={{
              fontSize: 11, fontWeight: 500, padding: "5px 12px",
              borderRadius: 6, background: `${mod.accent}10`,
              border: `1px solid ${mod.accent}25`, color: mod.accent,
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Visual side — panel elevado */}
      <motion.div
        whileHover={{ rotateY: 2, rotateX: -2, y: -8 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="scrm-module-visual"
        style={{
          order: index % 2 === 0 ? 2 : 1,
          padding: "40px 32px",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          boxShadow: `0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
          perspective: "1000px",
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ color: mod.accent, marginBottom: 16, opacity: 0.6 }}>{mod.icon}</div>
          <div style={{
            fontSize: 11, color: C.textHint, textTransform: "uppercase",
            letterSpacing: "2px",
          }}>
            Modulo
          </div>
          <div style={{
            fontSize: 22, fontWeight: 700, color: mod.accent,
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
          }}>
            {mod.title}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SportsCRMPage() {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });
  usePageTitle("Elevate Sports CRM — El producto");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 767px) {
        .scrm-hero { padding: 48px 20px 40px !important; }
        .scrm-hero h1 { font-size: clamp(28px, 8vw, 40px) !important; }
        .scrm-cta-row { flex-direction: column !important; align-items: stretch !important; }
        .scrm-cta-row button { text-align: center !important; }
        .scrm-modules-section { padding: 16px 20px 48px !important; }
        .scrm-module-card {
          grid-template-columns: 1fr !important;
          gap: 24px !important;
          padding: 32px 0 !important;
        }
        .scrm-module-info { order: 1 !important; }
        .scrm-module-visual { order: 2 !important; min-height: 140px !important; padding: 24px 20px !important; }
        .scrm-bottom-cta { padding: 40px 20px 56px !important; }
        .scrm-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div style={{ overflowX: "hidden" }}>
      {/* ── Product Hero ── */}
      <section className="scrm-hero" style={{
        padding: "80px 32px 60px",
        textAlign: "center",
        position: "relative",
      }}>
        {/* Background orb */}
        <div style={{
          position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ position: "relative", zIndex: 2 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 16,
            background: C.neonDim, border: `1px solid ${C.neonBorder}`,
            fontSize: 10, fontWeight: 600, letterSpacing: "1.5px",
            textTransform: "uppercase", color: C.neon, marginBottom: 24,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: C.neon, boxShadow: `0 0 8px ${C.neonGlow}`,
            }} />
            Producto Estrella
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 800, lineHeight: 1.1,
            color: "white", margin: "0 0 20px",
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
          }}>
            Elevate Sports{" "}
            <span style={{
              background: `linear-gradient(135deg, ${C.neon}, #7C3AED)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              CRM
            </span>
          </h1>

          <p style={{
            fontSize: 16, color: C.textMuted, maxWidth: 650,
            margin: "0 auto 40px", lineHeight: 1.7,
          }}>
            La herramienta de estandarizacion operativa para clubes deportivos en Colombia.
            Gestion de plantilla, ciencia del entrenamiento, salud financiera y analytics
            en un ecosistema disenado para cuerpos tecnicos que toman decisiones con datos.
          </p>

          {/* CTAs */}
          <div className="scrm-cta-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${C.neonGlow}` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/crm")}
              style={{
                padding: "14px 40px", fontSize: 14, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "1.5px",
                background: C.neon, color: "#0a0a0f", border: "none",
                borderRadius: 8, cursor: "pointer",
              }}
            >
              Acceder al CRM
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, borderColor: "#7C3AED" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/crm?demo=true")}
              style={{
                padding: "14px 40px", fontSize: 14, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "1.5px",
                background: "rgba(124,58,237,0.1)", color: "#7C3AED",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 8, cursor: "pointer",
              }}
            >
              Explorar entorno demo
            </motion.button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="scrm-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 16, maxWidth: 700, margin: "48px auto 0",
          }}
        >
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: "16px 12px",
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.accent }}>{s.value}</div>
              <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Modules Detail ── */}
      <section className="scrm-modules-section" style={{ padding: "20px 32px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{
          textAlign: "center", marginBottom: 40,
          fontSize: 10, fontWeight: 600, letterSpacing: "3px",
          textTransform: "uppercase", color: "#7C3AED",
        }}>
          Modulos del ecosistema
        </div>

        {MODULES.map((mod, i) => (
          <ModuleCard key={mod.title} mod={mod} index={i} />
        ))}
      </section>

      {/* ── Product Previews — "Así se ve Elevate Sports" ── */}
      <ProductPreviewSection navigate={navigate} />

      {/* ── Bottom CTA ── */}
      <section className="scrm-bottom-cta" style={{
        padding: "60px 32px 80px",
        textAlign: "center",
        borderTop: `1px solid ${C.border}`,
      }}>
        <h2 style={{
          fontSize: 28, fontWeight: 800, color: "white",
          margin: "0 0 16px",
          fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        }}>
          Tu club opera con intuicion o con datos?
        </h2>
        <p style={{
          fontSize: 14, color: C.textMuted, marginBottom: 32,
          maxWidth: 450, margin: "0 auto 32px",
        }}>
          Accede al entorno demo y experimenta en minutos lo que Elevate hace por la
          toma de decisiones de tu cuerpo tecnico.
        </p>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${C.neonGlow}` }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/crm?demo=true")}
          style={{
            padding: "16px 48px", fontSize: 15, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "1.5px",
            background: C.neon, color: "#0a0a0f", border: "none",
            borderRadius: 8, cursor: "pointer",
          }}
        >
          Acceder al entorno demo
        </motion.button>
      </section>
    </div>
  );
}
