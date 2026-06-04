import { useMemo, useState } from "react";
import { Search, Tag } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import { selectCategoriesPageViewModel } from "../domain/categories/categorySelectors";
import { CATEGORY_STATES } from "../domain/constants/categoryStates";
import CategoryCard from "../components/categories/CategoryCard";
import GlobalStateCard from "../components/categories/GlobalStateCard";
import CategoriesToolbar from "../components/categories/CategoriesToolbar";
import styles from "./CategoriasPage.module.css";

export default function CategoriasPage({ torneoId, onGoTorneos, onNavigate }) {
  const torneoActivoId = torneoId;
  const allEquipos = useTorneosStore((state) => state.equipos);
  const allCategorias = useTorneosStore((state) => state.categorias);
  const allPartidos = useTorneosStore((state) => state.partidos);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [sortMode, setSortMode] = useState("priority");

  const viewModel = useMemo(
    () =>
      selectCategoriesPageViewModel({
        torneoActivoId,
        categories: allCategorias,
        teams: allEquipos,
        matches: allPartidos,
        search,
        activeFilter,
        onlyAlerts,
        sortMode,
      }),
    [activeFilter, allCategorias, allEquipos, allPartidos, onlyAlerts, search, sortMode, torneoActivoId],
  );

  if (!torneoActivoId) {
    return (
      <ModuleEmptyState
        icon={Tag}
        title="Selecciona un torneo"
        subtitle="Debes abrir un torneo para gestionar sus categorias."
        ctaLabel="Ver mis torneos"
        onCta={onGoTorneos}
      />
    );
  }

  if (viewModel.summary.totalCategories === 0) {
    return (
      <ModuleEmptyState
        icon={Tag}
        title="Sin categorias"
        subtitle="Crea un torneo con categorias para verlas organizadas aqui."
      />
    );
  }

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Categorias</h2>
          <p className={styles.subtitle}>
            {viewModel.summary.totalCategories} categorias · {viewModel.summary.totalTeams} equipos · {viewModel.summary.categoriesWithIncidents} con incidencias
          </p>
        </div>

        <CategoriesToolbar
          search={search}
          onSearchChange={setSearch}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((open) => !open)}
          onCreateCategory={() => onNavigate?.("crear")}
        />
      </header>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersGroup}>
            <span className={styles.filtersLabel}>Ordenar</span>
            <div className={styles.filtersInline}>
              {[
                { id: "priority", label: "Prioridad" },
                { id: "activity", label: "Actividad" },
                { id: "name", label: "Nombre" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.chipButton} ${sortMode === option.id ? styles.chipButtonActive : ""}`}
                  onClick={() => setSortMode(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filtersGroup}>
            <span className={styles.filtersLabel}>Enfoque</span>
            <div className={styles.filtersInline}>
              <button
                type="button"
                className={`${styles.chipButton} ${onlyAlerts ? styles.chipButtonActive : ""}`}
                onClick={() => setOnlyAlerts((value) => !value)}
              >
                Solo alertas
              </button>
              <button
                type="button"
                className={styles.chipButton}
                onClick={() => {
                  setOnlyAlerts(false);
                  setActiveFilter("all");
                  setSortMode("priority");
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      <section className={styles.stateGrid} aria-label="Estados globales">
        {viewModel.globalStates.map((state) => (
          <GlobalStateCard
            key={state.id}
            state={state}
            isSelected={activeFilter === state.id}
            onClick={() => setActiveFilter((current) => (current === state.id ? "all" : state.id))}
          />
        ))}
      </section>

      <section className={styles.resultsMeta}>
        <span>{viewModel.categories.length} categorias visibles</span>
        <span>{viewModel.categories.filter((category) => category.states.includes(CATEGORY_STATES.COMPETITION_ACTIVE)).length} activas ahora</span>
        <span>{viewModel.categories.filter((category) => category.alerts.length > 0).length} requieren atencion</span>
      </section>

      <section className={styles.grid}>
        {viewModel.categories.map((category) => (
          <CategoryCard key={category.id} category={category} onNavigate={onNavigate} />
        ))}
      </section>

      {viewModel.categories.length === 0 && (
        <div className={styles.emptyFilterState}>
          <Search size={18} />
          <div>
            <strong>No encontramos categorias para este filtro</strong>
            <p>Ajusta la busqueda o limpia los filtros para volver al panorama completo.</p>
          </div>
        </div>
      )}
    </section>
  );
}
