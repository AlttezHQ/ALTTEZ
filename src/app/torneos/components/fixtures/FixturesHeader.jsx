import { BarChart2, Settings, Trophy } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CARD = PALETTE.surface;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

const tabs = [
  { id: "fixture", label: "Fixture", icon: Trophy },
  { id: "programacion", label: "Programación", icon: Settings },
  { id: "tabla", label: "Tabla", icon: BarChart2 },
];

export default function FixturesHeader({
  categories,
  activeCategory,
  activeTab,
  onCategoryChange,
  onTabChange,
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: "-0.03em",
          }}
        >
          Gestión de Torneo
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 13, color: MUTED }}>Categoría:</span>
          <select
            value={activeCategory || ""}
            onChange={(event) => onCategoryChange(event.target.value)}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 12,
              fontWeight: 700,
              color: CU,
              outline: "none",
              fontFamily: FONT,
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          background: CARD,
          padding: 4,
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 9,
              border: "none",
              background: activeTab === tab.id ? CU : "transparent",
              color: activeTab === tab.id ? "#FFF" : MUTED,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
