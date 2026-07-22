/* global React, Icon, Page, RiskMedallion, riskLabel, riskPill, COPSOQ_DIMS, DIAG_DIMS_MAP, DIAGNOSTICOS, CLIENTES, AVALIACOES_ATIVAS */
// ROADMAP_ESTADO and ROADMAP_FASES accessed via window (loaded from data.jsx)

// ════════════════════════════════════════════════════════════
// DIAGNOSTICO DETALHE — replaces the pie-chart heavy dashboard
// Calm, readable, prioritized by risk
// ════════════════════════════════════════════════════════════
const SETOR_DIMS = {
  "Operações":      ["Carga de trabalho", "Ritmo de trabalho", "Burnout", "Estresse"],
  "Administrativo": ["Reconhecimento", "Suporte social", "Qualidade da liderança", "Justiça e respeito"],
  "Comercial":      ["Influência no trabalho", "Comunidade social", "Significado do trabalho", "Conflito trabalho-família"],
};

const ALL_ACTIONS = [
  { index: 1, title: "Revisão de carga horária — Operações",    tag: "Carga de trabalho",          owner: "RH + Operações · até 15/jun" },
  { index: 2, title: "Programa anti-burnout para liderança",     tag: "Burnout",                    owner: "Gestão de Pessoas · até 30/jun" },
  { index: 3, title: "Workshop de gestão de estresse",            tag: "Estresse",                   owner: "Coordenadores · até 10/jun" },
  { index: 4, title: "Rodada de escuta ativa com lideranças",    tag: "Qualidade da liderança",     owner: "RH + Diretoria · até 20/jun" },
  { index: 5, title: "Revisão de métricas de reconhecimento",    tag: "Reconhecimento",             owner: "Gestão de Pessoas · até 30/jun" },
  { index: 6, title: "Programa de equilíbrio trabalho-família",  tag: "Conflito trabalho-família",  owner: "RH + Benefícios · até 15/jul" },
  { index: 7, title: "Treinamento de gestão de ritmo",           tag: "Ritmo de trabalho",          owner: "Coordenadores · até 25/jun" },
  { index: 8, title: "Política de suporte social entre pares",   tag: "Suporte social",             owner: "Gestão de Pessoas · até 10/jul" },
];

// ── Roadmap context helpers ──────────────────────────────────
const getRoadmapContext = (clienteId) => {
  const est = window.ROADMAP_ESTADO && window.ROADMAP_ESTADO[clienteId];
  const fases = window.ROADMAP_FASES;
  if (!est || !fases) return null;
  const faseIdx = est.faseAtual;
  const fase = fases[faseIdx];
  const etapasEst = est.etapas[faseIdx] || [];
  const emAndamentoIdx = etapasEst.findIndex(e => e.status === "em_andamento");
  if (emAndamentoIdx < 0) return null;
  const etapa = fase.etapas[emAndamentoIdx];
  return { faseIdx, faseLabel: fase.label, etapaIdx: emAndamentoIdx, etapaLabel: etapa.titulo, etapaNum: emAndamentoIdx + 1 };
};

const DIAG_STATUS_NEXT = {
  "Em campo":  { label: "Acompanhar adesão e encerrar coleta",         icon: "pulse",    etapaOffset: 0 },
  "Encerrada": { label: "Gerar o Relatório ARP (Etapa seguinte)",       icon: "file",     etapaOffset: 1 },
  "Rascunho":  { label: "Lançar o diagnóstico para início da coleta",   icon: "send",     etapaOffset: 0 },
};

