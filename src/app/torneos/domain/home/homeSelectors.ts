type TournamentEntity = {
  id: string;
  nombre?: string;
};

type TeamEntity = {
  id: string;
  torneoId: string;
};

type MatchEntity = {
  id: string;
  torneoId: string;
};

type VenueEntity = {
  id: string;
  torneoId: string;
};

type HomeSelectorInput = {
  torneoActivoId: string | null;
  torneos: TournamentEntity[];
  equipos: TeamEntity[];
  partidos: MatchEntity[];
  sedes: VenueEntity[];
};

export function selectHomePageViewModel(input: HomeSelectorInput) {
  const activeTournament = input.torneoActivoId
    ? input.torneos.find((item) => item.id === input.torneoActivoId) ?? null
    : null;

  if (!activeTournament || !input.torneoActivoId) {
    return {
      hasActiveTournament: false,
      activeTournament: null,
      teams: [],
      matches: [],
      venues: [],
    };
  }

  return {
    hasActiveTournament: true,
    activeTournament,
    teams: input.equipos.filter((item) => item.torneoId === input.torneoActivoId),
    matches: input.partidos.filter((item) => item.torneoId === input.torneoActivoId),
    venues: input.sedes.filter((item) => item.torneoId === input.torneoActivoId),
  };
}
