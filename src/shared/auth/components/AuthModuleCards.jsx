import { motion } from "framer-motion";
import { UserPlus, LogIn, Star } from "lucide-react";
import { PALETTE } from "../../tokens/palette";

const CU = PALETTE.bronce;
const CU_BORDER = "rgba(201,151,58,0.28)";
const CU_SOFT = "rgba(201,151,58,0.10)";
const EASE = [0.22, 1, 0.36, 1];
const SPRING_FAST = { type: "spring", stiffness: 400, damping: 28 };

// ── Mini club list ──
const CLUB_AVATARS = [
  { bg: "rgba(201,151,58,0.18)", color: CU },
  { bg: "rgba(47,165,111,0.18)", color: "#2FA56F" },
  { bg: "rgba(91,139,245,0.18)", color: "#5B8BF5" },
  { bg: "rgba(217,92,92,0.18)", color: "#D95C5C" },
];

function MiniClubList() {
  return (
    <div className="ldg-mini-list" style={{ width: 176, flexShrink: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: PALETTE.text, marginBottom: 8 }}>Clubes</div>
      {[
        ["Club Atlético Norte","Primera División"],
        ["Deportivo Sur","Inferiores"],
        ["Unión Deportiva","Juveniles"],
        ["Escuela Central","Escuelita"],
      ].map(([name, cat], i) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 0", borderBottom: `1px solid ${PALETTE.border}` }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: CLUB_AVATARS[i].bg,
            border: `1px solid ${CLUB_AVATARS[i].color}44`,
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: CLUB_AVATARS[i].color }}>{name[0]}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: PALETTE.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
            <div style={{ fontSize: 9.5, color: PALETTE.textMuted }}>{cat}</div>
          </div>
          <div style={{ fontSize: 9, color: "#2FA56F", fontWeight: 700, background: "#EAF7F0", padding: "2px 6px", borderRadius: 999, flexShrink: 0 }}>Activo</div>
        </div>
      ))}
    </div>
  );
}

// ── Mini fixture ──
const MATCH_AVATARS = [
  [{ bg: "rgba(201,151,58,0.18)", color: CU }, { bg: "rgba(47,165,111,0.18)", color: "#2FA56F" }],
  [{ bg: "rgba(91,139,245,0.18)", color: "#5B8BF5" }, { bg: "rgba(217,92,92,0.18)", color: "#D95C5C" }],
  [{ bg: "rgba(47,165,111,0.18)", color: "#2FA56F" }, { bg: "rgba(201,151,58,0.18)", color: CU }],
];

