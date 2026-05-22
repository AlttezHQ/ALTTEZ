with source as (
  select * from {{ source('raw_fixtures', 'match_events_raw') }}
)

select
  event_id,
  fixture_id,
  tournament_id,
  team_id,
  player_id,
  related_player_id,
  event_type,
  minute,
  period,
  payload,
  occurred_at,
  source_created_at,
  loaded_at,
  case
    when event_type = 'YELLOW_CARD' then 1
    when event_type in ('SECOND_YELLOW', 'SECOND_YELLOW_CARD') then 3
    when event_type = 'RED_CARD' then 4
    else 0
  end as fair_play_points
from source
