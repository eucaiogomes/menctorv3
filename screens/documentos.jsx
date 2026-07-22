/* global React, CLIENTES */
const { useState: useDocState, useEffect: useDocEffect } = React;

// ════════════════════════════════════════════════════════════
// DOCUMENTOS — Contrato NR-01 + Proposta Comercial
// Identidade própria (navy/orange editorial) — independente do app
// ════════════════════════════════════════════════════════════

const DOC_DRAFT_KEY = (token) => `MENCTOR_DOC_DRAFT_${token}`;
const DOC_SIGN_KEY = (key) => `MENCTOR_SIGN_${key}`;

const fmtBRL = (v) => {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
};

// ── Modelo de precificação — taxa por colaborador, com desconto por volume ──
const FAIXAS_PRECO_COLAB = [
  { min: 0,   max: 100,      taxa: 19.90 },
  { min: 101, max: 300,      taxa: 16.90 },
  { min: 301, max: 700,      taxa: 14.90 },
  { min: 701, max: Infinity, taxa: 11.90 },
];
const VALOR_MINIMO_MENSAL = 990;

// Calcula o investimento mensal a partir do número de colaboradores.
// Retorna também a taxa aplicada e o bruto (antes do piso mínimo) para exibir a conta na proposta.
const calcularInvestimento = (colaboradores) => {
  const n = Number(colaboradores) || 0;
  const faixa = FAIXAS_PRECO_COLAB.find(f => n >= f.min && n <= f.max) || FAIXAS_PRECO_COLAB[0];
  const bruto = n * faixa.taxa;
  const total = Math.max(VALOR_MINIMO_MENSAL, bruto);
  return { colaboradores: n, taxa: faixa.taxa, bruto, total, aplicouMinimo: total > bruto };
};

// Resolve os dados do documento: cliente existente (?cliente=id) ou rascunho do wizard (?d=token)
const resolveDocData = (params = {}) => {
  if (params.d) {
    try {
      const raw = window.localStorage.getItem(DOC_DRAFT_KEY(params.d));
      if (raw) {
        const d = JSON.parse(raw);
        const investimento = calcularInvestimento(d.colaboradores);
        return {
          key: `draft-${params.d}`,
          empresa: d.nome || d.razao || "Empresa",
          razao: d.razao || d.nome || "Razão social a definir",
          cnpj: d.cnpj || "00.000.000/0000-00",
          cidade: d.cidade || "Curitiba", estado: d.estado || "PR",
          segmento: d.segmento || "—",
          colaboradores: d.colaboradores || "—",
          contatoNome: d.contatoNome || "Representante legal",
          contatoCargo: d.contatoCargo || "",
          contatoEmail: d.contatoEmail || "",
          contatoFone: d.contatoWhats || d.contatoFone || "",
          endereco: [d.cidade, d.estado].filter(Boolean).join(", ") || "Endereço a definir",
          valor: investimento.total,
          investimento,
          semanas: d.semanas || 24,
          inicioProj: d.inicioProj || "",
          credNome: d.credNome || "Consultor Menctor",
          numero: d.numero || `${String(new Date().getMonth() + 1).padStart(2, "0")}-01.${new Date().getFullYear()}`,
        };
      }
    } catch (e) { /* ignore */ }
  }
  const c = CLIENTES.find(x => x.id === params.cliente) || CLIENTES[0];
  const investimento = calcularInvestimento(c.employees);
  return {
    key: c.id,
    empresa: c.name, razao: `${c.name} LTDA`, cnpj: c.cnpj || "00.000.000/0000-00",
    cidade: "Curitiba", estado: "PR",
    segmento: c.sector, colaboradores: c.employees,
    contatoNome: c.contact, contatoCargo: "", contatoEmail: "", contatoFone: "",
    endereco: "Curitiba, PR",
    valor: investimento.total,
    investimento,
    semanas: 24, inicioProj: "",
    credNome: "Caio Guedes",
    numero: `${String(new Date().getMonth() + 1).padStart(2, "0")}-01.${new Date().getFullYear()}`,
  };
};

