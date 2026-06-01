import { Calendar, CalendarPlus, Clock } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CARD = PALETTE.surface;
const BG = PALETTE.bg;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;

export default function FixtureStatsRail({
  stats,
  upcomingMatches,
  onGoScheduling,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Calendar size={16} color={CU} />
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Resumen del fixture</h4>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "TOTAL PARTIDOS", value: stats.totalMatches, color: TEXT },
            { label: "JUGADOS", value: stats.playedMatches, color: PALETTE.success },
            { label: "PENDIENTES", value: stats.pendingMatches, color: PALETTE.amber },
            { label: "REPROGRAMADOS", value: stats.rescheduledMatches, color: CU },
          ].map((item) => (
            <div key={item.label} style={{ background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} color={CU} />
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Próximos encuentros</h4>
          </div>
        </div>
        {upcomingMatches.length === 0 ? (
          <div style={{ fontSize: 12, color: MUTED, textAlign: "center", padding: "20px 0" }}>
            No hay partidos programados.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcomingMatches.map((match) => (
              <div key={match.id} style={{ background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>
                    {match.dateLabel}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: PALETTE.success, background: PALETTE.successDim, padding: "2px 6px", borderRadius: 8 }}>
                    PROGRAMADO
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{match.localName}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginTop: 4 }}>{match.visitaName}</div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onGoScheduling}
          style={{
            width: "100%",
            marginTop: 16,
            background: CU,
            color: "#FFF",
            border: "none",
            borderRadius: 8,
            padding: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <CalendarPlus size={14} /> Configurar programación
        </button>
      </section>
    </div>
  );
}
