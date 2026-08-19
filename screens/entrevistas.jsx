/* global React, Icon, Page, CLIENTES, ENTREVISTA_ESTRUTURAS, ENTREVISTA_FATORES, ENTREVISTA_MATURIDADE, CLASSIFICACAO_LABELS, CLASSIFICACAO_CORES, ENTREVISTAS_MOCK, criarParticipantesEntrevista, agregarFatoresEntrevista, calcularProgressoEntrevista */
const { useState, useEffect, useMemo } = React;

// ════════════════════════════════════════════════════════════
// ENTREVISTAS — lista de entrevistas de avaliação psicossocial
// ════════════════════════════════════════════════════════════

const STATUS_FILTERS = [
  { id: "todos",        label: "Todos" },
  { id: "rascunho",      label: "Rascunho" },
  { id: "em_andamento",  label: "Em andamento" },
  { id: "concluida",     label: "Concluída" },
];

const STATUS_META = {
  rascunho:     { label: "Rascunho",     className: "pill-neutral" },
  em_andamento: { label: "Em andamento", className: "pill-brand" },
  concluida:    { label: "Concluída",    className: "pill-health" },
};

// Fatores agrupados por estrutura, na ordem oficial do roteiro
const FATORES_POR_ESTRUTURA = ENTREVISTA_ESTRUTURAS.map(estr => ({
  estrutura: estr,
  fatores: ENTREVISTA_FATORES.filter(f => f.estruturaId === estr.id),
}));

// Tira de calor dos 12 fatores, agrupada nas 3 estruturas do roteiro — cada
// barra mostra a média já registrada entre os participantes (ou vazio, se
// ninguém respondeu ainda esse fator).
const StructureHeatStrip = ({ agregados = {} }) => (
  <div style={{ display: "flex", gap: 12 }}>
    {FATORES_POR_ESTRUTURA.map(({ estrutura, fatores }) => (
      <div key={estrutura.id} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", gap: 3 }}>
          {fatores.map(f => {
            const ag = agregados[f.id];
            const cor = ag ? CLASSIFICACAO_CORES[ag.classificacaoArredondada] : "var(--border-strong)";
            const titulo = ag
              ? `${f.nome} — média ${ag.media.toFixed(1)} (${ag.totalRespostas} resposta${ag.totalRespostas === 1 ? "" : "s"})`
              : `${f.nome} — pendente`;
            return (
              <span
                key={f.id}
                title={titulo}
                style={{ width: 7, height: 18, borderRadius: 2, background: cor, display: "inline-block", opacity: ag ? 1 : 0.55 }}
              />
            );
          })}
        </div>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {estrutura.short}
        </span>
      </div>
    ))}
  </div>
);

const EntrevistaStatCard = ({ label, value, hint, accent }) => (
  <div className="card" style={{ padding: "16px 20px" }}>
    <div className="eyebrow">{label}</div>
    <div style={{
      fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em",
      fontSize: 30, marginTop: 6,
      color: accent === "health" ? "var(--health-deep)" : accent === "accent" ? "var(--accent-cta)" : "var(--ink)",
    }}>{value}</div>
    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 3 }}>{hint}</div>
  </div>
);

