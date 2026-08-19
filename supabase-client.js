/* global window */

const MENCTOR_SUPABASE_URL = "https://jrsetvnjuqmwvuietizw.supabase.co";
const MENCTOR_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyc2V0dm5qdXFtd3Z1aWV0aXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTk0NzMsImV4cCI6MjA5ODY3NTQ3M30.Pn7f1kKeqcV9DzQMzMbjgM0tLtXfjgN3_QPMBCoKFCI";

const pipelineHeaders = {
  apikey: MENCTOR_SUPABASE_KEY,
  Authorization: `Bearer ${MENCTOR_SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

const toDbCard = (card, stage) => ({
  id: card.id,
  stage,
  empresa: card.empresa || "Novo lead",
  contato: card.contato || "",
  email: card.email || "",
  funcionarios: Number(card.funcionarios || card.colaboradores || 0),
  valor: Number(card.valor || 0),
  dias: Number(card.dias || 0),
  decisor: card.decisor || card.contato || "",
  proximo_passo: card.proximoPasso || "",
  probabilidade: Number(card.probabilidade || 35),
  origem: card.origem || "",
  extra: {
    assinado: !!card.assinado,
    etapaManual: !!card.etapaManual,
  },
});

const toAppCard = (row) => ({
  id: row.id,
  empresa: row.empresa,
  contato: row.contato,
  email: row.email,
  funcionarios: row.funcionarios,
  valor: row.valor,
  dias: row.dias,
  decisor: row.decisor,
  proximoPasso: row.proximo_passo,
  probabilidade: row.probabilidade,
  origem: row.origem,
  stage: row.stage,
  assinado: !!row.extra?.assinado,
  etapaManual: !!row.extra?.etapaManual,
});

const supabaseRequest = async (path, options = {}) => {
  const response = await fetch(`${MENCTOR_SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...pipelineHeaders,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = payload?.message || payload?.error || "Falha ao acessar Supabase.";
    throw new Error(message);
  }
  return payload;
};

const MenctorDB = {
  async listPipelineCards() {
    const rows = await supabaseRequest("pipeline_cards?select=*&order=updated_at.desc");
    return rows.map(toAppCard);
  },

  async upsertPipelineCard(card, stage = card.stage || "lead") {
    const rows = await supabaseRequest("pipeline_cards?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(toDbCard(card, stage)),
    });
    return rows?.[0] ? toAppCard(rows[0]) : null;
  },

  async updatePipelineStage(card, stage, patch = {}) {
    const updated = { ...card, ...patch, stage, dias: 0 };
    return this.upsertPipelineCard(updated, stage);
  },
};

// =====================================================
// CLIENT JOURNEY (Etapas + Cadastro)
// =====================================================

MenctorDB.listClients = async () => {
  const rows = await supabaseRequest("clients?select=*&order=updated_at.desc");
  return rows;
};

MenctorDB.getClient = async (id) => {
  const [client] = await supabaseRequest(`clients?id=eq.${id}&select=*`);
  if (!client) return null;

  const [progressRows, cadastroRows] = await Promise.all([
    supabaseRequest(`client_step_progress?client_id=eq.${id}&select=*&order=step_number`),
    supabaseRequest(`cadastro_responses?client_id=eq.${id}&select=*`),
  ]);

  // Build shape compatible with old ETAPAS_CLIENTE
  const status = {};
  (progressRows || []).forEach(p => {
    status[p.step_number] = { status: p.status, ... (p.data || {}) };
  });

  const etapaAtual = client.current_step || 1;

  const loadedCadastro = toCamelCadastro(cadastroRows?.[0] || null);

  return {
    ...client,
    progress: progressRows || [],
    cadastro: loadedCadastro,
    // for roadmap compatibility
    etapas: {
      etapaAtual,
      status,
    },
  };
};

