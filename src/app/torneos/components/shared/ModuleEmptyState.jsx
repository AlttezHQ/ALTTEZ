import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE   = [0.22, 1, 0.36, 1];

export default function ModuleEmptyState({ icon: Icon, title, subtitle, ctaLabel, onCta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", gap: 12, fontFamily: FONT }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 16, background: CU_DIM, border: `1px solid ${CU_BOR}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
        <Icon size={22} color={CU} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{title}</div>
      <div style={{ fontSize: 13, color: MUTED, textAlign: "center", maxWidth: 360, lineHeight: 1.6 }}>{subtitle}</div>
      {ctaLabel && (
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onCta}
          style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 7, background: "transparent", color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
        >
          <Plus size={14} />{ctaLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
