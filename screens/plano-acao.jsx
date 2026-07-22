/* global React, Icon, Page, CLIENTES, COPSOQ_DIMS, ROADMAP_ESTADO, ROADMAP_FASES */
const { useState, useMemo } = React;

// ════════════════════════════════════════════════════════════
// PLANO DE AÇÃO 5W2H — Fase 2 · Etapa 3
// ════════════════════════════════════════════════════════════

const PRAZO_META = {
  curto:  { label: "Curto prazo",  sub: "até 3 meses",  color: "var(--health)",    bg: "var(--surface-sage)",  ink: "var(--health-deep)" },
  medio:  { label: "Médio prazo", sub: "3–6 meses",    color: "var(--amber)",     bg: "#FFF8EB",              ink: "#92600A" },
  longo:  { label: "Longo prazo",  sub: "6–12 meses",   color: "var(--coral)",     bg: "#FFF0EE",              ink: "#B03A2E" },
};

const STATUS_META = {
  pendente:      { label: "Pendente",      dot: "var(--ink-faint)",   bg: "var(--canvas-warm)",  ink: "var(--ink-muted)" },
  em_andamento:  { label: "Em andamento",  dot: "var(--sky)",         bg: "#EFF7FF",             ink: "#1B5E8C" },
  concluida:     { label: "Concluída",     dot: "var(--health)",      bg: "var(--surface-sage)", ink: "var(--health-deep)" },
};

// Pre-populated from COPSOQ II results for VitaMed (Fase 2 · Etapa 2 done)
const PLANO_ACAO_MOCK = {
  vitamed: [
    {
      id: "v1", prioridade: 1, status: "em_andamento",
      o_que:    "Programa de gestão de carga de trabalho",
      por_que:  "Carga de trabalho (3.12) acima do limite NR-1 · maior score da avaliação COPSOQ II",
      quem:     "RH + Coordenadores de unidade hospitalar",
      onde:     "Todas as unidades (SP, RJ, MG)",
      quando:   "30/07/2026", prazo_tipo: "curto",
      como:     "Mapeamento de sobrecarga por setor, redistribuição de escalas, revisão de metas trimestrais com gestores",
      quanto:   "R$ 0 — reestruturação interna",
      dimensao: "Carga de trabalho",
    },
    {
      id: "v2", prioridade: 2, status: "pendente",
      o_que:    "Workshop de prevenção de burnout para lideranças",
      por_que:  "Burnout (2.95) — índice crítico em gestores de plantão e coordenadores",
      quem:     "Gestão de Pessoas + Consultoria Menctor",
      onde:     "Presencial em SP · online para RJ e MG",
      quando:   "15/08/2026", prazo_tipo: "curto",
      como:     "2 workshops de 4h com dinâmicas, autoavaliação individual e plano de cuidado para gestores",
      quanto:   "R$ 8.400 — incluso no contrato Menctor",
      dimensao: "Burnout",
    },
    {
      id: "v3", prioridade: 3, status: "pendente",
      o_que:    "Política de suporte social entre pares",
      por_que:  "Suporte social (2.42) abaixo do esperado para setor de saúde — impacto em retenção",
      quem:     "RH",
      onde:     "Todas as unidades",
      quando:   "30/09/2026", prazo_tipo: "medio",
      como:     "Grupos de apoio por setor, mentoria interna, canal de escuta ativa semanal via portal Menctor",
      quanto:   "R$ 0 — programa interno",
      dimensao: "Suporte social",
    },
    {
      id: "v4", prioridade: 4, status: "pendente",
      o_que:    "Revisão do regime de escalas e banco de horas",
      por_que:  "Conflito trabalho-família (2.74) elevado em colaboradores de plantão noturno",
      quem:     "RH + Benefícios + Jurídico",
      onde:     "Plantões noturnos e fins de semana",
      quando:   "31/10/2026", prazo_tipo: "medio",
      como:     "Revisão do banco de horas, home office parcial para administrativos, convênio crèche corporativa",
      quanto:   "R$ 15.000/mês — benefício crèche",
      dimensao: "Conflito trabalho-família",
    },
    {
      id: "v5", prioridade: 5, status: "pendente",
      o_que:    "Dashboard integrado RH e SST no Menctor",
      por_que:  "Ausência de visibilidade integrada entre saúde ocupacional e gestão de pessoas",
      quem:     "RH + SST + Menctor",
      onde:     "Corporativo",
      quando:   "31/12/2026", prazo_tipo: "longo",
      como:     "Painel no Menctor com indicadores de absenteísmo, laudos médicos, avaliações psicossociais e metas",
      quanto:   "R$ 0 — incluso no contrato Menctor",
      dimensao: "Integração RH/SST",
    },
  ],
  loghaus:  [],
  agrocorp: [],
};

