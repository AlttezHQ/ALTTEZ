import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CARD = PALETTE.surface;
const BG = PALETTE.bg;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

function estimateRoundRobinMatches(teamCount, groupCount = 1, legs = 1) {
  if (teamCount < 2) return 0;
  const groupsCount = Math.max(1, Number(groupCount) || 1);
  const baseSize = Math.floor(teamCount / groupsCount);
  const extraTeams = teamCount % groupsCount;
  let total = 0;

  for (let index = 0; index < groupsCount; index += 1) {
    const size = baseSize + (index < extraTeams ? 1 : 0);
    total += (size * (size - 1)) / 2;
  }

  return total * Math.max(1, Number(legs) || 1);
}

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

export default function GenerateFixtureModal({
  torneo,
  category,
  categoryConfig,
  equipos,
  existingMatches = 0,
  onConfirm,
  onClose,
}) {
  const [ini, setIni] = useState(torneo.fechaInicio || "");
  const [fin, setFin] = useState(torneo.fechaFin || "");
  const isGroupsPlayoffs = categoryConfig?.format === "grupos_playoffs";
  const [settings, setSettings] = useState(() => ({
    groupsCount: Number(categoryConfig?.groupsCount ?? categoryConfig?.grupos ?? 1) || 1,
    groupLegs: Number(categoryConfig?.groupLegs ?? categoryConfig?.vueltas ?? 1) || 1,
    assignmentMethod: categoryConfig?.assignmentMethod ?? "auto_serpentina",
    qualifyPerGroup: Number(categoryConfig?.qualifyPerGroup ?? categoryConfig?.cpg ?? 2) || 2,
    allowBestThirds: Boolean(categoryConfig?.allowBestThirds),
    bestThirdsCount: Number(categoryConfig?.bestThirdsCount ?? 0) || 0,
  }));

  const updateSetting = (key, value) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const groupsCount = settings.groupsCount;
  const groupLegs = settings.groupLegs;
  const estimatedMatches =
    equipos.length < 2
      ? 0
      : isGroupsPlayoffs
        ? estimateRoundRobinMatches(equipos.length, groupsCount, groupLegs)
        : estimateRoundRobinMatches(equipos.length, 1, groupLegs);
  const maxGroups = Math.max(1, Math.floor(equipos.length / 2));
  const canConfirm = Boolean(ini && fin && equipos.length >= 2 && (!fin || !ini || fin >= ini));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,26,28,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        fontFamily: FONT,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: CARD,
          borderRadius: 16,
          padding: 28,
          width: 420,
          boxShadow: "0 24px 64px rgba(23,26,28,0.2)",
          border: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>
            Generar Fixture: {category}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>
          Confirma el periodo para organizar las fechas de esta categoría.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>
                FECHA DE INICIO
              </label>
              <input type="date" value={ini} onChange={(event) => setIni(event.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>
                FECHA DE FIN
              </label>
              <input type="date" value={fin} onChange={(event) => setFin(event.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {isGroupsPlayoffs && (
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>
                  GRUPOS
                </label>
                <select
                  value={settings.groupsCount}
                  onChange={(event) => updateSetting("groupsCount", Number(event.target.value))}
                  style={inputStyle}
                >
                  {Array.from({ length: Math.min(16, maxGroups) }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>
                      {value} grupo{value !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>
                VUELTAS
              </label>
              <select
                value={settings.groupLegs}
                onChange={(event) => updateSetting("groupLegs", Number(event.target.value))}
                style={inputStyle}
              >
                <option value={1}>Una vuelta</option>
                <option value={2}>Ida y vuelta</option>
              </select>
            </div>

            {isGroupsPlayoffs && (
              <>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>
                    ASIGNACION
                  </label>
                  <select
                    value={settings.assignmentMethod}
                    onChange={(event) => updateSetting("assignmentMethod", event.target.value)}
                    style={inputStyle}
                  >
                    <option value="auto_serpentina">Serpentina</option>
                    <option value="auto_random">Aleatoria</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 }}>
                    CLASIFICAN
                  </label>
                  <select
                    value={settings.qualifyPerGroup}
                    onChange={(event) => updateSetting("qualifyPerGroup", Number(event.target.value))}
                    style={inputStyle}
                  >
                    {[1, 2, 3, 4].map((value) => (
                      <option key={value} value={value}>
                        {value} por grupo
                      </option>
                    ))}
                  </select>
                </div>
                <label
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 12,
                    background: BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.allowBestThirds}
                    onChange={(event) => updateSetting("allowBestThirds", event.target.checked)}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>
                    Permitir mejores terceros
                  </span>
                  {settings.allowBestThirds && (
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={settings.bestThirdsCount}
                      onChange={(event) =>
                        updateSetting("bestThirdsCount", Number(event.target.value) || 0)
                      }
                      style={{ ...inputStyle, width: 72, marginLeft: "auto" }}
                    />
                  )}
                </label>
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Equipos", value: equipos.length },
              { label: "Formato", value: isGroupsPlayoffs ? `${groupsCount} grupos` : "Fixture base" },
              { label: "Vueltas", value: groupLegs },
              { label: "Partidos", value: estimatedMatches },
            ].map((item) => (
              <div
                key={item.label}
                style={{ padding: 12, background: BG, borderRadius: 10, border: `1px solid ${BORDER}` }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginTop: 3 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {existingMatches > 0 && (
            <div
              style={{
                padding: 12,
                background: PALETTE.amberDim,
                borderRadius: 10,
                border: `1px solid ${PALETTE.amberBorder}`,
                color: PALETTE.amber,
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1.45,
              }}
            >
              Se reemplazaran {existingMatches} partido{existingMatches !== 1 ? "s" : ""} existentes de esta categoria.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
              background: "none",
              fontSize: 13,
              fontWeight: 700,
              color: MUTED,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => onConfirm(ini, fin, settings)}
            style={{
              flex: 2,
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: canConfirm ? CU : BORDER,
              fontSize: 13,
              fontWeight: 700,
              color: "#FFF",
              cursor: canConfirm ? "pointer" : "not-allowed",
            }}
          >
            Generar Fixture
          </button>
        </div>
      </motion.div>
    </div>
  );
}
