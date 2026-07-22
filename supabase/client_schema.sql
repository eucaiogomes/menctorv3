-- =====================================================
-- SCHEMA FOCADO: Clientes + Etapas + Cadastro
-- Apenas o que existe hoje no app (7 etapas + formulário de cadastro)
-- =====================================================

create extension if not exists "uuid-ossp";

-- Função para updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================
-- 1. STEPS - Definição das 7 etapas (estática)
-- =====================================================
create table public.steps (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  label text not null,
  description text,
  created_at timestamptz default now()
);

comment on table public.steps is 'Definição das etapas do projeto (Cadastro, Proposta, Contrato, etc).';

-- Seed das 7 etapas atuais do app
insert into public.steps (number, label, description) values
(1, 'Cadastro', 'Dados completos da empresa e contexto de riscos psicossociais'),
(2, 'Proposta', 'Visualizar proposta e enviar link para aceite do cliente'),
(3, 'Contrato', 'Contrato com aceite digital do cliente'),
(4, 'Sensibilização', 'Palestra, treinamento e trilha'),
(5, 'Diagnóstico', 'Seleção de instrumentos: COPSOQ II, DRPS e Clima'),
(6, 'Relatórios', 'Disponível após diagnóstico'),
(7, 'Apresentação', 'Reunião de discussão do plano de ação')
on conflict (number) do nothing;

-- =====================================================
-- 2. CLIENTS - Dados básicos do cliente
-- =====================================================
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  contact text,
  email text,
  phone text,
  sector text,
  employees int,
  mrr numeric(12,2),                    -- Investimento do projeto (editável na proposta)
  color text default '#2F7D6F',
  status text default 'ativo' check (status in ('ativo', 'negociacao', 'pausado', 'concluido')),
  current_step int default 1 references public.steps(number),
  next_action text,
  last_interaction_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index idx_clients_status on public.clients(status);
create index idx_clients_current_step on public.clients(current_step);
create index idx_clients_mrr on public.clients(mrr);

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.handle_updated_at();

comment on table public.clients is 'Clientes/empresas com dados básicos e etapa atual.';

-- =====================================================
-- 3. CLIENT_STEP_PROGRESS - Progresso por etapa
-- =====================================================
create table public.client_step_progress (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  step_number int not null references public.steps(number),
  status text default 'pendente' check (status in ('pendente', 'em_andamento', 'concluida', 'bloqueada')),
  data jsonb default '{}'::jsonb,           -- Dados específicos da etapa (ex: form do cadastro, aceite da proposta, etc)
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (client_id, step_number)
);

create index idx_client_step_progress_client on public.client_step_progress(client_id);
create index idx_client_step_progress_step on public.client_step_progress(step_number);
create index idx_client_step_progress_status on public.client_step_progress(status);

create trigger client_step_progress_updated_at
  before update on public.client_step_progress
  for each row execute function public.handle_updated_at();

comment on table public.client_step_progress is 'Estado de cada etapa para cada cliente. O "data" guarda o que foi preenchido naquela etapa.';

-- =====================================================
-- 4. CADASTRO_RESPONSES - Dados do formulário de Cadastro (etapa 1)
-- Tabela dedicada para os 18 campos para facilitar consultas
-- =====================================================
create table public.cadastro_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients(id) on delete cascade,

  -- 1-5 básicos
  razao_social text,
  responsavel text,
  email text,
  telefone text,
  cnpj text,

  -- 6. Quantidade por área (json para flexibilidade)
  qtd_por_area jsonb default '{}'::jsonb,   -- { "administrativo": 30, "operacional": 120, ... }

  qtd_cargos int,
  segmento text,
  unidades text,
  cidades text,
  terceirizados text,

  -- 12 e 13 (arrays)
  possui text[] default '{}',
  indicadores text[] default '{}',

  -- 14 a 18 (campos do formulário atual)
  mapeamento_formal text,
  pesquisa_clima text,
  canais_escuta text,
  fiscalizacao_evidencia text,
  gestao_riscos_outra text,

  pressao_metas text,
  ritmo_intenso text,
  capacitacao_lideranca text,
  conflitos_recorrentes text,
  assedio_moral text,
  lideranca_outra text,

  juridico_acompanha text,
  acao_trabalhista_mental text,
  sente_protegida text,
  juridica_outra text,

  excesso_trabalho boolean,
  prazos_inalcancaveis boolean,
  falta_controle boolean,
  estrutura_nao_aplica boolean,
  estrutura_outra text,

  trabalha_com text[] default '{}',

  -- Metadados
  submitted_at timestamptz,
  form_token text,                          -- token usado no link público
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger cadastro_responses_updated_at
  before update on public.cadastro_responses
  for each row execute function public.handle_updated_at();

