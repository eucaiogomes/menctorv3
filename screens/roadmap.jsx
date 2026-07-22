/* global React, Icon, Page, CLIENTES, CLIENTE_ETAPAS, ETAPAS_CLIENTE, PortalPropostaScreen, PortalContratoScreen, RiskMedallion, getDiagnosticoResultadoMock */
const { useState, useEffect, useRef } = React;

// ════════════════════════════════════════════════════════════
// ETAPAS DO CLIENTE — 7 etapas (redesign UX solicitado)
// Cadastro (18 campos) • Proposta (preview + aceite) • Contrato • Sensibilização • Diagnóstico • Relatórios • Apresentação
// Seguindo boas práticas de UX: labels visíveis, agrupamento, progresso claro, cards, estados desabilitados, feedback
// ════════════════════════════════════════════════════════════

const RoadmapScreen = ({ navigate, params = {} }) => {
  const isNovoFlow = !!params.novo;

  // Para fluxo de "Novo cliente": NÃO criamos a empresa ainda.
  // Criamos apenas um "draft" local. Só materializamos no global CLIENTES quando o usuário clica em "Salvar Cadastro e Avançar".
  const [novoDraft, setNovoDraft] = useState(() => {
    if (isNovoFlow && !params.clienteId) {
      const id = `novo-${Date.now().toString(36)}`;
      return {
        id,
        name: "Nova Empresa",
        cnpj: "",
        contact: "",
        sector: "Serviços",
        employees: 50,
        status: "ativo",
        mrr: 3500,
        lastDiag: "-",
        risk: 2.0,
        color: "#2F7D6F",
        riskTrend: "stable",
        mainRisk: "",
        lastPulseDate: new Date().toLocaleDateString("pt-BR"),
        nextAction: "Preencher cadastro",
        healthScore: 55,
      };
    }
    return null;
  });

  let initialId = params.clienteId;
  if (!initialId && isNovoFlow && novoDraft) {
    initialId = novoDraft.id;
  }

  // Fallback para roadmap sem clienteId (usa o primeiro ativo)
  if (!initialId) {
    const currentAtivos = (window.CLIENTES || []).filter(c => c.status === "ativo" || c.status === "negociacao");
    initialId = currentAtivos[0]?.id;
  }

  const [clienteId, setClienteId] = useState(initialId);
  const [dbLoaded, setDbLoaded] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (clienteId && !isNovoFlow && window.MenctorDB && typeof window.MenctorDB.getClient === "function") {
      window.MenctorDB.getClient(clienteId).then(full => {
        if (mounted && full) {
          setDbLoaded(full);
          if (!window.CLIENTES) window.CLIENTES = [];
          const idx = window.CLIENTES.findIndex(x => x.id == clienteId);
          if (idx >= 0) window.CLIENTES[idx] = full;
          else window.CLIENTES.unshift(full);
          if (full.etapas) {
            if (!window.ETAPAS_CLIENTE) window.ETAPAS_CLIENTE = {};
            window.ETAPAS_CLIENTE[clienteId] = full.etapas;
          }
        }
      });
    }
    return () => { mounted = false; };
  }, [clienteId, isNovoFlow]);

  // Respeita ?etapa=1 da URL (usado ao clicar em cards para abrir direto no cadastro)
  const forcedEtapa = params.etapa ? parseInt(params.etapa, 10) : null;

  const [etapaSel, setEtapaSel] = useState(() => {
    if (isNovoFlow) return 1; // fluxo de novo cliente sempre começa no cadastro
    if (forcedEtapa && forcedEtapa >= 1 && forcedEtapa <= 7) return forcedEtapa;
    const saved = (window.ETAPAS_CLIENTE || {})[initialId];
    return (saved && saved.etapaAtual) || 1;
  });
  const [dropOpen, setDropOpen] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  // Estado local por cliente (persist simples via objeto global)
  const [etapasState, setEtapasState] = useState(() => {
    const base = JSON.parse(JSON.stringify(window.ETAPAS_CLIENTE || {}));
    // Garantir estrutura mínima para todos atuais
    const all = (window.CLIENTES || []).filter(c => c.status === "ativo" || c.status === "negociacao");
    all.forEach(c => {
      if (!base[c.id]) base[c.id] = (window.ETAPAS_ESTADO_INICIAL ? window.ETAPAS_ESTADO_INICIAL() : { etapaAtual: 1, status: {} });
    });
    // Para novo flow: inicializa o draft no etapasState local (sem tocar em CLIENTES ainda)
    if (novoDraft && !base[novoDraft.id]) {
      base[novoDraft.id] = (window.ETAPAS_ESTADO_INICIAL ? window.ETAPAS_ESTADO_INICIAL() : { etapaAtual: 1, status: { 1: { status: "em_andamento" } } });
    }
    return base;
  });

  const ativos = (window.CLIENTES || []).filter(c => c.status === "ativo" || c.status === "negociacao");
  // Para fluxo novo: usa o draft local enquanto não foi salvo
  const cliente = dbLoaded || (isNovoFlow && novoDraft)
    ? (novoDraft || dbLoaded)
    : (ativos.find(c => c.id === clienteId) || (window.CLIENTES || []).find(c => c.id === clienteId) || ativos[0]);
  const est = etapasState[clienteId] || (window.ETAPAS_ESTADO_INICIAL ? window.ETAPAS_ESTADO_INICIAL() : { etapaAtual: 1, status: {} });
  const etapas = window.CLIENTE_ETAPAS || [];

  const currentEtapa = etapas.find(e => e.n === etapaSel) || etapas[0];
  const pct = Math.round( (Object.values(est.status || {}).filter(s => s.status === "concluida" || s.aceito).length / 7) * 100 );

  // Esconde seletor de cliente:
  // - no fluxo "Novo cliente" (enquanto ainda é draft, antes de salvar)
  // - ou quando abriu um cliente específico (via card) e está na aba Cadastro (etapa 1) ou Proposta (etapa 2)
  //   Isso garante que ao enviar links de proposta para vários clientes, a aba fica travada no cliente que você abriu.
  const hideClientPicker = (isNovoFlow && !!novoDraft) || ((etapaSel === 1 || etapaSel === 2) && !!params.clienteId);

  // Materializa o draft em um cliente real no global CLIENTES (chamado só no salvar)
  const materializeNovoCliente = (patch = {}) => {
    if (!isNovoFlow || !novoDraft) return clienteId;

    const id = novoDraft.id;

    const realCliente = {
      ...novoDraft,
      name: patch.razaoSocial || patch.nome || novoDraft.name || "Nova Empresa",
      cnpj: patch.cnpj || novoDraft.cnpj || "",
      contact: patch.responsavel || patch.contatoNome || novoDraft.contact || "",
      sector: patch.segmento || novoDraft.sector || "Serviços",
      // podemos enriquecer mais campos se necessário
    };

    if (!window.CLIENTES) window.CLIENTES = [];
    if (!window.CLIENTES.some(c => c.id === id)) {
      window.CLIENTES.unshift(realCliente);
    }

    // Garante que o etapasState para este id está presente
    setEtapasState(prev => {
      const next = { ...prev };
      if (!next[id]) next[id] = { etapaAtual: 1, status: {} };
      return next;
    });

    // Limpa o draft → a partir de agora o cliente vem da lista global
    setNovoDraft(null);

    return id;
  };

  const updEtapa = (n, patch) => {
    setEtapasState(prev => {
      const next = { ...prev };
      if (!next[clienteId]) next[clienteId] = { etapaAtual: 1, status: {} };
      next[clienteId].status[n] = { ...(next[clienteId].status[n] || {}), ...patch };
      // Avança automático quando marca como concluído
      if ((patch.status === "concluida" || patch.aceito === true) && (next[clienteId].etapaAtual || 1) === n && n < 7) {
        next[clienteId].etapaAtual = n + 1;
      }
      return next;
    });

    // Sincroniza o nome do cliente a partir do cadastro (útil no fluxo de /clientes/novo)
    if (n === 1 && patch.razaoSocial) {
      if (isNovoFlow && novoDraft) {
        setNovoDraft(prev => prev ? { ...prev, name: patch.razaoSocial } : prev);
      } else {
        const found = (window.CLIENTES || []).find(c => c.id === clienteId);
        if (found && (!found.name || found.name === "Nova Empresa" || found.name === "Novo Cliente")) {
          found.name = patch.razaoSocial;
        }
      }
    }

    // Persist step data to Supabase
    if (window.MenctorDB && typeof window.MenctorDB.saveStepProgress === "function" && clienteId) {
      const extra = { ...patch };
      delete extra.status;
      window.MenctorDB.saveStepProgress(clienteId, n, patch.status || "em_andamento", extra).catch(err => {
        console.error("Erro saveStepProgress:", err);
      });
    }

    // Always save the cadastro form data for step 1 (maps camel <-> snake)
    // but skip for novo (handled inside the create block)
    if (n === 1 && window.MenctorDB && typeof window.MenctorDB.saveCadastro === "function" && clienteId && !(isNovoFlow && novoDraft)) {
      window.MenctorDB.saveCadastro(clienteId, patch).catch(err => {
        console.error("Erro saveCadastro:", err);
      });
    }

    // No fluxo de novo: cria no Supabase quando salva o cadastro
    if (n === 1 && patch.status === "concluida" && isNovoFlow && novoDraft) {
      (async () => {
        try {
          if (window.MenctorDB && typeof window.MenctorDB.createClient === "function") {
            const created = await window.MenctorDB.createClient({
              name: patch.razaoSocial || novoDraft.name,
              cnpj: patch.cnpj || "",
              contact: patch.responsavel || "",
              mrr: patch.mrr || novoDraft.mrr,
            });
            if (window.MenctorDB.saveCadastro) {
              await window.MenctorDB.saveCadastro(created.id, patch);
            }
            setClienteId(created.id);
            setNovoDraft(null);
            console.log("Novo cliente criado no Supabase:", created.id);
          } else {
            materializeNovoCliente(patch);
          }
        } catch (err) {
          console.error("Erro ao criar cliente no Supabase:", err);
          alert("Erro ao salvar no Supabase: " + err.message);
          // fallback to local
          materializeNovoCliente(patch);
        }
      })();
    }
  };

  const setEtapaAtual = (n) => {
    setEtapaSel(n);
    setEtapasState(prev => {
      const next = { ...prev };
      if (next[clienteId]) next[clienteId].etapaAtual = n;
      return next;
    });
  };

  const switchCliente = (id) => {
    setClienteId(id);
    const cEst = etapasState[id] || {};
    setEtapaSel(cEst.etapaAtual || 1);
    setDropOpen(false);
  };

  if (!cliente) {
    return (
      <Page>
        <div style={{ textAlign: "center", padding: "100px 0", color: "var(--ink-muted)" }}>
          <Icon name="users" size={44} />
          <p style={{ marginTop: 18 }}>Nenhum cliente encontrado.</p>
          <button className="btn btn-primary" onClick={() => navigate("clientes")}>Voltar para Clientes</button>
        </div>
      </Page>
    );
  }

  // Persist simplificado no window para demo
  window.ETAPAS_CLIENTE = etapasState;

  return (
    <Page>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Aba Clientes</div>
          <h1 className="display" style={{ fontSize: 36, margin: 0 }}>{(isNovoFlow && !!novoDraft) ? "Cadastrar novo cliente" : "Etapas do Projeto"}</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "var(--ink-muted)" }}>
            {(isNovoFlow && !!novoDraft)
              ? "Preencha o cadastro completo. Esta é a primeira etapa do projeto."
              : "Acompanhe o fluxo completo do cliente: do cadastro à apresentação do plano de ação."}
          </p>
        </div>

        {/* Seletor de cliente — oculto no fluxo de novo cliente e nas abas Cadastro/Proposta quando cliente específico foi aberto via card */}
        {!hideClientPicker && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setDropOpen(!dropOpen)} className="btn btn-soft" style={{ height: 40, gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: cliente.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{cliente.name[0]}</span>
              {cliente.name}
              <Icon name="chevron-down" size={14} />
            </button>
            {dropOpen && (
              <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 6, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "var(--shadow-modal)", zIndex: 50, minWidth: 240, padding: 6 }}>
                {ativos.map(c => (
                  <button key={c.id} onClick={() => switchCliente(c.id)} style={{ width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 8, background: c.id === clienteId ? "var(--surface-sage)" : "transparent", display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, background: c.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{c.name[0]}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Indicador estático (sem seletor) quando na aba cadastro ou proposta de um cliente aberto via card */}
        {hideClientPicker && !isNovoFlow && cliente && (
          <div style={{ display: "flex", alignItems: "center", height: 40, padding: "0 8px 0 10px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--line)", fontSize: 13, fontWeight: 600, color: "var(--ink)", gap: 8, pointerEvents: "none", userSelect: "none" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: cliente.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{cliente.name[0]}</span>
            {cliente.name}
          </div>
        )}
      </div>

      {/* STEPPER 7 ETAPAS — UX clara */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto", paddingBottom: 6 }}>
        {etapas.map((et, idx) => {
          const s = est.status[et.n] || {};
          const isDone = s.status === "concluida" || s.aceito === true;
          const isActive = et.n === etapaSel;
          const isCurrent = et.n === (est.etapaAtual || 1);
          return (
            <button
              key={et.n}
              onClick={() => setEtapaAtual(et.n)}
              style={{
                flex: 1, minWidth: 108, padding: "10px 12px", borderRadius: 10,
                border: isActive ? "2px solid var(--health)" : "1px solid var(--line)",
                background: isActive ? "var(--surface-sage)" : "var(--surface)",
                textAlign: "left", display: "flex", flexDirection: "column", gap: 2,
                cursor: "pointer", transition: "all .15s"
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 999, fontSize: 10, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: isDone ? "var(--health)" : isActive || isCurrent ? "var(--ink)" : "var(--canvas-warm)",
                  color: isDone || isActive || isCurrent ? "#fff" : "var(--ink-muted)",
                }}>
                  {isDone ? <Icon name="check" size={10} color="#fff" /> : et.n}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 600, color: "var(--ink)" }}>{et.label}</span>
              </div>
              {isCurrent && !isDone && <span style={{ fontSize: 10, color: "var(--health-deep)" }}>Atual</span>}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Progresso geral</div>
        <div style={{ flex: 1, height: 6, background: "var(--line)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--health)", transition: "width .4s" }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--health-deep)", minWidth: 44 }}>{pct}%</div>
      </div>

      {/* PAINEL DA ETAPA ATUAL — conteúdo específico */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--line)",
          background: "var(--surface)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12
        }}>
          <div>
            <div className="eyebrow">Etapa {currentEtapa.n} de 7</div>
            <h2 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700 }}>{currentEtapa.label}</h2>
            <p style={{ margin: "6px 0 0", color: "var(--ink-muted)", fontSize: 14 }}>{currentEtapa.desc}</p>
          </div>
          {etapaSel === 1 && (
            <button
              onClick={() => setShowFormModal(true)}
              className="btn btn-ghost"
              style={{ height: 38, padding: "0px 16px", flexShrink: 0 }}
            >
              <Icon name="send" size={13} /> Enviar formulário
            </button>
          )}
        </div>

        <div style={{ padding: 24 }}>
          {/* 1. CADASTRO — 18 perguntas/ campos solicitados */}
          {etapaSel === 1 && (
            <Cadastro18Form
              cliente={cliente}
              data={est.status[1] || {}}
              onSave={(patch) => updEtapa(1, { ...patch, status: "concluida" })}
              onNext={() => setEtapaAtual(2)}
              onDraftNameChange={(newName) => {
                if (isNovoFlow && novoDraft) {
                  setNovoDraft(d => d ? { ...d, name: newName } : d);
                }
              }}
            />
          )}

          {/* 2. PROPOSTA — mostra em tela, enviar link, checkbox aceitar (como contratos) */}
          {etapaSel === 2 && (
            <PropostaEtapa
              cliente={cliente}
              cadastro={{ ...(cliente.cadastro || {}), ...(est.status[1] || {}) }}
              data={est.status[2] || {}}
              onUpdate={(patch) => updEtapa(2, patch)}
              onNext={() => setEtapaAtual(3)}
            />
          )}

          {/* 3. CONTRATO — aceite com check */}
          {etapaSel === 3 && (
            <ContratoEtapa
              cliente={cliente}
              cadastro={{ ...(cliente.cadastro || {}), ...(est.status[1] || {}) }}
              data={est.status[3] || {}}
              onUpdate={(patch) => updEtapa(3, patch)}
              onNext={() => setEtapaAtual(4)}
            />
          )}

          {/* 4. SENSIBILIZAÇÃO — cards simples */}
          {etapaSel === 4 && (
            <SensibilizacaoEtapa
              data={est.status[4] || {}}
              onUpdate={(patch) => updEtapa(4, patch)}
              onNext={() => setEtapaAtual(5)}
            />
          )}

          {/* 5. DIAGNÓSTICO — Selecionar COPSOQII, DRPS e clima organizacional */}
          {etapaSel === 5 && (
            <DiagnosticoEtapa
              data={est.status[5] || {}}
              onUpdate={(patch) => updEtapa(5, patch)}
              onNext={() => setEtapaAtual(6)}
            />
          )}

          {/* 6. RELATÓRIOS — liberada automaticamente quando o Diagnóstico (etapa 5) é concluído */}
          {etapaSel === 6 && (
            <RelatoriosEtapa
              cliente={cliente}
              diagnosticoData={est.status[5] || {}}
              data={est.status[6] || {}}
              onUpdate={(patch) => updEtapa(6, patch)}
              onNext={() => setEtapaAtual(7)}
            />
          )}

          {/* 7. APRESENTAÇÃO — Reunião para discussão do plano de ação */}
          {etapaSel === 7 && (
            <ApresentacaoEtapa
              data={est.status[7] || {}}
              onUpdate={(patch) => updEtapa(7, patch)}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 12, color: "var(--ink-muted)" }}>
        Use os botões da etapa para avançar. Aceites do cliente são registrados aqui (simulação de portal).
      </div>

      {showFormModal && (
        <SendFormModalRoadmap
          cliente={cliente}
          formToken={(est.status[1] || {}).formToken}
          onTokenCreated={(tok) => updEtapa(1, { formToken: tok })}
          onClose={() => setShowFormModal(false)}
        />
      )}
    </Page>
  );
};

// ════════════════════════════════════════════════════════════
// 1. CADASTRO — Formulário com as 18 perguntas exatas
// UX: labels visíveis, agrupamentos lógicos, inputs acessíveis
// ════════════════════════════════════════════════════════════
const Cadastro18Form = ({ cliente, data, onSave, onNext, onDraftNameChange }) => {
  const [form, setForm] = useState({
    razaoSocial: data.razaoSocial || cliente.name || "",
    responsavel: data.responsavel || "",
    email: data.email || "",
    telefone: data.telefone || "",
    cnpj: data.cnpj || cliente.cnpj || "",
    qtdPorArea: data.qtdPorArea || { administrativo: "", operacional: "", vendas: "", producao: "", atendimento: "", qualidade: "" },
    qtdCargos: data.qtdCargos || "",
    segmento: data.segmento || cliente.sector || "",
    unidades: data.unidades || "1",
    cidades: data.cidades || "",
    terceirizados: data.terceirizados || "",
    possui: data.possui || [],
    indicadores: data.indicadores || [],
    // 14
    mapeamentoFormal: data.mapeamentoFormal || "",
    pesquisaClima: data.pesquisaClima || "",
    canaisEscuta: data.canaisEscuta || "",
    fiscalizacaoEvidencia: data.fiscalizacaoEvidencia || "",
    gestaoRiscosOutra: data.gestaoRiscosOutra || "",
    // 15
    pressaoMetas: data.pressaoMetas || "",
    ritmoIntenso: data.ritmoIntenso || "",
    capacitacaoLideranca: data.capacitacaoLideranca || "",
    conflitosRecorrentes: data.conflitosRecorrentes || "",
    assedioMoral: data.assedioMoral || "",
    liderancaOutra: data.liderancaOutra || "",
    // 16
    juridicoAcompanha: data.juridicoAcompanha || "",
    acaoTrabalhistaMental: data.acaoTrabalhistaMental || "",
    senteProtegida: data.senteProtegida || "",
    juridicaOutra: data.juridicaOutra || "",
    // 17
    excessoTrabalho: data.excessoTrabalho || false,
    prazosInatingiveis: data.prazosInatingiveis || false,
    faltaControle: data.faltaControle || false,
    estruturaNaoAplica: data.estruturaNaoAplica || false,
    estruturaOutra: data.estruturaOutra || "",
    // 18
    trabalhaCom: data.trabalhaCom || [],
  });

  const [importBanner, setImportBanner] = useState(null);

  // Auto-detecta envios do formulário público — AGORA SCOPED POR SESSÃO/TOKEN
  // Evita conflito quando vários clientes preenchem links diferentes ao mesmo tempo.
  // Só reage ao token gerado especificamente para *este* cliente (armazenado em data.formToken).
  useEffect(() => {
    const formToken = data.formToken;
    if (!formToken) return; // sem token associado a esta sessão → não importa nada de outros links

    const checkSpecificToken = () => {
      try {
        const key = `MENCTOR_EMPRESA_FORM_${formToken}`;
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const payload = JSON.parse(raw);
        if (payload && (payload.razaoSocial || payload.nome || payload.contatoNome || payload.responsavel || payload.razao)) {
          setImportBanner(payload);
        }
      } catch (_) {}
    };

    checkSpecificToken();

    // Poll + storage event para detectar envio em tempo real (mesmo se o form já estiver aberto)
    const interval = setInterval(checkSpecificToken, 1500);
    const onStorage = (e) => {
      if (e.key === `MENCTOR_EMPRESA_FORM_${formToken}`) {
        checkSpecificToken();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, [data.formToken]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArray = (k, val) => {
    setForm(f => {
      const arr = f[k] || [];
      return { ...f, [k]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  };

  const handleSubmit = () => {
    console.log("[Cadastro] Salvando...", form);
    onSave({ ...form, aceito: true });
    onNext && onNext();
  };

  const areas = ["administrativo", "operacional", "vendas", "producao", "atendimento", "qualidade"];
  const possuiList = ["Técnico de Segurança do trabalho", "CIPA", "PGR - Programa de Gerenciamento de Riscos", "AEP - Análise Ergonômica Preliminar", "OS - Ordens de Serviços de todas as funções", "Modelo de Plano de ação de medidas preventivas", "GRO - Gerenciamento de Riscos Ocupacionais", "SESMT", "Outra"];
  const indicadoresList = ["Turnover médio dos últimos 12 meses", "Taxa de absenteísmo / faltas", "Afastamentos previdenciários (principalmente saúde mental)", "Horas extras frequentes", "Áreas com maior rotatividade ou desgaste", "Outros"];
  const trabalhaList = ["Metas individuais ou coletivas agressivas", "Trabalho por turnos ou jornadas noturnas", "Home office / híbrido", "Terceirizados ou prestadores de serviços", "Horários normais de trabalho"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Preencha os dados completos da empresa. Estes campos compõem a etapa de Cadastro.</div>

      {importBanner && (
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--surface-sage)", border: "1px solid var(--health-soft)", display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
          <div style={{ flex: 1 }}>
            <Icon name="check" size={15} color="var(--health-deep)" style={{ marginRight: 6 }} />
            Formulário recebido de <strong>{importBanner.nome || importBanner.razao || importBanner.razaoSocial}</strong>. Importar <strong>todas as 18 perguntas</strong> do cadastro agora?
          </div>
          <button
            className="btn btn-primary"
            style={{ height: 30, padding: "0 12px", fontSize: 12.5 }}
            onClick={() => {
              const p = importBanner;
              const newRazao = p.razaoSocial || p.razao || p.nome;
              // Preenchimento automático completo: aplica todos os campos do formulário público
              setForm(f => ({
                ...f,
                ...p,
                razaoSocial: newRazao || f.razaoSocial,
                responsavel: p.responsavel || p.contatoNome || f.responsavel,
                email: p.email || p.contatoEmail || f.email,
                telefone: p.telefone || p.contatoWhats || f.telefone,
                cnpj: p.cnpj || f.cnpj,
                segmento: p.segmento || f.segmento,
                unidades: p.unidades || f.unidades,
                qtdPorArea: p.qtdPorArea || f.qtdPorArea,
                possui: p.possui || f.possui || [],
                indicadores: p.indicadores || f.indicadores || [],
                trabalhaCom: p.trabalhaCom || f.trabalhaCom || [],
              }));
              // Atualiza nome do cliente imediatamente
              if (newRazao && cliente && (!cliente.name || cliente.name === "Nova Empresa")) {
                cliente.name = newRazao;
              }
              // Para o draft do novo cliente, avisa o pai para atualizar o state e re-renderizar
              if (newRazao && onDraftNameChange) {
                onDraftNameChange(newRazao);
              }
              // Limpa o banner e opcionalmente marca como importado para esta sessão
              setImportBanner(null);
              // (Opcional) podemos remover o payload do LS se não quisermos re-aplicar, mas mantemos por segurança
            }}
          >
            Aplicar (preencher automático)
          </button>
          <button className="btn btn-ghost" style={{ height: 30, padding: "0 10px", fontSize: 12.5 }} onClick={() => setImportBanner(null)}>Fechar</button>
        </div>
      )}

      {/* 1-5 */}
      <div>
        <SectionTitle>1. Razão Social da Empresa</SectionTitle>
        <FInput value={form.razaoSocial} onChange={v => upd("razaoSocial", v)} placeholder="Razão Social da Empresa" />
      </div>
      <div>
        <SectionTitle>2. Nome do responsável pela implantação dos Riscos Psicossociais</SectionTitle>
        <FInput value={form.responsavel} onChange={v => upd("responsavel", v)} placeholder="Nome completo" />
      </div>
      <FRow>
        <div style={{ flex: 1 }}>
          <SectionTitle>3. E-mail</SectionTitle>
          <FInput value={form.email} onChange={v => upd("email", v)} type="email" placeholder="responsavel@empresa.com.br" />
        </div>
        <div style={{ flex: 1 }}>
          <SectionTitle>4. Telefone</SectionTitle>
          <FInput value={form.telefone} onChange={v => upd("telefone", v)} placeholder="(11) 99999-9999" />
        </div>
      </FRow>
      <div>
        <SectionTitle>5. CNPJ</SectionTitle>
        <FInput value={form.cnpj} onChange={v => upd("cnpj", v)} placeholder="00.000.000/0000-00" />
      </div>

      {/* 6 */}
      <div>
        <SectionTitle>6. Quantidade de colaboradores por área</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          {areas.map(a => (
            <MiniField key={a} label={a.charAt(0).toUpperCase() + a.slice(1)}>
              <FInput value={form.qtdPorArea[a]} onChange={v => upd("qtdPorArea", { ...form.qtdPorArea, [a]: v })} placeholder="0" type="number" />
            </MiniField>
          ))}
        </div>
      </div>

      {/* 7-11 */}
      <FRow>
        <div style={{ flex: 1 }}>
          <SectionTitle>7. Quantidade de cargos existentes</SectionTitle>
          <FInput value={form.qtdCargos} onChange={v => upd("qtdCargos", v)} type="number" placeholder="42" />
        </div>
        <div style={{ flex: 1 }}>
          <SectionTitle>8. Segmento de atuação</SectionTitle>
          <FInput value={form.segmento} onChange={v => upd("segmento", v)} placeholder="indústria, serviços, call center, TI..." />
        </div>
      </FRow>
      <FRow>
        <div style={{ flex: 1 }}>
          <SectionTitle>9. Número de estabelecimentos / unidades</SectionTitle>
          <FInput value={form.unidades} onChange={v => upd("unidades", v)} placeholder="Matriz + 3 filiais" />
        </div>
        <div style={{ flex: 1 }}>
          <SectionTitle>10. Cidades a serem abrangidas</SectionTitle>
          <FInput value={form.cidades} onChange={v => upd("cidades", v)} placeholder="São Paulo, Rio, Belo Horizonte..." />
        </div>
      </FRow>
      <div>
        <SectionTitle>11. Quantidade de colaboradores terceirizados (matriz e filiais)</SectionTitle>
        <FInput value={form.terceirizados} onChange={v => upd("terceirizados", v)} placeholder="Ex.: 35 na matriz, 12 na filial SP" />
      </div>

      {/* 12 */}
      <div>
        <SectionTitle>12. A empresa possui:</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
          {possuiList.map(item => (
            <label key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, padding: "6px 4px", cursor: "pointer" }}>
              <input type="checkbox" checked={form.possui.includes(item)} onChange={() => toggleArray("possui", item)} style={{ marginTop: 3 }} />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* 13 */}
      <div>
        <SectionTitle>13. A empresa possui indicadores de:</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
          {indicadoresList.map(item => (
            <label key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, padding: "6px 4px", cursor: "pointer" }}>
              <input type="checkbox" checked={form.indicadores.includes(item)} onChange={() => toggleArray("indicadores", item)} style={{ marginTop: 3 }} />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* 14-17: perguntas com opções + outra */}
      <div>
        <SectionTitle>14. Gestão de riscos psicossociais (alinhamento com a NR-1 revisada)</SectionTitle>
        <QuestionYesNo label="Existe algum mapeamento formal de riscos psicossociais?" value={form.mapeamentoFormal} onChange={v => upd("mapeamentoFormal", v)} />
        <QuestionYesNo label="A empresa já realizou pesquisa de clima organizacional?" value={form.pesquisaClima} onChange={v => upd("pesquisaClima", v)} />
        <QuestionYesNo label="Existem canais formais de escuta e denúncia?" value={form.canaisEscuta} onChange={v => upd("canaisEscuta", v)} />
        <QuestionYesNo label="Se houver fiscalização, a empresa consegue demonstrar método e evidência desse controle?" value={form.fiscalizacaoEvidencia} onChange={v => upd("fiscalizacaoEvidencia", v)} />
        <MiniField label="Outra (descreva)"><FInput value={form.gestaoRiscosOutra} onChange={v => upd("gestaoRiscosOutra", v)} /></MiniField>
      </div>

      <div>
        <SectionTitle>15. Liderança e organização do trabalho (identificando riscos sistêmicos)</SectionTitle>
        <QuestionYesNo label="Pressão por metas é frequente?" value={form.pressaoMetas} onChange={v => upd("pressaoMetas", v)} />
        <QuestionYesNo label="Ritmo de trabalho intenso ou imprevisível?" value={form.ritmoIntenso} onChange={v => upd("ritmoIntenso", v)} />
        <QuestionYesNo label="Lideranças recebem capacitação em gestão de pessoas?" value={form.capacitacaoLideranca} onChange={v => upd("capacitacaoLideranca", v)} />
        <QuestionYesNo label="Há conflitos recorrentes ou queixas informais?" value={form.conflitosRecorrentes} onChange={v => upd("conflitosRecorrentes", v)} />
        <QuestionYesNo label="Há assédio moral e conflitos recorrentes?" value={form.assedioMoral} onChange={v => upd("assedioMoral", v)} />
        <MiniField label="Outra"><FInput value={form.liderancaOutra} onChange={v => upd("liderancaOutra", v)} /></MiniField>
      </div>

      <div>
        <SectionTitle>16. Aspectos jurídicos e governança (envolvimento da direção)</SectionTitle>
        <QuestionYesNo label="Existe um Jurídico que acompanha as questões de saúde e segurança no trabalho?" value={form.juridicoAcompanha} onChange={v => upd("juridicoAcompanha", v)} />
        <QuestionYesNo label="Já houve fiscalização ou ação trabalhista relacionada a adoecimento mental na empresa?" value={form.acaoTrabalhistaMental} onChange={v => upd("acaoTrabalhistaMental", v)} />
        <QuestionYesNo label="Hoje a empresa se sente protegida?" value={form.senteProtegida} onChange={v => upd("senteProtegida", v)} />
        <MiniField label="Outra"><FInput value={form.juridicaOutra} onChange={v => upd("juridicaOutra", v)} /></MiniField>
      </div>

      <div>
        <SectionTitle>17. Estrutura das atividades</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["excessoTrabalho", "Há excesso de trabalho"],
            ["prazosInatingiveis", "Há prazos por metas inatingíveis"],
            ["faltaControle", "Falta de controle sobre a forma como o trabalho é executado"],
            ["estruturaNaoAplica", "Não se aplica"],
          ].map(([k, l]) => (
            <label key={k} style={{ display: "flex", gap: 10, fontSize: 14 }}>
              <input type="checkbox" checked={!!form[k]} onChange={e => upd(k, e.target.checked)} /> {l}
            </label>
          ))}
        </div>
        <MiniField label="Outra"><FInput value={form.estruturaOutra} onChange={v => upd("estruturaOutra", v)} /></MiniField>
      </div>

      <div>
        <SectionTitle>18. A empresa trabalha com:</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
          {trabalhaList.map(item => (
            <label key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
              <input type="checkbox" checked={form.trabalhaCom.includes(item)} onChange={() => toggleArray("trabalhaCom", item)} style={{ marginTop: 3 }} />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button onClick={handleSubmit} className="btn btn-accent" style={{ height: 44 }}>
          <Icon name="check" size={16} /> Salvar Cadastro e Avançar
        </button>
        <button onClick={onNext} className="btn btn-soft" style={{ height: 44 }}>Ir para Proposta</button>
      </div>
    </div>
  );
};

const SectionTitle = ({ children }) => <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".04em", color: "var(--ink-muted)", marginBottom: 6, textTransform: "uppercase" }}>{children}</div>;
const FRow = ({ children }) => <div style={{ display: "flex", gap: 14 }}>{children}</div>;
const FInput = ({ value, onChange, ...p }) => <input value={value || ""} onChange={e => onChange(e.target.value)} {...p} style={{ width: "100%", height: 42, padding: "0 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", fontSize: 14 }} />;
const MiniField = ({ label, children }) => <div><div style={{ fontSize: 11, color: "var(--ink-muted)", marginBottom: 3 }}>{label}</div>{children}</div>;
const QuestionYesNo = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 13.5, marginBottom: 4 }}>{label}</div>
    <div style={{ display: "flex", gap: 8 }}>
      {["Sim", "Não", "Parcialmente"].map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 13, border: value === opt ? "1px solid var(--health)" : "1px solid var(--line)", background: value === opt ? "var(--surface-sage)" : "var(--surface)" }}>{opt}</button>
      ))}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// 2. PROPOSTA — tela com preview + encaminhar link + checkbox aceitar (espelha contrato)
// ════════════════════════════════════════════════════════════
const PropostaEtapa = ({ cliente, data, onUpdate, onNext }) => {
  const [aceito, setAceito] = useState(!!data.aceito);
  const [showSendModal, setShowSendModal] = useState(false);

  // Token consistente para o link que será enviado (mesmo usado no modal)
  const propostaToken = cliente?.id || `prop-${Date.now().toString(36)}`;
  const link = `${window.location.origin}/?proposta=${encodeURIComponent(propostaToken)}`;

  // Valor do investimento editável nesta etapa (inicializa do data salvo ou do cliente)
  const [investimento, setInvestimento] = useState(() => {
    return data.mrr != null ? data.mrr : (cliente?.mrr ?? 3500);
  });

  // Sincroniza snapshot imediatamente para que o preview e o link usem o valor atual
  const saveProposalSnapshot = (val) => {
    try {
      const snap = {
        id: propostaToken,
        empresa: cliente?.name || "Empresa",
        contato: cliente?.contact || "",
        email: cliente?.email || "",
        funcionarios: cliente?.employees || 100,
        valor: val,
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(`MENCTOR_PROPOSAL_${propostaToken}`, JSON.stringify(snap));
    } catch (_) {}
  };

  useEffect(() => {
    saveProposalSnapshot(investimento);
  }, [investimento, cliente?.name, cliente?.employees, propostaToken]);

  // Sincroniza se o valor vier de fora (ex: carregado de dados salvos da etapa)
  useEffect(() => {
    if (data.mrr != null) {
      setInvestimento(data.mrr);
    }
  }, [data.mrr]);

  const marcarAceite = () => {
    const novo = !aceito;
    setAceito(novo);
    const patch = { aceito: novo, status: novo ? "concluida" : "em_andamento" };
    if (novo) {
      patch.propostaAceitaEm = new Date().toISOString();
    }
    onUpdate(patch);
  };

  // Auto-detect acceptance from the public portal link (MENCTOR_PROPOSAL_ACCEPTED_*)
  // Agora mais scoped: prioriza o token baseado no cliente.id atual (travado quando seletor escondido na aba)
  // Evita que envios para múltiplos clientes diferentes interfiram uns nos outros.
  useEffect(() => {
    const checkAcceptance = () => {
      try {
        // Prioridade 1: chave exata baseada no id do cliente atual (mais confiável)
        if (cliente?.id) {
          const specificKey = `MENCTOR_PROPOSAL_ACCEPTED_${cliente.id}`;
          const raw = localStorage.getItem(specificKey);
          if (raw) {
            const acc = JSON.parse(raw);
            if (acc.acceptedAt && !aceito) {
              setAceito(true);
              onUpdate({ aceito: true, status: "concluida", propostaAceitaEm: acc.acceptedAt });
              return;
            }
          }
        }

        // Fallback: scan geral mas com match estrito no cliente atual
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("MENCTOR_PROPOSAL_ACCEPTED_")) keys.push(k);
        }
        const match = keys.find(k => {
          try {
            const p = JSON.parse(localStorage.getItem(k) || "{}");
            if (!p.id || !cliente) return false;
            // Match estrito: id ou nome exato do cliente que está sendo visualizado agora
            return p.id === cliente.id || p.empresa === cliente.name;
          } catch (_) { return false; }
        });
        if (match) {
          const acc = JSON.parse(localStorage.getItem(match) || "{}");
          if (acc.acceptedAt && !aceito) {
            setAceito(true);
            onUpdate({ aceito: true, status: "concluida", propostaAceitaEm: acc.acceptedAt });
          }
        }
      } catch (_) {}
    };
    checkAcceptance();
    const iv = setInterval(checkAcceptance, 2000);
    window.addEventListener("storage", checkAcceptance);
    window.addEventListener("menctor:proposal-accepted", checkAcceptance);
    return () => { clearInterval(iv); window.removeEventListener("storage", checkAcceptance); window.removeEventListener("menctor:proposal-accepted", checkAcceptance); };
  }, [cliente, aceito, onUpdate]);

  // Preview EXATAMENTE igual ao que o cliente vê no link (?proposta=...)
  // Replicamos a estrutura, textos e seções do PortalPropostaScreen (incluindo timeline e quote)
  const PreviewProposta = () => {
    const fmt = (n) => Number(n || 0).toLocaleString("pt-BR");
    const ticket = cliente.employees ? (investimento / cliente.employees) : 16.11;
    const empresa = cliente.name || "sua empresa";
    const funcs = cliente.employees || 100;
    const contato = cliente.contact || "gestor(a)";

    return (
      <div style={{ 
        background: "var(--canvas)", 
        border: "1px solid var(--line)", 
        borderRadius: 12, 
        overflow: "hidden", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        fontSize: "11px",
        lineHeight: "1.3"
      }}>
        {/* browser bar exato */}
        <div style={{
          background: "var(--surface-2)", borderBottom: "1px solid var(--line)",
          padding: "6px 10px", display: "flex", alignItems: "center", gap: 8, fontSize: 9, color: "var(--ink-muted)"
        }}>
          <Icon name="globe" size={11} />
          <span>menctor.com.br/portal/{(empresa).toLowerCase().replace(/\s+/g, "-").slice(0, 18)}</span>
          <span style={{ marginLeft: "auto", fontSize: 8 }}>Visão do cliente · proposta comercial</span>
        </div>

        <div style={{ padding: "10px 12px", flex: 1, overflow: "auto" }}>
          {/* hero */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 8, color: "var(--health-deep)", fontWeight: 600, marginBottom: 3 }}>Proposta para {empresa}</div>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
              Saúde psicossocial,<br/>com tranquilidade<br/><span style={{ fontStyle: "italic", color: "var(--health-deep)" }}>e conformidade NR-1.</span>
            </div>
            <div style={{ fontSize: 9, color: "var(--ink-soft)" }}>
              Olá, <strong>{contato}</strong>. Preparei esta proposta personalizada para {empresa}. O plano cobre {funcs} colaboradores.
            </div>
          </div>

          {/* SUMMARY — EXATAMENTE como no portal */}
          <div style={{ 
            background: "#fff", 
            border: "1px solid var(--line)", 
            borderRadius: 8, 
            padding: "10px", 
            marginBottom: 10, 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr 1fr", 
            gap: 8 
          }}>
            <div>
              <div style={{ fontSize: 8, color: "var(--ink-muted)", textTransform: "uppercase" }}>Investimento mensal</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, color: "var(--ink)", lineHeight: 1, marginTop: 1 }}>
                R$ {fmt(investimento)}
              </div>
              <div style={{ fontSize: 8, color: "var(--ink-muted)", marginTop: 1 }}>Contrato de 12 meses · sem fidelidade após</div>
            </div>
            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 6 }}>
              <div style={{ fontSize: 8, color: "var(--ink-muted)", textTransform: "uppercase" }}>Colaboradores cobertos</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, color: "var(--ink)", lineHeight: 1, marginTop: 1 }}>
                {funcs}
              </div>
              <div style={{ fontSize: 8, color: "var(--ink-muted)", marginTop: 1 }}>
                R$ {ticket.toFixed(2).replace(".", ",")} por colaborador / mês
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 6 }}>
              <div style={{ fontSize: 8, color: "var(--ink-muted)", textTransform: "uppercase" }}>Implantação</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, color: "var(--ink)", lineHeight: 1, marginTop: 1 }}>
                7<span style={{ fontSize: 10, color: "var(--ink-muted)" }}> dias</span>
              </div>
              <div style={{ fontSize: 8, color: "var(--ink-muted)", marginTop: 1 }}>Primeiro diagnóstico em até 14 dias</div>
            </div>
          </div>

          {/* O que está incluído — copiado fielmente do portal com FeatureCards compactos */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 10, marginBottom: 3 }}>O que está incluído</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {[
                { icon: "pulse", title: "Diagnóstico COPSOQ II completo", desc: "Padrão exigido pela NR-1. 41 questões validadas internacionalmente, mapeando 12 dimensões psicossociais." },
                { icon: "shield", title: "Conformidade NR-1 garantida", desc: "Relatórios prontos para fiscalização, com plano de ação documentado e revisão trimestral." },
                { icon: "users", title: "Vitrine para colaboradores", desc: "Portal próprio onde sua equipe responde diagnósticos e acessa conteúdos. Sua marca, seu domínio." },
                { icon: "book", title: "Trilhas de aprendizado", desc: "6 trilhas sobre saúde mental, liderança humanizada, regulação emocional e resiliência." },
                { icon: "spark", title: "Pulse surveys mensais", desc: "Monitoramento contínuo com 10 questões rápidas — para acompanhar evolução entre diagnósticos." },
                { icon: "file", title: "Relatórios executivos", desc: "Dashboards por setor, unidade e organização. Exportação em PDF e Excel sempre que precisar." },
              ].map((f, i) => (
                <div key={i} style={{ padding: 4, background: "var(--surface)", borderRadius: 5, border: "1px solid var(--line)", fontSize: 6.5 }}>
                  <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 7.5 }}>{f.title}</div>
                  <div style={{ color: "var(--ink-muted)", fontSize: 6, lineHeight: 1.1, marginTop: 1 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TIMELINE — copiado exatamente do portal */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 10, marginBottom: 3 }}>Como funciona</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              {[
                { n: "01", t: "Onboarding", d: "Reunião de implantação, configuração do portal e treinamento do RH (até 7 dias)." },
                { n: "02", t: "Primeiro diagnóstico", d: "COPSOQ II aplicado para toda a empresa (até 14 dias após onboarding)." },
                { n: "03", t: "Apresentação de resultados", d: "Workshop executivo com o RH, definição conjunta do plano de ação." },
                { n: "04", t: "Acompanhamento contínuo", d: "Pulses mensais, revisão trimestral, e novo COPSOQ anual." },
              ].map(s => (
                <div key={s.n} style={{ padding: 4, background: "var(--surface)", borderRadius: 6, border: "1px solid var(--line)" }}>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 12, color: "var(--health)", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 8, fontWeight: 600, color: "var(--ink)", marginTop: 1 }}>{s.t}</div>
                  <div style={{ fontSize: 6, color: "var(--ink-muted)", marginTop: 1, lineHeight: 1.1 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* QUOTE / about consultant — copiado do portal */}
          <div style={{ padding: 8, background: "var(--surface-sage)", borderRadius: 10, marginBottom: 6, display: "grid", gridTemplateColumns: "auto 1fr", gap: 6, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--health-deep)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 600, fontSize: 12 }}>CG</div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 600, color: "var(--ink)", lineHeight: 1.15 }}>
                Em 14 anos atendendo empresas como a sua, vi quanto a saúde mental impacta turnover e produtividade.
              </div>
              <div style={{ marginTop: 2, fontSize: 7, color: "var(--ink-soft)" }}>
                <strong>Caio Guedes</strong> · Consultor credenciado Menctor
              </div>
            </div>
          </div>

          {/* Accept button simulation — como no portal */}
          <div style={{ 
            marginTop: 2, 
            padding: "5px 8px", 
            background: "var(--surface)", 
            border: "1px solid var(--health)", 
            borderRadius: 5, 
            textAlign: "center", 
            fontSize: 9, 
            fontWeight: 600 
          }}>
            Aceitar proposta
          </div>
        </div>

        <div style={{ 
          fontSize: 7, 
          padding: "3px 6px", 
          background: "var(--surface)", 
          borderTop: "1px solid var(--line)", 
          color: "var(--ink-muted)", 
          textAlign: "center" 
        }}>
          Preview IDÊNTICO ao link enviado • atualiza em tempo real com o valor editado
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", gap: 20, maxWidth: 1100 }}>
      {/* ESQUERDA: Preview exato da proposta que será enviada */}
      <div style={{ flex: "1 1 52%", minWidth: 320 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 6, letterSpacing: ".04em" }}>
          PREVIEW DA PROPOSTA (exatamente o que o cliente vai visualizar)
        </div>
        <PreviewProposta />
      </div>

      {/* DIREITA: Controles + edição */}
      <div style={{ flex: "1 1 48%", maxWidth: 460 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 12, color: "var(--health-deep)", fontWeight: 700 }}>PROPOSTA COMERCIAL • NR-1</div>
          <h3 style={{ margin: "6px 0 12px", fontSize: 18 }}>Saúde psicossocial e conformidade NR-1 para {cliente.name}.</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <InfoBox label="Colaboradores" value={cliente.employees} />
            <InfoBox label="Implantação" value="7 dias" />
          </div>

          <div style={{ padding: 12, background: "var(--canvas-warm)", borderRadius: 8, fontSize: 12.5, lineHeight: 1.4 }}>
            Escopo: portal do colaborador, diagnósticos COPSOQ II + DRPS, relatórios, plano de ação e acompanhamento.
          </div>

          {/* Edição do investimento — atualiza preview esquerdo + snapshot do link enviado */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: 3 }}>Investimento do projeto</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>R$</span>
              <input
                type="number"
                min="0"
                step="100"
                value={investimento}
                disabled={aceito}
                onChange={(e) => {
                  const num = Math.max(0, parseInt(e.target.value || "0", 10));
                  setInvestimento(num);
                  onUpdate({ mrr: num });
                  if (cliente) cliente.mrr = num;
                  if (window.MenctorDB && clienteId) {
                    window.MenctorDB.updateClient(clientId, { mrr: num });
                  }
                }}
                style={{ fontSize: 17, fontWeight: 700, border: "1px solid var(--line)", background: aceito ? "#f4f3f0" : "var(--surface)", padding: "3px 8px", borderRadius: 5, width: 120 }}
              />
              {aceito && <span style={{ fontSize: 10, color: "var(--ink-muted)" }}>(travado)</span>}
            </div>
            <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 2 }}>Muda ao vivo no preview e na proposta enviada</div>
          </div>
        </div>

        {!aceito && (
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={() => setShowSendModal(true)} style={{ flex: 1 }}>
              <Icon name="send" size={14} /> Enviar link
            </button>
            <button className="btn btn-soft" onClick={() => window.open(link, "_blank")}>
              Ver no navegador
            </button>
          </div>
        )}

        {aceito ? (
          <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: "var(--surface-sage)", border: "1px solid var(--health)", textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--health-deep)" }}>✓ Proposta aceita</div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", margin: "2px 0 8px" }}>
              {data.propostaAceitaEm ? new Date(data.propostaAceitaEm).toLocaleDateString("pt-BR") : ""}
            </div>
            <button onClick={onNext} className="btn btn-accent" style={{ height: 38, width: "100%" }}>
              Avançar para Contrato
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--line)" }}>
              <label style={{ display: "flex", gap: 8, fontSize: 13, cursor: "pointer", alignItems: "center" }}>
                <input type="checkbox" checked={aceito} onChange={marcarAceite} />
                <span>Cliente aceitou (link ou manual)</span>
              </label>
            </div>
            <button disabled onClick={onNext} className="btn btn-accent" style={{ marginTop: 8, height: 36, opacity: 0.4, width: "100%" }}>
              Avançar para Contrato
            </button>
          </>
        )}

        {showSendModal && <SendProposalModal cliente={cliente} onClose={() => setShowSendModal(false)} />}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// Modal "Enviar Proposta" — gera link público para o cliente visualizar e aceitar
