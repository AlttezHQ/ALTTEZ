"use client";

/**
 * @component ProposalsAnalytics
 * @description Sección Analytics del módulo interno de propuestas.
 * Estadísticas derivadas: tasa de aceptación, participación promedio,
 * volumen por mes, distribución por estado. Charts en CSS (sin librería).
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getProposals } from "../../../shared/services/proposalsService";
import {
  FONT, MONO, MARFIL, CARD, GRAFITO, MUTED, CU, SUCCESS, WHISPER, SHADOW_CARD,
} from "../shell/proposalsTokens";
import { STATUS_META, STATUS_ORDER, fmtMonth, countByStatus, groupByClient } from "../shell/proposalsUtils";

const EASE = [0.22, 1, 0.36, 1];

function StatCard({ label, value, suffix, color, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: EASE, delay: i * 0.05 }}
      style={{ background: CARD, border: `1px solid ${WHISPER}`, borderRadius: 16, boxShadow: SHADOW_CARD, padding: "20px 22px" }}
    >
      <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: color || GRAFITO, lineHeight: 1 }}>{value}</span>
        {suffix && <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: color || GRAFITO }}>{suffix}</span>}
      </div>
    </motion.div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${WHISPER}`, borderRadius: 16, boxShadow: SHADOW_CARD, padding: "22px" }}>
      <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>{title}</div>
      {children}
    </div>
  );
}

export default function ProposalsAnalytics({ clubId }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProposals().then((data) => { if (active) { setProposals(data || []); setLoading(false); } });
    return () => { active = false; };
  }, [clubId]);

  const stats = useMemo(() => {
    const counts = countByStatus(proposals);
    const total = proposals.length;
    const accepted = counts.aceptada || 0;
    const decided = accepted + (counts.rechazada || 0);
    const acceptRate = decided > 0 ? Math.round((accepted / decided) * 100) : 0;
    const pcts = proposals.map((p) => Number(p.participacion_pct) || 0).filter((n) => n > 0);
    const avgPct = pcts.length ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10 : 0;
    const uniqueClients = groupByClient(proposals).length;

    // Volumen por mes (orden cronológico)
    const monthMap = new Map();
    for (const p of proposals) {
      const d = new Date(p.fecha || 0);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap.has(key)) monthMap.set(key, { key, iso: d.toISOString(), n: 0 });
      monthMap.get(key).n += 1;
    }
    const months = Array.from(monthMap.values()).sort((a, b) => a.key.localeCompare(b.key)).slice(-8);

    return { counts, total, accepted, decided, acceptRate, avgPct, uniqueClients, months };
  }, [proposals]);

  const maxMonth = Math.max(1, ...stats.months.map((m) => m.n));
  const maxStatus = Math.max(1, ...STATUS_ORDER.map((s) => stats.counts[s] || 0));

  return (
    <div style={{ fontFamily: FONT, background: MARFIL, minHeight: "calc(100vh - 64px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 32, fontWeight: 700, color: GRAFITO, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Analytics</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>Métricas de desempeño de las propuestas internas.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
          <StatCard i={0} label="Total propuestas" value={loading ? "—" : stats.total} color={GRAFITO} />
          <StatCard i={1} label="Tasa de aceptación" value={loading ? "—" : stats.acceptRate} suffix="%" color={SUCCESS} />
          <StatCard i={2} label="Participación prom." value={loading ? "—" : stats.avgPct} suffix="%" color={CU} />
          <StatCard i={3} label="Clientes únicos" value={loading ? "—" : stats.uniqueClients} color={GRAFITO} />
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }} className="alttez-analytics-split">
          {/* Volumen por mes */}
          <Panel title="Propuestas por mes">
            {stats.months.length === 0 ? (
              <div style={{ padding: "30px 0", textAlign: "center", color: MUTED, fontSize: 14 }}>Sin datos suficientes.</div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, paddingTop: 10 }}>
                {stats.months.map((m) => (
                  <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: GRAFITO }}>{m.n}</span>
                    <div style={{ width: "100%", maxWidth: 40, height: `${(m.n / maxMonth) * 100}%`, minHeight: 4, background: `linear-gradient(180deg, ${CU}, ${CU}cc)`, borderRadius: "6px 6px 0 0", transition: "height 0.4s" }} />
                    <span style={{ fontFamily: FONT, fontSize: 11, color: MUTED, whiteSpace: "nowrap" }}>{fmtMonth(m.iso)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Distribución por estado */}
          <Panel title="Distribución por estado">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {STATUS_ORDER.map((s) => {
                const n = stats.counts[s] || 0;
                const meta = STATUS_META[s];
                const pct = stats.total ? Math.round((n / stats.total) * 100) : 0;
                return (
                  <div key={s}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: FONT, fontSize: 12, color: GRAFITO }}>{meta.label}</span>
                      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: MUTED }}>{n} · {pct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "rgba(31,31,29,0.06)", overflow: "hidden" }}>
                      <div style={{ width: `${(n / maxStatus) * 100}%`, height: "100%", borderRadius: 999, background: meta.color, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .alttez-analytics-split { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
