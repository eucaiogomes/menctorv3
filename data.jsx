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

// Status "de verdade" da campanha, considerando data final e meta de respostas —
// mesmo que o campo status guardado ainda diga "ativa", a campanha aparece
// como encerrada para quem acessa o link após o prazo ou a meta ser atingida.
const getCampanhaStatusEfetivo = (campanha) => {
  if (!campanha) return null;
  const hoje = new Date().toISOString().slice(0, 10);
  const metaAtingida = getCampanhaRespondidos(campanha) >= (campanha.quantidadeFuncionarios || 0);
  if (metaAtingida || hoje > campanha.dataFinal) return "encerrada";
  if (campanha.status !== "ativa") return "pausada";
  if (hoje < campanha.dataInicial) return "agendada";
  return "ativa";
};

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
// 8 etapas lineares com foco em UX clara, aceites e entrevistas
// ════════════════════════════════════════════════════════════
const CLIENTE_ETAPAS = [
  { n: 1, label: "Cadastro", desc: "Dados completos da empresa e contexto de riscos psicossociais" },
  { n: 2, label: "Proposta", desc: "Visualizar proposta e enviar link para aceite do cliente" },
  { n: 3, label: "Contrato", desc: "Contrato com aceite digital do cliente" },
  { n: 4, label: "Sensibilização", desc: "Palestra, treinamento e trilha" },
  { n: 5, label: "Diagnóstico", desc: "Seleção de instrumentos: COPSOQ II, HSE, Entrevista, DRPS e Clima" },
  { n: 6, label: "Entrevistas", desc: "Avaliação qualitativa dos 12 fatores psicossociais e maturidade NR-1" },
  { n: 7, label: "Relatórios", desc: "Disponível após diagnóstico e entrevistas (desabilitado no cadastro)" },
  { n: 8, label: "Apresentação", desc: "Reunião de discussão do plano de ação" },
];

const ETAPAS_ESTADO_INICIAL = () => ({
  etapaAtual: 1,
  status: {
    1: { status: "concluida", aceito: true },
    2: { status: "em_andamento", aceito: false },
    3: { status: "pendente", aceito: false },
    4: { status: "pendente", sensibilizacoes: { palestra: false, treinamento: false, trilha: false } },
    5: { status: "pendente", instrumentos: [] },
    6: { status: "pendente" },
    7: { status: "pendente", habilitado: false },
    8: { status: "pendente", reuniaoAgendada: false, data: "", obs: "" },
  },
});

// Initial per-client etapas state (extend existing clients)
const ETAPAS_CLIENTE = {
  // Exemplo de demonstração: diagnóstico e entrevistas concluídos, Relatórios liberado com gráficos reais
  loghaus: {
    etapaAtual: 7,
    status: {
      1: { status: "concluida", aceito: true, data: "12/05/2026" },
      2: { status: "concluida", aceito: true, data: "18/05/2026" },
      3: { status: "concluida", aceito: true, data: "22/05/2026" },
      4: { status: "concluida", sensibilizacoes: { palestra: true, treinamento: true, trilha: true } },
      5: { status: "concluida", instrumentos: ["copsoqii", "entrevista"] },
      6: { status: "concluida", concluidas: 2, total: 2 },
      7: { status: "pendente", habilitado: true },
      8: { status: "pendente", reuniaoAgendada: false, data: "", obs: "" },
    },
  },
  // Exemplo de demonstração: diagnóstico já concluído com entrevista liberada
  vitamed: {
    etapaAtual: 6,
    status: {
      1: { status: "concluida", aceito: true, data: "08/01/2026" },
      2: { status: "concluida", aceito: true, data: "10/01/2026" },
      3: { status: "concluida", aceito: true, data: "12/01/2026" },
      4: { status: "concluida", sensibilizacoes: { palestra: true, treinamento: true, trilha: true } },
      5: { status: "concluida", instrumentos: ["copsoqii", "entrevista", "clima"] },
      6: { status: "em_andamento" },
      7: { status: "pendente", habilitado: true },
      8: { status: "pendente", reuniaoAgendada: false, data: "", obs: "" },
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
      6: { status: "pendente" },
      7: { status: "pendente", habilitado: false },
      8: { status: "pendente", reuniaoAgendada: false, data: "", obs: "" },
    },
  },
};

// ════════════════════════════════════════════════════════════
// FRENTE 1 — ENTREVISTAS DE AVALIAÇÃO DOS FATORES DE RISCOS PSICOSSOCIAIS
// ════════════════════════════════════════════════════════════

const ENTREVISTA_ESTRUTURAS = [
  { id: "relacoes",      numero: 1, label: "Estrutura dos Modelos Relacionais", short: "Relações" },
  { id: "atividades",    numero: 2, label: "Estrutura das Atividades",          short: "Atividades" },
  { id: "organizacional",numero: 3, label: "Estrutura Organizacional",          short: "Organizacional" },
];

