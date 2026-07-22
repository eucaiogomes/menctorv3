/* global React, Icon, Page, RiskMedallion, CLIENTES, DIAGNOSTICOS, CAMPANHAS, getCampanhaResultado, getCampanhaRespondidos */

// ════════════════════════════════════════════════════════════
// RESULTADO FINAL DA CAMPANHA — inspirado em diagnostico-detalhe.jsx,
// mas com dados reais agregados das respostas coletadas pelo link.
// ════════════════════════════════════════════════════════════

const ACAO_SUGERIDA = {
  "Carga de trabalho":              { title: "Revisão de carga horária e distribuição de tarefas",       owner: "RH + gestores diretos" },
  "Burnout":                        { title: "Programa anti-burnout com apoio psicológico",               owner: "Gestão de Pessoas" },
  "Estresse":                       { title: "Workshop de gestão de estresse e técnicas de regulação",     owner: "RH + SST" },
  "Conflito trabalho-família":      { title: "Política de equilíbrio trabalho-família e flexibilidade",    owner: "RH + Benefícios" },
  "Ritmo de trabalho":              { title: "Revisão de metas e prazos por equipe",                       owner: "Coordenadores" },
  "Reconhecimento":                 { title: "Programa estruturado de reconhecimento e feedback",          owner: "Gestão de Pessoas" },
  "Suporte social":                 { title: "Rodas de escuta e fortalecimento de equipe",                 owner: "RH + Lideranças" },
  "Qualidade da liderança":         { title: "Treinamento de liderança humanizada",                        owner: "RH + Diretoria" },
  "Justiça e respeito":             { title: "Revisão de critérios de decisão e comunicação transparente",  owner: "RH + Compliance" },
  "Influência no trabalho":         { title: "Ampliar autonomia e participação nas decisões",              owner: "Lideranças diretas" },
  "Comunidade social":              { title: "Ações de integração e convivência entre equipes",            owner: "RH + Comunicação interna" },
  "Significado do trabalho":        { title: "Reforçar propósito e conexão com os resultados da empresa",  owner: "Liderança executiva" },
  "Demandas":                       { title: "Rebalancear prazos e volume de trabalho",                    owner: "Gestores diretos" },
  "Controle":                       { title: "Ampliar autonomia sobre ritmo e organização das tarefas",    owner: "Lideranças diretas" },
  "Apoio da chefia":                { title: "Capacitar lideranças para apoio emocional e feedback",       owner: "RH + Liderança" },
  "Apoio dos colegas":              { title: "Fortalecer colaboração e trabalho em equipe",                owner: "Coordenadores" },
  "Relacionamentos":                { title: "Protocolo de prevenção a assédio e conflitos interpessoais", owner: "RH + Compliance" },
  "Cargo e função":                 { title: "Clarificar papéis, metas e responsabilidades",               owner: "RH + Gestores" },
  "Mudança":                        { title: "Melhorar comunicação sobre mudanças organizacionais",        owner: "Liderança executiva" },
  "Organização do trabalho":        { title: "Revisar normas e autonomia na organização das tarefas",      owner: "RH + SST" },
  "Condições de trabalho":          { title: "Avaliar ergonomia e infraestrutura do ambiente físico",       owner: "SST + Facilities" },
  "Relações socioprofissionais":    { title: "Ações de fortalecimento de relações e comunicação interna",  owner: "RH + Comunicação" },
  "Reconhecimento e crescimento":   { title: "Estruturar plano de carreira e reconhecimento",              owner: "Gestão de Pessoas" },
  "Sofrimento psíquico":            { title: "Ampliar suporte psicológico e canais de acolhimento",        owner: "RH + Saúde Ocupacional" },
  "Danos relacionados ao trabalho": { title: "Investigar causas e afastamentos ligados ao trabalho",       owner: "SST + Medicina do Trabalho" },
  "Energia e disposição":           { title: "Ações de combate à fadiga e pausas ativas",                  owner: "RH + SST" },
  "Humor e ânimo":                  { title: "Canal de apoio emocional e escuta ativa",                    owner: "RH + Saúde Ocupacional" },
  "Sono e recuperação":             { title: "Orientação sobre higiene do sono e desconexão no fim do dia",  owner: "RH + Saúde Ocupacional" },
  "Exaustão emocional":             { title: "Programa anti-burnout com apoio psicológico",                owner: "Gestão de Pessoas" },
  "Despersonalização/Cinismo":      { title: "Rodas de escuta e reconexão com o propósito do trabalho",     owner: "RH + Lideranças" },
  "Falta de realização pessoal":    { title: "Plano de desenvolvimento e reconhecimento individual",        owner: "Gestão de Pessoas" },
  "Demanda mental":                 { title: "Rever complexidade e distribuição de tarefas cognitivas",     owner: "Gestores diretos" },
  "Demanda física":                 { title: "Avaliar ergonomia e esforço físico das atividades",           owner: "SST + Facilities" },
  "Demanda temporal":               { title: "Rebalancear prazos e ritmo de trabalho",                      owner: "Coordenadores" },
  "Esforço":                        { title: "Redistribuir carga entre a equipe",                           owner: "Gestores diretos" },
  "Frustração":                     { title: "Workshop de gestão emocional e regulação do estresse",        owner: "RH + SST" },
  "Desempenho percebido":           { title: "Feedback estruturado e metas mais claras",                    owner: "Lideranças diretas" },
  "Comunicação interna":            { title: "Plano de comunicação interna mais transparente e ágil",       owner: "RH + Comunicação interna" },
  "Cultura e valores":              { title: "Reforçar vivência dos valores no dia a dia da empresa",       owner: "Liderança executiva" },
  "Liderança e gestão":             { title: "Treinamento de liderança e gestão participativa",             owner: "RH + Diretoria" },
  "Reconhecimento e carreira":      { title: "Estruturar plano de carreira e remuneração justa",            owner: "Gestão de Pessoas" },
  "Ambiente e infraestrutura":      { title: "Melhorar condições físicas e de bem-estar no ambiente",        owner: "SST + Facilities" },
  "Colaboração e trabalho em equipe": { title: "Fortalecer colaboração entre equipes e setores",             owner: "RH + Coordenadores" },
  "Engajamento Gallup Q12":         { title: "Plano de ação de engajamento por equipe",                     owner: "RH + Lideranças" },
  "Satisfação e recomendação":      { title: "Ações de retenção e fortalecimento do orgulho de pertencer",  owner: "Gestão de Pessoas" },
};

