import { PALETTE } from "../../tokens/palette";
import { getPasswordRequirements } from "../passwordStrength";

const CU = PALETTE.bronce;
const MUTED = PALETTE.textMuted;

/**
 * @component PasswordStrengthBar
 * @description Indicador visual de fortaleza de contraseña. Muestra barra de progreso
 * y checklist de requisitos. Se monta solo cuando hay algo escrito.
 */
export default function PasswordStrengthBar({ password, strength }) {
  if (!password) return null;

  const isHigh = strength.level === "high";
  const isMedium = strength.level === "medium";
  const tone = isHigh ? "#2FA56F" : isMedium ? CU : PALETTE.danger;
  const progressWidth = `${(strength.passed / strength.total) * 100}%`;

  return (
    <div style={{
      marginTop: 8, padding: "10px 12px",
      borderRadius: 10,
      background: isHigh ? "rgba(47,165,111,0.06)" : isMedium ? "rgba(201,151,58,0.06)" : "rgba(217,92,92,0.05)",
      border: `1px solid ${isHigh ? "rgba(47,165,111,0.2)" : isMedium ? "rgba(201,151,58,0.2)" : "rgba(217,92,92,0.15)"}`,
    }}>
      {/* Label + progreso */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: tone }}>{strength.label}</span>
        <span style={{ fontSize: 10, color: MUTED }}>{strength.passed}/{strength.total}</span>
      </div>
      {/* Barra */}
      <div style={{ height: 4, borderRadius: 999, background: PALETTE.border, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: progressWidth, background: tone, transition: "width 0.2s ease" }} />
      </div>
      {/* Checklist */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px" }}>
        {getPasswordRequirements().map((req) => {
          const ok = strength.checks[req.key];
          return (
            <div key={req.key} style={{ fontSize: 10, color: ok ? (isHigh ? "#2FA56F" : CU) : MUTED, lineHeight: 1.3 }}>
              {ok ? "✓" : "·"} {req.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
