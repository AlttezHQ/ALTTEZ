import { Calendar, RefreshCw, Search } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CARD = PALETTE.surface;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;
const BG = PALETTE.bg;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: `1px solid ${BORDER}`,
  background: BG,
  fontSize: 13,
  fontFamily: FONT,
  outline: "none",
  boxSizing: "border-box",
};

export default function FixtureFiltersBar({
  filters,
  onRoundChange,
  onQueryChange,
  onStateChange,
  onRegenerate,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 16,
        background: CARD,
        padding: 16,
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 6 }}>
          JORNADA / FECHA
        </label>
        <div style={{ position: "relative" }}>
          <Calendar
            size={14}
            color={MUTED}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
          />
          <select
            value={filters.selectedRound}
            onChange={(event) => onRoundChange(event.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
          >
            <option value="Todas las jornadas">Todas las jornadas</option>
            {filters.roundOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ flex: 1.5 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 6 }}>
          BUSCAR EQUIPO
        </label>
        <div style={{ position: "relative" }}>
          <Search
            size={14}
            color={MUTED}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Buscar equipo..."
            value={filters.searchQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 6 }}>
          ESTADO
        </label>
        <select
          value={filters.selectedState}
          onChange={(event) => onStateChange(event.target.value)}
          style={inputStyle}
        >
          <option value="Todos los estados">Todos los estados</option>
          <option value="programado">Programado</option>
          <option value="pendiente">Pendiente</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      <button
        onClick={onRegenerate}
        style={{
          height: 38,
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "0 16px",
          color: MUTED,
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
        }}
      >
        <RefreshCw size={14} /> Regenerar
      </button>
    </div>
  );
}