const EntrevistaCard = ({ item, navigate }) => {
  const cliente = CLIENTES.find(c => c.id === item.clienteId) || { name: "Cliente", sector: "—", color: "var(--ink-faint)" };
  const agregados = agregarFatoresEntrevista(item);
  const progresso = calcularProgressoEntrevista(item);
  const isConcluida = item.status === "concluida";
  const status = STATUS_META[item.status] || STATUS_META.rascunho;

  return (
    <div className="card card-hover" style={{ padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flex: "1 1 380px", minWidth: 0 }}>
        <span style={{
          flexShrink: 0, width: 48, height: 48, borderRadius: 12,
          background: cliente.color, color: "#fff",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--display)", fontWeight: 700, fontSize: 19,
        }}>
          {cliente.name[0]}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>{item.titulo}</h3>
            <span className={`pill ${status.className}`}>{status.label}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 12 }}>
            <strong style={{ color: "var(--ink-soft)" }}>{cliente.name}</strong>
            <span style={{ margin: "0 8px" }}>·</span>
            {item.entrevistador}
            <span style={{ margin: "0 8px" }}>·</span>
            {new Date(item.data).toLocaleDateString("pt-BR")}
            {item.qtdPessoas ? (
              <>
                <span style={{ margin: "0 8px" }}>·</span>
                {item.qtdPessoas} {item.qtdPessoas === 1 ? "pessoa entrevistada" : "pessoas entrevistadas"}
              </>
            ) : null}
          </div>

          <StructureHeatStrip agregados={agregados} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
        <div style={{ minWidth: 130 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: isConcluida ? "var(--health-deep)" : "var(--ink)", marginBottom: 5 }}>
            {progresso.participantesConcluidos}/{progresso.totalParticipantes} pessoas · {progresso.pct}%
          </div>
          <div style={{ width: 130, height: 5, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999, width: `${progresso.pct}%`,
              background: isConcluida ? "var(--health)" : "var(--accent)",
              transition: "width .4s ease",
            }} />
          </div>
        </div>

        <button
          onClick={() => navigate("entrevista-detalhe", { id: item.id })}
          className="btn"
          style={isConcluida
            ? { background: "var(--health-soft)", color: "var(--health-deep)", border: "1px solid var(--health-soft)" }
            : { background: "var(--accent)", borderColor: "var(--accent)", color: "#fff", boxShadow: "0 4px 14px rgba(246,107,10,0.28)" }}
        >
          {isConcluida ? "Ver resultado" : "Conduzir"} <Icon name="chevron-right" size={14} />
        </button>
      </div>
    </div>
  );
};

