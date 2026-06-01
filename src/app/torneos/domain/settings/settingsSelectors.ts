type TournamentEntity = {
  id: string;
  slug?: string | null;
  nombre?: string;
  deporte?: string;
  temporada?: string;
  fechaInicio?: string;
  fechaFin?: string;
  organizador?: string;
  sedePrincipal?: string;
  descripcion?: string;
  contacto?: string;
  premios?: string;
  visibilidad?: "publico" | "privado" | string;
  publicado?: boolean;
  estado?: string;
  perfil?: string | null;
  portada?: string | null;
  reglamentoUrl?: string | null;
  patrocinadores?: Array<{ id: string; nombre?: string; logo: string }>;
};

type SettingsPageSelectorInput = {
  torneoActivoId: string | null;
  torneos: TournamentEntity[];
  origin?: string;
};

export type SettingsFormDefaults = {
  nombre: string;
  deporte: string;
  temporada: string;
  fechaInicio: string;
  fechaFin: string;
  organizador: string;
  sedePrincipal: string;
  descripcion: string;
  contacto: string;
  premios: string;
  visibilidad: "publico" | "privado";
};

export type SettingsPageViewModel = {
  tournament: TournamentEntity | null;
  title: string;
  publicUrl: string;
  isPublished: boolean;
  formDefaults: SettingsFormDefaults;
  sponsors: Array<{ id: string; nombre?: string; logo: string }>;
};

export function selectSettingsPageViewModel(
  input: SettingsPageSelectorInput,
): SettingsPageViewModel {
  const tournament =
    input.torneos.find((item) => item.id === input.torneoActivoId) ?? null;

  if (!tournament) {
    return {
      tournament: null,
      title: "",
      publicUrl: "",
      isPublished: false,
      formDefaults: {
        nombre: "",
        deporte: "Fútbol",
        temporada: "",
        fechaInicio: "",
        fechaFin: "",
        organizador: "",
        sedePrincipal: "",
        descripcion: "",
        contacto: "",
        premios: "",
        visibilidad: "publico",
      },
      sponsors: [],
    };
  }

  return {
    tournament,
    title: tournament.nombre || "Ajustes del torneo",
    publicUrl:
      input.origin && tournament.slug ? `${input.origin}/t/${tournament.slug}` : "",
    isPublished: Boolean(tournament.publicado),
    formDefaults: {
      nombre: tournament.nombre || "",
      deporte: tournament.deporte || "Fútbol",
      temporada: tournament.temporada || "",
      fechaInicio: tournament.fechaInicio || "",
      fechaFin: tournament.fechaFin || "",
      organizador: tournament.organizador || "",
      sedePrincipal: tournament.sedePrincipal || "",
      descripcion: tournament.descripcion || "",
      contacto: tournament.contacto || "",
      premios: tournament.premios || "",
      visibilidad:
        tournament.visibilidad === "privado" ? "privado" : "publico",
    },
    sponsors: Array.isArray(tournament.patrocinadores)
      ? tournament.patrocinadores
      : [],
  };
}
