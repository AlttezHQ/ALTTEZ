with source as (
  select * from {{ source('raw_fixtures', 'fixtures_snapshot_raw') }}
)

select
  fixture_id,
  tournament_id,
  stage_id,
  category_id,
  round_number,
  leg_number,
  group_label,
  home_team_id,
  away_team_id,
  scheduled_at,
  status,
  home_score,
  away_score,
  metadata,
  source_updated_at,
  loaded_at
from source