MenctorDB.createClient = async (data = {}) => {
  const payload = {
    name: data.name || "Nova Empresa",
    cnpj: data.cnpj || "",
    contact: data.contact || "",
    sector: data.sector || "Serviços",
    employees: data.employees || 50,
    mrr: data.mrr || 3500,
    color: data.color || "#2F7D6F",
    status: data.status || "ativo",
    current_step: 1,
    ...data,
  };

  const [client] = await supabaseRequest("clients", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

  // Create 7 step progress rows
  const stepRows = [1,2,3,4,5,6,7].map(n => ({
    client_id: client.id,
    step_number: n,
    status: n === 1 ? "em_andamento" : "pendente",
  }));

  await supabaseRequest("client_step_progress", {
    method: "POST",
    body: JSON.stringify(stepRows),
  });

  return client;
};

MenctorDB.updateClient = async (id, patch = {}) => {
  const [row] = await supabaseRequest(`clients?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
  return row;
};

MenctorDB.saveStepProgress = async (clientId, stepNumber, status, extraData = {}) => {
  const payload = {
    client_id: clientId,
    step_number: stepNumber,
    status,
    data: extraData,
  };

  const [row] = await supabaseRequest("client_step_progress?on_conflict=client_id,step_number", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload),
  });

  // If completing or starting a step, update current on client
  if (status === "concluida" || status === "em_andamento") {
    await MenctorDB.updateClient(clientId, { current_step: stepNumber });
  }

  return row;
};

// Helper to convert camelCase form to snake_case for DB
const toSnakeCadastro = (data) => ({
  client_id: data.client_id,
  razao_social: data.razaoSocial || data.razao_social,
  responsavel: data.responsavel,
  email: data.email,
  telefone: data.telefone,
  cnpj: data.cnpj,
  qtd_por_area: data.qtdPorArea || data.qtd_por_area,
  qtd_cargos: data.qtdCargos || data.qtd_cargos,
  segmento: data.segmento,
  unidades: data.unidades,
  cidades: data.cidades,
  terceirizados: data.terceirizados,
  possui: data.possui,
  indicadores: data.indicadores,
  mapeamento_formal: data.mapeamentoFormal || data.mapeamento_formal,
  pesquisa_clima: data.pesquisaClima || data.pesquisa_clima,
  canais_escuta: data.canaisEscuta || data.canais_escuta,
  fiscalizacao_evidencia: data.fiscalizacaoEvidencia || data.fiscalizacao_evidencia,
  gestao_riscos_outra: data.gestaoRiscosOutra || data.gestao_riscos_outra,
  pressao_metas: data.pressaoMetas || data.pressao_metas,
  ritmo_intenso: data.ritmoIntenso || data.ritmo_intenso,
  capacitacao_lideranca: data.capacitacaoLideranca || data.capacitacao_lideranca,
  conflitos_recorrentes: data.conflitosRecorrentes || data.conflitos_recorrentes,
  assedio_moral: data.assedioMoral || data.assedio_moral,
  lideranca_outra: data.liderancaOutra || data.lideranca_outra,
  juridico_acompanha: data.juridicoAcompanha || data.juridico_acompanha,
  acao_trabalhista_mental: data.acaoTrabalhistaMental || data.acao_trabalhista_mental,
  sente_protegida: data.senteProtegida || data.sente_protegida,
  juridica_outra: data.juridicaOutra || data.juridica_outra,
  excesso_trabalho: data.excessoTrabalho || data.excesso_trabalho,
  prazos_inalcancaveis: data.prazosInatingiveis || data.prazos_inalcancaveis,
  falta_controle: data.faltaControle || data.falta_controle,
  estrutura_nao_aplica: data.estruturaNaoAplica || data.estrutura_nao_aplica,
  estrutura_outra: data.estruturaOutra || data.estrutura_outra,
  trabalha_com: data.trabalhaCom || data.trabalha_com,
  submitted_at: data.submittedAt || data.submitted_at || new Date().toISOString(),
  form_token: data.formToken || data.form_token,
});

// Reverse for loading
const toCamelCadastro = (row) => {
  if (!row) return null;
  return {
    ...row,
    razaoSocial: row.razao_social,
    qtdPorArea: row.qtd_por_area,
    qtdCargos: row.qtd_cargos,
    mapeamentoFormal: row.mapeamento_formal,
    pesquisaClima: row.pesquisa_clima,
    canaisEscuta: row.canais_escuta,
    fiscalizacaoEvidencia: row.fiscalizacao_evidencia,
    gestaoRiscosOutra: row.gestao_riscos_outra,
    pressaoMetas: row.pressao_metas,
    ritmoIntenso: row.ritmo_intenso,
    capacitacaoLideranca: row.capacitacao_lideranca,
    conflitosRecorrentes: row.conflitos_recorrentes,
    assedioMoral: row.assedio_moral,
    liderancaOutra: row.lideranca_outra,
    juridicoAcompanha: row.juridico_acompanha,
    acaoTrabalhistaMental: row.acao_trabalhista_mental,
    senteProtegida: row.sente_protegida,
    juridicaOutra: row.juridica_outra,
    excessoTrabalho: row.excesso_trabalho,
    prazosInatingiveis: row.prazos_inalcancaveis,
    faltaControle: row.falta_controle,
    estruturaNaoAplica: row.estrutura_nao_aplica,
    estruturaOutra: row.estrutura_outra,
    trabalhaCom: row.trabalha_com,
    submittedAt: row.submitted_at,
    formToken: row.form_token,
  };
};

MenctorDB.saveCadastro = async (clientId, formData) => {
  const payload = toSnakeCadastro({ client_id: clientId, ...formData });

  const [cad] = await supabaseRequest("cadastro_responses?on_conflict=client_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload),
  });

  // Mark step 1 as completed, pass original camel for compatibility
  await MenctorDB.saveStepProgress(clientId, 1, "concluida", formData);

  return cad;
};

MenctorDB.listSteps = async () => {
  return supabaseRequest("steps?select=*&order=number");
};

// =====================================================
// CANAL DE DENÚNCIAS
// =====================================================

const toDbDenuncia = (d) => ({
  id: d.id,
  protocolo: d.protocolo,
  cliente_id: d.clienteId,
  data: d.data,
  status: d.status || "triagem",
  gravidade: d.gravidade || null,
  tipo_id: d.tipoId || null,
  natureza: d.natureza || null,
  anonimo: d.anonimo !== false,
  denunciante: d.denunciante || null,
  area: d.area || null,
  relato: d.relato || "",
  evidencias: d.evidencias || [],
  admissibilidade: d.admissibilidade || null,
  prazo_final: d.prazoFinal || null,
  parecer: d.parecer || null,
  resultado: d.resultado || null,
  recomendacoes: d.recomendacoes || null,
  andamentos: d.andamentos || [],
  mensagens: d.mensagens || [],
  audit_log: d.auditLog || [],
});

const toAppDenuncia = (row) => ({
  id: row.id,
  protocolo: row.protocolo,
  clienteId: row.cliente_id,
  data: row.data,
  status: row.status,
  gravidade: row.gravidade,
  tipoId: row.tipo_id,
  natureza: row.natureza,
  anonimo: row.anonimo,
  denunciante: row.denunciante,
  area: row.area,
  relato: row.relato,
  evidencias: row.evidencias || [],
  admissibilidade: row.admissibilidade,
  prazoFinal: row.prazo_final,
  parecer: row.parecer,
  resultado: row.resultado,
  recomendacoes: row.recomendacoes,
  andamentos: row.andamentos || [],
  mensagens: row.mensagens || [],
  auditLog: row.audit_log || [],
});

MenctorDB.listDenuncias = async () => {
  const rows = await supabaseRequest("denuncias?select=*&order=data.desc");
  return rows.map(toAppDenuncia);
};

MenctorDB.getDenuncia = async (id) => {
  const rows = await supabaseRequest(`denuncias?id=eq.${encodeURIComponent(id)}&select=*`);
  return rows?.[0] ? toAppDenuncia(rows[0]) : null;
};

MenctorDB.getDenunciaByProtocolo = async (protocolo) => {
  const rows = await supabaseRequest(`denuncias?protocolo=eq.${encodeURIComponent(protocolo)}&select=*`);
  return rows?.[0] ? toAppDenuncia(rows[0]) : null;
};

MenctorDB.upsertDenuncia = async (denuncia) => {
  const rows = await supabaseRequest("denuncias?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(toDbDenuncia(denuncia)),
  });
  return rows?.[0] ? toAppDenuncia(rows[0]) : null;
};

Object.assign(window, { MenctorDB });
