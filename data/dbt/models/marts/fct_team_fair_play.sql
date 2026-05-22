select
  tournament_id,
  fixture_id,
  team_id,
  sum(fair_play_points) as fair_play_points,
  count_if(event_type = 'YELLOW_CARD') as yellow_cards,
  count_if(event_type in ('SECOND_YELLOW', 'SECOND_YELLOW_CARD')) as second_yellow_cards,
  count_if(event_type = 'RED_CARD') as red_cards
from {{ ref('stg_match_events') }}
where fair_play_points > 0
group by 1, 2, 3