const ENTREVISTA_FATORES = [
  // ── 1. Relações ──
  {
    id: "assedio", estruturaId: "relacoes", numero: "1.1",
    nome: "Assédio Moral ou Sexual",
    objetivo: "Avaliar a existência de comportamentos repetitivos de humilhação, intimidação, constrangimento, abuso de autoridade, assédio moral ou assédio sexual que possam comprometer a dignidade, a segurança psicológica, o bem-estar e a saúde mental dos trabalhadores.",
    perguntas: [
      "Você já presenciou ou vivenciou situações de humilhação, desrespeito, constrangimento, abuso de autoridade ou assédio moral ou sexual no ambiente de trabalho?",
      "Quando essas situações acontecem, como a liderança ou a empresa costuma agir?",
      "Você acredita que as pessoas se sentem seguras para denunciar situações de assédio ou comportamentos inadequados sem medo de sofrer represálias?",
      "Na sua percepção, a empresa deixa claro que comportamentos de assédio ou desrespeito são inaceitáveis?",
      "Você considera que o ambiente de trabalho promove relações baseadas no respeito, na ética e na dignidade entre líderes e colaboradores?"
    ],
    aprofundamento: [
      "Esses comportamentos são isolados ou recorrentes?",
      "Quem praticou o comportamento?",
      "Houve testemunhas?",
      "A empresa tomou alguma providência?",
      "O colaborador recebeu apoio?",
      "O comportamento continua acontecendo?",
      "Outras pessoas já relataram situações semelhantes?",
      "O fato impactou sua saúde ou seu desempenho?"
    ],
    evidencias: [
      "Relatos recorrentes de assédio moral",
      "Relatos de assédio sexual",
      "Humilhações públicas",
      "Abuso de autoridade",
      "Cobranças constrangedoras",
      "Medo de denunciar",
      "Omissão da liderança",
      "Queixas registradas no RH"
    ],
    notaTecnica: "O assédio moral e o assédio sexual representam um dos mais graves fatores de risco psicossocial nas organizações. A avaliação deve considerar não apenas relatos explícitos de violência, mas também comportamentos repetitivos que exponham trabalhadores a situações de humilhação, intimidação, isolamento, ameaças, constrangimento ou abuso de autoridade.",
  },
  {
    id: "relacoes_interpessoais", estruturaId: "relacoes", numero: "1.2",
    nome: "Más Relações Interpessoais",
    objetivo: "Avaliar a qualidade das relações interpessoais entre os trabalhadores, verificando a existência de cooperação, respeito, confiança, comunicação saudável e espírito de equipe.",
    perguntas: [
      "Como você descreve o relacionamento entre os colegas de trabalho no seu setor?",
      "Na sua percepção, existe respeito mútuo e colaboração entre os colaboradores durante a realização das atividades?",
      "Quando surgem conflitos entre colegas ou equipes, como eles costumam ser resolvidos?",
      "Você sente que existe confiança entre os colaboradores ou percebe um ambiente marcado por competição excessiva, conflitos ou isolamento?",
      "Na sua opinião, o ambiente de trabalho favorece relações saudáveis e cooperativas? Por quê?"
    ],
    aprofundamento: [
      "Os conflitos são frequentes?",
      "Eles costumam envolver quais áreas ou pessoas?",
      "Existe diálogo para resolver os problemas?",
      "Os colaboradores costumam ajudar uns aos outros?",
      "Há grupos isolados dentro da empresa?",
      "Existe rivalidade entre equipes?",
      "O ambiente favorece a confiança?",
      "Como esses relacionamentos afetam seu trabalho?"
    ],
    evidencias: [
      "Conflitos frequentes",
      "Baixa cooperação",
      "Competição excessiva",
      "Isolamento entre colaboradores",
      "Comunicação hostil",
      "Ambiente de desconfiança",
      "Dificuldade de integração",
      "Reclamações recorrentes"
    ],
    notaTecnica: "As relações interpessoais representam um dos principais fatores de proteção da saúde mental no ambiente de trabalho. Equipes que mantêm relações baseadas na confiança, no respeito e na cooperação tendem a apresentar maior engajamento, melhor comunicação e menor ocorrência de conflitos.",
  },
  {
    id: "apoio_social", estruturaId: "relacoes", numero: "1.3",
    nome: "Falta de Apoio Social",
    objetivo: "Avaliar a percepção dos trabalhadores quanto ao apoio recebido da liderança, dos colegas e da própria organização para o desempenho de suas atividades, resolução de dificuldades e enfrentamento de situações de pressão ou adversidade.",
    perguntas: [
      "Quando você enfrenta dificuldades no trabalho, sente que pode contar com o apoio da sua liderança e dos seus colegas?",
      "Na sua percepção, existe colaboração entre os membros da equipe ou cada colaborador precisa resolver seus problemas sozinho?",
      "Quando um colaborador passa por dificuldades pessoais ou profissionais, como a empresa e a liderança costumam agir?",
      "Você sente liberdade para pedir ajuda quando necessário, sem receio de julgamentos, críticas ou consequências negativas?",
      "De maneira geral, você considera que trabalha em um ambiente acolhedor, colaborativo e que incentiva o apoio entre as pessoas? Por quê?"
    ],
    aprofundamento: [
      "Quem normalmente oferece ajuda quando surgem dificuldades?",
      "A liderança demonstra disponibilidade para ouvir os colaboradores?",
      "Existe cooperação entre os colegas?",
      "Você já deixou de pedir ajuda por medo ou vergonha?",
      "Os novos colaboradores recebem apoio durante sua integração?",
      "Como a empresa reage quando alguém apresenta dificuldades emocionais?",
      "Você sente que faz parte da equipe?"
    ],
    evidencias: [
      "Baixa colaboração entre equipes",
      "Isolamento dos trabalhadores",
      "Liderança pouco acessível",
      "Dificuldade para solicitar ajuda",
      "Ambiente individualista",
      "Falta de integração",
      "Ausência de acolhimento",
      "Baixo senso de pertencimento"
    ],
    notaTecnica: "O apoio social representa um dos principais fatores de proteção contra os riscos psicossociais. Trabalhadores que percebem disponibilidade da liderança e colaboração entre colegas tendem a enfrentar situações de pressão com maior resiliência, reduzindo os impactos negativos sobre a saúde mental.",
  },
  {
    id: "lideranca_abusiva", estruturaId: "relacoes", numero: "1.4",
    nome: "Liderança Abusiva",
    objetivo: "Avaliar se as práticas de liderança adotadas pela organização promovem respeito, desenvolvimento, apoio e segurança psicológica ou se apresentam comportamentos abusivos, autoritários, intimidatórios ou desrespeitosos capazes de comprometer a saúde mental dos trabalhadores.",
    perguntas: [
      "Como você descreveria a forma como sua liderança conduz a equipe no dia a dia?",
      "Você sente que sua liderança trata os colaboradores com respeito, imparcialidade e profissionalismo?",
      "Quando ocorrem erros ou dificuldades, como a liderança costuma agir? Ela orienta, apoia e busca soluções ou utiliza críticas, ameaças, constrangimentos ou exposição pública?",
      "Você se sente à vontade para conversar com sua liderança, apresentar sugestões, esclarecer dúvidas ou comunicar problemas sem receio de sofrer consequências negativas?",
      "Na sua percepção, a liderança contribui para um ambiente de trabalho saudável e seguro ou acaba aumentando o estresse e a pressão sobre a equipe?"
    ],
    aprofundamento: [
      "Como a liderança costuma cobrar resultados?",
      "É comum elevar o tom de voz durante as cobranças?",
      "Existem ameaças relacionadas ao emprego?",
      "Os erros são tratados individualmente ou na frente da equipe?",
      "A liderança escuta os colaboradores antes de tomar decisões?",
      "Existe favoritismo entre membros da equipe?",
      "Os colaboradores sentem medo da liderança?",
      "Você já deixou de expressar sua opinião por receio da reação do gestor?"
    ],
    evidencias: [
      "Comunicação agressiva",
      "Gritos ou humilhações",
      "Exposição pública de colaboradores",
      "Ameaças ou intimidação",
      "Abuso de autoridade",
      "Favoritismo",
      "Medo da liderança",
      "Falta de diálogo",
      "Ausência de feedback construtivo"
    ],
    notaTecnica: "A liderança exerce influência direta sobre o clima organizacional, a motivação, o desempenho e o bem-estar das equipes. Líderes preparados fortalecem a confiança, estimulam o desenvolvimento das pessoas e favorecem ambientes saudáveis.",
  },
  // ── 2. Atividades ──
  {
    id: "sobrecarga", estruturaId: "atividades", numero: "2.1",
    nome: "Sobrecarga de Trabalho",
    objetivo: "Avaliar se as demandas de trabalho impostas aos trabalhadores são compatíveis com os recursos disponíveis, considerando volume de tarefas, jornada, ritmo, prazos, acúmulo de funções e condições organizacionais para sua realização.",
    perguntas: [
      "Você considera que o volume de trabalho que recebe é adequado para ser realizado dentro da sua jornada?",
      "Com que frequência você precisa fazer horas extras, levar trabalho para casa ou trabalhar nos finais de semana para dar conta das atividades?",
      "Na sua percepção, a quantidade de pessoas na sua equipe é suficiente para as demandas existentes?",
      "Você tem pausas regulares durante o expediente? Consegue respeitar seus horários de intervalo?",
      "Na sua opinião, como o volume e o ritmo de trabalho afetam seu bem-estar e sua saúde?"
    ],
    aprofundamento: [
      "A sobrecarga ocorre com qual frequência?",
      "Houve redução recente na equipe sem redistribuição de tarefas?",
      "As demandas são previsíveis ou mudam constantemente?",
      "Existe acúmulo de funções?",
      "A jornada ultrapassa o previsto em contrato?",
      "Existem pausas regulares?",
      "Como a sobrecarga impacta sua saúde e motivação?"
    ],
    evidencias: [
      "Horas extras frequentes",
      "Acúmulo de funções",
      "Equipe reduzida",
      "Ritmo intenso sem pausas",
      "Prazos incompatíveis",
      "Jornadas prolongadas",
      "Fadiga crônica relatada",
      "Queixas de sobrecarga recorrentes"
    ],
    notaTecnica: "A sobrecarga de trabalho é um dos fatores de risco psicossocial mais recorrentes. Não se resume apenas ao volume de tarefas, mas inclui a intensidade do ritmo, a pressão dos prazos, a insuficiência de recursos humanos, o acúmulo de funções e a ausência de pausas adequadas.",
  },
  {
    id: "monotonia", estruturaId: "atividades", numero: "2.2",
    nome: "Monotonia ou Baixa Variedade das Atividades",
    objetivo: "Avaliar se as atividades desempenhadas pelos trabalhadores apresentam grau adequado de diversidade, estímulo intelectual e utilização das competências profissionais ou se são excessivamente repetitivas, previsíveis e pouco desafiadoras.",
    perguntas: [
      "Como você descreveria suas atividades diárias? Elas são diversificadas ou muito repetitivas?",
      "Você considera que seu trabalho oferece oportunidades para aprender coisas novas, desenvolver habilidades ou enfrentar novos desafios?",
      "Em algum momento você sente que a rotina de trabalho se torna cansativa, desmotivadora ou automática devido à repetição constante das atividades?",
      "Você acredita que consegue utilizar seus conhecimentos, experiência e competências no desempenho das suas atividades ou sente que seu potencial é pouco aproveitado?",
      "Caso pudesse modificar algum aspecto da sua rotina de trabalho, o que mudaria para torná-la mais estimulante ou satisfatória?"
    ],
    aprofundamento: [
      "Há rodízio de atividades?",
      "Você aprende novas competências com frequência?",
      "Existe oportunidade de participar de projetos diferentes?",
      "O trabalho exige tomada de decisão ou apenas execução?",
      "Você sente que sua criatividade é utilizada?",
      "Há possibilidade de crescimento profissional?",
      "Como essa rotina influencia sua motivação?"
    ],
    evidencias: [
      "Atividades excessivamente repetitivas",
      "Baixo estímulo intelectual",
      "Falta de desafios",
      "Desmotivação",
      "Sensação de estagnação",
      "Baixo aproveitamento das competências",
      "Baixo engajamento",
      "Relatos frequentes de tédio"
    ],
    notaTecnica: "A monotonia não está relacionada apenas à repetição de movimentos físicos. Ela também pode ocorrer quando o trabalho oferece baixo estímulo cognitivo, pouca utilização das competências profissionais, ausência de desafios ou escassas oportunidades de aprendizagem.",
  },
  {
    id: "trabalho_repetitivo", estruturaId: "atividades", numero: "2.3",
    nome: "Trabalho Repetitivo",
    objetivo: "Avaliar se as atividades desempenhadas pelos trabalhadores exigem a repetição contínua de movimentos, tarefas ou ciclos operacionais durante longos períodos, com pouca variação na execução do trabalho.",
    perguntas: [
      "Na sua rotina de trabalho, você realiza as mesmas atividades ou movimentos repetidamente durante grande parte da jornada?",
      "A empresa oferece pausas, rodízio de atividades ou outras medidas para reduzir os efeitos da repetição das tarefas?",
      "Após períodos prolongados executando as mesmas atividades, você percebe cansaço físico, fadiga mental, perda de concentração ou redução da produtividade?",
      "Você considera que a repetição das atividades interfere na sua motivação, atenção ou bem-estar durante o trabalho?",
      "Na sua opinião, o que poderia ser feito para tornar sua rotina de trabalho mais equilibrada e menos repetitiva?"
    ],
    aprofundamento: [
      "Quanto tempo contínuo você executa as mesmas atividades?",
      "Existem pausas programadas?",
      "Há rodízio de tarefas?",
      "Você sente dores ou desconforto durante a execução?",
      "A repetição impacta sua atenção e concentração?",
      "A empresa já adotou medidas para reduzir a repetitividade?"
    ],
    evidencias: [
      "Ciclos de trabalho curtos e repetitivos",
      "Ausência de pausas",
      "Falta de rodízio de atividades",
      "Queixas de fadiga física",
      "Redução da atenção",
      "Desmotivação relacionada à rotina",
      "Desconforto musculoesquelético",
      "Alta incidência de retrabalho"
    ],
    notaTecnica: "O trabalho repetitivo é caracterizado pela execução contínua dos mesmos movimentos, tarefas ou ciclos operacionais durante longos períodos, com pouca variação na forma de execução.",
  },
  {
    id: "pressao_metas", estruturaId: "atividades", numero: "2.4",
    nome: "Pressão por Metas",
    objetivo: "Avaliar se as metas, indicadores de desempenho e formas de cobrança adotados pela organização são compatíveis com os recursos disponíveis e com a preservação da saúde mental dos trabalhadores.",
    perguntas: [
      "As metas definidas pela empresa para o seu trabalho são claras, realistas e alcançáveis com os recursos disponíveis?",
      "De que forma a liderança acompanha o atingimento das metas? Existe apoio, orientação e feedback ou predominam cobranças, pressão e punições?",
      "Quando um colaborador não atinge a meta estabelecida, como a empresa costuma reagir?",
      "Na sua percepção, as metas estimulam o desenvolvimento profissional ou geram desgaste, medo e sobrecarga?",
      "Você sente que a empresa prioriza resultados sem considerar o impacto sobre a saúde e o bem-estar dos colaboradores?"
    ],
    aprofundamento: [
      "As metas mudam frequentemente?",
      "Existe transparência nos critérios de avaliação?",
      "A cobrança é feita de forma respeitosa?",
      "Há exposição pública em caso de não atingimento?",
      "As metas consideram fatores fora do controle do colaborador?",
      "Existe recompensa compatível com o esforço?",
      "Como a pressão impacta seu bem-estar?"
    ],
    evidencias: [
      "Metas incompatíveis com recursos",
      "Cobranças excessivas",
      "Exposição pública de resultados",
      "Ameaças por não atingimento",
      "Competição prejudicial",
      "Jornadas excessivas para cumprir metas",
      "Falta de apoio da liderança",
      "Metas que mudam constantemente"
    ],
    notaTecnica: "A existência de metas não representa, por si só, um risco psicossocial. Metas claras, alcançáveis e acompanhadas por lideranças preparadas podem, inclusive, favorecer o engajamento e o desenvolvimento profissional. O risco surge quando as metas são utilizadas como instrumento de pressão excessiva, medo ou constrangimento.",
  },
  // ── 3. Organizacional ──
  {
    id: "reconhecimento", estruturaId: "organizacional", numero: "3.1",
    nome: "Baixo Reconhecimento",
    objetivo: "Avaliar a percepção dos trabalhadores quanto ao reconhecimento recebido pela qualidade do trabalho realizado, pelo esforço empregado, pelos resultados alcançados e pelas contribuições oferecidas à organização.",
    perguntas: [
      "Você sente que seu trabalho é reconhecido e valorizado pela liderança e pela organização?",
      "Quando você realiza um bom trabalho ou alcança resultados importantes, de que forma esse esforço costuma ser reconhecido?",
      "Na sua percepção, os colaboradores recebem reconhecimento de forma justa, independentemente do cargo ou da área em que trabalham?",
      "Você acredita que seu trabalho contribui para os resultados da empresa e que essa contribuição é percebida pela organização?",
      "O que poderia ser feito pela empresa para que os colaboradores se sentissem mais valorizados e reconhecidos?"
    ],
    aprofundamento: [
      "O reconhecimento ocorre apenas quando existem erros?",
      "A liderança costuma elogiar bons resultados?",
      "Existe feedback positivo?",
      "Há oportunidades de crescimento?",
      "Você sente que seu esforço faz diferença?",
      "Os colaboradores são valorizados de maneira igual?",
      "Como a falta de reconhecimento influencia sua motivação?"
    ],
    evidencias: [
      "Falta de feedback positivo",
      "Reconhecimento insuficiente",
      "Desmotivação",
      "Sentimento de desvalorização",
      "Baixo engajamento",
      "Reclamações recorrentes",
      "Alta rotatividade"
    ],
    notaTecnica: "O reconhecimento organizacional não se limita a recompensas financeiras ou promoções. Ele envolve feedback construtivo, valorização do esforço, respeito pelas contribuições individuais, oportunidades de desenvolvimento e demonstrações genuínas de apreço pelo trabalho realizado.",
  },
  {
    id: "inseguranca_emprego", estruturaId: "organizacional", numero: "3.2",
    nome: "Insegurança no Emprego",
    objetivo: "Avaliar a percepção dos trabalhadores quanto à estabilidade e à segurança em relação ao seu emprego, considerando ameaças de demissão, reestruturações organizacionais, terceirização, precarização e mudanças que possam comprometer a continuidade do vínculo profissional.",
    perguntas: [
      "Você sente que seu emprego está seguro ou existe alguma preocupação com a possibilidade de perda do trabalho?",
      "Nos últimos meses, houve demissões, reestruturações ou mudanças que tenham gerado preocupação entre os colaboradores?",
      "A empresa comunica com clareza sobre sua situação financeira, planos de crescimento ou eventuais mudanças que possam afetar os trabalhadores?",
      "Você sente que a empresa valoriza os colaboradores e busca manter as pessoas ou percebe instabilidade no tratamento dado aos trabalhadores?",
      "Como a incerteza sobre o futuro do emprego afeta seu bem-estar, motivação e desempenho?"
    ],
    aprofundamento: [
      "Houve demissões recentes?",
      "Existem rumores sobre reestruturações?",
      "A empresa comunica mudanças com antecedência?",
      "Há terceirização de funções?",
      "Os contratos são estáveis?",
      "Existem ameaças veladas ou explícitas?",
      "Como a insegurança afeta seu dia a dia?"
    ],
    evidencias: [
      "Demissões frequentes",
      "Reestruturações sem comunicação",
      "Terceirização de funções",
      "Contratos precários",
      "Ameaças de demissão",
      "Rumores sobre cortes",
      "Falta de perspectiva de carreira",
      "Alta rotatividade"
    ],
    notaTecnica: "A insegurança no emprego gera impactos significativos na saúde mental dos trabalhadores, afetando sua capacidade de concentração, motivação, engajamento e disposição para colaborar com a organização.",
  },
  {
    id: "gestao_mudancas", estruturaId: "organizacional", numero: "3.3",
    nome: "Má Gestão de Mudanças",
    objetivo: "Avaliar como a organização planeja, comunica, implementa e acompanha mudanças organizacionais relevantes, considerando seu impacto sobre os trabalhadores, a comunicação durante o processo e o suporte oferecido para adaptação.",
    perguntas: [
      "Quando a empresa realiza mudanças importantes, como reestruturações, mudanças de processos, implementação de novos sistemas ou alterações na equipe, essas mudanças são comunicadas previamente aos colaboradores?",
      "Na sua percepção, os trabalhadores são ouvidos ou envolvidos durante os processos de mudança ou as decisões são impostas sem consulta?",
      "A empresa oferece treinamento, orientação e suporte quando implementa novas formas de trabalho, sistemas ou processos?",
      "As mudanças realizadas pela empresa costumam aumentar ou diminuir o estresse e a pressão no ambiente de trabalho?",
      "De maneira geral, como você avalia a forma como a empresa conduz as mudanças organizacionais?"
    ],
    aprofundamento: [
      "As mudanças são comunicadas com antecedência?",
      "Os colaboradores são consultados antes das decisões?",
      "Existe treinamento para adaptação?",
      "As mudanças aumentam a sobrecarga?",
      "Os impactos das mudanças são monitorados?",
      "A liderança oferece suporte durante o processo?"
    ],
    evidencias: [
      "Mudanças sem comunicação prévia",
      "Ausência de participação dos trabalhadores",
      "Falta de treinamento",
      "Aumento de sobrecarga pós-mudança",
      "Resistência dos colaboradores",
      "Retrabalho frequente",
      "Queixas sobre implantação de sistemas",
      "Falta de suporte da liderança"
    ],
    notaTecnica: "As mudanças organizacionais fazem parte da evolução das empresas e, por si só, não representam um risco psicossocial. O fator de risco está relacionado à forma como essas mudanças são conduzidas.",
  },
  {
    id: "justica_organizacional", estruturaId: "organizacional", numero: "3.4",
    nome: "Baixa Justiça Organizacional",
    objetivo: "Avaliar a percepção dos trabalhadores quanto à justiça, imparcialidade e transparência das decisões adotadas pela organização, especialmente em relação à distribuição de oportunidades, reconhecimento, promoções, aplicação de normas, resolução de conflitos e tratamento entre os colaboradores.",
    perguntas: [
      "Na sua percepção, os colaboradores são tratados de forma justa, respeitosa e imparcial pela empresa e pelas lideranças?",
      "Você considera que promoções, oportunidades de desenvolvimento, reconhecimentos e decisões importantes seguem critérios claros e transparentes?",
      "Quando ocorrem conflitos, reclamações ou situações de desentendimento, a empresa costuma analisar os fatos com imparcialidade e buscar soluções justas?",
      "Você acredita que as regras e normas da empresa são aplicadas da mesma forma para todos os colaboradores, independentemente do cargo ou da função?",
      "De maneira geral, você confia que as decisões tomadas pela empresa são éticas, transparentes e coerentes?"
    ],
    aprofundamento: [
      "Existem pessoas que recebem tratamento diferenciado?",
      "Os critérios para promoções são conhecidos?",
      "As regras são aplicadas igualmente para todos?",
      "Você já presenciou situações de favorecimento?",
      "Os trabalhadores conseguem recorrer quando discordam de alguma decisão?",
      "A empresa costuma ouvir todas as partes antes de decidir?",
      "Como essas situações influenciam sua motivação?"
    ],
    evidencias: [
      "Percepção de favorecimento",
      "Critérios pouco transparentes",
      "Aplicação desigual das regras",
      "Falta de imparcialidade",
      "Baixa confiança nas decisões",
      "Reclamações recorrentes",
      "Desmotivação relacionada à gestão"
    ],
    notaTecnica: "A justiça organizacional representa a síntese da confiança existente entre trabalhadores e organização. Empresas percebidas como justas fortalecem o comprometimento, reduzem conflitos, aumentam o engajamento e criam ambientes psicologicamente seguros.",
  },
];

