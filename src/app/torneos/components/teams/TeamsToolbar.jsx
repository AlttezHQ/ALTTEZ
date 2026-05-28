import { Download, Filter, Plus, Search, Trophy } from "lucide-react";
import styles from "./TeamsToolbar.module.css";

export default function TeamsToolbar({
  tournamentName,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onCreate,
  onImport,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.tournamentBadge}>
        <Trophy size={16} />
        <div>
          <div className={styles.kicker}>Torneo actual</div>
          <div className={styles.value}>{tournamentName}</div>
        </div>
      </div>

      <label className={styles.search}>
        <Search size={16} />
        <input type="text" placeholder="Buscar equipo..." value={search} onChange={(event) => onSearchChange(event.target.value)} />
      </label>

      <div className={styles.filter}>
        <Filter size={16} />
        <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="pending">Pendientes</option>
          <option value="incomplete">Incompletos</option>
        </select>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={onCreate}>
          Nuevo <Plus size={16} />
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onImport}>
          Importar <Download size={16} />
        </button>
      </div>
    </div>
  );
}
