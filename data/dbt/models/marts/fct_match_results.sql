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
  home_score,
  away_score,
  case
    when status = 'COMPLETED' and home_score > away_score then home_team_id
    when status = 'COMPLETED' and away_score > home_score then away_team_id
    else null
  end as winner_team_id,
  case
    when status = 'COMPLETED' and home_score = away_score then true
    else false
  end as is_draw,
  scheduled_at,
  source_updated_at
from {{ ref('stg_fixtures') }}
where status = 'COMPLETED'