const ENTREVISTA_MATURIDADE = [
  {
    nivel: 1, label: "Organização Preventiva", cor: "#22c55e",
    descricao: "A organização demonstra elevado comprometimento com a saúde mental dos trabalhadores. Atua preventivamente, identifica riscos antes que produzam impactos significativos e promove um ambiente de trabalho saudável.",
    caracteristicas: ["Lideranças preparadas", "Comunicação transparente", "Ambiente de respeito", "Segurança psicológica", "Gestão estruturada dos riscos", "Cultura de aprendizagem", "Participação dos trabalhadores", "Monitoramento contínuo"],
  },
  {
    nivel: 2, label: "Organização em Desenvolvimento", cor: "#F0A800",
    descricao: "Existem boas práticas implantadas, porém ainda são observadas oportunidades de melhoria. A empresa demonstra intenção de evoluir, porém necessita fortalecer sua cultura preventiva.",
    caracteristicas: ["Alguns fatores de risco moderados", "Lideranças em processo de desenvolvimento", "Comunicação parcialmente estruturada", "Programas preventivos ainda em consolidação"],
  },
  {
    nivel: 3, label: "Organização Vulnerável", cor: "#F66B0A",
    descricao: "Diversos fatores de risco apresentam intensidade moderada ou alta. A organização apresenta risco significativo de adoecimento ocupacional caso medidas preventivas não sejam implementadas.",
    caracteristicas: ["Sobrecarga frequente", "Comunicação deficiente", "Baixa participação dos trabalhadores", "Lideranças inconsistentes", "Clima organizacional fragilizado"],
  },
  {
    nivel: 4, label: "Organização em Situação Crítica", cor: "#E5484D",
    descricao: "Foram identificadas evidências consistentes de elevado risco psicossocial. A empresa necessita de intervenção prioritária e implementação imediata de ações estruturantes.",
    caracteristicas: ["Assédio recorrente", "Violência organizacional", "Metas abusivas", "Medo", "Alta rotatividade", "Elevado absenteísmo", "Afastamentos relacionados à saúde mental", "Baixa confiança na liderança"],
  },
];

