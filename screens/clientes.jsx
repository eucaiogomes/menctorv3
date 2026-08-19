/* global React, Icon, Page, CLIENTES, CLIENTE_ETAPAS, ETAPAS_CLIENTE, riskPill, riskLabel */
const { useState, useEffect } = React;

// ════════════════════════════════════════════════════════════
// CLIENTES — active client portfolio (carteira)
// ════════════════════════════════════════════════════════════

const getRoadmapProgress = (c) => {
  if (!c) return null;
  const etapaNum = c.current_step || 1;
  const labels = ["", "Cadastro", "Proposta", "Contrato", "Sensibilização", "Diagnóstico", "Entrevistas", "Relatórios", "Apresentação"];
  const pct = Math.round(((etapaNum - 1) / 8) * 100);
  return {
    etapaAtual: etapaNum,
    totalEtapas: 8,
    etapaLabel: labels[etapaNum] || `Etapa ${etapaNum}`,
    pct,
    faseNumero: Math.min(3, Math.ceil(etapaNum / 3)),
    faseLabel: labels[etapaNum] || "",
  };
};


const ETAPA_LABELS = ["", "Cadastro", "Proposta", "Contrato", "Sensibilização", "Diagnóstico", "Entrevistas", "Relatórios", "Apresentação"];

const FILTERS = [
  { id: "todos",      label: "Todos" },
  { id: "alto-risco", label: "Alto risco" },
  ...ETAPA_LABELS.slice(1).map((label, i) => ({ id: `etapa-${i + 1}`, label: `${i + 1}. ${label}` })),
];

