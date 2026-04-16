/**
 * @component Reportes
 * @description Panel de reportes y KPIs del CRM ALTTEZ.
 * Incluye sparklines, KPI cards interactivas y resumen de sesiones.
 * @version 2.0
 */

import { useStore } from "../../shared/store/useStore";
import { PALETTE as C } from "../../shared/tokens/palette";
import GlassPanel   from "../../shared/ui/GlassPanel";
import SectionLabel from "../../shared/ui/SectionLabel";

// CSS responsive movido a index.css (.rep-kpi-card, .rep-session-row, etc.)

// ── Helpers ─────────────────────────────────────────────────────────────────
function MiniSparkline({ values, color, height = 28, width = 56 }) {
  if (!values || values.length === 0) return null;
  const max  = Math.max(...values, 1);
  const barW = Math.floor((width - (values.length - 1) * 2) / values.length);
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {values.map((v, i) => {
        const barH = Math.max(Math.round((v / max) * height), 2);
        return <rect key={i} x={i * (barW + 2)} y={height - barH} width={barW} height={barH} rx={1} fill={color} opacity={i === values.length - 1 ? 1 : 0.45} />;
      })}
    </svg>
  );
}

function TrendArrow({ trend }) {
  if (trend === 0) return <span style={{ fontSize: "var(--fs-caption)", color: C.textHint }}>—</span>;
  const up = trend > 0;
  return (
    <span style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-bold)", color: up ? C.green : C.danger, display: "flex", alignItems: "center", gap: 2 }}>
      {up ? "▲" : "▼"} {Math.abs(trend)}{Number.isInteger(trend) ? "" : "%"}
    </span>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export function Reportes({ onNavigate }) {
  const athletes   = useStore(state => state.athletes);
  const historial  = useStore(state => state.historial);
  const matchStats = useStore(state => state.matchStats);
  const finanzas   = useStore(state => state.finanzas);

  const movs     = finanzas.movimientos || [];
  const ingresos = movs.filter(m => m.tipo === "ingreso").reduce((s, m) => s + m.monto, 0);
  const egresos  = movs.filter(m => m.tipo === "egreso").reduce((s, m) => s + m.monto, 0);
  const balance  = ingresos - egresos;
  const pagados  = (finanzas.pagos || []).filter(p => p.estado === "pagado").length;

  const asistenciaPct = historial.length > 0
    ? Math.round((historial.reduce((s, h) => s + h.presentes, 0) / historial.reduce((s, h) => s + h.total, 1)) * 100)
    : 0;

  const last8          = historial.slice(0, 8).reverse();
  const sparkAsistencia = last8.map(s => s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0);
  const sparkSesiones  = last8.map((_, i) => i + 1);

  const calcTrend = (arr) => {
    if (arr.length < 2) return 0;
    const last    = arr[arr.length - 1];
    const prevAvg = arr.slice(0, -1).reduce((a, b) => a + b, 0) / (arr.length - 1);
    return prevAvg === 0 ? 0 : Math.round(((last - prevAvg) / prevAvg) * 100);
  };

  const kpiCards = [
    { label: "Sesiones totales",    value: historial.length,   color: C.green,  dest: "entrenamiento", sparkValues: sparkSesiones,  trend: historial.length > 1 ? 1 : 0, trendDisplay: historial.length > 0 ? `+${Math.min(historial.length, 3)} esta semana` : "Sin sesiones" },
    { label: "Asistencia promedio", value: asistenciaPct + "%", color: C.neon,   dest: "calendario",    sparkValues: sparkAsistencia, trend: calcTrend(sparkAsistencia), trendDisplay: asistenciaPct >= 75 ? "Buen nivel" : "Mejorar" },
    { label: "Partidos jugados",    value: matchStats.played,   color: C.purple, dest: "partidos",      sparkValues: [matchStats.won, matchStats.drawn, matchStats.lost].filter(v => v > 0), trend: matchStats.won > matchStats.lost ? 1 : matchStats.won < matchStats.lost ? -1 : 0, trendDisplay: `${matchStats.won}G ${matchStats.drawn}E ${matchStats.lost}P` },
    { label: "Plantilla activa",    value: athletes.length,     color: C.amber,  dest: "plantilla",     sparkValues: athletes.length > 0 ? [athletes.filter(a => a.status === "P").length, athletes.filter(a => a.status === "A").length, athletes.filter(a => a.status === "L").length].filter(v => v >= 0) : [], trend: 0, trendDisplay: `${athletes.filter(a => a.status === "L").length} en recuperacion` },
  ];

  return (
    <div style={{ padding: "var(--sp-5) var(--sp-4)", maxWidth: 900, margin: "0 auto" }}>

      {/* KPI Cards */}
      <div className="rep-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className="rep-kpi-card glass-panel"
            onClick={() => onNavigate?.(kpi.dest)}
            style={{
              borderTop: `3px solid ${kpi.color}`,
              padding: "var(--sp-4) 14px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Ambient glow */}
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: kpi.color, opacity: 0.04, filter: "blur(20px)", pointerEvents: "none" }} />

            <SectionLabel style={{ marginBottom: "var(--sp-2)", fontSize: "var(--fs-tag)", letterSpacing: "var(--ls-caps-lg)" }}>{kpi.label}</SectionLabel>
            <div style={{ fontSize: "var(--fs-kpi-md)", fontWeight: "var(--fw-bold)", color: kpi.color, lineHeight: 1, marginBottom: "var(--sp-2)" }}>{kpi.value}</div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--sp-2)" }}>
              <div>
                <TrendArrow trend={kpi.trend} />
                <div style={{ fontSize: "var(--fs-label)", color: C.textHint, marginTop: 3 }}>{kpi.trendDisplay}</div>
              </div>
              {kpi.sparkValues.length > 1 && <MiniSparkline values={kpi.sparkValues} color={kpi.color} />}
            </div>

            <div style={{ marginTop: "var(--sp-3)", paddingTop: "var(--sp-2)", borderTop: `1px solid ${C.border}`, fontSize: "var(--fs-label)", color: kpi.color, textTransform: "uppercase", letterSpacing: "var(--ls-caps-sm)", fontWeight: "var(--fw-semibold)" }}>
              Profundizar →
            </div>
          </div>
        ))}
      </div>

      {/* Fila secundaria */}
      <div className="rep-bottom-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)", marginBottom: "var(--sp-4)" }}>

        {/* Record de partidos */}
        <GlassPanel className="rep-secondary-card" onClick={() => onNavigate?.("partidos")} padding="md">
          <SectionLabel style={{ marginBottom: "var(--sp-3)", fontSize: "var(--fs-tag)", letterSpacing: "var(--ls-caps-lg)" }}>
            Rendimiento en competencia
          </SectionLabel>
          <div style={{ display: "flex", gap: "var(--sp-5)", alignItems: "flex-end" }}>
            {[{ val: matchStats.won, lbl: "Ganados", color: C.green }, { val: matchStats.drawn, lbl: "Empatados", color: "rgba(255,255,255,0.45)" }, { val: matchStats.lost, lbl: "Perdidos", color: C.danger }].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 30, fontWeight: "var(--fw-bold)", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "var(--fs-tag)", color: C.textHint, textTransform: "uppercase", letterSpacing: "var(--ls-caps-sm)", marginTop: "var(--sp-1)" }}>{s.lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "var(--sp-3)", display: "flex", gap: 2, height: 4 }}>
            {matchStats.played > 0 ? (
              <>
                <div style={{ flex: matchStats.won || 0, background: C.green, borderRadius: "2px 0 0 2px", minWidth: matchStats.won > 0 ? 4 : 0 }} />
                <div style={{ flex: matchStats.drawn || 0, background: "rgba(255,255,255,0.3)", minWidth: matchStats.drawn > 0 ? 4 : 0 }} />
                <div style={{ flex: matchStats.lost || 0, background: C.danger, borderRadius: "0 2px 2px 0", minWidth: matchStats.lost > 0 ? 4 : 0 }} />
              </>
            ) : (
              <div style={{ flex: 1, background: C.border, borderRadius: "var(--radius-xs)" }} />
            )}
          </div>
        </GlassPanel>

        {/* Salud financiera */}
        <GlassPanel className="rep-secondary-card" onClick={() => onNavigate?.("admin")} padding="md">
          <SectionLabel style={{ marginBottom: "var(--sp-3)", fontSize: "var(--fs-tag)", letterSpacing: "var(--ls-caps-lg)" }}>
            Salud financiera
          </SectionLabel>
          <div style={{ display: "flex", gap: "var(--sp-5)", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "var(--fs-title-lg)", fontWeight: "var(--fw-bold)", color: balance >= 0 ? C.green : C.danger, lineHeight: 1 }}>
                ${Math.abs(balance).toLocaleString("es-CO")}
              </div>
              <div style={{ fontSize: "var(--fs-tag)", color: C.textHint, textTransform: "uppercase", letterSpacing: "var(--ls-caps-sm)", marginTop: "var(--sp-1)" }}>
                {balance >= 0 ? "Superavit" : "Deficit"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "var(--fs-title-lg)", fontWeight: "var(--fw-bold)", color: C.purple, lineHeight: 1 }}>
                {pagados}/{athletes.length}
              </div>
              <div style={{ fontSize: "var(--fs-tag)", color: C.textHint, textTransform: "uppercase", letterSpacing: "var(--ls-caps-sm)", marginTop: "var(--sp-1)" }}>Al dia</div>
            </div>
          </div>
          <div style={{ marginTop: "var(--sp-3)", display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
            <div style={{ flex: 1, height: 3, background: C.border, borderRadius: "var(--radius-xs)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: athletes.length > 0 ? `${Math.round((pagados / athletes.length) * 100)}%` : "0%", background: C.purple, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ fontSize: "var(--fs-label)", color: C.textHint, whiteSpace: "nowrap" }}>
              {athletes.length > 0 ? Math.round((pagados / athletes.length) * 100) : 0}% al dia
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Últimas sesiones */}
      <GlassPanel padding="md">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-4)" }}>
          <SectionLabel style={{ fontSize: "var(--fs-tag)", letterSpacing: "var(--ls-caps-lg)" }}>Ultimas sesiones</SectionLabel>
          <button
            onClick={() => onNavigate?.("entrenamiento")}
            style={{ fontSize: "var(--fs-label)", textTransform: "uppercase", letterSpacing: "var(--ls-caps-sm)", color: C.green, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "var(--fw-semibold)", padding: "4px 8px", minHeight: "unset" }}
          >
            Ver historial →
          </button>
        </div>

        {historial.length === 0 && (
          <div style={{ fontSize: "var(--fs-body)", color: C.textHint, textAlign: "center", padding: "var(--sp-6) 0" }}>
            Sin sesiones registradas aun
          </div>
        )}

        {historial.slice(0, 5).map((s, i) => {
          const asist    = s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0;
          const rpeNum   = Number(s.rpeAvg);
          const rpeColor = isNaN(rpeNum) ? C.textHint : rpeNum <= 3 ? C.green : rpeNum <= 7 ? C.amber : C.danger;
          const tipoColor = s.tipo === "Táctica" || s.tipo === "Tactica" ? C.purple : s.tipo === "Físico" || s.tipo === "Fisico" ? C.amber : s.tipo === "Partido" || s.tipo === "Partido interno" ? C.danger : C.green;
          return (
            <div
              key={i}
              className="rep-session-row"
              onClick={() => onNavigate?.("entrenamiento")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "var(--sp-2) var(--sp-3)",
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                marginBottom: "var(--sp-1)",
                flexWrap: "wrap", gap: "var(--sp-2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", minWidth: 0 }}>
                <div style={{ width: 3, height: 32, borderRadius: "var(--radius-xs)", background: tipoColor, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "var(--fs-body-lg)", fontWeight: "var(--fw-semibold)", color: "white" }}>Sesion #{s.num} — {s.fecha}</div>
                  <div style={{ fontSize: "var(--fs-caption)", color: C.textMuted, marginTop: 1 }}>{s.tipo || "Sin tipo"}{s.nota ? " · " + s.nota.slice(0, 40) + (s.nota.length > 40 ? "…" : "") : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", flexShrink: 0 }}>
                {[{ val: `${asist}%`, lbl: "Asist.", color: C.green }, { val: s.rpeAvg ?? "—", lbl: "RPE", color: rpeColor }, { val: `${s.presentes}/${s.total}`, lbl: "Pres.", color: "rgba(255,255,255,0.6)" }].map(stat => (
                  <div key={stat.lbl} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "var(--fs-subhead)", fontWeight: "var(--fw-bold)", color: stat.color }}>{stat.val}</div>
                    <div style={{ fontSize: "var(--fs-tag)", color: C.textHint, textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </GlassPanel>
    </div>
  );
}

export default Reportes;
