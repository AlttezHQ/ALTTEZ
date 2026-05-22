select distinct
  team_id,
  tournament_id
from {{ ref('stg_match_events') }}
where team_id is not null

union

select distinct
  home_team_id as team_id,
  tournament_id
from {{ ref('stg_fixtures') }}
where home_team_id is not null

union

select distinct
  away_team_id as team_id,
  tournament_id
from {{ ref('stg_fixtures') }}
where away_team_id is not null
