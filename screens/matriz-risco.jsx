/* global React, Icon, Page, CLIENTES, MATRIZ_CLASSIFICACOES, MATRIZ_NIVEIS, SEVERIDADE_FRAMEWORKS, MATRIZES_VERSOES, calcularResultadoMatriz, COPSOQ_DIMS, ENTREVISTA_FATORES */
const { useState, useMemo } = React;

const MatrizRiscoScreen = ({ navigate, clienteId = "loghaus", params = {} }) => {
  const cId = params.clienteId || clienteId;
  const cliente = useMemo(() => CLIENTES.find(c => c.id === cId) || CLIENTES[0], [cId]);

  // Version management
  const [versoes, setVersoes] = useState(() => {
    try {
      const saved = localStorage.getItem(`MENCTOR_MATRIZ_${cId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return MATRIZES_VERSOES[cId] || MATRIZES_VERSOES.loghaus;
  });

  const [activeVersao, setActiveVersao] = useState(versoes[0] || { versao: "v1.0", status: "publicada", framework: "copsoq" });
  const [mode, setMode] = useState("view"); // "list", "view", "edit"
  const [selectedFramework, setSelectedFramework] = useState(activeVersao.framework || "copsoq");

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

  // Save severities
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

  const handleNovaVersao = () => {
    const nextNum = versoes.length + 1;
    const nova = {
      versao: `v${nextNum}.0`,
      status: "rascunho",
      criadaEm: new Date().toLocaleDateString("pt-BR"),
      publicadaEm: null,
      campanhas: 0,
      framework: selectedFramework,
    };
    const nextList = [nova, ...versoes];
    setVersoes(nextList);
    setActiveVersao(nova);
    try {
      localStorage.setItem(`MENCTOR_MATRIZ_${cId}`, JSON.stringify(nextList));
    } catch (e) { /* ignore */ }
    setMode("edit");
  };

  const handleDuplicar = (ver) => {
    const nextNum = versoes.length + 1;
    const duplicada = {
      ...ver,
      versao: `v${nextNum}.0`,
      status: "rascunho",
      criadaEm: new Date().toLocaleDateString("pt-BR"),
      publicadaEm: null,
    };
    const nextList = [duplicada, ...versoes];
    setVersoes(nextList);
    try {
      localStorage.setItem(`MENCTOR_MATRIZ_${cId}`, JSON.stringify(nextList));
    } catch (e) { /* ignore */ }
  };

  const currentFatores = customSeveridades[selectedFramework] || SEVERIDADE_FRAMEWORKS[selectedFramework]?.fatores || [];

  // Mock calculation of risk matrix mapping
  // Probability = Mock between 1 and 5 (or from COPSOQ dims)
  const matrizDistribuicao = useMemo(() => {
    const grid = {};
    for (let p = 1; p <= 5; p++) {
      for (let s = 1; s <= 5; s++) {
        grid[`P${p}-S${s}`] = [];
      }
    }

    currentFatores.forEach((fat, idx) => {
      // Deterministic mock probability for visual distribution
      const pVal = ((idx * 2 + 1) % 5) + 1;
      const sVal = fat.severidade || 3;
      const key = `P${pVal}-S${sVal}`;
      if (grid[key]) {
        grid[key].push({ ...fat, probabilidade: pVal });
      }
    });

    return grid;
  }, [currentFatores]);

  return (
    <Page>
      {/* Top navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => navigate("cliente-detalhe", { clienteId: cliente.id })}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer" }}
        >
          <Icon name="chevron-left" size={15} /> Voltar para {cliente.name}
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          {mode === "list" ? (
            <button onClick={handleNovaVersao} className="btn btn-primary" style={{ height: 38, fontSize: 13 }}>
              <Icon name="plus" size={15} /> Nova Versão
            </button>
          ) : (
            <>
              <button onClick={() => setMode("list")} className="btn btn-soft" style={{ height: 36, fontSize: 13 }}>
                Ver Todas as Versões
              </button>
              {mode === "view" ? (
                <button onClick={() => setMode("edit")} className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
                  <Icon name="edit" size={14} /> Editar Matriz & Severidade
                </button>
              ) : (
                <button onClick={() => setMode("view")} className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
                  <Icon name="check" size={14} /> Salvar & Concluir
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, #00204D, #0E2748)", borderRadius: "var(--r-xl)", color: "#fff", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-light)", marginBottom: 4 }}>
            PGR · Gerenciamento de Riscos Ocupacionais (NR-01)
          </div>
          <h1 className="display" style={{ fontSize: 26, margin: 0, color: "#fff" }}>
            Matriz de Risco (PGR) — {cliente.name}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Configure a severidade por fator e visualize o cruzamento Probabilidade × Severidade na matriz 5×5.
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
            background: activeVersao.status === "publicada" ? "rgba(34,197,94,0.2)" : "rgba(240,168,0,0.2)",
            color: activeVersao.status === "publicada" ? "#4ade80" : "#facc15",
            border: `1px solid ${activeVersao.status === "publicada" ? "#4ade80" : "#facc15"}`
          }}>
            {activeVersao.versao} · {activeVersao.status === "publicada" ? "Publicada" : "Rascunho"}
          </span>
        </div>
      </div>

      {/* Mode: Version List */}
      {mode === "list" && (
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Versões da Matriz de Risco</h2>
            <button onClick={handleNovaVersao} className="btn btn-primary" style={{ height: 34, fontSize: 12.5 }}>
              <Icon name="plus" size={14} /> Nova Versão
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
                <th style={{ padding: "10px" }}>Versão</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Criada em</th>
                <th style={{ padding: "10px" }}>Publicada em</th>
                <th style={{ padding: "10px" }}>Campanhas</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {versoes.map(v => (
                <tr key={v.versao} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 10px", fontWeight: 700, color: "var(--ink)" }}>{v.versao}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
                      background: v.status === "publicada" ? "var(--health-soft)" : "var(--amber-soft)",
                      color: v.status === "publicada" ? "var(--health-deep)" : "var(--warning)"
                    }}>
                      {v.status === "publicada" ? "Publicada" : "Rascunho"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 10px", color: "var(--ink-muted)" }}>{v.criadaEm}</td>
                  <td style={{ padding: "12px 10px", color: "var(--ink-muted)" }}>{v.publicadaEm || "—"}</td>
                  <td style={{ padding: "12px 10px", color: "var(--ink-muted)" }}>{v.campanhas}</td>
                  <td style={{ padding: "12px 10px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <button
                        onClick={() => { setActiveVersao(v); setMode("view"); }}
                        className="btn btn-soft"
                        style={{ height: 30, fontSize: 12, padding: "0 10px" }}
                      >
                        <Icon name="eye" size={13} /> Visualizar
                      </button>
                      <button
                        onClick={() => { setActiveVersao(v); setMode("edit"); }}
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
                        Duplicar
                      </button>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Left: Info / Criteria */}
            <div className="card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                  Informações da Empresa & Critérios PGR
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12.5 }}>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block" }}>Empresa Avaliada:</span>
                  <strong style={{ color: "var(--ink)" }}>{cliente.name}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block" }}>CNPJ:</span>
                  <strong style={{ color: "var(--ink)" }}>{cliente.cnpj}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block" }}>Setor / CNAE:</span>
                  <strong style={{ color: "var(--ink)" }}>{cliente.sector} · Grau 3</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block" }}>Responsável Técnico:</span>
                  <strong style={{ color: "var(--ink)" }}>{cliente.contact}</strong>
                </div>
              </div>

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  Regra de Matriz de Risco Aplicada
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5, background: "var(--surface-2)", padding: "10px 12px", borderRadius: 8 }}>
                  Matriz 5×5 padrão NR-01. Cruzamento de Probabilidade (P1 a P5) com Severidade (S1 a S5). Classificação em 5 faixas: Insignificante, Baixo, Moderado, Alto e Crítico.
                </div>
              </div>
            </div>

            {/* Right: 5x5 Matrix Preview */}
            <div className="card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                  Preview da Matriz 5×5
                </h3>
                <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>Probabilidade × Severidade</span>
              </div>

              {/* Matrix 5x5 Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3, fontSize: 11, textAlign: "center" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: 4, color: "var(--ink-muted)", width: 34 }}>P \ S</th>
                      <th style={{ padding: 4, color: "var(--ink-muted)" }}>S1</th>
                      <th style={{ padding: 4, color: "var(--ink-muted)" }}>S2</th>
                      <th style={{ padding: 4, color: "var(--ink-muted)" }}>S3</th>
                      <th style={{ padding: 4, color: "var(--ink-muted)" }}>S4</th>
                      <th style={{ padding: 4, color: "var(--ink-muted)" }}>S5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(p => (
                      <tr key={p}>
                        <td style={{ fontWeight: 700, color: "var(--ink)" }}>P{p}</td>
                        {[1, 2, 3, 4, 5].map(s => {
                          const classif = MATRIZ_CLASSIFICACOES[`P${p}-S${s}`];
                          const nivel = MATRIZ_NIVEIS[classif];
                          const itemsInCell = matrizDistribuicao[`P${p}-S${s}`] || [];

                          return (
                            <td
                              key={s}
                              style={{
                                background: nivel?.cor || "#eee",
                                color: "#0E2748",
                                padding: "8px 4px",
                                borderRadius: 4,
                                fontWeight: 700,
                                fontSize: 10,
                                textTransform: "uppercase",
                                position: "relative",
                                height: 38
                              }}
                              title={`P${p} x S${s}: ${nivel?.label}`}
                            >
                              <div>{nivel?.label}</div>
                              {itemsInCell.length > 0 && (
                                <div style={{
                                  position: "absolute", top: -4, right: -4,
                                  width: 16, height: 16, borderRadius: 999,
                                  background: "var(--navy)", color: "#fff",
                                  fontSize: 9, fontWeight: 700,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  border: "1px solid #fff"
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

              {/* Legend */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14, justifyContent: "center" }}>
                {Object.entries(MATRIZ_NIVEIS).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--ink-muted)" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: v.cor }} />
                    <span>{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Severity by Factor Section with Tabs */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                  Severidade por Fator
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--ink-muted)" }}>
                  Defina o valor de severidade potencial (1 a 5) caso o risco se materialize na empresa.
                </p>
              </div>

              {/* Framework Selector Tabs */}
              <div style={{ display: "flex", background: "var(--surface-2)", padding: 4, borderRadius: "var(--r-md)", gap: 4 }}>
                {Object.entries(SEVERIDADE_FRAMEWORKS).map(([fKey, fObj]) => {
                  const isSel = selectedFramework === fKey;
                  return (
                    <button
                      key={fKey}
                      onClick={() => setSelectedFramework(fKey)}
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
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 999, background: "var(--surface-muted)", color: "var(--ink-soft)" }}>
                        {fObj.fatores.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Factors Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
                    <th style={{ padding: "10px", width: 140 }}>Código</th>
                    <th style={{ padding: "10px" }}>Fator de Risco</th>
                    <th style={{ padding: "10px", width: 90, textAlign: "center" }}>Severidade (S)</th>
                    <th style={{ padding: "10px" }}>Justificativa Técnica</th>
                    {mode === "view" && <th style={{ padding: "10px", width: 120 }}>Classificação P×S</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentFatores.map(fator => {
                    const sevColor = fator.severidade >= 5 ? "#E5484D" : fator.severidade === 4 ? "#F66B0A" : fator.severidade === 3 ? "#F0A800" : "#22c55e";
                    const pVal = 3; // default medium probability for preview
                    const riskResult = MATRIZ_NIVEIS[calcularResultadoMatriz(pVal, fator.severidade)];

                    return (
                      <tr key={fator.codigo} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 10px", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-faint)" }}>
                          {fator.codigo}
                        </td>
                        <td style={{ padding: "12px 10px", fontWeight: 600, color: "var(--ink)" }}>
                          {fator.nome}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>
                          {mode === "edit" ? (
                            <select
                              value={fator.severidade}
                              onChange={(e) => updateFatorSeverity(selectedFramework, fator.codigo, parseInt(e.target.value, 10), undefined)}
                              style={{
                                height: 32, padding: "0 8px", borderRadius: 6,
                                border: `2px solid ${sevColor}`, fontWeight: 700, fontSize: 13,
                                color: sevColor, background: "#fff"
                              }}
                            >
                              {[1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          ) : (
                            <span style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 28, height: 28, borderRadius: 6,
                              background: `${sevColor}15`, color: sevColor, fontWeight: 700
                            }}>
                              {fator.severidade}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          {mode === "edit" ? (
                            <input
                              type="text"
                              placeholder="Ex.: Risco jurídico, dano psíquico grave..."
                              value={fator.justificativa || ""}
                              onChange={(e) => updateFatorSeverity(selectedFramework, fator.codigo, undefined, e.target.value)}
                              style={{ width: "100%", height: 32, padding: "0 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12.5 }}
                            />
                          ) : (
                            <span style={{ color: fator.justificativa ? "var(--ink-soft)" : "var(--ink-faint)", fontStyle: fator.justificativa ? "normal" : "italic" }}>
                              {fator.justificativa || "—"}
                            </span>
                          )}
                        </td>
                        {mode === "view" && (
                          <td style={{ padding: "12px 10px" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                              background: riskResult?.cor || "#ccc", color: "#0E2748"
                            }}>
                              {riskResult?.label}
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

Object.assign(window, { MatrizRiscoScreen });