const CLASSIFICACAO_LABELS = {
  1: "Muito Baixo", 2: "Baixo", 3: "Moderado", 4: "Alto", 5: "Muito Alto"
};
const CLASSIFICACAO_CORES = {
  1: "#22c55e", 2: "#4ade80", 3: "#F0A800", 4: "#F66B0A", 5: "#E5484D"
};

// Mock: entrevistas em andamento por cliente
const ENTREVISTAS_MOCK = [
  {
    id: "ent-1", clienteId: "loghaus", titulo: "Entrevista Diagnóstica — Q3/2026",
    entrevistador: "Caio Guedes", data: "2026-07-15", status: "em_andamento",
    fatoresAvaliados: {
      assedio: { classificacao: 2, observacoes: "Não foram identificados relatos significativos." },
      relacoes_interpessoais: { classificacao: 3, observacoes: "Existem conflitos pontuais entre equipes operacionais." },
      apoio_social: { classificacao: 2, observacoes: "Liderança acessível, bom nível de cooperação." },
      lideranca_abusiva: { classificacao: 1, observacoes: "Sem evidências de liderança abusiva." },
      sobrecarga: { classificacao: 4, observacoes: "Equipe reduzida em operações. Horas extras frequentes." },
      monotonia: { classificacao: 3, observacoes: "Atividades operacionais com baixa variação." },
    },
  },
  {
    id: "ent-2", clienteId: "vitamed", titulo: "Avaliação Psicossocial — Unidades Hospitalares",
    entrevistador: "Caio Guedes", data: "2026-03-20", status: "concluida",
    fatoresAvaliados: {
      assedio: { classificacao: 1, observacoes: "Ambiente de respeito." },
      relacoes_interpessoais: { classificacao: 2, observacoes: "Boa integração entre equipes." },
      apoio_social: { classificacao: 1, observacoes: "Forte cultura de apoio." },
      lideranca_abusiva: { classificacao: 1, observacoes: "Lideranças preparadas e respeitosas." },
      sobrecarga: { classificacao: 3, observacoes: "Plantões podem gerar fadiga em alguns setores." },
      monotonia: { classificacao: 2, observacoes: "Atividades variadas na maioria dos setores." },
      trabalho_repetitivo: { classificacao: 2, observacoes: "Procedimentos padronizados mas com variação de casos." },
      pressao_metas: { classificacao: 2, observacoes: "Metas claras e atingíveis." },
      reconhecimento: { classificacao: 2, observacoes: "Feedback positivo regular." },
      inseguranca_emprego: { classificacao: 1, observacoes: "Empresa em expansão, estabilidade percebida." },
      gestao_mudancas: { classificacao: 2, observacoes: "Mudanças comunicadas, porém treinamento pode ser aprimorado." },
      justica_organizacional: { classificacao: 1, observacoes: "Critérios transparentes e aplicados de forma equitativa." },
    },
  },
  {
    id: "ent-3", clienteId: "agrocorp", titulo: "Diagnóstico Psicossocial — Operações SP",
    entrevistador: "Caio Guedes", data: "2026-05-10", status: "rascunho",
    fatoresAvaliados: {},
  },
];

