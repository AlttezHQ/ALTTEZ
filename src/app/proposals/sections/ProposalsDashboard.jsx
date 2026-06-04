"use client";

/**
 * @component ProposalsDashboard
 * @description Sección Resumen del módulo interno de propuestas.
 * KPIs + actividad reciente + desglose por estado. Solo lectura.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProposals } from "../../../shared/services/proposalsService";
import {
  FONT, MONO, MARFIL, CARD, GRAFITO, MUTED, CU, SUCCESS, WHISPER, SHADOW_CARD,
} from "../shell/proposalsTokens";
import { STATUS_META, STATUS_ORDER, fmtDate, countByStatus } from "../shell/proposalsUtils";

const EASE = [0.22, 1, 0.36, 1];

function KpiCard({ label, value, color, accent, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: i * 0.05 }}
      style={{ position: "relative", overflow: "hidden", padding: "22px", borderRadius: 16, background: CARD, border: `1px solid ${WHISPER}`, boxShadow: SHADOW_CARD, minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent }} />
      <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    </motion.div>
  );
}

function StatusPill({ status }) {
  const s = STATUS_META[status] || STATUS_META.creada;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 8, fontFamily: FONT, fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

export default function ProposalsDashboard({ clubId, onGoToProposals }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProposals().then((data) => { if (active) { setProposals(data || []); setLoading(false); } });
    return () => { active = false; };
  }, [clubId]);

  const counts = countByStatus(proposals);
  const total = proposals.length;
  const accepted = counts.aceptada || 0;
  const pending = (counts.enviada || 0) + (counts.creada || 0);
  const counter = counts.contrapropuesta || 0;
  const decided = accepted + (counts.rechazada || 0);
  const acceptRate = decided > 0 ? Math.round((accepted / decided) * 100) : 0;

  const recent = [...proposals]
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
    .slice(0, 6);

  const maxStatus = Math.max(1, ...STATUS_ORDER.map((s) => counts[s] || 0));

  return (
    <div style={{ fontFamily: FONT, background: MARFIL, minHeight: "calc(100vh - 64px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 32, fontWeight: 700, color: GRAFITO, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Resumen</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>Estado general de las propuestas internas de ALTTEZ.</p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <KpiCard i={0} label="Total" value={loading ? "—" : total} color={GRAFITO} accent="rgba(31,31,29,0.18)" />
          <KpiCard i={1} label="Aceptadas" value={loading ? "—" : accepted} color={SUCCESS} accent={SUCCESS} />
          <KpiCard i={2} label="Pendientes" value={loading ? "—" : pending} color={GRAFITO} accent="#F5BE05" />
          <KpiCard i={3} label="Contrapropuestas" value={loading ? "—" : counter} color={CU} accent={CU} />
        </div>

        {/* Split: actividad reciente | desglose */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, alignItems: "start" }} className="alttez-dash-split">
          {/* Actividad reciente */}
          <div style={{ background: CARD, border: `1px solid ${WHISPER}`, borderRadius: 16, boxShadow: SHADOW_CARD, overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${WHISPER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: GRAFITO }}>Actividad reciente</h2>
              <button onClick={onGoToProposals} style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: CU, background: "transparent", border: "none", cursor: "pointer", letterSpacing: "0.04em" }}>Ver todas →</button>
            </div>
            <div>
              {loading ? (
                [0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 64, borderBottom: `1px solid ${WHISPER}`, display: "flex", alignItems: "center", padding: "0 22px", gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(31,31,29,0.05)" }} />
                    <div style={{ flex: 1, height: 14, borderRadius: 6, background: "rgba(31,31,29,0.05)" }} />
                  </div>
                ))
              ) : recent.length === 0 ? (
                <div style={{ padding: "40px 22px", textAlign: "center", color: MUTED, fontSize: 14 }}>Aún no hay propuestas registradas.</div>
              ) : (
                recent.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderBottom: `1px solid ${WHISPER}` }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFEFE4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, fontWeight: 800, color: CU }}>
                      {(p.client_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: GRAFITO, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                      <div style={{ fontFamily: FONT, fontSize: 12, color: MUTED }}>{p.client_name}</div>
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(p.fecha)}</span>
                    <StatusPill status={p.status} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desglose por estado + tasa */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: CARD, border: `1px solid ${WHISPER}`, borderRadius: 16, boxShadow: SHADOW_CARD, padding: "22px" }}>
              <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Tasa de aceptación</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: SUCCESS, lineHeight: 1 }}>{loading ? "—" : acceptRate}</span>
                <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: SUCCESS }}>%</span>
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: MUTED, marginTop: 8 }}>sobre {decided} propuesta{decided === 1 ? "" : "s"} decidida{decided === 1 ? "" : "s"}</div>
            </div>

            <div style={{ background: CARD, border: `1px solid ${WHISPER}`, borderRadius: 16, boxShadow: SHADOW_CARD, padding: "22px" }}>
              <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>Por estado</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {STATUS_ORDER.map((s) => {
                  const n = counts[s] || 0;
                  const meta = STATUS_META[s];
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: FONT, fontSize: 12, color: GRAFITO, width: 110, flexShrink: 0 }}>{meta.label}</span>
                      <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(31,31,29,0.06)", overflow: "hidden" }}>
                        <div style={{ width: `${(n / maxStatus) * 100}%`, height: "100%", borderRadius: 999, background: meta.color, transition: "width 0.4s" }} />
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: GRAFITO, width: 24, textAlign: "right" }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .alttez-dash-split { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
