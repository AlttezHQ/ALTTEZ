import { motion } from "framer-motion";
import { Clock, MapPin, User, X } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CARD = PALETTE.surface;
const BG = PALETTE.bg;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;

export default function MatchDetailsModal({
  match,
  local,
  visita,
  venue,
  referee,
  hour,
  state,
  onClose,
}) {
  const mapLink = venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`
    : null;
  const isDone = match.estado === "finalizado";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: CARD,
          width: 400,
          borderRadius: 20,
          border: `1px solid ${BORDER}`,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
      >
        <button onClick={onClose} style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
          <X size={20} />
        </button>
        <div style={{ padding: "24px 24px 16px", textAlign: "center", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: state.color, background: `${state.color}15`, padding: "6px 14px", borderRadius: 12, display: "inline-block", marginBottom: 20, letterSpacing: "0.04em" }}>
            {state.label.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <div style={{ flex: 1, textAlign: "right", fontSize: 16, fontWeight: 800 }}>
              {local !== "TBD" ? local : "Por definir"}
            </div>
            {isDone ? (
              <div style={{ fontSize: 24, fontWeight: 900, color: CU, background: CU_DIM, padding: "4px 16px", borderRadius: 12 }}>
                {match.golesLocal} - {match.golesVisita}
              </div>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 800, color: MUTED, background: BG, padding: "4px 12px", borderRadius: 12 }}>
                VS
              </div>
            )}
            <div style={{ flex: 1, textAlign: "left", fontSize: 16, fontWeight: 800 }}>
              {visita !== "TBD" ? visita : "Por definir"}
            </div>
          </div>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {hour && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={18} color={CU} />
              </div>
              <div><div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.04em" }}>HORA</div><div style={{ fontSize: 14, fontWeight: 700 }}>{hour}</div></div>
            </div>
          )}
          {venue && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin size={18} color={CU} />
              </div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.04em" }}>SEDE / CANCHA</div><div style={{ fontSize: 14, fontWeight: 700 }}>{venue}</div></div>
              <a href={mapLink} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 12px", background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", borderRadius: 8, fontSize: 12, fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={14} /> Ver mapa
              </a>
            </div>
          )}
          {referee && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={18} color={CU} />
              </div>
              <div><div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.04em" }}>ÁRBITRO DESIGNADO</div><div style={{ fontSize: 14, fontWeight: 700 }}>{referee}</div></div>
            </div>
          )}
        </div>
        <div style={{ padding: 20, borderTop: `1px solid ${BORDER}`, background: BG, display: "flex", justifyContent: "center" }}>
          <button onClick={onClose} style={{ width: "100%", padding: 12, background: "none", border: `1px solid ${BORDER}`, borderRadius: 10, fontWeight: 700, color: MUTED, cursor: "pointer" }}>
            Cerrar detalles
          </button>
        </div>
      </motion.div>
    </div>
  );
}
