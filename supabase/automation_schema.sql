-- =====================================================
-- SUPABASE AUTOMATION SCHEMA - Menctor WhatsApp Journey
-- Arquitetura para controle completo da jornada do cliente
-- via WhatsApp + N8N + IA (Evolution API)
-- =====================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- Função para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================
-- TABELA: workflow_steps
-- Definição das etapas do fluxo (estática)
-- =====================================================
create table public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  step_number integer not null unique,
  name text not null,
  description text,
  actions jsonb default '[]'::jsonb,           -- ex: ["send_form", "send_proposal", "schedule_meeting"]
  is_final boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger workflow_steps_updated_at
  before update on public.workflow_steps
  for each row execute function public.handle_updated_at();

comment on table public.workflow_steps is 'Definição das etapas do workflow (Cadastro, Proposta, etc).';

-- =====================================================
-- TABELA: customers
-- Entidade central do cliente (empresa + contato WhatsApp)
-- =====================================================
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text not null unique,
  name text,
  company_name text,
  email text,
  phone text,
  employees integer,
  sector text,
  custom_data jsonb default '{}'::jsonb,       -- dados do formulário, respostas, etc.
  current_workflow_id uuid references public.customer_workflows(id),
  status text not null default 'new'
    check (status in (
      'new', 'in_progress', 'qualified', 'proposal_sent',
      'contract_signed', 'in_diagnosis', 'completed',
      'abandoned', 'paused', 'returned'
    )),
  last_interaction_at timestamptz,
  next_action_at timestamptz,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index idx_customers_whatsapp on public.customers (whatsapp_number);
create index idx_customers_status on public.customers (status);
create index idx_customers_last_interaction on public.customers (last_interaction_at);
create index idx_customers_next_action on public.customers (next_action_at) where next_action_at is not null;
create index idx_customers_tags on public.customers using gin (tags);

create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.handle_updated_at();

comment on table public.customers is 'Cliente principal da jornada (contato WhatsApp + empresa).';

-- =====================================================
-- TABELA: customer_workflows
-- Instância do progresso do cliente no fluxo
-- =====================================================
create table public.customer_workflows (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  current_step_id uuid references public.workflow_steps(id),
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'active'
    check (status in ('active', 'paused', 'completed', 'abandoned')),
  data jsonb default '{}'::jsonb,              -- dados acumulados por etapa (respostas, decisões)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_customer_workflows_customer on public.customer_workflows (customer_id);
create index idx_customer_workflows_step on public.customer_workflows (current_step_id);

create trigger customer_workflows_updated_at
  before update on public.customer_workflows
  for each row execute function public.handle_updated_at();

comment on table public.customer_workflows is 'Progresso do cliente através das etapas. Permite histórico e retomada.';

-- Adiciona a FK que faltava (circular reference resolvida após criação)
alter table public.customers
  add constraint fk_customers_current_workflow
  foreign key (current_workflow_id) references public.customer_workflows(id);

-- =====================================================
-- TABELA: conversations
-- Thread de conversa (WhatsApp ou futuro multicanal)
-- =====================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  channel text default 'whatsapp',
  external_id text,                           -- jid ou chat id da Evolution API
  status text default 'active' check (status in ('active', 'closed', 'archived')),
  started_at timestamptz default now(),
  last_message_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_conversations_customer on public.conversations (customer_id);
create index idx_conversations_external on public.conversations (external_id);
create index idx_conversations_last_message on public.conversations (last_message_at);

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

comment on table public.conversations is 'Conversa/thread do cliente. Útil para histórico e contexto.';

-- =====================================================
-- TABELA: messages
-- Histórico completo de mensagens
-- =====================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  customer_id uuid references public.customers(id),  -- denormalizado para consultas rápidas
  direction text not null check (direction in ('inbound', 'outbound')),
  content text,
  type text default 'text' check (type in ('text', 'image', 'document', 'audio', 'video', 'location', 'reaction')),
  media_url text,
  external_message_id text,                   -- id da mensagem na Evolution API (idempotência)
  metadata jsonb default '{}'::jsonb,         -- payload completo da Evolution, quoted message, etc.
  is_from_ai boolean default false,
  created_at timestamptz default now()
);