const DIAGNOSTICO_RESULT_CONFIG = {
  copsoq:  { orientacao: "risco" },
  hse:     { orientacao: "risco" },
  edrps:   { orientacao: "risco" },
  pulse:   { orientacao: "risco" },
  burnout: { orientacao: "risco" },
  tlx:     { orientacao: "risco" },
  clima:   { orientacao: "favoravel" },
  gallup:  { orientacao: "favoravel" },
  enps:    { orientacao: "favoravel" },
  disc:    { orientacao: "perfil" },
};
const getResultConfig = (diagnosticoId) => DIAGNOSTICO_RESULT_CONFIG[diagnosticoId] || { orientacao: "risco" };

const RESULT_TEXT = {
  risco: {
    mediaTitulo: (v) => (v >= 2.5 ? "Acima do limite" : "Dentro do limite"),
    mediaSub: "Limite NR-1 para ação · 2.5/4",
    statLabel: "Dimensões em risco",
    statSub: "Necessitam plano de ação",
    statColor: "var(--coral)",
    statFiltro: (v) => v >= 2.5,
    dimensoesDesc: "Ordenadas do maior risco para o menor. Marca vertical = limite de ação NR-1.",
    insightPrefixo: "A dimensão mais crítica é",
    planoTitulo: "Plano de ação recomendado",
  },
  favoravel: {
    mediaTitulo: (v) => (v >= 2.5 ? "Favorável" : "Requer atenção"),
    mediaSub: "Meta de favorabilidade · 2.5/4",
    statLabel: "Dimensões favoráveis",
    statSub: "Acima da meta de favorabilidade",
    statColor: "var(--health-deep)",
    statFiltro: (v) => v >= 2.5,
    dimensoesDesc: "Ordenadas da maior para a menor favorabilidade. Marca vertical = meta de favorabilidade.",
    insightPrefixo: "O ponto mais forte é",
    planoTitulo: "Oportunidades de melhoria",
  },
};