// ════════════════════════════════════════════════════════════
// ENTREVISTAS COM MÚLTIPLOS PARTICIPANTES — normalização e agregação
// Uma entrevista pode reunir várias pessoas (qtdPessoas); cada uma responde
// os 12 fatores individualmente e o resultado final agrega as respostas.
// ════════════════════════════════════════════════════════════

const criarParticipantesEntrevista = (qtd) => {
  const n = Math.max(1, Number(qtd) || 1);
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    nome: `Pessoa ${i + 1}`,
    fatoresAvaliados: {},
  }));
};

// Entrevistas antigas guardavam fatoresAvaliados direto no objeto (sem
// participantes) — tratamos esse caso como um único participante, para
// manter compatibilidade com registros já existentes.
const getEntrevistaParticipantes = (entrevista) => {
  if (entrevista?.participantes?.length) return entrevista.participantes;
  return [{ id: "p1", nome: "Pessoa 1", fatoresAvaliados: entrevista?.fatoresAvaliados || {} }];
};

// Agrega as respostas de todos os participantes por fator: média das
// classificações dadas, e crítico se qualquer participante marcou 4 ou 5.
const agregarFatoresEntrevista = (entrevista) => {
  const participantes = getEntrevistaParticipantes(entrevista);
  const agregados = {};
  ENTREVISTA_FATORES.forEach(fator => {
    const respostas = participantes
      .map(p => ({ participante: p, dado: p.fatoresAvaliados?.[fator.id] }))
      .filter(r => r.dado?.classificacao);
    if (respostas.length === 0) return;
    const media = respostas.reduce((s, r) => s + r.dado.classificacao, 0) / respostas.length;
    const maxClassificacao = Math.max(...respostas.map(r => r.dado.classificacao));
    agregados[fator.id] = {
      fator,
      media,
      classificacaoArredondada: Math.min(5, Math.max(1, Math.round(media))),
      maxClassificacao,
      isCritico: maxClassificacao >= 4,
      totalRespostas: respostas.length,
      respostas: respostas.map(r => ({
        participanteId: r.participante.id,
        participanteNome: r.participante.nome,
        classificacao: r.dado.classificacao,
        observacoes: r.dado.observacoes,
      })),
    };
  });
  return agregados;
};

// Progresso: quantas respostas (pessoa × fator) já foram registradas, e
// quantos participantes já concluíram os 12 fatores.
const calcularProgressoEntrevista = (entrevista) => {
  const participantes = getEntrevistaParticipantes(entrevista);
  const totalFatores = ENTREVISTA_FATORES.length;
  let totalRespondido = 0;
  let participantesConcluidos = 0;
  participantes.forEach(p => {
    const count = Object.values(p.fatoresAvaliados || {}).filter(f => f?.classificacao).length;
    totalRespondido += count;
    if (count === totalFatores) participantesConcluidos += 1;
  });
  const totalPossivel = totalFatores * participantes.length;
  return {
    totalParticipantes: participantes.length,
    participantesConcluidos,
    totalRespondido,
    totalPossivel,
    pct: totalPossivel ? Math.round((totalRespondido / totalPossivel) * 100) : 0,
  };
};

// Calcula o nível de maturidade CERTIFICA NR-1 a partir da agregação por fator
// (mesmos critérios de antes, agora aplicados sobre a média entre pessoas).
const calcularMaturidadeEntrevista = (entrevista) => {
  const agregados = agregarFatoresEntrevista(entrevista);
  const avaliadosList = Object.values(agregados);
  if (avaliadosList.length === 0) return null;

  const media = avaliadosList.reduce((acc, cur) => acc + cur.media, 0) / avaliadosList.length;
  const criticosCount = avaliadosList.filter(a => a.isCritico).length;
  const temGrave = avaliadosList.some(a => (a.fator.id === "assedio" || a.fator.id === "lideranca_abusiva") && a.isCritico);

  let nivelId = 1;
  if (media >= 3.8 || (temGrave && criticosCount >= 2)) {
    nivelId = 4;
  } else if (media >= 2.8 || criticosCount >= 3 || temGrave) {
    nivelId = 3;
  } else if (media >= 1.8 || criticosCount >= 1) {
    nivelId = 2;
  }

  const nivelObj = ENTREVISTA_MATURIDADE.find(n => n.nivel === nivelId) || ENTREVISTA_MATURIDADE[0];

  const calcAvgEstrutura = (estruturaId) => {
    const arr = avaliadosList.filter(a => a.fator.estruturaId === estruturaId);
    return arr.length ? (arr.reduce((s, i) => s + i.media, 0) / arr.length).toFixed(2) : "—";
  };

  return {
    media: media.toFixed(2),
    nivel: nivelObj,
    totalAvaliados: avaliadosList.length,
    mediasPorEstrutura: {
      relacoes: calcAvgEstrutura("relacoes"),
      atividades: calcAvgEstrutura("atividades"),
      organizacional: calcAvgEstrutura("organizacional"),
    },
    fatoresCriticos: avaliadosList.filter(a => a.isCritico),
  };
};

// ════════════════════════════════════════════════════════════
// FRENTE 2 — MATRIZ DE RISCO E SEVERIDADE
// ════════════════════════════════════════════════════════════

// Classificação da matriz 5×5 (P×S) — conforme documento visual
const MATRIZ_CLASSIFICACOES = {
  "P1-S1": "insignificante", "P1-S2": "baixo",      "P1-S3": "baixo",      "P1-S4": "moderado",   "P1-S5": "moderado",
  "P2-S1": "baixo",          "P2-S2": "baixo",      "P2-S3": "moderado",   "P2-S4": "moderado",   "P2-S5": "alto",
  "P3-S1": "baixo",          "P3-S2": "moderado",   "P3-S3": "moderado",   "P3-S4": "alto",       "P3-S5": "alto",
  "P4-S1": "moderado",       "P4-S2": "moderado",   "P4-S3": "alto",       "P4-S4": "alto",       "P4-S5": "critico",
  "P5-S1": "moderado",       "P5-S2": "alto",       "P5-S3": "alto",       "P5-S4": "critico",    "P5-S5": "critico",
};

