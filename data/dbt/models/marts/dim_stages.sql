select distinct
  stage_id,
  tournament_id,
  min(round_number) as min_round_number,
  max(round_number) as max_round_number
from {{ ref('stg_fixtures') }}
where stage_id is not null
group by 1, 2
