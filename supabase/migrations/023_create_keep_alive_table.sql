-- Dedicated, non-sensitive target for automated project activity checks.
create table if not exists public.keep_alive (
  id boolean primary key default true check (id),
  created_at timestamptz not null default now()
);

comment on table public.keep_alive is
  'Singleton read-only target used by the GitHub Actions Supabase keep-alive.';

alter table public.keep_alive enable row level security;

revoke all on table public.keep_alive from anon, authenticated;
grant select on table public.keep_alive to anon, authenticated;

create policy "keep_alive_select_public"
  on public.keep_alive
  for select
  to anon, authenticated
  using (true);

insert into public.keep_alive (id)
values (true)
on conflict (id) do nothing;
