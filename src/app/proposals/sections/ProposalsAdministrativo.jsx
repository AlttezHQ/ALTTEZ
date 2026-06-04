"use client";

/**
 * @component ProposalsAdministrativo
 * @description Sección Administrativo del módulo interno de propuestas.
 * Configuración interna: exportar datos, valores por defecto, equipo, métricas.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Users, Database } from "lucide-react";
import { getProposals } from "../../../shared/services/proposalsService";
import { showToast } from "../../../shared/ui/Toast";
import {
  FONT, MONO, MARFIL, CARD, BEIGE, GRAFITO, MUTED, CU, CU_DIM, CU_BOR, WHISPER, SHADOW_CARD,
} from "../shell/proposalsTokens";
import { countByStatus, groupByClient } from "../shell/proposalsUtils";

const EASE = [0.22, 1, 0.36, 1];

// Textos legales por defecto (referencia; edición a futuro)
const DEFAULT_OBJETO = "Integrar, validar y escalar el software de gestión y operación deportiva de ALTTEZ, iniciando en un club deportivo piloto para validar el modelo de negocio en un entorno real, y posteriormente expandirlo a nivel regional.";
const DEFAULT_CLIFF = "Periodo de carencia (\"Cliff\") estricto de seis (6) meses, o hasta la firma formal del contrato de integración con el primer club piloto (lo que ocurra primero). Si el Aliado abandona el proyecto antes del hito, la participación consolidada será del 0%.";

function Panel({ title, icon: Icon, children, accent }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${WHISPER}`, borderRadius: 16, boxShadow: SHADOW_CARD, padding: "22px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && (
          <span style={{ width: 34, height: 34, borderRadius: 10, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={17} color={accent || CU} />
          </span>
        )}
        <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: GRAFITO }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

export default function ProposalsAdministrativo({ clubId }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;
    getProposals().then((data) => { if (active) { setProposals(data || []); setLoading(false); } });
    return () => { active = false; };
  }, [clubId]);

  const metrics = useMemo(() => {
    const counts = countByStatus(proposals);
    return {
      total: proposals.length,
      clientes: groupByClient(proposals).length,
      aceptadas: counts.aceptada || 0,
    };
  }, [proposals]);

  async function handleExport() {
    setExporting(true);
    try {
      const data = await getProposals();
      const blob = new Blob([JSON.stringify(data || [], null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alttez-propuestas-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Propuestas exportadas en JSON.", "success");
    } catch {
      showToast("No se pudo exportar. Inténtalo de nuevo.", "error");
    }
    setExporting(false);
  }

  const noteStyle = { fontFamily: FONT, fontSize: 13, color: MUTED, lineHeight: 1.6 };
  const previewStyle = { fontFamily: FONT, fontSize: 12.5, color: GRAFITO, lineHeight: 1.6, background: BEIGE, borderRadius: 12, padding: "14px 16px", border: `1px solid ${WHISPER}` };

  return (
    <div style={{ fontFamily: FONT, background: MARFIL, minHeight: "calc(100vh - 64px)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 60px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 32, fontWeight: 700, color: GRAFITO, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Administrativo</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>Configuración interna, datos y plantillas de la herramienta de propuestas.</p>
        </div>

        {/* Métricas de datos */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: EASE }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}
        >
          {[
            { label: "Propuestas", value: metrics.total },
            { label: "Clientes únicos", value: metrics.clientes },
            { label: "Aceptadas", value: metrics.aceptadas },
          ].map((m) => (
            <div key={m.label} style={{ background: CARD, border: `1px solid ${WHISPER}`, borderRadius: 14, boxShadow: SHADOW_CARD, padding: "18px 20px" }}>
              <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: GRAFITO, lineHeight: 1 }}>{loading ? "—" : m.value}</div>
            </div>
          ))}
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Exportar datos */}
          <Panel title="Exportar datos" icon={Database}>
            <div style={noteStyle}>Descarga un respaldo de todas las propuestas en formato JSON para archivado o migración.</div>
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              style={{
                alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 18px", borderRadius: 12, border: "none",
                background: CU, color: "#FFFFFF", fontFamily: FONT, fontSize: 14, fontWeight: 700,
                cursor: exporting || loading ? "default" : "pointer", opacity: exporting || loading ? 0.6 : 1,
                boxShadow: "0 6px 18px rgba(206,137,70,0.26)",
              }}
            >
              <Download size={17} />
              {exporting ? "Exportando…" : "Exportar propuestas (JSON)"}
            </button>
          </Panel>

          {/* Valores por defecto */}
          <Panel title="Plantillas legales por defecto" icon={FileText}>
            <div style={noteStyle}>Textos sugeridos al crear una propuesta. La edición de estas plantillas estará disponible próximamente.</div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Objeto de la alianza</div>
              <div style={previewStyle}>{DEFAULT_OBJETO}</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Cliff y condiciones de salida</div>
              <div style={previewStyle}>{DEFAULT_CLIFF}</div>
            </div>
          </Panel>

          {/* Equipo interno */}
          <Panel title="Equipo interno" icon={Users}>
            <div style={noteStyle}>Gestión de usuarios internos de ALTTEZ con acceso a esta herramienta.</div>
            <div style={{ padding: "16px 18px", borderRadius: 12, background: BEIGE, border: `1px dashed ${CU_BOR}`, fontFamily: FONT, fontSize: 13, color: MUTED, fontWeight: 600 }}>
              Gestión de usuarios internos — próximamente.
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