// (mesmo padrão do formulário de cadastro)
// ════════════════════════════════════════════════════════════
const SendProposalModal = ({ cliente, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Use cliente id or generate stable token for the link
  const token = useRef(cliente?.id || `prop-${Date.now().toString(36)}`).current;
  const link = `${window.location.origin}/?proposta=${encodeURIComponent(token)}`;

  // Save snapshot so the portal can load the data
  useEffect(() => {
    try {
      const snap = {
        id: token,
        empresa: cliente?.name || "Empresa",
        contato: cliente?.contact || "",
        email: cliente?.email || "",
        funcionarios: cliente?.employees || 100,
        valor: cliente?.mrr || 3500,
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(`MENCTOR_PROPOSAL_${token}`, JSON.stringify(snap));
    } catch (_) {}
  }, [cliente, token]);

  // Poll for acceptance from client portal
  useEffect(() => {
    const check = () => {
      try {
        const acc = window.localStorage.getItem(`MENCTOR_PROPOSAL_ACCEPTED_${token}`);
        if (acc) {
          const p = JSON.parse(acc);
          if (p.acceptedAt) setAccepted(true);
        }
      } catch (_) {}
    };
    check();
    const iv = setInterval(check, 1500);
    window.addEventListener("storage", check);
    return () => { clearInterval(iv); window.removeEventListener("storage", check); };
  }, [token]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (_) {
      window.prompt("Copie o link da proposta:", link);
    }
  };

  const sendEmail = async () => {
    const to = cliente?.email || cliente?.contactEmail || "";
    const subject = `Proposta Menctor para ${cliente?.name || "sua empresa"}`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2b26;max-width:560px">
        <h2>Proposta Menctor — Saúde Psicossocial e NR-1</h2>
        <p>Olá${cliente?.contact ? `, <strong>${cliente.contact}</strong>` : ""}.</p>
        <p>Preparamos uma proposta personalizada para <strong>${cliente?.name || "sua empresa"}</strong> com ${cliente?.employees || "?"} colaboradores.</p>
        <p><a href="${link}" style="display:inline-block;background:#E87722;color:#fff;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:700">Abrir proposta e aceitar</a></p>
        <p style="font-size:13px;color:#666">Ou cole no navegador: ${link}</p>
        <p>Abraços,<br/>Equipe Menctor</p>
      </div>`;

    try {
      if (typeof sendTransactionalEmail === "function") {
        await sendTransactionalEmail({ to, subject, html });
      } else {
        // fallback: just copy + open mailto
        window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Link da proposta: " + link)}`);
      }
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      // still useful: copy link
      await copyLink();
      alert("E-mail não configurado. Link copiado para você colar no e-mail.");
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fade-in 200ms ease-out" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "32px 36px", width: "100%", maxWidth: 520, boxShadow: "var(--shadow-modal)", animation: "sheet-in 320ms var(--ease-spring)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20 }}>Enviar proposta</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 3 }}>
              O cliente abre o link, vê a proposta e pode aceitar diretamente.
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--ink-muted)", padding: 4, borderRadius: 8 }}><Icon name="x" size={18} /></button>
        </div>

        <div style={{ background: "var(--canvas-warm)", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
          <strong>{cliente?.name}</strong> · {cliente?.employees || "?"} colaboradores · R$ {(cliente?.mrr || 0).toLocaleString("pt-BR")} (investimento do projeto)
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            readOnly
            value={link}
            onFocus={e => e.target.select()}
            style={{ flex: 1, height: 42, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, background: "var(--surface)", color: "var(--ink)" }}
          />
          <button onClick={copyLink} className="btn btn-primary" style={{ height: 42, padding: "0 16px", whiteSpace: "nowrap" }}>
            <Icon name={copied ? "check" : "copy"} size={15} /> {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={sendEmail} className="btn btn-accent" style={{ flex: 1, height: 42 }}>
            <Icon name="send" size={15} /> {sent ? "Enviado!" : "Enviar por e-mail"}
          </button>
          <button onClick={() => window.open(link, "_blank")} className="btn btn-soft" style={{ height: 42 }}>
            Abrir no navegador
          </button>
        </div>

        {accepted && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--surface-sage)", borderRadius: 8, color: "var(--health-deep)", fontSize: 13 }}>
            ✓ Cliente já aceitou esta proposta pelo link!
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.4 }}>
          Quando o cliente clicar em “Aceitar proposta”, a etapa será marcada automaticamente como concluída.
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// Modal "Enviar Contrato" — paralelo ao de proposta
// Gera link ?contrato=... + snapshot + envio
// ════════════════════════════════════════════════════════════
const SendContractModal = ({ cliente, contratoToken, valor, vigencia, onClose, onAccepted }) => {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const link = `${window.location.origin}/?contrato=${encodeURIComponent(contratoToken)}`;

  // Save snapshot (mesmo formato que o PortalContratoScreen espera)
  useEffect(() => {
    try {
      const snap = {
        id: contratoToken,
        empresa: cliente?.name || "Empresa",
        contato: cliente?.contact || "",
        email: cliente?.email || "",
        funcionarios: cliente?.employees || 100,
        valor: valor || cliente?.mrr || 3500,
        vigencia: vigencia || "12",
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(`MENCTOR_CONTRACT_${contratoToken}`, JSON.stringify(snap));
    } catch (_) {}
  }, [cliente, contratoToken, valor, vigencia]);

  // Poll acceptance
  useEffect(() => {
    const check = () => {
      try {
        const acc = window.localStorage.getItem(`MENCTOR_CONTRACT_ACCEPTED_${contratoToken}`) ||
                    window.localStorage.getItem(`MENCTOR_CONTRACT_ACCEPTED_${cliente?.id}`);
        if (acc) {
          const p = JSON.parse(acc);
          if (p.acceptedAt) {
            setAccepted(true);
            if (onAccepted) onAccepted();
          }
        }
      } catch (_) {}
    };
    check();
    const iv = setInterval(check, 1500);
    window.addEventListener("storage", check);
    window.addEventListener("menctor:contract-accepted", check);
    return () => { clearInterval(iv); window.removeEventListener("storage", check); window.removeEventListener("menctor:contract-accepted", check); };
  }, [contratoToken, cliente?.id, onAccepted]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (_) {
      window.prompt("Copie o link do contrato:", link);
    }
  };

  const sendEmail = async () => {
    const to = cliente?.email || cliente?.contactEmail || "";
    const subject = `Contrato Menctor para ${cliente?.name || "sua empresa"}`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2b26;max-width:560px">
        <h2>Contrato Menctor — Prestação de Serviços (NR-1)</h2>
        <p>Olá${cliente?.contact ? `, <strong>${cliente.contact}</strong>` : ""}.</p>
        <p>Segue o contrato personalizado para <strong>${cliente?.name || "sua empresa"}</strong>.</p>
        <div style="padding:12px;border-radius:8px;background:#f3faf6;border:1px solid #cde8dc;margin:12px 0">
          Valor mensal: R$ ${Number(valor).toLocaleString("pt-BR")}<br/>
          Colaboradores: ${cliente?.employees || 100}<br/>
          Vigência: ${vigencia} meses
        </div>
        <p><a href="${link}" style="display:inline-block;background:#E87722;color:#fff;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:700">Abrir contrato e assinar</a></p>
        <p style="font-size:13px;color:#666">Ou cole: ${link}</p>
        <p>Abraços,<br/>Equipe Menctor</p>
      </div>`;

    try {
      if (typeof sendTransactionalEmail === "function") {
        await sendTransactionalEmail({ to, subject, html });
      } else {
        window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Link para assinar o contrato: " + link)}`);
      }
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      await copyLink();
      alert("Link copiado. Cole no e-mail do cliente.");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "32px 36px", width: "100%", maxWidth: 520, boxShadow: "var(--shadow-modal)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 20 }}>Enviar contrato</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 3 }}>O cliente abre o link e assina digitalmente.</div>
          </div>
          <button onClick={onClose} style={{ color: "var(--ink-muted)" }}><Icon name="x" size={18} /></button>
        </div>

        <div style={{ padding: 14, background: "var(--canvas-warm)", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          Link: <code style={{ fontSize: 12 }}>{link}</code>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={copyLink} className="btn btn-soft" style={{ flex: 1 }}>
            {copied ? "✓ Copiado!" : "Copiar link"}
          </button>
          <button onClick={sendEmail} className="btn btn-primary" style={{ flex: 1 }}>
            {sent ? "Enviado!" : "Enviar por e-mail"}
          </button>
        </div>

        {accepted && (
          <div style={{ marginTop: 14, padding: 12, background: "var(--surface-sage)", borderRadius: 8, color: "var(--health-deep)", fontSize: 13, textAlign: "center" }}>
            ✓ Cliente já assinou pelo link!
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 12, color: "var(--ink-muted)" }}>
          Quando o cliente assinar no portal, a etapa será marcada automaticamente.
        </div>
      </div>
    </div>
  );
};

// 3. CONTRATO — agora com preview rico + link + aceite automático (exatamente como a etapa Proposta)
const ContratoEtapa = ({ cliente, data, onUpdate, onNext }) => {
  const [aceito, setAceito] = useState(!!data.aceito);
  const [showSendModal, setShowSendModal] = useState(false);

  // Token consistente para o link do contrato (igual ao da proposta)
  const contratoToken = cliente?.id || `ctr-${Date.now().toString(36)}`;
  const link = `${window.location.origin}/?contrato=${encodeURIComponent(contratoToken)}`;

  // Dados editáveis do contrato (valor e vigência)
  const [valor, setValor] = useState(() => data.mrr != null ? data.mrr : (cliente?.mrr ?? 3500));
  const [vigencia, setVigencia] = useState(() => data.vigencia || "12");

  // Salva snapshot para o portal público do contrato (usa a mesma chave do PortalContratoScreen)
  const saveContractSnapshot = (v, vig) => {
    try {
      const snap = {
        id: contratoToken,
        empresa: cliente?.name || "Empresa",
        contato: cliente?.contact || "",
        email: cliente?.email || "",
        funcionarios: cliente?.employees || 100,
        valor: v,
        vigencia: vig,
        inicio: data.inicio || "01/07/2026",
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(`MENCTOR_CONTRACT_${contratoToken}`, JSON.stringify(snap));
    } catch (_) {}
  };

  useEffect(() => {
    saveContractSnapshot(valor, vigencia);
  }, [valor, vigencia, cliente?.name, cliente?.employees, contratoToken]);

  useEffect(() => {
    if (data.mrr != null) setValor(data.mrr);
    if (data.vigencia) setVigencia(data.vigencia);
  }, [data.mrr, data.vigencia]);

  const marcarAceite = (force = null) => {
    const novo = force !== null ? force : !aceito;
    setAceito(novo);
    const patch = { aceito: novo, status: novo ? "concluida" : "em_andamento" };
    if (novo) patch.contratoAceitoEm = new Date().toISOString();
    onUpdate(patch);
  };

  // Auto-detect acceptance from the public contract portal link (MENCTOR_CONTRACT_ACCEPTED_*)
  useEffect(() => {
    const checkAcceptance = () => {
      try {
        if (cliente?.id) {
          const specificKey = `MENCTOR_CONTRACT_ACCEPTED_${cliente.id}`;
          const raw = localStorage.getItem(specificKey);
          if (raw) {
            const acc = JSON.parse(raw);
            if (acc.acceptedAt && !aceito) {
              setAceito(true);
              onUpdate({ aceito: true, status: "concluida", contratoAceitoEm: acc.acceptedAt });
              return;
            }
          }
        }

        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("MENCTOR_CONTRACT_ACCEPTED_")) keys.push(k);
        }
        const match = keys.find(k => {
          try {
            const p = JSON.parse(localStorage.getItem(k) || "{}");
            if (!p.id || !cliente) return false;
            return p.id === cliente.id || p.empresa === cliente.name;
          } catch (_) { return false; }
        });
        if (match) {
          const acc = JSON.parse(localStorage.getItem(match) || "{}");
          if (acc.acceptedAt && !aceito) {
            setAceito(true);
            onUpdate({ aceito: true, status: "concluida", contratoAceitoEm: acc.acceptedAt });
          }
        }
      } catch (_) {}
    };
    checkAcceptance();
    const iv = setInterval(checkAcceptance, 2000);
    window.addEventListener("storage", checkAcceptance);
    window.addEventListener("menctor:contract-accepted", checkAcceptance);
    return () => { clearInterval(iv); window.removeEventListener("storage", checkAcceptance); window.removeEventListener("menctor:contract-accepted", checkAcceptance); };
  }, [cliente, aceito, onUpdate]);

  // Preview do contrato — EXATAMENTE igual ao que o cliente vê no link (?contrato=...)
  // Replicamos a estrutura, resumos, escopo, timeline e action bar do PortalContratoScreen
  const PreviewContrato = () => {
    const fmt = (n) => Number(n || 0).toLocaleString("pt-BR");
    const ticket = cliente.employees ? (valor / cliente.employees) : 16.11;
    const empresa = cliente.name || "sua empresa";
    const funcs = cliente.employees || 100;
    const contato = cliente.contact || "gestor(a)";
    const v = vigencia;

    return (
      <div style={{ 
        background: "var(--canvas)", 
        border: "1px solid var(--line)", 
        borderRadius: 12, 
        overflow: "hidden", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        fontSize: "10px",
        lineHeight: "1.25"
      }}>
        {/* browser bar exato como no portal-contrato */}
        <div style={{
          background: "var(--surface-2)", borderBottom: "1px solid var(--line)",
          padding: "5px 8px", display: "flex", alignItems: "center", gap: 6, fontSize: 8, color: "var(--ink-muted)"
        }}>
          <Icon name="globe" size={10} />
          <span>menctor.com.br/contrato/{(empresa || "cliente").toLowerCase().replace(/\s+/g, "-").slice(0, 20)}</span>
          <span style={{ marginLeft: "auto", fontSize: 7 }}>Visão do cliente · assinatura de contrato</span>
        </div>

        <div style={{ padding: "8px 10px", flex: 1, overflow: "auto" }}>
          {/* hero */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8, color: "var(--health-deep)", fontWeight: 600, marginBottom: 2 }}>Contrato de prestação de serviços para {empresa}</div>
            <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.05, marginBottom: 3 }}>
              Formalize a parceria.<br/>Saúde psicossocial e<br/><span style={{ fontStyle: "italic", color: "var(--health-deep)" }}>conformidade NR-1 garantidas.</span>
            </div>
            <div style={{ fontSize: 8, color: "var(--ink-soft)" }}>
              Olá, <strong>{contato}</strong>. Este é o contrato personalizado para {empresa}.
            </div>
          </div>

          {/* SUMMARY — 4 colunas exatamente como no portal público */}
          <div style={{ 
            background: "#fff", 
            border: "1px solid var(--line)", 
            borderRadius: 6, 
            padding: "6px 8px", 
            marginBottom: 8, 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr 1fr 1fr", 
            gap: 6 
          }}>
            <div>
              <div style={{ fontSize: 7, color: "var(--ink-muted)", textTransform: "uppercase" }}>Investimento mensal</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14, color: "var(--ink)", lineHeight: 1, marginTop: 1 }}>
                R$ {fmt(valor)}
              </div>
              <div style={{ fontSize: 7, color: "var(--ink-muted)" }}>R$ {ticket.toFixed(2).replace(".", ",")} / colab</div>
            </div>
            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 5 }}>
              <div style={{ fontSize: 7, color: "var(--ink-muted)", textTransform: "uppercase" }}>Colaboradores</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14, color: "var(--ink)", lineHeight: 1, marginTop: 1 }}>
                {fmt(funcs)}
              </div>
              <div style={{ fontSize: 7, color: "var(--ink-muted)" }}>cobertos pelo contrato</div>
            </div>
            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 5 }}>
              <div style={{ fontSize: 7, color: "var(--ink-muted)", textTransform: "uppercase" }}>Vigência</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14, color: "var(--ink)", lineHeight: 1, marginTop: 1 }}>
                {v}<span style={{ fontSize: 9, color: "var(--ink-muted)" }}> meses</span>
              </div>
              <div style={{ fontSize: 7, color: "var(--ink-muted)" }}>Renovável automaticamente</div>
            </div>
            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 5 }}>
              <div style={{ fontSize: 7, color: "var(--ink-muted)", textTransform: "uppercase" }}>Início</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 11, color: "var(--ink)", lineHeight: 1.05, marginTop: 1 }}>
                {data.inicio || "após assinatura"}
              </div>
              <div style={{ fontSize: 7, color: "var(--ink-muted)" }}>Após assinatura</div>
            </div>
          </div>

          {/* Escopo do contrato — fiel ao portal */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 9, marginBottom: 2 }}>Escopo do contrato</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              {[
                { title: "Diagnóstico COPSOQ II + NR-1", desc: "Aplicação completa, relatórios e plano de ação com revisão trimestral." },
                { title: "Conformidade regulatória", desc: "Entregáveis prontos para auditoria e fiscalização." },
                { title: "Portal do colaborador", desc: "Acesso personalizado com trilhas e pulse surveys." },
                { title: "Acompanhamento contínuo", desc: "6 trilhas, pulses mensais, dashboards e suporte." },
              ].map((f, i) => (
                <div key={i} style={{ padding: "3px 4px", background: "var(--surface)", borderRadius: 4, border: "1px solid var(--line)", fontSize: 7 }}>
                  <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 7.5 }}>{f.title}</div>
                  <div style={{ color: "var(--ink-muted)", fontSize: 6, lineHeight: 1.05, marginTop: 1 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Após a assinatura — timeline fiel */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 9, marginBottom: 2 }}>Após a assinatura</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 }}>
              {[
                { n: "01", t: "Onboarding", d: "Reunião de implantação (até 7 dias)." },
                { n: "02", t: "Sensibilização", d: "Palestra + trilhas liberadas." },
                { n: "03", t: "Primeiro diagnóstico", d: "COPSOQ II em até 14 dias." },
                { n: "04", t: "Resultados e plano", d: "Workshop + plano de ação." },
              ].map(s => (
                <div key={s.n} style={{ padding: "3px 4px", background: "var(--surface)", borderRadius: 4, border: "1px solid var(--line)" }}>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 10, color: "var(--health)", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 7, fontWeight: 600, color: "var(--ink)", marginTop: 1 }}>{s.t}</div>
                  <div style={{ fontSize: 6, color: "var(--ink-muted)", marginTop: 1, lineHeight: 1.05 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo dos termos (compacto) */}
          <div style={{ padding: "4px 6px", background: "var(--surface)", borderRadius: 6, border: "1px solid var(--line)", marginBottom: 6, fontSize: 7 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Principais termos</div>
            <div style={{ color: "var(--ink-muted)", lineHeight: 1.15 }}>
              • Vigência {v} meses (renovável) • Confidencialidade total • Sem vínculo empregatício • Foro Curitiba/PR
            </div>
          </div>

          {/* ACTION BAR — exatamente como no portal público */}
          <div style={{ 
            padding: "6px 8px", 
            background: aceito ? "var(--health-deep)" : "var(--ink)", 
            color: "#FAF8F2", 
            borderRadius: 6, 
            textAlign: "center", 
            fontSize: 9, 
            fontWeight: 600,
            transition: "background 200ms ease"
          }}>
            {aceito ? "✓ Contrato assinado com sucesso!" : "Assinar contrato →"}
          </div>
        </div>

        <div style={{ 
          fontSize: 7, 
          padding: "2px 6px", 
          background: "var(--surface)", 
          borderTop: "1px solid var(--line)", 
          color: "var(--ink-muted)", 
          textAlign: "center" 
        }}>
          Preview IDÊNTICO ao link enviado • atualiza em tempo real
        </div>
      </div>
    );
  };

  const marcar = () => marcarAceite();

  return (
    <div style={{ display: "flex", gap: 20, maxWidth: 1100 }}>
      {/* ESQUERDA: Preview do contrato (exatamente o que o cliente vê em ?contrato=...) */}
      <div style={{ flex: "1 1 52%", minWidth: 320 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 6, letterSpacing: ".04em" }}>
          PREVIEW DO CONTRATO (exatamente o que o cliente vai visualizar)
        </div>
        <PreviewContrato />
      </div>

      {/* DIREITA: Controles + edição */}
      <div style={{ flex: "1 1 48%", maxWidth: 460 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 12, color: "var(--health-deep)", fontWeight: 700 }}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS • NR-01</div>
          <h3 style={{ margin: "6px 0 12px", fontSize: 18 }}>Contrato Menctor para {cliente.name}.</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <InfoBox label="Colaboradores" value={cliente.employees} />
            <InfoBox label="Vigência" value={`${vigencia} meses`} />
          </div>

          <div style={{ padding: 12, background: "var(--canvas-warm)", borderRadius: 8, fontSize: 12.5, lineHeight: 1.4 }}>
            Escopo: portal personalizado, diagnósticos COPSOQ II, pulses mensais, trilhas, relatórios executivos e plano de ação.
          </div>

          {/* Edição do valor e vigência — atualiza preview + snapshot do link */}
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: 3 }}>Valor mensal</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>R$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={valor}
                  disabled={aceito}
                  onChange={(e) => {
                    const num = Math.max(0, parseInt(e.target.value || "0", 10));
                    setValor(num);
                    onUpdate({ mrr: num });
                    if (cliente) cliente.mrr = num;
                  }}
                  style={{ fontSize: 16, fontWeight: 700, border: "1px solid var(--line)", background: aceito ? "#f4f3f0" : "var(--surface)", padding: "3px 8px", borderRadius: 5, width: "100%" }}
                />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: 3 }}>Vigência</div>
              <select
                value={vigencia}
                disabled={aceito}
                onChange={(e) => {
                  const v = e.target.value;
                  setVigencia(v);
                  onUpdate({ vigencia: v });
                }}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 6, background: aceito ? "#f4f3f0" : "var(--surface)", fontSize: 14 }}
              >
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
              </select>
            </div>
          </div>
          <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 4 }}>Muda ao vivo no preview e no link enviado ao cliente</div>
        </div>

        {!aceito && (
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={() => setShowSendModal(true)} style={{ flex: 1 }}>
              <Icon name="send" size={14} /> Enviar link do contrato
            </button>
            <button className="btn btn-soft" onClick={() => window.open(link, "_blank")}>
              Ver no navegador
            </button>
          </div>
        )}

        {aceito ? (
          <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: "var(--surface-sage)", border: "1px solid var(--health)", textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--health-deep)" }}>✓ Contrato assinado</div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", margin: "2px 0 8px" }}>
              {data.contratoAceitoEm ? new Date(data.contratoAceitoEm).toLocaleDateString("pt-BR") : ""}
            </div>
            <button onClick={onNext} className="btn btn-accent" style={{ height: 38, width: "100%" }}>
              Avançar para Sensibilização
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--line)" }}>
            <label style={{ display: "flex", gap: 8, fontSize: 13, cursor: "pointer", alignItems: "center" }}>
              <input type="checkbox" checked={aceito} onChange={marcar} />
              <span>Cliente aceitou o contrato (manual ou via link)</span>
            </label>
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <button onClick={() => window.open(`/doc/contrato?cliente=${cliente.id}`, "_blank")} className="btn btn-soft" style={{ fontSize: 12 }}>
            Ver contrato completo (PDF / doc)
          </button>
        </div>

        {showSendModal && <SendContractModal cliente={cliente} contratoToken={contratoToken} valor={valor} vigencia={vigencia} onClose={() => setShowSendModal(false)} onAccepted={() => marcarAceite(true)} />}
      </div>
    </div>
  );
};

