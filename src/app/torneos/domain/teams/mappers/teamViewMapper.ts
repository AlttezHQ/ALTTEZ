import type { TeamCardViewModel, TeamDomainModel } from "../teamTypes";

export function mapTeamToViewModel(team: TeamDomainModel): TeamCardViewModel {
  return {
    id: team.id,
    name: team.name,
    category: team.category,
    contact: team.contact,
    playersCount: team.playersCount,
    status: team.status,
    logo: team.logo,
    registrationLink: team.registrationLink,
  };
}
