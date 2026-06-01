export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tournament extends BaseEntity {
  nombre: string;
  deporte?: string;
  temporada?: string;
  formato?: string;
  estado?: string;
  slug?: string | null;
  publicado?: boolean;
  descripcion?: string | null;
  contacto?: string | null;
}

export interface Category extends BaseEntity {
  torneoId: string;
  nombre: string;
  format?: string;
  teams?: number;
  groupsCount?: number;
  qualifyPerGroup?: number;
}

export interface Team extends BaseEntity {
  torneoId: string;
  nombre: string;
  escudo?: string | null;
  color?: string | null;
  grupo?: string | null;
  entrenador?: string | null;
  delegado?: string | null;
  jugadores?: unknown[];
}

export interface Fixture extends BaseEntity {
  torneoId: string;
  categoriaId?: string | null;
  fase?: string;
  ronda?: number | null;
  grupo?: string | null;
  equipoLocalId?: string | null;
  equipoVisitaId?: string | null;
  fechaHora?: string | null;
  estado?: string;
  status?: string;
}

export interface Proposal extends BaseEntity {
  titulo?: string;
  estado?: string;
  client_name?: string;
  accepted_at?: string | null;
}

export interface Athlete extends BaseEntity {
  club_id: string;
  name: string;
  position?: string;
  status?: "P" | "A" | "L";
  rpe?: number | null;
}

export interface HealthSnapshot extends BaseEntity {
  club_id: string;
  athlete_id: string | number;
  athlete_name: string;
  salud: number;
  risk_level: "optimo" | "precaucion" | "riesgo" | "sin_datos";
  rpe_actual?: number | null;
}