// ── tokens visuais dos documentos (independentes do app) — premium editorial ——
const DOCS_CSS = `
  .doc-root { background: #F8F7F4; min-height: 100vh; font-family: Georgia, 'Times New Roman', serif; color: #1F2535; }
  .doc-sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Text', system-ui, sans-serif; }
  .doc-mono { font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', Consolas, monospace; }
  .doc-page { max-width: 880px; margin: 0 auto; background: #111; box-shadow: 0 1px 3px rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden; border: 1px solid #222; }
  .doc-toolbar { position: sticky; top: 0; z-index: 50; background: rgba(248,247,244,0.96); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,32,77,0.08); }
  .doc-btn { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 18px; border-radius: 999px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; transition: all .15s ease; letter-spacing: -.01em; }
  .doc-btn:hover { transform: translateY(-1px); filter: brightness(1.06); }
  .doc-btn-primary { background: #F66B0A; color: #fff; box-shadow: 0 2px 8px rgba(246,107,10,0.3); }
  .doc-btn-navy { background: #00204D; color: #fff; }
  .doc-btn-ghost { background: transparent; color: #00204D; border: 1px solid rgba(0,32,77,0.2); }
  .doc-input { height: 42px; padding: 0 14px; border: 1px solid rgba(0,32,77,0.18); border-radius: 10px; font-size: 14px; width: 100%; background: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #00204D; }
  .doc-input:focus { outline: 2px solid #F66B0A; outline-offset: -1px; border-color: transparent; }

  /* Premium proposal styling */
  .prop-section { padding: 46px 68px; border-bottom: 1px solid #EDEAE3; }
  .prop-section:last-child { border-bottom: none; }
  .prop-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .prop-num { 
    display: inline-flex; align-items: center; justify-content: center; 
    font-size: 11px; font-weight: 800; letter-spacing: .11em; 
    color: #C25C0F; background: #FFF1E6; padding: 1px 10px; border-radius: 999px; min-width: 28px; height: 20px;
  }
  .prop-title { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -.025em; color: #00204D; }
  
  .prop-lead { font-size: 15.5px; line-height: 1.68; color: #2F374A; max-width: 62ch; }
  .prop-lead strong { color: #00204D; font-weight: 700; }

  .doc-pill { 
    display: inline-flex; align-items: center; padding: 5px 14px; border-radius: 999px; 
    font-size: 12.5px; font-weight: 700; letter-spacing: .02em;
    background: #FFF6EF; color: #B85A16; border: 1px solid rgba(246,107,10,.2);
  }
  .doc-pill-alt { background: #F1F4F9; color: #3F4C67; border-color: rgba(0,32,77,.1); }

  .metric { font-family: var(--display, ui-monospace, monospace); font-variant-numeric: tabular-nums; }
  .metric-lg { font-size: 52px; font-weight: 800; line-height: 1; letter-spacing: -0.035em; color: #F66B0A; }
  .metric-md { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: #00204D; }

  .phase-card { 
    background: #F8F7F4; border: 1px solid #EDEAE3; border-radius: 14px; 
    padding: 20px 18px; transition: box-shadow .2s; 
  }
  .phase-card:hover { box-shadow: 0 4px 14px rgba(0,32,77,0.06); }
  .phase-num { font-size: 21px; font-weight: 800; letter-spacing: -.02em; color: #F66B0A; line-height: 1; margin-bottom: 8px; }

  .benefit-card { 
    background: #111; border: 1px solid #222; border-radius: 8px; padding: 22px 20px; 
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  .benefit-head { 
    font-size: 14.5px; font-weight: 800; color: #00204D; 
    padding-bottom: 9px; border-bottom: 2.5px solid #F66B0A; margin-bottom: 12px;
  }
  .benefit-item { font-size: 13.5px; line-height: 1.55; color: #364055; margin-bottom: 6px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 28px; }
  .info-row label { display: block; font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase; font-weight: 700; color: #8A93A6; }
  .info-row .val { font-size: 15px; font-weight: 600; color: #00204D; margin-top: 3px; line-height: 1.3; }

  .stat-big { text-align: left; }
  .stat-big .num { font-size: 62px; font-weight: 800; line-height: .92; letter-spacing: -0.04em; color: #F66B0A; }
  .stat-big .label { font-size: 11.5px; letter-spacing: .1em; text-transform: uppercase; font-weight: 700; color: #8A93A6; margin-top: 2px; }

  .act-item { 
    display: flex; align-items: flex-start; gap: 10px; font-size: 14.2px; color: #374155; 
    padding: 3px 0;
  }
  .act-item::before { content: "→"; color: #F66B0A; font-weight: 800; flex-shrink: 0; margin-top: 1px; }

  .doc-divider { height: 1px; background: linear-gradient(to right, transparent, #EDEAE3, transparent); margin: 8px 0; }

  @media print {
    .doc-toolbar, .no-print { display: none !important; }
    .doc-root { background: #000; }
    .doc-page { box-shadow: none; max-width: none; border-radius: 0; }
    .prop-section { padding: 32px 52px; break-inside: avoid; border-color: #ddd; }
    .phase-card, .benefit-card { box-shadow: none; border-color: #222; background: #111; }
  }
`;

