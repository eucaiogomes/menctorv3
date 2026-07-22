/* global React, Icon, EMPRESA_FORM_STORAGE_KEY */
const { useState, useEffect, useMemo, useRef } = React;

// ════════════════════════════════════════════════════════════
// CADASTRO NOVO CLIENTE — wizard 7 etapas (com preview de proposta/contrato nas etapas 2 e 3)
// ════════════════════════════════════════════════════════════

const TOTAL_STEPS = 7;

const ETAPAS = [
  { n: 1, label: "Cadastro" },
  { n: 2, label: "Proposta" },
  { n: 3, label: "Contrato" },
  { n: 4, label: "Sensibilização" },
  { n: 5, label: "Diagnóstico" },
  { n: 6, label: "Relatórios" },
  { n: 7, label: "Apresentação" },
];

// Mantemos compatibilidade com o código antigo que ainda referencia STEPS em alguns lugares
const STEPS = ETAPAS;

const SEGMENTOS = [
  "Saúde","Logística","Agroindústria","Financeiro","Educação",
  "Tecnologia","Indústria","Comércio","Construção","Serviços","Outro"
];

const TIPO_PROJETO = [
  { id: "psicossocial", label: "Riscos Psicossociais", desc: "COPSOQ II — NR-1 §6.3", icon: "shield" },
  { id: "clima",        label: "Clima Organizacional", desc: "Engajamento e satisfação", icon: "users" },
  { id: "nr1",          label: "NR-01 Compliance",     desc: "GRO completo com PGR", icon: "file" },
  { id: "saude",        label: "Saúde Mental",         desc: "Burnout, ansiedade, DASS-21", icon: "pulse" },
];

const ROADMAP_TEMPLATES = [
  { id: "padrao",      label: "Padrão Menctor",       etapas: 8, semanas: 24, desc: "Metodologia completa" },
  { id: "nr1",         label: "NR-01 Acelerado",      etapas: 6, semanas: 16, desc: "Foco em conformidade" },
  { id: "psicossocial",label: "Psicossocial Completo", etapas: 8, semanas: 20, desc: "COPSOQ II + plano de ação" },
  { id: "custom",      label: "Personalizado",         etapas: null, semanas: null, desc: "Você define as etapas" },
];

const INDICADORES_POR_TIPO = {
  psicossocial: ["Score COPSOQ médio","Dimensões em risco","Adesão ao diagnóstico","Ações concluídas","Reincidência de risco"],
  clima:        ["NPS colaboradores","Índice de engajamento","Taxa de rotatividade","Satisfação por setor","Reconhecimento"],
  nr1:          ["Conformidade GRO","Riscos mapeados","Medidas implementadas","Auditorias aprovadas","PGR atualizado"],
  saude:        ["Score DASS-21","Burnout por setor","Absenteísmo","Afastamentos ativos","Ações de prevenção"],
};

const ETAPAS_TEMPLATE = {
  padrao: [
    "Reunião kickoff","Palestras de sensibilização","Identificar os processos","Base de informações",
    "Avaliar o diagnóstico","Elaborar plano de ação","Relatório ARP","Monitoramento contínuo"
  ],
  nr1: [
    "Kickoff e alinhamento","Mapeamento de processos","GRO — Identificação de riscos",
    "Elaboração do PGR","Treinamentos NR-1","Auditoria e conformidade"
  ],
  psicossocial: [
    "Kickoff","Sensibilização COPSOQ","Aplicação da avaliação","Análise de resultados",
    "Plano de ação 5W2H","Intervenções prioritárias","Relatório ARP","Reavaliação e monitoramento"
  ],
  custom: ["Etapa 1","Etapa 2","Etapa 3","Etapa 4"],
};

const INIT = {
  // 1 Empresa
  nome: "", razao: "", cnpj: "", segmento: "", porte: "", colaboradores: "", unidades: "1", site: "", cidade: "", estado: "",
  contatoNome: "", contatoCargo: "", contatoEmail: "", contatoWhats: "", contatoFone: "",
  temRH: null, temSST: null, temPsicologo: null, teveAvaliacoes: null, temPlanoAnterior: null,
  // 2 Estrutura
  setores: [],
  // 3 Diagnóstico
  tipoProjetoId: "psicossocial", templateId: "padrao",
  todosSetores: true, setoresEscolhidos: [],
  escopos: { entrevistas: false, reunioes: true, treinamentos: true, sensibilizacao: true, auditorias: false, monitoramento: true },
  // 4 Colaboradores
  importMetodo: "manual",
  anonimo: true, podeEditar: false, limiteResposta: true, exigeLgpd: true, exigeConsent: true,
  // 5 Avaliações
  dataInicio: "", dataLimite: "", lembretes: true, emailAuto: true, whatsAuto: false,
  // 6 Equipe
  credNome: "Caio Guedes", credEmail: "caio@menctor.com.br", credFuncao: "Consultor principal",
  equipe: [],
  // 7 Cronograma
  inicioProj: "", terminoPrev: "", kickoffDate: "", freq: "quinzenal",
  // 8 Aprendizado
  vincularTrilha: true, trilhaObrig: true, certificado: true,
  // 9 Roadmap
  gerarDashboard: true, gerarIndicadores: true, gerarPlanoAcao: true, gerarPDF: true, gerarRelatorios: true,
  // meta
  mrr: 4200,
  formToken: "",
  docToken: "",
};

const slugifyId = (str) => (str || "novo-cliente")
  .toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const pickCardColor = (name) => {
  const palette = ["#2F7D6F", "#5BAD72", "#D89A3F", "#4E83A8", "#8B5CF6", "#E07020", "#2E8B57"];
  let hash = 0;
  const s = name || "x";
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
};

const createClienteFromForm = (data) => {
  const name = data.nome || data.razao || "Novo Cliente";
  const idBase = slugifyId(name);
  const id = `${idBase}-${Date.now().toString(36).slice(-6)}`;
  const employees = parseInt(data.colaboradores || "0", 10) || 80;
  const mrr = Number(data.mrr) || 4200;
  const sector = data.segmento || "Serviços";
  const contact = data.contatoNome || data.contatoEmail || "Responsável";
  const color = pickCardColor(name);
  const next = (data.kickoffDate || data.inicioProj)
    ? `Kickoff ${data.kickoffDate || data.inicioProj}`
    : "Kickoff e sensibilização — agendar";
  return {
    id,
    name,
    cnpj: data.cnpj || "",
    contact,
    sector,
    employees,
    status: "ativo",
    mrr,
    lastDiag: "hoje",
    risk: 2.15,
    color,
    riskTrend: "stable",
    mainRisk: "Carga de trabalho",
    lastPulseDate: new Date().toLocaleDateString("pt-BR"),
    nextAction: next,
    healthScore: 74,
  };
};

const createInitialRoadmapEstado = () => ({
  faseAtual: 0,
  etapas: [
    [
      { status: "em_andamento", responsavel: "Caio Guedes", prazo: "15/07/2026" },
      { status: "pendente" }, { status: "pendente" }, { status: "pendente" },
      { status: "pendente" }, { status: "pendente" }, { status: "pendente" }, { status: "pendente" },
    ],
    Array.from({ length: 8 }, () => ({ status: "pendente" })),
    Array.from({ length: 8 }, () => ({ status: "pendente" })),
  ],
});

