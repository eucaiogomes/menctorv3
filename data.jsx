/* global window */
// ════════════════════════════════════════════════════════════
// MOCK DATA — realistic Brazilian corporate / NR-1 context
// ════════════════════════════════════════════════════════════

const CLIENTES = [
  {
    id: "loghaus",  name: "Loghaus Logística",  cnpj: "12.345.678/0001-90", contact: "Mariana Aguiar",
    sector: "Logística",    employees: 340,  status: "ativo",      mrr: 4280,  lastDiag: "há 2 dias",  risk: 2.35, color: "#2F7D6F",
    riskTrend: "down",   mainRisk: "Carga de trabalho",  lastPulseDate: "15/05/2026",
    nextAction: "Workshop anti-burnout — Operações · 02/jun",
    healthScore: 64,
    diagnosticosHabilitados: ["copsoq", "pulse", "clima", "hse", "nr17"],
  },
  {
    id: "vitamed",  name: "VitaMed Saúde",      cnpj: "98.765.432/0001-12", contact: "Roberto Lima",
    sector: "Saúde",        employees: 612,  status: "ativo",      mrr: 6890,  lastDiag: "há 9 dias",  risk: 1.82, color: "#5BAD72",
    riskTrend: "stable", mainRisk: "Suporte social",      lastPulseDate: "08/05/2026",
    nextAction: "Pulse mensal de maio — agendado para 30/05",
    healthScore: 82,
    diagnosticosHabilitados: ["pulse", "enps", "burnout"],
  },
  {
    id: "agrocorp", name: "AgroCorp Brasil",    cnpj: "45.678.901/0001-33", contact: "Fernanda Souza",
    sector: "Agroindústria",employees: 1240, status: "ativo",      mrr: 12400, lastDiag: "há 4 dias",  risk: 2.71, color: "#D89A3F",
    riskTrend: "up",     mainRisk: "Burnout",             lastPulseDate: "12/05/2026",
    nextAction: "Apresentar resultados ao RH · reunião 03/jun",
    healthScore: 48,
    diagnosticosHabilitados: ["copsoq", "tlx", "edrps"],
  },
  {
    id: "fintech",  name: "Norte Fintech",      cnpj: "33.221.100/0001-55", contact: "Caio Barbosa",
    sector: "Financeiro",   employees: 180,  status: "negociacao", mrr: 0,     lastDiag: null,         risk: null, color: "#4E83A8",
    riskTrend: null,     mainRisk: null,                  lastPulseDate: null,
    nextAction: "Proposta enviada — aguardando aceite",
    healthScore: null,
    diagnosticosHabilitados: ["copsoq"],
  },
  {
    id: "edutec",   name: "EduTec Cooperativa", cnpj: "77.889.900/0001-22", contact: "Ana Paula Rios",
    sector: "Educação",     employees: 92,   status: "negociacao", mrr: 0,     lastDiag: null,         risk: null, color: "#C75A4C",
    riskTrend: null,     mainRisk: null,                  lastPulseDate: null,
    nextAction: "Demo agendada para 04/jun com Ana Paula",
    healthScore: null,
    diagnosticosHabilitados: ["copsoq", "gallup", "disc"],
  },
  {
    id: "construflex", name: "Construflex Engenharia", cnpj: "22.334.455/0001-66", contact: "Rodrigo Nunes",
    sector: "Construção Civil", employees: 480, status: "ativo",      mrr: 5390,  lastDiag: "há 6 dias",  risk: 2.51, color: "#8A6D3B",
    riskTrend: "up",     mainRisk: "Condições ambientais", lastPulseDate: "11/05/2026",
    nextAction: "Reunião de fechamento do laudo NR-17 · 05/jun",
    healthScore: 57,
    diagnosticosHabilitados: ["nr17", "hse"],
  },
  {
    id: "varejomax", name: "VarejoMax Comércio",  cnpj: "60.112.233/0001-40", contact: "Juliana Prado",
    sector: "Varejo",       employees: 850,  status: "ativo",      mrr: 8120,  lastDiag: "há 1 dia",   risk: 2.04, color: "#3E6B8A",
    riskTrend: "down",   mainRisk: "Suporte da liderança", lastPulseDate: "20/05/2026",
    nextAction: "Devolutiva do pulse trimestral · 10/jun",
    healthScore: 71,
    diagnosticosHabilitados: ["copsoq", "pulse", "enps"],
  },
  {
    id: "portoalfa", name: "Porto Alfa Seguros",  cnpj: "18.900.771/0001-08", contact: "Marcelo Teixeira",
    sector: "Seguros",      employees: 260,  status: "negociacao", mrr: 0,     lastDiag: null,         risk: null, color: "#6A4C93",
    riskTrend: null,     mainRisk: null,                  lastPulseDate: null,
    nextAction: "Proposta comercial enviada — retorno previsto 28/jul",
    healthScore: null,
    diagnosticosHabilitados: ["copsoq"],
  },
];

const COPSOQ_DIMS = [
  { name: "Carga de trabalho",      v: 3.12 },
  { name: "Burnout",                v: 2.95 },
  { name: "Estresse",               v: 2.88 },
  { name: "Conflito trabalho-família", v: 2.74 },
  { name: "Ritmo de trabalho",      v: 2.68 },
  { name: "Reconhecimento",         v: 2.51 },
  { name: "Suporte social",         v: 2.42 },
  { name: "Qualidade da liderança", v: 2.38 },
  { name: "Justiça e respeito",     v: 2.20 },
  { name: "Influência no trabalho", v: 2.15 },
  { name: "Comunidade social",      v: 1.88 },
  { name: "Significado do trabalho",v: 1.72 },
];