// 4. SENSIBILIZAÇÃO — igual à tela de Aprendizado (vitrine + featured + cards)
const SensibilizacaoEtapa = ({ data, onUpdate, onNext }) => {
  const [selectedIds, setSelectedIds] = React.useState(data.conteudosSelecionados || []);
  const [selectedTrail, setSelectedTrail] = React.useState(null);

  // Reutilizamos as TRILHAS do aprendizado (todas são psicossociais)
  const trilhas = (window.TRILHAS || [
    { id: "t1", nome: "Saúde mental para gestores", modulos: 6, duracao: "3h 20min", inscritos: 142, conclusao: 67, capa: "linear-gradient(135deg, #2F7D6F, #5BAD72)" },
    { id: "t2", nome: "NR-1 na prática", modulos: 4, duracao: "1h 50min", inscritos: 89, conclusao: 82, capa: "linear-gradient(135deg, #4E83A8, #2F7D6F)" },
    { id: "t3", nome: "Liderança humanizada", modulos: 8, duracao: "5h", inscritos: 56, conclusao: 41, capa: "linear-gradient(135deg, #D89A3F, #E87722)" },
    { id: "t4", nome: "Resiliência e regulação emocional", modulos: 5, duracao: "2h 40min", inscritos: 211, conclusao: 73, capa: "linear-gradient(135deg, #C75A4C, #D89A3F)" },
  ]);

  const toggleSelect = (id) => {
    const novo = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    setSelectedIds(novo);
    const done = novo.length >= 2;
    onUpdate({ conteudosSelecionados: novo, status: done ? "concluida" : "em_andamento" });
  };

  // Featured: primeira trilha
  const featured = trilhas[0];

  if (selectedTrail) {
    // Detalhe estilo TrailDetail (dentro da etapa)
    const modules = [
      "Identificando sinais de burnout na equipe",
      "Conversas difíceis com colaboradores em risco",
      "Construindo cultura de cuidado",
      "Reuniões 1:1 que cuidam",
      "Métricas de bem-estar para gestão",
      "Quando encaminhar para apoio profissional",
    ];
    const isSel = selectedIds.includes(selectedTrail.id);

    return (
      <div>
        <button onClick={() => setSelectedTrail(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: 13, marginBottom: 16 }}>
          <Icon name="chevron-left" size={14}/> Voltar para vitrine
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, alignItems: "start" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Conteúdo de Sensibilização · {selectedTrail.modulos} módulos · {selectedTrail.duracao}</div>
            <h1 className="display" style={{ fontSize: 32, margin: 0 }}>{selectedTrail.nome}</h1>
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 13, color: "var(--ink-muted)" }}>
              <span><strong style={{ color: "var(--ink)" }}>{selectedTrail.inscritos}</strong> inscritos</span>
              <span><strong style={{ color: "var(--ink)" }}>{selectedTrail.conclusao}%</strong> conclusão média</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button 
                onClick={() => toggleSelect(selectedTrail.id)} 
                className="btn btn-accent" 
                style={{ height: 38, padding: "0 18px" }}
              >
                {isSel ? "Remover da sensibilização" : "Selecionar para o cliente"} <Icon name="check" size={14}/>
              </button>
              <button className="btn btn-soft" style={{ height: 38 }}>
                Pré-visualizar
              </button>
            </div>
          </div>
          <div style={{ height: 180, borderRadius: 16, background: selectedTrail.capa }} />
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 className="display" style={{ fontSize: 20, margin: "0 0 16px" }}>Módulos / Conteúdo</h2>
          {modules.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i > 0 ? "1px dashed var(--line)" : "none" }}>
              <span style={{ width: 26, height: 26, borderRadius: 999, background: "#FFF4EC", color: "#F66B0A", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
              <div style={{ flex: 1, fontSize: 14 }}>{m}</div>
              <button className="btn btn-soft" style={{ height: 28, fontSize: 12 }}>Ver módulo</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button onClick={() => setSelectedTrail(null)} className="btn btn-soft">Voltar</button>
          <button onClick={onNext} className="btn btn-accent" disabled={selectedIds.length < 2}>
            Avançar para Diagnóstico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header igual ao Aprendizado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Sensibilização · Conteúdos Psicossociais</div>
          <h2 className="display" style={{ fontSize: 28, margin: 0 }}>Sensibilização</h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink-muted)", maxWidth: 520 }}>
            Selecione as trilhas e materiais que serão usados na fase de sensibilização do cliente.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-soft" style={{ height: 34, fontSize: 13 }}><Icon name="filter" size={13}/> Filtrar</button>
        </div>
      </div>

      {/* Featured — igual ao Aprendizado */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20, display: "grid", gridTemplateColumns: "1.3fr 1fr" }}>
        <div style={{
          background: "linear-gradient(135deg, #F66B0A 0%, #FF8636 100%)",
          padding: 24, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 220
        }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", background: "rgba(255,255,255,0.18)", borderRadius: 999 }}>Em destaque para sensibilização</span>
            <h3 className="display" style={{ fontSize: 24, margin: "12px 0 8px", color: "#fff", lineHeight: 1.1 }}>
              {featured.nome}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)", maxWidth: 300 }}>
              {featured.modulos} módulos · {featured.duracao}. Recomendado para todos os clientes.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button 
              className="btn btn-primary" 
              style={{ height: 34, fontSize: 13 }} 
              onClick={() => toggleSelect(featured.id)}
            >
              {selectedIds.includes(featured.id) ? "Remover seleção" : "Selecionar para cliente"}
            </button>
            <button className="btn" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", height: 34, fontSize: 13 }} onClick={() => setSelectedTrail(featured)}>
              Ver conteúdo
            </button>
          </div>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "center", background: "var(--surface)", fontSize: 12.5 }}>
          <div className="eyebrow" style={{ marginBottom: 10, fontSize: 10 }}>O que está dentro</div>
          {["Introdução aos riscos psicossociais", "Como aplicar na prática", "Exemplos e cases", "Ferramentas para o RH", "Plano de comunicação"].map((t,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderTop: i > 0 ? "1px dashed var(--line)" : "none", color: "var(--ink-soft)" }}>
              <Icon name="check" size={12} color="var(--health)" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trilhas disponíveis — grid igual ao Aprendizado */}
      <div style={{ marginBottom: 10 }}>
        <h3 className="display" style={{ fontSize: 18, margin: 0 }}>Conteúdos disponíveis</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {trilhas.map(t => {
          const isSel = selectedIds.includes(t.id);
          return (
            <button 
              key={t.id} 
              onClick={() => setSelectedTrail(t)} 
              className="card" 
              style={{ overflow: "hidden", display: "flex", flexDirection: "column", textAlign: "left", padding: 0, border: isSel ? "2px solid var(--health)" : undefined }}
            >
              <div style={{ height: 100, background: t.capa, position: "relative" }}>
                <div style={{ position: "absolute", top: 8, right: 8, padding: "2px 7px", background: "rgba(255,255,255,0.85)", borderRadius: 999, fontSize: 10, fontWeight: 600, color: "var(--ink)" }}>
                  {t.modulos} módulos
                </div>
                {isSel && (
                  <div style={{ position: "absolute", top: 8, left: 8, background: "var(--health)", color: "#fff", fontSize: 10, padding: "1px 6px", borderRadius: 4 }}>
                    Selecionado
                  </div>
                )}
              </div>
              <div style={{ padding: 14 }}>
                <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 16, margin: 0, lineHeight: 1.2 }}>{t.nome}</h3>
                <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--ink-muted)", marginTop: 8 }}>
                  <span>{t.duracao}</span>
                  <span>·</span>
                  <span>{t.inscritos} inscritos</span>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: "var(--canvas-warm)", borderRadius: 99 }}>
                    <div style={{ width: `${t.conclusao}%`, height: "100%", background: "var(--health)", borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{t.conclusao}%</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSelect(t.id); }} 
                    className="btn" 
                    style={{ 
                      width: "100%", height: 30, fontSize: 12, 
                      background: isSel ? "#fff" : "var(--health-deep)", 
                      color: isSel ? "var(--ink)" : "#fff",
                      border: isSel ? "1px solid var(--line)" : "none"
                    }}
                  >
                    {isSel ? "Remover da seleção" : "Selecionar"}
                  </button>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onNext} className="btn btn-accent" disabled={selectedIds.length < 2} style={{ opacity: selectedIds.length < 2 ? 0.5 : 1 }}>
          Avançar para Diagnóstico
        </button>
        <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
          {selectedIds.length} selecionados (mínimo 2)
        </div>
      </div>
    </div>
  );
};