function MiniFixture() {
  return (
    <div className="ldg-mini-fixture" style={{ width: 192, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: PALETTE.text, lineHeight: 1.3 }}>Apertura 2024 · Cat. Sub 14</div>
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${PALETTE.border}`, marginBottom: 7 }}>
        {["Fixture","Tabla"].map((t, i) => (
          <div key={t} style={{
            fontSize: 8.5, fontWeight: i === 0 ? 700 : 400,
            color: i === 0 ? CU : PALETTE.textMuted,
            padding: "4px 7px",
            borderBottom: i === 0 ? `2px solid ${CU}` : "2px solid transparent",
            marginBottom: -1,
          }}>{t}</div>
        ))}
      </div>
      {[
        ["C","Norte","D","Sur","Sáb 10/05"],
        ["U","Unión","E","Central","Sáb 10/05"],
      ].map(([hi, home, ai, away, date], idx) => (
        <div key={home} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 0", borderBottom: `1px solid ${PALETTE.border}` }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: MATCH_AVATARS[idx][0].bg, border: `1px solid ${MATCH_AVATARS[idx][0].color}44`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: MATCH_AVATARS[idx][0].color }}>{hi}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: PALETTE.text }}>{home} <span style={{ color: PALETTE.textMuted, fontWeight: 400 }}>vs</span> {away}</div>
            <div style={{ fontSize: 8.5, color: PALETTE.textMuted }}>{date}</div>
          </div>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: MATCH_AVATARS[idx][1].bg, border: `1px solid ${MATCH_AVATARS[idx][1].color}44`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: MATCH_AVATARS[idx][1].color }}>{ai}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AuthModuleCards({ onAction }) {
  return (
    <div className="ldg-right-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      
      {/* ALTTEZ Clubes */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.52, delay: 0.10, ease: EASE }}
        whileHover={{ y: -3, boxShadow: "0 24px 56px rgba(23,26,28,0.12)" }}
        style={{
          padding: "22px 20px", borderRadius: 22, background: "#FFFFFF",
          border: `1px solid ${PALETTE.border}`, boxShadow: "0 16px 44px rgba(23,26,28,0.08)",
        }}
      >
        <div className="ldg-card-inner" style={{ display: "flex", gap: 18 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: CU, marginBottom: 7 }}>ALTTEZ CLUBES</div>
            <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text, marginBottom: 8 }}>Gestionar clubes</div>
            <p style={{ margin: "0 0 11px", fontSize: 12, lineHeight: 1.65, color: PALETTE.textMuted }}>Administra la operación interna de tu club o escuela deportiva desde un entorno profesional.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button
                onClick={() => onAction("register", null)}
                whileHover={{ y: -1, boxShadow: `0 12px 28px rgba(201,151,58,0.34)` }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_FAST}
                style={{ flex: 1, minHeight: 40, borderRadius: 10, border: "none", background: `linear-gradient(135deg,${CU},#A66F38)`, color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <UserPlus size={12} /> Registrar club
              </motion.button>
              <motion.button
                onClick={() => onAction("login", null)}
                whileHover={{ y: -1, borderColor: CU, color: CU }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_FAST}
                style={{ flex: 1, minHeight: 40, borderRadius: 10, border: `1px solid ${PALETTE.border}`, background: "transparent", color: PALETTE.text, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <LogIn size={12} /> Login
              </motion.button>
            </div>
          </div>
          <MiniClubList />
        </div>
      </motion.div>

      {/* ALTTEZ Torneos */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.52, delay: 0.18, ease: EASE }}
        whileHover={{ y: -3, boxShadow: `0 24px 56px rgba(201,151,58,0.22), 0 8px 24px rgba(23,26,28,0.08)` }}
        style={{
          padding: "22px 20px", borderRadius: 22,
          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,248,244,0.97) 100%)",
          border: `1.5px solid ${CU_BORDER}`, boxShadow: `0 16px 44px ${CU_SOFT}, 0 8px 24px rgba(23,26,28,0.06)`,
          position: "relative", overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          style={{
            position: "absolute", top: 13, right: 13,
            fontSize: 8.5, fontWeight: 800, letterSpacing: "0.08em",
            color: CU, background: "rgba(244,231,207,0.92)",
            border: `1px solid ${CU_BORDER}`, borderRadius: 999,
            padding: "3px 9px", display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <Star size={8} fill="currentColor" /> MÓDULO DESTACADO
        </motion.div>
        <div className="ldg-card-inner" style={{ display: "flex", gap: 18 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: CU, marginBottom: 7 }}>ALTTEZ TORNEOS</div>
            <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.05em", color: PALETTE.text, marginBottom: 8 }}>Gestionar torneos</div>
            <p style={{ margin: "0 0 11px", fontSize: 12, lineHeight: 1.65, color: PALETTE.textMuted }}>Organiza torneos con fixture, resultados, tabla de posiciones y vista pública profesional.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button
                onClick={() => onAction("register", "torneos")}
                whileHover={{ y: -1, boxShadow: `0 12px 28px rgba(201,151,58,0.34)` }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_FAST}
                style={{ flex: 1, minHeight: 40, borderRadius: 10, border: "none", background: `linear-gradient(135deg,${CU},#A66F38)`, color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <UserPlus size={12} /> Registrar
              </motion.button>
              <motion.button
                onClick={() => onAction("login", "torneos")}
                whileHover={{ y: -1, borderColor: CU, color: CU }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_FAST}
                style={{ flex: 1, minHeight: 40, borderRadius: 10, border: `1px solid ${PALETTE.border}`, background: "transparent", color: PALETTE.text, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <LogIn size={12} /> Login
              </motion.button>
            </div>
          </div>
          <MiniFixture />
        </div>
      </motion.div>
    </div>
  );
}
