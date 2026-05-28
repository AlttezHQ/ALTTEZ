import { AnimatePresence, motion } from "framer-motion";
import { Edit2, Link as LinkIcon, MoreVertical, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import TeamListCard from "./TeamListCard";
import TeamStatusBadge from "./TeamStatusBadge";
import { PALETTE, ELEVATION } from "../../../../shared/tokens/palette";
import styles from "./TeamsTable.module.css";

const TABLE_HEADERS = ["Escudo", "Equipo", "Categoria", "Delegado", "Jugadores", "Estado", "Acciones"];

export default function TeamsTable({ teams, onAction }) {
  const [menuId, setMenuId] = useState(null);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Listado de equipos</h3>
      </div>

      {teams.length > 0 && (
        <div className={styles.mobileList}>
          {teams.map((team) => (
            <TeamListCard key={team.id} team={team} onAction={onAction} />
          ))}
        </div>
      )}

      <div className={styles.desktopTableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={team.id} className={index < teams.length - 1 ? styles.tableRow : undefined}>
                <td>
                  <div className={styles.logo}>
                    {team.logo ? <img src={team.logo} alt={team.name} className={styles.logoImage} /> : team.name.charAt(0)}
                  </div>
                </td>
                <td className={styles.teamName}>{team.name}</td>
                <td className={styles.muted}>{team.category}</td>
                <td className={styles.contact}>{team.contact || "—"}</td>
                <td className={styles.centerCell}>{team.playersCount}</td>
                <td><TeamStatusBadge status={team.status} /></td>
                <td className={styles.actionsCell}>
                  <button type="button" className={styles.menuButton} onClick={() => setMenuId(menuId === team.id ? null : team.id)}>
                    <MoreVertical size={14} />
                  </button>
                  <AnimatePresence>
                    {menuId === team.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: 10 }}
                        className={styles.menu}
                        style={{ boxShadow: ELEVATION.panel }}
                      >
                        <button type="button" className={styles.menuItem} onClick={() => { setMenuId(null); onAction(team.id, "jugadores"); }}>
                          <UserPlus size={14} color={PALETTE.bronce} /> Plantilla / Jugadores
                        </button>
                        <button type="button" className={styles.menuItem} onClick={() => { setMenuId(null); onAction(team.id, "link"); }}>
                          <LinkIcon size={14} color={PALETTE.bronce} /> Copiar link de registro
                        </button>
                        <button type="button" className={styles.menuItemMuted} onClick={() => { setMenuId(null); onAction(team.id, "editar"); }}>
                          <Edit2 size={14} color={PALETTE.textMuted} /> Editar informacion
                        </button>
                        <div className={styles.menuDivider} />
                        <button type="button" className={styles.menuItemDanger} onClick={() => { setMenuId(null); onAction(team.id, "eliminar"); }}>
                          <Trash2 size={14} /> Eliminar equipo
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {teams.length === 0 && <div className={styles.empty}>No hay equipos registrados. Comienza agregando uno nuevo.</div>}
    </div>
  );
}