const DiagnosticoDetalheScreen = ({ navigate, avaliacao, cliente }) => {
  const [dimView, setDimView] = React.useState("ranking");
  const [exportMsg, setExportMsg] = React.useState("");
  const [showAllActions, setShowAllActions] = React.useState(false);
  const [reuniaoToast, setReuniaoToast] = React.useState(false);
  const [gerandoPDF, setGerandoPDF] = React.useState(false);
  const [etapaConcluida, setEtapaConcluida] = React.useState(false);
  const a = avaliacao || AVALIACOES_ATIVAS[0];
  const c = cliente || CLIENTES.find(x => x.name.startsWith(a.cliente)) || CLIENTES[0];
  const diagnostico = DIAGNOSTICOS.find(d => d.id === a.diagnosticoId);
  const dims = (DIAG_DIMS_MAP && DIAG_DIMS_MAP[a.diagnosticoId]) || COPSOQ_DIMS;
  const media = a.media || dims.reduce((s,d) => s + d.v, 0) / dims.length;
  const roadmapCtx = c ? getRoadmapContext(c.id) : null;
  const nextStep = DIAG_STATUS_NEXT[a.status] || DIAG_STATUS_NEXT["Rascunho"];

  const gerarRelatorioPDF = async () => {
    setGerandoPDF(true);
    try {
      // Demonstração: baixa o PDF psicossocial pré-pronto em vez de gerar um novo
      const downloadLink = document.createElement("a");
      downloadLink.href = "/relatorio_psicossocial.pdf";
      downloadLink.download = `relatorio_${a.code}_${Date.now()}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setExportMsg("Relatório PDF baixado com sucesso!");
      setTimeout(() => setExportMsg(""), 3000);
    } catch (err) {
      console.error("Erro ao baixar PDF:", err);
      setExportMsg(`Erro ao baixar relatório: ${err.message}`);
      setTimeout(() => setExportMsg(""), 3000);
    } finally {
      setGerandoPDF(false);
    }
  };

  return (
    <Page>
      {/* Header ──────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={() => navigate("diagnosticos")} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: 13 }}>
          <Icon name="chevron-left" size={14} /> Voltar para diagnósticos
        </button>
        {roadmapCtx && (
          <button onClick={() => navigate("roadmap", { clienteId: c.id })} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--health-deep)", fontSize: 13, fontWeight: 600 }}>
            <Icon name="map" size={13} color="var(--health-deep)" />
            Roadmap {c.name} <Icon name="arrow-right" size={12} color="var(--health-deep)" />
          </button>
        )}
      </div>

      {roadmapCtx && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px", borderRadius: 12, marginBottom: 20,
          background: "var(--surface-sage)", border: "1px solid var(--health-soft)",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="milestone" size={15} color="var(--health-deep)" />
            <span style={{ fontSize: 13, color: "var(--health-deep)", lineHeight: 1.3 }}>
              <strong>Fase {roadmapCtx.faseIdx + 1} · Etapa {roadmapCtx.etapaNum}/8</strong>
              {" — "}{roadmapCtx.etapaLabel}
              <span style={{ color: "var(--health)", opacity: 0.7, marginLeft: 8 }}>· {roadmapCtx.faseLabel}</span>
            </span>
          </div>
          {a.status === "Encerrada" && !etapaConcluida && (
            <button
              onClick={() => setEtapaConcluida(true)}
              className="btn btn-primary"
              style={{ height: 32, fontSize: 12, flexShrink: 0 }}
            >
              <Icon name="check" size={13} /> Marcar etapa concluída
            </button>
          )}
          {etapaConcluida && (
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--health-deep)", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="check" size={13} color="var(--health-deep)" /> Etapa marcada como concluída
            </span>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 24 }}>
        <div style={{ flex: 1 }}>
          <span style={{
            display: "inline-block", padding: "4px 10px", borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            background: "var(--surface-sage)", color: "var(--health-deep)", marginBottom: 10
          }}>{a.code} · {a.cliente}</span>
          <h1 className="display" style={{ fontSize: 40, margin: 0 }}>{a.titulo}</h1>
          <p style={{ margin: "8px 0 0", color: "var(--ink-muted)", fontSize: 15 }}>{a.periodo} · {a.respondidos} de {a.alvo} respostas ({a.adesao}% adesão)</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setExportMsg("Planilha XLS preparada para download.")} className="btn btn-soft" style={{ height: 38 }}><Icon name="download" size={14}/> XLS</button>
          <button 
            onClick={gerarRelatorioPDF}
            disabled={gerandoPDF}
            className="btn btn-accent" 
            style={{ height: 38 }}
          >
            {gerandoPDF ? (
              <>
                <Icon name="loader" size={14} style={{ animation: "spin 1s linear infinite" }} /> Gerando...
              </>
            ) : (
              <>
                <Icon name="file" size={14}/> Relatório PDF
              </>
            )}
          </button>
          </div>
          {exportMsg && (
            <div style={{ padding: "7px 10px", borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name={exportMsg.includes("Erro") ? "alert-circle" : "check"} size={13}/> {exportMsg}
            </div>
          )}
        </div>
      </div>

      {/* OVERVIEW ──────────────────────────────────────────── */}
      <div className="card" style={{ padding: 32, marginBottom: 24, display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: 32, alignItems: "center" }}>
        <RiskMedallion value={media} size={120} />
        <div>
          <div className="eyebrow">Média geral</div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 30, margin: "6px 0", color: "var(--ink)" }}>
            {media >= 2.5 ? "Acima do limite" : "Dentro do limite"}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Limite NR-1 para ação · 2.5/4</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 24 }}>
          <div className="eyebrow">Dimensões em risco</div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 30, margin: "6px 0", color: "var(--coral)" }}>
            {dims.filter(d => d.v >= 2.5).length}
            <span style={{ color: "var(--ink-faint)", fontSize: 20 }}> / {dims.length}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Necessitam plano de ação</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 24 }}>
          <div className="eyebrow">Comparativo trimestre</div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 30, margin: "6px 0", color: "var(--health)", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="arrow-down" size={20} color="var(--health)" /> 0.18
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Melhora vs 4º Trim/2025</div>
        </div>
      </div>

      {/* Grid: dims ranking + insights ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Dim ranking — horizontal bars, calmer than pizza chart */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <h2 className="display" style={{ fontSize: 26, margin: 0 }}>Dimensões {diagnostico?.type || "COPSOQ II"}</h2>
            <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--canvas-warm)", borderRadius: 999 }}>
              {["ranking", "setor", "turno"].map(v => (
                <button key={v} onClick={() => setDimView(v)} style={{
                  padding: "4px 12px", borderRadius: 999, fontSize: 12,
                  fontWeight: dimView === v ? 600 : 400,
                  background: dimView === v ? "var(--surface)" : "transparent",
                  boxShadow: dimView === v ? "var(--shadow-card)" : "none",
                  color: dimView === v ? "var(--ink)" : "var(--ink-muted)",
                  transition: "background .15s",
                }}>
                  {{ ranking: "Ranking", setor: "Por setor", turno: "Por turno" }[v]}
                </button>
              ))}
            </div>
          </div>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--ink-muted)" }}>Ordenadas do maior risco para o menor. Marca vertical = limite de ação NR-1.</p>

          {dimView === "ranking" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dims.map(d => <DimRow key={d.name} dim={d} />)}
            </div>
          )}
          {dimView === "setor" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {Object.entries(SETOR_DIMS).map(([setor, dimNames]) => {
                const setorDims = dimNames.map(n => dims.find(d => d.name === n)).filter(Boolean);
                const avg = setorDims.reduce((s, d) => s + d.v, 0) / setorDims.length;
                const riskColor = avg >= 2.5 ? "var(--coral)" : avg >= 1.5 ? "var(--amber)" : "var(--health)";
                return (
                  <div key={setor}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{setor}</span>
                      <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16, color: riskColor }}>{avg.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {setorDims.map(d => <DimRow key={d.name} dim={d} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {dimView === "turno" && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-muted)" }}>
              <Icon name="calendar" size={32} strokeWidth={1.2} color="var(--line-strong)" />
              <div className="display" style={{ fontSize: 18, margin: "14px 0 8px", color: "var(--ink)" }}>Disponível no próximo diagnóstico</div>
              <p style={{ fontSize: 13, margin: 0, maxWidth: 320, marginInline: "auto", lineHeight: 1.5 }}>
                A quebra por turno requer que a pesquisa inclua a dimensão de horário. Disponível a partir do COPSOQ Anual 2026.
              </p>
            </div>
          )}
        </div>

        {/* Side col: insights + plano de ação */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* AI insights */}
          <div className="card" style={{ padding: 22, background: "linear-gradient(180deg, var(--surface-sage) 0%, var(--surface) 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon name="sparkles" size={16} color="var(--health-deep)" />
              <span className="eyebrow" style={{ color: "var(--health-deep)" }}>Insight</span>
            </div>
            <p style={{ margin: 0, fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20, lineHeight: 1.3, color: "var(--ink)" }}>
              As três dimensões mais críticas estão concentradas no setor de <em>Operações</em>.
            </p>
            <ul style={{ margin: "12px 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Carga de trabalho está no percentil 87 — 3× acima da média do setor de Logística",
                "62% dos colaboradores de Operações relataram sintomas de exaustão emocional nos últimos 30 dias",
                "Dimensões de Reconhecimento e Suporte social caíram 0.3 pontos vs trimestre anterior",
              ].map((txt, i) => (
                <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.4 }}>
                  <span style={{ color: "var(--health-deep)", fontWeight: 700, flexShrink: 0 }}>·</span>
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("diagnosticos", { create: true })} className="btn btn-health" style={{ marginTop: 14, height: 34, fontSize: 13 }}>
              <Icon name="plus" size={14}/> Criar pulse focal
            </button>
          </div>

          {/* Plano de ação */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20, margin: "0 0 14px" }}>Plano de ação recomendado</h3>
            {(showAllActions ? ALL_ACTIONS : ALL_ACTIONS.slice(0, 3)).map(a => (
              <ActionItem key={a.index} index={a.index} title={a.title} tag={a.tag} owner={a.owner} />
            ))}
            <button
              onClick={() => setShowAllActions(v => !v)}
              className="btn btn-soft"
              style={{ width: "100%", justifyContent: "center", marginTop: 12, height: 34, fontSize: 13 }}
            >
              {showAllActions ? "Recolher" : "Ver todos · 8 ações"} <Icon name={showAllActions ? "chevron-down" : "arrow-right"} size={13} />
            </button>
          </div>

          {/* Próxima ação */}
          <div className="card" style={{ padding: 22, background: "var(--ink)", color: "#FAF8F2" }}>
            <div className="eyebrow" style={{ color: "rgba(250,248,242,0.6)" }}>Próximo passo</div>
            <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 22, margin: "8px 0 4px", color: "#FAF8F2", lineHeight: 1.2 }}>
              {nextStep.label}
            </h3>
            {roadmapCtx && (
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 14 }}>
                Fase {roadmapCtx.faseIdx + 1} · Etapa {roadmapCtx.etapaNum + nextStep.etapaOffset}/8 do roadmap de {c.name}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {roadmapCtx && (
                <button
                  className="btn"
                  style={{ background: "var(--health)", color: "#fff", height: 36, fontSize: 13 }}
                  onClick={() => navigate("roadmap", { clienteId: c.id })}
                >
                  <Icon name="map" size={14} /> Ver roadmap
                </button>
              )}
              <button
                className="btn"
                style={{ background: "var(--canvas)", color: "var(--ink)", height: 36, fontSize: 13 }}
                onClick={() => { setReuniaoToast(true); setTimeout(() => setReuniaoToast(false), 2500); }}
              >
                <Icon name="calendar" size={14} /> Agendar reunião
              </button>
            </div>
            {reuniaoToast && (
              <div style={{ marginTop: 10, padding: "7px 10px", borderRadius: 8, background: "rgba(250,248,242,0.12)", color: "#FAF8F2", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={13} color="#FAF8F2" /> Convite enviado para o calendário
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};

// ── helpers ──────────────────────────────────────────────────
const DimRow = ({ dim }) => {
  const color = dim.v >= 2.5 ? "var(--coral)" : dim.v >= 1.5 ? "var(--amber)" : "var(--health)";
  const pct = (dim.v / 4) * 100;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 50px", gap: 14, alignItems: "center" }}>
      <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>{dim.name}</div>
      <div style={{ position: "relative", height: 22, background: "var(--canvas-warm)", borderRadius: 6 }}>
        <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: color, borderRadius: 6, opacity: 0.85 }} />
        {/* limit marker at 2.5/4 */}
        <div style={{ position: "absolute", left: "62.5%", top: -3, bottom: -3, width: 2, background: "var(--ink)", borderRadius: 99 }} />
      </div>
      <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 18, textAlign: "right", color: "var(--ink)" }}>{dim.v.toFixed(2)}</div>
    </div>
  );
};

const ActionItem = ({ index, title, tag, owner }) => (
  <div style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: index > 1 ? "1px dashed var(--line-strong)" : "none" }}>
    <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{index}</span>
    <div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{title}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>{tag}{owner ? ` · ${owner}` : ""}</div>
    </div>
  </div>
);

Object.assign(window, { DiagnosticoDetalheScreen });
