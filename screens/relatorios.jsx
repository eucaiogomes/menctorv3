/* global React, Icon, Page, RiskMedallion, CLIENTES, AVALIACOES_ATIVAS, ROADMAP_ESTADO, ROADMAP_FASES */
const { useState, useMemo } = React;

const getRoadmapCtx = (clienteId) => {
  const est = window.ROADMAP_ESTADO && window.ROADMAP_ESTADO[clienteId];
  const fases = window.ROADMAP_FASES;
  if (!est || !fases) return null;
  const faseIdx = est.faseAtual;
  const etapasEst = est.etapas[faseIdx] || [];
  const concluidas = etapasEst.filter(e => e.status === "concluida").length;
  const emIdx = etapasEst.findIndex(e => e.status === "em_andamento");
  const etapaNum = emIdx >= 0 ? emIdx + 1 : concluidas + 1;
  const pct = Math.round((concluidas / 8) * 100);
  return { faseNum: faseIdx + 1, faseLabel: fases[faseIdx].label, etapaNum, pct };
};

const TIPO_META = {
  clima: {
    label: "Pesquisa de Clima Organizacional",
    desc: "Diagnostico consolidado com adesao, score geral, dimensoes COPSOQ II e plano de acao.",
    color: "var(--health-deep)",
    icon: "file",
    accentClass: "btn-primary",
  },
  matriz: {
    label: "Matriz NR-1",
    desc: "Classificacao por severidade e plano de acao priorizado conforme os criterios da NR-1.",
    color: "var(--coral)",
    icon: "clipboard",
    accentClass: "btn-accent",
  },
};