create unique index idx_messages_external on public.messages (external_message_id) where external_message_id is not null;
create index idx_messages_conversation on public.messages (conversation_id, created_at desc);
create index idx_messages_customer on public.messages (customer_id, created_at desc);

comment on table public.messages is 'Histórico bruto de todas as mensagens trocadas.';

-- =====================================================
-- TABELA: events (o coração do histórico)
-- Registra TUDO que acontece com o cliente
-- =====================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  event_type text not null,
  description text,
  payload jsonb default '{}'::jsonb,
  source text default 'system',               -- 'evolution', 'n8n', 'ai', 'manual', 'webhook', 'system'
  created_at timestamptz default now()
);

create index idx_events_customer on public.events (customer_id, created_at desc);
create index idx_events_type on public.events (event_type, created_at desc);
create index idx_events_customer_type on public.events (customer_id, event_type, created_at desc);

comment on table public.events is 'Event sourcing / audit log. Registra TODAS as interações, mudanças e decisões. Nada é perdido.';

-- =====================================================
-- TABELA: ai_logs
-- Decisões e chamadas à IA (contexto, custo, qualidade)
-- =====================================================
create table public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  conversation_id uuid references public.conversations(id),
  workflow_step_id uuid references public.workflow_steps(id),
  prompt text,
  response text,
  model text,
  tokens_prompt integer,
  tokens_completion integer,
  decision jsonb,                             -- { "intent": "...", "entities": {}, "next_step": 3, "confidence": 0.92, "reason": "..." }
  latency_ms integer,
  error text,
  created_at timestamptz default now()
);

create index idx_ai_logs_customer on public.ai_logs (customer_id, created_at desc);
create index idx_ai_logs_conversation on public.ai_logs (conversation_id, created_at desc);

comment on table public.ai_logs is 'Log detalhado de todas as chamadas à IA para auditoria, custo e melhoria de prompts.';

-- =====================================================
-- TABELA: documents
-- Propostas, contratos, relatórios, respostas de formulário
-- =====================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  workflow_step_id uuid references public.workflow_steps(id),
  type text not null,                         -- 'cadastro_form', 'proposal', 'contract', 'report', 'sensitization'
  title text,
  url text,
  storage_path text,                          -- caminho no Supabase Storage (se aplicável)
  status text default 'sent' check (status in ('sent', 'viewed', 'signed', 'rejected', 'expired')),
  signed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_documents_customer on public.documents (customer_id, created_at desc);
create index idx_documents_type on public.documents (type);

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();

comment on table public.documents is 'Rastreamento de todos os documentos enviados e seu status.';

-- =====================================================
-- TABELA: schedules
-- Lembretes, follow-ups e ações agendadas
-- =====================================================
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type text not null,                         -- 'reminder', 'follow_up', 'meeting', 'deadline'
  scheduled_at timestamptz not null,
  executed_at timestamptz,
  status text default 'pending' check (status in ('pending', 'executed', 'cancelled', 'failed')),
  payload jsonb default '{}'::jsonb,          -- template da mensagem, dados extras
  n8n_execution_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_schedules_pending on public.schedules (scheduled_at) where status = 'pending';
create index idx_schedules_customer on public.schedules (customer_id, scheduled_at);

create trigger schedules_updated_at
  before update on public.schedules
  for each row execute function public.handle_updated_at();

comment on table public.schedules is 'Agenda de ações futuras (lembretes, follow-ups). N8N consulta e executa.';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Boas práticas Supabase
-- =====================================================

-- Customers
alter table public.customers enable row level security;

create policy "Service role has full access to customers"
  on public.customers for all
  to service_role
  using (true)
  with check (true);

-- Conversations
alter table public.conversations enable row level security;

create policy "Service role has full access to conversations"
  on public.conversations for all
  to service_role
  using (true);

-- Messages
alter table public.messages enable row level security;

create policy "Service role has full access to messages"
  on public.messages for all
  to service_role
  using (true);

-- Events (sempre service role ou admin)
alter table public.events enable row level security;

create policy "Service role has full access to events"
  on public.events for all
  to service_role
  using (true);

-- AI Logs
alter table public.ai_logs enable row level security;

create policy "Service role has full access to ai_logs"
  on public.ai_logs for all
  to service_role
  using (true);

