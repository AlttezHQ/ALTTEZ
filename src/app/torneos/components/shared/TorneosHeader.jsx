import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, User, LogOut, Trash2, ChevronDown, Menu } from "lucide-react";
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

export default function TorneosHeader({ onLogout, onDeleteAccount, userName = "", userEmail = "", onMenuToggle }) {
  const [open, setOpen] = useState(false);

  const displayName = userName || "Administrador";

  return (
    <div style={{
      height: 56, background: CARD, borderBottom: `1px solid ${BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", flexShrink: 0, fontFamily: FONT, position: "relative", zIndex: 40,
    }}>
      {/* Left side: hamburger (mobile only) + brand */}
      <div className="flex items-center gap-3">
        {/* Hamburger menu — only visible on mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center rounded-lg p-2 transition-colors"
          style={{ background: BG, border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", minHeight: 36 }}
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <Trophy size={18} color={CU} />
          <span style={{ fontWeight: 700, fontSize: 14, color: TEXT, letterSpacing: "-0.01em" }}>Torneos</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "2px 7px" }}>ALTTEZ</span>
        </div>
      </div>

      {/* Right: empty for now (user profile is in Sidebar) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      </div>
    </div>
  );
}
