import { CheckCircle2, Info, Shield, Users } from "lucide-react";
import { PALETTE } from "../../../../shared/tokens/palette";
import styles from "./TeamsSummarySidebar.module.css";

const SUMMARY_ITEMS = [
  { id: "total", label: "Equipos totales", icon: Users, color: PALETTE.bronce },
  { id: "categories", label: "Categorias", icon: Shield, color: PALETTE.amber },
  { id: "completeSquads", label: "Plantillas completas", icon: CheckCircle2, color: PALETTE.success },
];

export default function TeamsSummarySidebar({ summary }) {
  const values = {
    total: summary.total,
    categories: summary.categories,
    completeSquads: summary.completeSquads,
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Users size={18} color={PALETTE.bronce} />
          <h4>Resumen</h4>
        </div>

        {SUMMARY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className={styles.stat}>
              <div className={styles.statIcon} style={{ "--icon-color": item.color }}>
                <Icon size={16} color={item.color} />
              </div>
              <div>
                <div className={styles.statValue}>{values[item.id]}</div>
                <div className={styles.statLabel}>{item.label}</div>
              </div>
            </div>
          );
        })}

        <div className={styles.note}>
          <Info size={14} />
          <span>Recuerda que para el fixture cada equipo debe tener al menos 1 jugador.</span>
        </div>
      </div>
    </aside>
  );
}