// Checklist ergonômico NR-17 — usado pelo diagnóstico "nr17" e pelo relatório AEP
const NR17_DIMS = [
  { name: "Mobiliário do posto de trabalho",       v: 2.92 },
  { name: "Levantamento e transporte manual de cargas", v: 2.81 },
  { name: "Postura e esforço físico",               v: 2.70 },
  { name: "Equipamentos e ferramentas",             v: 2.54 },
  { name: "Trabalho com telas e digitação",         v: 2.46 },
  { name: "Condições ambientais (iluminação, ruído, temperatura)", v: 2.33 },
  { name: "Organização temporal (pausas e ritmo)",  v: 2.18 },
  { name: "Layout e espaço de circulação",          v: 1.95 },
];

// Mapa diagnosticoId → conjunto de dimensões, usado por telas que exibem
// resultados de um diagnóstico específico (diagnostico-detalhe, relatorio-doc)
const DIAG_DIMS_MAP = {
  copsoq: COPSOQ_DIMS,
  nr17: NR17_DIMS,
};

// ── Resultado do diagnóstico por cliente (etapa "Relatórios" do fluxo de 7 etapas) ──
// Determinístico por clienteId (mesmo cliente sempre gera o mesmo resultado "mock"),
// usado para exibir gráficos assim que o Diagnóstico é concluído.
const seededRandom = (seedStr) => {
  let h = 2166136261;
  for (let i = 0; i < String(seedStr).length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
};

const getDiagnosticoResultadoMock = (clienteId, diagnosticoId = "copsoq") => {
  const rand = seededRandom(clienteId || "default");
  const dimsBase = DIAG_DIMS_MAP[diagnosticoId] || COPSOQ_DIMS;
  const porDimensao = dimsBase
    .map(base => {
      const jitter = (rand() - 0.5) * 1.1;
      const v = Math.min(4, Math.max(0.3, base.v + jitter));
      return { name: base.name, v: Number(v.toFixed(2)) };
    })
    .sort((a, b) => b.v - a.v);

  const media = Number((porDimensao.reduce((s, d) => s + d.v, 0) / porDimensao.length).toFixed(2));
  const cliente = CLIENTES.find(c => c.id === clienteId);
  const alvo = cliente?.employees || 100;
  const adesao = Math.round(70 + rand() * 25);
  const respondidos = Math.round(alvo * (adesao / 100));

  return { media, porDimensao, adesao, respondidos, alvo };
};

const DIAGNOSTICOS = [
  { id: "copsoq",     type: "COPSOQ II",   name: "Riscos psicossociais",             questions: 41, levels: 3, popular: true,  desc: "Padrão NR-1 para mapeamento de riscos psicossociais no trabalho." },
  { id: "hse",        type: "HSE-IT",      name: "HSE Indicator Tool",               questions: 35, levels: 3, popular: true,  desc: "Ferramenta indicadora de estresse do Health and Safety Executive (Reino Unido) — 7 dimensões de risco psicossocial." },
  { id: "entrevista", type: "Entrevista",  name: "Roteiro de entrevista",             questions: 0,  levels: 3, popular: false, desc: "Roteiro de entrevista sugerido por IA a partir do contexto da empresa — complementa os questionários com percepções em profundidade." },
  { id: "drps",       type: "DRPS",        name: "Diagnóstico de Riscos Psicossociais", questions: 0, levels: 3, popular: false, desc: "Diagnóstico estruturado de riscos psicossociais para mapeamento de fatores de risco e priorização de ações preventivas." },
  { id: "clima",      type: "Clima",       name: "Clima Organizacional",             questions: 28, levels: 4, popular: false, desc: "Combina dimensões COPSOQ com indicadores de clima e cultura." },
];

const AVALIACOES_ATIVAS = [
  { id: "a1", titulo: "Pesquisa de Clima Organizacional", periodo: "1º Trimestre/2026", cliente: "Loghaus", code: "PCL-Q1", media: 2.25, status: "Em campo", adesao: 92, alvo: 340, respondidos: 312, fim: "31/03/2026", risk: 2.25, diagnosticoId: "copsoq" },
  { id: "a2", titulo: "NR-1 Operações",                  periodo: "Recorte Setorial Mar/2026", cliente: "AgroCorp",code: "NR-1-OPS", media: 2.60, status: "Em campo", adesao: 91, alvo: 92,  respondidos: 84,  fim: "28/03/2026", risk: 2.60, diagnosticoId: "copsoq" },
  { id: "a3", titulo: "Pulse Survey Bem-Estar Mental",   periodo: "Mar/2026", cliente: "VitaMed", code: "PULSO-MAR", media: 1.85, status: "Encerrada", adesao: 78, alvo: 612, respondidos: 477, fim: "15/03/2026", risk: 1.85, diagnosticoId: "pulse" },
  { id: "a4", titulo: "Diagnóstico COPSOQ II Geral",     periodo: "Anual 2026", cliente: "Loghaus", code: "COPSOQ-26", media: null, status: "Rascunho", adesao: 0,  alvo: 340, respondidos: 0,  fim: "—", risk: null, diagnosticoId: "copsoq" },
  { id: "a5", titulo: "Análise Ergonômica Preliminar — NR-17", periodo: "2º Trimestre/2026", cliente: "Loghaus", code: "AEP-Q2", media: 2.48, status: "Encerrada", adesao: 88, alvo: 50, respondidos: 44, fim: "30/06/2026", risk: 2.48, diagnosticoId: "nr17" },
];

// ════════════════════════════════════════════════════════════
// CAMPANHAS — período de coleta de um diagnóstico para uma empresa
// ════════════════════════════════════════════════════════════
const CAMPANHAS = [
  { id: "camp-1", titulo: "Avalia COPSOQ II — Julho 2026", clienteId: "loghaus",  diagnosticoId: "copsoq", dataInicial: "2026-06-15", dataFinal: "2026-07-15", quantidadeFuncionarios: 340, status: "ativa",   respondidos: 2, createdAt: "2026-06-15T10:00:00.000Z" },
  { id: "camp-2", titulo: "Pulso Bem-Estar Julho",         clienteId: "vitamed",  diagnosticoId: "pulse",  dataInicial: "2026-06-20", dataFinal: "2026-07-20", quantidadeFuncionarios: 612, status: "ativa",   respondidos: 5, createdAt: "2026-06-20T10:00:00.000Z" },
  { id: "camp-3", titulo: "NR-1 Operações Trimestral",     clienteId: "agrocorp",diagnosticoId: "copsoq", dataInicial: "2026-04-01", dataFinal: "2026-06-30", quantidadeFuncionarios: 92,  status: "inativa", respondidos: 1, createdAt: "2026-04-01T10:00:00.000Z" },
  { id: "camp-4", titulo: "HSE-IT — Bem-estar Operacional",clienteId: "loghaus", diagnosticoId: "hse",    dataInicial: "2026-07-01", dataFinal: "2026-08-01", quantidadeFuncionarios: 50,  status: "ativa",   respondidos: 0, createdAt: "2026-07-01T10:00:00.000Z" },
  { id: "camp-5", titulo: "EDRPS — Diagnóstico Trimestral",clienteId: "agrocorp",diagnosticoId: "edrps",  dataInicial: "2026-07-01", dataFinal: "2026-08-15", quantidadeFuncionarios: 40,  status: "ativa",   respondidos: 0, createdAt: "2026-07-01T10:00:00.000Z" },
  { id: "camp-6", titulo: "COPSOQ II — Squad Piloto",      clienteId: "loghaus",  diagnosticoId: "copsoq", dataInicial: "2026-07-01", dataFinal: "2026-08-01", quantidadeFuncionarios: 2,   status: "ativa",   respondidos: 1, createdAt: "2026-07-01T10:00:00.000Z" },
  { id: "camp-7", titulo: "Maslach Burnout — Trimestral",  clienteId: "vitamed",  diagnosticoId: "burnout",dataInicial: "2026-06-01", dataFinal: "2026-07-31", quantidadeFuncionarios: 100, status: "ativa",   respondidos: 0, createdAt: "2026-06-01T10:00:00.000Z" },
  { id: "camp-8", titulo: "eNPS — Pulso de Satisfação",    clienteId: "vitamed",  diagnosticoId: "enps",   dataInicial: "2026-07-01", dataFinal: "2026-07-31", quantidadeFuncionarios: 100, status: "ativa",   respondidos: 0, createdAt: "2026-07-01T10:00:00.000Z" },
  { id: "camp-9", titulo: "Gallup Q12 — Engajamento",      clienteId: "edutec",   diagnosticoId: "gallup", dataInicial: "2026-07-01", dataFinal: "2026-08-01", quantidadeFuncionarios: 92,  status: "ativa",   respondidos: 0, createdAt: "2026-07-01T10:00:00.000Z" },
  { id: "camp-10",titulo: "DISC — Perfil Comportamental",  clienteId: "edutec",   diagnosticoId: "disc",   dataInicial: "2026-07-01", dataFinal: "2026-08-01", quantidadeFuncionarios: 92,  status: "ativa",   respondidos: 0, createdAt: "2026-07-01T10:00:00.000Z" },
  { id: "camp-11",titulo: "Clima Organizacional — Anual",  clienteId: "loghaus",  diagnosticoId: "clima",  dataInicial: "2026-07-01", dataFinal: "2026-08-15", quantidadeFuncionarios: 340, status: "ativa",   respondidos: 0, createdAt: "2026-07-01T10:00:00.000Z" },
  { id: "camp-12",titulo: "NASA-TLX — Carga Mental Ops",   clienteId: "agrocorp", diagnosticoId: "tlx",    dataInicial: "2026-07-01", dataFinal: "2026-07-31", quantidadeFuncionarios: 92,  status: "ativa",   respondidos: 0, createdAt: "2026-07-01T10:00:00.000Z" },
  { id: "camp-13",titulo: "NR-17 — Análise Ergonômica Preliminar", clienteId: "loghaus", diagnosticoId: "nr17", dataInicial: "2026-07-01", dataFinal: "2026-08-01", quantidadeFuncionarios: 50, status: "ativa", respondidos: 0, createdAt: "2026-07-01T10:00:00.000Z" },
];

// ── Rastreamento de respostas de campanha (armazenado no navegador; CPF nunca é salvo em texto puro) ──
const CAMPANHA_RESPOSTAS_KEY = (campanhaId) => `MENCTOR_CAMPANHA_RESPOSTAS_${campanhaId}`;

const hashCPF = (cpf) => {
  const digits = String(cpf || "").replace(/\D/g, "");
  let hash = 5381;
  for (let i = 0; i < digits.length; i++) hash = ((hash << 5) + hash) + digits.charCodeAt(i);
  return Math.abs(hash).toString(36);
};

const getCampanhaRespostas = (campanhaId) => {
  try { return JSON.parse(window.localStorage.getItem(CAMPANHA_RESPOSTAS_KEY(campanhaId)) || "[]"); }
  catch (e) { return []; }
};

const getCampanhaRespondidos = (campanha) => (campanha?.respondidos || 0) + getCampanhaRespostas(campanha?.id).length;

const jaRespondeuCampanha = (campanhaId, cpf) => getCampanhaRespostas(campanhaId).some(r => r.cpfHash === hashCPF(cpf));

const registrarRespostaCampanha = (campanha, { cpf, setor, cargo, mediaRisco, porDimensao }) => {
  const lista = getCampanhaRespostas(campanha.id);
  lista.push({ cpfHash: hashCPF(cpf), ts: new Date().toISOString(), setor, cargo, mediaRisco, porDimensao: porDimensao || {} });
  try { window.localStorage.setItem(CAMPANHA_RESPOSTAS_KEY(campanha.id), JSON.stringify(lista)); } catch (e) {}
};

// ── Resultado agregado de uma campanha (média geral, por dimensão e por setor) ──
const getCampanhaResultado = (campanha) => {
  if (!campanha) return { total: 0, media: null, porDimensao: [], porSetor: [] };
  const respostas = getCampanhaRespostas(campanha.id);
  const total = respostas.length;
  if (!total) return { total: 0, media: null, porDimensao: [], porSetor: [] };

  const media = Number((respostas.reduce((s, r) => s + (r.mediaRisco || 0), 0) / total).toFixed(2));

  const dimMap = {};
  respostas.forEach(r => {
    Object.entries(r.porDimensao || {}).forEach(([nome, valor]) => {
      if (valor === null || valor === undefined) return;
      if (!dimMap[nome]) dimMap[nome] = { soma: 0, n: 0 };
      dimMap[nome].soma += valor;
      dimMap[nome].n += 1;
    });
  });
  const porDimensao = Object.entries(dimMap)
    .map(([name, { soma, n }]) => ({ name, v: Number((soma / n).toFixed(2)) }))
    .sort((a, b) => b.v - a.v);

  const setorMap = {};
  respostas.forEach(r => {
    const setor = r.setor || "Não informado";
    if (!setorMap[setor]) setorMap[setor] = { soma: 0, n: 0 };
    setorMap[setor].soma += (r.mediaRisco || 0);
    setorMap[setor].n += 1;
  });
  const porSetor = Object.entries(setorMap)
    .map(([setor, { soma, n }]) => ({ setor, media: Number((soma / n).toFixed(2)), respostas: n }))
    .sort((a, b) => b.media - a.media);

  return { total, media, porDimensao, porSetor };
};

const LEADS_PIPELINE = {
  lead: [],
  proposta: [],
  aceita: [],
  contrato: [],
  fechado:  [
    { id: "f1", empresa: "Loghaus Logística",       contato: "Mariana Aguiar", funcionarios: 340, valor: 4280, dias: 12,
      decisor: "Mariana Aguiar — Diretora de RH", proximoPasso: "Onboarding concluído — iniciar 1º diagnóstico", probabilidade: 100 },
    { id: "f2", empresa: "VitaMed Saúde",           contato: "Roberto Lima",   funcionarios: 612, valor: 6890, dias: 27,
      decisor: "Roberto Lima — Gestor de Bem-Estar", proximoPasso: "Configurar portal aluno para todas as unidades", probabilidade: 100 },
    { id: "f3", empresa: "AgroCorp Brasil",         contato: "Fernanda Souza", funcionarios: 1240,valor: 12400,dias: 41,
      decisor: "Fernanda Souza — VP de RH", proximoPasso: "Expandir diagnóstico para unidade de Goiás", probabilidade: 100 },
  ],
};

const TRILHAS = [
  { id: "t1", nome: "Saúde mental para gestores", modulos: 6, duracao: "3h 20min", inscritos: 142, conclusao: 67, capa: "linear-gradient(135deg, #2F7D6F, #5BAD72)", imagem: "/assets/trilhas/t1.jpg" },
  { id: "t2", nome: "NR-1 na prática", modulos: 4, duracao: "1h 50min", inscritos: 89, conclusao: 82, capa: "linear-gradient(135deg, #4E83A8, #2F7D6F)", imagem: "/assets/trilhas/t2.jpg" },
  { id: "t3", nome: "Liderança humanizada", modulos: 8, duracao: "5h", inscritos: 56, conclusao: 41, capa: "linear-gradient(135deg, #D89A3F, #E87722)", imagem: "/assets/trilhas/t3.jpg" },
  { id: "t4", nome: "Resiliência e regulação emocional", modulos: 5, duracao: "2h 40min", inscritos: 211, conclusao: 73, capa: "linear-gradient(135deg, #C75A4C, #D89A3F)", imagem: "/assets/trilhas/t4.jpg" },

  // ── Novos conteúdos (20 trilhas / treinamentos / palestras) ──
  { id: "t5", nome: "Prevenção ao burnout em equipes operacionais", modulos: 5, duracao: "2h 15min", inscritos: 98, conclusao: 71, capa: "linear-gradient(135deg, #0D9488, #14B8A6)", imagem: "/assets/trilhas/t5.jpg" },
  { id: "t6", nome: "Comunicação não-violenta no ambiente de trabalho", modulos: 4, duracao: "1h 45min", inscritos: 134, conclusao: 64, capa: "linear-gradient(135deg, #1E40AF, #3B82F6)", imagem: "/assets/trilhas/t6.jpg" },
  { id: "t7", nome: "Inteligência emocional para gestores e lideranças", modulos: 6, duracao: "3h", inscritos: 77, conclusao: 58, capa: "linear-gradient(135deg, #B45309, #D97706)", imagem: "/assets/trilhas/t7.jpg" },
  { id: "t8", nome: "Saúde mental no trabalho híbrido e remoto", modulos: 4, duracao: "1h 55min", inscritos: 156, conclusao: 82, capa: "linear-gradient(135deg, #0F766E, #14B8A6)", imagem: "/assets/trilhas/t8.jpg" },
  { id: "t9", nome: "Mindfulness, foco e regulação da atenção", modulos: 5, duracao: "2h 10min", inscritos: 203, conclusao: 69, capa: "linear-gradient(135deg, #4338CA, #6366F1)", imagem: "/assets/trilhas/t9.jpg" },
  { id: "t10", nome: "Gestão de conflitos e mediação interpessoal", modulos: 5, duracao: "2h 30min", inscritos: 61, conclusao: 47, capa: "linear-gradient(135deg, #9F1239, #BE123C)", imagem: "/assets/trilhas/t10.jpg" },
  { id: "t11", nome: "Liderança inclusiva, diversidade e equidade", modulos: 6, duracao: "3h 10min", inscritos: 89, conclusao: 55, capa: "linear-gradient(135deg, #1E3A8A, #2563EB)", imagem: "/assets/trilhas/t11.jpg" },
  { id: "t12", nome: "Sono, recuperação e energia sustentável", modulos: 3, duracao: "1h 20min", inscritos: 112, conclusao: 78, capa: "linear-gradient(135deg, #065F46, #059669)", imagem: "/assets/trilhas/t12.jpg" },
  { id: "t13", nome: "Ergonomia cognitiva e carga mental (NR-17)", modulos: 4, duracao: "1h 50min", inscritos: 45, conclusao: 39, capa: "linear-gradient(135deg, #334155, #475569)", imagem: "/assets/trilhas/t13.jpg" },
  { id: "t14", nome: "Feedback que desenvolve, reconhece e cuida", modulos: 4, duracao: "1h 40min", inscritos: 178, conclusao: 85, capa: "linear-gradient(135deg, #B45309, #F59E0B)", imagem: "/assets/trilhas/t14.jpg" },
  { id: "t15", nome: "Sinais de alerta e encaminhamento psicológico", modulos: 5, duracao: "2h 25min", inscritos: 67, conclusao: 52, capa: "linear-gradient(135deg, #7C2D12, #C2410C)", imagem: "/assets/trilhas/t15.jpg" },
  { id: "t16", nome: "Times psicologicamente seguros: da teoria à prática", modulos: 7, duracao: "4h", inscritos: 124, conclusao: 61, capa: "linear-gradient(135deg, #166534, #4ADE80)", imagem: "/assets/trilhas/t16.jpg" },
  { id: "t17", nome: "Autocuidado para profissionais de alta demanda", modulos: 5, duracao: "2h", inscritos: 91, conclusao: 74, capa: "linear-gradient(135deg, #854D0E, #CA8A04)", imagem: "/assets/trilhas/t17.jpg" },
  { id: "t18", nome: "Os 4 pilares da saúde psicológica organizacional", modulos: 3, duracao: "50min", inscritos: 287, conclusao: 91, capa: "linear-gradient(135deg, #312E81, #6366F1)", imagem: "/assets/trilhas/t18.jpg" },
  { id: "t19", nome: "Regulação emocional em situações de crise", modulos: 4, duracao: "1h 35min", inscritos: 53, conclusao: 43, capa: "linear-gradient(135deg, #9F1239, #E11D48)", imagem: "/assets/trilhas/t19.jpg" },
  { id: "t20", nome: "Cultura de cuidado: do RH para as lideranças", modulos: 6, duracao: "2h 50min", inscritos: 139, conclusao: 66, capa: "linear-gradient(135deg, #115E59, #14B8A6)", imagem: "/assets/trilhas/t20.jpg" },
  { id: "t21", nome: "Prevenção de assédio e promoção de respeito", modulos: 4, duracao: "1h 30min", inscritos: 82, conclusao: 77, capa: "linear-gradient(135deg, #4C1D95, #7C3AED)", imagem: "/assets/trilhas/t21.jpg" },
  { id: "t22", nome: "Resiliência organizacional e adaptação a mudanças", modulos: 5, duracao: "2h 20min", inscritos: 68, conclusao: 59, capa: "linear-gradient(135deg, #1E3A8A, #3B82F6)", imagem: "/assets/trilhas/t22.jpg" },
  { id: "t23", nome: "Métricas de bem-estar e indicadores de RH", modulos: 4, duracao: "1h 45min", inscritos: 104, conclusao: 70, capa: "linear-gradient(135deg, #0F766E, #10B981)", imagem: "/assets/trilhas/t23.jpg" },
  { id: "t24", nome: "Liderança em transformação e contextos de incerteza", modulos: 5, duracao: "2h 40min", inscritos: 76, conclusao: 48, capa: "linear-gradient(135deg, #78350F, #B45309)", imagem: "/assets/trilhas/t24.jpg" },
];

console.log("[Menctor] TRILHAS carregadas:", TRILHAS.length, "itens (t1 a t24 esperados)");

// ════════════════════════════════════════════════════════════
// ROADMAP — 3 fases × 8 etapas — template da metodologia
// ════════════════════════════════════════════════════════════

const ROADMAP_FASES = [
  {
    id: "diagnostico",
    numero: 1,
    label: "Diagnóstico Organizacional",
    desc: "Avaliação estruturada dos fatores de riscos psicossociais presentes na organização.",
    etapas: [
      { id: 1, titulo: "Reunião kickoff",             desc: "Definir passos iniciais para a avaliação: envolvimento das partes, responsabilidades e comunicação transparente.", duracao: "1 sessão",    artefato: null },
      { id: 2, titulo: "Palestras de sensibilização", desc: "Realizar palestras e workshops para esclarecer trabalhadores, promover adesão e engajar as lideranças.",            duracao: "2–4 horas",  artefato: "Apresentação de sensibilização" },
      { id: 3, titulo: "Identificar os processos",    desc: "Levantar informações sobre setores, processos produtivos e layouts da organização.",                                duracao: "1–2 dias",   artefato: "Mapa de setores e processos" },
      { id: 4, titulo: "Base de informações",         desc: "Levantar a base de informações sobre a força de trabalho e indicadores de RH e saúde ocupacional.",                duracao: "3–5 dias",   artefato: "Planilha de dados de RH",
        subtarefasPadrao: ["Solicitar dados de headcount ao RH", "Receber indicadores de absenteísmo", "Compilar dados de acidentes/afastamentos", "Organizar histórico de avaliações anteriores"] },
      { id: 5, titulo: "Entrevistas",                 desc: "Realização de observações e entrevistas com colaboradores selecionados para complemento da análise.",              duracao: "1 semana",   artefato: "Roteiro e registros de entrevistas" },
      { id: 6, titulo: "Diagnósticos",                desc: "Aplicação de questionário estruturado com base na lista de perigos da ISO 45003.",                                 duracao: "2–3 semanas",artefato: "Questionário COPSOQ II / HSE-IT",
        subtarefasPadrao: ["Configurar questionário no portal", "Enviar convites aos colaboradores", "Acompanhar adesão (meta: 80%+)", "Encerrar coleta e exportar dados"] },
      { id: 7, titulo: "Relatório",                   desc: "Elaboração do relatório com a consolidação dos registros e informações levantadas.",                                duracao: "1 semana",   artefato: "Relatório ARP — Análise de Risco Psicossocial" },
      { id: 8, titulo: "Apresentação",                desc: "Apresentação do relatório da avaliação de perigos psicossociais para a direção e colaboradores.", duracao: "1 sessão", artefato: "Apresentação executiva" },
    ],
  },
  {
    id: "planejamento",
    numero: 2,
    label: "Planejamento",
    desc: "Elaboração de plano de ação, prioridades estratégicas e programas de prevenção.",
    etapas: [
      { id: 1, titulo: "Preparo da reunião de avaliação", desc: "Fazer o convite, estabelecer o comitê, preparar a reunião e enviar material preliminar.",                             duracao: "3–5 dias",   artefato: "Convocação e pauta da reunião" },
      { id: 2, titulo: "Avaliar o diagnóstico",           desc: "Avaliar o diagnóstico com o comitê e definir as ações urgentes a serem priorizadas.",                                duracao: "1–2 dias",   artefato: null },
      { id: 3, titulo: "Elaborar plano de ação",          desc: "Elaborar o plano de ação 5W2H prático e viável para a empresa com ações curtas, médias e longas.",                  duracao: "1 semana",   artefato: "Plano de Ação 5W2H",
        subtarefasPadrao: ["Listar ações prioritárias (até 5)", "Definir responsáveis por ação", "Estabelecer prazos (curto/médio/longo)", "Estimar recursos necessários", "Validar com gestores"] },
      { id: 4, titulo: "Treinar equipe",                  desc: "Realizar o treinamento com base nas prioridades estabelecidas no plano.",                                           duracao: "2–4 horas",  artefato: "Material de treinamento" },
      { id: 5, titulo: "Ajustar atividades",              desc: "Fazer correções práticas na organização do trabalho visando o ajuste da estrutura das atividades.",                 duracao: "Contínuo",   artefato: null },
      { id: 6, titulo: "Implantar protocolos",            desc: "Adequar a estrutura da organização do trabalho, incluindo protocolos de acolhimento psicológico.",                  duracao: "2–4 semanas",artefato: "Protocolos documentados" },
      { id: 7, titulo: "Práticas de cuidado",             desc: "Realização das melhorias nas relações de trabalho visando o bem-estar da equipe.",                                 duracao: "Contínuo",   artefato: null },
      { id: 8, titulo: "Integração RH e SST",             desc: "Integrar os procedimentos de RH e SST e consolidar o plano com ações, indicadores e responsabilidades.",           duracao: "1–2 dias",   artefato: "Plano consolidado com monitoramento" },
    ],
  },
  {
    id: "implantacao",
    numero: 3,
    label: "Implantação do Sistema",
    desc: "Treinamento de gestores e equipes, políticas internas e estruturação do monitoramento contínuo.",
    etapas: [
      { id: 1, titulo: "Preparo da 1ª reunião de avaliação", desc: "Fazer o convite, estabelecer o comitê, preparar a reunião e enviar material preliminar.",                         duracao: "3–5 dias",   artefato: "Convocação e pauta" },
      { id: 2, titulo: "Definir o plano de ação",            desc: "Desdobrar o plano de ação e definir indicadores e métricas do período.",                                         duracao: "1 semana",   artefato: "Plano de ação com indicadores" },
      { id: 3, titulo: "Definir ações do período",           desc: "Elaborar o plano de ação 5W2H específico para o período vigente.",                                               duracao: "2–3 dias",   artefato: "Plano 5W2H do período" },
      { id: 4, titulo: "Auditar as atividades",              desc: "Realizar a auditoria e verificar a conformidade das ações realizadas com as previstas.",                         duracao: "2–3 dias",   artefato: "Relatório de auditoria" },
      { id: 5, titulo: "Reunião de monitoramento",           desc: "Fazer a reunião de monitoramento para exposição dos indicadores e progresso das melhorias previstas.",           duracao: "1 sessão",   artefato: "Apresentação de indicadores" },
      { id: 6, titulo: "Ajustar o plano",                    desc: "Realizar melhorias nas ações previstas com base na auditoria e avaliações realizadas.",                         duracao: "1–2 semanas",artefato: "Plano atualizado" },
      { id: 7, titulo: "Avaliar riscos psicossociais",       desc: "Avaliar o impacto real das medidas adotadas com base nas ações desenvolvidas.",                                 duracao: "1 semana",   artefato: "Relatório de evolução dos riscos" },
      { id: 8, titulo: "Revisão e próximo biênio",           desc: "Consolidar o plano com ações, indicadores e responsabilidades e propor o novo plano para o biênio seguinte.",  duracao: "1 sessão",   artefato: "Plano bienal revisado" },
    ],
  },
];

// Per-client operational state
const ROADMAP_ESTADO = {
  loghaus: {
    faseAtual: 0,
    etapas: [
      [
        { status: "concluida", dataConc: "15/03/2026", responsavel: "Caio Guedes",    obs: "Reunião realizada com Mariana Aguiar e equipe de RH. Definidos responsáveis e cronograma." },
        { status: "concluida", dataConc: "22/03/2026", responsavel: "Caio Guedes",    obs: "Workshop com 45 gestores. Adesão de 94%." },
        { status: "concluida", dataConc: "01/04/2026", responsavel: "Mariana Aguiar", obs: "Mapeados 8 setores, 3 unidades (SP, RJ, MG)." },
        { status: "em_andamento", responsavel: "Mariana Aguiar", prazo: "10/06/2026",
          subtarefas: [
            { texto: "Solicitar dados de headcount ao RH",              feita: true  },
            { texto: "Receber indicadores de absenteísmo",              feita: true  },
            { texto: "Compilar dados de acidentes/afastamentos",        feita: false },
            { texto: "Organizar histórico de avaliações anteriores",    feita: false },
          ] },
        { status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" },
      ],
      [{ status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" },
       { status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" }],
      [{ status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" },
       { status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" }],
    ],
  },
  vitamed: {
    faseAtual: 1,
    etapas: [
      [
        { status: "concluida", dataConc: "05/01/2026", responsavel: "Caio Guedes" },
        { status: "concluida", dataConc: "12/01/2026", responsavel: "Caio Guedes" },
        { status: "concluida", dataConc: "20/01/2026", responsavel: "Roberto Lima" },
        { status: "concluida", dataConc: "30/01/2026", responsavel: "Roberto Lima" },
        { status: "concluida", dataConc: "14/02/2026", responsavel: "Caio Guedes" },
        { status: "concluida", dataConc: "28/02/2026", responsavel: "Caio Guedes", obs: "COPSOQ II aplicado. Adesão 91% — 559/612 respondentes.",
          subtarefas: [
            { texto: "Configurar questionário no portal",         feita: true },
            { texto: "Enviar convites aos colaboradores",         feita: true },
            { texto: "Acompanhar adesão (meta: 80%+)",           feita: true },
            { texto: "Encerrar coleta e exportar dados",          feita: true },
          ] },
        { status: "concluida", dataConc: "08/03/2026", responsavel: "Caio Guedes", obs: "Relatório ARP gerado e revisado com Roberto Lima." },
        { status: "concluida", dataConc: "15/03/2026", responsavel: "Caio Guedes", obs: "Apresentação para diretoria e líderes. Aprovado por unanimidade." },
      ],
      [
        { status: "concluida", dataConc: "25/03/2026", responsavel: "Caio Guedes" },
        { status: "em_andamento", responsavel: "Roberto Lima", prazo: "15/06/2026",
          subtarefas: [
            { texto: "Analisar resultados COPSOQ por unidade hospitalar",  feita: true  },
            { texto: "Identificar as 3 dimensões mais críticas",            feita: false },
            { texto: "Definir prioridades de intervenção com RH",           feita: false },
          ] },
        { status: "pendente" }, { status: "pendente" },
        { status: "pendente" }, { status: "pendente" },
        { status: "pendente" }, { status: "pendente" },
      ],
      [{ status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" },
       { status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" }],
    ],
  },
  agrocorp: {
    faseAtual: 0,
    etapas: [
      [
        { status: "concluida", dataConc: "10/01/2026", responsavel: "Caio Guedes" },
        { status: "concluida", dataConc: "20/01/2026", responsavel: "Caio Guedes" },
        { status: "concluida", dataConc: "05/02/2026", responsavel: "Fernanda Souza" },
        { status: "concluida", dataConc: "20/02/2026", responsavel: "Fernanda Souza" },
        { status: "concluida", dataConc: "10/03/2026", responsavel: "Caio Guedes" },
        { status: "em_andamento", responsavel: "Caio Guedes", prazo: "01/06/2026",
          subtarefas: [
            { texto: "Aplicar COPSOQ II em operações (SP)",         feita: true  },
            { texto: "Aplicar COPSOQ II em administrativo (SP)",    feita: true  },
            { texto: "Aplicar COPSOQ II em unidade Goiás",          feita: false },
            { texto: "Compilar respostas — meta: 80% de adesão",    feita: false },
          ] },
        { status: "pendente" }, { status: "pendente" },
      ],
      [{ status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" },
       { status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" }],
      [{ status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" },
       { status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" }],
    ],
  },
};

// ════════════════════════════════════════════════════════════
// NOVAS ETAPAS DO CLIENTE (aba Clientes) — conforme solicitado
// 7 etapas lineares com foco em UX clara e aceites
// ════════════════════════════════════════════════════════════
const CLIENTE_ETAPAS = [
  { n: 1, label: "Cadastro", desc: "Dados completos da empresa e contexto de riscos psicossociais" },
  { n: 2, label: "Proposta", desc: "Visualizar proposta e enviar link para aceite do cliente" },
  { n: 3, label: "Contrato", desc: "Contrato com aceite digital do cliente" },
  { n: 4, label: "Sensibilização", desc: "Palestra, treinamento e trilha" },
  { n: 5, label: "Diagnóstico", desc: "Seleção de instrumentos: COPSOQ II, DRPS e Clima" },
  { n: 6, label: "Relatórios", desc: "Disponível após diagnóstico (desabilitado no cadastro)" },
  { n: 7, label: "Apresentação", desc: "Reunião de discussão do plano de ação" },
];

const ETAPAS_ESTADO_INICIAL = () => ({
  etapaAtual: 1,
  status: {
    1: { status: "concluida", aceito: true },
    2: { status: "em_andamento", aceito: false },
    3: { status: "pendente", aceito: false },
    4: { status: "pendente", sensibilizacoes: { palestra: false, treinamento: false, trilha: false } },
    5: { status: "pendente", instrumentos: [] },
    6: { status: "pendente", habilitado: false },
    7: { status: "pendente", reuniaoAgendada: false, data: "", obs: "" },
  },
});

// Initial per-client etapas state (extend existing clients)
const ETAPAS_CLIENTE = {
  // Exemplo de demonstração: diagnóstico já concluído, Relatórios liberado com gráficos reais
  loghaus: {
    etapaAtual: 6,
    status: {
      1: { status: "concluida", aceito: true, data: "12/05/2026" },
      2: { status: "concluida", aceito: true, data: "18/05/2026" },
      3: { status: "concluida", aceito: true, data: "22/05/2026" },
      4: { status: "concluida", sensibilizacoes: { palestra: true, treinamento: true, trilha: true } },
      5: { status: "concluida", instrumentos: ["copsoqii"] },
      6: { status: "pendente", habilitado: true },
      7: { status: "pendente", reuniaoAgendada: false, data: "", obs: "" },
    },
  },
  // Exemplo de demonstração: diagnóstico já concluído, Relatórios liberado com gráficos reais
  vitamed: {
    etapaAtual: 6,
    status: {
      1: { status: "concluida", aceito: true, data: "08/01/2026" },
      2: { status: "concluida", aceito: true, data: "10/01/2026" },
      3: { status: "concluida", aceito: true, data: "12/01/2026" },
      4: { status: "concluida", sensibilizacoes: { palestra: true, treinamento: true, trilha: true } },
      5: { status: "concluida", instrumentos: ["copsoqii", "clima"] },
      6: { status: "pendente", habilitado: true },
      7: { status: "pendente", reuniaoAgendada: false, data: "", obs: "" },
    },
  },
  agrocorp: {
    etapaAtual: 1,
    status: {
      1: { status: "em_andamento", aceito: false },
      2: { status: "pendente", aceito: false },
      3: { status: "pendente", aceito: false },
      4: { status: "pendente", sensibilizacoes: { palestra: false, treinamento: false, trilha: false } },
      5: { status: "pendente", instrumentos: [] },
      6: { status: "pendente", habilitado: false },
      7: { status: "pendente", reuniaoAgendada: false, data: "", obs: "" },
    },
  },
};

Object.assign(window, {
  CLIENTES, COPSOQ_DIMS, NR17_DIMS, DIAG_DIMS_MAP, DIAGNOSTICOS, AVALIACOES_ATIVAS, LEADS_PIPELINE, TRILHAS,
  ROADMAP_FASES, ROADMAP_ESTADO, CLIENTE_ETAPAS, ETAPAS_CLIENTE, ETAPAS_ESTADO_INICIAL,
  getDiagnosticoResultadoMock,
});
