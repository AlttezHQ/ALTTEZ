import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown, MoreHorizontal } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CARD = PALETTE.surface;
const BG = PALETTE.bg;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;

export default function FixtureDateGroup({
  group,
  onToggle,
  onOpenMatch,
}) {
  return (
    <div
      style={{
        background: CARD,
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
        overflow: "hidden",
        transition: "all 0.2s",
        boxShadow: group.isExpanded ? "0 4px 12px rgba(0,0,0,0.03)" : "none",
      }}
    >
      <div
        onClick={() => onToggle(group.key)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          cursor: "pointer",
          userSelect: "none",
          background: group.isExpanded ? BG : "transparent",
        }}
      >
        <motion.div animate={{ rotate: group.isExpanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} color={MUTED} />
        </motion.div>
        <Calendar size={16} color={CU} />
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: TEXT,
            textTransform: "capitalize",
            letterSpacing: "-0.01em",
          }}
        >
          {group.label}
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: MUTED,
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: "2px 8px",
          }}
        >
          {group.count} partidos
        </span>
      </div>

      <AnimatePresence>
        {group.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                      color: MUTED,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <th style={{ padding: "8px 0", textAlign: "left", width: 60, fontWeight: 600 }}>Hora</th>
                    <th style={{ padding: "8px 0", textAlign: "left", width: 120, fontWeight: 600 }}>Cancha</th>
                    <th style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }}>Local</th>
                    <th style={{ padding: "8px 16px", textAlign: "center", width: 80, fontWeight: 600 }}>Resultado</th>
                    <th style={{ padding: "8px 0", textAlign: "left", fontWeight: 600 }}>Visitante</th>
                    <th style={{ padding: "8px 0", textAlign: "center", width: 100, fontWeight: 600 }}>Estado</th>
                    <th style={{ padding: "8px 0", width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {group.matches.map((match) => (
                    <tr
                      key={match.id}
                      style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}
                      onClick={() => onOpenMatch(match.raw)}
                    >
                      <td style={{ padding: "12px 0", color: TEXT, fontWeight: 600 }}>{match.hourLabel}</td>
                      <td style={{ padding: "12px 0", color: MUTED }}>{match.venueLabel}</td>
                      <td style={{ padding: "12px 0", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                          <span style={{ fontWeight: 700, color: TEXT }}>{match.localName}</span>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: match.localColor }} />
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <div
                          style={{
                            background: BG,
                            border: `1px solid ${BORDER}`,
                            borderRadius: 8,
                            padding: "4px 8px",
                            fontWeight: 800,
                            color: CU,
                            fontSize: 12,
                          }}
                        >
                          {match.resultLabel}
                        </div>
                      </td>
                      <td style={{ padding: "12px 0", textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: match.visitaColor }} />
                          <span style={{ fontWeight: 700, color: TEXT }}>{match.visitaName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 0", textAlign: "center" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: `${match.state.color}15`,
                            border: `1px solid ${match.state.color}33`,
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 700,
                            color: match.state.color,
                          }}
                        >
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: match.state.dot }} />
                          {match.state.label.toUpperCase()}
                        </div>
                      </td>
                      <td style={{ padding: "12px 0", textAlign: "center" }}>
                        <button
                          style={{ background: "none", border: "none", color: MUTED, cursor: "pointer" }}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenMatch(match.raw);
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