const RelatoriosCredenciadoScreen = ({ navigate, params = {} }) => {
  const [expandedCliente, setExpandedCliente] = useState(params.clienteId || null);
  const [selectedAvaliacaoByCliente, setSelectedAvaliacaoByCliente] = useState({});
  const [etapasMarcadas, setEtapasMarcadas] = useState({});
  const [exportMsg, setExportMsg] = useState({});

  const ativos = useMemo(() => CLIENTES.filter(c => c.status === "ativo"), []);

  const avaliacoesPorCliente = useMemo(() => {
    const map = {};
    ativos.forEach(c => {
      map[c.id] = AVALIACOES_ATIVAS.filter(a =>
        c.name.toLowerCase().startsWith(a.cliente.toLowerCase()) ||
        a.cliente.toLowerCase().startsWith(c.name.split(" ")[0].toLowerCase())
      );
    });
    return map;
  }, [ativos]);

  const totalRelatorios = ativos.reduce((s, c) =>
    s + (avaliacoesPorCliente[c.id] || []).filter(a => a.media !== null).length, 0
  );

  const showExportMsg = (clienteId, msg) => {
    setExportMsg(prev => ({ ...prev, [clienteId]: msg }));
    setTimeout(() => setExportMsg(prev => ({ ...prev, [clienteId]: "" })), 3000);
  };

  return (
    <Page>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Documentacao</div>
        <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Relatorios</h1>
        <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 640 }}>
          Selecione um cliente e escolha qual relatorio deseja visualizar ou exportar.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        <RelStat label="Clientes ativos" value={ativos.length} />
        <RelStat label="Diagnosticos encerrados" value={totalRelatorios} accent="health" />
        <RelStat label="Etapas desbloqueadas" value={Object.keys(etapasMarcadas).length} accent="orange" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {ativos.map(c => {
          const avaliacoes = (avaliacoesPorCliente[c.id] || []).filter(a => a.media !== null);
          const ctx = getRoadmapCtx(c.id);
          const expanded = expandedCliente === c.id;
          const selectedAvaliacao = selectedAvaliacaoByCliente[c.id] || avaliacoes[0];
          const msg = exportMsg[c.id];

          return (
            <div key={c.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => setExpandedCliente(expanded ? null : c.id)}
                style={{ width: "100%", padding: "20px 24px", display: "flex", alignItems: "center", gap: 18, textAlign: "left" }}
              >
                <span style={{
                  flexShrink: 0, width: 44, height: 44, borderRadius: 12,
                  background: c.color, color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--display)", fontWeight: 700, fontSize: 20,
                }}>
                  {c.name[0]}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{c.sector} · {c.employees.toLocaleString("pt-BR")} colab.</span>
                  </div>

                  {ctx && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon name="map" size={12} color="var(--health-deep)" />
                      <span style={{ fontSize: 12, color: "var(--health-deep)", fontWeight: 600 }}>
                        Fase {ctx.faseNum} · Etapa {ctx.etapaNum}/8
                      </span>
                      <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>· {ctx.faseLabel}</span>
                      <div style={{ width: 60, height: 4, borderRadius: 999, background: "var(--canvas-warm)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${ctx.pct}%`, background: "var(--health)", borderRadius: 999 }} />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", fontWeight: 600 }}>
                    {avaliacoes.length} relatorio{avaliacoes.length !== 1 ? "s" : ""}
                  </span>
                  <Icon name={expanded ? "chevron-down" : "chevron-right"} size={18} color="var(--ink-muted)" />
                </div>
              </button>

              {expanded && (
                <div style={{ borderTop: "1px solid var(--line)", background: "var(--canvas-warm)", padding: 24 }}>
                  {avaliacoes.length === 0 ? (
                    <div style={{ padding: "32px 0", textAlign: "center", color: "var(--ink-muted)", fontSize: 14 }}>
                      <Icon name="file" size={28} color="var(--line-strong)" strokeWidth={1.2} />
                      <div style={{ marginTop: 12, fontWeight: 500, color: "var(--ink-soft)" }}>Nenhum diagnostico encerrado ainda.</div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>Os relatorios ficam disponiveis apos o encerramento da coleta.</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 18, alignItems: "start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div className="eyebrow" style={{ marginBottom: 2 }}>Diagnosticos encerrados</div>
                        {avaliacoes.map(a => (
                          <AvaliacaoRelatorioCard
                            key={a.id}
                            avaliacao={a}
                            selected={selectedAvaliacao?.id === a.id}
                            onSelect={() => setSelectedAvaliacaoByCliente(prev => ({ ...prev, [c.id]: a }))}
                          />
                        ))}
                      </div>

                      <div style={{ position: "sticky", top: 22 }}>
                        <ReportMenuBox
                          avaliacao={selectedAvaliacao}
                          cliente={c}
                          marcada={etapasMarcadas[c.id]}
                          onMarcar={() => setEtapasMarcadas(prev => ({ ...prev, [c.id]: true }))}
                          navigate={navigate}
                          onExport={(msg) => showExportMsg(c.id, msg)}
                        />
                        {msg && (
                          <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                            <Icon name="check" size={14} /> {msg}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
};

const AvaliacaoRelatorioCard = ({ avaliacao: a, selected, onSelect }) => (
  <button
    onClick={onSelect}
    className="card"
    style={{
      padding: 18,
      background: "#fff",
      textAlign: "left",
      display: "grid",
      gridTemplateColumns: "auto minmax(0,1fr) auto",
      gap: 14,
      alignItems: "center",
      border: selected ? "1px solid var(--health)" : "1px solid var(--line)",
      outline: selected ? "3px solid var(--surface-sage)" : "none",
    }}
  >
    <RiskMedallion value={a.media} size={48} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{a.titulo}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{a.periodo} · {a.respondidos}/{a.alvo} respostas ({a.adesao}% adesao)</div>
      <span style={{ marginTop: 5, display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "var(--surface-sage)", color: "var(--health-deep)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {a.status}
      </span>
    </div>
    <Icon name={selected ? "check" : "chevron-right"} size={16} color={selected ? "var(--health-deep)" : "var(--ink-muted)"} />
  </button>
);

const ReportMenuBox = ({ avaliacao: a, cliente: c, marcada, onMarcar, navigate, onExport }) => (
  <div className="card" style={{ padding: 18, background: "#fff" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Menu de relatorios</div>
        <h3 style={{ margin: 0, fontSize: 18, color: "var(--ink)" }}>{a.titulo}</h3>
        <p style={{ margin: "5px 0 0", fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.4 }}>{c.name} · {a.periodo}</p>
      </div>
      {!marcada ? (
        <button onClick={onMarcar} className="btn btn-soft" style={{ height: 30, fontSize: 11, flexShrink: 0, padding: "0 10px" }}>
          <Icon name="milestone" size={12} /> Etapa 7
        </button>
      ) : (
        <span style={{ fontSize: 11, color: "var(--health-deep)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <Icon name="check" size={12} color="var(--health-deep)" /> Etapa 7
        </span>
      )}
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Object.entries(TIPO_META).map(([tipo, meta]) => (
        <div key={tipo} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 14, background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Icon name={meta.icon} size={15} color={meta.color} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", lineHeight: 1.25 }}>{meta.label}</span>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.45 }}>{meta.desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              onClick={() => navigate("diagnostico-detalhe", { avaliacao: a, cliente: c, reportType: tipo })}
              className="btn btn-soft"
              style={{ height: 32, fontSize: 12, justifyContent: "center" }}
            >
              <Icon name="eye" size={12} /> Visualizar
            </button>
            <button
              onClick={() => onExport(`${meta.label} de ${c.name} iniciado para download.`)}
              className={`btn ${meta.accentClass}`}
              style={{ height: 32, fontSize: 12, justifyContent: "center" }}
            >
              <Icon name="download" size={12} /> Exportar
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RelStat = ({ label, value, accent }) => (
  <div style={{ padding: "14px 18px", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
    <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    <div style={{
      fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em",
      fontSize: 28, marginTop: 6,
      color: accent === "health" ? "var(--health-deep)" : accent === "orange" ? "var(--orange)" : "var(--ink)",
    }}>{value}</div>
  </div>
);

Object.assign(window, { RelatoriosCredenciadoScreen });
