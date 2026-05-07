import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, User, LogOut, ChevronDown } from "lucide-react";
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

export default function TorneosHeader({ onLogout, userName = "" }) {
  const [open, setOpen] = useState(false);

  const displayName = userName.includes("@")
    ? userName.split("@")[0]
    : userName || "Administrador";

  return (
    <div style={{
      height: 56, background: CARD, borderBottom: `1px solid ${BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0, fontFamily: FONT, position: "relative", zIndex: 40,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Trophy size={18} color={CU} />
        <span style={{ fontWeight: 700, fontSize: 14, color: TEXT, letterSpacing: "-0.01em" }}>Torneos</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", background: CU_DIM, color: CU, border: `1px solid ${CU_BOR}`, borderRadius: 4, padding: "2px 7px" }}>ALTTEZ</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* User dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 10px",
              cursor: "pointer", fontFamily: FONT,
            }}
          >
            <User size={13} color={MUTED} />
            <span style={{ fontSize: 12, color: TEXT, fontWeight: 500, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </span>
            <ChevronDown size={11} color={MUTED} style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0,
                  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(23,26,28,0.12)",
                  minWidth: 190, overflow: "hidden",
                }}
              >
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 11, color: MUTED }}>Cuenta</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userName || "—"}
                  </div>
                </div>

                <button
                  onClick={() => { setOpen(false); onLogout?.(); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 9,
                    padding: "10px 14px", background: "none", border: "none",
                    cursor: "pointer", fontFamily: FONT, fontSize: 12, color: MUTED,
                    textAlign: "left",
                  }}
                >
                  <LogOut size={13} /> Cerrar sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
