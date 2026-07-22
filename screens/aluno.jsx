/* global React, Icon, Logo */

// ════════════════════════════════════════════════════════════
// ALUNO PORTAL — employee vitrine. Branded by Loghaus.
// Screens: home, responder, concluido, trilhas, trilha, historico
// ════════════════════════════════════════════════════════════

const AlunoApp = ({ onLogout, previewConfig }) => {
  const [view, setView] = React.useState({ screen: "home" });
  const defaultConfig = previewConfig || window.MENCTOR_PORTAL_CONFIG || { diagnosticos: true, trilhas: true, historico: true, falarRh: false, welcome: "Este e seu espaco de cuidado. Suas respostas sao sempre confidenciais; nenhum gestor consegue identificar respostas individuais." };
  const [portalConfig, setPortalConfig] = React.useState(defaultConfig);
  React.useEffect(() => {
    if (previewConfig) return;
    const syncConfig = (event) => setPortalConfig(event.detail || window.MENCTOR_PORTAL_CONFIG || defaultConfig);
    window.addEventListener("menctor:portal-config", syncConfig);
    return () => window.removeEventListener("menctor:portal-config", syncConfig);
  }, [previewConfig]);
  React.useEffect(() => {
    if (previewConfig) setPortalConfig(previewConfig);
  }, [previewConfig]);
  const canOpen = (screen) => (
    screen === "home" ||
    (["responder", "concluido"].includes(screen) && portalConfig.diagnosticos) ||
    (["trilhas", "trilha"].includes(screen) && portalConfig.trilhas) ||
    (screen === "historico" && portalConfig.historico)
  );
  const go = (screen, params = {}) => { setView({ screen: canOpen(screen) ? screen : "home", ...params }); window.scrollTo(0, 0); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(244, 241, 232, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--line)"
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => go("home")} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 4v14h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 8l4 4-4 4" stroke="#E87722" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1 }}>
              <span style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 700, color: "#1C4B82", letterSpacing: "-0.01em" }}>LOGHAUS · Cuidar</span>
              <span style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 3 }}>espaço de cuidado e saúde mental</span>
            </div>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { key: "home",      label: "Início", show: true },
              { key: "trilhas",   label: "Conteúdo", show: portalConfig.trilhas },
              { key: "historico", label: "Histórico", show: portalConfig.historico },
            ].filter(item => item.show).map(({ key, label }) => {
              const active = view.screen === key || (key === "trilhas" && view.screen === "trilha");
              return (
                <button key={key} onClick={() => go(key)} style={{
                  padding: "6px 14px", borderRadius: 999, fontSize: 13,
                  color: active ? "var(--ink)" : "var(--ink-muted)",
                  fontWeight: active ? 600 : 500,
                  background: active ? "var(--surface)" : "transparent",
                  boxShadow: active ? "var(--shadow-card)" : "none",
                  transition: "background .15s, color .15s",
                }}>
                  {label}
                </button>
              );
            })}
            <div style={{
              width: 32, height: 32, borderRadius: 999, background: "var(--surface-sage)",
              color: "var(--health-deep)", display: "inline-flex", alignItems: "center",
              justifyContent: "center", fontFamily: "var(--display)", fontWeight: 600,
              fontSize: 13, marginLeft: 8, flexShrink: 0
            }}>RT</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 40px 80px" }}>
        {view.screen === "home"      && <AlunoHome go={go} portalConfig={portalConfig} />}
        {view.screen === "responder" && portalConfig.diagnosticos && <AlunoResponder go={go} />}
        {view.screen === "concluido" && portalConfig.diagnosticos && <AlunoQuestionarioConcluido go={go} />}
        {view.screen === "trilhas"   && portalConfig.trilhas && <AlunoTrilhas go={go} />}
        {view.screen === "trilha"    && portalConfig.trilhas && <AlunoTrilhaDetalhe go={go} trilhaId={view.trilhaId} />}
        {view.screen === "historico" && portalConfig.historico && <AlunoHistorico go={go} />}
      </main>
    </div>
  );
};

