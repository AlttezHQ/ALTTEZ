import { MATCH_STATUS, normalizeMatchStatus } from "../fixtureState";
import type { CategoryBaseModel, TournamentCategory, TournamentMatch, TournamentTeam } from "./categoryTypes";

const LOCALE = "es-CO";

export function formatCategoryDateTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: date.toLocaleDateString(LOCALE, { day: "2-digit", month: "short" }),
    time: date.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" }),
    timestamp: date.getTime(),
  };
}

export function getCategoryMatches(matches: TournamentMatch[], category: Pick<CategoryBaseModel, "id" | "nombre">) {
  return matches.filter((match) => {
    if (category.id && match.categoriaId) return match.categoriaId === category.id;
    if (category.id && !match.categoriaId) return (match.grupo || "General") === category.nombre;
    return (match.grupo || "General") === category.nombre;
  });
}

export function getMatchLifecycle(statusLike?: string | null) {
  const normalized = normalizeMatchStatus(statusLike);
  if (normalized === MATCH_STATUS.COMPLETED) return "completed";
  if (normalized === MATCH_STATUS.SCHEDULED || normalized === MATCH_STATUS.PRE_MATCH || normalized === MATCH_STATUS.IN_PLAY) {
    return "scheduled";
  }
  return "draft";
}

export function getLegacyCategoryBases(equipos: TournamentTeam[]): CategoryBaseModel[] {
  const categoriasMap = equipos.reduce<Record<string, TournamentTeam[]>>((acc, team) => {
    const key = team.grupo || "Sin categoria";
    if (!acc[key]) acc[key] = [];
    acc[key].push(team);
    return acc;
  }, {});

  return Object.keys(categoriasMap).sort().map((name) => ({
    id: name,
    nombre: name,
    equipos: categoriasMap[name],
    teams: categoriasMap[name].length,
    format: null,
    fases: null,
    groupsCount: 0,
    source: "legacy",
  }));
}

// DEPRECATION: remove legacyCategoryDerivation when every tournament category
// is persisted and loaded from store.categorias.
export function legacyCategoryDerivation(equipos: TournamentTeam[]) {
  return getLegacyCategoryBases(equipos);
}

export function getCategoryBaseModels(storeCategorias: TournamentCategory[], equipos: TournamentTeam[]): CategoryBaseModel[] {
  if (storeCategorias.length > 0) {
    return storeCategorias.map((category) => ({
      ...category,
      equipos: equipos.filter((team) => (team.grupo || "General") === category.nombre),
      source: "store",
    }));
  }

  return legacyCategoryDerivation(equipos);
}

export function getCompetitionGroups(matches: TournamentMatch[]) {
  return new Set(
    matches
      .filter((match) => match.fase === "grupos" && match.grupo)
      .map((match) => match.grupo as string),
  );
}

export function getAssignedGroups(teams: TournamentTeam[], categoryName: string) {
  return new Set(
    teams
      .map((team) => team.grupo)
      .filter((group) => group && group !== categoryName) as string[],
  );
}