const ClientesScreen = ({ navigate }) => {
  const [filter, setFilter] = useState("todos");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await (window.MenctorDB?.listClients?.() || Promise.resolve([]));
      setClients(data || []);
    } catch (e) {
      console.error("Erro ao carregar clientes", e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const ativos = clients.filter(c => c.status === "ativo" || !c.status);
  const totalMRR = ativos.reduce((s, c) => s + (c.mrr || 0), 0);
  const totalEmp = ativos.reduce((s, c) => s + (c.employees || 0), 0);
  const totalAval = 14;

  const filtered = ativos.filter(c => {
    if (filter === "todos") return true;
    if (filter === "alto-risco") return c.risk != null && c.risk >= 2.5;
    if (filter.startsWith("etapa-")) {
      const etapaNum = Number(filter.replace("etapa-", ""));
      const step = c.current_step || 1;
      return step === etapaNum;
    }
    return true;
  });

  return (
    <Page>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Carteira ativa</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Clientes</h1>
          <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 560 }}>
            Acompanhe a saude, progresso no roadmap e proximas acoes de cada cliente ativo.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => navigate("cadastro-cliente")}
            className="btn btn-accent"
            style={{ height: 42, flexShrink: 0, marginTop: 8 }}
          >
            <Icon name="plus" size={16} /> Novo cliente
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <CarteiraStat label="Clientes ativos"        value={ativos.length} />
        <CarteiraStat label="Colaboradores cobertos" value={totalEmp.toLocaleString("pt-BR")} />
        <CarteiraStat label="MRR consolidado"        value={`R$ ${(totalMRR / 1000).toFixed(1)}k`} accent="health" />
        <CarteiraStat label="Avaliacoes no mes"      value={totalAval} />
      </div>

      <div className="seg" style={{ marginBottom: 22 }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`seg-item${filter === f.id ? " is-active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {loading && <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center" }}>Carregando clientes...</div>}
        {!loading && filtered.map(c => (
          <ClientCard key={c.id} cliente={c} navigate={navigate} />
        ))}
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "60px 24px", textAlign: "center", color: "var(--ink-muted)", fontSize: 14 }}>
            Nenhum cliente neste filtro.
          </div>
        )}
      </div>
    </Page>
  );
};

const ClientCard = ({ cliente: c, navigate }) => {
  const prog = getRoadmapProgress(c);

  return (
    <div
      className="card card-hover"
      onClick={() => navigate("roadmap", { clienteId: c.id, etapa: 1 })}
      style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }}
    >
      <div style={{ padding: "20px 22px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
          <span style={{
            flexShrink: 0, width: 44, height: 44, borderRadius: 12,
            background: c.color, color: "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em",
          }}>
            {c.name[0]}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, marginBottom: 3 }}>{c.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{c.contact}</div>
          </div>
          <span style={{ flexShrink: 0, fontSize: 11.5, padding: "4px 10px", borderRadius: 999, background: "var(--canvas-warm)", color: "var(--ink-soft)", border: "1px solid var(--line)", fontWeight: 500 }}>
            {c.sector}
          </span>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-faint)", fontWeight: 700, marginBottom: 2 }}>Colaboradores</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{(c.employees || 0).toLocaleString("pt-BR")}</div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-faint)", fontWeight: 700, marginBottom: 2 }}>Saude NR-1</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{c.risk ? c.risk.toFixed(2) : "—"}</span>
              {c.risk && <span className={`pill ${riskPill(c.risk)}`} style={{ fontSize: 10 }}>{riskLabel(c.risk)}</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-faint)", fontWeight: 700, marginBottom: 2 }}>MRR</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>R$ {(c.mrr || 0).toLocaleString("pt-BR")}</div>
          </div>
        </div>

        {prog && (
          <div style={{
            padding: "12px 14px", borderRadius: 12,
            background: "var(--surface-sage)", border: "1px solid var(--health-soft)",
            marginBottom: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name="map" size={13} color="var(--health-deep)" />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--health-deep)" }}>
                  Etapa {prog.etapaAtual}/7
                </span>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--health-deep)", fontWeight: 600 }}>{prog.pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: "rgba(47,125,111,0.18)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "var(--health)", width: `${prog.pct}%`, transition: "width .4s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--health-deep)", opacity: 0.75, marginTop: 5 }}>{prog.etapaLabel}</div>
          </div>
        )}

        <div style={{ fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.45, display: "flex", gap: 7, alignItems: "flex-start", marginTop: 6 }}>
          <Icon name="flag" size={12} color="var(--orange)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{c.nextAction}</span>
        </div>
      </div>

      <div onClick={e => e.stopPropagation()} style={{ marginTop: "auto", padding: "12px 22px 18px", borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
        {prog && (
          <button
            onClick={() => navigate("roadmap", { clienteId: c.id, etapa: 1 })}
            className="btn btn-primary"
            style={{ width: "100%", height: 36, justifyContent: "center", fontSize: 13 }}
          >
            <Icon name="map" size={13} /> Abrir etapas do projeto
          </button>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          <button
            onClick={() => navigate("matriz-risco", { clienteId: c.id })}
            className="btn btn-soft"
            style={{ height: 34, justifyContent: "center", fontSize: 11.5, padding: "0 6px", background: "rgba(0,32,77,0.06)", color: "var(--navy)" }}
            title="Matriz de Risco (PGR) — NR-01"
          >
            <Icon name="activity" size={12} color="var(--navy)" /> Matriz PGR
          </button>
          <button
            onClick={() => navigate("plano-acao", { clienteId: c.id })}
            className="btn btn-soft"
            style={{ height: 34, justifyContent: "center", fontSize: 11.5, padding: "0 6px" }}
          >
            <Icon name="clipboard" size={12} /> Plano Ação
          </button>
          <button
            onClick={() => navigate("relatorios", { clienteId: c.id })}
            className="btn btn-soft"
            style={{ height: 34, justifyContent: "center", fontSize: 11.5, padding: "0 6px" }}
          >
            <Icon name="file" size={12} /> Relatórios
          </button>
        </div>
      </div>
    </div>
  );
};

const CarteiraStat = ({ label, value, accent }) => (
  <div className="card" style={{ padding: "14px 18px", borderRadius: "var(--r-md)" }}>
    <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    <div style={{
      fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em",
      fontSize: 28, marginTop: 6,
      color: accent === "health" ? "var(--health-deep)" : "var(--ink)",
    }}>{value}</div>
  </div>
);

Object.assign(window, { ClientesScreen });