const MATRIZ_NIVEIS = {
  insignificante: { label: "Insignificante", cor: "#38bdf8", prioridade: "Monitoramento" },
  baixo:          { label: "Baixo",          cor: "#4ade80", prioridade: "Longo prazo" },
  moderado:       { label: "Moderado",       cor: "#facc15", prioridade: "Médio prazo" },
  alto:           { label: "Alto",           cor: "#fb923c", prioridade: "Curto prazo" },
  critico:        { label: "Crítico",        cor: "#f87171", prioridade: "Imediata" },
};

// Frameworks de Severidade por Fator
const SEVERIDADE_NIVEIS = {
  1: { valor: 1, label: "1 — Insignificante", nome: "Insignificante", cor: "#38bdf8", desc: "Impacto residual ou nulo na saúde psíquica" },
  2: { valor: 2, label: "2 — Leve", nome: "Leve", cor: "#4ade80", desc: "Insatisfação pontual, desconforto transitório, turnover pontual" },
  3: { valor: 3, label: "3 — Moderado", nome: "Moderado", cor: "#facc15", desc: "Estresse crônico, queda de engajamento, conflito trabalho-família" },
  4: { valor: 4, label: "4 — Grave", nome: "Grave", cor: "#fb923c", desc: "Burnout, adoecimento, afastamentos prolongados (B91/B31)" },
  5: { valor: 5, label: "5 — Catastrófico", nome: "Catastrófico", cor: "#f87171", desc: "Risco jurídico grave, assédio, ideação, trauma severo" },
};

const SEVERIDADE_FRAMEWORKS = {
  copsoq: {
    label: "Framework COPSOQ-inspired — Padrão (autoral)",
    descricao: "10 dimensões fundamentais baseadas no modelo Copenhagen Psychosocial Questionnaire adaptado.",
    fatores: [
      { codigo: "SOBRECARGA",       nome: "Excesso de demandas no trabalho (sobrecarga)", severidade: 4, justificativa: "Burnout, estresse crônico, afastamento prolongado", sugestao: "Burnout, estresse crônico, afastamento prolongado" },
      { codigo: "CONTROLE",         nome: "Baixo controle no trabalho / Falta de autonomia", severidade: 3, justificativa: "Estresse crônico, desmotivação, queda de engajamento", sugestao: "Estresse crônico, desmotivação, queda de engajamento" },
      { codigo: "SUPORTE",          nome: "Falta de suporte/apoio no trabalho",        severidade: 4, justificativa: "Desamparo da liderança e colegas diante de demandas críticas", sugestao: "Desamparo da liderança e colegas diante de demandas críticas" },
      { codigo: "RELACIONAMENTOS",  nome: "Maus relacionamentos no local de trabalho", severidade: 4, justificativa: "Clima tóxico, atritos frequentes entre pares e lideranças", sugestao: "Clima tóxico, atritos frequentes entre pares e lideranças" },
      { codigo: "RECOMPENSAS",      nome: "Baixas recompensas e reconhecimento",       severidade: 2, justificativa: "Insatisfação, turnover, baixa retenção de talentos", sugestao: "Insatisfação, turnover, baixa retenção de talentos" },
      { codigo: "CLAREZA_PAPEL",    nome: "Baixa clareza de papel/função",             severidade: 3, justificativa: "Ambiguidade de papéis, retrabalho, conflitos interpessoais", sugestao: "Ambiguidade de papéis, retrabalho, conflitos interpessoais" },
      { codigo: "JUSTICA",          nome: "Baixa justiça organizacional",              severidade: 4, justificativa: "Percepção de injustiça procedimental, desengajamento e litígios", sugestao: "Percepção de injustiça procedimental, desengajamento e litígios" },
      { codigo: "MUDANCA_ORG",      nome: "Má gestão de mudanças organizacionais",     severidade: 4, justificativa: "Insegurança quanto ao futuro, ansiedade coletiva", sugestao: "Insegurança quanto ao futuro, ansiedade coletiva" },
      { codigo: "WORK_CONTENT",     nome: "Conteúdo do Trabalho e Exigências Emocionais", severidade: 3, justificativa: "Exaustão emocional decorrente do contato com público/tarefas críticas", sugestao: "Exaustão emocional decorrente do contato com público/tarefas críticas" },
      { codigo: "WORK_LIFE",        nome: "Interface Trabalho-Vida",                   severidade: 3, justificativa: "Conflito família-trabalho, fadiga acumulada e perda de recuperação", sugestao: "Conflito família-trabalho, fadiga acumulada e perda de recuperação" },
    ]
  },
  hse: {
    label: "Framework HSE-inspired — Padrão (autoral)",
    descricao: "6 padrões de gerenciamento do Health and Safety Executive britânico.",
    fatores: [
      { codigo: "SOBRECARGA",       nome: "Demandas (Excesso de carga e ritmo)",       severidade: 4, justificativa: "Burnout, estresse crônico, risco cardiovascular", sugestao: "Burnout, estresse crônico, risco cardiovascular" },
      { codigo: "CONTROLE",         nome: "Controle (Autonomia e participação)",       severidade: 3, justificativa: "Sensação de impotência e desmotivação funcional", sugestao: "Sensação de impotência e desmotivação funcional" },
      { codigo: "SUPORTE",          nome: "Apoio (Suporte de gestores e colegas)",     severidade: 4, justificativa: "Isolamento profissional diante de sobrecargas operacionais", sugestao: "Isolamento profissional diante de sobrecargas operacionais" },
      { codigo: "RELACIONAMENTOS",  nome: "Relacionamentos (Conflitos e condutas inaceitáveis)", severidade: 4, justificativa: "Desgaste interpessoal e deterioração do clima de equipe", sugestao: "Desgaste interpessoal e deterioração do clima de equipe" },
      { codigo: "CLAREZA_PAPEL",    nome: "Papel (Compreensão da função e responsabilidades)", severidade: 3, justificativa: "Conflito de atribuições e insegurança operacional", sugestao: "Conflito de atribuições e insegurança operacional" },
      { codigo: "MUDANCA_ORG",      nome: "Mudança (Gestão e comunicação de transições)", severidade: 4, justificativa: "Incerteza, resistência e estresse adaptativo", sugestao: "Incerteza, resistência e estresse adaptativo" },
    ]
  },
  mte: {
    label: "MTE Psicossociais — Padrão NR-01 (15 Fatores)",
    descricao: "15 fatores completos estabelecidos pelo Guia de Fatores Psicossociais do MTE e NR-01.",
    fatores: [
      { codigo: "ASSEDIO",          nome: "Assédio moral / sexual de qualquer natureza", severidade: 5, justificativa: "Risco jurídico, dano psíquico grave, passivo trabalhista", sugestao: "Risco jurídico, dano psíquico grave, passivo trabalhista" },
      { codigo: "SOBRECARGA",       nome: "Excesso de demandas no trabalho (sobrecarga)", severidade: 4, justificativa: "Burnout, afastamento prolongado, estresse crônico", sugestao: "Burnout, afastamento prolongado, estresse crônico" },
      { codigo: "CONTROLE",         nome: "Baixo controle no trabalho / Falta de autonomia", severidade: 3, justificativa: "Estresse crônico, queda de engajamento, desmotivação", sugestao: "Estresse crônico, queda de engajamento, desmotivação" },
      { codigo: "RECOMPENSAS",      nome: "Baixas recompensas e reconhecimento",       severidade: 2, justificativa: "Insatisfação, turnover, baixa retenção de talentos", sugestao: "Insatisfação, turnover, baixa retenção de talentos" },
      { codigo: "WORK_LIFE",        nome: "Interface trabalho-vida",                   severidade: 3, justificativa: "Conflito família-trabalho, fadiga e desequilíbrio", sugestao: "Conflito família-trabalho, fadiga e desequilíbrio" },
      { codigo: "CLAREZA_PAPEL",    nome: "Baixa clareza de papel/função",             severidade: 3, justificativa: "Ambiguidade de papéis, retrabalho, conflitos interpessoais", sugestao: "Ambiguidade de papéis, retrabalho, conflitos interpessoais" },
      { codigo: "COMUNICACAO",      nome: "Trabalho em condições de difícil comunicação", severidade: 3, justificativa: "Isolamento de equipes, ruídos de comunicação interna", sugestao: "Isolamento de equipes, ruídos de comunicação interna" },
      { codigo: "ISOLAMENTO",       nome: "Trabalho remoto e isolado",                 severidade: 3, justificativa: "Sensação de isolamento social e perda de pertencimento", sugestao: "Sensação de isolamento social e perda de pertencimento" },
      { codigo: "JUSTICA",          nome: "Baixa justiça organizacional",              severidade: 4, justificativa: "Percepção de injustiça procedimental, desengajamento e litígios", sugestao: "Percepção de injustiça procedimental, desengajamento e litígios" },
      { codigo: "MUDANCA_ORG",      nome: "Má gestão de mudanças organizacionais",     severidade: 4, justificativa: "Insegurança quanto ao futuro, resistência e ansiedade coletiva", sugestao: "Insegurança quanto ao futuro, resistência e ansiedade coletiva" },
      { codigo: "RELACIONAMENTOS",  nome: "Maus relacionamentos no local de trabalho", severidade: 4, justificativa: "Clima tóxico, atritos frequentes entre pares e lideranças", sugestao: "Clima tóxico, atritos frequentes entre pares e lideranças" },
      { codigo: "SUBCARGA",         nome: "Baixa demanda no trabalho (subcarga)",      severidade: 2, justificativa: "Tédio laboral, subutilização de capacidades (boreout)", sugestao: "Tédio laboral, subutilização de capacidades (boreout)" },
      { codigo: "SUPORTE",          nome: "Falta de suporte/apoio no trabalho",        severidade: 4, justificativa: "Desamparo da liderança e colegas diante de demandas críticas", sugestao: "Desamparo da liderança e colegas diante de demandas críticas" },
      { codigo: "VIOLENCIA_TRAUMA", nome: "Eventos violentos ou traumáticos",          severidade: 5, justificativa: "Estresse pós-traumático (TEPT), incidentes graves de segurança", sugestao: "Estresse pós-traumático (TEPT), incidentes graves de segurança" },
      { codigo: "INSEGURANCA",      nome: "Insegurança no emprego e instabilidade",    severidade: 3, justificativa: "Insegurança financeira percebida, ansiedade crônica", sugestao: "Insegurança financeira percebida, ansiedade crônica" },
    ]
  },
};

