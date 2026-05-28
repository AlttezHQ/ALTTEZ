import { Edit2, Link as LinkIcon, MoreVertical, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TeamStatusBadge from "./TeamStatusBadge";
import { PALETTE, ELEVATION } from "../../../../shared/tokens/palette";
import styles from "./TeamListCard.module.css";

const MUTED = PALETTE.textMuted;
const CU = PALETTE.bronce;

export default function TeamListCard({ team, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.identity}>
        <div className={styles.logo}>
          {team.logo ? <img src={team.logo} alt={team.name} className={styles.logoImage} /> : team.name.charAt(0)}
        </div>
        <div className={styles.copy}>
          <div className={styles.name}>{team.name}</div>
          <div className={styles.meta}>{team.category} · {team.playersCount} jugadores</div>
        </div>
      </div>

      <TeamStatusBadge status={team.status} />

      <div className={styles.menuWrapper}>
        <button type="button" className={styles.menuButton} onClick={() => setMenuOpen((value) => !value)}>
          <MoreVertical size={14} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 10 }}
              className={styles.menu}
              style={{ boxShadow: ELEVATION.panel }}
            >
              <button type="button" className={styles.menuItem} onClick={() => { setMenuOpen(false); onAction(team.id, "jugadores"); }}>
                <UserPlus size={14} color={CU} /> Plantilla / Jugadores
              </button>
              <button type="button" className={styles.menuItem} onClick={() => { setMenuOpen(false); onAction(team.id, "link"); }}>
                <LinkIcon size={14} color={CU} /> Copiar link de registro
              </button>
              <button type="button" className={styles.menuItemMuted} onClick={() => { setMenuOpen(false); onAction(team.id, "editar"); }}>
                <Edit2 size={14} color={MUTED} /> Editar informacion
              </button>
              <div className={styles.menuDivider} />
              <button type="button" className={styles.menuItemDanger} onClick={() => { setMenuOpen(false); onAction(team.id, "eliminar"); }}>
                <Trash2 size={14} /> Eliminar equipo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