-- Documents
alter table public.documents enable row level security;

create policy "Service role has full access to documents"
  on public.documents for all
  to service_role
  using (true);

-- Schedules
alter table public.schedules enable row level security;

create policy "Service role has full access to schedules"
  on public.schedules for all
  to service_role
  using (true);

-- Workflow tables (leitura para authenticated se houver dashboard)
alter table public.workflow_steps enable row level security;
alter table public.customer_workflows enable row level security;

create policy "Service role full access workflow"
  on public.workflow_steps for all to service_role using (true);

create policy "Service role full access customer_workflows"
  on public.customer_workflows for all to service_role using (true);

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

create or replace view public.current_customers_view as
select 
  c.id,
  c.whatsapp_number,
  c.name,
  c.company_name,
  c.status,
  ws.step_number,
  ws.name as current_step,
  c.last_interaction_at,
  c.next_action_at,
  c.tags,
  cw.data as workflow_data,
  (select count(*) from public.messages m where m.customer_id = c.id) as total_messages,
  (select max(created_at) from public.messages m where m.customer_id = c.id) as last_message_at
from public.customers c
left join public.customer_workflows cw on cw.id = c.current_workflow_id
left join public.workflow_steps ws on ws.id = cw.current_step_id
where c.deleted_at is null;

comment on view public.current_customers_view is 'Visão consolidada do estado atual dos clientes para dashboards.';

-- =====================================================
-- FUNÇÕES ÚTEIS (opcional mas recomendado)
-- =====================================================

-- Função para avançar etapa de forma segura
create or replace function public.advance_customer_step(
  p_customer_id uuid,
  p_new_step_number integer,
  p_reason text default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_new_step_id uuid;
  v_old_step_id uuid;
begin
  select id into v_new_step_id from public.workflow_steps where step_number = p_new_step_number;
  if v_new_step_id is null then
    raise exception 'Step % not found', p_new_step_number;
  end if;

  select current_step_id into v_old_step_id 
  from public.customer_workflows 
  where customer_id = p_customer_id 
  order by started_at desc 
  limit 1;

  update public.customer_workflows
  set current_step_id = v_new_step_id,
      updated_at = now()
  where customer_id = p_customer_id 
    and status = 'active'
  order by started_at desc
  limit 1;

  insert into public.events (customer_id, event_type, description, payload)
  values (
    p_customer_id,
    'step_advanced',
    coalesce(p_reason, 'Step advanced by automation'),
    jsonb_build_object(
      'old_step', v_old_step_id,
      'new_step', v_new_step_id,
      'new_step_number', p_new_step_number
    )
  );
end;
$$;

-- =====================================================
-- DADOS INICIAIS (as 7 etapas do Menctor)
-- =====================================================
insert into public.workflow_steps (step_number, name, description, actions) values
(1, 'Cadastro', 'Coleta de dados da empresa e responsável (formulário de 18 perguntas)', '["send_form", "collect_data"]'),
(2, 'Proposta', 'Envio e discussão da proposta comercial', '["send_proposal", "negotiate"]'),
(3, 'Contrato', 'Envio, assinatura e formalização do contrato', '["send_contract", "collect_signature"]'),
(4, 'Sensibilização', 'Palestras, treinamentos e materiais de conscientização', '["send_materials", "schedule_session"]'),
(5, 'Diagnóstico', 'Aplicação de COPSOQ II, DRPS e outras avaliações', '["send_diagnosis_link", "collect_responses"]'),
(6, 'Relatórios', 'Geração, revisão e envio dos relatórios executivos', '["generate_report", "send_report"]'),
(7, 'Apresentação', 'Reunião de apresentação dos resultados e plano de ação', '["schedule_meeting", "present_results"]')
on conflict (step_number) do nothing;

-- =====================================================
-- COMENTÁRIOS FINAIS / RECOMENDAÇÕES
-- =====================================================
comment on schema public is 'Schema de automação WhatsApp + IA para jornada completa de clientes Menctor.';

-- Fim do script
-- Execute no SQL Editor do Supabase.
-- Depois configure as políticas de RLS conforme seu modelo de autenticação (service key para N8N/Evolution + usuários autenticados para dashboard).