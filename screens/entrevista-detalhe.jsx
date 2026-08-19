/* global React, Icon, Page, CLIENTES, ENTREVISTA_ESTRUTURAS, ENTREVISTA_FATORES, ENTREVISTA_MATURIDADE, CLASSIFICACAO_LABELS, CLASSIFICACAO_CORES, ENTREVISTAS_MOCK, getEntrevistaParticipantes, agregarFatoresEntrevista, calcularProgressoEntrevista, calcularMaturidadeEntrevista */
const { useState, useMemo, useEffect } = React;

const EntrevistaDetalheScreen = ({ navigate, id: paramId, params = {} }) => {
  const entrevistaId = paramId || params.id || "ent-1";

  // Load interview from storage or mock
  const [entrevista, setEntrevista] = useState(() => {
    try {
      const saved = localStorage.getItem("MENCTOR_ENTREVISTAS");
      if (saved) {
        const list = JSON.parse(saved);
        const found = list.find(e => e.id === entrevistaId);
        if (found) return found;
      }
    } catch (e) { /* ignore */ }
    return ENTREVISTAS_MOCK.find(e => e.id === entrevistaId) || ENTREVISTAS_MOCK[0];
  });

  const [activeTab, setActiveTab] = useState("fator-assedio"); // "fator-<id>" or "resultado"
  const [showDeepening, setShowDeepening] = useState(false);

  const cliente = useMemo(() => {
    return CLIENTES.find(c => c.id === entrevista.clienteId) || CLIENTES[0];
  }, [entrevista.clienteId]);

  const participantes = useMemo(() => getEntrevistaParticipantes(entrevista), [entrevista]);
  const [activeParticipanteId, setActiveParticipanteId] = useState(() => participantes[0]?.id);
  const activeParticipante = participantes.find(p => p.id === activeParticipanteId) || participantes[0];
  const fatoresAvaliados = activeParticipante?.fatoresAvaliados || {};

  // Save changes — grava a resposta na pessoa ativa e recalcula o status geral
  const updateFator = (fatorId, partial) => {
    const current = fatoresAvaliados[fatorId] || { classificacao: null, observacoes: "", respostas: {}, evidencias: [] };
    const updatedParticipantes = participantes.map(p => p.id !== activeParticipante.id ? p : {
      ...p,
      fatoresAvaliados: { ...p.fatoresAvaliados, [fatorId]: { ...current, ...partial } }
    });

    const progresso = calcularProgressoEntrevista({ participantes: updatedParticipantes });
    const nextStatus = progresso.totalRespondido === 0 ? "rascunho"
      : progresso.participantesConcluidos === progresso.totalParticipantes ? "concluida"
      : "em_andamento";

    const updatedEntrevista = { ...entrevista, status: nextStatus, participantes: updatedParticipantes };
    delete updatedEntrevista.fatoresAvaliados;

    setEntrevista(updatedEntrevista);

    // Persist to all interviews
    try {
      const saved = localStorage.getItem("MENCTOR_ENTREVISTAS");
      let list = saved ? JSON.parse(saved) : ENTREVISTAS_MOCK;
      const idx = list.findIndex(e => e.id === entrevista.id);
      if (idx >= 0) {
        list[idx] = updatedEntrevista;
      } else {
        list.push(updatedEntrevista);
      }
      localStorage.setItem("MENCTOR_ENTREVISTAS", JSON.stringify(list));
    } catch (e) { /* ignore */ }
  };

  // Maturidade consolidada — média das respostas de todas as pessoas por fator
  const resultadoMaturidade = useMemo(() => calcularMaturidadeEntrevista(entrevista), [entrevista]);
  const agregados = useMemo(() => agregarFatoresEntrevista(entrevista), [entrevista]);
  const progresso = useMemo(() => calcularProgressoEntrevista(entrevista), [entrevista]);

  const activeFactor = useMemo(() => {
    if (activeTab === "resultado") return null;
    const fid = activeTab.replace("fator-", "");
    return ENTREVISTA_FATORES.find(f => f.id === fid) || ENTREVISTA_FATORES[0];
  }, [activeTab]);

  const activeFactorData = activeFactor ? (fatoresAvaliados[activeFactor.id] || { classificacao: null, observacoes: "", respostas: {}, evidencias: [] }) : null;

  return (
    <Page>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => navigate("entrevistas")}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer" }}
        >
          <Icon name="chevron-left" size={15} /> Voltar para Entrevistas
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
            Pessoas concluídas: <strong>{progresso.participantesConcluidos}/{progresso.totalParticipantes}</strong> ({progresso.pct}%)
          </span>
          <div style={{ width: 120, height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", background: progresso.pct === 100 ? "var(--health)" : "var(--accent)", width: `${progresso.pct}%` }} />
          </div>
          <button
            onClick={() => setActiveTab("resultado")}
            className={`btn ${activeTab === "resultado" ? "btn-primary" : "btn-soft"}`}
            style={{ height: 34, fontSize: 12.5 }}
          >
            <Icon name="bar-chart" size={14} /> Ver Resultado & Maturidade
          </button>
        </div>
      </div>

      {/* Main title & client meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: "16px 20px", background: "#fff", borderRadius: "var(--r-lg)", border: "1px solid var(--border)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: `${cliente.color}15`, color: cliente.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
          {cliente.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
            {cliente.name} · {cliente.sector} · {entrevista.entrevistador}
            {entrevista.qtdPessoas ? ` · ${entrevista.qtdPessoas} ${entrevista.qtdPessoas === 1 ? "pessoa entrevistada" : "pessoas entrevistadas"}` : ""}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 0", color: "var(--ink)" }}>
            {entrevista.titulo}
          </h2>
        </div>
        <div>
          <span style={{
            fontSize: 11.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
            background: entrevista.status === "concluida" ? "var(--health-soft)" : "var(--amber-soft)",
            color: entrevista.status === "concluida" ? "var(--health-deep)" : "var(--warning)",
          }}>
            {entrevista.status === "concluida" ? "Concluída" : "Em Andamento"}
          </span>
        </div>
      </div>

      {/* Seletor de participante — a quem as respostas do roteiro pertencem */}
      {participantes.length > 1 && activeTab !== "resultado" && (
        <div className="card" style={{ padding: "12px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
            Respondendo por
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {participantes.map(p => {
              const count = Object.values(p.fatoresAvaliados || {}).filter(f => f?.classificacao).length;
              const done = count === ENTREVISTA_FATORES.length;
              const isActive = p.id === activeParticipante.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveParticipanteId(p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 999,
                    background: isActive ? "var(--accent-soft)" : "var(--surface-2)",
                    border: isActive ? "1px solid var(--accent-light)" : "1px solid var(--border)",
                    color: isActive ? "var(--accent-cta)" : "var(--ink-soft)",
                    fontSize: 12.5, fontWeight: isActive ? 700 : 500, cursor: "pointer"
                  }}
                >
                  {p.nome}
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, padding: "1px 6px", borderRadius: 999,
                    background: done ? "var(--health-soft)" : "var(--surface)",
                    color: done ? "var(--health-deep)" : "var(--ink-muted)",
                  }}>
                    {count}/{ENTREVISTA_FATORES.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "flex-start" }}>
        {/* Left Navigation: Structures & Factors */}
        <div className="card" style={{ padding: "14px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", padding: "4px 8px 8px" }}>
            Estruturas de Avaliação
          </div>

          {ENTREVISTA_ESTRUTURAS.map(estrutura => {
            const fatores = ENTREVISTA_FATORES.filter(f => f.estruturaId === estrutura.id);
            return (
              <div key={estrutura.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", padding: "4px 8px", background: "var(--surface-2)", borderRadius: 6, marginBottom: 4 }}>
                  {estrutura.numero}. {estrutura.short}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {fatores.map(fator => {
                    const isSelected = activeTab === `fator-${fator.id}`;
                    const fData = fatoresAvaliados[fator.id];
                    const classif = fData?.classificacao;

                    return (
                      <button
                        key={fator.id}
                        onClick={() => setActiveTab(`fator-${fator.id}`)}
                        style={{
                          width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6,
                          background: isSelected ? "var(--accent-soft)" : "transparent",
                          border: isSelected ? "1px solid var(--accent-light)" : "1px solid transparent",
                          color: isSelected ? "var(--accent-cta)" : "var(--ink)",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          fontSize: 12.5, fontWeight: isSelected ? 600 : 400,
                          cursor: "pointer", transition: "all .15s"
                        }}
                      >
                        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {fator.numero} {fator.nome}
                        </span>
                        {classif ? (
                          <span style={{
                            width: 18, height: 18, borderRadius: 999,
                            background: CLASSIFICACAO_CORES[classif], color: "#fff",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, flexShrink: 0, marginLeft: 6
                          }}>
                            {classif}
                          </span>
                        ) : (
                          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--border-strong)", flexShrink: 0, marginLeft: 6 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 10 }}>
            <button
              onClick={() => setActiveTab("resultado")}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                background: activeTab === "resultado" ? "var(--navy)" : "var(--surface-muted)",
                color: activeTab === "resultado" ? "#fff" : "var(--ink)",
                border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}
            >
              <Icon name="bar-chart" size={15} color={activeTab === "resultado" ? "#fff" : "var(--ink)"} />
              Maturidade & Resultado
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div>
          {activeTab === "resultado" ? (
            /* Result & Maturity Dashboard */
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Maturity Level Hero Card */}
              {resultadoMaturidade && (
                <div
                  className="card"
                  style={{
                    padding: "24px 28px",
                    background: `linear-gradient(135deg, ${resultadoMaturidade.nivel.cor}0D, #ffffff)`,
                    borderLeft: `5px solid ${resultadoMaturidade.nivel.cor}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                    <div>
                      <div className="eyebrow" style={{ color: resultadoMaturidade.nivel.cor, marginBottom: 4 }}>
                        Diagnóstico Global de Maturidade Organizacional · CERTIFICA NR1
                      </div>
                      <h1 className="display" style={{ fontSize: 24, margin: 0, color: "var(--ink)" }}>
                        Nível {resultadoMaturidade.nivel.nivel} — {resultadoMaturidade.nivel.label}
                      </h1>
                      <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--ink-soft)", maxWidth: 700, lineHeight: 1.5 }}>
                        {resultadoMaturidade.nivel.descricao}
                      </p>
                    </div>

                    <div style={{ textAlign: "right", padding: "12px 18px", background: "#fff", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase" }}>Média dos Fatores</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: resultadoMaturidade.nivel.cor, fontFamily: "var(--display)" }}>
                        {resultadoMaturidade.media}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>escala de 1 a 5</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                      Características Observadas:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {resultadoMaturidade.nivel.caracteristicas.map((carac, i) => (
                        <span key={i} style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 999, background: "#fff", border: `1px solid ${resultadoMaturidade.nivel.cor}40`, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 999, background: resultadoMaturidade.nivel.cor }} />
                          {carac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Breakdown by Structure */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                <div className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase" }}>1. Relações</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>Modelos Relacionais</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginTop: 8 }}>
                    {resultadoMaturidade?.mediasPorEstrutura.relacoes || "—"}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4 }}>Assédio, Liderança, Apoio e Interpessoais</div>
                </div>

                <div className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase" }}>2. Atividades</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>Estrutura das Tarefas</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginTop: 8 }}>
                    {resultadoMaturidade?.mediasPorEstrutura.atividades || "—"}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4 }}>Sobrecarga, Monotonia, Repetição e Metas</div>
                </div>

                <div className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase" }}>3. Organizacional</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>Gestão & Governança</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginTop: 8 }}>
                    {resultadoMaturidade?.mediasPorEstrutura.organizacional || "—"}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4 }}>Reconhecimento, Segurança, Mudanças e Justiça</div>
                </div>
              </div>

              {/* Detailed Factors Table */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "var(--ink)" }}>
                  Consolidação dos 12 Fatores de Risco
                </h3>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
                        <th style={{ padding: "8px 10px" }}>#</th>
                        <th style={{ padding: "8px 10px" }}>Fator de Risco</th>
                        <th style={{ padding: "8px 10px" }}>Estrutura</th>
                        <th style={{ padding: "8px 10px" }}>Média entre pessoas</th>
                        <th style={{ padding: "8px 10px" }}>Respostas</th>
                        <th style={{ padding: "8px 10px" }}>Evidências</th>
                        <th style={{ padding: "8px 10px" }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ENTREVISTA_FATORES.map(fator => {
                        const ag = agregados[fator.id];
                        const classif = ag?.classificacaoArredondada;
                        const evCount = participantes.reduce((s, p) => s + (p.fatoresAvaliados?.[fator.id]?.evidencias?.length || 0), 0);
                        const estr = ENTREVISTA_ESTRUTURAS.find(e => e.id === fator.estruturaId);

                        return (
                          <tr key={fator.id} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "10px", fontWeight: 700, color: "var(--ink-muted)" }}>{fator.numero}</td>
                            <td style={{ padding: "10px", fontWeight: 600, color: "var(--ink)" }}>
                              {fator.nome}
                              {ag?.isCritico && <span className="pill pill-coral" style={{ marginLeft: 8 }}>crítico</span>}
                            </td>
                            <td style={{ padding: "10px", color: "var(--ink-muted)" }}>{estr?.short}</td>
                            <td style={{ padding: "10px" }}>
                              {ag ? (
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  padding: "3px 8px", borderRadius: 999,
                                  background: `${CLASSIFICACAO_CORES[classif]}15`,
                                  color: CLASSIFICACAO_CORES[classif],
                                  fontWeight: 700, fontSize: 11.5
                                }}>
                                  <span style={{ width: 6, height: 6, borderRadius: 999, background: CLASSIFICACAO_CORES[classif] }} />
                                  {ag.media.toFixed(1)} · {CLASSIFICACAO_LABELS[classif]}
                                </span>
                              ) : (
                                <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>Não avaliado</span>
                              )}
                            </td>
                            <td style={{ padding: "10px", color: "var(--ink-muted)", fontSize: 12 }}>
                              {ag ? `${ag.totalRespostas}/${participantes.length} pessoas` : `0/${participantes.length} pessoas`}
                            </td>
                            <td style={{ padding: "10px", color: "var(--ink-muted)", fontSize: 12 }}>
                              {evCount > 0 ? `${evCount} identificadas` : "Nenhuma"}
                            </td>
                            <td style={{ padding: "10px" }}>
                              <button
                                onClick={() => setActiveTab(`fator-${fator.id}`)}
                                className="btn btn-soft"
                                style={{ height: 28, fontSize: 11.5, padding: "0 8px" }}
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Single Factor Conduction Form */
            activeFactor && activeFactorData && (
              <div className="card" style={{ padding: "24px 28px" }}>
                {/* Factor Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 4 }}>
                      {ENTREVISTA_ESTRUTURAS.find(e => e.id === activeFactor.estruturaId)?.label} · Fator {activeFactor.numero}
                    </div>
                    <h1 className="display" style={{ fontSize: 22, margin: 0, color: "var(--ink)" }}>
                      {activeFactor.nome}
                    </h1>
                  </div>

                  {/* Classification Selector in Header */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", marginBottom: 4 }}>Classificação Final</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1, 2, 3, 4, 5].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => updateFator(activeFactor.id, { classificacao: lvl })}
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: activeFactorData.classificacao === lvl ? CLASSIFICACAO_CORES[lvl] : "var(--surface-2)",
                            color: activeFactorData.classificacao === lvl ? "#fff" : "var(--ink)",
                            border: activeFactorData.classificacao === lvl ? "none" : "1px solid var(--border)",
                            fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .15s"
                          }}
                          title={`${lvl} — ${CLASSIFICACAO_LABELS[lvl]}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    {activeFactorData.classificacao && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: CLASSIFICACAO_CORES[activeFactorData.classificacao], marginTop: 4 }}>
                        {CLASSIFICACAO_LABELS[activeFactorData.classificacao]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Objective */}
                <div style={{ padding: "12px 16px", background: "var(--accent-soft)", borderRadius: "var(--r-md)", borderLeft: "3px solid var(--accent)", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.45, marginBottom: 24 }}>
                  <strong>Objetivo da Avaliação:</strong> {activeFactor.objetivo}
                </div>

                {/* 5 Main Questions */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
                    Perguntas Estruturadas (Roteiro do Entrevistador)
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {activeFactor.perguntas.map((perg, pIdx) => {
                      const ansKey = `q_${pIdx}`;
                      const ansVal = activeFactorData.respostas?.[ansKey] || "";

                      return (
                        <div key={pIdx} style={{ padding: "14px 16px", background: "var(--surface-2)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 8, display: "flex", gap: 8 }}>
                            <span style={{ color: "var(--accent)", fontWeight: 700 }}>{pIdx + 1}.</span>
                            <span>{perg}</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Anotações e percepções sobre a resposta..."
                            value={ansVal}
                            onChange={(e) => {
                              const nextResp = { ...(activeFactorData.respostas || {}), [ansKey]: e.target.value };
                              updateFator(activeFactor.id, { respostas: nextResp });
                            }}
                            style={{
                              width: "100%", height: 34, padding: "0 10px",
                              borderRadius: 6, border: "1px solid var(--border)",
                              fontSize: 12.5, background: "#fff"
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Deepening Questions (Aprofundamento) */}
                <div style={{ marginBottom: 24 }}>
                  <button
                    type="button"
                    onClick={() => setShowDeepening(!showDeepening)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontSize: 13, fontWeight: 600, color: "var(--accent)",
                      background: "none", border: "none", cursor: "pointer", padding: "4px 0"
                    }}
                  >
                    <Icon name={showDeepening ? "chevron-down" : "chevron-right"} size={14} />
                    {showDeepening ? "Ocultar" : "Ver"} Perguntas de Aprofundamento ({activeFactor.aprofundamento.length})
                  </button>

                  {showDeepening && (
                    <div style={{ marginTop: 10, padding: "14px 16px", background: "#fff", borderRadius: 8, border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 8 }}>
                        Utilize estas perguntas para aprofundar relatos específicos ou esclarecer divergências:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                        {activeFactor.aprofundamento.map((apr, aIdx) => (
                          <li key={aIdx}>{apr}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Evidences Checklist */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
                    Checklist de Evidências Observadas
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    {activeFactor.evidencias.map((ev, eIdx) => {
                      const checked = (activeFactorData.evidencias || []).includes(ev);
                      return (
                        <label
                          key={eIdx}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 12px", borderRadius: 6,
                            background: checked ? "var(--accent-soft)" : "var(--surface-2)",
                            border: checked ? "1px solid var(--accent-light)" : "1px solid var(--border)",
                            fontSize: 12.5, color: checked ? "var(--accent-cta)" : "var(--ink-soft)",
                            cursor: "pointer"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const curEvs = activeFactorData.evidencias || [];
                              const nextEvs = e.target.checked
                                ? [...curEvs, ev]
                                : curEvs.filter(item => item !== ev);
                              updateFator(activeFactor.id, { evidencias: nextEvs });
                            }}
                          />
                          <span>{ev}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Observations Textarea */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                    Observações do Terapeuta Corporativo
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Registre a síntese dos relatos, pontos de atenção, coerência com indicadores do setor e impactos observados..."
                    value={activeFactorData.observacoes || ""}
                    onChange={(e) => updateFator(activeFactor.id, { observacoes: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 12px",
                      borderRadius: "var(--r-md)", border: "1px solid var(--border)",
                      fontSize: 13, background: "#fff", lineHeight: 1.45
                    }}
                  />
                </div>

                {/* Technical Note */}
                <div style={{ padding: "14px 16px", background: "var(--surface-2)", borderRadius: 8, borderLeft: "3px solid var(--navy)", fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: 24 }}>
                  <strong style={{ color: "var(--ink)" }}>Nota Técnica CERTIFICA NR1:</strong> {activeFactor.notaTecnica}
                </div>

                {/* Navigation Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  {(() => {
                    const curIdx = ENTREVISTA_FATORES.findIndex(f => f.id === activeFactor.id);
                    const prevFator = curIdx > 0 ? ENTREVISTA_FATORES[curIdx - 1] : null;
                    const nextFator = curIdx < ENTREVISTA_FATORES.length - 1 ? ENTREVISTA_FATORES[curIdx + 1] : null;

                    return (
                      <>
                        <button
                          type="button"
                          disabled={!prevFator}
                          onClick={() => prevFator && setActiveTab(`fator-${prevFator.id}`)}
                          className="btn btn-soft"
                          style={{ height: 36, fontSize: 13, display: "flex", alignItems: "center", gap: 6, opacity: prevFator ? 1 : 0.4 }}
                        >
                          <Icon name="chevron-left" size={14} /> Anterior: {prevFator?.nome || "Início"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (nextFator) {
                              setActiveTab(`fator-${nextFator.id}`);
                            } else {
                              setActiveTab("resultado");
                            }
                          }}
                          className="btn btn-primary"
                          style={{ height: 36, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                        >
                          {nextFator ? `Próximo: ${nextFator.nome}` : "Finalizar & Ver Resultado"} <Icon name="chevron-right" size={14} />
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </Page>
  );
};

Object.assign(window, { EntrevistaDetalheScreen });