// Mock: versões de matrizes por cliente
const MATRIZES_VERSOES = {
  loghaus: [
    {
      versao: "v1.0",
      status: "publicada",
      criadaEm: "23/06/2026",
      publicadaEm: "23/06/2026",
      campanhas: 2,
      framework: "copsoq",
      criteriosPgr: "Matriz 5×5 padrão NR-01 / GRO. Cruzamento da Probabilidade de ocorrência (P1 a P5) apurada no diagnóstico COPSOQ com a Severidade do dano potencial (S1 a S5). Classificação em 5 faixas com priorização de medidas preventivas e corretivas."
    },
    {
      versao: "v2.0",
      status: "rascunho",
      criadaEm: "13/07/2026",
      publicadaEm: null,
      campanhas: 0,
      framework: "copsoq",
      criteriosPgr: "Critérios calibrados para o Grau de Risco CNAE 3 (Confecção e Vestuário) considerando histórico de afastamentos por DORT e estresse ocupacional."
    },
  ],
  vitamed: [
    {
      versao: "v1.0",
      status: "publicada",
      criadaEm: "15/01/2026",
      publicadaEm: "15/01/2026",
      campanhas: 1,
      framework: "mte",
      criteriosPgr: "Matriz 5×5 com 15 Fatores MTE/NR-01 adaptada ao setor hospitalar/saúde privada com foco em plantões e suporte psicossocial."
    },
  ],
  agrocorp: [
    {
      versao: "v1.0",
      status: "rascunho",
      criadaEm: "10/08/2026",
      publicadaEm: null,
      campanhas: 0,
      framework: "mte",
      criteriosPgr: "Configuração inicial para operações agroindustriais e unidades de campo."
    },
  ],
};

// Função para calcular o resultado da matriz P×S
const calcularResultadoMatriz = (probabilidade, severidade) => {
  const p = Math.max(1, Math.min(5, Math.round(probabilidade)));
  const s = Math.max(1, Math.min(5, Math.round(severidade)));
  const chave = `P${p}-S${s}`;
  return MATRIZ_CLASSIFICACOES[chave] || "moderado";
};

// ════════════════════════════════════════════════════════════
// FRENTE 3 — CANAL DE DENÚNCIAS
// ════════════════════════════════════════════════════════════

const TIPOS_DENUNCIA = [
  { id: "assedio_moral",  nome: "Assédio Moral",     icone: "shield",   cor: "#E5484D" },
  { id: "assedio_sexual", nome: "Assédio Sexual",    icone: "shield",   cor: "#DC2626" },
  { id: "fraude",         nome: "Fraude",            icone: "file",     cor: "#F0A800" },
  { id: "corrupcao",     nome: "Corrupção",         icone: "lock",     cor: "#F66B0A" },
  { id: "discriminacao", nome: "Discriminação",     icone: "users",    cor: "#7C3AED" },
  { id: "conflito",      nome: "Conflito de Interesses", icone: "flag", cor: "#2A6FDB" },
  { id: "seguranca",     nome: "Riscos à Segurança", icone: "shield",  cor: "#0D9488" },
  { id: "sugestao",      nome: "Sugestão de Melhoria", icone: "spark", cor: "#22c55e" },
  { id: "outros",        nome: "Outros",             icone: "more",    cor: "#5C667C" },
];

const DENUNCIA_STATUS = {
  triagem:       { label: "Em Triagem",      cor: "#2A6FDB", icone: "search" },
  investigacao:  { label: "Em Investigação", cor: "#F0A800", icone: "eye" },
  concluido:     { label: "Concluído",       cor: "#22c55e", icone: "check" },
  arquivado:     { label: "Arquivado",       cor: "#5C667C", icone: "file" },
};

const DENUNCIA_GRAVIDADE = {
  baixa:  { label: "Baixa",  cor: "#4ade80" },
  media:  { label: "Média",  cor: "#F0A800" },
  alta:   { label: "Alta",   cor: "#E5484D" },
};

