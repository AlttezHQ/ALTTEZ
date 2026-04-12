/**
 * @component Reportes
 * @description Panel de reportes y KPIs del CRM ALTTEZ.
 * Incluye sparklines, KPI cards interactivas y resumen de sesiones.
 */

import { useStore } from "../../shared/store/useStore";
import { PALETTE as C } from "../../shared/tokens/palette";

// Inject hover styles for KPI cards
if (typeof document !== "undefined" && !document.getElementById("reportes-kpi-styles")) {
  const s = document.createElement("style");
  s.id = "reportes-kpi-styles";
  s.textContent = `
    .rep-kpi-card { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
    .rep-kpi-card:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 40px rgba(0,0,0,0.6); }
    .rep-session-row { transition: background 0.15s ease; }
    .rep-session-row:hover { background: rgba(255,255,255,0.06) !important; }
    .rep-secondary-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .rep-secondary-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.5); }
    @media (max-width: 767px) {
      .rep-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .rep-bottom-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(s);
}

// Inline micro-sparkline: renders last N values as an SVG bar chart
function MiniSparkline({ values, color, height = 28, width = 56 }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  const barW = Math.floor((width - (values.length - 1) * 2) / values.length);
  return (
    <svg width={width} height={height} style={{ display:"block" }}>
      {values.map((v, i) => {
        const barH = Math.max(Math.round((v / max) * height), 2);
        const x = i * (barW + 2);
        const y = height - barH;
        return <rect key={i} x={x} y={y} width={barW} height={barH} rx={1} fill={color} opacity={i === values.length - 1 ? 1 : 0.45} />;
      })}
    </svg>
  );
}

// Trend arrow for KPI cards
function TrendArrow({ trend }) {
  if (trend === 0) return <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>—</span>;
  const up = trend > 0;
  return (
    <span style={{ fontSize:10, fontWeight:700, color: up ? C.green : C.danger, display:"flex", alignItems:"center", gap:2 }}>
      {up ? "▲" : "▼"} {Math.abs(trend)}{typeof trend === "number" && Number.isInteger(trend) ? "" : "%"}
    </span>
  );
}

export function Reportes({ onNavigate }) {
  const athletes = useStore(state => state.athletes);
  const historial = useStore(state => state.historial);
  const matchStats = useStore(state => state.matchStats);
  const finanzas = useStore(state => state.finanzas);
  const movs = finanzas.movimientos || [];
  const ingresos = movs.filter(m => m.tipo === "ingreso").reduce((s,m) => s+m.monto, 0);
  const egresos = movs.filter(m => m.tipo === "egreso").reduce((s,m) => s+m.monto, 0);
  const balance = ingresos - egresos;
  const pagados = (finanzas.pagos || []).filter(p => p.estado === "pagado").length;

  // Calcular asistencia promedio desde historial
  const asistenciaPct = historial.length > 0
    ? Math.round((historial.reduce((s, h) => s + h.presentes, 0) / historial.reduce((s, h) => s + h.total, 1)) * 100)
    : 0;

  // Ultimas 8 sesiones para sparkline
  const last8 = historial.slice(0, 8).reverse();
  const sparkAsistencia = last8.map(s => s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0);
  const sparkSesiones = last8.map((_, i) => i + 1);

  // Calcular tendencia: comparar ultima sesion vs promedio previo
  const calcTrend = (arr) => {
    if (arr.length < 2) return 0;
    const last = arr[arr.length - 1];
    const prevAvg = arr.slice(0, -1).reduce((a, b) => a + b, 0) / (arr.length - 1);
    if (prevAvg === 0) return 0;
    return Math.round(((last - prevAvg) / prevAvg) * 100);
  };

  const kpiCards = [
    {
      label: "Sesiones totales",
      value: historial.length,
      color: C.green,
      dest: "entrenamiento",
      sparkValues: sparkSesiones,
      trend: historial.length > 1 ? 1 : 0,
      trendDisplay: historial.length > 0 ? `+${Math.min(historial.length, 3)} esta semana` : "Sin sesiones",
    },
    {
      label: "Asistencia promedio",
      value: asistenciaPct + "%",
      color: C.neon,
      dest: "calendario",
      sparkValues: sparkAsistencia,
      trend: calcTrend(sparkAsistencia),
      trendDisplay: asistenciaPct >= 75 ? "Buen nivel" : "Mejorar",
    },
    {
      label: "Partidos jugados",
      value: matchStats.played,
      color: C.purple,
      dest: "partidos",
      sparkValues: [matchStats.won, matchStats.drawn, matchStats.lost].filter(v => v > 0),
      trend: matchStats.won > matchStats.lost ? 1 : matchStats.won < matchStats.lost ? -1 : 0,
      trendDisplay: `${matchStats.won}G ${matchStats.drawn}E ${matchStats.lost}P`,
    },
    {
      label: "Plantilla activa",
      value: athletes.length,
      color: C.amber,
      dest: "plantilla",
      sparkValues: athletes.length > 0 ? [athletes.filter(a=>a.status==="P").length, athletes.filter(a=>a.status==="A").length, athletes.filter(a=>a.status==="L").length].filter(v => v >= 0) : [],
      trend: 0,
      trendDisplay: `${athletes.filter(a=>a.status==="L").length} en recuperacion`,
    },
  ];

  return (
    <div style={{ padding:"20px 16px", maxWidth:900, margin:"0 auto" }}>

      {/* KPI Cards interactivas */}
      <div className="rep-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className="rep-kpi-card"
            onClick={() => onNavigate && onNavigate(kpi.dest)}
            style={{
              background:"rgba(255,255,255,0.03)",
              backdropFilter:"blur(16px)",
              WebkitBackdropFilter:"blur(16px)",
              border:`1px solid rgba(255,255,255,0.08)`,
              borderTop:`3px solid ${kpi.color}`,
              borderRadius:12,
              padding:"16px 14px",
              boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
              cursor:"pointer",
              position:"relative",
              overflow:"hidden",
            }}
          >
            {/* Ambient glow */}
            <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:kpi.color, opacity:0.04, filter:"blur(20px)", pointerEvents:"none" }} />
            <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.3)", marginBottom:10 }}>{kpi.label}</div>
            <div style={{ fontSize:28, fontWeight:700, color:kpi.color, lineHeight:1, marginBottom:8 }}>{kpi.value}</div>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:6 }}>
              <div>
                <TrendArrow trend={kpi.trend} />
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", marginTop:3 }}>{kpi.trendDisplay}</div>
              </div>
              {kpi.sparkValues.length > 1 && (
                <MiniSparkline values={kpi.sparkValues} color={kpi.color} />
              )}
            </div>
            {/* CTA */}
            <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:9, color:kpi.color, textTransform:"uppercase", letterSpacing:"1px", fontWeight:600 }}>
              Profundizar →
            </div>
          </div>
        ))}
      </div>

      {/* Fila secundaria: record de partidos + resumen financiero */}
      <div className="rep-bottom-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
        <div
          className="rep-secondary-card"
          onClick={() => onNavigate && onNavigate("partidos")}
          style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", border:`1px solid rgba(255,255,255,0.08)`, borderRadius:12, padding:18, boxShadow:"0 4px 20px rgba(0,0,0,0.35)", cursor:"pointer" }}
        >
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.3)", marginBottom:14 }}>Rendimiento en competencia</div>
          <div style={{ display:"flex", gap:20, alignItems:"flex-end" }}>
            {[
              { val:matchStats.won, lbl:"Ganados", color:C.green },
              { val:matchStats.drawn, lbl:"Empatados", color:"rgba(255,255,255,0.45)" },
              { val:matchStats.lost, lbl:"Perdidos", color:C.danger },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize:30, fontWeight:700, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px", marginTop:4 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14 }}>
            <div style={{ display:"flex", gap:2, height:4 }}>
              {matchStats.played > 0 && (
                <>
                  <div style={{ flex:matchStats.won || 0, background:C.green, borderRadius:"2px 0 0 2px", minWidth: matchStats.won > 0 ? 4 : 0 }} />
                  <div style={{ flex:matchStats.drawn || 0, background:"rgba(255,255,255,0.3)", minWidth: matchStats.drawn > 0 ? 4 : 0 }} />
                  <div style={{ flex:matchStats.lost || 0, background:C.danger, borderRadius:"0 2px 2px 0", minWidth: matchStats.lost > 0 ? 4 : 0 }} />
                </>
              )}
              {matchStats.played === 0 && <div style={{ flex:1, background:"rgba(255,255,255,0.08)", borderRadius:2 }} />}
            </div>
          </div>
        </div>

        <div
          className="rep-secondary-card"
          onClick={() => onNavigate && onNavigate("admin")}
          style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", border:`1px solid rgba(255,255,255,0.08)`, borderRadius:12, padding:18, boxShadow:"0 4px 20px rgba(0,0,0,0.35)", cursor:"pointer" }}
        >
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.3)", marginBottom:14 }}>Salud financiera</div>
          <div style={{ display:"flex", gap:20, alignItems:"flex-end" }}>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color: balance >= 0 ? C.green : C.danger, lineHeight:1 }}>
                ${Math.abs(balance).toLocaleString("es-CO")}
              </div>
              <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px", marginTop:4 }}>
                {balance >= 0 ? "Superavit" : "Deficit"}
              </div>
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color:C.purple, lineHeight:1 }}>
                {pagados}/{athletes.length}
              </div>
              <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px", marginTop:4 }}>Al dia</div>
            </div>
          </div>
          <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width: athletes.length > 0 ? `${Math.round((pagados / athletes.length) * 100)}%` : "0%", background:C.purple, transition:"width 0.4s ease" }} />
            </div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>
              {athletes.length > 0 ? Math.round((pagados / athletes.length) * 100) : 0}% al dia
            </div>
          </div>
        </div>
      </div>

      {/* Ultimas 5 sesiones — panel detallado */}
      <div style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", border:`1px solid rgba(255,255,255,0.08)`, borderRadius:12, padding:18, boxShadow:"0 4px 20px rgba(0,0,0,0.35)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.3)" }}>Ultimas sesiones</div>
          <button
            onClick={() => onNavigate && onNavigate("entrenamiento")}
            style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"1px", color:C.green, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, padding:"4px 8px" }}
          >
            Ver historial →
          </button>
        </div>
        {historial.length === 0 && (
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"center", padding:"24px 0" }}>Sin sesiones registradas aun</div>
        )}
        {historial.slice(0, 5).map((s, i) => {
          const asist = s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0;
          const rpeNum = Number(s.rpeAvg);
          const rpeColor = isNaN(rpeNum) ? "rgba(255,255,255,0.3)" : rpeNum <= 3 ? C.green : rpeNum <= 7 ? C.amber : C.danger;
          return (
            <div
              key={i}
              className="rep-session-row"
              onClick={() => onNavigate && onNavigate("entrenamiento")}
              style={{
                display:"flex",
                alignItems:"center",
                justifyContent:"space-between",
                padding:"10px 12px",
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                borderRadius:8,
                marginBottom:2,
                cursor:"pointer",
                flexWrap:"wrap",
                gap:8,
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                <div style={{ width:3, height:32, borderRadius:2, background: s.tipo === "Táctica" || s.tipo === "Tactica" ? C.purple : s.tipo === "Físico" || s.tipo === "Fisico" ? C.amber : s.tipo === "Partido" || s.tipo === "Partido interno" ? C.danger : C.green, flexShrink:0 }} />
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"white" }}>Sesion #{s.num} — {s.fecha}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:1 }}>{s.tipo || "Sin tipo"}{s.nota ? " · " + s.nota.slice(0, 40) + (s.nota.length > 40 ? "…" : "") : ""}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.green }}>{asist}%</div>
                  <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Asist.</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color: rpeColor }}>{s.rpeAvg ?? "—"}</div>
                  <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.5px" }}>RPE</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.6)" }}>{s.presentes}/{s.total}</div>
                  <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Pres.</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Reportes;
