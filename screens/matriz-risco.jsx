/* global React, Icon, Page, CLIENTES, MATRIZ_CLASSIFICACOES, MATRIZ_NIVEIS, SEVERIDADE_NIVEIS, SEVERIDADE_FRAMEWORKS, MATRIZES_VERSOES, calcularResultadoMatriz, COPSOQ_DIMS, ENTREVISTA_FATORES */
const { useState, useMemo } = React;

const PRESET_CRITERIOS = [
  {
    titulo: "Padrão NR-01 / GRO Geral",
    texto: "Matriz 5×5 padrão NR-01 / GRO. Cruzamento da Probabilidade de ocorrência (P1 a P5) apurada no diagnóstico com a Severidade do dano potencial (S1 a S5). Classificação em 5 faixas (Insignificante a Crítico) com priorização de medidas preventivas e corretivas."
  },
  {
    titulo: "Grau de Risco 3 / 4 (Indústria & Operações)",
    texto: "Critérios calibrados para empresas de Grau de Risco 3/4 conforme Quadro I da NR-04, considerando histórico de afastamentos previdenciários (F32/F43), turnos ininterruptos de revezamento e exigências ergonômicas da NR-17."
  },
  {
    titulo: "Saúde & Serviços Críticos",
    texto: "Matriz adaptada ao ambiente hospitalar/assistencial e serviços essenciais, enfatizando exigências emocionais, risco de assédio, violência no trabalho e fadiga decorrente de plantões."
  }
];

