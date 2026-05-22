select distinct
  tournament_id,
  min(source_created_at) as first_event_at,
  max(source_created_at) as last_event_at
from {{ ref('stg_fixture_outbox') }}
where tournament_id is not null
group by 1
