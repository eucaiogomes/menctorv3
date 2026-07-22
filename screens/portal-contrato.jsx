/* global React, Icon, Logo */

// ════════════════════════════════════════════════════════════
// PORTAL DE CONTRATO — external client-facing page (personalized via link)
// Client opens ?contrato=CARD_ID → sees the full contract (partes, cláusulas)
// and SIGNS digitally (nome completo + aceite dos termos + protocolo).
// Também é renderizado em escala reduzida dentro da etapa 3 do roadmap
// via props previewCard/previewAccepted (preview 100% fiel ao link).
// ════════════════════════════════════════════════════════════

const loadContractCard = async (id) => {
  if (!id) return null;
  // 1) Snapshot saved when consultant generated the link
  try {
    const snap = window.localStorage.getItem(`MENCTOR_CONTRACT_${id}`);
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

const saveContractAcceptance = (card, assinante) => {
  if (!card || !card.id) return;
  const payload = {
    id: card.id,
    empresa: card.empresa,
    acceptedAt: new Date().toISOString(),
    valor: card.valor,
    funcionarios: card.funcionarios,
    vigencia: card.vigencia || "12",
    assinante: assinante || card.contato || "",
    protocolo: `MCT-${Date.now().toString(36).toUpperCase()}`,
  };
  try {
    window.localStorage.setItem(`MENCTOR_CONTRACT_ACCEPTED_${card.id}`, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("menctor:contract-accepted", { detail: payload }));
  } catch (e) {}
  return payload;
};

const PortalContratoScreen = ({ contratoId, onExit, previewCard, previewAccepted }) => {
  const [card, setCard] = React.useState(previewCard || null);
  const [loading, setLoading] = React.useState(!previewCard);
  const [assinado, setAssinado] = React.useState(!!previewAccepted);
  const [signedAt, setSignedAt] = React.useState(null);
  const [signInfo, setSignInfo] = React.useState(null);

  // Campos da assinatura digital
  const [nomeAssinante, setNomeAssinante] = React.useState("");
  const [concordo, setConcordo] = React.useState(false);

  // Modo preview (embutido no roadmap): dados vêm por prop e atualizam ao vivo
  React.useEffect(() => {
    if (previewCard) {
      setCard(previewCard);
      setLoading(false);
      setAssinado(!!previewAccepted);
      if (previewCard.contato && !nomeAssinante) setNomeAssinante(previewCard.contato);
    }
  }, [previewCard, previewAccepted]);

  // Load personalized data for this link
  React.useEffect(() => {
    if (previewCard) return; // preview: sem carregamento assíncrono
    let alive = true;
    (async () => {
      setLoading(true);
      const id = contratoId || new URLSearchParams(window.location.search).get("contrato");
      const data = await loadContractCard(id);
      if (!alive) return;
      if (data) {
        setCard(data);
        if (data.contato) setNomeAssinante(data.contato);
        // Check if already signed (reopen link)
        try {
          const acc = window.localStorage.getItem(`MENCTOR_CONTRACT_ACCEPTED_${data.id || id}`);
          if (acc) {
            const p = JSON.parse(acc);
            setAssinado(true);
            setSignedAt(p.acceptedAt);
            setSignInfo(p);
          }
        } catch (e) {}
      } else {
        // graceful demo fallback
        setCard({
          id: "demo-ctr",
          empresa: "Norte Fintech",
          contato: "Caio Barbosa",
          email: "caio@nortefintech.com.br",
          funcionarios: 180,
          valor: 2900,
          vigencia: "12",
          inicio: "01/07/2026",
        });
        setNomeAssinante("Caio Barbosa");
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [contratoId, previewCard]);

  const empresa = card?.empresa || "sua empresa";
  const valor = Number(card?.valor || 2900);
  const funcs = Number(card?.funcionarios || 180);
  const vigencia = card?.vigencia || "12";
  const inicio = card?.inicio || "na data da assinatura";
  const contato = card?.contato || "gestor(a)";
  const numContrato = `CTR-${String(card?.id || "2026").slice(-6).toUpperCase()}`;

  const podeAssinar = nomeAssinante.trim().length >= 5 && concordo;

  const handleSign = () => {
    if (!card || previewCard || !podeAssinar) return;
    const res = saveContractAcceptance(card, nomeAssinante.trim());
    setAssinado(true);
    setSignedAt(res.acceptedAt);
    setSignInfo(res);
    // small celebration pulse
    setTimeout(() => {
      const el = document.getElementById("sign-success");
      if (el) el.style.transform = "scale(1.02)";
      setTimeout(() => { if (el) el.style.transform = "scale(1)"; }, 180);
    }, 60);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--canvas)" }}>
        <div style={{ textAlign: "center", color: "var(--ink-muted)" }}>
          <div style={{ marginBottom: 12 }}>Carregando contrato personalizado...</div>
          <div style={{ width: 28, height: 3, background: "var(--line)", borderRadius: 999, overflow: "hidden", margin: "0 auto" }}>
            <div style={{ width: "40%", height: "100%", background: "var(--health)", animation: "pulse 1.2s linear infinite" }} />
          </div>
        </div>
      </div>
    );
  }

  const fmt = (n) => Number(n || 0).toLocaleString("pt-BR");
  const ticket = funcs ? (valor / funcs) : 16.11;
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  // Qualificação da contratante com os dados reais disponíveis
  const contratanteCampos = [
    { label: "Razão social", value: card?.empresa },
    { label: "CNPJ", value: card?.cnpj },
    { label: "Responsável legal", value: card?.contato },
    { label: "E-mail", value: card?.email },
    { label: "Telefone", value: card?.telefone },
    { label: "Segmento", value: card?.segmento },
  ].filter(c => c.value);

  // Cláusulas geradas com os dados reais do contrato
  const clausulas = [
    {
      titulo: "Cláusula 1ª — Do objeto",
      texto: `O presente contrato tem por objeto a prestação de serviços de gestão de riscos psicossociais pela CONTRATADA à CONTRATANTE (${empresa}), compreendendo a aplicação do diagnóstico COPSOQ II e DRPS, portal do colaborador personalizado, trilhas de aprendizado, pulse surveys mensais, relatórios executivos e plano de ação, em conformidade com a Norma Regulamentadora nº 1 (NR-1).`,
    },
    {
      titulo: "Cláusula 2ª — Da abrangência",
      texto: `Os serviços cobrem até ${fmt(funcs)} colaboradores da CONTRATANTE${card?.cidades ? `, nas localidades de ${card.cidades}` : ""}${card?.unidades && String(card.unidades) !== "1" ? `, distribuídos em ${card.unidades} unidade(s)` : ""}. Alterações relevantes no quadro de colaboradores poderão ser objeto de aditivo contratual.`,
    },
    {
      titulo: "Cláusula 3ª — Da vigência",
      texto: `O contrato vigorará por ${vigencia} meses, com início ${inicio === "na data da assinatura" ? "na data da assinatura digital deste instrumento" : `em ${inicio}`}, renovando-se automaticamente por iguais períodos, salvo manifestação em contrário de qualquer das partes com antecedência mínima de 30 (trinta) dias.`,
    },
    {
      titulo: "Cláusula 4ª — Do valor e forma de pagamento",
      texto: `Pela prestação dos serviços, a CONTRATANTE pagará à CONTRATADA o valor mensal de R$ ${fmt(valor)} (equivalente a R$ ${ticket.toFixed(2).replace(".", ",")} por colaborador/mês), totalizando R$ ${fmt(valor * Number(vigencia))} no período de vigência. O pagamento será realizado por boleto ou transferência até o 5º dia útil de cada mês.`,
    },
    {
      titulo: "Cláusula 5ª — Da confidencialidade e proteção de dados (LGPD)",
      texto: "As respostas dos colaboradores aos diagnósticos são anônimas e tratadas de forma agregada. As partes obrigam-se a manter sigilo sobre todos os dados de saúde e informações estratégicas a que tiverem acesso, em conformidade com a Lei nº 13.709/2018 (LGPD), permanecendo esta obrigação após o término do contrato.",
    },
    {
      titulo: "Cláusula 6ª — Das obrigações das partes",
      texto: "A CONTRATADA compromete-se a disponibilizar a plataforma, aplicar os diagnósticos, emitir os relatórios nos prazos acordados e prestar suporte consultivo. A CONTRATANTE compromete-se a viabilizar a comunicação interna, indicar um responsável pelo projeto e efetuar os pagamentos nas datas ajustadas.",
    },
    {
      titulo: "Cláusula 7ª — Da rescisão",
      texto: "O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias, sem prejuízo das obrigações vencidas. O descumprimento de cláusula essencial autoriza a rescisão imediata pela parte prejudicada.",
    },
    {
      titulo: "Cláusula 8ª — Do foro",
      texto: "Fica eleito o Foro da Comarca de Curitiba/PR para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.",
    },
  ];

  return (
    <div style={{ background: "var(--canvas)", minHeight: "100vh" }}>
      {/* browser bar */}
      <div style={{
        background: "var(--surface-2)", borderBottom: "1px solid var(--line)",
        padding: "10px 28px", display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "var(--ink-muted)"
      }}>
        <Icon name="globe" size={14} />
        <span>menctor.com.br/contrato/{(empresa || "cliente").toLowerCase().replace(/\s+/g, "-").slice(0, 22)}</span>
        <span style={{ marginLeft: "auto" }}>Visão do cliente · assinatura de contrato</span>
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
            <span>Contrato nº <strong style={{ color: "var(--ink)" }}>{numContrato}</strong></span>
            <span style={{ color: "var(--line)" }}>|</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: assinado ? "var(--surface-sage)" : "var(--canvas-warm)", color: assinado ? "var(--health-deep)" : "var(--ink-soft)", fontWeight: 600, fontSize: 12 }}>
              <Icon name={assinado ? "check" : "lock"} size={13} /> {assinado ? "Assinado digitalmente" : "Aguardando assinatura"}
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 48px 80px" }}>
        {/* hero personalized */}
        <div style={{ marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 14, color: "var(--health-deep)" }}>Contrato de prestação de serviços para {empresa}</div>
          <h1 className="display" style={{ fontSize: 58, lineHeight: 1, margin: 0, maxWidth: 820 }}>
            Formalize a parceria.<br/>Saúde psicossocial e<br/><em style={{ fontStyle: "italic", color: "var(--health-deep)" }}>conformidade NR-1 garantidas.</em>
          </h1>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", maxWidth: 620, marginTop: 24, lineHeight: 1.55 }}>
            Olá, <strong>{contato}</strong>. Este é o contrato personalizado para {empresa}. Revise as condições, as partes e as cláusulas abaixo — a assinatura é 100% digital e leva menos de um minuto.
          </p>
        </div>

        {/* SUMMARY — dynamic */}
        <div className="card" style={{ padding: 36, marginBottom: 32, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 28 }}>
          <div>
            <div className="eyebrow">Investimento mensal</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 48, color: "var(--ink)", lineHeight: 1, marginTop: 8 }}>R$ {fmt(valor)}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>R$ {ticket.toFixed(2).replace(".", ",")} / colaborador</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 28 }}>
            <div className="eyebrow">Colaboradores</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 48, color: "var(--ink)", lineHeight: 1, marginTop: 8 }}>{fmt(funcs)}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>cobertos pelo contrato</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 28 }}>
            <div className="eyebrow">Vigência</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 48, color: "var(--ink)", lineHeight: 1, marginTop: 8 }}>{vigencia}<span style={{ fontSize: 22, color: "var(--ink-muted)" }}> meses</span></div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>Renovável automaticamente</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 28 }}>
            <div className="eyebrow">Valor total</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 34, color: "var(--health-deep)", lineHeight: 1.1, marginTop: 10 }}>R$ {fmt(valor * Number(vigencia))}</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>Início {inicio}</div>
          </div>
        </div>

        {/* PARTES DO CONTRATO — dados reais da contratante */}
        <h2 className="display" style={{ fontSize: 32, margin: "0 0 20px" }}>Partes do contrato</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48 }}>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="users" size={16} strokeWidth={1.8}/>
              </span>
              <div>
                <div className="eyebrow" style={{ color: "var(--health-deep)" }}>Contratante</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{empresa}</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {contratanteCampos.map(c => (
                <div key={c.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5, paddingBottom: 8, borderBottom: "1px dashed var(--line)" }}>
                  <span style={{ color: "var(--ink-muted)" }}>{c.label}</span>
                  <span style={{ fontWeight: 600, color: "var(--ink)", textAlign: "right" }}>{c.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5 }}>
                <span style={{ color: "var(--ink-muted)" }}>Colaboradores cobertos</span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{fmt(funcs)}</span>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="shield" size={16} strokeWidth={1.8}/>
              </span>
              <div>
                <div className="eyebrow" style={{ color: "var(--health-deep)" }}>Contratada</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Menctor · Lector Tecnologia</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Atividade", "Plataforma de saúde psicossocial e conformidade NR-1"],
                ["Consultor responsável", "Caio Guedes · CRP 06/12345"],
                ["Suporte", "suporte@menctor.com.br"],
                ["Sede", "Curitiba/PR"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5, paddingBottom: 8, borderBottom: "1px dashed var(--line)" }}>
                  <span style={{ color: "var(--ink-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--ink)", textAlign: "right" }}>{value}</span>
                </div>
              ))}
              <div style={{ fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                Responsável técnica pela aplicação dos instrumentos COPSOQ II e DRPS e pela emissão dos relatórios de conformidade.
              </div>
            </div>
          </div>
        </div>

        {/* CLÁUSULAS DO CONTRATO — documento com dados reais */}
        <h2 className="display" style={{ fontSize: 32, margin: "0 0 20px" }}>Cláusulas do contrato</h2>
        <div className="card" style={{ padding: "36px 44px", marginBottom: 48, background: "var(--surface)" }}>
          <div style={{ textAlign: "center", marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 21, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              Contrato de Prestação de Serviços de Gestão de Riscos Psicossociais
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>
              Instrumento nº {numContrato} · {empresa}{card?.cnpj ? ` · CNPJ ${card.cnpj}` : ""}
            </div>
          </div>
          <div style={{ display: "grid", gap: 22 }}>
            {clausulas.map((c, i) => (
              <div key={i}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{c.titulo}</div>
                <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7, textAlign: "justify" }}>{c.texto}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)", fontSize: 12.5, color: "var(--ink-muted)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span>E por estarem justas e contratadas, as partes firmam o presente instrumento por meio de assinatura digital.</span>
            <span>Curitiba/PR, {hoje}.</span>
          </div>
        </div>

        {/* what's included / escopo */}
        <h2 className="display" style={{ fontSize: 32, margin: "0 0 20px" }}>Escopo do contrato</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48 }}>
          <ContractFeatureCard icon="pulse" title="Diagnóstico COPSOQ II + NR-1"
            desc="Aplicação completa, relatórios executivos e plano de ação com revisão trimestral." />
          <ContractFeatureCard icon="shield" title="Conformidade regulatória"
            desc="Entregáveis prontos para auditoria e fiscalização do Ministério do Trabalho." />
          <ContractFeatureCard icon="users" title="Portal do colaborador"
            desc="Acesso personalizado para toda a equipe com trilhas de aprendizado e pulse surveys." />
          <ContractFeatureCard icon="book" title="Acompanhamento contínuo"
            desc="6 trilhas, pulses mensais, dashboards por setor e suporte consultivo durante a vigência." />
        </div>

        {/* timeline / próximos passos */}
        <h2 className="display" style={{ fontSize: 32, margin: "0 0 20px" }}>Após a assinatura</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 48, position: "relative" }}>
          {[
            { n: "01", t: "Onboarding", d: "Reunião de implantação (até 7 dias) e configuração do portal com sua marca." },
            { n: "02", t: "Sensibilização", d: "Palestra + trilhas liberadas para os colaboradores." },
            { n: "03", t: "Primeiro diagnóstico", d: "COPSOQ II aplicado em até 14 dias após o kickoff." },
            { n: "04", t: "Resultados e plano", d: "Workshop executivo + plano de ação documentado." },
          ].map(s => (
            <div key={s.n} style={{ padding: 22, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)" }}>
              <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 32, color: "var(--health)", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 14 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6, lineHeight: 1.5 }}>{s.d}</div>
            </div>
          ))}
        </div>

        {/* ASSINATURA DIGITAL — nome + aceite + protocolo */}
        <div id="sign-success" className="card" style={{ padding: 32, background: assinado ? "var(--health-deep)" : "var(--ink)", color: "#FAF8F2", borderRadius: 24, transition: "background 240ms ease" }}>
          {!assinado ? (
            <>
              <div className="eyebrow" style={{ color: "rgba(250,248,242,0.6)" }}>Assinatura digital</div>
              <h2 className="display" style={{ fontSize: 30, margin: "8px 0 20px", color: "#FAF8F2", fontWeight: 400 }}>Assine o contrato para iniciar o projeto.</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "end" }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "rgba(250,248,242,0.7)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    Nome completo do signatário
                  </label>
                  <input
                    value={nomeAssinante}
                    onChange={e => setNomeAssinante(e.target.value)}
                    placeholder="Digite seu nome completo"
                    style={{
                      width: "100%", height: 48, padding: "0 16px", borderRadius: 10,
                      border: "1px solid rgba(250,248,242,0.25)", background: "rgba(250,248,242,0.08)",
                      color: "#FAF8F2", fontSize: 16, fontFamily: "var(--display)", letterSpacing: "0.02em"
                    }}
                  />
                </div>
                <button
                  onClick={handleSign}
                  disabled={!podeAssinar}
                  className="btn btn-accent"
                  style={{ height: 48, fontSize: 14.5, padding: "0 26px", opacity: podeAssinar ? 1 : 0.45, cursor: podeAssinar ? "pointer" : "not-allowed" }}
                >
                  <Icon name="edit" size={16} /> Assinar contrato
                </button>
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, fontSize: 13, color: "rgba(250,248,242,0.85)", cursor: "pointer", lineHeight: 1.5 }}>
                <input type="checkbox" checked={concordo} onChange={e => setConcordo(e.target.checked)} style={{ marginTop: 3 }} />
                <span>Declaro que li e concordo com todas as cláusulas deste contrato, e que possuo poderes para representar <strong>{empresa}</strong> neste ato.</span>
              </label>

              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(250,248,242,0.12)", fontSize: 12, color: "rgba(250,248,242,0.6)", display: "flex", gap: 18, flexWrap: "wrap" }}>
                <span>Contrato {numContrato} · válido por 30 dias</span>
                <span>·</span>
                <span>A assinatura registra data, hora e protocolo — o consultor é notificado automaticamente</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ width: 78, height: 78, borderRadius: 999, background: "rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Icon name="check" size={42} color="#fff" strokeWidth={3} />
              </div>
              <h2 className="display" style={{ fontSize: 34, margin: "0 0 10px", color: "#fff", fontWeight: 400 }}>Contrato assinado com sucesso!</h2>
              <p style={{ margin: "0 auto", maxWidth: 560, color: "rgba(250,248,242,0.85)", fontSize: 15.5, lineHeight: 1.5 }}>
                Obrigado, {signInfo?.assinante || contato}. Sua assinatura foi registrada em {signedAt ? new Date(signedAt).toLocaleString("pt-BR") : "agora"}.<br />
                O consultor recebeu a notificação e a etapa <strong>Onboarding</strong> já está liberada.
              </p>
              <div style={{ marginTop: 20, display: "inline-flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                {signInfo?.assinante && (
                  <div style={{ fontFamily: "var(--display)", fontSize: 26, fontStyle: "italic", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.4)", padding: "0 24px 6px" }}>
                    {signInfo.assinante}
                  </div>
                )}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: 999 }}>
                  <Icon name="lock" size={13} /> Protocolo {signInfo?.protocolo || numContrato} · {empresa}
                </div>
              </div>
            </div>
          )}
        </div>

        {assinado && (
          <div style={{ textAlign: "center", marginTop: 22, fontSize: 12.5, color: "var(--ink-muted)" }}>
            Você pode fechar esta página. Em breve entraremos em contato para o kickoff.
          </div>
        )}

        {/* rodapé institucional */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12, color: "var(--ink-faint)" }}>
          <span>Menctor · Lector Tecnologia — Plataforma de saúde psicossocial e conformidade NR-1</span>
          <span>Contrato {numContrato} · gerado em {hoje}</span>
        </div>
      </main>
    </div>
  );
};

const ContractFeatureCard = ({ icon, title, desc }) => (
  <div className="card" style={{ padding: 24 }}>
    <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
      <Icon name={icon} size={18} strokeWidth={1.8}/>
    </span>
    <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.55 }}>{desc}</div>
  </div>
);

Object.assign(window, { PortalContratoScreen });