const MatrizRiscoScreen = ({ navigate, clienteId = "loghaus", params = {} }) => {
  const cId = params.clienteId || clienteId;
  const cliente = useMemo(() => CLIENTES.find(c => c.id === cId) || CLIENTES[0], [cId]);

  // Version management state
  const [versoes, setVersoes] = useState(() => {
    try {
      const saved = localStorage.getItem(`MENCTOR_MATRIZ_${cId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return MATRIZES_VERSOES[cId] || MATRIZES_VERSOES.loghaus;
  });

  const [activeVersao, setActiveVersao] = useState(versoes[0] || {
    versao: "v1.0",
    status: "publicada",
    framework: "copsoq",
    criteriosPgr: PRESET_CRITERIOS[0].texto
  });

  const [mode, setMode] = useState("view"); // "list", "view", "edit"
  const [selectedFramework, setSelectedFramework] = useState(activeVersao.framework || "mte");
  const [selectedCellFilter, setSelectedCellFilter] = useState(null); // e.g. "P3-S4"
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Criteria PGR state per version
  const [criteriosPgr, setCriteriosPgr] = useState(() => {
    return activeVersao.criteriosPgr || PRESET_CRITERIOS[0].texto;
  });

  // Editable severities state
  const [customSeveridades, setCustomSeveridades] = useState(() => {
    try {
      const saved = localStorage.getItem(`MENCTOR_SEV_${cId}_${activeVersao.versao}`);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    // Initialize from frameworks
    const init = {};
    Object.entries(SEVERIDADE_FRAMEWORKS).forEach(([fKey, fData]) => {
      init[fKey] = fData.fatores.map(fat => ({ ...fat }));
    });
    return init;
  });

  const currentFrameworkObj = SEVERIDADE_FRAMEWORKS[selectedFramework] || SEVERIDADE_FRAMEWORKS.mte;
  const currentFatores = customSeveridades[selectedFramework] || currentFrameworkObj.fatores || [];

  // Update specific factor severity or justification
  const updateFatorSeverity = (fKey, codigo, newSev, newJust) => {
    setCustomSeveridades(prev => {
      const currentList = prev[fKey] || SEVERIDADE_FRAMEWORKS[fKey].fatores;
      const updatedList = currentList.map(f => {
        if (f.codigo === codigo) {
          return {
            ...f,
            severidade: newSev !== undefined ? newSev : f.severidade,
            justificativa: newJust !== undefined ? newJust : f.justificativa,
          };
        }
        return f;
      });
      const next = { ...prev, [fKey]: updatedList };
      try {
        localStorage.setItem(`MENCTOR_SEV_${cId}_${activeVersao.versao}`, JSON.stringify(next));
      } catch (e) { /* ignore */ }
      return next;
    });
  };

  // Quick apply suggested justification
  const applySugestao = (fKey, codigo, sugestao) => {
    if (!sugestao) return;
    updateFatorSeverity(fKey, codigo, undefined, sugestao);
    showFeedback("Justificativa sugerida aplicada com sucesso!");
  };

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Save criteria & state
  const handleSaveCriteria = () => {
    const updatedVersao = { ...activeVersao, criteriosPgr, framework: selectedFramework };
    const nextList = versoes.map(v => v.versao === activeVersao.versao ? updatedVersao : v);
    setVersoes(nextList);
    setActiveVersao(updatedVersao);
    try {
      localStorage.setItem(`MENCTOR_MATRIZ_${cId}`, JSON.stringify(nextList));
    } catch (e) { /* ignore */ }
    setMode("view");
    showFeedback("Alterações salvas com sucesso!");
  };

  const handleNovaVersao = () => {
    const nextNum = versoes.length + 1;
    const nova = {
      versao: `v${nextNum}.0`,
      status: "rascunho",
      criadaEm: new Date().toLocaleDateString("pt-BR"),
      publicadaEm: null,
      campanhas: 0,
      framework: selectedFramework,
      criteriosPgr: PRESET_CRITERIOS[0].texto,
    };
    const nextList = [nova, ...versoes];
    setVersoes(nextList);
    setActiveVersao(nova);
    setCriteriosPgr(nova.criteriosPgr);
    try {
      localStorage.setItem(`MENCTOR_MATRIZ_${cId}`, JSON.stringify(nextList));
    } catch (e) { /* ignore */ }
    setMode("edit");
    showFeedback(`Nova versão ${nova.versao} criada como rascunho.`);
  };

  const handleDuplicar = (ver) => {
    const nextNum = versoes.length + 1;
    const duplicada = {
      ...ver,
      versao: `v${nextNum}.0`,
      status: "rascunho",
      criadaEm: new Date().toLocaleDateString("pt-BR"),
      publicadaEm: null,
      campanhas: 0,
    };
    const nextList = [duplicada, ...versoes];
    setVersoes(nextList);
    try {
      localStorage.setItem(`MENCTOR_MATRIZ_${cId}`, JSON.stringify(nextList));
    } catch (e) { /* ignore */ }
    showFeedback(`Versão ${ver.versao} duplicada para ${duplicada.versao}.`);
  };

  // Publish version validation
  const handlePublicar = (ver) => {
    const fatores = customSeveridades[ver.framework || selectedFramework] || SEVERIDADE_FRAMEWORKS[ver.framework || selectedFramework]?.fatores || [];
    const semJustificativa = fatores.filter(f => !f.justificativa || f.justificativa.trim() === "");

    if (semJustificativa.length > 0) {
      if (!window.confirm(`Atenção: Existem ${semJustificativa.length} fator(es) sem justificativa técnica preenchida. De acordo com a NR-01, a justificativa técnica é indispensável no PGR. Deseja publicar mesmo assim?`)) {
        return;
      }
    }

    const publicada = {
      ...ver,
      status: "publicada",
      publicadaEm: new Date().toLocaleDateString("pt-BR"),
      criteriosPgr: criteriosPgr,
      framework: selectedFramework,
    };

    const nextList = versoes.map(v => v.versao === ver.versao ? publicada : v);
    setVersoes(nextList);
    setActiveVersao(publicada);
    try {
      localStorage.setItem(`MENCTOR_MATRIZ_${cId}`, JSON.stringify(nextList));
    } catch (e) { /* ignore */ }
    showFeedback(`Versão ${ver.versao} publicada com sucesso para conformidade NR-01!`);
  };

  // Calculation of risk matrix mapping (Deterministic simulation from factor index or actual values)
  const matrizDistribuicao = useMemo(() => {
    const grid = {};
    for (let p = 1; p <= 5; p++) {
      for (let s = 1; s <= 5; s++) {
        grid[`P${p}-S${s}`] = [];
      }
    }

    currentFatores.forEach((fat, idx) => {
      // Deterministic spread representing risk probability in the client
      const pVal = ((idx * 2 + 1) % 5) + 1;
      const sVal = Math.max(1, Math.min(5, fat.severidade || 3));
      const key = `P${pVal}-S${sVal}`;
      if (grid[key]) {
        grid[key].push({ ...fat, probabilidade: pVal });
      }
    });

    return grid;
  }, [currentFatores]);

  // Statistics for completeness
  const totalFatores = currentFatores.length;
  const fatoresComJustificativa = currentFatores.filter(f => f.justificativa && f.justificativa.trim().length > 0).length;
  const pctCompletude = totalFatores > 0 ? Math.round((fatoresComJustificativa / totalFatores) * 100) : 0;

  // Filtered factors if user clicked a cell in 5x5 matrix
  const displayFatores = useMemo(() => {
    if (!selectedCellFilter) return currentFatores;
    const itemsInFilter = matrizDistribuicao[selectedCellFilter] || [];
    const codigosInFilter = itemsInFilter.map(i => i.codigo);
    return currentFatores.filter(f => codigosInFilter.includes(f.codigo));
  }, [currentFatores, selectedCellFilter, matrizDistribuicao]);

  return (
    <Page>
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: "#0E2748", color: "#fff", padding: "12px 20px",
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: 10, fontSize: 13,
          border: "1px solid rgba(255,255,255,0.15)", animation: "fadeIn .3s ease"
        }}>
          <Icon name="check-circle" size={16} color="#4ade80" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => navigate("cliente-detalhe", { clienteId: cliente.id })}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
        >
          <Icon name="chevron-left" size={15} /> Voltar para {cliente.name}
        </button>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {mode === "list" ? (
            <button onClick={handleNovaVersao} className="btn btn-primary" style={{ height: 38, fontSize: 13 }}>
              <Icon name="plus" size={15} /> Nova Versão
            </button>
          ) : (
            <>
              <button
                onClick={() => setMode("list")}
                className="btn btn-soft"
                style={{ height: 36, fontSize: 13 }}
              >
                <Icon name="layers" size={14} /> Todas as Versões ({versoes.length})
              </button>

              {activeVersao.status === "rascunho" && (
                <button
                  onClick={() => handlePublicar(activeVersao)}
                  className="btn btn-soft"
                  style={{ height: 36, fontSize: 13, background: "rgba(34,197,94,0.12)", color: "var(--health-deep)", border: "1px solid var(--health-soft)" }}
                  title="Publicar esta versão para aplicação nos relatórios e diagnósticos"
                >
                  <Icon name="check-circle" size={14} color="var(--health-deep)" /> Publicar Versão
                </button>
              )}

              {mode === "view" ? (
                <button onClick={() => setMode("edit")} className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
                  <Icon name="edit" size={14} /> Editar Matriz & Severidades
                </button>
              ) : (
                <button onClick={handleSaveCriteria} className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
                  <Icon name="check" size={14} /> Salvar & Concluir
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div style={{
        padding: "24px 28px",
        background: "linear-gradient(135deg, #00204D 0%, #0E2748 60%, #173B66 100%)",
        borderRadius: "var(--r-xl)",
        color: "#fff",
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 10px 28px rgba(0,32,77,0.18)"
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-light)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="shield" size={14} color="var(--accent-light)" />
            PGR · Gerenciamento de Riscos Ocupacionais (NR-01)
          </div>
          <h1 className="display" style={{ fontSize: 28, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
            Matriz de Risco (PGR) — {cliente.name}
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "rgba(255,255,255,0.8)", maxWidth: 680, lineHeight: 1.45 }}>
            Configure a severidade técnica por fator psicossocial e visualize a distribuição 5×5 (Probabilidade × Severidade) para conformidade com a NR-01.
          </p>
        </div>

        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span style={{
            fontSize: 12.5, fontWeight: 700, padding: "5px 14px", borderRadius: 999,
            background: activeVersao.status === "publicada" ? "rgba(34,197,94,0.25)" : "rgba(240,168,0,0.25)",
            color: activeVersao.status === "publicada" ? "#4ade80" : "#facc15",
            border: `1px solid ${activeVersao.status === "publicada" ? "#4ade80" : "#facc15"}`
          }}>
            {activeVersao.versao} · {activeVersao.status === "publicada" ? "Publicada" : "Rascunho"}
          </span>
          <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)" }}>
            {activeVersao.publicadaEm ? `Publicada em ${activeVersao.publicadaEm}` : `Criada em ${activeVersao.criadaEm}`}
          </span>
        </div>
      </div>

      {/* Mode: Version List */}
      {mode === "list" && (
        <div className="card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Versões da Matriz de Risco (PGR)</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-muted)" }}>
                Histórico de calibrações normativas da matriz e severidades por fator para {cliente.name}.
              </p>
            </div>
            <button onClick={handleNovaVersao} className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
              <Icon name="plus" size={14} /> Nova Versão
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
                <th style={{ padding: "12px 10px" }}>Versão</th>
                <th style={{ padding: "12px 10px" }}>Status</th>
                <th style={{ padding: "12px 10px" }}>Framework Base</th>
                <th style={{ padding: "12px 10px" }}>Criada em</th>
                <th style={{ padding: "12px 10px" }}>Publicada em</th>
                <th style={{ padding: "12px 10px" }}>Campanhas</th>
                <th style={{ padding: "12px 10px", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {versoes.map(v => (
                <tr key={v.versao} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 10px", fontWeight: 700, color: "var(--ink)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon name="shield" size={15} color="var(--navy)" />
                      <span>{v.versao}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 10px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                      background: v.status === "publicada" ? "var(--health-soft)" : "var(--amber-soft)",
                      color: v.status === "publicada" ? "var(--health-deep)" : "var(--warning)"
                    }}>
                      {v.status === "publicada" ? "Publicada" : "Rascunho"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 10px", color: "var(--ink)", fontWeight: 500 }}>
                    {SEVERIDADE_FRAMEWORKS[v.framework || "copsoq"]?.label.split("—")[0] || "Padrão"}
                  </td>
                  <td style={{ padding: "14px 10px", color: "var(--ink-muted)" }}>{v.criadaEm}</td>
                  <td style={{ padding: "14px 10px", color: "var(--ink-muted)" }}>{v.publicadaEm || "—"}</td>
                  <td style={{ padding: "14px 10px", color: "var(--ink-muted)" }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{v.campanhas}</span> campanha(s)
                  </td>
                  <td style={{ padding: "14px 10px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <button
                        onClick={() => { setActiveVersao(v); setCriteriosPgr(v.criteriosPgr || PRESET_CRITERIOS[0].texto); setSelectedFramework(v.framework || "mte"); setMode("view"); }}
                        className="btn btn-soft"
                        style={{ height: 30, fontSize: 12, padding: "0 10px" }}
                      >
                        <Icon name="eye" size={13} /> Visualizar
                      </button>
                      <button
                        onClick={() => { setActiveVersao(v); setCriteriosPgr(v.criteriosPgr || PRESET_CRITERIOS[0].texto); setSelectedFramework(v.framework || "mte"); setMode("edit"); }}
                        className="btn btn-soft"
                        style={{ height: 30, fontSize: 12, padding: "0 10px" }}
                      >
                        <Icon name="edit" size={13} /> Editar
                      </button>
                      <button
                        onClick={() => handleDuplicar(v)}
                        className="btn btn-soft"
                        style={{ height: 30, fontSize: 12, padding: "0 10px" }}
                      >
                        <Icon name="copy" size={13} /> Duplicar
                      </button>
                      {v.status === "rascunho" && (
                        <button
                          onClick={() => handlePublicar(v)}
                          className="btn btn-soft"
                          style={{ height: 30, fontSize: 12, padding: "0 10px", background: "rgba(34,197,94,0.1)", color: "var(--health-deep)" }}
                          title="Publicar versão"
                        >
                          <Icon name="check" size={13} /> Publicar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mode: View or Edit */}
      {mode !== "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top 2-Column: PGR Criteria / Additional Info & 5x5 Matrix Preview */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
            
            {/* Left: Info / Criteria PGR */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="file-text" size={16} color="var(--navy)" />
                  Critérios PGR & Informações da Empresa
                </h3>
                {mode === "edit" && (
                  <span style={{ fontSize: 11, color: "var(--accent-cta)", fontWeight: 600 }}>Modo de Edição Ativo</span>
                )}
              </div>

              {/* Company Meta */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12.5, background: "var(--canvas-warm)", padding: "12px 14px", borderRadius: 8, marginBottom: 16 }}>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11 }}>Empresa Avaliada</span>
                  <strong style={{ color: "var(--ink)" }}>{cliente.name}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11 }}>CNPJ</span>
                  <strong style={{ color: "var(--ink)" }}>{cliente.cnpj || "00.000.000/0001-00"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11 }}>Setor & Grau de Risco</span>
                  <strong style={{ color: "var(--ink)" }}>{cliente.sector} · Grau 3</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11 }}>Responsável Técnico</span>
                  <strong style={{ color: "var(--ink)" }}>{cliente.contact}</strong>
                </div>
              </div>

              {/* Criteria Text Box */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>
                    Regras e Critérios PGR ({activeVersao.versao})
                  </label>
                  {mode === "edit" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {PRESET_CRITERIOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCriteriosPgr(p.texto)}
                          style={{
                            fontSize: 10.5, padding: "2px 8px", borderRadius: 4,
                            background: "var(--surface-2)", border: "1px solid var(--border)",
                            color: "var(--ink-soft)", cursor: "pointer"
                          }}
                          title={p.texto}
                        >
                          {p.titulo.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {mode === "edit" ? (
                  <div>
                    <textarea
                      value={criteriosPgr}
                      onChange={(e) => setCriteriosPgr(e.target.value)}
                      rows={4}
                      placeholder="Descreva aqui as regras textuais e critérios normativos aplicados a esta versão da matriz..."
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        border: "1px solid var(--border)", fontSize: 12.5,
                        lineHeight: 1.5, color: "var(--ink)", fontFamily: "inherit",
                        resize: "vertical"
                      }}
                    />
                    <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>
                      Regras descritivas que serão impressas no Relatório PGR / NR-01 para justificar os parâmetros de corte.
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.55,
                    background: "var(--surface-2)", padding: "12px 14px", borderRadius: 8,
                    border: "1px solid var(--border-subtle)"
                  }}>
                    {criteriosPgr || "Nenhuma regra específica cadastrada para esta versão."}
                  </div>
                )}
              </div>
            </div>

            {/* Right: 5x5 Matrix Preview */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="activity" size={16} color="var(--navy)" />
                    Preview da Matriz 5×5 (PGR)
                  </h3>
                  <span style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>Probabilidade ($P$) × Severidade ($S$)</span>
                </div>
                {selectedCellFilter && (
                  <button
                    onClick={() => setSelectedCellFilter(null)}
                    style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "var(--canvas-warm)", border: "1px solid var(--border)", color: "var(--ink)", cursor: "pointer" }}
                  >
                    Limpar filtro ({selectedCellFilter}) ✕
                  </button>
                )}
              </div>

              {/* Matrix 5x5 Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 4, fontSize: 11, textAlign: "center" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: 4, color: "var(--ink-muted)", width: 34, fontSize: 11 }}>P \ S</th>
                      <th style={{ padding: 4, color: "var(--ink-muted)", fontSize: 11 }}>S1<br/><span style={{ fontSize: 9, fontWeight: 400 }}>Insignif.</span></th>
                      <th style={{ padding: 4, color: "var(--ink-muted)", fontSize: 11 }}>S2<br/><span style={{ fontSize: 9, fontWeight: 400 }}>Leve</span></th>
                      <th style={{ padding: 4, color: "var(--ink-muted)", fontSize: 11 }}>S3<br/><span style={{ fontSize: 9, fontWeight: 400 }}>Moder.</span></th>
                      <th style={{ padding: 4, color: "var(--ink-muted)", fontSize: 11 }}>S4<br/><span style={{ fontSize: 9, fontWeight: 400 }}>Grave</span></th>
                      <th style={{ padding: 4, color: "var(--ink-muted)", fontSize: 11 }}>S5<br/><span style={{ fontSize: 9, fontWeight: 400 }}>Catastr.</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(p => (
                      <tr key={p}>
                        <td style={{ fontWeight: 700, color: "var(--ink)", fontSize: 11 }}>P{p}</td>
                        {[1, 2, 3, 4, 5].map(s => {
                          const cellKey = `P${p}-S${s}`;
                          const classif = MATRIZ_CLASSIFICACOES[cellKey];
                          const nivel = MATRIZ_NIVEIS[classif];
                          const itemsInCell = matrizDistribuicao[cellKey] || [];
                          const isSelected = selectedCellFilter === cellKey;

                          return (
                            <td
                              key={s}
                              onClick={() => setSelectedCellFilter(isSelected ? null : cellKey)}
                              style={{
                                background: nivel?.cor || "#eee",
                                color: "#0E2748",
                                padding: "8px 2px",
                                borderRadius: 5,
                                fontWeight: 700,
                                fontSize: 9.5,
                                textTransform: "uppercase",
                                position: "relative",
                                height: 38,
                                cursor: "pointer",
                                outline: isSelected ? "2px solid #00204D" : "none",
                                transform: isSelected ? "scale(1.04)" : "none",
                                transition: "all .15s ease",
                                opacity: selectedCellFilter && !isSelected ? 0.45 : 1
                              }}
                              title={`P${p} × S${s}: ${nivel?.label} (Prioridade: ${nivel?.prioridade}) — Clique para filtrar`}
                            >
                              <div>{nivel?.label}</div>
                              {itemsInCell.length > 0 && (
                                <div style={{
                                  position: "absolute", top: -4, right: -4,
                                  width: 17, height: 17, borderRadius: 999,
                                  background: "#00204D", color: "#fff",
                                  fontSize: 9.5, fontWeight: 700,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  border: "1.5px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                }}>
                                  {itemsInCell.length}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend & Priorities */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14, justifyContent: "center" }}>
                {Object.entries(MATRIZ_NIVEIS).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--ink-soft)" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: v.cor }} />
                    <span style={{ fontWeight: 600 }}>{v.label}:</span>
                    <span style={{ color: "var(--ink-muted)" }}>{v.prioridade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Severity by Factor Section with Tabs */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                    Severidade por Fator ({currentFrameworkObj.label.split("—")[0]})
                  </h3>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    background: pctCompletude === 100 ? "var(--health-soft)" : "var(--amber-soft)",
                    color: pctCompletude === 100 ? "var(--health-deep)" : "var(--warning)"
                  }}>
                    {pctCompletude}% com justificativa ({fatoresComJustificativa}/{totalFatores})
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-muted)", maxWidth: 650 }}>
                  Defina o grau de severidade potencial (1 a 5) para cada fator caso se materialize. A justificativa técnica é indispensável para atendimento da NR-01.
                </p>
              </div>

              {/* Framework Selector Tabs */}
              <div style={{ display: "flex", background: "var(--surface-2)", padding: 4, borderRadius: "var(--r-md)", gap: 4 }}>
                {Object.entries(SEVERIDADE_FRAMEWORKS).map(([fKey, fObj]) => {
                  const isSel = selectedFramework === fKey;
                  return (
                    <button
                      key={fKey}
                      onClick={() => { setSelectedFramework(fKey); setSelectedCellFilter(null); }}
                      style={{
                        padding: "6px 14px", borderRadius: 6,
                        background: isSel ? "#fff" : "transparent",
                        color: isSel ? "var(--ink)" : "var(--ink-muted)",
                        fontWeight: isSel ? 700 : 500, fontSize: 12,
                        border: isSel ? "1px solid var(--border)" : "none",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        boxShadow: isSel ? "var(--shadow-card)" : "none"
                      }}
                    >
                      <span>{fObj.label.split("—")[0]}</span>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 999, background: "var(--surface-muted)", color: "var(--ink-soft)", fontWeight: 700 }}>
                        {fObj.fatores.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Completeness Bar */}
            <div style={{ marginBottom: 18, background: "var(--canvas-warm)", padding: "10px 14px", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                <span style={{ fontWeight: 700 }}>Fatores exibidos:</span> {displayFatores.length} de {totalFatores}
                {selectedCellFilter && ` (filtrado por célula ${selectedCellFilter})`}
              </div>
              <div style={{ flex: 1, maxWidth: 260, height: 6, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pctCompletude}%`, background: pctCompletude === 100 ? "var(--health)" : "var(--amber)", transition: "width .3s ease" }} />
              </div>
            </div>

            {/* Factors Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
                    <th style={{ padding: "12px 10px", width: 140 }}>Código</th>
                    <th style={{ padding: "12px 10px" }}>Fator de Risco NR-01</th>
                    <th style={{ padding: "12px 10px", width: 170, textAlign: "center" }}>Severidade (S)</th>
                    <th style={{ padding: "12px 10px" }}>Justificativa Técnica (NR-01)</th>
                    <th style={{ padding: "12px 10px", width: 130, textAlign: "center" }}>Nível de Risco</th>
                  </tr>
                </thead>
                <tbody>
                  {displayFatores.map(fator => {
                    const sevObj = SEVERIDADE_NIVEIS[fator.severidade] || SEVERIDADE_NIVEIS[3];
                    const pVal = 3; // Standard baseline probability for preview
                    const riskKey = calcularResultadoMatriz(pVal, fator.severidade);
                    const riskResult = MATRIZ_NIVEIS[riskKey];

                    return (
                      <tr key={fator.codigo} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "14px 10px", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>
                          {fator.codigo}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          <div style={{ fontWeight: 600, color: "var(--ink)" }}>{fator.nome}</div>
                        </td>
                        <td style={{ padding: "14px 10px", textAlign: "center" }}>
                          {mode === "edit" ? (
                            <select
                              value={fator.severidade}
                              onChange={(e) => updateFatorSeverity(selectedFramework, fator.codigo, parseInt(e.target.value, 10), undefined)}
                              style={{
                                height: 34, padding: "0 8px", borderRadius: 6,
                                border: `2px solid ${sevObj.cor}`, fontWeight: 700, fontSize: 12,
                                color: "#0E2748", background: "#fff", cursor: "pointer", width: "100%"
                              }}
                            >
                              {[1, 2, 3, 4, 5].map(n => {
                                const level = SEVERIDADE_NIVEIS[n];
                                return (
                                  <option key={n} value={n}>
                                    {level.label}
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              padding: "4px 10px", borderRadius: 6,
                              background: `${sevObj.cor}22`, color: "#0E2748", fontWeight: 700, fontSize: 11.5,
                              border: `1px solid ${sevObj.cor}`
                            }}>
                              <span style={{ width: 8, height: 8, borderRadius: 999, background: sevObj.cor }} />
                              {sevObj.label}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          {mode === "edit" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <input
                                type="text"
                                placeholder="Ex.: Risco jurídico, dano psíquico grave..."
                                value={fator.justificativa || ""}
                                onChange={(e) => updateFatorSeverity(selectedFramework, fator.codigo, undefined, e.target.value)}
                                style={{
                                  width: "100%", height: 32, padding: "0 10px", borderRadius: 6,
                                  border: "1px solid var(--border)", fontSize: 12.5, color: "var(--ink)"
                                }}
                              />
                              {fator.sugestao && (!fator.justificativa || fator.justificativa !== fator.sugestao) && (
                                <button
                                  type="button"
                                  onClick={() => applySugestao(selectedFramework, fator.codigo, fator.sugestao)}
                                  style={{
                                    alignSelf: "flex-start", background: "none", border: "none",
                                    color: "var(--accent-cta)", fontSize: 11, cursor: "pointer",
                                    padding: 0, textDecoration: "underline"
                                  }}
                                >
                                  + Usar sugestão: "{fator.sugestao}"
                                </button>
                              )}
                            </div>
                          ) : (
                            <span style={{
                              color: fator.justificativa ? "var(--ink)" : "var(--ink-faint)",
                              fontStyle: fator.justificativa ? "normal" : "italic",
                              fontSize: 12.5
                            }}>
                              {fator.justificativa || "Pendente de justificativa técnica..."}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 10px", textAlign: "center" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                            background: riskResult?.cor || "#ccc", color: "#0E2748",
                            display: "inline-block"
                          }}>
                            {riskResult?.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions Toolbar */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                Versão ativa: <strong>{activeVersao.versao}</strong> ({activeVersao.status === "publicada" ? "Publicada em " + activeVersao.publicadaEm : "Rascunho"})
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                {mode === "edit" ? (
                  <>
                    <button onClick={() => setMode("view")} className="btn btn-soft" style={{ height: 36, fontSize: 13 }}>
                      Cancelar Edição
                    </button>
                    <button onClick={handleSaveCriteria} className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
                      <Icon name="check" size={14} /> Salvar Alterações
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setMode("edit")} className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
                      <Icon name="edit" size={14} /> Editar Severidades & Critérios
                    </button>
                    <button
                      onClick={() => navigate("plano-acao", { clienteId: cliente.id })}
                      className="btn btn-soft"
                      style={{ height: 36, fontSize: 13 }}
                    >
                      <Icon name="clipboard" size={14} /> Ir para Plano de Ação (5W2H)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

Object.assign(window, { MatrizRiscoScreen });