// Mock: denúncias registradas
const DENUNCIAS_MOCK = [
  {
    id: "den-001", protocolo: "DEN-2026-0001",
    clienteId: "loghaus", data: "2026-06-15T09:23:00",
    status: "investigacao", gravidade: "alta",
    tipoId: "assedio_moral", natureza: "Assédio Moral",
    anonimo: true, denunciante: null,
    area: "Operações — Separação de Pedidos",
    relato: "Há relatos recorrentes de que o supervisor do turno noturno utiliza tom agressivo, faz cobranças desrespeitosas em público e ameaça colaboradores com transferência ou demissão quando não atingem as metas diárias. Três colaboradores diferentes já relataram situações semelhantes nos últimos 2 meses.",
    evidencias: ["Registro de reclamação ao RH em 02/06/2026", "Ata de reunião CIPA mencionando queixas"],
    admissibilidade: "Elementos mínimos de autoria e materialidade identificados. Múltiplos relatos convergentes.",
    prazoFinal: "2026-07-15",
    parecer: null,
    resultado: null,
    recomendacoes: null,
    andamentos: [
      { data: "2026-06-15T09:23:00", etapa: "Recebimento", descricao: "Denúncia registrada via portal anônimo.", responsavel: "Sistema" },
      { data: "2026-06-16T14:00:00", etapa: "Triagem", descricao: "Caso classificado como gravidade alta. Encaminhado para investigação.", responsavel: "Ana Paula (Compliance)" },
      { data: "2026-06-20T10:30:00", etapa: "Investigação", descricao: "Iniciada coleta de depoimentos com colaboradores da área.", responsavel: "Ana Paula (Compliance)" },
    ],
    mensagens: [
      { data: "2026-06-18T11:00:00", remetente: "compliance", texto: "Agradecemos seu relato. Estamos apurando os fatos com total sigilo. Você poderia informar aproximadamente há quanto tempo essas situações ocorrem?" },
      { data: "2026-06-19T08:45:00", remetente: "denunciante", texto: "Acontece há cerca de 3 meses, desde que o novo supervisor assumiu o turno." },
    ],
    auditLog: [
      { data: "2026-06-15T09:23:00", acao: "Denúncia criada", usuario: "Sistema" },
      { data: "2026-06-16T14:00:00", acao: "Status alterado para Em Investigação", usuario: "Ana Paula" },
      { data: "2026-06-18T11:00:00", acao: "Mensagem enviada ao denunciante", usuario: "Ana Paula" },
      { data: "2026-06-20T10:30:00", acao: "Andamento registrado", usuario: "Ana Paula" },
    ],
  },
  {
    id: "den-002", protocolo: "DEN-2026-0002",
    clienteId: "loghaus", data: "2026-07-01T14:10:00",
    status: "triagem", gravidade: "media",
    tipoId: "sugestao", natureza: "Sugestão de Melhoria",
    anonimo: false, denunciante: "Roberto Silva",
    area: "Administrativo",
    relato: "Sugiro que a empresa implemente um programa de rodízio de atividades para os setores operacionais. Vários colegas já manifestaram cansaço e desmotivação pela repetição constante das mesmas tarefas. Acredito que isso melhoraria o bem-estar e a produtividade.",
    evidencias: [],
    admissibilidade: null,
    prazoFinal: "2026-08-01",
    parecer: null, resultado: null, recomendacoes: null,
    andamentos: [
      { data: "2026-07-01T14:10:00", etapa: "Recebimento", descricao: "Sugestão registrada via portal.", responsavel: "Sistema" },
    ],
    mensagens: [],
    auditLog: [
      { data: "2026-07-01T14:10:00", acao: "Sugestão criada", usuario: "Sistema" },
    ],
  },
  {
    id: "den-003", protocolo: "DEN-2026-0003",
    clienteId: "vitamed", data: "2026-05-20T16:45:00",
    status: "concluido", gravidade: "media",
    tipoId: "conflito", natureza: "Conflito de Interesses",
    anonimo: true, denunciante: null,
    area: "Compras",
    relato: "Identificada situação em que o responsável pelo setor de compras possui vínculo familiar com fornecedor habitual da empresa. As cotações parecem sempre favorecer esse fornecedor mesmo quando há opções mais econômicas disponíveis.",
    evidencias: ["Planilha comparativa de cotações dos últimos 6 meses"],
    admissibilidade: "Elementos suficientes para investigação. Documentação comprobatória anexada.",
    prazoFinal: "2026-06-20",
    parecer: "Após investigação, confirmou-se que o colaborador possuía parentesco com sócio do fornecedor, configurando conflito de interesses. Foram identificados 4 processos de compra com sobrepreço estimado de 15%.",
    resultado: "procedente",
    recomendacoes: "1. Substituição do responsável nas cotações envolvendo o fornecedor. 2. Revisão da política de conflito de interesses. 3. Treinamento de ética para o setor.",
    andamentos: [
      { data: "2026-05-20T16:45:00", etapa: "Recebimento", descricao: "Denúncia registrada.", responsavel: "Sistema" },
      { data: "2026-05-21T09:00:00", etapa: "Triagem", descricao: "Classificação de gravidade média.", responsavel: "Ana Paula (Compliance)" },
      { data: "2026-05-25T10:00:00", etapa: "Investigação", descricao: "Análise das cotações e contratos.", responsavel: "Ana Paula (Compliance)" },
      { data: "2026-06-10T14:00:00", etapa: "Conclusão", descricao: "Parecer emitido. Denúncia procedente.", responsavel: "Ana Paula (Compliance)" },
    ],
    mensagens: [],
    auditLog: [
      { data: "2026-05-20T16:45:00", acao: "Denúncia criada", usuario: "Sistema" },
      { data: "2026-05-21T09:00:00", acao: "Status: Em Triagem → Em Investigação", usuario: "Ana Paula" },
      { data: "2026-06-10T14:00:00", acao: "Status: Em Investigação → Concluído", usuario: "Ana Paula" },
    ],
  },
  {
    id: "den-004", protocolo: "DEN-2026-0004",
    clienteId: "loghaus", data: "2026-08-05T08:30:00",
    status: "triagem", gravidade: "alta",
    tipoId: "assedio_sexual", natureza: "Assédio Sexual",
    anonimo: true, denunciante: null,
    area: "Logística — Centro de Distribuição",
    relato: "Colaboradora relata que vem recebendo mensagens inapropriadas de conteúdo sexual por parte de colega do mesmo setor, enviadas pelo aplicativo de mensagens pessoal. As mensagens são insistentes mesmo após pedido para parar. Situação causa desconforto e medo de represálias.",
    evidencias: ["Capturas de tela das mensagens (anonimizadas)"],
    admissibilidade: null,
    prazoFinal: "2026-08-20",
    parecer: null, resultado: null, recomendacoes: null,
    andamentos: [
      { data: "2026-08-05T08:30:00", etapa: "Recebimento", descricao: "Denúncia registrada via portal anônimo.", responsavel: "Sistema" },
    ],
    mensagens: [],
    auditLog: [
      { data: "2026-08-05T08:30:00", acao: "Denúncia criada", usuario: "Sistema" },
    ],
  },
];

// Governança mock
const GOVERNANCA_COMITES = [
  { id: "com-1", nome: "Comitê de Ética e Compliance", membros: ["Ana Paula Rios", "Mariana Aguiar", "Dr. Carlos Mendes"], clienteId: "loghaus" },
  { id: "com-2", nome: "Comitê de Integridade", membros: ["Roberto Lima", "Dra. Patrícia Souza"], clienteId: "vitamed" },
];

const GOVERNANCA_POLITICAS = [
  { id: "pol-1", titulo: "Política de Prevenção ao Assédio", versao: "2.0", dataPublicacao: "01/03/2026", clienteId: "loghaus" },
  { id: "pol-2", titulo: "Código de Ética e Conduta", versao: "3.1", dataPublicacao: "15/01/2026", clienteId: "loghaus" },
  { id: "pol-3", titulo: "Política de Conflito de Interesses", versao: "1.0", dataPublicacao: "20/02/2026", clienteId: "loghaus" },
  { id: "pol-4", titulo: "Protocolo de Acolhimento", versao: "1.0", dataPublicacao: "10/03/2026", clienteId: "vitamed" },
];

// ════════════════════════════════════════════════════════════
// EXPORTS — all globals
// ════════════════════════════════════════════════════════════

Object.assign(window, {
  CLIENTES, COPSOQ_DIMS, NR17_DIMS, DIAG_DIMS_MAP, DIAGNOSTICOS, AVALIACOES_ATIVAS, LEADS_PIPELINE, TRILHAS,
  ROADMAP_FASES, ROADMAP_ESTADO, CLIENTE_ETAPAS, ETAPAS_CLIENTE, ETAPAS_ESTADO_INICIAL,
  getDiagnosticoResultadoMock,
  // Frente 1 — Entrevistas
  ENTREVISTA_ESTRUTURAS, ENTREVISTA_FATORES, ENTREVISTA_MATURIDADE,
  CLASSIFICACAO_LABELS, CLASSIFICACAO_CORES, ENTREVISTAS_MOCK,
  criarParticipantesEntrevista, getEntrevistaParticipantes,
  agregarFatoresEntrevista, calcularProgressoEntrevista, calcularMaturidadeEntrevista,
  // Frente 2 — Matriz de Risco
  MATRIZ_CLASSIFICACOES, MATRIZ_NIVEIS, SEVERIDADE_NIVEIS, SEVERIDADE_FRAMEWORKS,
  MATRIZES_VERSOES, calcularResultadoMatriz,
  // Frente 3 — Canal de Denúncias
  TIPOS_DENUNCIA, DENUNCIA_STATUS, DENUNCIA_GRAVIDADE,
  DENUNCIAS_MOCK, GOVERNANCA_COMITES, GOVERNANCA_POLITICAS,
});
