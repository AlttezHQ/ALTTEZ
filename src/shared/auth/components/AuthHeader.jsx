import { motion } from "framer-motion";
import { PALETTE } from "../../tokens/palette";

const BRAND_SYMBOL = "/branding/alttez-symbol-transparent.png";
const CU = PALETTE.bronce;
const CU_BORDER = "rgba(201,151,58,0.28)";
const CU_SOFT = "rgba(201,151,58,0.10)";
const EASE = [0.22, 1, 0.36, 1];

function BrandSymbol() {
  return (
    <div style={{
      width: 46, height: 46, borderRadius: 16,
      background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,241,234,0.96))",
      border: `1px solid ${PALETTE.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 10px 28px rgba(23,26,28,0.08)",
    }}>
      <img src={BRAND_SYMBOL} alt="ALTTEZ" style={{ width: 24, height: 24, objectFit: "contain" }} />
    </div>
  );
}

/**
 * @component AuthHeader
 * @description Encabezado con el logo de la marca y el badge de "Nuevo ecosistema".
 */
export default function AuthHeader({ title = "ALTTEZ", subtitle = "Infraestructura operativa para clubes y torneos" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 4, marginBottom: 16 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <BrandSymbol />
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text }}>{title}</div>
          <div style={{ fontSize: 10.5, color: PALETTE.textMuted }}>{subtitle}</div>
        </div>
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "6px 12px", borderRadius: 999,
        background: CU_SOFT, border: `1px solid ${CU_BORDER}`,
        color: PALETTE.text, fontSize: 10.5, fontWeight: 700,
      }}>
        <motion.span
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.55, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: CU, flexShrink: 0, display: "inline-block" }}
        />
        Nuevo ecosistema ALTTEZ
      </div>
    </motion.div>
  );
}
