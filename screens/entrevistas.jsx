/* global React, Icon, Page, CLIENTES, ENTREVISTA_ESTRUTURAS, ENTREVISTA_FATORES, ENTREVISTA_MATURIDADE, CLASSIFICACAO_LABELS, CLASSIFICACAO_CORES, ENTREVISTAS_MOCK */
const { useState, useMemo } = React;

const EntrevistasScreen = ({ navigate }) => {
  const [clienteFilter, setClienteFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [modalNovo, setModalNovo] = useState(false);

  // Form novo
  const [novoClienteId, setNovoClienteId] = useState(CLIENTES[0]?.id || "");
  const [novoTitulo, setNovoTitulo] = useState("Entrevista de Avaliação dos Fatores Psicossociais");
  const [novoEntrevistador, setNovoEntrevistador] = useState("Caio Guedes");

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
      data: new Date().toISOString().split("T")[0],
      status: "rascunho",
      fatoresAvaliados: {},
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

  const stats = useMemo(() => {
    const total = entrevistas.length;
    const concluidas = entrevistas.filter(e => e.status === "concluida").length;
    const emAndamento = entrevistas.filter(e => e.status === "em_andamento").length;
    return { total, concluidas, emAndamento };
  }, [entrevistas]);

  return (
    <Page>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 4 }}>
            Metodologia CERTIFICA NR1 · Avaliação Qualitativa
          </div>
          <h1 className="display" style={{ fontSize: 28, margin: 0, color: "var(--ink)" }}>
            Entrevistas de Riscos Psicossociais
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ink-muted)" }}>
            Roteiro estruturado de 12 fatores em 3 estruturas (Relações, Atividades, Organizacional) para diagnóstico e classificação de maturidade.
          </p>
        </div>
        <button
          onClick={() => setModalNovo(true)}
          className="btn btn-primary"
          style={{ height: 40, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}
        >
          <Icon name="plus" size={16} /> Nova Entrevista
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total de Entrevistas
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginTop: 6, color: "var(--ink)" }}>
            {stats.total}
          </div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Em Andamento
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginTop: 6, color: "var(--warning)" }}>
            {stats.emAndamento}
          </div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--health-deep)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Concluídas
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, marginTop: 6, color: "var(--health-deep)" }}>
            {stats.concluidas}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <input
            type="text"
            placeholder="Buscar por cliente ou título..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", height: 38, padding: "0 12px 0 34px",
              borderRadius: "var(--r-md)", border: "1px solid var(--border)",
              fontSize: 13, background: "#fff"
            }}
          />
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)" }}>
            <Icon name="search" size={15} />
          </div>
        </div>

        <select
          value={clienteFilter}
          onChange={e => setClienteFilter(e.target.value)}
          style={{
            height: 38, padding: "0 12px", borderRadius: "var(--r-md)",
            border: "1px solid var(--border)", fontSize: 13, background: "#fff", color: "var(--ink)"
          }}
        >
          <option value="todos">Todos os Clientes</option>
          {CLIENTES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            height: 38, padding: "0 12px", borderRadius: "var(--r-md)",
            border: "1px solid var(--border)", fontSize: 13, background: "#fff", color: "var(--ink)"
          }}
        >
          <option value="todos">Todos os Status</option>
          <option value="rascunho">Rascunho</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluida">Concluída</option>
        </select>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-muted)" }}>
            Nenhuma entrevista encontrada para os filtros selecionados.
          </div>
        ) : (
          filtered.map(item => {
            const cliente = CLIENTES.find(c => c.id === item.clienteId) || { name: "Cliente", sector: "Setor", color: "#F66B0A" };
            const avaliadosCount = Object.keys(item.fatoresAvaliados || {}).length;
            const pct = Math.round((avaliadosCount / 12) * 100);

            // Structure progress
            const relCount = ENTREVISTA_FATORES.filter(f => f.estruturaId === "relacoes" && item.fatoresAvaliados?.[f.id]).length;
            const atvCount = ENTREVISTA_FATORES.filter(f => f.estruturaId === "atividades" && item.fatoresAvaliados?.[f.id]).length;
            const orgCount = ENTREVISTA_FATORES.filter(f => f.estruturaId === "organizacional" && item.fatoresAvaliados?.[f.id]).length;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: "20px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  transition: "border-color .2s, box-shadow .2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: 46, height: 46, borderRadius: 12,
                      background: `${cliente.color}15`, color: cliente.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 18, flexShrink: 0
                    }}
                  >
                    {cliente.name[0]}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{item.titulo}</span>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                          background: item.status === "concluida" ? "var(--health-soft)" : item.status === "em_andamento" ? "var(--amber-soft)" : "var(--surface-muted)",
                          color: item.status === "concluida" ? "var(--health-deep)" : item.status === "em_andamento" ? "var(--warning)" : "var(--ink-muted)",
                        }}
                      >
                        {item.status === "concluida" ? "Concluída" : item.status === "em_andamento" ? "Em Andamento" : "Rascunho"}
                      </span>
                    </div>

                    <div style={{ fontSize: 12.5, color: "var(--ink-muted)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <span><strong>Cliente:</strong> {cliente.name}</span>
                      <span>·</span>
                      <span><strong>Entrevistador:</strong> {item.entrevistador}</span>
                      <span>·</span>
                      <span><strong>Data:</strong> {new Date(item.data).toLocaleDateString("pt-BR")}</span>
                    </div>

                    {/* Progress chips per structure */}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "var(--surface-2)", color: "var(--ink-soft)" }}>
                        Relações: {relCount}/4
                      </span>
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "var(--surface-2)", color: "var(--ink-soft)" }}>
                        Atividades: {atvCount}/4
                      </span>
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "var(--surface-2)", color: "var(--ink-soft)" }}>
                        Organizacional: {orgCount}/4
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar + Action */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: "right", minWidth: 100 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? "var(--health-deep)" : "var(--ink)" }}>
                      {avaliadosCount}/12 fatores ({pct}%)
                    </div>
                    <div style={{ width: 100, height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden", marginTop: 4 }}>
                      <div style={{ height: "100%", background: pct === 100 ? "var(--health)" : "var(--accent)", width: `${pct}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("entrevista-detalhe", { id: item.id })}
                    className="btn btn-primary"
                    style={{ height: 38, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {item.status === "concluida" ? "Ver Resultado" : "Conduzir"} <Icon name="chevron-right" size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nova Entrevista */}
      {modalNovo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(14,39,72,0.45)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 480, padding: 24, background: "#fff", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-modal)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Nova Entrevista de Riscos</h2>
              <button onClick={() => setModalNovo(false)} style={{ color: "var(--ink-muted)", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>

            <form onSubmit={handleCriar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Empresa / Cliente *</label>
                <select
                  value={novoClienteId}
                  onChange={e => setNovoClienteId(e.target.value)}
                  style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", fontSize: 13 }}
                  required
                >
                  {CLIENTES.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.sector})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Título da Avaliação *</label>
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={e => setNovoTitulo(e.target.value)}
                  style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", fontSize: 13 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Terapeuta Corporativo / Entrevistador</label>
                <input
                  type="text"
                  value={novoEntrevistador}
                  onChange={e => setNovoEntrevistador(e.target.value)}
                  style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setModalNovo(false)} className="btn btn-soft" style={{ height: 36, fontSize: 13 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
                  Iniciar Entrevista
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