// 5. DIAGNÓSTICO — seleção de instrumentos com preview detalhado
const DIAG_INSTRUMENTOS = [
  {
    id: "copsoqii", titulo: "COPSOQ II", tag: "Padrão NR-1",
    desc: "Padrão NR-1 para riscos psicossociais",
    detalhe: "Questionário Psicossocial de Copenhague, referência internacional para avaliação de riscos psicossociais no trabalho. Base do relatório executivo e da Matriz de Risco NR-01.",
    duracao: "20–30 min por colaborador",
    formato: "Questionário online, anônimo",
    itens: "Versão média · 76 questões",
    dimensoes: ["Demandas no trabalho", "Organização e conteúdo", "Relações sociais e liderança", "Interface trabalho-indivíduo", "Valores no local de trabalho", "Saúde e bem-estar"],
  },
  {
    id: "hse", titulo: "HSE", tag: "Internacional",
    desc: "Indicator Tool de estresse ocupacional (Health & Safety Executive)",
    detalhe: "Ferramenta do órgão britânico de saúde e segurança para medir as condições organizacionais associadas ao estresse ocupacional. Compacta e de rápida aplicação.",
    duracao: "10–15 min por colaborador",
    formato: "Questionário online, anônimo",
    itens: "35 questões · escala Likert",
    dimensoes: ["Demandas", "Controle", "Apoio da gestão", "Apoio dos colegas", "Relacionamentos", "Papel", "Mudança organizacional"],
  },
  {
    id: "entrevista", titulo: "Entrevista", tag: "Sugerida por IA",
    desc: "Roteiro de entrevista sugerido pela IA",
    detalhe: "Entrevista qualitativa com roteiro gerado por IA a partir do contexto da empresa (setor, porte e resultados preliminares). Complementa os questionários com percepções em profundidade.",
    duracao: "30–45 min por entrevistado",
    formato: "Individual ou grupo focal, conduzida pelo consultor",
    itens: "Roteiro semiestruturado · gerado por IA",
    dimensoes: ["Clima e relações", "Liderança", "Carga de trabalho", "Comunicação", "Percepção de riscos"],
  },
  {
    id: "drps", titulo: "DRPS", tag: "Complementar",
    desc: "Diagnóstico de Riscos Psicossociais",
    detalhe: "Diagnóstico estruturado de riscos psicossociais para mapeamento de fatores de risco e priorização de ações preventivas.",
    duracao: "15–20 min por colaborador",
    formato: "Questionário online, anônimo",
    itens: "Aplicação coletiva",
    dimensoes: ["Fatores de risco", "Condições de trabalho", "Saúde mental", "Prevenção"],
  },
  {
    id: "clima", titulo: "Clima Organizacional", tag: "Engajamento",
    desc: "Engajamento e satisfação",
    detalhe: "Pesquisa de clima para medir engajamento, satisfação e percepção dos colaboradores sobre o ambiente de trabalho.",
    duracao: "10–15 min por colaborador",
    formato: "Questionário online, anônimo",
    itens: "Aplicação coletiva",
    dimensoes: ["Engajamento", "Satisfação", "Comunicação", "Liderança", "Ambiente de trabalho"],
  },
];

