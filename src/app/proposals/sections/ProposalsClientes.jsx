"use client";

/**
 * @component ProposalsClientes
 * @description Sección Clientes del módulo interno de propuestas.
 * Vista derivada: agrupa propuestas por cliente, muestra resumen por cliente.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getProposals } from "../../../shared/services/proposalsService";
import {
  FONT, MONO, MARFIL, CARD, GRAFITO, MUTED, HINT, CU, CU_BOR, SUCCESS, WHISPER, BORDER, SHADOW_CARD,
} from "../shell/proposalsTokens";
import { STATUS_META, fmtDate, groupByClient } from "../shell/proposalsUtils";

const EASE = [0.22, 1, 0.36, 1];

function StatusDot({ status, n }) {
  const s = STATUS_META[status] || STATUS_META.creada;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: FONT, fontSize: 11, color: MUTED }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
      {s.label} <span style={{ fontFamily: MONO, fontWeight: 700, color: GRAFITO }}>{n}</span>
    </span>
  );
}

export default function ProposalsClientes({ clubId }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    getProposals().then((data) => { if (active) { setProposals(data || []); setLoading(false); } });
    return () => { active = false; };
  }, [clubId]);

  const clients = useMemo(() => {
    const groups = groupByClient(proposals).map(({ name, items }) => {
      const counts = items.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});
      const lastDate = items.reduce((max, p) => {
        const t = new Date(p.fecha || 0).getTime();
        return t > max ? t : max;
      }, 0);
      const maxPct = Math.max(0, ...items.map((p) => Number(p.participacion_pct) || 0));
      const accepted = counts.aceptada || 0;
      return { name, items, counts, lastDate, maxPct, accepted, total: items.length };
    });
    groups.sort((a, b) => b.lastDate - a.lastDate);
    const q = query.trim().toLowerCase();
    return q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : groups;
  }, [proposals, query]);

  const inputStyle = {
    fontFamily: FONT, width: "100%", maxWidth: 360, padding: "10px 14px",
    border: `1px solid ${BORDER}`, borderRadius: 10, background: CARD, color: GRAFITO,
    fontSize: 14, outline: "none",
  };

  return (
    <div style={{ fontFamily: FONT, background: MARFIL, minHeight: "calc(100vh - 64px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 32, fontWeight: 700, color: GRAFITO, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Clientes</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>Aliados, socios e inversionistas con propuestas registradas.</p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente…"
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = CU; }}
          onBlur={(e) => { e.target.style.borderColor = BORDER; }}
        />

        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} style={{ height: 150, borderRadius: 16, background: CARD, border: `1px solid ${WHISPER}` }} />
            ))
          ) : clients.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: "60px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
              {query ? "Ningún cliente coincide con la búsqueda." : "Aún no hay clientes con propuestas."}
            </div>
          ) : (
            clients.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: EASE, delay: Math.min(i * 0.04, 0.3) }}
                style={{ background: CARD, border: `1px solid ${WHISPER}`, borderRadius: 16, boxShadow: SHADOW_CARD, padding: "20px", display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = CU_BOR; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = WHISPER; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FFEFE4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, fontWeight: 800, color: CU }}>
                    {(c.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: GRAFITO, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div style={{ fontFamily: FONT, fontSize: 12, color: HINT }}>Última: {fmtDate(c.lastDate ? new Date(c.lastDate).toISOString() : null)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 18, paddingTop: 14, borderTop: `1px solid ${WHISPER}` }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: GRAFITO, lineHeight: 1 }}>{c.total}</div>
                    <div style={{ fontFamily: FONT, fontSize: 11, color: MUTED, marginTop: 4 }}>propuestas</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: SUCCESS, lineHeight: 1 }}>{c.accepted}</div>
                    <div style={{ fontFamily: FONT, fontSize: 11, color: MUTED, marginTop: 4 }}>aceptadas</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: CU, lineHeight: 1 }}>{c.maxPct}%</div>
                    <div style={{ fontFamily: FONT, fontSize: 11, color: MUTED, marginTop: 4 }}>máx. part.</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {Object.keys(c.counts).map((st) => (
                    <StatusDot key={st} status={st} n={c.counts[st]} />
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
