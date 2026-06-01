export type FixtureTabId = "fixture" | "programacion" | "tabla";

export type FixtureFilters = {
  filterJornada: string;
  filterQuery: string;
  filterEstado: string;
  expandedDates: Record<string, boolean>;
};

export type FixtureMatchRowViewModel = {
  id: string;
  localName: string;
  localColor: string;
  visitaName: string;
  visitaColor: string;
  hourLabel: string;
  venueLabel: string;
  resultLabel: string;
  isCompleted: boolean;
  state: {
    label: string;
    color: string;
    dot: string;
  };
  raw: Record<string, unknown>;
};

export type FixtureDateGroupViewModel = {
  key: string;
  label: string;
  count: number;
  isExpanded: boolean;
  matches: FixtureMatchRowViewModel[];
};

export type FixtureStandingRowViewModel = {
  equipoId: string;
  nombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  dg: number;
  pts: number;
};

export type FixturePageViewModel = {
  categories: string[];
  activeCategory: string | null;
  activeCategoryConfig: Record<string, unknown> | null;
  fixtureTab: Record<string, unknown>;
  schedulingTab: Record<string, unknown>;
  standingsTab: Record<string, unknown>;
  raw: Record<string, unknown>;
};