const DiagnosticoEtapa = ({ data, onUpdate, onNext }) => {
  const inst = data.instrumentos || [];
  const [previewId, setPreviewId] = useState(DIAG_INSTRUMENTOS[0].id);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (msg, tipo) => {
    setToast({ msg, tipo });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const toggle = (o) => {
    const adicionando = !inst.includes(o.id);
    const novo = adicionando ? [...inst, o.id] : inst.filter(x => x !== o.id);
    onUpdate({ instrumentos: novo, status: novo.length >= 1 ? "concluida" : "em_andamento" });
    setPreviewId(o.id);
    showToast(adicionando ? `${o.titulo} adicionado à empresa` : `${o.titulo} removido`, adicionando ? "add" : "remove");
  };

  const preview = DIAG_INSTRUMENTOS.find(o => o.id === previewId) || DIAG_INSTRUMENTOS[0];
  const previewSel = inst.includes(preview.id);
  const selecionados = DIAG_INSTRUMENTOS.filter(o => inst.includes(o.id));

  return (
    <div style={{ position: "relative" }}>
      {toast && (
        <div style={{ position: "absolute", top: -8, right: 0, zIndex: 5, display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, background: toast.tipo === "add" ? "var(--health-deep)" : "var(--ink)", color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}>
          {toast.tipo === "add" ? "✓" : "−"} {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 12, color: "var(--ink-muted)", fontSize: 14 }}>Selecione os instrumentos que serão aplicados. Clique em um card para ver os detalhes no painel ao lado.</div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
        {/* Lista de instrumentos */}
        <div style={{ display: "grid", gap: 10 }}>
          {DIAG_INSTRUMENTOS.map(o => {
            const sel = inst.includes(o.id);
            const emPreview = previewId === o.id;
            return (
              <div key={o.id} onClick={() => toggle(o)} onMouseEnter={() => setPreviewId(o.id)} className="card"
                style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "center", cursor: "pointer", border: sel ? "2px solid var(--health)" : emPreview ? "1px solid var(--health)" : undefined, background: sel ? "var(--surface-sage)" : undefined, transition: "border-color .15s, background .15s" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", background: sel ? "var(--health)" : "transparent", border: sel ? "none" : "1.5px solid var(--line)" }}>
                  {sel ? "✓" : ""}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700 }}>{o.titulo}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "var(--canvas-warm)", color: "var(--ink-muted)", border: "1px solid var(--line)" }}>{o.tag}</span>
                    {sel && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "var(--health)", color: "#fff" }}>Adicionado</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 2 }}>{o.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Painel de preview */}
        <div className="card" style={{ padding: 20, position: "sticky", top: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-muted)" }}>Preview do instrumento</div>
              <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20, margin: "6px 0 0" }}>{preview.titulo}</h3>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap", background: previewSel ? "var(--health)" : "var(--canvas-warm)", color: previewSel ? "#fff" : "var(--ink-muted)", border: previewSel ? "none" : "1px solid var(--line)" }}>
              {previewSel ? "✓ Adicionado" : "Não adicionado"}
            </span>
          </div>

          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-muted)", margin: "12px 0 14px" }}>{preview.detalhe}</p>

          <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", gap: 8 }}><span style={{ fontWeight: 600, minWidth: 74 }}>Duração:</span><span style={{ color: "var(--ink-muted)" }}>{preview.duracao}</span></div>
            <div style={{ display: "flex", gap: 8 }}><span style={{ fontWeight: 600, minWidth: 74 }}>Formato:</span><span style={{ color: "var(--ink-muted)" }}>{preview.formato}</span></div>
            <div style={{ display: "flex", gap: 8 }}><span style={{ fontWeight: 600, minWidth: 74 }}>Estrutura:</span><span style={{ color: "var(--ink-muted)" }}>{preview.itens}</span></div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Dimensões avaliadas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {preview.dimensoes.map(d => (
                <span key={d} style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 99, background: "var(--canvas-warm)", border: "1px solid var(--line)", color: "var(--ink)" }}>{d}</span>
              ))}
            </div>
          </div>

          <button onClick={() => toggle(preview)} className="btn" style={{ marginTop: 16, width: "100%", background: previewSel ? "#fff" : "var(--health-deep)", color: previewSel ? "var(--ink)" : "#fff", border: previewSel ? "1px solid var(--line)" : "none" }}>
            {previewSel ? "Remover da empresa" : "Adicionar à empresa"}
          </button>
        </div>
      </div>

      {/* Resumo dos instrumentos adicionados */}
      <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--line)", background: selecionados.length ? "var(--surface-sage)" : "var(--canvas-warm)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {selecionados.length ? `${selecionados.length} instrumento${selecionados.length > 1 ? "s" : ""} adicionado${selecionados.length > 1 ? "s" : ""} à empresa:` : "Nenhum instrumento adicionado ainda."}
        </span>
        {selecionados.map(o => (
          <span key={o.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: "var(--health)", color: "#fff" }}>
            ✓ {o.titulo}
          </span>
        ))}
      </div>

      <button style={{ marginTop: 16 }} onClick={onNext} className="btn btn-accent" disabled={!inst.length} title={!inst.length ? "Adicione ao menos um instrumento" : undefined}>
        Avançar (Relatórios desabilitados)
      </button>
    </div>
  );
};

