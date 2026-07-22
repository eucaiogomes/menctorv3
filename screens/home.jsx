/* global React, Icon, Page, RiskMedallion, riskLabel, riskPill, CLIENTES, COPSOQ_DIMS, AVALIACOES_ATIVAS */
const { useState, useEffect, useRef } = React;

// ════════════════════════════════════════════════════════════
// HOME — Premium executive dashboard (reference mockup layout).
// ════════════════════════════════════════════════════════════

// Lightweight count-up for premium number reveal (respects reduced-motion)
const CountUp = ({ value, decimals = 0, prefix = "", suffix = "", duration = 900 }) => {
  const target = typeof value === "number" ? value : parseFloat(value) || 0;
  const [display, setDisplay] = useState(0);
  const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) { setDisplay(target); return; }
    let raf, start;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setDisplay(target * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <>{prefix}{display.toFixed(decimals)}{suffix}</>;
};

const HomeScreen = ({ navigate }) => {
  const ativos = CLIENTES.filter(c => c.status === "ativo");
  const negociacao = CLIENTES.filter(c => c.status === "negociacao");
  const mrr = ativos.reduce((s, c) => s + c.mrr, 0);
  const avgRisk = ativos.reduce((s, c) => s + c.risk, 0) / ativos.length;
  const emCampo = AVALIACOES_ATIVAS.filter(a => a.status === "Em campo");

  const totalColabs = ativos.reduce((s, c) => s + c.employees, 0);
  const highRiskCount = ativos.filter(c => c.risk >= 2.5).length;
  const healthyCount = ativos.filter(c => c.risk < 1.5).length;
  const totalRespostas = emCampo.reduce((s, a) => s + a.respondidos, 0);
  const totalAlvo = emCampo.reduce((s, a) => s + a.alvo, 0);
  const adesaoGeral = totalAlvo > 0 ? Math.round((totalRespostas / totalAlvo) * 100) : 0;

  // Fake 6-period histories (newest last)
  const clientesHistory = [2.51, 2.44, 2.39, 2.37, 2.31, Number(avgRisk.toFixed(2))];
  const campoHistory = [61, 68, 72, 79, 85, adesaoGeral];
  const mrrHistory = [18.2, 19.1, 19.8, 20.9, 21.4, Number((mrr / 1000).toFixed(1))];
  const evolucaoHistory = [2.62, 2.55, 2.48, 2.44, 2.36, Number(avgRisk.toFixed(2))];

  const [riskFilter, setRiskFilter] = useState("all");
  const filteredAtivos = riskFilter === "all" ? ativos :
    riskFilter === "healthy" ? ativos.filter(c => c.risk < 1.5) :
    riskFilter === "moderate" ? ativos.filter(c => c.risk >= 1.5 && c.risk < 2.5) :
    ativos.filter(c => c.risk >= 2.5);

  const dimAverages = [
    { name: "Carga de trabalho", v: 2.68 },
    { name: "Burnout", v: 2.51 },
    { name: "Estresse", v: 2.39 },
    { name: "Conflito trabalho-família", v: 2.31 },
    { name: "Reconhecimento", v: 2.18 },
  ];

  const distHealthy = healthyCount;
  const distModerate = ativos.filter(c => c.risk >= 1.5 && c.risk < 2.5).length;
  const distHigh = highRiskCount;
  const distTotal = distHealthy + distModerate + distHigh || 1;
  const pctHealthy = Math.round((distHealthy / distTotal) * 100);
  const pctModerate = Math.round((distModerate / distTotal) * 100);
  const pctHigh = 100 - pctHealthy - pctModerate;

  const alerts = [
    { id: "a1", cliente: "AgroCorp Brasil", risk: 2.71, msg: "Risco alto + tendência de alta. Burnout e Carga em destaque.", action: "Agendar reunião", color: "var(--coral)", icon: "flag" },
    { id: "a2", cliente: "Loghaus Logística", risk: 2.35, msg: "Operações acima de 2.5. Workshop marcado para 02/jun.", action: "Ver plano", color: "var(--amber)", icon: "milestone" },
    { id: "a3", cliente: "VitaMed Saúde", risk: 1.82, msg: "Adesão pulse caiu 9pp. Recomendar lembrete + trilha.", action: "Enviar pulse", color: "var(--sky)", icon: "pulse" },
  ];

  return (
    <Page>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="dash-in" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4, letterSpacing: "0.09em", display: "flex", alignItems: "center", gap: 8 }}>
              SEGUNDA · 06 DE JULHO, 2026 <span style={{ color: "var(--ink-faint)" }}>•</span> LECTOR <span style={{ color: "var(--ink-faint)" }}>•</span> VISÃO EXECUTIVA
            </div>
            <h1 className="display" style={{ fontSize: 30, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Boa tarde, Alex. <span style={{ fontSize: 25 }}>👋</span>
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ink-soft)", maxWidth: 720, lineHeight: 1.4 }}>
              Carteira com <strong style={{ color: "var(--ink)" }}>{ativos.length} clientes ativos</strong> • {totalColabs} colaboradores monitorados • Saúde média <span style={{ fontFamily: "var(--display)", fontWeight: 700, color: avgRisk < 2.5 ? "var(--health-deep)" : "var(--coral)" }}>{avgRisk.toFixed(2)}</span> • Tudo abaixo do limite NR-1.
            </p>
          </div>

          <div className="home-hero-actions" style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button onClick={() => navigate("relatorios")} className="btn" style={{ height: 36, padding: "0 16px", fontSize: 13, borderRadius: 10 }}>
              <Icon name="file-text" size={14} /> Relatório executivo
            </button>
            <button onClick={() => navigate("clientes", { tab: "carteira" })} className="btn btn-primary" style={{ height: 36, padding: "0 16px", fontSize: 13, borderRadius: 10 }}>
              Ver carteira completa <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI ROW (5 cards) ────────────────────────────────── */}
      <div className="home-kpi-grid">

        {/* 1 — Saúde média (medallion) */}
        <div className="card card-glass dash-in" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, animationDelay: "40ms" }}>
          <RiskMedallion value={avgRisk} size={66} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 2, fontSize: 10 }}>Saúde média da carteira</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, letterSpacing: "-0.02em", fontSize: 18, color: "var(--ink)", lineHeight: 1.1 }}>
              {avgRisk < 2.5 ? "Dentro do limite" : "Acima do limite"}
            </div>
            <div style={{ marginTop: 3, fontSize: 11.5, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "var(--health)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 2 }}>
                <Icon name="arrow-down" size={11} /> 0.19
              </span>
              <span style={{ color: "var(--ink-muted)" }}>vs trimestre anterior</span>
            </div>
            <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
              <span style={{ color: "var(--ink-muted)" }}>Meta NR-1: ≤ 2.5</span>
              <span className="pill" style={{ fontSize: 10, padding: "2px 9px", background: "var(--health-tint)", color: "var(--health-deep)", borderColor: "transparent" }}>No limite</span>
            </div>
          </div>
        </div>

        {/* 2 — Clientes ativos */}
        <KpiSparkCard
          delay={80}
          icon="users" tint="health"
          label="Clientes ativos"
          value={<CountUp value={ativos.length} />}
          sub={`${healthyCount} saudáveis • ${highRiskCount} em atenção`}
          spark={<Sparkline points={clientesHistory} color="var(--health)" w={200} h={28} thick />}
        />

        {/* 3 — Em campo */}
        <KpiSparkCard
          delay={120}
          icon="pulse" tint="sky"
          label="Em campo"
          badge={<span className="pill pill-sky" style={{ fontSize: 10, padding: "2px 8px" }}>{emCampo.length} ativas</span>}
          value={<><CountUp value={adesaoGeral} />%</>}
          sub={`${totalRespostas} / ${totalAlvo} respostas`}
          spark={<Sparkline points={campoHistory} color="var(--sky)" w={200} h={28} thick />}
        />

        {/* 4 — MRR */}
        <KpiSparkCard
          delay={160}
          icon="arrow-up" tint="amber"
          label="MRR atual"
          value={<>R$ <CountUp value={mrr / 1000} decimals={1} />k</>}
          sub="+R$ 4,8k vs mês anterior"
          spark={<Sparkline points={mrrHistory} color="var(--accent)" w={200} h={28} thick />}
        />

        {/* 5 — Atenção */}
        <KpiSparkCard
          delay={200}
          icon="flag" tint="coral"
          label="Atenção necessária"
          value={<CountUp value={highRiskCount} />}
          sub="Clientes acima de 2.5"
          footer={
            <button onClick={() => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ fontSize: 12, color: "var(--coral)", fontWeight: 700, background: "none", border: "none", padding: 0, display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              Ver alertas <Icon name="arrow-right" size={12} />
            </button>
          }
        />
      </div>

      {/* ── MAIN 2-COL GRID ──────────────────────────────────── */}
      <div className="home-main-grid">

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* SAÚDE DA CARTEIRA — table */}
          <div className="card card-glass dash-in" style={{ padding: "16px 18px", animationDelay: "80ms" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 className="display home-section-title" style={{ fontSize: 18, margin: 0, letterSpacing: "-0.01em" }}>Saúde da carteira</h2>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 1 }}>Média COPSOQ II • clique para detalhe</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <div className="home-risk-filter" style={{ display: "flex", background: "var(--surface-2)", borderRadius: 999, padding: 3, gap: 2 }}>
                  {[
                    { id: "all", label: "Todos", count: ativos.length },
                    { id: "healthy", label: "Saudável", count: healthyCount },
                    { id: "moderate", label: "Moderado", count: distModerate },
                    { id: "high", label: "Alto risco", count: highRiskCount },
                  ].map(f => {
                    const active = riskFilter === f.id;
                    return (
                      <button key={f.id} onClick={() => setRiskFilter(f.id)} className="chip-btn" style={{
                        fontSize: 12, fontWeight: active ? 700 : 500,
                        padding: "6px 13px", borderRadius: 999,
                        background: active ? "#fff" : "transparent",
                        color: active ? "var(--ink)" : "var(--ink-muted)",
                        boxShadow: active ? "0 1px 3px rgba(10,23,48,0.08)" : "none",
                        display: "inline-flex", alignItems: "center", gap: 6,
                        border: "none", cursor: "pointer"
                      }}>
                        {f.label}
                        <span style={{ fontSize: 10.5, minWidth: 16, textAlign: "center", padding: "0 4px", borderRadius: 99, background: active ? "var(--surface-2)" : "rgba(10,23,48,0.05)", color: "var(--ink-muted)", fontWeight: 700 }}>{f.count}</span>
                      </button>
                    );
                  })}
                </div>
                <button aria-label="Mais opções" style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "none", color: "var(--ink-muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="more-vertical" size={16} />
                </button>
              </div>
            </div>

            {/* Table header */}
            <div className="home-table-header" style={{
              display: "grid",
              gap: 10, alignItems: "center",
              padding: "6px 12px",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
              color: "var(--ink-muted)", borderBottom: "1px solid var(--line)"
            }}>
              <div>Cliente</div>
              <div>Última avaliação</div>
              <div style={{ textAlign: "center" }}>Índice</div>
              <div style={{ textAlign: "center" }}>Variação</div>
              <div style={{ textAlign: "center" }}>Score</div>
              <div style={{ textAlign: "right" }}>Ações</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredAtivos.length === 0 && (
                <div style={{ padding: "20px 12px", textAlign: "center", color: "var(--ink-muted)", fontSize: 14 }}>Nenhum cliente neste filtro.</div>
              )}
              {filteredAtivos.map(c => (
                <ClientTableRow
                  key={c.id}
                  cliente={c}
                  onClick={() => navigate("diagnostico-detalhe", { cliente: c })}
                  onReport={() => navigate("relatorios", { clienteId: c.id })}
                />
              ))}
            </div>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)", display: "flex", gap: 16, fontSize: 11.5, color: "var(--ink-muted)", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="dot" style={{ background: "var(--health)" }} /> Saudável &lt; 1.5
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="dot" style={{ background: "var(--amber)" }} /> Moderado 1.5 – 2.49
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="dot" style={{ background: "var(--coral)" }} /> Alto ≥ 2.5
              </div>
              <div style={{ marginLeft: "auto", fontSize: 11.5 }}>Escala 0–4 • NR-1: 2.5</div>
            </div>
          </div>

          {/* INTELIGÊNCIA DA CARTEIRA */}
          <div className="dash-in" style={{ animationDelay: "160ms" }}>
            <h3 className="display home-section-title" style={{ fontSize: 16, margin: "0 0 8px" }}>Inteligência da carteira</h3>
            <div className="home-intel-grid">

              {/* Donut */}
              <div className="card card-glass" style={{ padding: 13 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>Distribuição de risco</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="dash-pop" style={{ position: "relative", width: 76, height: 76, flexShrink: 0, animationDelay: "280ms" }}>
                    <div style={{
                      width: 76, height: 76, borderRadius: "50%",
                      background: `conic-gradient(var(--health) 0 ${pctHealthy}%, var(--amber) ${pctHealthy}% ${pctHealthy + pctModerate}%, var(--coral) ${pctHealthy + pctModerate}% 100%)`,
                    }} />
                    <div style={{ position: "absolute", left: 10, top: 10, width: 56, height: 56, borderRadius: "50%", background: "var(--surface)" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{ativos.length}</div>
                      <div style={{ fontSize: 8, color: "var(--ink-muted)", letterSpacing: ".6px", marginTop: 1 }}>CLIENTES</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { pct: pctHealthy, label: "Saudável", n: distHealthy, c: "var(--health)" },
                      { pct: pctModerate, label: "Moderado", n: distModerate, c: "var(--amber)" },
                      { pct: pctHigh, label: "Alto risco", n: distHigh, c: "var(--coral)" },
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span className="dot" style={{ background: r.c, width: 8, height: 8 }} />
                        <span style={{ fontWeight: 700, minWidth: 32 }}>{r.pct}%</span>
                        <span style={{ color: "var(--ink-soft)" }}>{r.label}</span>
                        <span style={{ color: "var(--ink-faint)" }}>({r.n})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dimensões críticas */}
              <div className="card card-glass" style={{ padding: 13 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>Dimensões mais críticas (média)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {dimAverages.map((d, idx) => {
                    const c = d.v >= 2.5 ? "var(--coral)" : d.v >= 1.5 ? "var(--amber)" : "var(--health)";
                    const w = Math.min(100, Math.round((d.v / 4) * 100));
                    return (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "minmax(130px, 1fr) 1fr 38px", alignItems: "center", gap: 10, fontSize: 12 }}>
                        <div style={{ color: "var(--ink)", fontWeight: 500 }}>{d.name}</div>
                        <div style={{ position: "relative", height: 6, background: "var(--surface-2)", borderRadius: 99 }}>
                          <div className="bar-fill" style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${w}%`, background: c, borderRadius: 99 }} />
                          <div style={{ position: "absolute", left: "62.5%", top: -2, bottom: -2, width: 1.5, background: "var(--ink-faint)", opacity: 0.5 }} />
                        </div>
                        <div className="tnum" style={{ fontFamily: "var(--display)", fontWeight: 700, color: c, textAlign: "right", fontSize: 13 }}>{d.v.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, fontSize: 10.5, color: "var(--ink-faint)" }}>Marcador vertical = limite NR-1 (2.5)</div>
              </div>

              {/* Evolução */}
              <div className="card card-glass" style={{ padding: 13, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Evolução da saúde (6 meses)</div>
                <div style={{ flex: 1, margin: "2px 0 8px" }}>
                  <Sparkline points={evolucaoHistory.map(v => 4 - v)} color="var(--health)" w={210} h={78} thick />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Tendência</div>
                    <div style={{ fontWeight: 700, color: "var(--health-deep)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 3 }}>
                      Melhora contínua <Icon name="arrow-down" size={12} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>vs. setor</div>
                    <div style={{ fontWeight: 700, color: "var(--health-deep)" }}>-0.31 melhor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* EM CAMPO AGORA */}
          <div className="card card-glass dash-in" style={{ padding: "14px 16px", animationDelay: "120ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.01em" }}>Em campo agora</div>
              <span className="pill pill-sky" style={{ fontSize: 10.5 }}>{emCampo.length} ativas • {adesaoGeral}%</span>
            </div>

            {emCampo.length === 0 && <div style={{ color: "var(--ink-muted)", fontSize: 13 }}>Nenhuma avaliação em campo.</div>}

            {emCampo.map((a, i) => {
              const pct = a.adesao || 0;
              return (
                <button key={a.id} onClick={() => navigate("diagnostico-detalhe", { avaliacao: a })}
                  style={{ width: "100%", textAlign: "left", padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)", display: "block", background: "none", border: i === 0 ? "none" : undefined, borderLeft: "none", borderRight: "none", borderBottom: "none", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                    <span>{a.titulo}</span>
                    <span className="tnum" style={{ fontWeight: 700, fontSize: 13.5 }}>{pct}%</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-muted)", margin: "2px 0 6px" }}>{a.cliente} • {a.respondidos}/{a.alvo} respostas</div>
                  <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                    <div className="bar-fill" style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--health), #4ade80)", borderRadius: 999 }} />
                  </div>
                  <div style={{ marginTop: 5, fontSize: 10.5, color: "var(--ink-faint)", display: "flex", gap: 8 }}>
                    <span>Termina em ~12d</span>
                    <span>•</span>
                    <span>Código {a.code}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ALERTAS PRIORITÁRIOS */}
          <div id="alerts-section" className="card card-glass dash-in" style={{ padding: "14px 16px", animationDelay: "160ms" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.01em" }}>Alertas prioritários</div>
              <span style={{ fontSize: 11, color: "var(--coral)", fontWeight: 700 }}>{alerts.length} ações</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {alerts.map(al => (
                <div key={al.id} className="alert-row" style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 10px", background: "var(--surface-2)", borderRadius: 10, borderLeft: `3px solid ${al.color}` }}>
                  <div style={{ flexShrink: 0 }}><Icon name={al.icon} size={14} color={al.color} /></div>
                  <div style={{ flex: 1, fontSize: 12, lineHeight: 1.35, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--ink)" }}>{al.cliente} <span style={{ fontWeight: 400, color: "var(--ink-muted)" }}>• {al.risk.toFixed(2)}</span></div>
                    <div style={{ color: "var(--ink-soft)", fontSize: 11.5, marginTop: 1 }}>{al.msg}</div>
                  </div>
                  <button onClick={() => navigate("diagnostico-detalhe", { cliente: ativos.find(c => c.name === al.cliente) || ativos[0] })}
                    className="btn home-alert-action" style={{ fontSize: 11, height: 28, padding: "0 11px", flexShrink: 0, borderRadius: 8 }}>
                    {al.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PIPELINE & RECEITA */}
          <div className="card card-glass dash-in" style={{ padding: "14px 16px", animationDelay: "200ms" }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.01em", marginBottom: 3 }}>Pipeline &amp; Receita</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 10 }}>{negociacao.length} leads em andamento • potencial R$ 12,8k</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <PipelineStage label="Lead" count={2} pct={18} color="#A1A9B8" />
              <PipelineStage label="Proposta" count={2} pct={42} color="var(--sky)" />
              <PipelineStage label="Aceita" count={1} pct={68} color="var(--amber)" />
              <PipelineStage label="Contrato" count={1} pct={100} color="var(--health)" />
            </div>

            <button onClick={() => navigate("pipeline")} className="btn btn-soft" style={{ width: "100%", marginTop: 12, height: 34, fontSize: 12.5, borderRadius: 9 }}>
              Abrir pipeline completo <Icon name="arrow-right" size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER QUICK ACTIONS ─────────────────────────────── */}
      <div className="dash-in home-quickactions" style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", animationDelay: "280ms" }}>
        <button onClick={() => navigate("diagnosticos", { create: true })} className="btn btn-soft" style={{ height: 38, fontSize: 13, borderRadius: 10 }}>
          <Icon name="plus" size={14} /> Novo diagnóstico
        </button>
        <button onClick={() => navigate("clientes", { tab: "pipeline", create: true })} className="btn btn-soft" style={{ height: 38, fontSize: 13, borderRadius: 10 }}>
          <Icon name="users" size={14} /> Novo lead
        </button>
        <button onClick={() => navigate("plano-acao")} className="btn btn-soft" style={{ height: 38, fontSize: 13, borderRadius: 10 }}>
          <Icon name="clipboard" size={14} /> Plano de ação
        </button>
        <button onClick={() => navigate("roadmap")} className="btn btn-soft" style={{ height: 38, fontSize: 13, borderRadius: 10 }}>
          <Icon name="milestone" size={14} /> Roadmap de implantação
        </button>
        <div className="home-quickactions-spacer" style={{ flex: 1 }} />
        <div className="home-sync-status" style={{ fontSize: 11.5, color: "var(--ink-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className="dot" style={{ background: "var(--health)" }} /> Dados sincronizados • Atualizado há 4 min
          <Icon name="refresh" size={12} />
        </div>
      </div>
    </Page>
  );
};

// ── Helper components ───────────────────────────────────────────────

// KPI card with large sparkline anchored at bottom (mockup style)
const KpiSparkCard = ({ icon, label, value, sub, tint, spark, badge, footer, delay = 0 }) => {
  const bg = tint === "health" ? "var(--health-tint)" : tint === "sky" ? "var(--sky-soft)" : tint === "amber" ? "var(--amber-soft)" : "var(--coral-soft)";
  const fg = tint === "health" ? "var(--health-deep)" : tint === "sky" ? "#2b5a7d" : tint === "amber" ? "#8a5a18" : "#9f2c2f";
  return (
    <div className="card card-glass dash-in" style={{ padding: "13px 14px 0", display: "flex", flexDirection: "column", overflow: "hidden", animationDelay: `${delay}ms` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span className="kpi-icon" style={{ width: 24, height: 24, borderRadius: 7, background: bg, color: fg, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={13} strokeWidth={2} />
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--ink-muted)", flex: 1 }}>{label}</span>
        {badge}
      </div>

      <div className="tnum" style={{ fontFamily: "var(--display)", fontWeight: 700, letterSpacing: "-0.02em", fontSize: 24, lineHeight: 1.05, color: "var(--ink)" }}>{value}</div>
      <div style={{ marginTop: 3, fontSize: 11.5, color: "var(--ink-muted)" }}>{sub}</div>

      {footer && <div style={{ marginTop: 8, paddingBottom: 12 }}>{footer}</div>}

      {spark ? (
        <div style={{ marginTop: "auto", marginLeft: -14, marginRight: -14 }}>
          {spark}
        </div>
      ) : !footer && <div style={{ paddingBottom: 12 }} />}
    </div>
  );
};

const Sparkline = ({ points, color = "var(--health)", w = 92, h = 26, thick = false }) => {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const padX = 0;
  const padY = 3;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const pts = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * innerW;
    const y = padY + (1 - (p - min) / range) * innerH;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const areaD = `${pts} L${w - padX},${h} L${padX},${h} Z`;
  const gradId = `spark-${color.replace(/[^a-zA-Z0-9]/g, "")}-${w}-${h}`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} className="dash-pop" />
      <path d={pts} fill="none" stroke={color} strokeWidth={thick ? 2.2 : 1.75} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// Table-style client row matching the mockup columns
const ClientTableRow = ({ cliente, onClick, onReport }) => {
  const [hovered, setHovered] = useState(false);

  const trend = cliente.riskTrend || (cliente.risk > 2.3 ? "up" : cliente.risk < 2 ? "flat" : "down");
  const variation = trend === "up" ? "+0.12" : trend === "down" ? "-0.11" : "—";
  const trendIcon = trend === "up" ? "arrow-up" : trend === "down" ? "arrow-down" : null;
  const trendColor = trend === "up" ? "var(--coral)" : trend === "down" ? "var(--health)" : "var(--ink-muted)";

  const healthScore = cliente.healthScore || Math.round(100 - (cliente.risk / 4) * 55);
  const lastDiag = cliente.lastDiag || "—";

  return (
    <div
      className="home-table-row"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gap: 10,
        alignItems: "center",
        padding: "9px 12px",
        borderBottom: "1px solid var(--line)",
        background: hovered ? "var(--surface-2)" : "transparent",
        cursor: "pointer",
        transition: "background .12s",
        borderRadius: 8
      }}>
      {/* Cliente */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: cliente.color || "var(--health)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 12, letterSpacing: "-0.02em"
        }}>
          {cliente.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cliente.name}</div>
          <div style={{ fontSize: 11, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>{cliente.sector} • {cliente.employees} colab.</div>
        </div>
      </div>

      {/* Última avaliação */}
      <div className="home-col-lastdiag" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
        <div>{lastDiag}</div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>NR-1 2.5</div>
      </div>

      {/* Índice */}
      <div style={{ textAlign: "center" }}>
        <div className="tnum" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 19, lineHeight: 1.1, color: "var(--ink)" }}>{cliente.risk.toFixed(2)}</div>
        <span className={`pill ${riskPill(cliente.risk)}`} style={{ fontSize: 10, padding: "1px 8px", marginTop: 3, display: "inline-block" }}>{riskLabel(cliente.risk)}</span>
      </div>

      {/* Variação */}
      <div className="tnum home-col-variation" style={{ textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 3, color: trendColor, fontWeight: 700, fontSize: 12.5 }}>
        {trendIcon && <Icon name={trendIcon} size={12} />} {variation}
      </div>

      {/* Score */}
      <div className="home-col-score" style={{ textAlign: "center", fontSize: 12.5, color: "var(--ink-soft)" }}>Score <span style={{ fontWeight: 700, color: "var(--ink)" }}>{healthScore}</span></div>

      {/* Ações (desktop) */}
      <div className="home-col-actions-desktop" style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClick} className="btn" style={{ fontSize: 12, height: 32, padding: "0 14px", borderRadius: 9 }}>
          Detalhes
        </button>
        <button onClick={(e) => { e.stopPropagation(); onReport && onReport(); }} aria-label="Mais opções"
          style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: "none", color: "var(--ink-muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="more-vertical" size={15} />
        </button>
      </div>

      {/* Chevron (mobile only, whole row is tappable) */}
      <div className="home-row-chevron-mobile">
        <Icon name="chevron-right" size={16} color="var(--ink-faint)" />
      </div>
    </div>
  );
};

const PipelineStage = ({ label, count, pct, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "3px 0" }}>
    <span style={{ width: 64, fontSize: 12.5, color: "var(--ink-soft)" }}>{label}</span>
    <div style={{ flex: 1, height: 6, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
      <div className="bar-fill" style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999 }} />
    </div>
    <span className="tnum" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, width: 20, textAlign: "right", color: "var(--ink)" }}>{count}</span>
  </div>
);

Object.assign(window, { HomeScreen });