// Top COPSOQ dims above NR-1 limit to suggest new actions
const getSuggestedActions = () =>
  (window.COPSOQ_DIMS || [])
    .filter(d => d.v >= 2.5)
    .slice(0, 5)
    .map((d, i) => ({
      o_que:    `Plano de ação — ${d.name}`,
      por_que:  `${d.name} (${d.v.toFixed(2)}) acima do limite NR-1 de 2.5`,
      dimensao: d.name,
      prioridade: i + 1,
    }));

const EMPTY_ACAO = {
  o_que: "", por_que: "", quem: "", onde: "",
  quando: "", prazo_tipo: "curto",
  como: "", quanto: "", dimensao: "", status: "pendente",
};

// ── helpers ──────────────────────────────────────────────
const getRoadmapCtxPlano = (clienteId) => {
  const est = window.ROADMAP_ESTADO && window.ROADMAP_ESTADO[clienteId];
  const fases = window.ROADMAP_FASES;
  if (!est || !fases) return null;
  const faseIdx = est.faseAtual;
  if (faseIdx < 1) return null; // Only relevant from Fase 2
  const etapasEst = est.etapas[faseIdx] || [];
  const emIdx = etapasEst.findIndex(e => e.status === "em_andamento");
  return { faseNum: faseIdx + 1, etapaNum: emIdx >= 0 ? emIdx + 1 : 1, faseLabel: fases[faseIdx].label };
};

const isClienteOnFase2Plus = (clienteId) => {
  const est = window.ROADMAP_ESTADO && window.ROADMAP_ESTADO[clienteId];
  return est && est.faseAtual >= 1;
};