// 6. RELATÓRIOS — liberada automaticamente quando o Diagnóstico (etapa 5) é concluído
const relatorioRiskColor = (v) => (v >= 2.5 ? "var(--coral)" : v >= 1.5 ? "var(--amber)" : "var(--health)");

const RelatorioDimRow = ({ dim }) => {
  const color = getRiskColor ? getRiskColor(dim.v) : relatorioRiskColor(dim.v);
  const pct = Math.min(100, (dim.v / 4) * 100);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "178px 1fr 48px", gap: 10, alignItems: "center" }}>
      <div style={{ fontSize: 12.5, color: dim.v >= 2.5 ? "var(--coral)" : "var(--ink-soft)", fontWeight: dim.v >= 2.5 ? 600 : 400 }}>{dim.name}</div>
      <div style={{ position: "relative", height: 14, background: "var(--canvas-warm)", borderRadius: 999, border: "1px solid var(--line)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: color, opacity: dim.v >= 2.5 ? 0.9 : 0.7 }} />
        <div style={{ position: "absolute", left: "62.5%", top: -1, bottom: -1, width: 2, background: "#111", opacity: 0.25 }} />
      </div>
      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14, textAlign: "right", color: "var(--ink)" }}>{dim.v.toFixed(2)}</div>
    </div>
  );
};