const DocLabel = ({ children, color = "#8A93A6" }) => (
  <span className="doc-mono" style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color, fontWeight: 700 }}>{children}</span>
);

// ════════════════════════════════════════════════════════════
// CONTRATO — cláusulas parametrizadas
// ════════════════════════════════════════════════════════════
const buildContratoSections = (d) => ([
  { n: "I", title: "Objeto do contrato", clauses: [
    { label: "Cláusula 1ª — ", lead: "O presente contrato tem por objeto a prestação de serviços relacionados à gestão de riscos psicossociais previstos na Norma Regulamentadora nº 01 (NR-01), com foco no Gerenciamento de Riscos Ocupacionais (GRO): identificação, avaliação, gerenciamento e monitoramento dos riscos psicossociais, conforme legislação vigente e boas práticas de saúde mental organizacional." },
  ]},
  { n: "II", title: "Escopo do serviço", clauses: [
    { label: "Cláusula 2ª — ", lead: "Os serviços compreenderão, de forma integrada e contínua:", items: [
      "Apresentação técnica do processo de implantação da NR-01 à empresa;",
      "Diagnóstico organizacional dos riscos psicossociais;",
      "Aplicação de instrumentos de avaliação coletiva (questionários, entrevistas e levantamentos organizacionais);",
      "Análise técnica dos dados, com foco em riscos organizacionais, e não individuais;",
      "Elaboração de Relatório Técnico Geral;",
      "Construção de Plano de Ação Preventivo, alinhado ao PGR da empresa;",
      "Devolutiva técnica ao RH e à liderança;",
      "Treinamentos e orientações para gestores e colaboradores;",
      "Elaboração de materiais de apoio (manual do colaborador, orientações internas e materiais educativos);",
      "Acompanhamento e orientações estratégicas durante o período contratado.",
    ]},
  ]},
  { n: "III", title: "Da natureza da atuação", clauses: [
    { label: "Cláusula 3ª — ", lead: "Fica expressamente estabelecido que:", items: [
      "A CONTRATADA não realiza diagnóstico clínico, psicológico ou psiquiátrico;",
      "A atuação é preventiva, organizacional e institucional, voltada à segurança jurídica da empresa no cumprimento da NR-01;",
      "Não haverá identificação individual de colaboradores nos relatórios;",
      "Os resultados apresentados possuem caráter estatístico, coletivo e técnico.",
    ]},
  ]},
  { n: "IV", title: "Obrigações da contratada", clauses: [
    { label: "Cláusula 4ª — Responsabilidades. ", lead: "A CONTRATADA obriga-se a:", items: [
      "Executar os serviços conforme o escopo acordado;",
      "Atuar com ética, confidencialidade e responsabilidade técnica;",
      "Apresentar relatórios e devolutivas dentro dos prazos estabelecidos;",
      "Orientar a empresa quanto às boas práticas de prevenção;",
      "Garantir que todas as ações estejam alinhadas à legislação vigente.",
    ]},
  ]},
  { n: "V", title: "Obrigações da contratante", clauses: [
    { label: "Cláusula 5ª — Responsabilidades. ", lead: "A CONTRATANTE obriga-se a:", items: [
      "Disponibilizar as informações necessárias para a execução dos serviços;",
      "Facilitar o acesso da CONTRATADA aos setores e colaboradores envolvidos;",
      "Cumprir os prazos acordados para decisões e validações;",
      "Efetuar os pagamentos conforme pactuado.",
    ]},
  ]},
  { n: "VI", title: "Remuneração e reembolso", clauses: [
    { label: "Cláusula 6ª — ", lead: `A CONTRATADA fará jus ao recebimento de ${fmtBRL(d.valor)}, sendo 50% (cinquenta por cento) a título de entrada e o saldo remanescente devido na entrega do Relatório Técnico Geral. Não estão inclusos tributos, viagens, estadias, mobilização e refeições.` },
  ]},
  { n: "VII", title: "Da vigência", clauses: [
    { label: "Cláusula 7ª — ", lead: "O presente contrato terá vigência de 12 (doze) meses, iniciando-se na data de assinatura e encerrando-se ao término desse período, podendo ser renovado mediante acordo entre as partes." },
  ]},
  { n: "VIII", title: "Da confidencialidade", clauses: [
    { label: "Cláusula 8ª — ", lead: "Todas as informações obtidas durante a execução do contrato são confidenciais, não podendo ser divulgadas a terceiros sem autorização expressa da parte titular das informações." },
    { label: "", lead: "Sem o consentimento prévio, nenhuma das partes, seus agentes, representantes ou empregados poderão revelar a terceiros o fato de as informações terem sido disponibilizadas, de entendimentos ou negociações estarem sendo mantidos, nem quaisquer termos, condições ou fatos referentes a mercado, clientes, concorrentes e colaboradores." },
  ]},
  { n: "IX", title: "Da LGPD (Lei Geral de Proteção de Dados)", clauses: [
    { label: "Cláusula 9ª — ", lead: "As partes comprometem-se a cumprir integralmente a Lei nº 13.709/2018 (LGPD), observando que:", items: [
      "A CONTRATADA atuará como operadora de dados, tratando apenas informações estritamente necessárias;",
      "Dados sensíveis serão tratados com segurança, confidencialidade e finalidade específica;",
      "É vedado o compartilhamento de dados pessoais identificáveis com a empresa;",
      "Serão compartilhados apenas dados estatísticos, indicadores gerais e recomendações preventivas;",
      "Os dados serão armazenados de forma segura e descartados conforme os prazos legais.",
    ]},
  ]},
  { n: "X", title: "Da rescisão", clauses: [
    { label: "Cláusula 10ª — ", lead: "O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias, sem ônus adicional, sendo devidos apenas os valores proporcionais aos serviços já prestados." },
  ]},
  { n: "XI", title: "Da ausência de vínculo empregatício", clauses: [
    { label: "Cláusula 11ª — ", lead: "O presente contrato não gera vínculo empregatício entre as partes, sendo a CONTRATADA responsável por seus encargos fiscais e trabalhistas." },
  ]},
  { n: "XII", title: "Do foro", clauses: [
    { label: "Cláusula 12ª — ", lead: `Fica eleito o foro da Comarca de ${d.cidade || "Curitiba"}, Estado ${d.estado === "PR" ? "do Paraná" : `de ${d.estado || "PR"}`}, para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.` },
  ]},
]);

