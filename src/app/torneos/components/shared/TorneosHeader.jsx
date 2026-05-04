import { motion } from "framer-motion";
import { Trophy, User, LogOut } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";

const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD   = PALETTE.surface;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const BORDER = PALETTE.border;
const BG     = PALETTE.bg;
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

export default function TorneosHeader({ onLogout }) {
  return (
    <div style={{
      height: 56, background: CARD, borderBottom: `1px solid ${BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0, fontFamily: FONT,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Trophy size={18} color={CU} />
        <span style={{ fontWeight: 700, fontSize: 14, color: TEXT, letterSpacing: "-0.01em" }}>Torneos</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "2px 7px" }}>ALTTEZ</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 10px" }}>
          <User size={13} color={MUTED} />
          <span style={{ fontSize: 12, color: TEXT, fontWeight: 500, fontFamily: FONT }}>Administrador</span>
        </div>
        <div style={{ width: 1, height: 20, background: BORDER }} />
        <motion.button
          whileHover={{ opacity: 0.7 }}
          onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 12, fontFamily: FONT, padding: 0 }}
        >
          <LogOut size={13} />Cerrar sesión
        </motion.button>
      </div>
    </div>
  );
}
