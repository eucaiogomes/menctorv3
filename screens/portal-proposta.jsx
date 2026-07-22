/* global React, Icon, Logo */

// ════════════════════════════════════════════════════════════
// PORTAL DE PROPOSTA — external client-facing page (personalized via link)
// Client opens ?proposta=CARD_ID (or prop) → sees tailored offer and can ACCEPT
// Acceptance releases "contrato" stage in consultant pipeline with visual feedback.
// Também é renderizado em escala reduzida dentro da etapa 2 do roadmap
// via props previewCard/previewAccepted (preview 100% fiel ao link).
// ════════════════════════════════════════════════════════════

const loadProposalCard = async (id) => {
  if (!id) return null;
  // 1) Snapshot saved when consultant generated the link
  try {
    const snap = window.localStorage.getItem(`MENCTOR_PROPOSAL_${id}`);
    if (snap) return JSON.parse(snap);
  } catch (e) {}
  // 2) Try Supabase-backed pipeline if available (public anon)
  if (window.MenctorDB && typeof window.MenctorDB.listPipelineCards === "function") {
    try {
      const cards = await window.MenctorDB.listPipelineCards();
      const found = cards.find(c => String(c.id) === String(id));
      if (found) return found;
    } catch (e) { /* ignore, fallthrough */ }
  }
  // 3) Fallback: look in any in-memory pipeline state or LEADS
  try {
    const all = [];
    if (window.LEADS_PIPELINE) Object.values(window.LEADS_PIPELINE).forEach(arr => all.push(...arr));
    const found = all.find(c => String(c.id) === String(id));
    if (found) return found;
  } catch (e) {}
  return null;
};

const saveAcceptance = (card) => {
  if (!card || !card.id) return;
  const payload = {
    id: card.id,
    empresa: card.empresa,
    acceptedAt: new Date().toISOString(),
    valor: card.valor,
    funcionarios: card.funcionarios,
  };
  try {
    window.localStorage.setItem(`MENCTOR_PROPOSAL_ACCEPTED_${card.id}`, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("menctor:proposal-accepted", { detail: payload }));
  } catch (e) {}
  return payload;
};

