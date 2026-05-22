select
  event_id,
  tournament_id,
  fixture_id,
  group_label,
  tiebreaker_criterion,
  payload:teamIds as affected_team_ids,
  payload:resolvedOrder as resolved_order,
  source_created_at
from {{ ref('stg_fixture_outbox') }}
where event_type = 'competition.tiebreaker_applied'