const NovoClienteFullPage = ({ onClose, initialData = {}, mode = "cliente", onProposalSent, onOpenRoadmap }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ ...INIT, ...initialData });
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formSubmission, setFormSubmission] = useState(null);
  const bodyRef = useRef(null);

  const upd = (k, v) => setData(d => ({ ...d, [k]: v }));
  const updEscopo = (k, v) => setData(d => ({ ...d, escopos: { ...d.escopos, [k]: v } }));

  useEffect(() => {
    if (!data.docToken) upd("docToken", `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`);
  }, []);

  // Sync cadastro18 -> top level fields (used by previews, createCliente, live cards)
  useEffect(() => {
    const f = data.cadastro18 || {};
    const updates = {};
    if (f.razaoSocial) {
      if (data.razao !== f.razaoSocial) updates.razao = f.razaoSocial;
      if (data.nome !== f.razaoSocial) updates.nome = f.razaoSocial;
    }
    if (f.cnpj && data.cnpj !== f.cnpj) updates.cnpj = f.cnpj;
    if (f.responsavel && data.contatoNome !== f.responsavel) updates.contatoNome = f.responsavel;
    if (f.segmento && data.segmento !== f.segmento) updates.segmento = f.segmento;
    if (f.unidades && data.unidades !== f.unidades) updates.unidades = f.unidades;

    // compute total colaboradores from areas + terceirizados
    const areas = ["administrativo", "operacional", "vendas", "producao", "atendimento", "qualidade"];
    const total = areas.reduce((s, a) => s + (parseInt(f[a] || "0", 10) || 0), 0) +
                  (parseInt(f.terceirizados || "0", 10) || 0);
    const targetColab = total > 0 ? String(total) : data.colaboradores;
    if (targetColab && data.colaboradores !== targetColab) updates.colaboradores = targetColab;

    if (Object.keys(updates).length > 0) {
      setData(d => ({ ...d, ...updates }));
    }
  }, [data.cadastro18]);

  // Preenchimento em tempo real: assim que o cliente envia o formulário,
  // TODAS as 18 perguntas são importadas automaticamente para o Cadastro (data.cadastro18).
  useEffect(() => {
    if (!data.formToken) return;
    let imported = false;
    const check = () => {
      if (imported) return;
      try {
        const raw = window.localStorage.getItem(EMPRESA_FORM_STORAGE_KEY(data.formToken));
        if (raw) {
          const payload = JSON.parse(raw);
          imported = true;

          setData(d => {
            const current18 = d.cadastro18 || {};
            // Preenchimento automático completo das 18 perguntas + sync de campos top-level
            const new18 = {
              ...current18,
              ...payload,
              // normaliza campos principais
              razaoSocial: payload.razaoSocial || payload.razao || payload.nome || current18.razaoSocial,
              responsavel: payload.responsavel || payload.contatoNome || current18.responsavel,
            };
            const topUpdates = {};
            if (new18.razaoSocial) { topUpdates.razao = new18.razaoSocial; topUpdates.nome = new18.razaoSocial; }
            if (payload.cnpj) topUpdates.cnpj = payload.cnpj;
            if (new18.responsavel) topUpdates.contatoNome = new18.responsavel;
            if (payload.segmento) topUpdates.segmento = payload.segmento;
            if (payload.unidades) topUpdates.unidades = payload.unidades;

            return { ...d, ...topUpdates, cadastro18: new18 };
          });

          setFormSubmission(payload);
          setTimeout(() => setFormSubmission(null), 6000);
        }
      } catch (err) { /* ignore */ }
    };
    check();
    const interval = setInterval(check, 1500);
    window.addEventListener("storage", check);
    return () => { clearInterval(interval); window.removeEventListener("storage", check); };
  }, [data.formToken]);

  const importFormData = () => setFormSubmission(null);

  const goNext = () => { setStep(s => Math.min(s + 1, TOTAL_STEPS)); if (bodyRef.current) bodyRef.current.scrollTop = 0; };
  const goPrev = () => { setStep(s => Math.max(s - 1, 1)); if (bodyRef.current) bodyRef.current.scrollTop = 0; };

  const template = ROADMAP_TEMPLATES.find(t => t.id === data.templateId) || ROADMAP_TEMPLATES[0];
  const etapasGeradas = ETAPAS_TEMPLATE[data.templateId] || ETAPAS_TEMPLATE.padrao;
  const indicadores = INDICADORES_POR_TIPO[data.tipoProjetoId] || INDICADORES_POR_TIPO.psicossocial;
  const nomeEmpresa = data.nome || data.razao || "sua empresa";

  const handleGerar = () => {
    setGenerating(true);

    let newId = null;
    // Apenas quando o fluxo é "novo cliente" (não proposta em pipeline), adicionamos ao portfólio real
    if (mode === "cliente" || !mode) {
      const newCliente = createClienteFromForm(data);
      if (typeof window !== "undefined") {
        if (!window.CLIENTES) window.CLIENTES = [];
        if (!window.CLIENTES.some(c => c.id === newCliente.id)) {
          window.CLIENTES.push(newCliente);
        }
        if (!window.ROADMAP_ESTADO) window.ROADMAP_ESTADO = {};
        if (!window.ROADMAP_ESTADO[newCliente.id]) {
          window.ROADMAP_ESTADO[newCliente.id] = createInitialRoadmapEstado();
        }
      }
      newId = newCliente.id;
    }
    setCreatedId(newId);

    setTimeout(() => { setGenerating(false); setDone(true); }, 2200);
  };

  if (done) return <SuccessScreen data={data} etapas={etapasGeradas} template={template} indicadores={indicadores} onClose={onClose} createdId={createdId} onOpenRoadmap={onOpenRoadmap} />;

  const stepInfo = STEPS[step - 1];
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  const isDocPreviewStep = step === 2 || step === 3;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <div style={{
        padding: "0 36px", borderBottom: "1px solid var(--line)",
        background: "var(--bg)", position: "sticky", top: 0, zIndex: 20,
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 10px" }}>
          <button onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--ink-muted)", fontSize: 13 }}>
            <Icon name="chevron-left" size={14} /> Voltar para clientes
          </button>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
            <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>Etapa {step} de {TOTAL_STEPS} — </span>
            {stepInfo.label}
          </div>
          <button onClick={onClose} style={{ fontSize: 12.5, color: "var(--ink-muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="file" size={13} /> Salvar rascunho
          </button>
        </div>

        {/* Stepper dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, paddingBottom: 0, overflowX: "auto" }}>
          {STEPS.map((s, i) => {
            const done = s.n < step;
            const active = s.n === step;
            return (
              <React.Fragment key={s.n}>
                <button
                  onClick={() => s.n < step && setStep(s.n)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    padding: "6px 8px", borderRadius: 8,
                    cursor: s.n < step ? "pointer" : "default",
                    minWidth: 60,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 999,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700,
                    background: done ? "var(--health)" : active ? "var(--ink)" : "var(--canvas-warm)",
                    border: done || active ? "none" : "1.5px solid var(--line-strong)",
                    color: done || active ? "#fff" : "var(--ink-muted)",
                    transition: "all .2s",
                  }}>
                    {done ? <Icon name="check" size={10} color="#fff" strokeWidth={2.5} /> : s.n}
                  </div>
                  <span style={{ fontSize: 10, color: active ? "var(--ink)" : "var(--ink-muted)", fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, minWidth: 8, background: s.n < step ? "var(--health)" : "var(--line)", borderRadius: 99, marginBottom: 16, transition: "background .3s" }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "var(--line)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--health)", transition: "width .4s ease", borderRadius: "0 99px 99px 0" }} />
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

        {/* LEFT — form */}
        <div ref={bodyRef} style={{ flex: isDocPreviewStep ? "0 0 48%" : "0 0 55%", overflowY: "auto", padding: "40px 48px 120px" }}>
          <StepHeading
            step={step} data={data} nomeEmpresa={nomeEmpresa}
            onSendForm={step === 1 ? () => setShowFormModal(true) : null}
            formSubmission={step === 1 ? formSubmission : null}
            onImportForm={importFormData}
          />

          {/* 7 Etapas - Nova estrutura */}
          {step === 1 && <Cadastro18Step data={data} upd={upd} />}
          {step === 2 && <PropostaStep data={data} upd={upd} />}
          {step === 3 && <ContratoStep data={data} upd={upd} />}
          {step === 4 && <SensibilizacaoStep data={data} upd={upd} />}
          {step === 5 && <DiagnosticoStep data={data} upd={upd} />}
          {step === 6 && <RelatoriosStep data={data} upd={upd} />}
          {step === 7 && <ApresentacaoStep data={data} upd={upd} onFinish={handleGerar} generating={generating} />}
        </div>

        {/* DIVIDER */}
        <div style={{ width: 1, background: "var(--line)", flexShrink: 0 }} />

        {/* RIGHT — Preview da Proposta/Contrato (etapas 2 e 3) ou vazio nas demais */}
        <div style={{ flex: 1, overflowY: "auto", background: "var(--canvas-warm)", padding: isDocPreviewStep ? "28px 24px 40px" : "40px 36px 80px", display: "flex", flexDirection: "column", gap: 12 }}>
          {step === 2 && (
            <>
              <div>
                <div className="eyebrow">Documento ao vivo</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>Preview da Proposta</div>
              </div>
              <PropostaLiveCard data={data} template={template} pct={Math.min(100, Math.round(((step + 4) / 10) * 100))} />
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.4 }}>
                Use os botões abaixo do preview para abrir ou copiar o link e enviar ao cliente.
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <div className="eyebrow">Documento ao vivo</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>Preview do Contrato</div>
              </div>
              <ContratoLiveCard data={data} template={template} pct={Math.min(100, Math.round(((step + 3) / 10) * 100) + 10)} />
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.4 }}>
                O preview reflete os dados preenchidos. Copie o link para assinatura do cliente.
              </div>
            </>
          )}

          {!isDocPreviewStep && (
            <div style={{ opacity: 0.6, paddingTop: 120, fontSize: 12, color: "var(--ink-muted)", textAlign: "center" }}>
              {/* Espaço vazio nas demais etapas, conforme solicitado */}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="frosted" style={{
        position: "sticky", bottom: 0, padding: "14px 48px",
        borderTop: "var(--hairline)",
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 20
      }}>
        <button onClick={step > 1 ? goPrev : onClose} className="btn btn-ghost" style={{ height: 40 }}>
          <Icon name="chevron-left" size={14} /> {step > 1 ? "Voltar" : "Cancelar"}
        </button>
        <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
          {nomeEmpresa !== "sua empresa" && <><strong style={{ color: "var(--ink)" }}>{nomeEmpresa}</strong> · </>}
          {template.label} · {template.semanas ? `${template.semanas} semanas` : "personalizado"}
        </div>
        {step < TOTAL_STEPS
          ? <button onClick={goNext} className="btn btn-primary" style={{ height: 40, padding: "0 24px" }}>
              Continuar <Icon name="arrow-right" size={14} />
            </button>
          : <button onClick={handleGerar} disabled={generating} className="btn btn-accent" style={{ height: 40, padding: "0 24px", opacity: generating ? 0.8 : 1 }}>
              {generating ? <><Icon name="spark" size={14} /> Gerando…</> : "Finalizar"}
            </button>
        }
      </div>

      {showFormModal && (
        <SendFormModal
          data={data}
          upd={upd}
          onClose={() => setShowFormModal(false)}
        />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// ENVIAR FORMULÁRIO — gera link público para o cliente preencher
// ════════════════════════════════════════════════════════════
const SendFormModal = ({ data, upd, onClose }) => {
  const [copied, setCopied] = useState(false);
  const token = useRef(data.formToken || `f${Date.now().toString(36)}`).current;

  useEffect(() => {
    if (!data.formToken) upd("formToken", token);
  }, []);

  const link = `${window.location.origin}${window.location.pathname}?empresa-form=${token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { /* clipboard indisponível */ }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fade-in 200ms ease-out" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "32px 36px", width: "100%", maxWidth: 480, boxShadow: "var(--shadow-modal)", animation: "sheet-in 320ms var(--ease-spring)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20 }}>Enviar formulário</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 3 }}>O cliente preenche <strong>todas as 18 perguntas do cadastro</strong> sem login. Os dados são preenchidos automaticamente aqui.</div>
          </div>
          <button onClick={onClose} style={{ color: "var(--ink-muted)", padding: 4, borderRadius: 8 }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input readOnly value={link} onFocus={e => e.target.select()} style={{ flex: 1, height: 42, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, background: "var(--surface)", color: "var(--ink)" }} />
          <button onClick={copyLink} className="btn btn-primary" style={{ height: 42, padding: "0 18px" }}>
            <Icon name={copied ? "check" : "copy"} size={14} /> {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP HEADINGS
// ════════════════════════════════════════════════════════════
const STEP_COPY = [
  { title: "Complete o cadastro da empresa.", sub: "Preencha os dados completos da organização e do responsável pela implantação." },
  { title: "Envie a proposta comercial.", sub: "Gere o documento e encaminhe o link da proposta para o cliente." },
  { title: "Formalize o contrato.", sub: "Gere e envie o contrato de prestação de serviços para assinatura." },
  { title: "Configure a sensibilização.", sub: "Selecione palestras, treinamentos e trilhas para os colaboradores." },
  { title: "Defina o diagnóstico.", sub: "Escolha os instrumentos de avaliação que serão aplicados." },
  { title: "Relatórios.", sub: "Será liberada após a etapa de Diagnóstico." },
  { title: "Agende a apresentação.", sub: "Marque a data da reunião de discussão do plano de ação." },
];

const StepHeading = ({ step, nomeEmpresa, onSendForm, formSubmission, onImportForm }) => {
  const copy = STEP_COPY[step - 1];
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Etapa {step} de {TOTAL_STEPS}</div>
          <h1 className="display" style={{ fontSize: 36, margin: 0, lineHeight: 1.08 }}>{copy.title}</h1>
        </div>
        {onSendForm && (
          <button onClick={onSendForm} className="btn btn-ghost" style={{ height: 38, padding: "0 16px", flexShrink: 0 }}>
            <Icon name="send" size={13} /> Enviar formulário
          </button>
        )}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 14.5, color: "var(--ink-muted)", lineHeight: 1.55 }}>{copy.sub}</p>

      {formSubmission && (
        <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="check" size={16} color="var(--health-deep)" />
          <div style={{ flex: 1, fontSize: 13, color: "var(--ink)" }}>
            <strong>{formSubmission.nome || formSubmission.razao || formSubmission.razaoSocial || "O cliente"}</strong> enviou o <strong>cadastro completo (18 perguntas)</strong> — os campos foram preenchidos automaticamente.
          </div>
          <button onClick={onImportForm} className="btn btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 12.5 }}>
            OK
          </button>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 1 — EMPRESA
// ════════════════════════════════════════════════════════════
const Step1Empresa = ({ data, upd }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <SectionLabel>Dados da empresa</SectionLabel>
    <FRow>
      <Field label="CNPJ" width={2}>
        <FInput value={data.cnpj} onChange={v => upd("cnpj", v)} placeholder="00.000.000/0000-00" />
      </Field>
      <Field label=" " width={1}>
        <button className="btn btn-soft" style={{ height: 42, width: "100%", justifyContent: "center", marginTop: 1 }}>
          <Icon name="search" size={13} /> Buscar
        </button>
      </Field>
    </FRow>
    <FRow>
      <Field label="Razão social">
        <FInput value={data.razao} onChange={v => upd("razao", v)} placeholder="Logística Haus LTDA" />
      </Field>
      <Field label="Nome fantasia">
        <FInput value={data.nome} onChange={v => upd("nome", v)} placeholder="Loghaus" />
      </Field>
    </FRow>
    <FRow>
      <Field label="Segmento" width={2}>
        <FSelect value={data.segmento} onChange={v => upd("segmento", v)} options={SEGMENTOS} placeholder="Selecione" />
      </Field>
      <Field label="Porte" width={1}>
        <FSelect value={data.porte} onChange={v => upd("porte", v)} options={["Pequena","Média","Grande"]} placeholder="Porte" />
      </Field>
    </FRow>
    <FRow>
      <Field label="Colaboradores">
        <FInput value={data.colaboradores} onChange={v => upd("colaboradores", v)} placeholder="340" type="number" />
      </Field>
      <Field label="Unidades">
        <FInput value={data.unidades} onChange={v => upd("unidades", v)} placeholder="1" type="number" />
      </Field>
      <Field label="Site" hint="Opcional">
        <FInput value={data.site} onChange={v => upd("site", v)} placeholder="https://empresa.com.br" />
      </Field>
    </FRow>
    <FRow>
      <Field label="Cidade" width={2}>
        <FInput value={data.cidade} onChange={v => upd("cidade", v)} placeholder="São Paulo" />
      </Field>
      <Field label="Estado" width={1}>
        <FInput value={data.estado} onChange={v => upd("estado", v)} placeholder="SP" />
      </Field>
    </FRow>

    <SectionLabel style={{ marginTop: 8 }}>Contato principal</SectionLabel>
    <FRow>
      <Field label="Nome">
        <FInput value={data.contatoNome} onChange={v => upd("contatoNome", v)} placeholder="Mariana Aguiar" />
      </Field>
      <Field label="Cargo">
        <FInput value={data.contatoCargo} onChange={v => upd("contatoCargo", v)} placeholder="Gerente de RH" />
      </Field>
    </FRow>
    <Field label="E-mail corporativo">
      <FInput value={data.contatoEmail} onChange={v => upd("contatoEmail", v)} placeholder="mariana@empresa.com.br" type="email" />
    </Field>
    <FRow>
      <Field label="WhatsApp">
        <FInput value={data.contatoWhats} onChange={v => upd("contatoWhats", v)} placeholder="(11) 99999-9999" />
      </Field>
      <Field label="Telefone">
        <FInput value={data.contatoFone} onChange={v => upd("contatoFone", v)} placeholder="(11) 3333-4444" />
      </Field>
    </FRow>

    <SectionLabel style={{ marginTop: 8 }}>Contexto interno</SectionLabel>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {[
        ["temRH",           "Possui área de RH?"],
        ["temSST",          "Possui SST ativo?"],
        ["temPsicologo",    "Tem psicólogo organizacional?"],
        ["teveAvaliacoes",  "Já realizou avaliações psicossociais?"],
        ["temPlanoAnterior","Tem plano de ação anterior?"],
      ].map(([k, label]) => (
        <YesNoCard key={k} label={label} value={data[k]} onChange={v => upd(k, v)} />
      ))}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// STEP 2 — ESTRUTURA ORGANIZACIONAL
// ════════════════════════════════════════════════════════════
const Step2Estrutura = ({ data, upd }) => {
  const [novoNome, setNovoNome] = useState("");
  const addSetor = () => {
    if (!novoNome.trim()) return;
    upd("setores", [...data.setores, { id: Date.now(), nome: novoNome.trim(), colab: "", responsavel: "", turno: "Comercial", criticidade: "media", obs: "" }]);
    setNovoNome("");
  };
  const updSetor = (id, k, v) => upd("setores", data.setores.map(s => s.id === id ? { ...s, [k]: v } : s));
  const removeSetor = (id) => upd("setores", data.setores.filter(s => s.id !== id));

  const SUGERIDOS = ["Produção","RH","Financeiro","Comercial","Administrativo","Operações","TI","Logística"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionLabel>Setores da organização</SectionLabel>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SUGERIDOS.map(s => {
          const exists = data.setores.some(x => x.nome === s);
          return (
            <button key={s} onClick={() => !exists && upd("setores", [...data.setores, { id: Date.now() + Math.random(), nome: s, colab: "", responsavel: "", turno: "Comercial", criticidade: "media", obs: "" }])}
              style={{
                padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                background: exists ? "var(--surface-sage)" : "var(--surface)",
                color: exists ? "var(--health-deep)" : "var(--ink-muted)",
                border: exists ? "1px solid var(--health-soft)" : "1px solid var(--line)",
                cursor: exists ? "default" : "pointer",
              }}>
              {exists ? <><Icon name="check" size={11} color="var(--health-deep)" /> {s}</> : `+ ${s}`}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <FInput value={novoNome} onChange={setNovoNome} placeholder="Outro setor..." onKeyDown={e => e.key === "Enter" && addSetor()} />
        <button onClick={addSetor} className="btn btn-soft" style={{ height: 42, padding: "0 16px", flexShrink: 0 }}>
          <Icon name="plus" size={14} /> Adicionar
        </button>
      </div>

      {data.setores.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          {data.setores.map(s => (
            <div key={s.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="users" size={14} color="var(--health-deep)" />
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{s.nome}</span>
                <CritBadge value={s.criticidade} onChange={v => updSetor(s.id, "criticidade", v)} />
                <button onClick={() => removeSetor(s.id)} style={{ color: "var(--ink-faint)" }}>
                  <Icon name="x" size={14} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <MiniField label="Colaboradores">
                  <FInput value={s.colab} onChange={v => updSetor(s.id, "colab", v)} placeholder="80" type="number" />
                </MiniField>
                <MiniField label="Responsável">
                  <FInput value={s.responsavel} onChange={v => updSetor(s.id, "responsavel", v)} placeholder="Nome" />
                </MiniField>
                <MiniField label="Turno">
                  <FSelect value={s.turno} onChange={v => updSetor(s.id, "turno", v)} options={["Comercial","Manhã","Tarde","Noturno","12x36"]} />
                </MiniField>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.setores.length === 0 && (
        <div style={{ padding: "28px 0", textAlign: "center", color: "var(--ink-muted)", fontSize: 13 }}>
          <Icon name="users" size={28} color="var(--line-strong)" strokeWidth={1.2} />
          <div style={{ marginTop: 10 }}>Nenhum setor adicionado ainda.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Clique em um setor sugerido acima ou adicione manualmente.</div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 3 — DIAGNÓSTICO
// ════════════════════════════════════════════════════════════
const Step3Diagnostico = ({ data, upd, updEscopo }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
    <SectionLabel>Tipo de projeto</SectionLabel>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {TIPO_PROJETO.map(t => (
        <OptionCard
          key={t.id} active={data.tipoProjetoId === t.id}
          onClick={() => upd("tipoProjetoId", t.id)}
          icon={<Icon name={t.icon} size={18} color={data.tipoProjetoId === t.id ? "var(--health-deep)" : "var(--ink-muted)"} />}
          label={t.label} desc={t.desc}
        />
      ))}
    </div>

    <SectionLabel>Modelo de roadmap</SectionLabel>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {ROADMAP_TEMPLATES.map(t => (
        <button key={t.id} onClick={() => upd("templateId", t.id)}
          style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
            borderRadius: 12, textAlign: "left",
            background: data.templateId === t.id ? "var(--surface-sage)" : "var(--surface)",
            border: data.templateId === t.id ? "1px solid var(--health-soft)" : "1px solid var(--line)",
          }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, border: data.templateId === t.id ? "none" : "2px solid var(--line-strong)", background: data.templateId === t.id ? "var(--health)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {data.templateId === t.id && <Icon name="check" size={10} color="#fff" strokeWidth={2.5} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{t.label}</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{t.desc}{t.etapas ? ` · ${t.etapas} etapas · ${t.semanas} semanas` : ""}</div>
          </div>
        </button>
      ))}
    </div>

    <SectionLabel>Escopo das atividades</SectionLabel>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {[
        ["entrevistas","Entrevistas individuais"],
        ["reunioes","Reuniões de alinhamento"],
        ["treinamentos","Treinamentos presenciais"],
        ["sensibilizacao","Sensibilização das equipes"],
        ["auditorias","Auditorias internas"],
        ["monitoramento","Monitoramento contínuo"],
      ].map(([k, label]) => (
        <ToggleCard key={k} label={label} checked={data.escopos[k]} onChange={v => updEscopo(k, v)} />
      ))}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// STEP 4 — COLABORADORES
// ════════════════════════════════════════════════════════════
const Step4Colaboradores = ({ data, upd }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <SectionLabel>Método de importação</SectionLabel>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      {[
        { id: "manual",  label: "Manual",   desc: "Cadastrar um a um",      icon: "edit" },
        { id: "xlsx",    label: "Planilha",  desc: "Upload de XLSX/CSV",     icon: "file" },
        { id: "futuro",  label: "Integração",desc: "API futura (em breve)",  icon: "link" },
      ].map(m => (
        <OptionCard key={m.id} active={data.importMetodo === m.id} onClick={() => upd("importMetodo", m.id)}
          icon={<Icon name={m.icon} size={16} color={data.importMetodo === m.id ? "var(--health-deep)" : "var(--ink-muted)"} />}
          label={m.label} desc={m.desc} disabled={m.id === "futuro"} />
      ))}
    </div>

    {data.importMetodo === "xlsx" && (
      <div style={{ border: "2px dashed var(--line-strong)", borderRadius: 14, padding: "32px 24px", textAlign: "center", background: "var(--canvas-warm)" }}>
        <Icon name="download" size={28} color="var(--ink-faint)" strokeWidth={1.3} />
        <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--ink-soft)" }}>Arraste o arquivo aqui ou clique para selecionar</div>
        <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 6 }}>Suporte: .xlsx, .csv · Máx. 10 MB</div>
        <button className="btn btn-soft" style={{ marginTop: 14, height: 36, fontSize: 13 }}>
          <Icon name="plus" size={13} /> Selecionar arquivo
        </button>
      </div>
    )}

    <SectionLabel>Configurações de privacidade</SectionLabel>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        ["anonimo",      "Avaliação anônima",                  "O colaborador não é identificado nas respostas"],
        ["podeEditar",   "Colaborador pode editar resposta",   "Permite alteração antes do prazo final"],
        ["limiteResposta","Limite de uma resposta por pessoa", "Bloqueia reenvio após submissão"],
        ["exigeLgpd",    "Exigir aceite LGPD",                 "Termo obrigatório antes de responder"],
        ["exigeConsent", "Exigir termo de consentimento",      "TCLE exibido na abertura do questionário"],
      ].map(([k, label, desc]) => (
        <ToggleRow key={k} label={label} desc={desc} checked={data[k]} onChange={v => upd(k, v)} />
      ))}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// STEP 5 — AVALIAÇÕES
// ════════════════════════════════════════════════════════════
const Step5Avaliacoes = ({ data, upd }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <SectionLabel>Datas da coleta</SectionLabel>
    <FRow>
      <Field label="Data de início">
        <FInput value={data.dataInicio} onChange={v => upd("dataInicio", v)} type="date" />
      </Field>
      <Field label="Data limite">
        <FInput value={data.dataLimite} onChange={v => upd("dataLimite", v)} type="date" />
      </Field>
    </FRow>

    <SectionLabel>Questionário</SectionLabel>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        { id: "copsoq", label: "COPSOQ II (padrão Menctor)",    desc: "45 itens · validado NR-1 §6.3.3", recommended: true },
        { id: "dass21", label: "DASS-21 — Saúde Mental",        desc: "21 itens · depressão, ansiedade, estresse" },
        { id: "custom", label: "Questionário personalizado",     desc: "Você monta as perguntas" },
      ].map(q => (
        <button key={q.id} onClick={() => upd("questionario", q.id)}
          style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
            borderRadius: 12, textAlign: "left", position: "relative",
            background: data.questionario === q.id ? "var(--surface-sage)" : "var(--surface)",
            border: data.questionario === q.id ? "1px solid var(--health-soft)" : "1px solid var(--line)",
          }}>
          {q.recommended && <span style={{ position: "absolute", top: -8, right: 12, padding: "2px 8px", borderRadius: 999, background: "var(--health)", color: "#fff", fontSize: 10, fontWeight: 700 }}>Recomendado</span>}
          <div style={{ width: 18, height: 18, borderRadius: 999, border: data.questionario === q.id ? "none" : "2px solid var(--line-strong)", background: data.questionario === q.id ? "var(--health)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {data.questionario === q.id && <Icon name="check" size={10} color="#fff" strokeWidth={2.5} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{q.label}</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{q.desc}</div>
          </div>
        </button>
      ))}
    </div>

    <SectionLabel>Notificações automáticas</SectionLabel>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        ["lembretes",  "Lembretes automáticos",         "Reforço 3 dias antes do prazo"],
        ["emailAuto",  "Disparo por e-mail",             "Convite enviado ao abrir a coleta"],
        ["whatsAuto",  "Disparo por WhatsApp",           "Requer integração WhatsApp Business"],
      ].map(([k, label, desc]) => (
        <ToggleRow key={k} label={label} desc={desc} checked={data[k]} onChange={v => upd(k, v)} />
      ))}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// STEP 6 — EQUIPE
// ════════════════════════════════════════════════════════════
const Step6Equipe = ({ data, upd }) => {
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoFuncao, setNovoFuncao] = useState("Psicólogo");
  const add = () => {
    if (!novoNome.trim()) return;
    upd("equipe", [...data.equipe, { id: Date.now(), nome: novoNome, email: novoEmail, funcao: novoFuncao }]);
    setNovoNome(""); setNovoEmail("");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionLabel>Credenciado responsável</SectionLabel>
      <FRow>
        <Field label="Nome">
          <FInput value={data.credNome} onChange={v => upd("credNome", v)} />
        </Field>
        <Field label="Função">
          <FInput value={data.credFuncao} onChange={v => upd("credFuncao", v)} />
        </Field>
      </FRow>
      <Field label="E-mail">
        <FInput value={data.credEmail} onChange={v => upd("credEmail", v)} type="email" />
      </Field>

      <SectionLabel>Equipe auxiliar</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
        <FInput value={novoNome} onChange={setNovoNome} placeholder="Nome" />
        <FInput value={novoEmail} onChange={setNovoEmail} placeholder="E-mail" type="email" />
        <button onClick={add} className="btn btn-soft" style={{ height: 42, padding: "0 16px" }}>
          <Icon name="plus" size={14} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Psicólogo","Consultor","RH","Auditor","Gestor"].map(f => (
          <button key={f} onClick={() => setNovoFuncao(f)} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, background: novoFuncao === f ? "var(--ink)" : "var(--surface)", color: novoFuncao === f ? "#fff" : "var(--ink-muted)", border: "1px solid var(--line)" }}>{f}</button>
        ))}
      </div>
      {data.equipe.map(m => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: "var(--canvas-warm)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "var(--ink-soft)" }}>{m.nome[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{m.nome}</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{m.funcao}{m.email ? ` · ${m.email}` : ""}</div>
          </div>
          <button onClick={() => upd("equipe", data.equipe.filter(x => x.id !== m.id))} style={{ color: "var(--ink-faint)" }}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 7 — CRONOGRAMA
// ════════════════════════════════════════════════════════════
const Step7Cronograma = ({ data, upd }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <SectionLabel>Datas principais</SectionLabel>
    <FRow>
      <Field label="Início do projeto">
        <FInput value={data.inicioProj} onChange={v => upd("inicioProj", v)} type="date" />
      </Field>
      <Field label="Término previsto">
        <FInput value={data.terminoPrev} onChange={v => upd("terminoPrev", v)} type="date" />
      </Field>
    </FRow>
    <Field label="Reunião kickoff">
      <FInput value={data.kickoffDate} onChange={v => upd("kickoffDate", v)} type="date" />
    </Field>

    <SectionLabel>Frequência de acompanhamento</SectionLabel>
    <div style={{ display: "flex", gap: 8 }}>
      {[["semanal","Semanal"],["quinzenal","Quinzenal"],["mensal","Mensal"]].map(([id, label]) => (
        <button key={id} onClick={() => upd("freq", id)} style={{
          flex: 1, padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 500,
          background: data.freq === id ? "var(--ink)" : "var(--surface)",
          color: data.freq === id ? "#fff" : "var(--ink-muted)",
          border: "1px solid var(--line)",
        }}>{label}</button>
      ))}
    </div>

    {data.inicioProj && (
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--health-soft)", fontSize: 13, color: "var(--health-deep)", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="calendar" size={14} />
        <span>Kickoff estimado: <strong>{data.kickoffDate || data.inicioProj}</strong> · entrega prevista em {data.terminoPrev || "a definir"}</span>
      </div>
    )}
  </div>
);

// ════════════════════════════════════════════════════════════
// STEP 8 — APRENDIZADO
// ════════════════════════════════════════════════════════════
const Step8Aprendizado = ({ data, upd }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <SectionLabel>Trilhas de aprendizado</SectionLabel>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        ["vincularTrilha","Vincular trilha existente",   "Aproveita conteúdos já criados no sistema"],
        ["trilhaObrig",   "Sensibilização obrigatória",  "Colaboradores devem completar antes da avaliação"],
        ["certificado",   "Emitir certificado de conclusão", "Certificado digital ao finalizar a trilha"],
      ].map(([k, label, desc]) => (
        <ToggleRow key={k} label={label} desc={desc} checked={data[k]} onChange={v => upd(k, v)} />
      ))}
    </div>

    <SectionLabel>Trilhas disponíveis para vincular</SectionLabel>
    {[
      { id: "t1", label: "Sensibilização NR-1",        modulos: 4, min: 35 },
      { id: "t2", label: "Saúde Mental no Trabalho",   modulos: 6, min: 52 },
      { id: "t3", label: "Liderança e Bem-estar",      modulos: 5, min: 40 },
    ].map(t => (
      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--canvas-warm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="book" size={16} color="var(--ink-muted)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{t.label}</div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{t.modulos} módulos · {t.min} min</div>
        </div>
        <button className="btn btn-soft" style={{ height: 32, fontSize: 12 }}>Vincular</button>
      </div>
    ))}
  </div>
);

// ════════════════════════════════════════════════════════════
// STEP 9 — CONFIGURAÇÃO DO ROADMAP
// ════════════════════════════════════════════════════════════
const Step9Roadmap = ({ data, upd }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <SectionLabel>Automações de geração</SectionLabel>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        ["gerarDashboard",   "Gerar dashboard automático",     "Painel com indicadores atualizado em tempo real"],
        ["gerarIndicadores", "Gerar indicadores personalizados","Baseados no tipo de projeto selecionado"],
        ["gerarPlanoAcao",   "Gerar plano de ação 5W2H",       "Ações sugeridas pelo diagnóstico COPSOQ"],
        ["gerarPDF",         "Gerar PDF automático",           "Relatórios prontos para entrega ao cliente"],
        ["gerarRelatorios",  "Gerar relatórios automáticos",   "ARP e Matriz NR-1 ao encerrar diagnóstico"],
      ].map(([k, label, desc]) => (
        <ToggleRow key={k} label={label} desc={desc} checked={data[k]} onChange={v => upd(k, v)} />
      ))}
    </div>

    <SectionLabel>Etapas do roadmap</SectionLabel>
    <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--canvas-warm)", border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 10 }}>Template: <strong style={{ color: "var(--ink)" }}>{ROADMAP_TEMPLATES.find(t => t.id === data.templateId)?.label}</strong></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(ETAPAS_TEMPLATE[data.templateId] || ETAPAS_TEMPLATE.padrao).map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-soft)" }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--surface)", border: "1.5px solid var(--line-strong)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--ink-muted)", flexShrink: 0 }}>{String(i+1).padStart(2,"0")}</span>
            {e}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// STEP 10 — GERAÇÃO FINAL (resumo)
// ════════════════════════════════════════════════════════════
const Step10Gerar = ({ data, etapas, template, indicadores, generating }) => {
  const nomeEmpresa = data.nome || data.razao || "Novo cliente";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {generating ? (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: "var(--surface-2)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="sparkles" size={28} color="var(--health-deep)" strokeWidth={1.5} />
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 8 }}>Gerando o projeto…</div>
          <div style={{ fontSize: 13.5, color: "var(--ink-muted)", maxWidth: 360, margin: "0 auto", lineHeight: 1.55 }}>
            Criando cliente, roadmap, etapas, tarefas, questionários e indicadores.
          </div>
          <div style={{ marginTop: 28, height: 4, background: "var(--line)", borderRadius: 99, overflow: "hidden", maxWidth: 300, margin: "28px auto 0" }}>
            <div style={{ height: "100%", width: "70%", background: "var(--health)", borderRadius: 99, animation: "none" }} />
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: "20px 22px", borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--health-soft)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--health)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20 }}>
                {nomeEmpresa[0]}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{nomeEmpresa}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{data.segmento || "Empresa"} · {data.colaboradores || "?"} colaboradores</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Roadmap", template.label],
                ["Etapas", `${etapas.length} etapas`],
                ["Duração", template.semanas ? `${template.semanas} semanas` : "Personalizado"],
                ["Setores", `${data.setores.length || 1} setor(es)`],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.6)" }}>
                  <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--health-deep)", fontWeight: 700 }}>{k}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <SectionLabel>O sistema vai gerar automaticamente</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              [data.gerarDashboard,   "Dashboard com indicadores em tempo real"],
              [data.gerarIndicadores, `${indicadores.length} indicadores personalizados`],
              [data.gerarPlanoAcao,   "Plano de ação 5W2H (após diagnóstico)"],
              [data.gerarPDF,         "PDFs automáticos de relatório"],
              [data.gerarRelatorios,  "Relatório ARP + Matriz NR-1"],
              [true,                  `${etapas.length} etapas no roadmap`],
              [true,                  "Questionário e coleta configurados"],
              [data.vincularTrilha,   "Trilha de aprendizado vinculada"],
            ].filter(([on]) => on).map(([, label], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "var(--ink-soft)", padding: "6px 0" }}>
                <div style={{ width: 20, height: 20, borderRadius: 999, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="check" size={11} color="var(--health-deep)" strokeWidth={2.5} />
                </div>
                {label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// ROADMAP PREVIEW (painel direito)
// ════════════════════════════════════════════════════════════
// ── Documentos ao vivo: contrato + proposta montados em tempo real ──
const saveDocDraft = (data, template) => {
  const token = data.docToken || "draft";
  try {
    window.localStorage.setItem(`MENCTOR_DOC_DRAFT_${token}`, JSON.stringify({
      ...data, semanas: template.semanas || 24,
    }));
  } catch (e) { /* ignore */ }
  return token;
};

const docLink = (kind, token) => `${window.location.origin}/doc/${kind}?d=${token}`;

const DocCardShell = ({ title, subtitle, pct, children, onOpen, onCopy, copied }) => (
  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
    <div style={{ padding: "13px 16px 11px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{subtitle}</div>
      </div>
      <span style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, fontWeight: 600, background: pct >= 100 ? "var(--surface-sage)" : "var(--canvas-warm)", color: pct >= 100 ? "var(--health-deep)" : "var(--ink-faint)", flexShrink: 0 }}>
        {pct >= 100 ? "Pronto" : `${pct}%`}
      </span>
    </div>
    <div style={{ height: 3, background: "var(--canvas-warm)" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--health)", transition: "width 0.4s ease" }} />
    </div>
    {children}
    <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}>
      <button onClick={onOpen} className="btn btn-soft" style={{ flex: 1, height: 30, justifyContent: "center", fontSize: 11.5 }}>
        <Icon name="external" size={11} /> Abrir
      </button>
      <button onClick={onCopy} className="btn btn-soft" style={{ flex: 1, height: 30, justifyContent: "center", fontSize: 11.5 }}>
        <Icon name={copied ? "check" : "link"} size={11} /> {copied ? "Copiado" : "Copiar link"}
      </button>
    </div>
  </div>
);

const MiniVal = ({ v, ph }) => v
  ? <strong style={{ color: "#00204D", fontWeight: 700 }}>{v}</strong>
  : <span style={{ color: "#C3CAD6" }}>{ph}</span>;

const ContratoLiveCard = ({ data, template, pct }) => {
  const [copied, setCopied] = useState(false);
  const act = (open) => {
    const token = saveDocDraft(data, template);
    const link = docLink("contrato", token);
    if (open) window.open(link, "_blank");
    else navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  const valor = (Number(data.mrr) || 4700).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <DocCardShell title="Modelo de contrato" subtitle="Página que você envia para o cliente assinar" pct={pct}
      onOpen={() => act(true)} onCopy={() => act(false)} copied={copied}>
      <div style={{ margin: "12px 14px", padding: "14px 16px", background: "#fff", borderRadius: 10, border: "1px solid #E4E7ED", fontFamily: "Georgia, serif", fontSize: 11.5, lineHeight: 1.65, color: "#5A6478" }}>
        <div style={{ fontFamily: "inherit", borderBottom: "2px solid #00204D", paddingBottom: 8, marginBottom: 10 }}>
          <div style={{ fontFamily: "var(--sans)", fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F66B0A", fontWeight: 700 }}>Contrato · Instrumento particular</div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 800, color: "#00204D", marginTop: 3 }}>Prestação de Serviços · NR-01</div>
        </div>
        <div><span style={{ color: "#8A93A6" }}>CONTRATANTE:</span> <MiniVal v={data.razao} ph="Razão social" />, CNPJ <MiniVal v={data.cnpj} ph="00.000.000/0000-00" />, com sede em <MiniVal v={[data.cidade, data.estado].filter(Boolean).join("/")} ph="Cidade/UF" />, representada por <MiniVal v={data.contatoNome} ph="Representante" />.</div>
        <div style={{ marginTop: 6 }}>Honorários de <MiniVal v={valor} ph="R$ —" /> · vigência de 12 meses · 12 cláusulas + assinatura eletrônica.</div>
      </div>
    </DocCardShell>
  );
};

const PropostaLiveCard = ({ data, template, pct }) => {
  const [copied, setCopied] = useState(false);
  const act = (open) => {
    const token = saveDocDraft(data, template);
    const link = docLink("proposta", token);
    if (open) window.open(link, "_blank");
    else navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  const nome = data.nome || data.razao;
  return (
    <DocCardShell title="Proposta personalizada" subtitle="Apresentação premium · baixe em PDF no final" pct={pct}
      onOpen={() => act(true)} onCopy={() => act(false)} copied={copied}>
      <div style={{ margin: "12px 14px", borderRadius: 12, overflow: "hidden", border: "1px solid #E4E7ED", boxShadow: "0 1px 3px rgba(0,32,77,0.04)" }}>
        {/* cover mini */}
        <div style={{ background: "var(--accent)", color: "#fff", padding: "13px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>PROPOSTA COMERCIAL</span>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.18)", marginLeft: 4 }} />
            <span style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F66B0A", fontWeight: 800 }}>NR-01</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 5 }}>
            Implantação <span style={{ color: "#F66B0A" }}>NR-01</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.78)", marginTop: 1 }}>
            {nome ? <strong style={{ color: "#fff" }}>{nome}</strong> : "sua empresa"}
          </div>
        </div>

        {/* metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#fff" }}>
          {[
            ["Colaboradores", data.colaboradores || "—"],
            ["Prazo", (template.semanas || "—") + " sem."],
            ["Investimento", data.mrr ? `R$ ${(Number(data.mrr) / 1000).toFixed(1)}k/mês` : "—"],
          ].map(([k, v], i) => (
            <div key={i} style={{ padding: "9px 0", textAlign: "center", borderRight: i < 2 ? "1px solid #EEF0F4" : "none" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#00204D", lineHeight: 1.1 }}>{v}</div>
              <div style={{ fontSize: 8.2, letterSpacing: "0.07em", textTransform: "uppercase", color: "#8A93A6", fontWeight: 700, marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>
    </DocCardShell>
  );
};

const RoadmapPreview = ({ data, etapas, template, indicadores, step }) => {
  const nomeEmpresa = data.nome || data.razao || "Nova empresa";
  const totalTarefas = etapas.length * 4;
  const semanas = template.semanas || 20;

  const contratoCampos = [data.razao, data.cnpj, data.nome, data.contatoNome, data.contatoCargo, data.cidade, data.estado, data.colaboradores];
  const contratoPct = Math.round((contratoCampos.filter(Boolean).length / contratoCampos.length) * 100);

  const propostaPct = Math.min(100, Math.round(((step + 1) / 10) * 100));

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Prévia do projeto</div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Atualiza conforme você preenche</div>
        </div>
        <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "#1a1a1a", color: "var(--health-deep)", fontWeight: 600 }}>AO VIVO</span>
      </div>

      <SectionLabel>Documentos sendo montados ao vivo</SectionLabel>
      <ContratoLiveCard data={data} template={template} pct={contratoPct} />
      <PropostaLiveCard data={data} template={template} pct={propostaPct} />

      {/* Identity */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--health)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>{nomeEmpresa[0]}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{nomeEmpresa}</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{data.segmento || "Empresa"}{data.cidade ? ` · ${data.cidade}` : ""}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            ["Colab.", data.colaboradores || "—"],
            ["Setores", data.setores.length || "—"],
            ["Unidades", data.unidades || "1"],
          ].map(([k, v]) => (
            <div key={k} style={{ textAlign: "center", padding: "8px 0", borderRadius: 8, background: "var(--canvas-warm)" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{v}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Template stats */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Estrutura do roadmap</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            ["Modelo", template.label],
            ["Etapas", `${etapas.length}`],
            ["Semanas", `${semanas}`],
            ["Tarefas est.", `~${totalTarefas}`],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--canvas-warm)", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-faint)", fontWeight: 700 }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Etapas list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {etapas.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--ink-soft)" }}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: i === 0 ? "var(--health)" : "var(--line-strong)", flexShrink: 0 }} />
              <span style={{ fontWeight: i === 0 ? 600 : 400 }}>{e}</span>
              {i === 0 && <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--health-deep)", fontWeight: 600 }}>Kickoff</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores */}
      {step >= 3 && (
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Indicadores que serão monitorados</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {indicadores.map((ind, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--ink-soft)" }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: "var(--sky)", flexShrink: 0 }} />
                {ind}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cronograma preview */}
      {(data.inicioProj || data.dataInicio) && step >= 7 && (
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Cronograma previsto</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Início", data.inicioProj || data.dataInicio],
              ["Kickoff", data.kickoffDate || "A definir"],
              ["Coleta", data.dataInicio || "A definir"],
              ["Término", data.terminoPrev || "A definir"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                <span style={{ color: "var(--ink-muted)" }}>{k}</span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automações confirmadas */}
      {step >= 9 && (
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Geração automática ativa</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              [data.gerarDashboard,   "Dashboard"],
              [data.gerarIndicadores, "Indicadores"],
              [data.gerarPlanoAcao,   "Plano de ação"],
              [data.gerarPDF,         "PDF automático"],
              [data.gerarRelatorios,  "Relatórios ARP + NR-1"],
            ].map(([on, label], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: on ? "var(--health)" : "var(--canvas-warm)", border: on ? "none" : "1.5px solid var(--line-strong)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {on && <Icon name="check" size={9} color="#fff" strokeWidth={2.5} />}
                </div>
                <span style={{ color: on ? "var(--ink-soft)" : "var(--ink-faint)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// ════════════════════════════════════════════════════════════
// SUCCESS SCREEN
// ════════════════════════════════════════════════════════════
const SuccessScreen = ({ data, etapas, template, indicadores, onClose, createdId, onOpenRoadmap }) => {
  const nomeEmpresa = data.nome || data.razao || "Novo cliente";
  const [copiedDoc, setCopiedDoc] = useState("");
  const shareDoc = (kind, open) => {
    const token = saveDocDraft(data, template);
    const link = docLink(kind, token);
    if (open) { window.open(link, "_blank"); return; }
    navigator.clipboard?.writeText(link).then(() => {
      setCopiedDoc(kind);
      setTimeout(() => setCopiedDoc(""), 2200);
    });
  };
  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 36px" }}>
      <div style={{ width: "100%", maxWidth: 680, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 999, background: "#1a1a1a", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="check" size={36} color="var(--health-deep)" strokeWidth={1.8} />
        </div>
        <div className="eyebrow" style={{ marginBottom: 10, color: "var(--health-deep)" }}>Projeto criado com sucesso</div>
        <h1 className="display" style={{ fontSize: 40, margin: 0, lineHeight: 1.05 }}>
          {nomeEmpresa} está pronto para começar.
        </h1>
        <p style={{ margin: "14px 0 28px", fontSize: 15, color: "var(--ink-muted)", lineHeight: 1.55, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Roadmap, etapas, tarefas, indicadores e questionários foram gerados automaticamente.
        </p>

        <div className="card" style={{ padding: "20px 24px", textAlign: "left", marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Resumo do projeto gerado</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Cliente", nomeEmpresa],
              ["Modelo", template.label],
              ["Etapas criadas", etapas.length],
              ["Indicadores", indicadores.length],
              ["Colaboradores", data.colaboradores || "—"],
              ["Contato", data.contatoNome || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-muted)", fontWeight: 700 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentos para enviar ao cliente */}
        <div className="card" style={{ padding: "20px 24px", textAlign: "left", marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Enviar para o cliente</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["contrato", "file-text", "Contrato NR-01", "Página com assinatura eletrônica em tempo real"],
              ["proposta", "presentation", "Proposta personalizada", "Apresentação premium · o cliente pode baixar em PDF"],
            ].map(([kind, icon, titulo, sub]) => (
              <div key={kind} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "var(--canvas-warm)" }}>
                <Icon name={icon} size={17} color="var(--health-deep)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{titulo}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{sub}</div>
                </div>
                <button onClick={() => shareDoc(kind, true)} className="btn btn-soft" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
                  <Icon name="external" size={12} /> Abrir
                </button>
                <button onClick={() => shareDoc(kind, false)} className="btn btn-primary" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
                  <Icon name={copiedDoc === kind ? "check" : "send"} size={12} /> {copiedDoc === kind ? "Link copiado" : "Copiar link"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ height: 42 }}>Voltar para clientes</button>
          <button
            onClick={() => {
              if (onOpenRoadmap && createdId) onOpenRoadmap(createdId);
              else onClose();
            }}
            className="btn btn-primary"
            style={{ height: 42 }}
          >
            <Icon name="map" size={14} /> Abrir roadmap <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// PRIMITIVOS DE FORMULÁRIO
// ════════════════════════════════════════════════════════════
const SectionLabel = ({ children, style }) => (
  <div className="eyebrow" style={{ fontSize: 11, letterSpacing: "0.1em", marginBottom: -6, ...style }}>{children}</div>
);

const FRow = ({ children }) => {
  const cols = React.Children.toArray(children).map(c => c?.props?.width || 1).join("fr ") + "fr";
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12 }}>{children}</div>;
};

const Field = ({ label, hint, width, children }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>{label}</label>
      {hint && <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const MiniField = ({ label, children }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", marginBottom: 4 }}>{label}</div>
    {children}
  </div>
);

const FInput = ({ value, onChange, placeholder, type = "text", onKeyDown }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} onKeyDown={onKeyDown}
    style={{ width: "100%", padding: "11px 13px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13.5, color: "var(--ink)", outline: "none", boxSizing: "border-box" }}
    onFocus={e => e.target.style.borderColor = "var(--health)"}
    onBlur={e => e.target.style.borderColor = "var(--line)"} />
);

const FSelect = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: "100%", padding: "11px 13px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13.5, color: value ? "var(--ink)" : "var(--ink-muted)", outline: "none", appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6F6A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32 }}>
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const OptionCard = ({ active, onClick, icon, label, desc, disabled }) => (
  <button onClick={!disabled ? onClick : undefined}
    style={{
      display: "flex", flexDirection: "column", gap: 6, padding: "14px 16px", borderRadius: 12, textAlign: "left",
      background: active ? "var(--surface-sage)" : disabled ? "var(--canvas-warm)" : "var(--surface)",
      border: active ? "1.5px solid var(--health)" : "1px solid var(--line)",
      opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer",
    }}>
    {icon}
    <div style={{ fontSize: 13.5, fontWeight: 600, color: active ? "var(--health-deep)" : "var(--ink)", marginTop: 2 }}>{label}</div>
    <div style={{ fontSize: 11.5, color: "var(--ink-muted)", lineHeight: 1.4 }}>{desc}</div>
  </button>
);

const ToggleCard = ({ label, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: checked ? "1px solid var(--health-soft)" : "1px solid var(--line)", background: checked ? "var(--surface-sage)" : "var(--surface)", cursor: "pointer" }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: "var(--health)", width: 16, height: 16 }} />
    <span style={{ fontSize: 13, fontWeight: 500, color: checked ? "var(--health-deep)" : "var(--ink-soft)" }}>{label}</span>
  </label>
);

const ToggleRow = ({ label, desc, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer" }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: "var(--health)", width: 16, height: 16, marginTop: 2 }} />
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{label}</div>
      {desc && <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{desc}</div>}
    </div>
  </label>
);

const YesNoCard = ({ label, value, onChange }) => (
  <div style={{ padding: "13px 14px", borderRadius: 12, border: `1px solid ${value === true ? "var(--health-soft)" : value === false ? "var(--line)" : "var(--line)"}`, background: value === true ? "var(--surface-sage)" : "var(--surface)" }}>
    <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10, lineHeight: 1.4 }}>{label}</div>
    <div style={{ display: "flex", gap: 6 }}>
      {[true, false].map(v => (
        <button key={String(v)} onClick={() => onChange(v)}
          style={{ flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: value === v ? (v ? "var(--health)" : "var(--canvas-warm)") : "var(--canvas-warm)",
            color: value === v && v ? "#fff" : "var(--ink-muted)",
            border: `1px solid ${value === v ? (v ? "var(--health)" : "var(--line-strong)") : "var(--line)"}`,
          }}>
          {v ? "Sim" : "Não"}
        </button>
      ))}
    </div>
  </div>
);

const CritBadge = ({ value, onChange }) => {
  const opts = { baixa: ["Baixa","var(--health-deep)","var(--surface-sage)"], media: ["Média","#92600A","#FFF8EB"], alta: ["Alta","#B03A2E","#FFF0EE"] };
  const [ink, bg] = [opts[value]?.[1] || "var(--ink-muted)", opts[value]?.[2] || "var(--canvas-warm)"];
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: ink, background: bg, border: "none", outline: "none", cursor: "pointer" }}>
      <option value="baixa">Baixa</option>
      <option value="media">Média</option>
      <option value="alta">Alta</option>
    </select>
  );
};

// ════════════════════════════════════════════════════════════
// NOVAS 7 ETAPAS PARA A TELA /clientes/novo
// ════════════════════════════════════════════════════════════

const Cadastro18Step = ({ data, upd }) => {
  const form = data.cadastro18 || {};
  const areas = ["administrativo", "operacional", "vendas", "producao", "atendimento", "qualidade"];

  const setF = (k, v) => {
    const nextForm = { ...form, [k]: v };
    upd("cadastro18", nextForm);

    // Mirror key fields to top-level data
    if (k === "razaoSocial") {
      upd("razao", v);
      upd("nome", v);
    }
    if (k === "cnpj") upd("cnpj", v);
    if (k === "responsavel") upd("contatoNome", v);
    if (k === "segmento") upd("segmento", v);
    if (k === "unidades") upd("unidades", v);

    // handle qtdPorArea object or direct area keys for colaboradores total
    const qtd = nextForm.qtdPorArea || {};
    const total = areas.reduce((sum, a) => sum + (parseInt(qtd[a] || nextForm[a] || "0", 10) || 0), 0) +
                  (parseInt(nextForm.terceirizados || "0", 10) || 0);
    if (total > 0) upd("colaboradores", String(total));
  };

  const toggle = (k, val) => {
    const arr = form[k] || [];
    setF(k, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const updAreaObj = (area, v) => {
    const currentQ = form.qtdPorArea || { administrativo: "", operacional: "", vendas: "", producao: "", atendimento: "", qualidade: "" };
    const nextQ = { ...currentQ, [area]: v };
    setF("qtdPorArea", nextQ);
    // also support legacy direct keys for sum
    setF(area, v);
  };

  // Listas completas (iguais ao formulário público e ao Cadastro18Form do roadmap)
  const possuiList = ["Técnico de Segurança do trabalho", "CIPA", "PGR - Programa de Gerenciamento de Riscos", "AEP - Análise Ergonômica Preliminar", "OS - Ordens de Serviços de todas as funções", "Modelo de Plano de ação de medidas preventivas", "GRO - Gerenciamento de Riscos Ocupacionais", "SESMT", "Outra"];
  const indicadoresList = ["Turnover médio dos últimos 12 meses", "Taxa de absenteísmo / faltas", "Afastamentos previdenciários (principalmente saúde mental)", "Horas extras frequentes", "Áreas com maior rotatividade ou desgaste", "Outros"];
  const trabalhaList = ["Metas individuais ou coletivas agressivas", "Trabalho por turnos ou jornadas noturnas", "Home office / híbrido", "Terceirizados ou prestadores de serviços", "Horários normais de trabalho"];

  const SectionTitleSmall = ({ children }) => <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 4 }}>{children}</div>;
  const YesNoBtn = ({ label, value, onChange }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 13.5, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {["Sim", "Não", "Parcialmente"].map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{ padding: "5px 11px", borderRadius: 999, fontSize: 12.5, border: value === opt ? "1px solid var(--health)" : "1px solid var(--line)", background: value === opt ? "var(--surface-sage)" : "var(--surface)" }}>{opt}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 4 }}>
        Preencha os dados completos da empresa. Esta é a etapa de <strong>Cadastro (18 perguntas)</strong>.
      </div>

      <div><SectionTitleSmall>1. Razão Social da Empresa</SectionTitleSmall>
        <FInput value={form.razaoSocial || ""} onChange={v => setF("razaoSocial", v)} placeholder="Razão Social da Empresa" /></div>

      <div><SectionTitleSmall>2. Nome do responsável pela implantação dos Riscos Psicossociais</SectionTitleSmall>
        <FInput value={form.responsavel || ""} onChange={v => setF("responsavel", v)} placeholder="Nome completo" /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><SectionTitleSmall>3. E-mail</SectionTitleSmall>
          <FInput value={form.email || ""} onChange={v => setF("email", v)} placeholder="responsavel@empresa.com.br" type="email" /></div>
        <div><SectionTitleSmall>4. Telefone</SectionTitleSmall>
          <FInput value={form.telefone || ""} onChange={v => setF("telefone", v)} placeholder="(11) 99999-9999" /></div>
      </div>

      <div><SectionTitleSmall>5. CNPJ</SectionTitleSmall>
        <FInput value={form.cnpj || ""} onChange={v => setF("cnpj", v)} placeholder="00.000.000/0000-00" /></div>

      <div>
        <SectionTitleSmall>6. Quantidade de colaboradores por área</SectionTitleSmall>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {areas.map(a => (
            <div key={a}><div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{a}</div>
              <FInput value={(form.qtdPorArea && form.qtdPorArea[a]) || form[a] || ""} onChange={v => updAreaObj(a, v)} placeholder="0" type="number" /></div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><SectionTitleSmall>7. Quantidade de cargos existentes</SectionTitleSmall>
          <FInput value={form.qtdCargos || ""} onChange={v => setF("qtdCargos", v)} type="number" placeholder="42" /></div>
        <div><SectionTitleSmall>8. Segmento de atuação</SectionTitleSmall>
          <FInput value={form.segmento || ""} onChange={v => setF("segmento", v)} placeholder="indústria, serviços, call center..." /></div>
      </div>

      <div><SectionTitleSmall>9. Número de estabelecimentos / unidades (filiais)</SectionTitleSmall>
        <FInput value={form.unidades || ""} onChange={v => setF("unidades", v)} placeholder="Matriz + 3 filiais" /></div>

      <div><SectionTitleSmall>10. Cidades a serem abrangidas</SectionTitleSmall>
        <FInput value={form.cidades || ""} onChange={v => setF("cidades", v)} placeholder="São Paulo, Rio..." /></div>

      <div><SectionTitleSmall>11. Quantidade de colaboradores terceirizados (matriz e filiais)</SectionTitleSmall>
        <FInput value={form.terceirizados || ""} onChange={v => setF("terceirizados", v)} placeholder="Ex.: 35 na matriz..." /></div>

      <div>
        <SectionTitleSmall>12. A empresa possui:</SectionTitleSmall>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 13 }}>
          {possuiList.map(item => (
            <label key={item} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={(form.possui || []).includes(item)} onChange={() => toggle("possui", item)} /> {item}
            </label>
          ))}
        </div>
      </div>

      <div>
        <SectionTitleSmall>13. A empresa possui indicadores de:</SectionTitleSmall>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 13 }}>
          {indicadoresList.map(item => (
            <label key={item} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={(form.indicadores || []).includes(item)} onChange={() => toggle("indicadores", item)} /> {item}
            </label>
          ))}
        </div>
      </div>

      <div>
        <SectionTitleSmall>14. Gestão de riscos psicossociais (alinhamento com a NR-1 revisada)</SectionTitleSmall>
        <YesNoBtn label="Existe algum mapeamento formal de riscos psicossociais?" value={form.mapeamentoFormal} onChange={v => setF("mapeamentoFormal", v)} />
        <YesNoBtn label="A empresa já realizou pesquisa de clima organizacional?" value={form.pesquisaClima} onChange={v => setF("pesquisaClima", v)} />
        <YesNoBtn label="Existem canais formais de escuta e denúncia?" value={form.canaisEscuta} onChange={v => setF("canaisEscuta", v)} />
        <YesNoBtn label="Se houver fiscalização, a empresa consegue demonstrar método e evidência desse controle?" value={form.fiscalizacaoEvidencia} onChange={v => setF("fiscalizacaoEvidencia", v)} />
        <div><div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Outra</div><FInput value={form.gestaoRiscosOutra || ""} onChange={v => setF("gestaoRiscosOutra", v)} /></div>
      </div>

      <div>
        <SectionTitleSmall>15. Liderança e organização do trabalho (identificando riscos sistêmicos)</SectionTitleSmall>
        <YesNoBtn label="Pressão por metas é frequente?" value={form.pressaoMetas} onChange={v => setF("pressaoMetas", v)} />
        <YesNoBtn label="Ritmo de trabalho intenso ou imprevisível?" value={form.ritmoIntenso} onChange={v => setF("ritmoIntenso", v)} />
        <YesNoBtn label="Lideranças recebem capacitação em gestão de pessoas?" value={form.capacitacaoLideranca} onChange={v => setF("capacitacaoLideranca", v)} />
        <YesNoBtn label="Há conflitos recorrentes ou queixas informais?" value={form.conflitosRecorrentes} onChange={v => setF("conflitosRecorrentes", v)} />
        <YesNoBtn label="Há assédio moral e conflitos recorrentes?" value={form.assedioMoral} onChange={v => setF("assedioMoral", v)} />
        <div><div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Outra</div><FInput value={form.liderancaOutra || ""} onChange={v => setF("liderancaOutra", v)} /></div>
      </div>

      <div>
        <SectionTitleSmall>16. Aspectos jurídicos e governança (envolvimento da direção)</SectionTitleSmall>
        <YesNoBtn label="Existe um Jurídico que acompanha as questões de saúde e segurança no trabalho?" value={form.juridicoAcompanha} onChange={v => setF("juridicoAcompanha", v)} />
        <YesNoBtn label="Já houve fiscalização ou ação trabalhista relacionada a adoecimento mental na empresa?" value={form.acaoTrabalhistaMental} onChange={v => setF("acaoTrabalhistaMental", v)} />
        <YesNoBtn label="Hoje a empresa se sente protegida?" value={form.senteProtegida} onChange={v => setF("senteProtegida", v)} />
        <div><div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Outra</div><FInput value={form.juridicaOutra || ""} onChange={v => setF("juridicaOutra", v)} /></div>
      </div>

      <div>
        <SectionTitleSmall>17. Estrutura das atividades</SectionTitleSmall>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 6 }}>
          {[
            ["excessoTrabalho", "Há excesso de trabalho"],
            ["prazosInatingiveis", "Há prazos por metas inatingíveis"],
            ["faltaControle", "Falta de controle sobre a forma como o trabalho é executado"],
            ["estruturaNaoAplica", "Não se aplica"],
          ].map(([k, l]) => (
            <label key={k} style={{ display: "flex", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={!!form[k]} onChange={e => setF(k, e.target.checked)} /> {l}
            </label>
          ))}
        </div>
        <div><div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Outra</div><FInput value={form.estruturaOutra || ""} onChange={v => setF("estruturaOutra", v)} /></div>
      </div>

      <div>
        <SectionTitleSmall>18. A empresa trabalha com:</SectionTitleSmall>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 13 }}>
          {trabalhaList.map(item => (
            <label key={item} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={(form.trabalhaCom || form.trabalha || []).includes(item)} onChange={() => toggle("trabalhaCom", item)} /> {item}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const PropostaStep = ({ data, upd }) => {
  const [showSend, setShowSend] = useState(false);
  const accepted = data.propostaAceite || false;

  // Auto-detect acceptance
  useEffect(() => {
    const check = () => {
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith("MENCTOR_PROPOSAL_ACCEPTED_"));
        if (keys.length && !accepted) {
          // simplistic: if any recent acceptance, mark it
          upd("propostaAceite", true);
        }
      } catch (_) {}
    };
    const iv = setInterval(check, 2000);
    return () => clearInterval(iv);
  }, [accepted]);

  return (
    <div>
      <div style={{ padding: 20, background: "var(--surface)", borderRadius: 12, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Proposta comercial</div>
        <div style={{ marginTop: 6, fontSize: 14 }}>Valor: R$ {data.mrr || 4200}/mês • {data.colaboradores || "?"} colaboradores</div>
        <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink-muted)" }}>
          Envie o link abaixo para o cliente visualizar a proposta completa e aceitar diretamente pelo portal.
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={() => setShowSend(true)} className="btn btn-primary" style={{ height: 40 }}>
          <Icon name="send" size={15} /> Enviar link para o cliente aceitar
        </button>
        <button onClick={() => {
          const token = data.docToken || "demo";
          window.open(`/doc/proposta?token=${token}`, "_blank");
        }} className="btn btn-soft" style={{ height: 40 }}>
          Ver documento
        </button>
      </div>

      <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: accepted ? "var(--surface-sage)" : "var(--surface)", border: "1px solid var(--line)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={accepted} onChange={e => upd("propostaAceite", e.target.checked)} />
          Cliente aceitou a proposta (preenchido automaticamente quando o cliente clica no link)
        </label>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: "var(--ink-muted)" }}>
        Após o aceite pelo cliente, avance para a etapa de Contrato.
      </div>

      {showSend && (
        <SendProposalModalWizard
          data={data}
          onClose={() => setShowSend(false)}
          onAccepted={() => upd("propostaAceite", true)}
        />
      )}
    </div>
  );
};

// Modal simples para enviar link da proposta (estilo consistente com Enviar Formulário)
const SendProposalModalWizard = ({ data, onClose, onAccepted }) => {
  const [copied, setCopied] = useState(false);
  const token = data.formToken || data.docToken || `p${Date.now().toString(36)}`;
  const link = `${window.location.origin}/?proposta=${encodeURIComponent(token)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) { window.prompt("Copie:", link); }
  };

  const send = async () => {
    const email = data.contatoEmail || data.email || "";
    const nome = data.nome || data.razao || "cliente";
    const html = `<p>Olá, segue a proposta para ${nome}.</p><p><a href="${link}">Abrir e aceitar proposta</a></p>`;
    if (typeof sendTransactionalEmail === "function") {
      await sendTransactionalEmail({ to: email, subject: `Proposta Menctor - ${nome}`, html });
    } else {
      window.open(`mailto:${email}?subject=Proposta%20Menctor&body=${encodeURIComponent(link)}`);
    }
    alert("Link pronto para envio. O cliente pode aceitar pelo portal.");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Enviar link da proposta</div>
          <button onClick={onClose}>✕</button>
        </div>

        <div style={{ fontSize: 13, marginBottom: 12 }}>O cliente abrirá este link, verá a proposta e poderá aceitar com um clique.</div>

        <div style={{ display: "flex", gap: 8 }}>
          <input readOnly value={link} style={{ flex: 1, height: 40, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px" }} />
          <button onClick={copy} className="btn btn-primary">{copied ? "Copiado" : "Copiar"}</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={send} className="btn btn-accent" style={{ flex: 1 }}>Enviar por e-mail</button>
          <button onClick={() => window.open(link, "_blank")} className="btn btn-soft">Abrir link</button>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink-muted)" }}>
          Quando o cliente aceitar, a caixa de aceite será marcada automaticamente.
        </div>
      </div>
    </div>
  );
};

const ContratoStep = ({ data, upd }) => {
  const accepted = data.contratoAceite || false;
  return (
    <div>
      <div style={{ padding: 20, background: "var(--surface)", borderRadius: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Contrato Menctor</div>
        <div style={{ marginTop: 8 }}>Vigência 12 meses • Valor mensal R$ {data.mrr || 4200}</div>
        <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink-muted)" }}>
          O preview do contrato aparece ao lado. Utilize "Abrir" ou "Copiar link" para encaminhar ao cliente.
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: accepted ? "var(--surface-sage)" : "var(--surface)", border: "1px solid var(--line)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={accepted} onChange={e => upd("contratoAceite", e.target.checked)} />
          Cliente aceitou o contrato (marcar após assinatura)
        </label>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: "var(--ink-muted)" }}>
        Após o aceite do contrato, avance para as próximas etapas de implantação.
      </div>
    </div>
  );
};

const SensibilizacaoStep = ({ data, upd }) => {
  const sens = data.sensibilizacoes || { palestra: false, treinamento: false, trilha: false };
  const toggle = (key) => upd("sensibilizacoes", { ...sens, [key]: !sens[key] });

  const cards = [
    { key: "palestra", title: "Palestra" },
    { key: "treinamento", title: "Treinamento" },
    { key: "trilha", title: "Trilha" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {cards.map(c => (
        <div key={c.key} onClick={() => toggle(c.key)} style={{ padding: 18, borderRadius: 12, border: sens[c.key] ? "2px solid var(--health)" : "1px solid var(--line)", background: sens[c.key] ? "var(--surface-sage)" : "var(--surface)", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{c.title}</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>{sens[c.key] ? "✓ Selecionado" : "Clique para marcar"}</div>
        </div>
      ))}
    </div>
  );
};

const DiagnosticoStep = ({ data, upd }) => {
  const inst = data.instrumentos || [];
  const toggle = (id) => {
    const novo = inst.includes(id) ? inst.filter(x => x !== id) : [...inst, id];
    upd("instrumentos", novo);
  };

  const opts = [
    { id: "copsoqii", label: "COPSOQ II" },
    { id: "drps", label: "DRPS" },
    { id: "clima", label: "Clima Organizacional" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {opts.map(o => (
        <div key={o.id} onClick={() => toggle(o.id)} style={{ padding: 16, borderRadius: 10, border: inst.includes(o.id) ? "2px solid var(--health)" : "1px solid var(--line)", background: inst.includes(o.id) ? "var(--surface-sage)" : "var(--surface)", cursor: "pointer" }}>
          <input type="checkbox" readOnly checked={inst.includes(o.id)} /> {o.label}
        </div>
      ))}
    </div>
  );
};

const RelatoriosStep = () => (
  <div>
    <div style={{ fontSize: 14.5, color: "var(--ink-muted)", marginBottom: 20 }}>
      Será liberada após a etapa de Diagnóstico.
    </div>

    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
      Relatórios que serão gerados ao fim do diagnóstico:
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)" }}>
        <Icon name="shield" size={18} style={{ marginTop: 2 }} />
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontWeight: 600 }}>Risco Psicossocial</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>Relatório executivo completo com análise COPSOQ II e dimensões em risco.</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)" }}>
        <Icon name="file" size={18} style={{ marginTop: 2 }} />
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontWeight: 600 }}>Matriz de Risco NR-01</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>Matriz de riscos psicossociais e plano de ação conforme NR-01.</div>
        </div>
      </div>
    </div>
  </div>
);

const ApresentacaoStep = ({ data, upd, onFinish, generating }) => (
  <div>
    <div style={{ fontSize: 14.5, marginBottom: 16 }}>Reunião que irá acontecer para a discussão sobre o plano de ação.</div>
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Data da reunião</div>
      <FInput value={data.apresentacaoData || ""} onChange={v => upd("apresentacaoData", v)} type="date" />
    </div>
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Observações</div>
      <textarea value={data.apresentacaoObs || ""} onChange={e => upd("apresentacaoObs", e.target.value)} style={{ width: "100%", height: 90, padding: 12, borderRadius: 10, border: "1px solid var(--line)" }} />
    </div>
  </div>
);

Object.assign(window, { NovoClienteFullPage });

// =====================================================
// Helpers de TESTE para fluxo de Proposta (7 etapas)
// =====================================================
window.__TEST_SEND_PROPOSAL_LINK_WIZARD = () => {
  const token = `p${Date.now().toString(36)}`;
  const link = `${location.origin}/?proposta=${encodeURIComponent(token)}`;
  console.log('%c[TEST] Link gerado para wizard:', 'color:#E87722', link);
  console.log('Use window.__TEST_ACCEPT_PROPOSAL("' + token + '") depois de abrir o link.');
  return link;
};

// =====================================================
// Helper de TESTE — simula envio do formulário via link
// Use: window.__SIMULAR_FORM_CADASTRO_NOVO()
// Depois vá para a etapa 1 (Cadastro) — os dados devem aparecer automaticamente
// =====================================================
window.__SIMULAR_FORM_CADASTRO_NOVO = () => {
  const token = "demo-" + Date.now().toString(36);
  const key = `MENCTOR_EMPRESA_FORM_${token}`;
  const payload = {
    razaoSocial: "Logtech Transportes e Logística Ltda",
    responsavel: "João Victor Almeida",
    email: "joao.almeida@logtech.com.br",
    telefone: "(21) 98700-1122",
    cnpj: "55.666.777/0001-88",
    qtdPorArea: { administrativo: "22", operacional: "95", vendas: "18", producao: "0", atendimento: "40", qualidade: "8" },
    qtdCargos: "29",
    segmento: "Logística e transporte",
    unidades: "Matriz + filial RJ",
    cidades: "Rio de Janeiro, Niterói",
    terceirizados: "15",
    possui: ["Técnico de Segurança do trabalho", "PGR - Programa de Gerenciamento de Riscos", "CIPA"],
    indicadores: ["Taxa de absenteísmo / faltas", "Afastamentos previdenciários (principalmente saúde mental)"],
    mapeamentoFormal: "Parcialmente",
    pesquisaClima: "Não",
    canaisEscuta: "Sim",
    fiscalizacaoEvidencia: "Sim",
    gestaoRiscosOutra: "",
    pressaoMetas: "Sim",
    ritmoIntenso: "Parcialmente",
    capacitacaoLideranca: "Não",
    conflitosRecorrentes: "Sim",
    assedioMoral: "Não",
    liderancaOutra: "Lideranças operacionais com pouca formação.",
    juridicoAcompanha: "Não",
    acaoTrabalhistaMental: "Sim",
    senteProtegida: "Não",
    juridicaOutra: "",
    excessoTrabalho: true,
    prazosInatingiveis: true,
    faltaControle: false,
    estruturaNaoAplica: false,
    estruturaOutra: "Motoristas em jornada externa.",
    trabalhaCom: ["Trabalho por turnos ou jornadas noturnas", "Terceirizados ou prestadores de serviços"],
    razao: "Logtech Transportes e Logística Ltda",
    nome: "Logtech",
    contatoNome: "João Victor Almeida",
    contatoEmail: "joao.almeida@logtech.com.br",
    contatoWhats: "(21) 98700-1122",
    submittedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
    console.log("%c[TEST] Payload salvo para fluxo /clientes/novo:", "color:#2F7D6F", key);
    console.log("%c[TEST] Abra /?cadastro-cliente ou vá para /clientes/novo e certifique-se de ter um formToken com este valor:", "color:#E87722", token);
    console.log("%c[TEST] Dica: defina data.formToken = '" + token + "' manualmente ou gere link com o modal.", "color:#838DA0");
    return { key, token, payload };
  } catch (e) { console.error(e); }
};