// Baixa o relatório imprimível carregando-o num iframe oculto (sem abrir nova aba/janela)
// e aguarda o postMessage disparado por relatorio-doc.jsx assim que o PDF é gerado.
const baixarRelatorioViaIframe = (url, onDone) => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "900px";
  iframe.style.height = "1400px";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.src = url;

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    window.removeEventListener("message", onMsg);
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    onDone && onDone();
  };
  const onMsg = (e) => {
    if (e.origin !== window.location.origin) return;
    if (e.data && e.data.type === "menctor-relatorio-baixado") cleanup();
  };
  window.addEventListener("message", onMsg);
  document.body.appendChild(iframe);
  setTimeout(cleanup, 20000); // fallback caso o postMessage não chegue
};

// Baixa um PDF estático já pronto (demonstração), sem gerar nada dinamicamente
const baixarArquivoEstatico = (arquivo, nomeArquivo) => {
  const link = document.createElement("a");
  link.href = arquivo;
  link.download = nomeArquivo || arquivo.split("/").pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const RelatorioDownloadCard = ({ icon, color, iconBg, titulo, desc, url, staticFile, onPreview }) => {
  const [baixando, setBaixando] = React.useState(false);
  const baixar = () => {
    if (baixando) return;
    if (staticFile) {
      baixarArquivoEstatico(staticFile);
      return;
    }
    setBaixando(true);
    baixarRelatorioViaIframe(url, () => setBaixando(false));
  };
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18, background: "var(--surface)", display: "flex", flexDirection: "column", gap: 12, transition: "all .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
          <Icon name={icon} size={20} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{titulo}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: color, letterSpacing: ".04em", marginTop: 1 }}>PDF EXECUTIVO</div>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.45, flex: 1 }}>{desc}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={baixar} disabled={baixando} className="btn btn-accent" style={{ flex: 1, height: 36, fontSize: 12.5, justifyContent: "center" }}>
          <Icon name="download" size={13} /> {baixando ? "Gerando…" : "Baixar PDF"}
        </button>
        {onPreview && (
          <button onClick={onPreview} className="btn btn-ghost" style={{ height: 36, fontSize: 12.5, padding: "0 14px", border: "1px solid var(--line)" }}>
            <Icon name="eye" size={13} /> Preview
          </button>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// NOVOS COMPONENTES VISUAIS — Etapa 6 Dashboard Executivo (puros CSS + SVG)
// ════════════════════════════════════════════════════════════
const KPICard = ({ icon, label, value, sub, accentColor = "var(--health-deep)", bg = "var(--surface)" }) => (
  <div className="card" style={{ padding: "18px 20px", background: bg, border: "1px solid var(--line)", borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--canvas-warm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={15} color={accentColor} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</div>
    </div>
    <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, color: "var(--ink)", lineHeight: 1, marginTop: 2 }}>{value}</div>
    <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{sub}</div>
  </div>
);

const getRiskColor = (v) => (v >= 2.5 ? "var(--coral)" : v >= 1.5 ? "var(--amber)" : "var(--health)");

const COPSOQHorizontalBars = ({ dims }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
    {dims.map((d, idx) => {
      const pct = Math.min(100, Math.max(0, (d.v / 4) * 100));
      const color = getRiskColor(d.v);
      const isHigh = d.v >= 2.5;
      return (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "168px 1fr 52px", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: isHigh ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
          <div style={{ position: "relative", height: 16, background: "var(--canvas-warm)", borderRadius: 999, overflow: "hidden", border: "1px solid var(--line)" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: color, opacity: isHigh ? 0.92 : 0.75, transition: "width .4s ease" }} />
            <div style={{ position: "absolute", left: "62.5%", top: -1, bottom: -1, width: 2, background: "var(--ink)", opacity: 0.35 }} />
          </div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14, textAlign: "right", color: "var(--ink)" }}>{d.v.toFixed(2)}</div>
        </div>
      );
    })}
  </div>
);

const COPSOQRadar = ({ dims, size = 290 }) => {
  const n = dims.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.355;
  const toRad = (i) => (i * (Math.PI * 2 / n)) - Math.PI / 2;
  const getXY = (i, scale) => {
    const rad = toRad(i);
    const r = maxR * scale;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const polygonPoints = dims.map((d, i) => {
    const p = getXY(i, d.v / 4);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", margin: "0 auto" }}>
      {/* soft background */}
      <circle cx={cx} cy={cy} r={maxR + 6} fill="var(--canvas-warm)" opacity="0.6" />
      {/* concentric grid */}
      {gridLevels.map((lv, idx) => (
        <circle key={idx} cx={cx} cy={cy} r={maxR * lv} fill="none" stroke="var(--line)" strokeWidth="1" opacity={lv === 1 ? 0.9 : 0.55} />
      ))}
      {/* axes */}
      {dims.map((_, i) => {
        const p = getXY(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--line)" strokeWidth="1" opacity="0.6" />;
      })}
      {/* data polygon */}
      <polygon points={polygonPoints} fill="rgba(229,72,77,0.14)" stroke="var(--coral)" strokeWidth="2.5" strokeLinejoin="round" />
      {/* value dots + labels */}
      {dims.map((d, i) => {
        const p = getXY(i, d.v / 4);
        const lp = getXY(i, 1.18);
        const col = getRiskColor(d.v);
        const short = d.name.length > 13 ? d.name.substring(0, 11) + "…" : d.name;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill={col} stroke="#fff" strokeWidth="1.5" />
            <text x={lp.x} y={lp.y} fontSize="8.2" fill="var(--ink-soft)" textAnchor="middle" dominantBaseline="middle" style={{ fontWeight: d.v >= 2.5 ? 600 : 400 }}>
              {short}
            </text>
          </g>
        );
      })}
      {/* center label */}
      <text x={cx} y={cy + 4} fontSize="10" fill="var(--ink-muted)" textAnchor="middle" fontWeight="600">COPSOQ II</text>
    </svg>
  );
};

const DimensionHeatmap = ({ dims }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(138px, 1fr))", gap: 8 }}>
    {dims.map((d, i) => {
      const isHigh = d.v >= 2.5;
      const isMod = d.v >= 1.5 && d.v < 2.5;
      const bg = isHigh ? "var(--coral-soft)" : isMod ? "var(--amber-soft)" : "var(--health-soft)";
      const border = isHigh ? "var(--coral)" : isMod ? "var(--amber)" : "var(--health)";
      const pill = isHigh ? "ALTO" : isMod ? "MOD" : "BAIXO";
      return (
        <div key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "10px 12px", fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontWeight: 600, color: "var(--ink)", lineHeight: 1.25, fontSize: 12.5 }}>{d.name}</div>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 999, background: "#fff", color: isHigh ? "var(--coral)" : isMod ? "var(--amber)" : "var(--health-deep)" }}>{pill}</span>
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, marginTop: 6, color: "var(--ink)" }}>{d.v.toFixed(2)}</div>
        </div>
      );
    })}
  </div>
);

// AEP data extracted / inspired directly from the provided AEP PDF (Loghaus example)
const AEP_FACTORS = [
  { name: "Levantamento e transporte de carga", v: 3.34 },
  { name: "Posturas forçadas e inadequadas", v: 3.21 },
  { name: "Repetitividade de movimentos", v: 3.05 },
  { name: "Ritmo de trabalho e pressão temporal", v: 2.92 },
  { name: "Mobiliário e dimensionamento do posto", v: 2.78 },
  { name: "Vibração de corpo inteiro (veículos)", v: 2.71 },
  { name: "Pausas e alternância de tarefas", v: 2.44 },
  { name: "Mobiliário para trabalho sentado", v: 2.36 },
  { name: "Iluminação do ambiente", v: 2.05 },
  { name: "Ruído ocupacional", v: 1.92 },
  { name: "Conforto térmico", v: 1.68 },
  { name: "Layout e fluxo de circulação", v: 1.41 },
];

const AEPResumo = () => {
  const alto = AEP_FACTORS.filter(f => f.v >= 2.5).length;
  const maxV = Math.max(...AEP_FACTORS.map(f => f.v));
  return (
    <div className="card" style={{ padding: 20, marginBottom: 18, background: "linear-gradient(180deg, #fff, var(--canvas-warm))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "var(--amber-soft)", color: "var(--amber)", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>NR-17</div>
        <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 17 }}>Resumo da AEP — Avaliação Ergonômica Preliminar</div>
      </div>

      {/* AEP KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>SCORE GERAL</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--display)" }}>2.49 <span style={{ fontSize: 12, color: "var(--amber)" }}>/4</span></div>
          <div style={{ fontSize: 11, color: "var(--amber)" }}>Risco moderado</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>FATORES EM RISCO ALTO</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--display)", color: "var(--coral)" }}>{alto}<span style={{ fontSize: 13, color: "var(--ink-faint)" }}>/12</span></div>
          <div style={{ fontSize: 11 }}>Intervenção prioritária ≤ 45 dias</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>POSTOS AVALIADOS</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--display)" }}>8/8</div>
          <div style={{ fontSize: 11 }}>100% cobertura operacional</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>RISCO MÁXIMO</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--display)", color: "var(--coral)" }}>{maxV.toFixed(2)}</div>
          <div style={{ fontSize: 11 }}>Levantamento e transporte</div>
        </div>
      </div>

      <div style={{ marginBottom: 8, fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>Fatores ergonômicos (ordenados por risco)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {AEP_FACTORS.map((f, idx) => {
          const pct = (f.v / 4) * 100;
          const col = getRiskColor(f.v);
          return (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "210px 1fr 46px", alignItems: "center", gap: 8, fontSize: 12 }}>
              <div style={{ color: f.v >= 2.5 ? "var(--coral)" : "var(--ink-soft)" }}>{f.name}</div>
              <div style={{ height: 11, background: "var(--canvas-warm)", borderRadius: 999, position: "relative", overflow: "hidden", border: "1px solid var(--line)" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: col, opacity: f.v >= 2.5 ? 0.9 : 0.7 }} />
              </div>
              <div style={{ textAlign: "right", fontWeight: 700, fontFamily: "var(--display)" }}>{f.v.toFixed(2)}</div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 12, background: "var(--surface-sage)", borderRadius: 8, padding: "10px 12px", color: "var(--ink)" }}>
        <strong>Contexto do PDF:</strong> 46 colaboradores entrevistados · 340 expostos · 8 postos (100%). Principais riscos concentrados em Auxiliar de Carga/Descarga e Separador de Pedidos (REBA/RULA/NIOSH). Ação prioritária recomendada em até 30–45 dias para os 6 fatores acima do limite.
      </div>
    </div>
  );
};

const PrioritizedRecommendations = ({ copsoqDims, hasAEP }) => {
  const highRisk = [...copsoqDims].filter(d => d.v >= 2.5).sort((a, b) => b.v - a.v).slice(0, 4);

  const suggestions = {
    "Carga de trabalho": "Redistribuir demandas, revisar metas e pausas ativas. Priorizar análise de jornada.",
    "Burnout": "Programa de recuperação + liderança capacitada. Acompanhamento trimestral.",
    "Estresse": "Mapear fontes de pressão e implementar canais de escuta estruturados.",
    "Conflito trabalho-família": "Flexibilizar horários e políticas de desconexão digital.",
    default: "Elaborar plano de ação específico com responsáveis e prazos (30–60 dias)."
  };

  const aepSuggestions = [
    { title: "Levantamento e transporte de carga", action: "Equipamentos auxiliares + revisão de LPR (NIOSH) + embalagens menores." },
    { title: "Posturas forçadas e inadequadas", action: "Treinamento REBA + dispositivos de apoio lombar e rotação de postos." },
  ];

  return (
    <div className="card" style={{ padding: 20, marginBottom: 18 }}>
      <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 17, marginBottom: 6 }}>Recomendações Priorizadas</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 14 }}>Baseado nas dimensões com score ≥ 2.5 (limite NR-1). Ações alinhadas ao PGR/NR-1.</div>

      <div style={{ display: "grid", gap: 10 }}>
        {highRisk.length > 0 && highRisk.map((d, idx) => (
          <div key={idx} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, background: "var(--coral-soft)", color: "var(--coral)", borderRadius: 6, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{(idx + 1)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 13.5 }}>{d.name} <span style={{ fontSize: 12, color: "var(--coral)", fontWeight: 600 }}>({d.v.toFixed(2)})</span></div>
              <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 3 }}>{suggestions[d.name] || suggestions.default}</div>
            </div>
          </div>
        ))}

        {hasAEP && aepSuggestions.map((s, i) => (
          <div key={"aep"+i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "var(--amber-soft)", border: "1px solid var(--amber)", borderRadius: 10, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, background: "#fff", color: "var(--amber)", borderRadius: 6, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>E</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 13.5 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 3 }}>{s.action}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 10 }}>Recomendações integráveis ao plano de ação da etapa seguinte.</div>
    </div>
  );
};

const RelatoriosEtapa = ({ cliente, diagnosticoData, data, onUpdate, onNext }) => {
  const instrumentos = diagnosticoData?.instrumentos || [];
  const diagnosticoConcluido = diagnosticoData?.status === "concluida" || instrumentos.length > 0;

  const [preview, setPreview] = useState(null);

  if (!diagnosticoConcluido) {
    return (
      <div style={{ opacity: 0.6, pointerEvents: "none" }}>
        <div style={{ padding: 20, background: "var(--canvas-warm)", borderRadius: 12, border: "1px dashed var(--line)" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Relatórios</div>
          <div style={{ color: "var(--ink-muted)" }}>Esta aba permanece desabilitada no momento do cadastro. Será liberada automaticamente após a conclusão do Diagnóstico (etapa 5).</div>
        </div>
        <button style={{ marginTop: 16, opacity: 0.5 }} className="btn btn-soft" disabled>Avançar (habilitado após diagnóstico)</button>
      </div>
    );
  }

  const resultado = getDiagnosticoResultadoMock(cliente?.id);
  const dimensoesRisco = resultado.porDimensao.filter(d => d.v >= 2.5).length;
  const riscoMaximo = Math.max(...resultado.porDimensao.map(d => d.v)).toFixed(2);
  const hasAEP = instrumentos.includes("nr17");

  const openPreview = (tipo) => setPreview(tipo);
  const closePreview = () => setPreview(null);

  // Preview rápido (simulado, editorial, sem libs extras)
  const renderPreview = () => {
    if (!preview) return null;
    const isAEP = preview === "aep";
    const title = preview === "clima" ? "Pesquisa de Clima Organizacional" : preview === "matriz" ? "Matriz NR-1" : "Análise Ergonômica Preliminar (AEP)";
    return (
      <div className="card" style={{ padding: 22, marginBottom: 18, border: "2px solid var(--health)", background: "var(--surface)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--health-deep)", fontWeight: 700 }}>PRÉ-VISUALIZAÇÃO RÁPIDA</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700 }}>{title}</div>
          </div>
          <button onClick={closePreview} className="btn btn-ghost" style={{ height: 30, fontSize: 12 }}>Fechar</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
          <div style={{ padding: 12, background: "var(--canvas-warm)", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Média Geral</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--display)" }}>{isAEP ? "2.49" : resultado.media} <span style={{ fontSize: 11 }}>/4</span></div>
          </div>
          <div style={{ padding: 12, background: "var(--canvas-warm)", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Adesão / Cobertura</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--display)" }}>{isAEP ? "100%" : resultado.adesao + "%"}</div>
          </div>
          <div style={{ padding: 12, background: "var(--canvas-warm)", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Em risco alto</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--display)", color: "var(--coral)" }}>{isAEP ? "6/12" : dimensoesRisco + " dims"}</div>
          </div>
        </div>

        <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
          {preview === "clima" && "Relatório completo com radar, barras, heatmap e plano de ação priorizado para NR-1."}
          {preview === "matriz" && "Classificação de severidade + ações priorizadas conforme critérios da NR-1 e GRO."}
          {preview === "aep" && "Diagnóstico ergonômico por posto (REBA/RULA/NIOSH) com 8/8 cobertura e plano de ação técnico."}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: "var(--ink-muted)" }}>Use o botão “Baixar PDF” para gerar o documento oficial com identidade Lector.</div>
      </div>
    );
  };

  return (
    <div>
      {/* INTRO */}
      <div style={{ marginBottom: 18, fontSize: 14.5, color: "var(--ink-muted)" }}>
        Diagnóstico concluído com {instrumentos.length} instrumento{instrumentos.length !== 1 ? "s" : ""} aplicado{instrumentos.length !== 1 ? "s" : ""}. Dashboard executivo abaixo.
      </div>

      {/* 4 ELEGANT KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        <KPICard
          icon="activity"
          label="MÉDIA GERAL"
          value={resultado.media.toFixed(2)}
          sub={`Limite NR-1 · ${resultado.media >= 2.5 ? "Acima" : "Dentro"} do limite`}
          accentColor={resultado.media >= 2.5 ? "var(--coral)" : "var(--amber)"}
        />
        <KPICard
          icon="users"
          label="ADESÃO"
          value={`${resultado.adesao}%`}
          sub={`${resultado.respondidos} de ${resultado.alvo} colaboradores`}
          accentColor="var(--health-deep)"
        />
        <KPICard
          icon="alert-triangle"
          label="DIMENSÕES EM RISCO"
          value={`${dimensoesRisco}/${resultado.porDimensao.length}`}
          sub="Necessitam plano de ação"
          accentColor="var(--coral)"
        />
        <KPICard
          icon="trending-up"
          label="RISCO MÁXIMO"
          value={riscoMaximo}
          sub={`Dimensão mais crítica`}
          accentColor="var(--coral)"
        />
      </div>

      {/* RADAR + HORIZONTAL BARS — lado a lado */}
      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 17, margin: 0 }}>Dashboard COPSOQ II</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--ink-muted)" }}>Visão 360° das 12 dimensões — radar + barras ordenadas</p>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Marca vertical = 2.5 (limite NR-1)</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) 1.15fr", gap: 22, alignItems: "start" }}>
          {/* RADAR */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6, textAlign: "center" }}>RADAR — Perfil de Risco</div>
            <COPSOQRadar dims={resultado.porDimensao} />
          </div>

          {/* HORIZONTAL BARS */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>BARRAS HORIZONTAIS — Ordenado por risco</div>
            <COPSOQHorizontalBars dims={resultado.porDimensao} />
          </div>
        </div>
      </div>

      {/* HEATMAP */}
      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Heatmap de Dimensões — Cores NR-1</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 12 }}>Verde = saudável · Amarelo = moderado · Vermelho = alto risco (≥2.5)</div>
        <DimensionHeatmap dims={resultado.porDimensao} />
      </div>

      {/* AEP RESUMO — só quando NR-17 aplicado (inspirado diretamente no PDF AEP enviado) */}
      {hasAEP && <AEPResumo />}

      {/* DOWNLOADS MELHORADOS + PREVIEW */}
      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 17, margin: "0 0 4px" }}>Relatórios para Download</h3>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--ink-muted)" }}>Documentos executivos prontos para a empresa, fiscalização NR-1 e integração ao PGR.</p>

        <div style={{ display: "grid", gridTemplateColumns: hasAEP ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: 12 }}>
          <RelatorioDownloadCard
            icon="file"
            color="var(--health-deep)"
            iconBg="var(--surface-sage)"
            titulo="Pesquisa de Clima Organizacional"
            desc="Relatório completo: radar, barras, heatmap, adesão e plano de ação priorizado."
            staticFile="/relatorio_psicossocial.pdf"
            onPreview={() => openPreview("clima")}
          />
          <RelatorioDownloadCard
            icon="clipboard"
            color="var(--coral)"
            iconBg="var(--coral-soft)"
            titulo="Matriz NR-1"
            desc="Classificação por severidade + plano de ação conforme NR-1 e GRO."
            url={`${window.location.origin}/doc/relatorio?cliente=${encodeURIComponent(cliente?.id || "")}&tipo=matriz&autodownload=1`}
            onPreview={() => openPreview("matriz")}
          />
          {hasAEP && (
            <RelatorioDownloadCard
              icon="activity"
              color="var(--amber)"
              iconBg="var(--amber-soft)"
              titulo="Análise Ergonômica Preliminar (AEP)"
              desc="NR-17: fatores por posto, 8/8 cobertura, scores REBA/RULA/NIOSH e ações técnicas."
              staticFile="/AEP.pdf"
              onPreview={() => openPreview("aep")}
            />
          )}
        </div>
      </div>

      {/* PREVIEW RÁPIDO (inline) */}
      {renderPreview()}

      {/* RECOMENDAÇÕES PRIORIZADAS */}
      <PrioritizedRecommendations copsoqDims={resultado.porDimensao} hasAEP={hasAEP} />

      {/* DADOS ORIGINAIS — mantido para compatibilidade / referência tabular */}
      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16, margin: "0 0 4px" }}>Dimensões COPSOQ II (lista tabular)</h3>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink-muted)" }}>Ordenadas do maior risco para o menor. Mantido para referência.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {resultado.porDimensao.map(d => <RelatorioDimRow key={d.name} dim={d} />)}
        </div>
      </div>

      {/* AÇÕES FINAIS — mantidas exatamente como antes */}
      {data.status === "concluida" ? (
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--health-deep)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="check" size={14} color="var(--health-deep)" /> Relatório revisado
        </span>
      ) : (
        <button onClick={() => { onUpdate({ status: "concluida" }); onNext(); }} className="btn btn-accent">
          <Icon name="arrow-right" size={14} /> Avançar para Apresentação
        </button>
      )}
    </div>
  );
};