const ContratoDocPage = ({ params = {} }) => {
  const d = resolveDocData(params);
  const sections = buildContratoSections(d);
  const signKey = DOC_SIGN_KEY(d.key);

  const [signerName, setSignerName] = useDocState("");
  const [signerCpf, setSignerCpf] = useDocState("");
  const [agreed, setAgreed] = useDocState(false);
  const [signed, setSigned] = useDocState(null); // {signerName, signedAt, signatureId}

  useDocEffect(() => {
    try {
      const raw = window.localStorage.getItem(signKey);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.signed) setSigned(s);
      }
    } catch (e) { /* ignore */ }
  }, [signKey]);

  const fmtSignedAt = (iso) => {
    if (!iso) return "";
    const dt = new Date(iso);
    return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) +
      " às " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const onSign = () => {
    if (!signerName.trim() || signerName.trim().length < 3 || !agreed) return;
    const payload = {
      signed: true, signerName: signerName.trim(), signerCpf: signerCpf.trim(),
      signedAt: new Date().toISOString(),
      signatureId: "NR01-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Date.now().toString(36).toUpperCase(),
    };
    setSigned(payload);
    try { window.localStorage.setItem(signKey, JSON.stringify(payload)); } catch (e) { /* ignore */ }
  };

  const signDisabled = !signerName.trim() || signerName.trim().length < 3 || !agreed;

  return (
    <div className="doc-root">
      <style>{DOCS_CSS}</style>

      {/* Toolbar */}
      <div className="doc-toolbar doc-sans">
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#00204D", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>M</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#00204D" }}>Menctor · Gestão de Riscos Psicossociais</div>
              <div style={{ fontSize: 11, color: "#8A93A6" }}>Contrato de prestação de serviços · NR-01</div>
            </div>
          </div>
          <button className="doc-btn doc-btn-ghost" onClick={() => window.print()}>Salvar como PDF</button>
        </div>
      </div>

      <div style={{ padding: "40px 24px" }}>
        <div className="doc-page">
          {/* Cabeçalho */}
          <div style={{ borderBottom: "3px solid #00204D", paddingBottom: 28, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <DocLabel color="#F66B0A">Contrato Nº {d.numero} · Instrumento particular</DocLabel>
                <h1 className="doc-sans" style={{ margin: "12px 0 6px", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "#00204D", lineHeight: 1.1 }}>
                  Contrato de Prestação de Serviços
                </h1>
                <div className="doc-sans" style={{ fontSize: 16, color: "#F66B0A", fontWeight: 700 }}>Implantação NR-01 · Riscos Psicossociais</div>
              </div>
            </div>
          </div>

          {/* Partes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 36 }} className="doc-sans">
            <div style={{ padding: "18px 20px", background: "#111", borderRadius: 12, border: "1px solid rgba(0,32,77,0.08)" }}>
              <DocLabel>Contratada</DocLabel>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#00204D", margin: "8px 0 4px" }}>Menctor by Lector LTDA</div>
              <div style={{ fontSize: 12.5, color: "#5A6478", lineHeight: 1.55 }}>
                CNPJ 12.345.678/0001-12 · Curitiba/PR<br />
                Representada por {d.credNome}
              </div>
            </div>
            <div style={{ padding: "18px 20px", background: "#111", borderRadius: 12, border: "1px solid rgba(246,107,10,0.2)" }}>
              <DocLabel color="#F66B0A">Contratante</DocLabel>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#00204D", margin: "8px 0 4px" }}>{d.razao}</div>
              <div style={{ fontSize: 12.5, color: "#5A6478", lineHeight: 1.55 }}>
                CNPJ {d.cnpj} · {d.endereco}<br />
                Representada por {signed ? signed.signerName : d.contatoNome}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#3d4658", marginBottom: 36, fontStyle: "italic" }}>
            As partes acima qualificadas celebram o presente contrato de prestação de serviços, que se regerá pelas cláusulas e condições a seguir descritas.
          </p>

          {/* Cláusulas */}
          {sections.map(sec => (
            <section key={sec.n} style={{ marginBottom: 30 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid rgba(0,32,77,0.1)" }}>
                <span className="doc-mono" style={{ fontSize: 13, fontWeight: 700, color: "#F66B0A" }}>{sec.n}</span>
                <h2 className="doc-sans" style={{ margin: 0, fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "#00204D" }}>{sec.title}</h2>
              </div>
              {sec.clauses.map((cl, i) => (
                <div key={i} className="doc-clause">
                  <p><strong>{cl.label}</strong>{cl.lead}</p>
                  {cl.items && <ul>{cl.items.map((it, j) => <li key={j}>{it}</li>)}</ul>}
                </div>
              ))}
            </section>
          ))}

          {/* Testemunhas */}
          <section style={{ margin: "40px 0" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid rgba(0,32,77,0.1)" }}>
              <span className="doc-mono" style={{ fontSize: 13, fontWeight: 700, color: "#F66B0A" }}>XIII</span>
              <h2 className="doc-sans" style={{ margin: 0, fontWeight: 700, fontSize: 18, color: "#00204D" }}>Testemunhas</h2>
            </div>
            <p style={{ fontSize: 14.5, color: "#3d4658", margin: "0 0 20px" }}>
              E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor, na presença de 2 (duas) testemunhas.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[1, 2].map(n => (
                <div key={n}>
                  <div style={{ height: 34, borderBottom: "1px solid #00204D", marginBottom: 8 }} />
                  <DocLabel>Testemunha {n} · Nome / RG</DocLabel>
                </div>
              ))}
            </div>
          </section>

          {/* Assinatura eletrônica */}
          <section style={{ marginTop: 8, paddingTop: 30, borderTop: "2px solid #00204D" }} className="doc-sans">
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
              <span className="doc-mono" style={{ fontSize: 13, fontWeight: 700, color: "#F66B0A" }}>XIV</span>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: "#00204D" }}>Assinatura eletrônica</h2>
            </div>

            {!signed ? (
              <div className="no-print" style={{ background: "#111", borderRadius: 16, padding: "26px 28px", border: "1px solid rgba(0,32,77,0.1)" }}>
                <p style={{ fontSize: 14, color: "#3d4658", margin: "0 0 18px" }}>
                  Confirme seus dados para assinar eletronicamente este contrato como <strong>Contratante</strong>.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div>
                    <DocLabel>Nome completo</DocLabel>
                    <input className="doc-input" style={{ marginTop: 6 }} value={signerName} onChange={e => setSignerName(e.target.value)} placeholder={d.contatoNome} />
                  </div>
                  <div>
                    <DocLabel>CPF (opcional)</DocLabel>
                    <input className="doc-input" style={{ marginTop: 6 }} value={signerCpf} onChange={e => setSignerCpf(e.target.value)} placeholder="000.000.000-00" />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#3d4658", marginBottom: 18, cursor: "pointer" }}>
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: "#F66B0A" }} />
                  <span>Ao tocar em "Assinar contrato", concordo que esta assinatura eletrônica tem a mesma validade de uma assinatura manuscrita entre as partes.</span>
                </label>
                <button className="doc-btn doc-btn-primary" onClick={onSign} disabled={signDisabled} style={{ opacity: signDisabled ? 0.45 : 1, cursor: signDisabled ? "default" : "pointer" }}>
                  Assinar contrato
                </button>
              </div>
            ) : (
              <div style={{ background: "#111", borderRadius: 16, padding: "26px 28px", border: "1px solid rgba(47,125,111,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 999, background: "#2F7D6F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1F5A50" }}>Contrato assinado eletronicamente</span>
                </div>
                <p style={{ fontSize: 13.5, color: "#3d4658", margin: "0 0 6px" }}>
                  Assinado por <strong>{signed.signerName}</strong>{signed.signerCpf ? `, CPF ${signed.signerCpf}` : ""} em {fmtSignedAt(signed.signedAt)}.
                </p>
                <p className="doc-mono" style={{ fontSize: 12, color: "#8A93A6", margin: 0 }}>Código de verificação: {signed.signatureId}</p>
              </div>
            )}

            {/* Linhas de assinatura */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 34 }}>
              <div>
                <div style={{ height: 44, borderBottom: "1px solid #00204D", marginBottom: 8, display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
                  <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 18, color: "#00204D" }}>{d.credNome}</span>
                </div>
                <DocLabel>Contratada · Menctor by Lector</DocLabel>
              </div>
              <div>
                <div style={{ height: 44, borderBottom: "1px solid #00204D", marginBottom: 8, display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
                  {signed && <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 18, color: "#00204D" }}>{signed.signerName}</span>}
                </div>
                <DocLabel>Contratante · {d.razao}</DocLabel>
              </div>
            </div>
          </section>

          <div className="doc-sans" style={{ marginTop: 48, paddingTop: 18, borderTop: "1px solid rgba(0,32,77,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <DocLabel>Menctor · NR-01</DocLabel>
            <DocLabel>Documento particular · Foro da Comarca de {d.cidade || "Curitiba"}/{d.estado || "PR"}</DocLabel>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// PROPOSTA COMERCIAL — estrutura premium (14 capítulos)
// ════════════════════════════════════════════════════════════
const PropSection = ({ n, title, children, noBorder = false }) => (
  <section className="prop-section" style={noBorder ? { borderBottom: "none" } : undefined}>
    <div className="prop-head">
      <span className="prop-num">{n}</span>
      <h2 className="prop-title">{title}</h2>
    </div>
    {children}
  </section>
);

const PropostaDocPage = ({ params = {} }) => {
  const d = resolveDocData(params);
  const atividades = [
    "Reunião de alinhamento e sensibilização", "Entrevistas estruturadas com liderança",
    "Aplicação COPSOQ II + clima organizacional", "Mapeamento completo de riscos psicossociais",
    "Devolutiva executiva ao RH e diretoria", "Treinamento de gestores e colaboradores",
    "Manual do colaborador NR-01 personalizado", "Plano de ação priorizado + roadmap",
    "Acompanhamento e suporte pós-entrega",
  ];
  const fases = [
    { n: "01", t: "Diagnóstico & Levantamento", d: "Análise de documentos, indicadores e entrevistas estruturadas." },
    { n: "02", t: "Avaliação Psicossocial", d: "Aplicação de COPSOQ II validado e pesquisas de percepção." },
    { n: "03", t: "Devolutiva Estratégica", d: "Workshop com RH e líderes + definição de prioridades." },
    { n: "04", t: "Entrega & Roadmap", d: "Relatório técnico completo + plano de ação e manual." },
  ];
  const beneficios = [
    { titulo: "Legais", itens: ["Conformidade total com NR-01 atualizada", "Evidências técnicas para auditoria", "Redução significativa de passivos"] },
    { titulo: "Organizacionais", itens: ["Menos turnover e absenteísmo", "Clima e engajamento mais fortes", "Lideranças capacitadas"] },
    { titulo: "Estratégicos", itens: ["Dados reais para decisões", "Marca empregadora mais atrativa", "Base para certificações (Lei 14.831)"] },
  ];

  return (
    <div className="doc-root doc-sans">
      <style>{DOCS_CSS}</style>

      {/* Toolbar */}
      <div className="doc-toolbar doc-sans">
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "11px 26px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#00204D", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, letterSpacing: "-0.5px" }}>M</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#00204D", lineHeight: 1 }}>Menctor — Proposta Comercial</div>
              <div style={{ fontSize: 11, color: "#8A93A6", marginTop: 1 }}>{d.empresa} · NR-01 · Riscos Psicossociais</div>
            </div>
          </div>
          <button className="doc-btn doc-btn-primary" onClick={() => window.print()}>
            ↓ Baixar PDF
          </button>
        </div>
      </div>

      <div style={{ padding: "36px 20px 92px" }}>
        <div className="doc-page">

          {/* ==================== CAPA PREMIUM ==================== */}
          <div style={{ background: "#00204D", color: "#fff", padding: "66px 68px 52px", position: "relative", overflow: "hidden" }}>
            {/* accent glow */}
            <div style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, background: "radial-gradient(circle at 60% 30%, rgba(246,107,10,0.38), transparent 65%)" }} />
            
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <span className="doc-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>PROPOSTA COMERCIAL</span>
                <span style={{ height: 1, width: 42, background: "rgba(255,255,255,0.25)", marginLeft: 4 }} />
                <span className="doc-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#F66B0A", fontWeight: 700 }}>NR-01 • 2024/2025</span>
              </div>

              <h1 style={{ fontSize: 49, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 0.98, margin: "0 0 16px", maxWidth: "15ch" }}>
                Implantação<br />de <span style={{ color: "#F66B0A" }}>NR-01</span>
              </h1>

              <p style={{ fontSize: 16, lineHeight: 1.58, color: "rgba(255,255,255,0.82)", maxWidth: 510, marginBottom: 38 }}>
                Avaliação de riscos psicossociais com conformidade legal, segurança jurídica e ganhos mensuráveis de clima, produtividade e retenção.
              </p>

              {/* meta row */}
              <div style={{ display: "flex", gap: 42, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, opacity: .55, letterSpacing: ".08em", fontWeight: 700 }}>PROPOSTA Nº</div>
                  <div className="doc-mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 3, letterSpacing: "-.01em" }}>{d.numero}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, opacity: .55, letterSpacing: ".08em", fontWeight: 700 }}>PREPARADA PARA</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{d.empresa}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, opacity: .55, letterSpacing: ".08em", fontWeight: 700 }}>VIGÊNCIA LEGAL</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>Portaria MTE 1.419/2024</div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 01 DADOS ==================== */}
          <PropSection n="01" title="Dados da empresa">
            <div className="info-grid">
              {[
                ["Empresa", d.razao], ["CNPJ", d.cnpj],
                ["Contato", d.contatoNome + (d.contatoCargo ? ` · ${d.contatoCargo}` : "")],
                ["E-mail", d.contatoEmail || "—"],
                ["Telefone", d.contatoFone || "—"],
                ["Localização", d.endereco],
              ].map(([k, v]) => (
                <div key={k} className="info-row">
                  <label>{k}</label>
                  <div className="val">{v}</div>
                </div>
              ))}
            </div>
          </PropSection>

          {/* ==================== 02 OBJETIVO ==================== */}
          <PropSection n="02" title="Objetivo da proposta">
            <p className="prop-lead">
              Avaliação técnica completa dos <strong>fatores de risco psicossocial</strong> conforme NR-01 (Portaria 1.419/2024), 
              com geração de evidências, plano de ação e estrutura para o GRO/PGR da empresa.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
              {["Conformidade NR-01", "Segurança jurídica", "Resultados mensuráveis", "Suporte contínuo"].map((t, i) => (
                <span key={i} className="doc-pill">{t}</span>
              ))}
            </div>
          </PropSection>

          {/* ==================== 03 CONTEXTO ==================== */}
          <PropSection n="03" title="Contexto regulatório">
            <p className="prop-lead">
              Desde 26 de maio de 2025 a NR-01 exige que toda empresa realize a <strong>identificação, avaliação e controle dos riscos psicossociais</strong> 
              no Gerenciamento de Riscos Ocupacionais (GRO). A não conformidade pode gerar autuações, passivos e impacto na reputação.
            </p>
          </PropSection>

          {/* ==================== 04 PÚBLICO ==================== */}
          <PropSection n="04" title="Abrangência">
            <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
              <div className="stat-big">
                <div className="num">{d.colaboradores}</div>
                <div className="label">Colaboradores</div>
              </div>
              <div style={{ maxWidth: 430, fontSize: 15, lineHeight: 1.65, color: "#374155" }}>
                Diagnóstico aplicado a toda a força de trabalho da {d.empresa}, segmento {d.segmento || "da empresa"}. 
                Resultados agregados por setor, com total confidencialidade individual.
              </div>
            </div>
          </PropSection>

          {/* ==================== 05 ATIVIDADES ==================== */}
          <PropSection n="05" title="Atividades previstas">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 28px" }}>
              {atividades.map((a, i) => (
                <div key={i} className="act-item">
                  <span className="doc-mono" style={{ fontSize: 10.5, color: "#F66B0A", width: 18, fontWeight: 800, marginTop: "1px" }}>{(i + 1).toString().padStart(2, "0")}</span>
                  {a}
                </div>
              ))}
            </div>
          </PropSection>

          {/* ==================== 06 FASES ==================== */}
          <PropSection n="06" title="Estrutura do projeto — 4 fases claras">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {fases.map((f, idx) => (
                <div key={idx} className="phase-card">
                  <div className="phase-num">{f.n}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "#00204D", margin: "7px 0 4px" }}>{f.t}</div>
                  <div style={{ fontSize: 12.8, lineHeight: 1.5, color: "#4F5A73" }}>{f.d}</div>
                </div>
              ))}
            </div>
          </PropSection>

          {/* ==================== 07 BENEFÍCIOS ==================== */}
          <PropSection n="07" title="Benefícios em três dimensões">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {beneficios.map((b, idx) => (
                <div key={idx} className="benefit-card">
                  <div className="benefit-head">{b.titulo}</div>
                  {b.itens.map((it, i) => <div key={i} className="benefit-item">• {it}</div>)}
                </div>
              ))}
            </div>
          </PropSection>

          {/* ==================== 08 INVESTIMENTO ==================== */}
          <PropSection n="08" title="Prazo e investimento">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Prazo */}
              <div style={{ padding: "26px 28px", borderRadius: 16, background: "#111", border: "1px solid #EDEAE3" }}>
                <div style={{ fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", fontWeight: 700, color: "#8A93A6" }}>PRAZO DE EXECUÇÃO</div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 7 }}>
                  <span className="metric metric-md">{d.semanas}</span>
                  <span style={{ fontSize: 15, color: "#5A6478" }}>semanas</span>
                </div>
                <p style={{ margin: "12px 0 0", fontSize: 13, color: "#56647A", lineHeight: 1.5 }}>A partir da aprovação. Primeiro diagnóstico em até 14 dias após onboarding.</p>
              </div>

              {/* Investimento */}
              <div style={{ padding: "26px 28px", borderRadius: 16, background: "#00204D", color: "#fff" }}>
                <div style={{ fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>HONORÁRIOS MENSAIS</div>
                <div className="doc-mono" style={{ fontSize: 38, fontWeight: 800, color: "#F66B0A", margin: "8px 0 2px", lineHeight: 1 }}>{fmtBRL(d.valor)}</div>

                {d.investimento && d.investimento.colaboradores > 0 && (
                  <div style={{ fontSize: 12.2, color: "rgba(255,255,255,0.78)", marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                    <span>{d.investimento.colaboradores} colaboradores</span>
                    <span style={{ color: "#F66B0A" }}>×</span>
                    <span>{fmtBRL(d.investimento.taxa)}/colab</span>
                    <span style={{ color: "#F66B0A" }}>=</span>
                    <span style={{ fontWeight: 600 }}>{fmtBRL(d.investimento.bruto)}</span>
                    {d.investimento.aplicouMinimo && <span style={{ opacity: .55 }}> (piso mín.)</span>}
                  </div>
                )}
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginTop: 4, lineHeight: 1.45 }}>
                  50% de entrada • saldo na entrega do relatório. Não inclui tributos, viagens ou estadias.
                </div>
              </div>
            </div>
          </PropSection>

          {/* ==================== 09 COORDENAÇÃO ==================== */}
          <PropSection n="09" title="Coordenação da implantação">
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: "#00204D", color: "#fff", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {(d.credNome || "M")[0]}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#00204D" }}>{d.credNome || "Consultor Menctor"}</div>
                <div style={{ fontSize: 13.5, color: "#5A6478", marginTop: 2 }}>Especialista em saúde mental organizacional • Implantação NR-01 e gestão de riscos psicossociais</div>
              </div>
            </div>
          </PropSection>

          {/* ==================== FECHAMENTO FORTE ==================== */}
          <div style={{ background: "#00204D", color: "#fff", padding: "46px 68px", textAlign: "center" }}>
            <p style={{ fontSize: 18, lineHeight: 1.55, fontWeight: 600, maxWidth: 580, margin: "0 auto 16px" }}>
              Mais que cumprir uma norma: transformar uma exigência em <span style={{ color: "#F66B0A" }}>vantagem competitiva</span> para a sua organização.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 6, opacity: .75, fontSize: 11, letterSpacing: ".1em", fontWeight: 600, textTransform: "uppercase" }}>
              <span>Conformidade</span><span>•</span><span>Prevenção</span><span>•</span><span>Resultados reais</span>
            </div>
          </div>

          {/* small footer */}
          <div style={{ padding: "18px 68px 24px", fontSize: 10.5, color: "#8A93A6", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
            <span>Menctor • Saúde psicossocial com conformidade</span>
            <span className="doc-mono" style={{ letterSpacing: ".06em" }}>Proposta válida por 30 dias</span>
          </div>

        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ContratoDocPage, PropostaDocPage, DOC_DRAFT_KEY, DOC_SIGN_KEY, calcularInvestimento });