const PortalPropostaScreen = ({ propostaId, onExit, previewCard, previewAccepted }) => {
  const [card, setCard] = React.useState(previewCard || null);
  const [loading, setLoading] = React.useState(!previewCard);
  const [aceito, setAceito] = React.useState(!!previewAccepted);
  const [acceptedAt, setAcceptedAt] = React.useState(null);

  // Modo preview (embutido no roadmap): dados vêm por prop e atualizam ao vivo
  React.useEffect(() => {
    if (previewCard) {
      setCard(previewCard);
      setLoading(false);
      setAceito(!!previewAccepted);
    }
  }, [previewCard, previewAccepted]);

  // Load personalized data for this link
  React.useEffect(() => {
    if (previewCard) return; // preview: sem carregamento assíncrono
    let alive = true;
    (async () => {
      setLoading(true);
      const id = propostaId || new URLSearchParams(window.location.search).get("proposta");
      const data = await loadProposalCard(id);
      if (!alive) return;
      if (data) {
        setCard(data);
        // Check if already accepted (reopen link)
        try {
          const acc = window.localStorage.getItem(`MENCTOR_PROPOSAL_ACCEPTED_${data.id || id}`);
          if (acc) {
            const p = JSON.parse(acc);
            setAceito(true);
            setAcceptedAt(p.acceptedAt);
          }
        } catch (e) {}
      } else {
        // graceful demo fallback (when opened without id or no data)
        setCard({
          id: "demo",
          empresa: "Norte Fintech",
          contato: "Caio Barbosa",
          email: "caio@nortefintech.com.br",
          funcionarios: 180,
          valor: 2900,
          dias: 0,
        });
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [propostaId, previewCard]);

  const empresa = card?.empresa || "sua empresa";
  const valor = Number(card?.valor || 2900);
  const funcs = Number(card?.funcionarios || 180);
  const ticket = funcs ? (valor / funcs) : 16.11;
  const contato = card?.contato || "gestor(a)";
  const vigencia = Number(card?.vigencia || 12);

  // Datas reais da proposta: emissão (do snapshot) e validade de 30 dias
  const emitidaEm = card?.emitidaEm ? new Date(card.emitidaEm) : new Date();
  const validaAte = new Date(emitidaEm.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dataFmt = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const handleAccept = () => {
    if (!card || previewCard) return;
    const res = saveAcceptance(card);
    setAceito(true);
    setAcceptedAt(res.acceptedAt);
    // small celebration pulse
    setTimeout(() => {
      const el = document.getElementById("accept-success");
      if (el) el.style.transform = "scale(1.02)";
      setTimeout(() => { if (el) el.style.transform = "scale(1)"; }, 180);
    }, 60);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--canvas)" }}>
        <div style={{ textAlign: "center", color: "var(--ink-muted)" }}>
          <div style={{ marginBottom: 12 }}>Carregando proposta personalizada...</div>
          <div style={{ width: 28, height: 3, background: "var(--line)", borderRadius: 999, overflow: "hidden", margin: "0 auto" }}>
            <div style={{ width: "40%", height: "100%", background: "var(--health)", animation: "pulse 1.2s linear infinite" }} />
          </div>
        </div>
      </div>
    );
  }

  const fmt = (n) => Number(n || 0).toLocaleString("pt-BR");

  // Dados reais da contratante — só renderiza os campos que existem
  const dadosCliente = [
    { label: "Razão social", value: card?.empresa },
    { label: "CNPJ", value: card?.cnpj },
    { label: "Responsável", value: card?.contato },
    { label: "E-mail", value: card?.email },
    { label: "Telefone", value: card?.telefone },
    { label: "Segmento", value: card?.segmento },
    { label: "Colaboradores", value: funcs ? `${fmt(funcs)}` : null },
    { label: "Cidades", value: card?.cidades },
  ].filter(d => d.value);

  // Composição do investimento — tudo incluído no valor mensal
  const investItens = [
    { icon: "pulse", nome: "Diagnóstico COPSOQ II + DRPS", detalhe: "Aplicação completa para todos os colaboradores" },
    { icon: "users", nome: "Portal do colaborador personalizado", detalhe: "Sua marca, acesso ilimitado da equipe" },
    { icon: "book", nome: "Trilhas de aprendizado (6 trilhas)", detalhe: "Saúde mental, liderança, resiliência" },
    { icon: "spark", nome: "Pulse surveys mensais", detalhe: "Monitoramento contínuo entre diagnósticos" },
    { icon: "file-text", nome: "Relatórios executivos + plano de ação", detalhe: "Prontos para fiscalização NR-1" },
    { icon: "shield", nome: "Suporte consultivo dedicado", detalhe: "Consultor credenciado durante toda a vigência" },
  ];

  return (
    <div style={{ background: "var(--canvas)", minHeight: "100vh" }}>
      {/* browser bar */}
      <div style={{
        background: "var(--surface-2)", borderBottom: "1px solid var(--line)",
        padding: "10px 28px", display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "var(--ink-muted)"
      }}>
        <Icon name="globe" size={14} />
        <span>menctor.com.br/portal/{(empresa || "cliente").toLowerCase().replace(/\s+/g, "-").slice(0, 22)}</span>
        <span style={{ marginLeft: "auto" }}>Visão do cliente · proposta comercial</span>
        {onExit && (
          <button onClick={onExit} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--ink)", fontWeight: 600 }}>
            <Icon name="chevron-left" size={13}/> Voltar ao painel
          </button>
        )}
      </div>

      <header style={{ padding: "32px 48px 0", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <Logo />
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--ink-muted)" }}>
            <span>Proposta nº <strong style={{ color: "var(--ink)" }}>PRP-{String(card?.id || "2026").slice(-6).toUpperCase()}</strong></span>
            <span style={{ color: "var(--line)" }}>|</span>
            <span>Emitida em <strong style={{ color: "var(--ink)" }}>{emitidaEm.toLocaleDateString("pt-BR")}</strong></span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", fontWeight: 600, fontSize: 12 }}>
              <Icon name="calendar" size={13} /> Válida até {validaAte.toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 48px 80px" }}>
        {/* hero personalized */}
        <div style={{ marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 14, color: "var(--health-deep)" }}>Proposta comercial · Riscos psicossociais · NR-1</div>
          <h1 className="display" style={{ fontSize: 64, lineHeight: 1, margin: 0, maxWidth: 800 }}>
            Saúde psicossocial,<br/>com tranquilidade<br/><em style={{ fontStyle: "italic", color: "var(--health-deep)" }}>e conformidade NR-1.</em>
          </h1>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", maxWidth: 620, marginTop: 24, lineHeight: 1.55 }}>
            Olá, <strong>{contato}</strong>. Preparei esta proposta personalizada para <strong>{empresa}</strong>{card?.segmento ? `, do segmento de ${card.segmento},` : ""} cobrindo {fmt(funcs)} colaboradores e atendendo integralmente os requisitos da NR-1.
          </p>
        </div>

        {/* DADOS REAIS DA CONTRATANTE */}
        {dadosCliente.length > 0 && (
          <div className="card" style={{ padding: "22px 28px", marginBottom: 32, background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Icon name="clipboard" size={15} color="var(--health-deep)" />
              <div className="eyebrow" style={{ color: "var(--health-deep)" }}>Proposta preparada para</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px 24px" }}>
              {dadosCliente.map(d => (
                <div key={d.label}>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>{d.label}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUMMARY — dynamic */}
        <div className="card" style={{ padding: 36, marginBottom: 32, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
          <div>
            <div className="eyebrow">Investimento mensal</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 56, color: "var(--ink)", lineHeight: 1, marginTop: 8 }}>R$ {fmt(valor)}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 8 }}>Contrato de {vigencia} meses · sem fidelidade após</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 32 }}>
            <div className="eyebrow">Colaboradores cobertos</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 56, color: "var(--ink)", lineHeight: 1, marginTop: 8 }}>{fmt(funcs)}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 8 }}>R$ {ticket.toFixed(2).replace(".", ",")} por colaborador / mês</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 32 }}>
            <div className="eyebrow">Implantação</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 56, color: "var(--ink)", lineHeight: 1, marginTop: 8 }}>7<span style={{ fontSize: 24, color: "var(--ink-muted)" }}> dias</span></div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 8 }}>Primeiro diagnóstico em até 14 dias</div>
          </div>
        </div>

        {/* what's included */}
        <h2 className="display" style={{ fontSize: 32, margin: "0 0 24px" }}>O que está incluído</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48 }}>
          <FeatureCard icon="pulse" title="Diagnóstico COPSOQ II completo"
            desc="Padrão exigido pela NR-1. 41 questões validadas internacionalmente, mapeando 12 dimensões psicossociais." />
          <FeatureCard icon="shield" title="Conformidade NR-1 garantida"
            desc="Relatórios prontos para fiscalização, com plano de ação documentado e revisão trimestral." />
          <FeatureCard icon="users" title="Vitrine para colaboradores"
            desc="Portal próprio onde sua equipe responde diagnósticos e acessa conteúdos. Sua marca, seu domínio." />
          <FeatureCard icon="book" title="Trilhas de aprendizado"
            desc="6 trilhas sobre saúde mental, liderança humanizada, regulação emocional e resiliência." />
          <FeatureCard icon="spark" title="Pulse surveys mensais"
            desc="Monitoramento contínuo com 10 questões rápidas — para acompanhar evolução entre diagnósticos." />
          <FeatureCard icon="file" title="Relatórios executivos"
            desc="Dashboards por setor, unidade e organização. Exportação em PDF e Excel sempre que precisar." />
        </div>

        {/* INVESTIMENTO DETALHADO */}
        <h2 className="display" style={{ fontSize: 32, margin: "0 0 24px" }}>Investimento detalhado</h2>
        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 48 }}>
          {investItens.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 28px", borderTop: i > 0 ? "1px solid var(--line)" : "none" }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={item.icon} size={16} strokeWidth={1.8}/>
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{item.nome}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{item.detalhe}</div>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--health-deep)" }}>
                <Icon name="check" size={13}/> Incluído
              </span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 28px", background: "var(--surface-sage)", borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>Total mensal</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 30, color: "var(--ink)", lineHeight: 1.1 }}>R$ {fmt(valor)}<span style={{ fontSize: 14, color: "var(--ink-muted)" }}> /mês</span></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>Total do contrato ({vigencia} meses)</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 30, color: "var(--health-deep)", lineHeight: 1.1 }}>R$ {fmt(valor * vigencia)}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>equivale a R$ {ticket.toFixed(2).replace(".", ",")} por colaborador / mês</div>
            </div>
          </div>
        </div>

        {/* timeline */}
        <h2 className="display" style={{ fontSize: 32, margin: "0 0 24px" }}>Como funciona</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 48, position: "relative" }}>
          {[
            { n: "01", t: "Onboarding", d: "Reunião de implantação, configuração do portal e treinamento do RH (até 7 dias)." },
            { n: "02", t: "Primeiro diagnóstico", d: `COPSOQ II aplicado para toda a ${empresa} (até 14 dias após onboarding).` },
            { n: "03", t: "Apresentação de resultados", d: "Workshop executivo com o RH, definição conjunta do plano de ação." },
            { n: "04", t: "Acompanhamento contínuo", d: "Pulses mensais, revisão trimestral, e novo COPSOQ anual para conformidade." },
          ].map(s => (
            <div key={s.n} style={{ padding: 22, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 32, color: "var(--health)", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 14 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6, lineHeight: 1.5 }}>{s.d}</div>
            </div>
          ))}
        </div>

        {/* QUOTE / about consultant */}
        <div style={{ padding: 40, background: "var(--surface-sage)", borderRadius: 24, marginBottom: 48, display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "center" }}>
          <div style={{ width: 100, height: 100, borderRadius: 999, background: "var(--health-deep)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 40 }}>CG</div>
          <div>
            <p className="display" style={{ fontSize: 22, fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.4, color: "var(--ink)" }}>
              Em 14 anos atendendo empresas como a sua, vi quanto a saúde mental impacta turnover e produtividade. Estou aqui para fazer a NR-1 trabalhar a favor de <strong>{empresa}</strong> — não contra.
            </p>
            <div style={{ marginTop: 14, fontSize: 13, color: "var(--ink-soft)" }}>
              <strong>Caio Guedes</strong> · Consultor credenciado Menctor · CRP 06/12345
            </div>
          </div>
        </div>

        {/* PERGUNTAS FREQUENTES */}
        <h2 className="display" style={{ fontSize: 32, margin: "0 0 24px" }}>Perguntas frequentes</h2>
        <div style={{ display: "grid", gap: 10, marginBottom: 48 }}>
          {[
            { q: "O diagnóstico atende à fiscalização da NR-1?", a: "Sim. O COPSOQ II é o instrumento validado internacionalmente e aceito pelos auditores. Todos os relatórios saem prontos para apresentação, com plano de ação documentado e evidências de acompanhamento." },
            { q: "Os colaboradores são identificados nas respostas?", a: "Não. As respostas são anônimas e agregadas por setor (mínimo de respondentes por grupo). A confidencialidade é garantida em contrato, em conformidade com a LGPD." },
            { q: `Quanto tempo a ${empresa} leva para estar em conformidade?`, a: "O onboarding leva até 7 dias e o primeiro diagnóstico é concluído em até 14 dias. Ou seja: em cerca de 3 semanas a empresa já possui o mapeamento formal exigido pela norma." },
            { q: "O que acontece após o aceite desta proposta?", a: "Você recebe o contrato digital para assinatura no mesmo link. Assim que assinado, agendamos a reunião de implantação e liberamos o portal para sua equipe." },
          ].map((f, i) => (
            <details key={i} className="card" style={{ padding: "18px 24px", cursor: "pointer" }}>
              <summary style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                {f.q}
                <Icon name="chevron-down" size={15} color="var(--ink-muted)" />
              </summary>
              <p style={{ margin: "12px 0 0", fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.6 }}>{f.a}</p>
            </details>
          ))}
        </div>

        {/* ACTION BAR — real accept that signals pipeline */}
        <div id="accept-success" className="card" style={{ padding: 32, background: aceito ? "var(--health-deep)" : "var(--ink)", color: "#FAF8F2", borderRadius: 24, transition: "background 240ms ease" }}>
          {!aceito ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
                <div>
                  <div className="eyebrow" style={{ color: "rgba(250,248,242,0.6)" }}>Pronto para começar?</div>
                  <h2 className="display" style={{ fontSize: 32, margin: "8px 0 0", color: "#FAF8F2", fontWeight: 400 }}>Aceite a proposta para liberar a etapa de contrato.</h2>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-ghost" style={{ height: 44, color: "#FAF8F2", borderColor: "rgba(250,248,242,0.3)", padding: "0 18px" }}>
                    Quero conversar
                  </button>
                  <button onClick={handleAccept} className="btn btn-accent" style={{ height: 44, fontSize: 14, padding: "0 22px" }}>
                    <Icon name="check" size={16} /> Aceitar proposta
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(250,248,242,0.12)", fontSize: 12, color: "rgba(250,248,242,0.6)", display: "flex", gap: 18 }}>
                <span>Proposta válida até {validaAte.toLocaleDateString("pt-BR")}</span>
                <span>·</span>
                <span>Ao aceitar, o consultor é notificado automaticamente e o contrato é liberado no pipeline</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ width: 78, height: 78, borderRadius: 999, background: "rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Icon name="check" size={42} color="#fff" strokeWidth={3} />
              </div>
              <h2 className="display" style={{ fontSize: 34, margin: "0 0 10px", color: "#fff", fontWeight: 400 }}>Proposta aceita com sucesso!</h2>
              <p style={{ margin: "0 auto", maxWidth: 520, color: "rgba(250,248,242,0.85)", fontSize: 15.5, lineHeight: 1.5 }}>
                Obrigado, {contato}. Sua aceitação foi registrada em {acceptedAt ? new Date(acceptedAt).toLocaleString("pt-BR") : "agora"}.<br />
                O consultor recebeu a notificação e a etapa <strong>Contrato</strong> já está liberada no fluxo.
              </p>
              <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: 999 }}>
                <Icon name="send" size={13} /> Aguardando envio do contrato
              </div>
            </div>
          )}
        </div>

        {/* extra confirmation note */}
        {aceito && (
          <div style={{ textAlign: "center", marginTop: 22, fontSize: 12.5, color: "var(--ink-muted)" }}>
            Você pode fechar esta página. O time Menctor entrará em contato em breve.
          </div>
        )}

        {/* rodapé institucional */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12, color: "var(--ink-faint)" }}>
          <span>Menctor · Lector Tecnologia — Plataforma de saúde psicossocial e conformidade NR-1</span>
          <span>Proposta PRP-{String(card?.id || "2026").slice(-6).toUpperCase()} · emitida em {dataFmt(emitidaEm)}</span>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="card" style={{ padding: 24 }}>
    <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
      <Icon name={icon} size={18} strokeWidth={1.8}/>
    </span>
    <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.55 }}>{desc}</div>
  </div>
);

Object.assign(window, { PortalPropostaScreen });