const riskColor = (v) => (v >= 2.5 ? "var(--coral)" : v >= 1.5 ? "var(--amber)" : "var(--health)");
const favColor  = (v) => (v >= 2.5 ? "var(--health)" : v >= 1.5 ? "var(--amber)" : "var(--coral)");
const dimColor = (v, orientacao) => (orientacao === "favoravel" ? favColor(v) : orientacao === "perfil" ? "#1E4A9E" : riskColor(v));

const DISC_TRACOS = {
  "Dominância (D)":   "Perfil orientado a resultados, decisões rápidas e controle das situações.",
  "Influência (I)":   "Perfil comunicativo, entusiasmado e voltado a relacionamentos.",
  "Estabilidade (S)": "Perfil calmo, cooperativo e orientado a rotinas previsíveis.",
  "Conformidade (C)": "Perfil analítico, detalhista e orientado a regras e precisão.",
};

const ResultDimRow = ({ dim, orientacao }) => (
  <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 50px", gap: 14, alignItems: "center" }}>
    <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>{dim.name}</div>
    <div style={{ position: "relative", height: 22, background: "var(--canvas-warm)", borderRadius: 6 }}>
      <div style={{ position: "absolute", inset: 0, width: `${(dim.v / 4) * 100}%`, background: dimColor(dim.v, orientacao), borderRadius: 6, opacity: 0.85 }} />
      {orientacao !== "perfil" && <div style={{ position: "absolute", left: "62.5%", top: -3, bottom: -3, width: 2, background: "var(--ink)", borderRadius: 99 }} />}
    </div>
    <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 18, textAlign: "right", color: "var(--ink)" }}>{dim.v.toFixed(2)}</div>
  </div>
);

const SetorRow = ({ row, orientacao }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px dashed var(--line-strong)" }}>
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{row.setor}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{row.respostas} resposta{row.respostas !== 1 ? "s" : ""}</div>
    </div>
    <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 17, color: dimColor(row.media, orientacao) }}>{row.media.toFixed(2)}</span>
  </div>
);