const EntrevistasScreen = ({ navigate }) => {
  const [clienteFilter, setClienteFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [modalNovo, setModalNovo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  const [novoClienteId, setNovoClienteId] = useState(CLIENTES[0]?.id || "");
  const [novoTitulo, setNovoTitulo] = useState("Entrevista de Avaliação dos Fatores Psicossociais");
  const [novoEntrevistador, setNovoEntrevistador] = useState("Caio Guedes");
  const [novoQtdPessoas, setNovoQtdPessoas] = useState(1);

  const [entrevistas, setEntrevistas] = useState(() => {
    try {
      const saved = localStorage.getItem("MENCTOR_ENTREVISTAS");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return ENTREVISTAS_MOCK;
  });

  const saveEntrevistas = (updated) => {
    setEntrevistas(updated);
    try {
      localStorage.setItem("MENCTOR_ENTREVISTAS", JSON.stringify(updated));
    } catch (e) { /* ignore */ }
  };

  const handleCriar = (e) => {
    e.preventDefault();
    const nova = {
      id: `ent-${Date.now()}`,
      clienteId: novoClienteId,
      titulo: novoTitulo,
      entrevistador: novoEntrevistador,
      qtdPessoas: novoQtdPessoas,
      data: new Date().toISOString().split("T")[0],
      status: "rascunho",
      participantes: criarParticipantesEntrevista(novoQtdPessoas),
      atualizadoEm: `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    };
    const updated = [nova, ...entrevistas];
    saveEntrevistas(updated);
    setModalNovo(false);
    navigate("entrevista-detalhe", { id: nova.id });
  };

  const filtered = useMemo(() => {
    return entrevistas.filter(item => {
      if (clienteFilter !== "todos" && item.clienteId !== clienteFilter) return false;
      if (statusFilter !== "todos" && item.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const cli = CLIENTES.find(c => c.id === item.clienteId);
        const cliName = cli?.name?.toLowerCase() || "";
        const tit = item.titulo?.toLowerCase() || "";
        if (!cliName.includes(q) && !tit.includes(q)) return false;
      }
      return true;
    });
  }, [entrevistas, clienteFilter, statusFilter, search]);

  useEffect(() => { setCurrentPage(1); }, [clienteFilter, statusFilter, search, itensPorPagina]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itensPorPagina));
  const page = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((page - 1) * itensPorPagina, page * itensPorPagina);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * itensPorPagina + 1;
  const rangeEnd = Math.min(page * itensPorPagina, filtered.length);

  const stats = useMemo(() => {
    const total = entrevistas.length;
    const concluidas = entrevistas.filter(e => e.status === "concluida").length;
    const emAndamento = entrevistas.filter(e => e.status === "em_andamento").length;
    return { total, concluidas, emAndamento };
  }, [entrevistas]);

  return (
    <Page>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 620 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Frente 1 · Avaliação dos fatores de riscos psicossociais</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Entrevistas</h1>
          <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)" }}>
            Roteiro estruturado dos 12 fatores em 3 estruturas — {ENTREVISTA_ESTRUTURAS.map(e => e.short).join(" · ")} — para classificar a maturidade preventiva de cada cliente.
          </p>
        </div>
        <button onClick={() => setModalNovo(true)} className="btn btn-accent" style={{ height: 42, flexShrink: 0, marginTop: 8 }}>
          <Icon name="plus" size={16} /> Nova entrevista
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        <EntrevistaStatCard label="Total de entrevistas" value={stats.total} hint="Todos os registros" />
        <EntrevistaStatCard label="Em andamento" value={stats.emAndamento} hint="Aguardando conclusão" accent="accent" />
        <EntrevistaStatCard label="Concluídas" value={stats.concluidas} hint="Entrevistas finalizadas" accent="health" />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <input
            type="text"
            placeholder="Buscar por cliente ou título da entrevista..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", height: 40, paddingLeft: 38, boxSizing: "border-box" }}
          />
          <Icon name="search" size={15} color="var(--ink-faint)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
        </div>

        <select
          value={clienteFilter}
          onChange={e => setClienteFilter(e.target.value)}
          style={{ height: 40, minWidth: 180 }}
        >
          <option value="todos">Todos os clientes</option>
          {CLIENTES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="seg">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.id}
              className={`seg-item${statusFilter === f.id ? " is-active" : ""}`}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {pageItems.length === 0 ? (
          <div className="card" style={{ padding: "60px 24px", textAlign: "center", color: "var(--ink-muted)", fontSize: 14 }}>
            Nenhuma entrevista encontrada para os filtros selecionados.
          </div>
        ) : (
          pageItems.map(item => <EntrevistaCard key={item.id} item={item} navigate={navigate} />)
        )}
      </div>

      {filtered.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--line)", fontSize: 12.5, color: "var(--ink-muted)", flexWrap: "wrap", gap: 12 }}>
          <div>Mostrando {rangeStart} a {rangeEnd} de {filtered.length} entrevistas</div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-soft"
                style={{ width: 32, height: 32, padding: 0, justifyContent: "center", opacity: page === 1 ? 0.45 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
              >
                <Icon name="chevron-left" size={14} />
              </button>
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>Página {page} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-soft"
                style={{ width: 32, height: 32, padding: 0, justifyContent: "center", opacity: page === totalPages ? 0.45 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
              >
                <Icon name="chevron-right" size={14} />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Itens por página</span>
              <select
                value={itensPorPagina}
                onChange={e => setItensPorPagina(Number(e.target.value))}
                style={{ height: 32, padding: "0 8px" }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {modalNovo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(14,39,72,0.5)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 500, padding: 28, background: "var(--surface)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-modal)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Nova entrevista de riscos</h2>
              <button onClick={() => setModalNovo(false)} style={{ color: "var(--ink-faint)", display: "flex" }}>
                <Icon name="x" size={20} />
              </button>
            </div>

            <form onSubmit={handleCriar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Empresa / Cliente *</label>
                <select
                  value={novoClienteId}
                  onChange={e => setNovoClienteId(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                  required
                >
                  {CLIENTES.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.sector})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Título da avaliação *</label>
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={e => setNovoTitulo(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Terapeuta corporativo / entrevistador</label>
                  <input
                    type="text"
                    value={novoEntrevistador}
                    onChange={e => setNovoEntrevistador(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Pessoas a entrevistar *</label>
                  <input
                    type="number"
                    min={1}
                    value={novoQtdPessoas}
                    onChange={e => setNovoQtdPessoas(Math.max(1, Number(e.target.value) || 1))}
                    style={{ width: "100%", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => setModalNovo(false)} className="btn btn-soft" style={{ height: 38, fontSize: 13 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ height: 38, fontSize: 13 }}>
                  Iniciar entrevista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Page>
  );
};

Object.assign(window, { EntrevistasScreen });