// ── CARROSSEL ──────────────────────────────────────────────────
const ContentCarousel = ({ go }) => {
  const scrollRef = React.useRef(null);
  const [canScrollLeft,  setCanScrollLeft]  = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  React.useEffect(() => { checkScroll(); }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * 270, behavior: "smooth" });
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <h2 className="display" style={{ fontSize: 24, margin: 0 }}>Continue aprendendo</h2>
        <button onClick={() => go("trilhas")} style={{ fontSize: 13, color: "var(--ink-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          Ver tudo <Icon name="arrow-right" size={13} />
        </button>
      </div>
      <div style={{ position: "relative" }}>
        {canScrollLeft && (
          <button onClick={() => scroll(-1)} style={{
            position: "absolute", left: -18, top: "45%", transform: "translateY(-50%)",
            zIndex: 2, width: 34, height: 34, borderRadius: 999,
            background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-pop)",
            display: "inline-flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon name="chevron-left" size={16} />
          </button>
        )}
        <div ref={scrollRef} onScroll={checkScroll} className="no-scrollbar"
          style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4, alignItems: "stretch" }}>
          {ALUNO_TRILHAS.map(t => (
            <button key={t.id} onClick={() => go("trilha", { trilhaId: t.id })} style={{
              flexShrink: 0, width: 252, borderRadius: 16, overflow: "hidden",
              background: "var(--surface)", boxShadow: "var(--shadow-card)",
              textAlign: "left", scrollSnapAlign: "start", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ height: 128, background: t.capa, position: "relative", flexShrink: 0 }}>
                {t.recomendado && (
                  <span style={{ position: "absolute", top: 12, right: 12, padding: "3px 9px", background: "rgba(255,255,255,0.9)", borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink)" }}>Recomendado</span>
                )}
                {t.progresso === 100 && (
                  <span style={{ position: "absolute", top: 12, right: 12, padding: "3px 9px", background: "var(--health)", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700 }}>✓ Concluído</span>
                )}
              </div>
              <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.nome}</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{t.autor} · {t.duracao}</div>
                {t.progresso > 0 && t.progresso < 100 && (
                  <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 3, background: "var(--canvas-warm)", borderRadius: 99 }}>
                      <div style={{ width: `${t.progresso}%`, height: "100%", background: "var(--health)", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{t.progresso}%</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        {canScrollRight && (
          <button onClick={() => scroll(1)} style={{
            position: "absolute", right: -18, top: "45%", transform: "translateY(-50%)",
            zIndex: 2, width: 34, height: 34, borderRadius: 999,
            background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-pop)",
            display: "inline-flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon name="chevron-right" size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// ── HOME ───────────────────────────────────────────────────────
const AlunoHome = ({ go, portalConfig }) => (
  <>
    <div style={{ marginBottom: 40 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Quinta · 27 de maio</div>
      <h1 className="display" style={{ fontSize: 56, margin: 0, lineHeight: 1.02 }}>
        Olá, Roberto.<br/>
        <em style={{ fontStyle: "italic", color: "var(--health-deep)" }}>Como você está?</em>
      </h1>
      <p style={{ margin: "18px 0 0", fontSize: 16.5, color: "var(--ink-soft)", maxWidth: 580, lineHeight: 1.55 }}>
        {portalConfig.welcome}
      </p>
    </div>

    {/* Diagnóstico ativo */}
    {portalConfig.diagnosticos && <div className="card" style={{
      padding: 32, marginBottom: 16,
      background: "linear-gradient(135deg, #2F7D6F 0%, #5BAD72 100%)",
      color: "#fff", borderRadius: 24, position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}/>
      <div style={{ position: "absolute", bottom: -60, right: 60, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}/>
      <div style={{ position: "relative" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(255,255,255,0.18)", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
          <span className="dot" style={{ background: "#fff" }}/> Disponível agora
        </div>
        <h2 className="display" style={{ fontSize: 32, margin: 0, color: "#fff", lineHeight: 1.1 }}>Pesquisa de Clima Organizacional</h2>
        <p style={{ margin: "12px 0 22px", fontSize: 14.5, color: "rgba(255,255,255,0.85)", maxWidth: 460 }}>
          41 perguntas sobre como você se sente no trabalho. Demora cerca de <strong style={{ color: "#fff" }}>8 minutos</strong>. Suas respostas são confidenciais.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => go("responder")} className="btn" style={{ background: "#fff", color: "var(--health-deep)", height: 44, padding: "0 22px", fontSize: 14 }}>
            Começar agora <Icon name="arrow-right" size={15}/>
          </button>
          <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)" }}>Fecha em 4 dias</span>
        </div>
      </div>
    </div>}

    {portalConfig.trilhas && <ContentCarousel go={go} />}

    {/* Histórico resumido */}
    {portalConfig.falarRh && (
      <div className="card" style={{ padding: 22, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--sky-soft)" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Canal confidencial</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>Falar com o RH da Loghaus</div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>Envie uma mensagem privada para o time de pessoas.</div>
        </div>
        <button className="btn btn-primary" style={{ height: 38 }}><Icon name="send" size={14}/> Falar com RH</button>
      </div>
    )}

    {portalConfig.historico && <><div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <h2 className="display" style={{ fontSize: 24, margin: 0 }}>Seu histórico</h2>
      <button onClick={() => go("historico")} style={{ fontSize: 13, color: "var(--ink-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
        Ver tudo <Icon name="arrow-right" size={13}/>
      </button>
    </div>
    <div className="card">
      {[
        ["Pulse Bem-Estar · Abril",  "Respondido em 12/04", "8 min"],
        ["Pulse Bem-Estar · Março",  "Respondido em 15/03", "7 min"],
        ["Diagnóstico COPSOQ Anual", "Respondido em 18/02", "22 min"],
      ].map((r, i) => (
        <button key={i} onClick={() => go("historico")} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 22px", borderTop: i > 0 ? "1px solid var(--line)" : "none",
          background: "none", textAlign: "left"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="check" size={15} color="var(--health)" strokeWidth={2}/>
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{r[0]}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{r[1]} · {r[2]}</div>
            </div>
          </div>
          <Icon name="chevron-right" size={15} color="var(--ink-muted)"/>
        </button>
      ))}
    </div></>}
  </>
);

// ── QUESTIONÁRIO ────────────────────────────────────────────────
const QUESTIONS = [
  { num: 1,  q: "Você tem que trabalhar muito rapidamente?",                                       dim: "Ritmo de trabalho" },
  { num: 2,  q: "A distribuição de trabalho é equilibrada?",                                       dim: "Carga de trabalho" },
  { num: 3,  q: "Você se sente esgotado(a) emocionalmente?",                                      dim: "Burnout" },
  { num: 4,  q: "Seu trabalho exige que esconda seus sentimentos?",                                dim: "Demandas emocionais" },
  { num: 5,  q: "Você recebe ajuda e apoio do seu superior imediato?",                             dim: "Apoio social" },
  { num: 6,  q: "Você tem liberdade para decidir como realizar o seu trabalho?",                   dim: "Autonomia" },
  { num: 7,  q: "Com que frequência você tem dificuldade em desligar do trabalho quando está em casa?", dim: "Conflito trabalho-família" },
  { num: 8,  q: "O seu trabalho tem um significado importante para você?",                         dim: "Significado do trabalho" },
  { num: 9,  q: "Você confia que a liderança da empresa toma decisões justas?",                    dim: "Confiança na gestão" },
  { num: 10, q: "Você se preocupa com a possibilidade de perder o emprego?",                       dim: "Insegurança no emprego" },
  { num: 11, q: "Você consegue influenciar a quantidade de trabalho que recebe?",                  dim: "Autonomia" },
  { num: 12, q: "Você sente que contribui de forma relevante para os objetivos da empresa?",       dim: "Significado do trabalho" },
  { num: 13, q: "Você recebe reconhecimento pelo bom trabalho que realiza?",                       dim: "Apoio social" },
  { num: 14, q: "Com que frequência você pensa em buscar outro emprego?",                          dim: "Comprometimento" },
  { num: 15, q: "Seu trabalho exige que tome decisões difíceis com frequência?",                   dim: "Carga cognitiva" },
  { num: 16, q: "Você consegue conciliar bem as demandas do trabalho com sua vida pessoal?",       dim: "Conflito trabalho-família" },
  { num: 17, q: "Você se sente fisicamente esgotado(a) ao final da jornada de trabalho?",          dim: "Burnout" },
  { num: 18, q: "Existe um clima de respeito e confiança entre colegas no seu setor?",             dim: "Apoio social" },
  { num: 19, q: "Você sente que seu emprego está seguro nos próximos 12 meses?",                   dim: "Insegurança no emprego" },
  { num: 20, q: "Você tem clareza sobre o que é esperado de você no trabalho?",                    dim: "Carga cognitiva" },
];
const OPTS = [
  { v: 0, label: "Sempre",          sub: "Quase 100% do tempo" },
  { v: 1, label: "Frequentemente",  sub: "Boa parte do tempo" },
  { v: 2, label: "Às vezes",        sub: "Em alguns momentos" },
  { v: 3, label: "Raramente",       sub: "Pouco frequente" },
  { v: 4, label: "Nunca",           sub: "Quase nunca acontece" },
];

const AlunoResponder = ({ go }) => {
  const [step, setStep]       = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const total   = 41;
  const isLast  = step === total - 1;
  const current = QUESTIONS[step % QUESTIONS.length];
  const pct     = ((step + 1) / total) * 100;

  const answer = (v) => {
    setAnswers({ ...answers, [step]: v });
    setTimeout(() => {
      if (isLast) go("concluido");
      else setStep(step + 1);
    }, 200);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Barra de progresso */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
        <button onClick={() => go("home")} style={{
          width: 36, height: 36, borderRadius: 999,
          background: "var(--surface)", border: "1px solid var(--line)",
          display: "inline-flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon name="x" size={15}/>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-muted)", marginBottom: 6 }}>
            <span>Pergunta {step + 1} de {total}</span>
            <span>{current.dim}</span>
          </div>
          <div style={{ height: 5, background: "var(--canvas-warm)", borderRadius: 99 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "var(--health)", borderRadius: 99, transition: "width .35s ease" }}/>
          </div>
        </div>
      </div>

      {/* Pergunta */}
      <div style={{ minHeight: "52vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>{current.dim}</div>
        <h2 className="display" style={{ fontSize: 44, margin: 0, lineHeight: 1.1, maxWidth: 640 }}>{current.q}</h2>
        <p style={{ margin: "16px 0 0", fontSize: 14, color: "var(--ink-muted)" }}>Pense nas últimas 4 semanas.</p>

        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
          {OPTS.map(o => {
            const selected = answers[step] === o.v;
            return (
              <button key={o.v} onClick={() => answer(o.v)} style={{
                display: "grid", gridTemplateColumns: "26px 1fr auto", gap: 14, alignItems: "center",
                padding: "16px 18px", borderRadius: 14,
                background: selected ? "var(--surface-sage)" : "var(--surface)",
                border: `1px solid ${selected ? "var(--health)" : "var(--line)"}`,
                boxShadow: "var(--shadow-card)", textAlign: "left",
                transition: "background .15s, border-color .15s",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 99,
                  border: selected ? "6px solid var(--health)" : "1px solid var(--line-strong)",
                  background: selected ? "var(--surface)" : "transparent",
                  flexShrink: 0,
                }}/>
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink)" }}>{o.label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 2 }}>{o.sub}</div>
                </div>
                <span style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{o.v + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navegação */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
        <button
          onClick={() => step > 0 && setStep(step - 1)}
          disabled={step === 0}
          className="btn btn-ghost" style={{ height: 38, opacity: step === 0 ? 0.4 : 1 }}>
          <Icon name="chevron-left" size={14}/> Voltar
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "var(--ink-muted)" }}>
          <Icon name="shield" size={13}/> Confidencial · Salvo automaticamente
        </div>
        {isLast ? (
          <button onClick={() => go("concluido")} className="btn btn-health" style={{ height: 38, padding: "0 18px" }}>
            Enviar <Icon name="check" size={14}/>
          </button>
        ) : (
          <button onClick={() => setStep(step + 1)} className="btn btn-soft" style={{ height: 38 }}>
            Pular <Icon name="chevron-right" size={14}/>
          </button>
        )}
      </div>
    </div>
  );
};

// ── QUESTIONÁRIO CONCLUÍDO ─────────────────────────────────────
const AlunoQuestionarioConcluido = ({ go }) => (
  <div style={{ maxWidth: 620, margin: "0 auto", paddingTop: 60, textAlign: "center" }}>
    <span style={{
      width: 72, height: 72, borderRadius: 999,
      background: "var(--surface-mint)", color: "var(--health)",
      display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 28
    }}>
      <Icon name="check" size={36} strokeWidth={2.2}/>
    </span>
    <h1 className="display" style={{ fontSize: 52, margin: "0 0 14px" }}>
      Obrigado,<br/>Roberto.
    </h1>
    <p style={{ fontSize: 16.5, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
      Suas respostas foram registradas com segurança. Nenhum gestor verá o que você respondeu individualmente.
    </p>

    <div className="card" style={{ padding: 28, textAlign: "left", marginBottom: 28 }}>
      <div className="eyebrow" style={{ marginBottom: 18 }}>O que acontece agora</div>
      {[
        { icon: "pulse", title: "Análise agregada",        desc: "Suas respostas são agrupadas com as de outros colaboradores — resultados sempre anônimos." },
        { icon: "file",  title: "Relatório em ~10 dias",   desc: "O RH da Loghaus recebe um relatório por setor, sem identificação individual." },
        { icon: "spark", title: "Próximo pulse em junho",  desc: "Uma pesquisa rápida de 10 perguntas vai acompanhar a evolução ao longo do ano." },
      ].map((item, i) => (
        <div key={i} style={{
          display: "flex", gap: 14,
          padding: i === 0 ? "0 0 18px" : i === 2 ? "18px 0 0" : "18px 0",
          borderBottom: i < 2 ? "1px solid var(--line)" : "none",
        }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "var(--surface-sage)", color: "var(--health-deep)",
            display: "inline-flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon name={item.icon} size={17} strokeWidth={1.8}/>
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        </div>
      ))}
    </div>

    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      <button onClick={() => go("trilhas")} className="btn btn-health" style={{ height: 44, padding: "0 22px" }}>
        Explorar conteúdos <Icon name="book" size={15}/>
      </button>
      <button onClick={() => go("home")} className="btn btn-ghost" style={{ height: 44 }}>
        Voltar ao início
      </button>
    </div>
  </div>
);

// ── HISTÓRICO ──────────────────────────────────────────────────
const HISTORICO = [
  { titulo: "Pulse Bem-Estar · Maio",       data: "27/05/2026", duracao: "8 min",  status: "pendente", tipo: "pulse"  },
  { titulo: "Pulse Bem-Estar · Abril",      data: "12/04/2026", duracao: "8 min",  status: "ok",       tipo: "pulse"  },
  { titulo: "Pulse Bem-Estar · Março",      data: "15/03/2026", duracao: "7 min",  status: "ok",       tipo: "pulse"  },
  { titulo: "Diagnóstico COPSOQ Anual",     data: "18/02/2026", duracao: "22 min", status: "ok",       tipo: "copsoq" },
  { titulo: "Pulse Bem-Estar · Fevereiro",  data: "10/02/2026", duracao: "8 min",  status: "ok",       tipo: "pulse"  },
  { titulo: "Pulse Bem-Estar · Janeiro",    data: "09/01/2026", duracao: "7 min",  status: "ok",       tipo: "pulse"  },
  { titulo: "Diagnóstico COPSOQ Anual",     data: "20/02/2025", duracao: "24 min", status: "ok",       tipo: "copsoq" },
];

const AlunoHistorico = ({ go }) => (
  <>
    <button onClick={() => go("home")} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: 13, marginBottom: 20 }}>
      <Icon name="chevron-left" size={14}/> Início
    </button>

    <div style={{ marginBottom: 32 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Roberto Teixeira</div>
      <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Seu histórico</h1>
      <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)" }}>
        Todas as pesquisas e diagnósticos em que você participou.
      </p>
    </div>

    {/* Stats */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 32 }}>
      <div className="card" style={{ padding: 22, background: "var(--surface-sage)" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Participações</div>
        <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 48, letterSpacing: "-0.03em", lineHeight: 1 }}>6</div>
        <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>pesquisas respondidas</div>
      </div>
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Tempo dedicado</div>
        <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 48, letterSpacing: "-0.03em", lineHeight: 1 }}>
          1h<span style={{ fontSize: 24, color: "var(--ink-muted)", fontWeight: 500 }}>12m</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>em diagnósticos e pulses</div>
      </div>
      <div className="card" style={{ padding: 22, background: "var(--surface-peach)" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Participação</div>
        <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 48, letterSpacing: "-0.03em", lineHeight: 1 }}>
          100<span style={{ fontSize: 24, color: "var(--ink-muted)", fontWeight: 500 }}>%</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>em todas as pesquisas</div>
      </div>
    </div>

    {/* Lista */}
    <div className="card">
      {HISTORICO.map((h, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 22px", borderTop: i > 0 ? "1px solid var(--line)" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: h.status === "pendente" ? "var(--amber-soft)"
                        : h.tipo === "copsoq"     ? "var(--surface-sage)"
                        : "var(--surface-2)",
              color: h.status === "pendente" ? "#8a5a18"
                   : h.tipo === "copsoq"     ? "var(--health-deep)"
                   : "var(--ink-muted)",
              display: "inline-flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon name={h.status === "pendente" ? "calendar" : "check"} size={17} strokeWidth={1.8}/>
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{h.titulo}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                {h.status === "pendente" ? "Disponível agora" : `Respondido em ${h.data}`} · {h.duracao}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {h.status === "pendente" ? (
              <button onClick={() => go("responder")} className="btn btn-health" style={{ height: 32, padding: "0 14px", fontSize: 12.5 }}>
                Responder agora
              </button>
            ) : (
              <>
                <span className="pill" style={{ fontSize: 11 }}>Concluído</span>
                <Icon name="chevron-right" size={15} color="var(--ink-muted)"/>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  </>
);

// ── TRILHAS ────────────────────────────────────────────────────
const ALUNO_TRILHAS = [
  { id: 1, nome: "Resiliência e regulação emocional",    autor: "Dra. Helena Vargas",  duracao: "2h 40min", progresso: 30,  capa: "linear-gradient(135deg, #C75A4C, #D89A3F)", recomendado: true },
  { id: 2, nome: "Lidando com pressão e prazos",         autor: "Equipe Menctor",      duracao: "1h 10min", progresso: 0,   capa: "linear-gradient(135deg, #4E83A8, #2F7D6F)", recomendado: true },
  { id: 3, nome: "Sono e produtividade",                 autor: "Dr. Pedro Galvão",    duracao: "45min",    progresso: 100, capa: "linear-gradient(135deg, #2F7D6F, #5BAD72)" },
  { id: 4, nome: "Comunicação não-violenta no trabalho", autor: "Equipe Menctor",      duracao: "1h 30min", progresso: 0,   capa: "linear-gradient(135deg, #D89A3F, #E87722)" },
  { id: 5, nome: "Autocuidado e limites no trabalho",    autor: "Dra. Aline Ferreira", duracao: "1h 20min", progresso: 0,   capa: "linear-gradient(135deg, #4E83A8, #C75A4C)", recomendado: true },
];

const AlunoTrilhas = ({ go }) => (
  <>
    <div style={{ marginBottom: 32 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Para você</div>
      <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Conteúdos para você se cuidar</h1>
      <p style={{ margin: "12px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 540 }}>
        Selecionados a partir das suas últimas respostas. Pode ler, ouvir ou assistir no seu ritmo.
      </p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {ALUNO_TRILHAS.map(t => (
        <button key={t.id} onClick={() => go("trilha", { trilhaId: t.id })} className="card"
          style={{ padding: 0, overflow: "hidden", textAlign: "left", display: "flex", flexDirection: "column" }}>
          <div style={{ height: 150, background: t.capa, position: "relative" }}>
            {t.recomendado && (
              <span style={{ position: "absolute", top: 14, right: 14, padding: "3px 10px", background: "rgba(255,255,255,0.92)", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink)" }}>Recomendado</span>
            )}
            {t.progresso === 100 && (
              <span style={{ position: "absolute", top: 14, right: 14, padding: "3px 10px", background: "var(--health)", color: "#fff", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>✓ Concluído</span>
            )}
          </div>
          <div style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 22, margin: 0, lineHeight: 1.2, color: "var(--ink)" }}>{t.nome}</h3>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 8 }}>{t.autor} · {t.duracao}</div>
            {t.progresso > 0 && t.progresso < 100 && (
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 4, background: "var(--canvas-warm)", borderRadius: 99 }}>
                  <div style={{ width: `${t.progresso}%`, height: "100%", background: "var(--health)", borderRadius: 99 }}/>
                </div>
                <span style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{t.progresso}%</span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  </>
);

// ── TRILHA DETALHE ─────────────────────────────────────────────
const TRAIL_MODULES = {
  1: [
    { titulo: "Identificando suas emoções",   duracao: "12 min", done: true,  preview: "Antes de regular, precisamos reconhecer. A Dra. Helena explica o mapa das emoções e como nomear o que sentimos — o primeiro passo para o equilíbrio emocional no trabalho." },
    { titulo: "Técnicas de respiração",        duracao: "18 min", done: true,  preview: "A respiração é a ferramenta mais acessível que temos. Aprenda 3 técnicas baseadas em evidências: a respiração 4-7-8, a respiração diafragmática e o box breathing." },
    { titulo: "Reframing cognitivo",            duracao: "32 min", done: false, preview: "Pensamentos negativos automáticos são comuns em ambientes de alta pressão. Aprenda a identificá-los e reformulá-los de forma realista — sem negar a dificuldade." },
    { titulo: "Práticas de mindfulness",        duracao: "48 min", done: false, preview: "Mindfulness não é meditação de hora em hora. São 5 minutos estratégicos que mudam como você responde ao estresse — com exercícios práticos para usar no escritório." },
    { titulo: "Plano pessoal de regulação",     duracao: "50 min", done: false, preview: "O módulo final integra tudo em um plano concreto e pessoal para os próximos 30 dias. Você sai com ações claras para cada tipo de situação estressante." },
  ],
};

const DEFAULT_MODULES = [
  { titulo: "Introdução ao tema",         duracao: "10 min", done: false, preview: "Contextualização e o que você vai aprender nesta trilha. Uma visão geral dos conceitos centrais." },
  { titulo: "Conceitos fundamentais",     duracao: "20 min", done: false, preview: "Base teórica e prática para entender o assunto com profundidade e aplicar no dia a dia." },
  { titulo: "Aplicação no trabalho",      duracao: "25 min", done: false, preview: "Como integrar os aprendizados na sua rotina profissional com estratégias simples e diretas." },
  { titulo: "Exercícios guiados",         duracao: "30 min", done: false, preview: "Atividades práticas para consolidar o aprendizado e desenvolver novas habilidades." },
  { titulo: "Revisão e próximos passos",  duracao: "15 min", done: false, preview: "Síntese da trilha e como continuar sua jornada de desenvolvimento pessoal." },
];

const AlunoTrilhaDetalhe = ({ go, trilhaId }) => {
  const [activeModule, setActiveModule] = React.useState(null);
  const trilha  = ALUNO_TRILHAS.find(t => t.id === trilhaId) || ALUNO_TRILHAS[0];
  const modules = TRAIL_MODULES[trilha.id] || DEFAULT_MODULES;
  const doneMods = modules.filter(m => m.done).length;
  const pct      = Math.round((doneMods / modules.length) * 100);
  const nextIdx  = modules.findIndex(m => !m.done);

  // ── Player de módulo
  if (activeModule !== null) {
    const mod      = modules[activeModule];
    const isFirst  = activeModule === 0;
    const isLastMod = activeModule === modules.length - 1;

    return (
      <>
        <button onClick={() => setActiveModule(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: 13, marginBottom: 20 }}>
          <Icon name="chevron-left" size={14}/> {trilha.nome}
        </button>

        <div style={{ height: 200, borderRadius: 24, background: trilha.capa, marginBottom: 28, display: "flex", alignItems: "flex-end", padding: 28 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
              Módulo {activeModule + 1} de {modules.length}
            </div>
            <h2 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 28, color: "#fff", margin: 0, lineHeight: 1.1 }}>{mod.titulo}</h2>
          </div>
        </div>

        <div className="card" style={{ padding: 32, marginBottom: 20 }}>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.75, margin: "0 0 28px" }}>{mod.preview}</p>
          <div style={{ height: 140, borderRadius: 14, background: "var(--canvas-warm)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, border: "1px dashed var(--line-strong)" }}>
            <Icon name="pulse" size={28} color="var(--ink-faint)" strokeWidth={1.5}/>
            <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>Conteúdo multimídia · {mod.duracao}</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => !isFirst && setActiveModule(activeModule - 1)} disabled={isFirst}
            className="btn btn-ghost" style={{ height: 40, opacity: isFirst ? 0.4 : 1 }}>
            <Icon name="chevron-left" size={14}/> Anterior
          </button>
          <button
            onClick={() => isLastMod ? setActiveModule(null) : setActiveModule(activeModule + 1)}
            className="btn btn-health" style={{ height: 40, padding: "0 20px" }}>
            {isLastMod ? "Concluir trilha" : "Próximo módulo"} <Icon name="arrow-right" size={14}/>
          </button>
        </div>
      </>
    );
  }

  // ── Visão geral da trilha
  return (
    <>
      <button onClick={() => go("trilhas")} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: 13, marginBottom: 18 }}>
        <Icon name="chevron-left" size={14}/> Todos os conteúdos
      </button>

      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Trilha · {modules.length} módulos · {trilha.duracao}</div>
        <h1 className="display" style={{ fontSize: 44, margin: 0 }}>{trilha.nome}</h1>
        <p style={{ margin: "12px 0 0", fontSize: 15, color: "var(--ink-soft)", maxWidth: 600, lineHeight: 1.55 }}>
          {trilha.autor} · {trilha.duracao} de conteúdo cuidadosamente selecionado para você.
        </p>
      </div>

      {/* Banner com CTA */}
      <div style={{ height: 280, borderRadius: 24, background: trilha.capa, marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "28px 32px" }}>
        {pct > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 120, height: 6, background: "rgba(255,255,255,0.3)", borderRadius: 99 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "#fff", borderRadius: 99 }}/>
            </div>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{pct}% concluído</span>
          </div>
        ) : <div/>}
        <button onClick={() => setActiveModule(nextIdx >= 0 ? nextIdx : 0)} style={{
          height: 48, padding: "0 22px", borderRadius: 999,
          background: "rgba(255,255,255,0.95)", color: "var(--ink)",
          fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 10
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          {pct > 0 ? "Continuar" : "Começar trilha"}
        </button>
      </div>

      {/* Lista de módulos */}
      <div className="card" style={{ padding: 22 }}>
        <h3 className="display" style={{ fontSize: 22, margin: "0 0 4px" }}>Módulos</h3>
        {modules.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: i > 0 ? "1px dashed var(--line-strong)" : "none" }}>
            <span style={{
              width: 28, height: 28, borderRadius: 999, flexShrink: 0,
              background: m.done ? "var(--health)" : "var(--surface-2)",
              color: m.done ? "#fff" : "var(--ink-muted)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
            }}>
              {m.done ? "✓" : i + 1}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{m.titulo}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{m.duracao}</div>
            </div>
            <button onClick={() => setActiveModule(i)} className="btn btn-soft" style={{ height: 32, fontSize: 12.5 }}>
              {m.done ? "Rever" : i === nextIdx ? "Continuar" : "Iniciar"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

Object.assign(window, { AlunoApp });