// ════════════════════════════════════════════════════════════
// MAIN SCREEN
// ════════════════════════════════════════════════════════════
const PlanoAcaoScreen = ({ navigate, params = {} }) => {
  const ativos = useMemo(() => (window.CLIENTES || []).filter(c => c.status === "ativo"), []);
  const defaultCliente = params.clienteId
    ? ativos.find(c => c.id === params.clienteId) || ativos[0]
    : ativos.find(c => isClienteOnFase2Plus(c.id)) || ativos[0];

  const [cliente, setCliente] = useState(defaultCliente);
  const [dropOpen, setDropOpen] = useState(false);
  const [filterPrazo, setFilterPrazo] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [acoes, setAcoes] = useState(() => PLANO_ACAO_MOCK[defaultCliente?.id] || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAcao, setEditingAcao] = useState(null);
  const [etapaConcluida, setEtapaConcluida] = useState(false);

  const switchCliente = (c) => {
    setCliente(c);
    setAcoes(PLANO_ACAO_MOCK[c.id] || []);
    setDropOpen(false);
    setFilterPrazo("todos");
    setEtapaConcluida(false);
  };

  const ctx = cliente ? getRoadmapCtxPlano(cliente.id) : null;
  const emFase2 = cliente ? isClienteOnFase2Plus(cliente.id) : false;

  const filtered = acoes.filter(a => {
    if (filterPrazo !== "todos" && a.prazo_tipo !== filterPrazo) return false;
    if (filterStatus !== "todos" && a.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total:       acoes.length,
    concluidas:  acoes.filter(a => a.status === "concluida").length,
    andamento:   acoes.filter(a => a.status === "em_andamento").length,
    pendentes:   acoes.filter(a => a.status === "pendente").length,
  };

  const pctConcluido = stats.total > 0 ? Math.round((stats.concluidas / stats.total) * 100) : 0;

  const addAcao = (acao) => {
    const next = { ...acao, id: `a${Date.now()}`, prioridade: acoes.length + 1 };
    setAcoes(prev => [...prev, next]);
    setModalOpen(false);
    setEditingAcao(null);
  };

  const updateAcao = (acao) => {
    setAcoes(prev => prev.map(a => a.id === acao.id ? acao : a));
    setModalOpen(false);
    setEditingAcao(null);
  };

  const removeAcao = (id) => setAcoes(prev => prev.filter(a => a.id !== id));

  const toggleStatus = (id) => {
    setAcoes(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next = a.status === "pendente" ? "em_andamento" : a.status === "em_andamento" ? "concluida" : "pendente";
      return { ...a, status: next };
    }));
  };

  return (
    <Page>
      {/* ── Modal ── */}
      {modalOpen && (
        <AcaoModal
          acao={editingAcao}
          onSave={editingAcao ? updateAcao : addAcao}
          onClose={() => { setModalOpen(false); setEditingAcao(null); }}
        />
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Fase 2 · Etapa 3</div>
          <h1 className="display" style={{ fontSize: 44, margin: "0 0 8px" }}>Plano de Ação 5W2H</h1>
          <p style={{ margin: 0, fontSize: 15, color: "var(--ink-muted)", maxWidth: 540 }}>
            Ações prioritárias, responsáveis e prazos para endereçar os riscos identificados no diagnóstico.
          </p>
        </div>

        {/* Client selector */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setDropOpen(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 12,
              background: "var(--surface)", border: "1px solid var(--line)",
              boxShadow: "var(--shadow-card)", minWidth: 200,
            }}
          >
            {cliente && (
              <span style={{ width: 28, height: 28, borderRadius: 8, background: cliente.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>
                {cliente.name[0]}
              </span>
            )}
            <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{cliente?.name || "Selecionar cliente"}</span>
            <Icon name="chevron-down" size={14} color="var(--ink-muted)" />
          </button>
          {dropOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "var(--shadow-pop)", zIndex: 50, minWidth: 220, overflow: "hidden" }}>
              {ativos.map(c => (
                <button
                  key={c.id}
                  onClick={() => switchCliente(c)}
                  style={{ width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, textAlign: "left", background: c.id === cliente?.id ? "var(--surface-sage)" : "transparent", color: "var(--ink)" }}
                >
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: c.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{c.name[0]}</span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  {!isClienteOnFase2Plus(c.id) && <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>Fase 1</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Roadmap context banner ── */}
      {ctx ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderRadius: 12, marginBottom: 24, background: "var(--surface-sage)", border: "1px solid var(--health-soft)", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="milestone" size={15} color="var(--health-deep)" />
            <span style={{ fontSize: 13, color: "var(--health-deep)" }}>
              <strong>Fase {ctx.faseNum} · Etapa {ctx.etapaNum}/8</strong> — Elaborar plano de ação · {cliente?.name}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {stats.total >= 3 && !etapaConcluida && (
              <button onClick={() => setEtapaConcluida(true)} className="btn btn-primary" style={{ height: 30, fontSize: 12 }}>
                <Icon name="check" size={12} /> Marcar Etapa 3 concluída
              </button>
            )}
            {etapaConcluida && (
              <span style={{ fontSize: 12, color: "var(--health-deep)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="check" size={12} color="var(--health-deep)" /> Etapa 3 marcada
              </span>
            )}
            <button onClick={() => navigate("roadmap", { clienteId: cliente?.id })} style={{ fontSize: 12, color: "var(--health-deep)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon name="map" size={12} /> Ver roadmap <Icon name="arrow-right" size={11} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "14px 18px", borderRadius: 12, marginBottom: 24, background: "var(--canvas-warm)", border: "1px solid var(--line)", fontSize: 13, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="lock" size={14} color="var(--ink-faint)" />
          O plano de ação é elaborado após a conclusão do diagnóstico (Fase 1). {cliente?.name} ainda está na Fase 1.
        </div>
      )}

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <PlanoStat label="Total de ações" value={stats.total} />
        <PlanoStat label="Em andamento"   value={stats.andamento} accent="sky" />
        <PlanoStat label="Concluídas"     value={stats.concluidas} accent="health" />
        <PlanoStat label="Progresso"      value={`${pctConcluido}%`} accent={pctConcluido >= 80 ? "health" : pctConcluido >= 40 ? "amber" : "ink"} />
      </div>

      {/* ── Filter + actions bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "todos", label: "Todas" },
            { id: "curto", label: "Curto prazo" },
            { id: "medio", label: "Médio prazo" },
            { id: "longo", label: "Longo prazo" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterPrazo(f.id)}
              style={{
                padding: "7px 14px", borderRadius: 999, fontSize: 13,
                fontWeight: filterPrazo === f.id ? 600 : 500,
                background: filterPrazo === f.id ? "var(--ink)" : "var(--surface)",
                color: filterPrazo === f.id ? "var(--canvas)" : "var(--ink-muted)",
                border: filterPrazo === f.id ? "1px solid var(--ink)" : "1px solid var(--line)",
              }}
            >
              {f.label}
            </button>
          ))}
          <div style={{ width: 1, background: "var(--line)", margin: "0 4px" }} />
          {["todos", "pendente", "em_andamento", "concluida"].map(s => {
            const meta = STATUS_META[s] || { label: "Todos", ink: "var(--ink-muted)" };
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: "7px 14px", borderRadius: 999, fontSize: 13,
                  fontWeight: filterStatus === s ? 600 : 400,
                  background: filterStatus === s ? meta.bg || "var(--surface)" : "transparent",
                  color: filterStatus === s ? meta.ink || "var(--ink)" : "var(--ink-faint)",
                  border: `1px solid ${filterStatus === s ? "transparent" : "transparent"}`,
                }}
              >
                {s === "todos" ? "Todos status" : meta.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => { setEditingAcao(null); setModalOpen(true); }}
          disabled={!emFase2}
          className="btn btn-accent"
          style={{ height: 40, opacity: !emFase2 ? 0.5 : 1, flexShrink: 0 }}
        >
          <Icon name="plus" size={15} /> Nova ação
        </button>
      </div>

      {/* ── Actions list ── */}
      {filtered.length === 0 ? (
        <div style={{ padding: "56px 24px", textAlign: "center", border: "1px dashed var(--line-strong)", borderRadius: 16, color: "var(--ink-muted)" }}>
          <Icon name="tasks" size={32} color="var(--line-strong)" strokeWidth={1.2} />
          <div style={{ marginTop: 14, fontFamily: "var(--display)", fontWeight: 600, fontSize: 18, color: "var(--ink-soft)" }}>
            {!emFase2 ? "Plano disponível a partir da Fase 2" : "Nenhuma ação neste filtro"}
          </div>
          {emFase2 && (
            <p style={{ fontSize: 14, margin: "8px auto 18px", maxWidth: 380, lineHeight: 1.5 }}>
              Adicione a primeira ação do plano ou use "Sugerir ações" para gerar automaticamente a partir do COPSOQ II.
            </p>
          )}
          {emFase2 && (
            <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ height: 38, fontSize: 14 }}>
              <Icon name="plus" size={14} /> Adicionar primeira ação
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(acao => (
            <AcaoCard
              key={acao.id}
              acao={acao}
              onToggleStatus={() => toggleStatus(acao.id)}
              onEdit={() => { setEditingAcao(acao); setModalOpen(true); }}
              onRemove={() => removeAcao(acao.id)}
            />
          ))}
        </div>
      )}

      {/* ── Export hint ── */}
      {acoes.length > 0 && (
        <div style={{ marginTop: 24, padding: "14px 18px", borderRadius: 12, background: "var(--canvas-warm)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
            Plano com <strong style={{ color: "var(--ink)" }}>{acoes.length} ações</strong> — pronto para exportar e apresentar ao cliente.
          </div>
          <button className="btn btn-soft" style={{ height: 34, fontSize: 13 }}>
            <Icon name="download" size={13} /> Exportar 5W2H (.xlsx)
          </button>
        </div>
      )}
    </Page>
  );
};

// ════════════════════════════════════════════════════════════
// ACAO CARD — expandable
// ════════════════════════════════════════════════════════════
const AcaoCard = ({ acao, onToggleStatus, onEdit, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  const prazo = PRAZO_META[acao.prazo_tipo] || PRAZO_META.curto;
  const status = STATUS_META[acao.status] || STATUS_META.pendente;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", transition: "box-shadow .15s" }}>
      {/* ── Compact header ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}
      >
        <span style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: 8,
          background: prazo.bg, color: prazo.ink,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--display)", fontWeight: 700, fontSize: 13,
        }}>
          {acao.prioridade}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.2, marginBottom: 3 }}>{acao.o_que}</div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {acao.dimensao && <span style={{ color: "var(--ink-soft)" }}>{acao.dimensao}</span>}
            {acao.dimensao && acao.quem && <span style={{ color: "var(--line-strong)" }}>·</span>}
            {acao.quem && <span>{acao.quem}</span>}
            {acao.quando && <><span style={{ color: "var(--line-strong)" }}>·</span><span>até {acao.quando}</span></>}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 700, background: prazo.bg, color: prazo.ink, border: `1px solid ${prazo.color}22` }}>
            {prazo.label}
          </span>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 600, background: status.bg, color: status.ink, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: status.dot, flexShrink: 0 }} />
            {status.label}
          </span>
          <Icon name={expanded ? "chevron-down" : "chevron-right"} size={16} color="var(--ink-faint)" />
        </div>
      </button>

      {/* ── Expanded 5W2H grid ── */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--line)", padding: "20px 24px", background: "var(--canvas-warm)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 16 }}>
            {[
              { key: "o_que",   label: "O quê?" },
              { key: "por_que", label: "Por quê?" },
              { key: "quem",    label: "Quem?" },
              { key: "onde",    label: "Onde?" },
              { key: "quando",  label: "Quando?" },
              { key: "como",    label: "Como?" },
              { key: "quanto",  label: "Quanto custa?" },
            ].map(({ key, label }) => (
              <div key={key} style={{ ...(key === "como" ? { gridColumn: "1 / -1" } : {}) }}>
                <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-faint)", fontWeight: 700, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.45 }}>{acao[key] || "—"}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: "1px dashed var(--line-strong)" }}>
            <button onClick={onToggleStatus} className="btn btn-primary" style={{ height: 34, fontSize: 12 }}>
              <Icon name="check" size={13} />
              {acao.status === "pendente" ? "Iniciar" : acao.status === "em_andamento" ? "Marcar concluída" : "Reabrir"}
            </button>
            <button onClick={onEdit} className="btn btn-soft" style={{ height: 34, fontSize: 12 }}>
              <Icon name="edit" size={13} /> Editar
            </button>
            <button onClick={onRemove} style={{ height: 34, fontSize: 12, padding: "0 12px", borderRadius: 8, color: "var(--coral)", background: "transparent", border: "1px solid transparent", display: "inline-flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
              <Icon name="trash" size={13} color="var(--coral)" /> Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// MODAL — new/edit action
// ════════════════════════════════════════════════════════════
const AcaoModal = ({ acao, onSave, onClose }) => {
  const [form, setForm] = useState(acao ? { ...acao } : { ...EMPTY_ACAO });
  const [showSuggest, setShowSuggest] = useState(false);
  const upd = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const suggestions = useMemo(() => getSuggestedActions(), []);

  const applySuggestion = (s) => {
    setForm(prev => ({ ...prev, o_que: s.o_que, por_que: s.por_que, dimensao: s.dimensao }));
    setShowSuggest(false);
  };

  const canSave = form.o_que.trim() && form.quem.trim() && form.quando.trim();

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fade-in 200ms ease-out" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--canvas)", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-modal)", animation: "sheet-in 320ms var(--ease-spring)" }}>

        {/* Modal header */}
        <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>5W2H</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 20, color: "var(--ink)" }}>
              {acao ? "Editar ação" : "Nova ação"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!acao && (
              <button
                onClick={() => setShowSuggest(v => !v)}
                className="btn btn-soft"
                style={{ height: 34, fontSize: 12 }}
              >
                <Icon name="sparkles" size={13} /> Sugerir do COPSOQ
              </button>
            )}
            <button onClick={onClose} style={{ color: "var(--ink-muted)", padding: 4 }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        {/* COPSOQ suggestions panel */}
        {showSuggest && (
          <div style={{ padding: "12px 28px", borderBottom: "1px solid var(--line)", background: "var(--surface-sage)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--health-deep)", marginBottom: 8 }}>Dimensões acima do limite NR-1 — clique para usar</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => applySuggestion(s)}
                  style={{ padding: "8px 12px", borderRadius: 8, background: "#fff", border: "1px solid var(--health-soft)", textAlign: "left", fontSize: 13, color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: "var(--health)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{s.o_que}</span>
                  <Icon name="arrow-right" size={12} color="var(--health-deep)" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div style={{ overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ModalField label="O quê? *" span={2}>
              <ModalInput value={form.o_que} onChange={v => upd("o_que", v)} placeholder="Ex.: Workshop de prevenção de burnout" />
            </ModalField>
            <ModalField label="Por quê?" span={2}>
              <ModalInput value={form.por_que} onChange={v => upd("por_que", v)} placeholder="Ex.: Burnout (2.95) acima do limite NR-1" />
            </ModalField>
            <ModalField label="Quem? *">
              <ModalInput value={form.quem} onChange={v => upd("quem", v)} placeholder="Ex.: RH + Gestão de Pessoas" />
            </ModalField>
            <ModalField label="Onde?">
              <ModalInput value={form.onde} onChange={v => upd("onde", v)} placeholder="Ex.: Todas as unidades" />
            </ModalField>
            <ModalField label="Quando? *">
              <ModalInput value={form.quando} onChange={v => upd("quando", v)} placeholder="Ex.: 30/08/2026" />
            </ModalField>
            <ModalField label="Prazo">
              <select value={form.prazo_tipo} onChange={e => upd("prazo_tipo", e.target.value)} style={{ width: "100%", height: 42, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", fontSize: 14 }}>
                <option value="curto">Curto prazo — até 3 meses</option>
                <option value="medio">Médio prazo — 3–6 meses</option>
                <option value="longo">Longo prazo — 6–12 meses</option>
              </select>
            </ModalField>
            <ModalField label="Como?" span={2}>
              <textarea value={form.como} onChange={e => upd("como", e.target.value)} placeholder="Descreva como a ação será implementada…" rows={3} style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", fontSize: 14, resize: "vertical", fontFamily: "inherit" }} />
            </ModalField>
            <ModalField label="Quanto custa?">
              <ModalInput value={form.quanto} onChange={v => upd("quanto", v)} placeholder="Ex.: R$ 0 / R$ 8.400" />
            </ModalField>
            <ModalField label="Status">
              <select value={form.status} onChange={e => upd("status", e.target.value)} style={{ width: "100%", height: 42, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", fontSize: 14 }}>
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </ModalField>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--line)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn btn-soft" style={{ height: 40 }}>Cancelar</button>
          <button onClick={() => canSave && onSave(form)} disabled={!canSave} className="btn btn-accent" style={{ height: 40, opacity: canSave ? 1 : 0.5 }}>
            <Icon name="check" size={14} /> {acao ? "Salvar alterações" : "Adicionar ação"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── sub-components ────────────────────────────────────────
const ModalField = ({ label, children, span }) => (
  <div style={span === 2 ? { gridColumn: "1 / -1" } : {}}>
    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const ModalInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
    style={{ width: "100%", height: 42, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", fontSize: 14 }} />
);

const PlanoStat = ({ label, value, accent }) => (
  <div style={{ padding: "14px 18px", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
    <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    <div style={{
      fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 28, marginTop: 6,
      color: accent === "health" ? "var(--health-deep)" : accent === "sky" ? "var(--sky)" : accent === "amber" ? "#92600A" : "var(--ink)",
    }}>{value}</div>
  </div>
);

Object.assign(window, { PlanoAcaoScreen });