create index idx_cadastro_client on public.cadastro_responses(client_id);

comment on table public.cadastro_responses is 'Respostas completas do formulário de Cadastro (18 perguntas). Mantido separado para facilitar queries e import de formulário público.';

-- =====================================================
-- 5. DOCUMENTS (propostas, contratos, relatórios)
-- =====================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  step_number int references public.steps(number),
  type text check (type in ('proposta', 'contrato', 'relatorio', 'outro')),
  title text,
  url text,
  status text default 'enviado' check (status in ('enviado', 'visualizado', 'assinado', 'rejeitado')),
  sent_at timestamptz default now(),
  signed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index idx_documents_client on public.documents(client_id, step_number);

-- =====================================================
-- 6. EVENTS (histórico simples das etapas e cadastro)
-- =====================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_type text not null,                 -- 'step_changed', 'cadastro_submitted', 'proposta_enviada', 'aceite_recebido', etc.
  step_number int,
  description text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index idx_events_client on public.events(client_id, created_at desc);
create index idx_events_type on public.events(event_type);

comment on table public.events is 'Histórico leve de mudanças nas etapas e no cadastro.';

-- =====================================================
-- RLS (básico)
-- =====================================================
alter table public.clients enable row level security;
alter table public.client_step_progress enable row level security;
alter table public.cadastro_responses enable row level security;
alter table public.documents enable row level security;
alter table public.events enable row level security;

-- Exemplo: service_role tem acesso total (usado pelo backend/N8N)
create policy "Service role full access" on public.clients for all to service_role using (true);
create policy "Service role full access" on public.client_step_progress for all to service_role using (true);
create policy "Service role full access" on public.cadastro_responses for all to service_role using (true);
create policy "Service role full access" on public.documents for all to service_role using (true);
create policy "Service role full access" on public.events for all to service_role using (true);

-- Para o frontend (anon key) no demo - remova em produção
create policy "Anon full (demo)" on public.clients for all to anon using (true) with check (true);
create policy "Anon full (demo)" on public.client_step_progress for all to anon using (true) with check (true);
create policy "Anon full (demo)" on public.cadastro_responses for all to anon using (true) with check (true);
create policy "Anon full (demo)" on public.documents for all to anon using (true) with check (true);
create policy "Anon full (demo)" on public.events for all to anon using (true) with check (true);

-- =====================================================
-- VIEW útil
-- =====================================================
create or replace view public.client_overview as
select 
  c.id,
  c.name,
  c.status,
  c.current_step,
  s.label as current_step_label,
  c.mrr as investimento,
  (select count(*) from public.client_step_progress p 
   where p.client_id = c.id and p.status = 'concluida') as etapas_concluidas,
  c.last_interaction_at,
  c.updated_at
from public.clients c
left join public.steps s on s.number = c.current_step
where c.deleted_at is null;

-- =====================================================
-- FUNÇÃO para avançar etapa (útil para o app)
-- =====================================================
create or replace function public.advance_client_step(
  p_client_id uuid,
  p_new_step int
)
returns void language plpgsql security definer as $$
begin
  update public.clients
  set current_step = p_new_step,
      updated_at = now()
  where id = p_client_id;

  insert into public.events (client_id, event_type, step_number, description)
  values (p_client_id, 'step_changed', p_new_step, 'Etapa avançada');
end;
$$;

-- =====================================================
-- COMO USAR (resumo rápido)
-- =====================================================
/*
1. Criar cliente:
   insert into clients (name, cnpj, ...) values ...

2. Iniciar progresso nas 7 etapas (normalmente feito na criação):
   insert into client_step_progress (client_id, step_number, status)
   select id, number, 'pendente' from steps;

3. Salvar cadastro (etapa 1):
   insert into cadastro_responses (client_id, razao_social, ...) values ...
   update client_step_progress set status='concluida', data=... where client_id=... and step_number=1;

4. Avançar etapa:
   select advance_client_step(client_id, 2);

5. Ver overview:
   select * from client_overview;
*/

-- Fim do schema focado em Etapas + Cadastro