// 7. APRESENTAÇÃO
const ApresentacaoEtapa = ({ data, onUpdate }) => {
  const [dataReuniao, setDataReuniao] = useState(data.data || "");
  const [obs, setObs] = useState(data.obs || "");
  const save = () => onUpdate({ status: "concluida", reuniaoAgendada: true, data: dataReuniao, obs });

  return (
    <div>
      <div style={{ fontSize: 14.5, marginBottom: 16 }}>Reunião para discussão e alinhamento do plano de ação com a direção e RH.</div>
      <div style={{ display: "grid", gap: 14, maxWidth: 520 }}>
        <div>
          <SectionTitle>Data da reunião</SectionTitle>
          <FInput type="date" value={dataReuniao} onChange={setDataReuniao} />
        </div>
        <div>
          <SectionTitle>Observações / pauta</SectionTitle>
          <textarea value={obs} onChange={e => setObs(e.target.value)} rows={4} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)" }} placeholder="Principais pontos a discutir, responsáveis..." />
        </div>
      </div>
      <button onClick={save} className="btn btn-accent" style={{ marginTop: 16 }}>Agendar / Concluir Apresentação</button>
      {data.reuniaoAgendada && <div style={{ marginTop: 10, color: "var(--health-deep)" }}>Reunião registrada. Fluxo concluído.</div>}
    </div>
  );
};

const InfoBox = ({ label, value }) => (
  <div style={{ padding: "12px 14px", background: "var(--canvas-warm)", borderRadius: 10 }}>
    <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
    <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{value}</div>
  </div>
);

// ════════════════════════════════════════════════════════════
// Modal "Enviar formulário" — gera link público para cliente preencher cadastro
// (mesmo padrão usado no fluxo de novo cliente)
// ════════════════════════════════════════════════════════════
const SendFormModalRoadmap = ({ cliente, formToken: propFormToken, onTokenCreated, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Reusa token se já existir para este cliente (evita gerar links novos a cada clique).
  // Isso garante que o preenchimento do cliente vá exatamente para "esta sessão".
  const tokenRef = useRef(null);
  if (!tokenRef.current) {
    let tok = propFormToken;
    if (!tok && cliente?.id) {
      try {
        tok = localStorage.getItem(`MENCTOR_CLIENT_FORM_TOKEN_${cliente.id}`);
      } catch (_) {}
    }
    if (!tok) {
      tok = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      if (cliente?.id) {
        try {
          localStorage.setItem(`MENCTOR_CLIENT_FORM_TOKEN_${cliente.id}`, tok);
        } catch (_) {}
      }
      // Persiste o token na etapa do cliente para que a detecção seja scoped a esta sessão
      if (onTokenCreated) {
        setTimeout(() => onTokenCreated(tok), 0);
      }
    }
    tokenRef.current = tok;
  }
  const token = tokenRef.current;

  const link = `${window.location.origin}/?empresa-form=${token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { /* clipboard indisponível */ }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fade-in 200ms ease-out" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "32px 36px", width: "100%", maxWidth: 480, boxShadow: "var(--shadow-modal)", animation: "sheet-in 320ms var(--ease-spring)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20 }}>Enviar formulário</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 3 }}>
              O cliente preenche <strong>todas as 18 perguntas do cadastro</strong> sem login. {cliente ? `Os dados de ${cliente.name} serão preenchidos automaticamente.` : ""}
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--ink-muted)", padding: 4, borderRadius: 8 }}><Icon name="x" size={18} /></button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            readOnly
            value={link}
            onFocus={e => e.target.select()}
            style={{ flex: 1, height: 42, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, background: "var(--surface)", color: "var(--ink)" }}
          />
          <button onClick={copyLink} className="btn btn-primary" style={{ height: 42, padding: "0 18px" }}>
            <Icon name={copied ? "check" : "copy"} size={14} /> {copied ? "Copiado" : "Copiar"}
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.4 }}>
          O link é exclusivo desta sessão/cliente. Preenchimentos de outros links não vão interferir.
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { RoadmapScreen });

// =====================================================
// Helpers de TESTE para fluxo de Proposta
// =====================================================
window.__TEST_SEND_PROPOSAL_LINK = (cliente = { id: 'test-prop', name: 'Empresa Teste', employees: 180, mrr: 4200 }) => {
  const token = cliente.id || `prop-${Date.now().toString(36)}`;
  const snap = {
    id: token,
    empresa: cliente.name,
    contato: cliente.contact || 'Teste',
    funcionarios: cliente.employees,
    valor: cliente.mrr,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(`MENCTOR_PROPOSAL_${token}`, JSON.stringify(snap));
  const link = `${location.origin}/?proposta=${encodeURIComponent(token)}`;
  console.log('%c[TEST] Link da proposta gerado:', 'color:#E87722', link);
  console.log('%c[TEST] Snapshot salvo. Abra o link ou use __TEST_ACCEPT_PROPOSAL("' + token + '")', 'color:#2F7D6F');
  return { link, token };
};

window.__TEST_ACCEPT_PROPOSAL = (token) => {
  if (!token) {
    console.warn('Passe o token ou gere um com __TEST_SEND_PROPOSAL_LINK()');
    return;
  }
  const key = `MENCTOR_PROPOSAL_ACCEPTED_${token}`;
  const payload = { id: token, acceptedAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('menctor:proposal-accepted', { detail: payload }));
  console.log('%c[TEST] Aceitação salva e evento disparado para', 'color:#2F7D6F', token);
  return payload;
};

// =====================================================
// Helper de TESTE para simular recebimento do formulário pelo link
// Use no console: window.__SIMULAR_FORM_CADASTRO()
// Isso injeta um payload completo e força o banner de "Aplicar"
// =====================================================
window.__SIMULAR_FORM_CADASTRO = (clienteName = "Empresa Teste Ltda") => {
  const token = "sim-" + Date.now().toString(36);
  const key = `MENCTOR_EMPRESA_FORM_${token}`;
  const fakePayload = {
    razaoSocial: clienteName,
    responsavel: "Ana Paula Ferreira",
    email: "ana.ferreira@empresateste.com.br",
    telefone: "(11) 91234-5678",
    cnpj: "33.444.555/0001-66",
    qtdPorArea: { administrativo: "30", operacional: "120", vendas: "15", producao: "95", atendimento: "20", qualidade: "12" },
    qtdCargos: "41",
    segmento: "Manufatura",
    unidades: "2",
    cidades: "São Paulo, Guarulhos",
    terceirizados: "28",
    possui: ["CIPA", "PGR - Programa de Gerenciamento de Riscos", "SESMT"],
    indicadores: ["Turnover médio dos últimos 12 meses", "Afastamentos previdenciários (principalmente saúde mental)"],
    mapeamentoFormal: "Não",
    pesquisaClima: "Sim",
    canaisEscuta: "Parcialmente",
    fiscalizacaoEvidencia: "Sim",
    gestaoRiscosOutra: "Em fase de implantação.",
    pressaoMetas: "Sim",
    ritmoIntenso: "Sim",
    capacitacaoLideranca: "Parcialmente",
    conflitosRecorrentes: "Sim",
    assedioMoral: "Não",
    liderancaOutra: "",
    juridicoAcompanha: "Sim",
    acaoTrabalhistaMental: "Não",
    senteProtegida: "Parcialmente",
    juridicaOutra: "",
    excessoTrabalho: true,
    prazosInatingiveis: false,
    faltaControle: true,
    estruturaNaoAplica: false,
    estruturaOutra: "",
    trabalhaCom: ["Metas individuais ou coletivas agressivas", "Home office / híbrido"],
    razao: clienteName,
    nome: clienteName,
    contatoNome: "Ana Paula Ferreira",
    contatoEmail: "ana.ferreira@empresateste.com.br",
    contatoWhats: "(11) 91234-5678",
    submittedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(key, JSON.stringify(fakePayload));

    // Para o novo fluxo scoped: associa o token ao cliente atual (se existir) para que o banner apareça
    try {
      const ativos = (window.CLIENTES || []).filter(c => c.status === "ativo" || c.status === "negociacao");
      const target = ativos[0];
      if (target) {
        localStorage.setItem(`MENCTOR_CLIENT_FORM_TOKEN_${target.id}`, token);
        if (!window.ETAPAS_CLIENTE) window.ETAPAS_CLIENTE = {};
        if (!window.ETAPAS_CLIENTE[target.id]) window.ETAPAS_CLIENTE[target.id] = { etapaAtual: 1, status: {} };
        window.ETAPAS_CLIENTE[target.id].status[1] = { ...(window.ETAPAS_CLIENTE[target.id].status[1] || {}), formToken: token };
        console.log("%c[TEST] Token associado ao cliente:", "color:#2F7D6F", target.name || target.id, "→", token);
      }
    } catch (_) {}

    console.log("%c[TEST] Payload de formulário injetado:", "color:#2F7D6F", key);
    console.log("%c[TEST] Vá para a aba Cadastro (etapa 1) do cliente correspondente. O banner deve aparecer automaticamente (ou recarregue).", "color:#E87722");
    return { key, payload: fakePayload, token };
  } catch (e) { console.error(e); }
};
