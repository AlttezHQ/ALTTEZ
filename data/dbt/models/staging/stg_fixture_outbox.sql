with source as (
  select * from {{ source('raw_fixtures', 'fixture_outbox_raw') }}
)

select
  event_id,
  fixture_id,
  tournament_id,
  event_type,
  previous_status,
  next_status,
  payload,
  payload:criterion::string as tiebreaker_criterion,
  payload:group::string as group_label,
  payload:winnerTeamId::string as winner_team_id,
  payload:fromPhase::string as from_phase,
  payload:toPhase::string as to_phase,
  source_created_at,
  loaded_at
from source
