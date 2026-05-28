import { Filter, Plus, Search } from "lucide-react";
import clsx from "clsx";
import styles from "./CategoriesToolbar.module.css";

export default function CategoriesToolbar({
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
  onCreateCategory,
}) {
  return (
    <div className={styles.toolbar}>
      <label className={styles.search} aria-label="Buscar categoria">
        <Search size={16} />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar categoria..."
        />
      </label>

      <div className={styles.actions}>
        <button type="button" className={clsx(styles.button, showFilters && styles.buttonActive)} onClick={onToggleFilters}>
          <Filter size={15} />
          Filtros
        </button>
        <button type="button" className={clsx(styles.button, styles.primaryButton)} onClick={onCreateCategory}>
          <Plus size={15} />
          Nueva categoria
        </button>
      </div>
    </div>
  );
}
