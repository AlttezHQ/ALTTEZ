select
  event_id,
  tournament_id,
  fixture_id,
  winner_team_id,
  from_phase,
  to_phase,
  payload:targetMatchId::string as target_match_id,
  source_created_at
from {{ ref('stg_fixture_outbox') }}
where event_type = 'competition.round_advanced'