const CampanhaResultadoScreen = ({ navigate, params = {} }) => {
  const [exportMsg, setExportMsg] = React.useState("");
  const campanha = CAMPANHAS.find(c => c.id === params.campanhaId);
  const cliente = campanha ? CLIENTES.find(c => c.id === campanha.clienteId) : null;
  const diagnostico = campanha ? DIAGNOSTICOS.find(d => d.id === campanha.diagnosticoId) : null;

  if (!campanha || !cliente || !diagnostico) {
    return (
      <Page>
        <button onClick={() => navigate("campanhas")} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: 13, marginBottom: 24 }}>
          <Icon name="chevron-left" size={14} /> Voltar para campanhas
        </button>
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-muted)" }}>
          Campanha não encontrada.
        </div>
      </Page>
    );
  }

  const resultado = getCampanhaResultado(campanha);
  const respondidos = getCampanhaRespondidos(campanha);
  const adesao = campanha.quantidadeFuncionarios ? Math.round((respondidos / campanha.quantidadeFuncionarios) * 100) : 0;
  const media = resultado.media ?? 0;
  const { orientacao } = getResultConfig(diagnostico.id);
  const isPerfil = orientacao === "perfil";
  const cfg = RESULT_TEXT[orientacao] || RESULT_TEXT.risco;
  const dimensoesDestaque = resultado.porDimensao.filter(d => cfg.statFiltro ? cfg.statFiltro(d.v) : d.v >= 2.5).length;
  const topDims = resultado.porDimensao.slice(0, 3);
  const tracoDominante = isPerfil && resultado.porDimensao.length ? resultado.porDimensao[0] : null;

  return (
    <Page>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={() => navigate("campanhas")} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: 13 }}>
          <Icon name="chevron-left" size={14} /> Voltar para campanhas
        </button>
        <button onClick={() => navigate("relatorios", { clienteId: cliente.id })} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--health-deep)", fontSize: 13, fontWeight: 600 }}>
          <Icon name="file" size={13} color="var(--health-deep)" />
          Relatório completo de {cliente.name} <Icon name="arrow-right" size={12} color="var(--health-deep)" />
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 24 }}>
        <div style={{ flex: 1 }}>
          <span style={{
            display: "inline-block", padding: "4px 10px", borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            background: "var(--surface-sage)", color: "var(--health-deep)", marginBottom: 10
          }}>{diagnostico.type} · {cliente.name}</span>
          <h1 className="display" style={{ fontSize: 40, margin: 0 }}>{campanha.titulo}</h1>
          <p style={{ margin: "8px 0 0", color: "var(--ink-muted)", fontSize: 15 }}>
            {campanha.dataInicial?.split("-").reverse().join("/")} – {campanha.dataFinal?.split("-").reverse().join("/")} · {respondidos} de {campanha.quantidadeFuncionarios} respostas ({adesao}% adesão)
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setExportMsg("Planilha XLS preparada para download.")} className="btn btn-soft" style={{ height: 38 }}><Icon name="download" size={14}/> XLS</button>
            <button onClick={() => navigate("relatorios", { clienteId: cliente.id })} className="btn btn-accent" style={{ height: 38 }}><Icon name="file" size={14}/> Relatório</button>
          </div>
          {exportMsg && (
            <div style={{ padding: "7px 10px", borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="check" size={13}/> {exportMsg}
            </div>
          )}
        </div>
      </div>

      {resultado.total === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-muted)" }}>
          Nenhuma resposta registrada ainda para esta campanha.
        </div>
      ) : (
        <>
          {/* OVERVIEW */}
          <div className="card" style={{ padding: 32, marginBottom: 24, display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: 32, alignItems: "center" }}>
            <RiskMedallion value={media} size={120} />
            {isPerfil ? (
              <div>
                <div className="eyebrow">Perfil predominante</div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 30, margin: "6px 0", color: "var(--ink)" }}>
                  {tracoDominante ? tracoDominante.name : "—"}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{tracoDominante ? DISC_TRACOS[tracoDominante.name] : "Sem dados suficientes"}</div>
              </div>
            ) : (
              <div>
                <div className="eyebrow">Média geral</div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 30, margin: "6px 0", color: "var(--ink)" }}>
                  {cfg.mediaTitulo(media)}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{cfg.mediaSub}</div>
              </div>
            )}
            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 24 }}>
              {isPerfil ? (
                <>
                  <div className="eyebrow">Traço secundário</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 30, margin: "6px 0", color: "var(--ink)" }}>
                    {resultado.porDimensao[1] ? resultado.porDimensao[1].name.replace(/\s*\([A-Z]\)$/, "") : "—"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Segunda característica mais forte do grupo</div>
                </>
              ) : (
                <>
                  <div className="eyebrow">{cfg.statLabel}</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 30, margin: "6px 0", color: cfg.statColor }}>
                    {dimensoesDestaque}
                    <span style={{ color: "var(--ink-faint)", fontSize: 20 }}> / {resultado.porDimensao.length}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{cfg.statSub}</div>
                </>
              )}
            </div>
            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 24 }}>
              <div className="eyebrow">Adesão da campanha</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 30, margin: "6px 0", color: "var(--health-deep)" }}>
                {adesao}%
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{respondidos} de {campanha.quantidadeFuncionarios} colaboradores</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, alignItems: "start" }}>
            {/* Dimensões ranking */}
            <div className="card" style={{ padding: 28 }}>
              <h2 className="display" style={{ fontSize: 26, margin: 0 }}>{isPerfil ? `Traços ${diagnostico.type}` : `Dimensões ${diagnostico.type}`}</h2>
              <p style={{ margin: "6px 0 24px", fontSize: 13, color: "var(--ink-muted)" }}>{isPerfil ? "Ordenados do traço mais forte para o mais fraco no grupo." : cfg.dimensoesDesc}</p>
              {resultado.porDimensao.length > 1 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {resultado.porDimensao.map(d => <ResultDimRow key={d.name} dim={d} orientacao={orientacao} />)}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--ink-muted)", fontSize: 13.5 }}>
                  Este diagnóstico não possui quebra por dimensão — média geral: <strong style={{ color: dimColor(media, orientacao) }}>{media.toFixed(2)}</strong>
                </div>
              )}
            </div>

            {/* Side col */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {topDims.length > 0 && (
                <div className="card" style={{ padding: 22, background: "linear-gradient(180deg, var(--surface-sage) 0%, var(--surface) 100%)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Icon name="sparkles" size={16} color="var(--health-deep)" />
                    <span className="eyebrow" style={{ color: "var(--health-deep)" }}>Insight</span>
                  </div>
                  <p style={{ margin: 0, fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20, lineHeight: 1.3, color: "var(--ink)" }}>
                    {isPerfil ? <>O traço predominante do grupo é <em>{topDims[0].name}</em>, com média {topDims[0].v.toFixed(2)}/4.</> : <>{cfg.insightPrefixo} <em>{topDims[0].name}</em>, com média {topDims[0].v.toFixed(2)}/4.</>}
                  </p>
                  <ul style={{ margin: "12px 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {topDims.map(d => (
                      <li key={d.name} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.4 }}>
                        <span style={{ color: "var(--health-deep)", fontWeight: 700, flexShrink: 0 }}>·</span>
                        <span>{d.name} — {d.v.toFixed(2)}/4</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resultado.porSetor.length > 0 && (
                <div className="card" style={{ padding: 22 }}>
                  <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20, margin: "0 0 4px" }}>Por setor</h3>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {resultado.porSetor.map(row => <SetorRow key={row.setor} row={row} orientacao={orientacao} />)}
                  </div>
                </div>
              )}

              {isPerfil ? (
                topDims.length > 0 && (
                  <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20, margin: "0 0 14px" }}>Leitura dos traços</h3>
                    {resultado.porDimensao.map((d, i) => (
                      <div key={d.name} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i > 0 ? "1px dashed var(--line-strong)" : "none" }}>
                        <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{d.name}</div>
                          <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>{DISC_TRACOS[d.name] || ""}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                topDims.length > 0 && (
                  <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20, margin: "0 0 14px" }}>{cfg.planoTitulo}</h3>
                    {resultado.porDimensao.slice(0, 5).map((d, i) => {
                      const sugestao = ACAO_SUGERIDA[d.name] || { title: `Revisar práticas relacionadas a ${d.name}`, owner: "RH + Gestores" };
                      return (
                        <div key={d.name} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i > 0 ? "1px dashed var(--line-strong)" : "none" }}>
                          <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{sugestao.title}</div>
                            <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>{d.name} · {sugestao.owner}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              <div style={{ padding: 22, borderRadius: 16, background: "var(--ink)", color: "#FAF8F2" }}>
                <div className="eyebrow" style={{ color: "rgba(250,248,242,0.6)" }}>Próximo passo</div>
                <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 22, margin: "8px 0 14px", color: "#FAF8F2", lineHeight: 1.2 }}>
                  Consolidar este resultado no relatório final de {cliente.name}
                </h3>
                <button
                  className="btn"
                  style={{ background: "var(--health)", color: "#fff", height: 36, fontSize: 13 }}
                  onClick={() => navigate("relatorios", { clienteId: cliente.id })}
                >
                  <Icon name="file" size={14} /> Ver relatório completo
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

Object.assign(window, { CampanhaResultadoScreen });
