create table if not exists public.pipeline_cards (
  id text primary key,
  stage text not null check (stage in ('lead','proposta','aceita','contrato','fechado')) default 'lead',
  empresa text not null,
  contato text,
  email text,
  funcionarios integer default 0,
  valor integer default 0,
  dias integer default 0,
  decisor text,
  proximo_passo text,
  probabilidade integer default 35,
  origem text,
  extra jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_pipeline_cards_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pipeline_cards_updated_at on public.pipeline_cards;
create trigger pipeline_cards_updated_at
before update on public.pipeline_cards
for each row execute function public.set_pipeline_cards_updated_at();

alter table public.pipeline_cards enable row level security;

drop policy if exists "pipeline_cards_select_test" on public.pipeline_cards;
drop policy if exists "pipeline_cards_insert_test" on public.pipeline_cards;
drop policy if exists "pipeline_cards_update_test" on public.pipeline_cards;
drop policy if exists "pipeline_cards_delete_test" on public.pipeline_cards;

create policy "pipeline_cards_select_test" on public.pipeline_cards for select to anon, authenticated using (true);
create policy "pipeline_cards_insert_test" on public.pipeline_cards for insert to anon, authenticated with check (true);
create policy "pipeline_cards_update_test" on public.pipeline_cards for update to anon, authenticated using (true) with check (true);
create policy "pipeline_cards_delete_test" on public.pipeline_cards for delete to anon, authenticated using (true);
