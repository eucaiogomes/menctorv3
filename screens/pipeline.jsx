/* global React, Icon, Page, CLIENTES, LEADS_PIPELINE, riskPill, riskLabel */

// ════════════════════════════════════════════════════════════
// PIPELINE — fluxo comercial: lead → proposta → contrato → fechado
// ════════════════════════════════════════════════════════════

const EMAIL_API_BASE = () => {
  const saved = window.localStorage && window.localStorage.getItem("MENCTOR_API_URL");
  if (saved) return saved;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "";
};

const sendTransactionalEmail = async ({ to, subject, html, text }) => {
  const response = await fetch(`${EMAIL_API_BASE()}/api/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, html, text }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Nao foi possivel enviar o e-mail.");
  return payload;
};

const TEST_RECIPIENT = "gcaio98406@gmail.com";

const proposalEmail = (card) => {
  const link = card?.id ? getProposalLink(card) : "";
  const cta = link ? `<p style="margin:16px 0"><a href="${link}" style="display:inline-block;background:#E87722;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:700">Abrir proposta personalizada e aceitar</a><br/><span style="font-size:12px;color:#6b6f6a">Ou cole no navegador: ${link}</span></p>` : "";
  return {
    to: card?.email || TEST_RECIPIENT,
    subject: `Proposta Menctor para ${card?.empresa || "sua empresa"}`,
    text: `Ola, ${card?.contato || "gestor(a)"}. Segue a proposta Menctor para ${card?.empresa || "sua empresa"}. ${link ? "Link para aceitar: " + link : ""}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2b26">
        <h2>Proposta Menctor para ${card?.empresa || "sua empresa"}</h2>
        <p>Ola, <strong>${card?.contato || "gestor(a)"}</strong>.</p>
        <p>Preparei esta proposta para apoiar a jornada de saude psicossocial, diagnosticos NR-1 e acompanhamento continuo.</p>
        <div style="padding:16px;border-radius:12px;background:#f3faf6;border:1px solid #cde8dc">
          <strong>Investimento mensal:</strong> R$ ${Number(card?.valor || 0).toLocaleString("pt-BR")}<br/>
          <strong>Colaboradores cobertos:</strong> ${card?.funcionarios || "-"}<br/>
          <strong>Implantacao:</strong> 7 dias
        </div>
        <p>Inclui portal do colaborador, painel do RH, relatorios executivos e acompanhamento consultivo.</p>
        ${cta}
        <p>Abracoss,<br/>Caio Guedes · Menctor</p>
      </div>
    `,
  };
};

const contractEmail = (dataOrCard) => {
  const link = dataOrCard?.id ? getContractLink(dataOrCard) : "";
  const cta = link ? `<p style="margin:16px 0"><a href="${link}" style="display:inline-block;background:#E87722;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:700">Abrir contrato personalizado e assinar</a><br/><span style="font-size:12px;color:#6b6f6a">Ou cole no navegador: ${link}</span></p>` : "";
  return {
    to: dataOrCard?.email || TEST_RECIPIENT,
    subject: `Contrato Menctor para ${dataOrCard?.empresa || "sua empresa"}`,
    text: `Ola, ${dataOrCard?.contato || "responsavel legal"}. Segue o contrato Menctor para ${dataOrCard?.empresa || "sua empresa"}. ${link ? "Link para assinar: " + link : ""}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2b26">
        <h2>Contrato Menctor para ${dataOrCard?.empresa || "sua empresa"}</h2>
        <p>Ola, <strong>${dataOrCard?.contato || "responsavel legal"}</strong>.</p>
        <p>Segue o contrato personalizado para assinatura digital. Revise os dados e assine para darmos início ao projeto.</p>
        <div style="padding:16px;border-radius:12px;background:#f3faf6;border:1px solid #cde8dc">
          <strong>Valor mensal:</strong> R$ ${Number(dataOrCard?.valor || 0).toLocaleString("pt-BR")}<br/>
          <strong>Colaboradores cobertos:</strong> ${dataOrCard?.colaboradores || dataOrCard?.funcionarios || "-"}<br/>
          <strong>Vigencia:</strong> ${dataOrCard?.vigencia || 12} meses
        </div>
        ${cta}
        <p>Assim que a assinatura for concluida, iniciaremos o onboarding.</p>
        <p>Abracos,<br/>Caio Guedes · Menctor</p>
      </div>
    `,
  };
};

// ── Proposal link + acceptance helpers (for client portal flow) ─────────────
const PROPOSAL_SNAPSHOT_KEY = (id) => `MENCTOR_PROPOSAL_${id}`;
const PROPOSAL_ACCEPTED_KEY = (id) => `MENCTOR_PROPOSAL_ACCEPTED_${id}`;

const saveProposalSnapshot = (card) => {
  if (!card || !card.id) return;
  try {
    window.localStorage.setItem(PROPOSAL_SNAPSHOT_KEY(card.id), JSON.stringify({
      ...card,
      savedAt: new Date().toISOString(),
    }));
  } catch (e) {}
};

const getProposalLink = (card) => {
  if (!card || !card.id) return "";
  // Always link to root so routing handles ?proposta cleanly (works from any page)
  return `${window.location.origin}/?proposta=${encodeURIComponent(card.id)}`;
};

const copyProposalLink = async (card) => {
  const link = getProposalLink(card);
  if (!link) return false;
  saveProposalSnapshot(card);
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (e) {
    // fallback prompt
    window.prompt("Copie o link da proposta:", link);
    return true;
  }
};

// ── Contract link + acceptance helpers (mirrors proposal exactly) ─────────────
const CONTRACT_SNAPSHOT_KEY = (id) => `MENCTOR_CONTRACT_${id}`;
const CONTRACT_ACCEPTED_KEY = (id) => `MENCTOR_CONTRACT_ACCEPTED_${id}`;

const saveContractSnapshot = (card) => {
  if (!card || !card.id) return;
  try {
    window.localStorage.setItem(CONTRACT_SNAPSHOT_KEY(card.id), JSON.stringify({
      ...card,
      savedAt: new Date().toISOString(),
    }));
  } catch (e) {}
};

const getContractLink = (card) => {
  if (!card || !card.id) return "";
  return `${window.location.origin}/?contrato=${encodeURIComponent(card.id)}`;
};

const copyContractLink = async (card) => {
  const link = getContractLink(card);
  if (!link) return false;
  saveContractSnapshot(card);
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (e) {
    window.prompt("Copie o link do contrato:", link);
    return true;
  }
};

// ── Lead invite form (standalone, acessado via ?lead=form) ───
const LeadInviteForm = () => {
  const params = new URLSearchParams(window.location.search);
  const [done, setDone] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState({
    empresa: "",
    contato: params.get("nome") || "",
    email: params.get("email") || "",
    telefone: "",
    funcionarios: "",
    interesse: "Diagnostico NR-1",
  });
  const upd = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const submit = async () => {
    const lead = {
      id: `lead-${Date.now()}`,
      empresa: data.empresa || "Novo lead",
      contato: data.contato || data.email || "Contato a confirmar",
      email: data.email,
      funcionarios: Number(data.funcionarios) || 0,
      valor: Number(data.funcionarios) > 500 ? 8900 : Number(data.funcionarios) > 100 ? 4200 : 1500,
      dias: 0,
      decisor: data.contato || "Contato a confirmar",
      proximoPasso: `Retornar sobre ${data.interesse}`,
      probabilidade: 35,
      origem: "Formulario de convite",
    };
    setLoading(true);
    setError("");
    try {
      if (window.MenctorDB) await window.MenctorDB.upsertPipelineCard(lead, "lead");
      const saved = JSON.parse(window.localStorage.getItem("MENCTOR_LEADS") || "[]");
      window.localStorage.setItem("MENCTOR_LEADS", JSON.stringify([lead, ...saved.filter(item => item.id !== lead.id)]));
      window.__MENCTOR_LAST_LEAD = lead;
      window.dispatchEvent(new CustomEvent("menctor:lead-created", { detail: lead }));
      setDone(true);
    } catch (err) {
      setError(err.message || "Nao foi possivel salvar o lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas-warm)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
      <div className="card" style={{ width: "100%", maxWidth: 760, padding: 36 }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "28px 10px" }}>
            <div style={{ width: 68, height: 68, borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Icon name="check" size={32} />
            </div>
            <div className="eyebrow" style={{ color: "var(--health-deep)", marginBottom: 10 }}>Lead criado</div>
            <h1 className="display" style={{ fontSize: 38, margin: 0 }}>{data.empresa || "Sua empresa"} entrou no pipeline Menctor.</h1>
            <p style={{ margin: "14px auto 0", maxWidth: 480, color: "var(--ink-muted)", lineHeight: 1.55 }}>
              O consultor recebeu seus dados e vai entrar em contato para montar a proposta.
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Pre-cadastro Menctor</div>
              <h1 className="display" style={{ fontSize: 42, margin: 0 }}>Conte um pouco sobre sua empresa.</h1>
              <p style={{ margin: "12px 0 0", color: "var(--ink-muted)", maxWidth: 540, lineHeight: 1.55 }}>
                Com esses dados, preparamos o melhor caminho para diagnostico psicossocial, NR-1 e portal do colaborador.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <LeadField label="Empresa"><LeadInput value={data.empresa} onChange={v => upd("empresa", v)} placeholder="Ex.: Norte Fintech" /></LeadField>
              <LeadField label="Seu nome"><LeadInput value={data.contato} onChange={v => upd("contato", v)} placeholder="Ex.: Ana Beatriz" /></LeadField>
              <LeadField label="E-mail corporativo"><LeadInput value={data.email} onChange={v => upd("email", v)} placeholder="voce@empresa.com.br" type="email" /></LeadField>
              <LeadField label="Telefone / WhatsApp"><LeadInput value={data.telefone} onChange={v => upd("telefone", v)} placeholder="(11) 99999-9999" /></LeadField>
              <LeadField label="Colaboradores"><LeadInput value={data.funcionarios} onChange={v => upd("funcionarios", v)} placeholder="180" type="number" /></LeadField>
              <LeadField label="Interesse principal">
                <select value={data.interesse} onChange={e => upd("interesse", e.target.value)} style={{ width: "100%", height: 44, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)" }}>
                  <option>Diagnostico NR-1</option>
                  <option>Portal do colaborador</option>
                  <option>Trilhas de saude mental</option>
                  <option>Relatorios para auditoria</option>
                </select>
              </LeadField>
            </div>
            <button onClick={submit} disabled={!data.empresa.trim() || !data.email.trim() || loading} className="btn btn-accent" style={{ width: "100%", height: 46, justifyContent: "center", marginTop: 24, opacity: (!data.empresa.trim() || !data.email.trim() || loading) ? 0.6 : 1 }}>
              <Icon name="send" size={15}/> {loading ? "Salvando..." : "Enviar dados"}
            </button>
            {error && <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, background: "var(--coral-soft)", color: "var(--coral)", fontSize: 12 }}>{error}</div>}
          </>
        )}
      </div>
    </div>
  );
};

const LeadField = ({ label, children }) => (
  <div>
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const LeadInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={{ width: "100%", height: 44, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", fontSize: 14 }} />
);

// ── Invite modal ──────────────────────────────────────────────
const InviteModal = ({ onClose }) => {
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const leadUrl = `${window.location.origin}${window.location.pathname}?lead=form&nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email.trim())}`;
    try {
      await sendTransactionalEmail({
        to: email.trim(),
        subject: "Pre-cadastro Menctor para sua empresa",
        text: `${nome || "Ola"}, preencha o formulario para receber uma proposta Menctor: ${leadUrl}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2b26"><h2>Pre-cadastro Menctor</h2><p>Ola, <strong>${nome || "gestor(a)"}</strong>.</p><p>Preencha um formulario rapido para receber uma proposta.</p><p><a href="${leadUrl}" style="display:inline-block;background:#E87722;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700">Preencher formulario</a></p><p>Abracos,<br/>Caio Guedes · Menctor</p></div>`,
      });
      setSent(true);
    } catch (err) {
      setError(err.message || "Nao foi possivel enviar o convite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fade-in 200ms ease-out" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--canvas)", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 440, boxShadow: "var(--shadow-modal)", animation: "sheet-in 320ms var(--ease-spring)" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, margin: "0 auto 18px", background: "var(--surface-sage)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="check" size={26} color="var(--health-deep)" strokeWidth={2} />
            </div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 22, marginBottom: 8 }}>Convite enviado!</div>
            <div style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 28 }}><strong>{email}</strong> recebera o formulario em instantes.</div>
            <button onClick={onClose} className="btn btn-primary" style={{ width: "100%", height: 44, justifyContent: "center", fontSize: 14 }}>Fechar</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20 }}>Convidar por e-mail</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 3 }}>O cliente recebe um formulario e vira lead ao preencher.</div>
              </div>
              <button onClick={onClose} style={{ color: "var(--ink-muted)", padding: 4, borderRadius: 8 }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nome</label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Ana Beatriz" style={{ width: "100%", height: 42, padding: "0 14px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--surface)", color: "var(--ink)" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>E-mail *</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@empresa.com.br" type="email" style={{ width: "100%", height: 42, padding: "0 14px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--surface)", color: "var(--ink)" }} />
              </div>
            </div>
            <button onClick={handleSend} disabled={!email.trim() || loading} className="btn btn-accent" style={{ width: "100%", height: 44, justifyContent: "center", fontSize: 14, marginTop: 24, opacity: (!email.trim() || loading) ? 0.6 : 1 }}>
              {loading ? "Enviando..." : <><Icon name="send" size={15} /> Enviar convite</>}
            </button>
            {error && <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 10, background: "var(--coral-soft)", color: "var(--coral)", fontSize: 12 }}>{error}</div>}
          </>
        )}
      </div>
    </div>
  );
};

// ── Novo contrato (full page) ─────────────────────────────────
const NovoContratoFullPage = ({ card, onClose, onContractSent }) => {
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState({
    empresa: card?.empresa || "", contato: card?.contato || "",
    email: card?.email || "ana@edutec.coop.br", cnpj: "",
    vigencia: "12", inicio: "01/06/2026",
    valor: card?.valor || 4200, colaboradores: card?.funcionarios || 100,
    multa: "30 dias", assinatura: "digital",
  });
  const upd = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const valorMensal = Number(data.valor) || 0;
  const totalAnual = valorMensal * 12;

  const sendContract = async () => {
    setSending(true); setError("");
    try {
      const contractData = {
        ...card,
        ...data,
        id: card?.id || `ctr-${Date.now()}`,
        funcionarios: Number(data.colaboradores) || card?.funcionarios || 0,
        valor: Number(data.valor) || card?.valor || 0,
        vigencia: data.vigencia,
        proximoPasso: "Aguardando assinatura do contrato",
      };
      saveContractSnapshot(contractData);
      const link = getContractLink(contractData);
      const emailPayload = contractEmail(contractData);
      // Ensure link is present in email
      await sendTransactionalEmail(emailPayload);
      setSent(true);
      onContractSent && onContractSent(contractData);
    } catch (err) {
      setError(err.message || "Nao foi possivel enviar o contrato.");
    } finally { setSending(false); }
  };

  if (sent) {
    const linkSent = card?.id ? getContractLink({ ...card, ...data, id: card.id }) : "";
    return (
      <div style={{ minHeight: "100vh", background: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>
          <div style={{ width: 76, height: 76, borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
            <Icon name="check" size={34} />
          </div>
          <div className="eyebrow" style={{ marginBottom: 10, color: "var(--health-deep)" }}>Contrato enviado</div>
          <h1 className="display" style={{ fontSize: 38, margin: 0 }}>{data.empresa || "Cliente"} recebeu o contrato.</h1>
          <p style={{ margin: "14px 0 12px", fontSize: 15, lineHeight: 1.55, color: "var(--ink-muted)" }}>
            O link de assinatura foi enviado para {data.email}.
          </p>
          {linkSent && (
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 20 }}>
              Link: <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>{linkSent}</code>
            </div>
          )}
          <button onClick={onClose} className="btn btn-primary" style={{ height: 42, justifyContent: "center", padding: "0 22px" }}>Voltar para pipeline</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 36px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--canvas)", position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ink-muted)", fontSize: 13.5 }}>
          <Icon name="chevron-left" size={15}/> Voltar para pipeline
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-muted)" }}>
          <span className="pill pill-amber" style={{ fontSize: 11 }}>Etapa aceita</span>
          <span>{data.empresa || "Contrato em preparo"}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginRight: 180 }}>
          <button onClick={async () => {
            const snap = { ...card, ...data, id: card?.id || `ctr-${Date.now()}`, funcionarios: Number(data.colaboradores)||card?.funcionarios||0, valor: Number(data.valor)||card?.valor||0 };
            saveContractSnapshot(snap);
            await copyContractLink(snap);
          }} className="btn btn-soft" style={{ height: 38 }}><Icon name="link" size={14}/> Copiar link</button>
          <button onClick={sendContract} disabled={sending} className="btn btn-accent" style={{ height: 38, opacity: sending ? 0.7 : 1 }}>
            <Icon name="send" size={14}/> {sending ? "Enviando..." : "Enviar contrato"}
          </button>
        </div>
      </div>
      {error && <div style={{ margin: "10px 36px 0 auto", maxWidth: 460, padding: "9px 12px", borderRadius: 10, background: "var(--coral-soft)", color: "var(--coral)", fontSize: 12 }}>{error}</div>}

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        <div style={{ flex: "0 0 48%", overflowY: "auto", padding: "44px 48px 120px" }}>
          <div style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Criacao do contrato</div>
            <h1 className="display" style={{ fontSize: 40, margin: 0, lineHeight: 1.05 }}>Revise os dados antes do envio.</h1>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ContractField label="Empresa"><ContractInput value={data.empresa} onChange={v => upd("empresa", v)} placeholder="EduTec Cooperativa" /></ContractField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ContractField label="Responsavel"><ContractInput value={data.contato} onChange={v => upd("contato", v)} placeholder="Ana Paula Rios" /></ContractField>
              <ContractField label="E-mail de assinatura"><ContractInput value={data.email} onChange={v => upd("email", v)} placeholder="ana@empresa.com.br" type="email" /></ContractField>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ContractField label="CNPJ"><ContractInput value={data.cnpj} onChange={v => upd("cnpj", v)} placeholder="00.000.000/0000-00" /></ContractField>
              <ContractField label="Inicio"><ContractInput value={data.inicio} onChange={v => upd("inicio", v)} placeholder="01/06/2026" /></ContractField>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ContractField label="Valor mensal"><ContractInput value={data.valor} onChange={v => upd("valor", v)} type="number" /></ContractField>
              <ContractField label="Colaboradores cobertos"><ContractInput value={data.colaboradores} onChange={v => upd("colaboradores", v)} type="number" /></ContractField>
            </div>
            <ContractField label="Vigencia">
              <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--canvas-warm)", borderRadius: 999, width: "fit-content" }}>
                {["12", "24", "36"].map(meses => (
                  <button key={meses} onClick={() => upd("vigencia", meses)} style={{ padding: "8px 16px", borderRadius: 999, fontSize: 13, background: data.vigencia === meses ? "var(--surface)" : "transparent", color: data.vigencia === meses ? "var(--ink)" : "var(--ink-muted)", fontWeight: data.vigencia === meses ? 600 : 500, boxShadow: data.vigencia === meses ? "var(--shadow-card)" : "none" }}>
                    {meses} meses
                  </button>
                ))}
              </div>
            </ContractField>
          </div>
        </div>

        <div style={{ width: 1, background: "var(--line)", flexShrink: 0 }} />

        <div style={{ flex: 1, overflowY: "auto", background: "var(--canvas-warm)", padding: "44px 40px 80px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Preview do contrato</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Documento que sera enviado para assinatura</div>
            </div>
            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", fontWeight: 700 }}>AO VIVO</span>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "24px 30px", borderBottom: "1px solid #ece7dd", display: "flex", justifyContent: "space-between", gap: 20 }}>
              <div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 24, color: "#1f2b26" }}>Contrato Menctor</div>
                <div style={{ fontSize: 12, color: "#6b6f6a", marginTop: 4 }}>Saude psicossocial, NR-1 e portal do colaborador</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "#6b6f6a" }}>
                <div>Inicio: {data.inicio || "--"}</div>
                <div>Vigencia: {data.vigencia} meses</div>
              </div>
            </div>
            <div style={{ padding: "30px", color: "#24312c", fontSize: 14.5, lineHeight: 1.65 }}>
              <p style={{ marginTop: 0 }}>Pelo presente instrumento, <strong>Menctor by Lector</strong> e <strong>{data.empresa || "empresa contratante"}</strong>, representada por <strong>{data.contato || "responsavel legal"}</strong>, formalizam a contratacao da plataforma Menctor.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "24px 0" }}>
                <ContractPreviewBox label="Valor mensal" value={`R$ ${valorMensal.toLocaleString("pt-BR")}`} />
                <ContractPreviewBox label="Valor anual estimado" value={`R$ ${totalAnual.toLocaleString("pt-BR")}`} />
                <ContractPreviewBox label="Cobertura" value={`${data.colaboradores || 0} colaboradores`} />
                <ContractPreviewBox label="Assinatura" value={data.assinatura === "digital" ? "Digital" : "Manual"} />
              </div>
              <h3 style={{ fontSize: 15, margin: "22px 0 8px", color: "#1f2b26" }}>Escopo contratado</h3>
              {["Portal do colaborador personalizado", "Diagnosticos psicossociais alinhados a NR-1", "Painel administrativo para RH e liderancas", "Relatorios consolidados para plano de acao"].map(item => (
                <div key={item} style={{ display: "flex", gap: 9, marginBottom: 7 }}><span style={{ color: "#2F7D6F", fontWeight: 700 }}>✓</span><span>{item}</span></div>
              ))}
              <div style={{ marginTop: 28, padding: 18, borderRadius: 12, background: "#f3faf6", border: "1px solid #cde8dc", display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="send" size={18} color="#2F7D6F" />
                <div>
                  <div style={{ fontWeight: 700, color: "#1f2b26" }}>Pronto para assinatura</div>
                  <div style={{ fontSize: 12.5, color: "#5d6862" }}>Enviado para {data.email || "email do responsavel"}.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContractField = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);
const ContractInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, color: "var(--ink)", outline: "none" }} />
);
const ContractPreviewBox = ({ label, value }) => (
  <div style={{ padding: 14, borderRadius: 12, background: "#faf8f2", border: "1px solid #ece7dd" }}>
    <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7a817b", fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 17, fontWeight: 700, color: "#1f2b26", marginTop: 4 }}>{value}</div>
  </div>
);

// ── Contrato preview modal (agora exatamente no mesmo estilo da Proposta) ────────────────────────────────────
const ContratoPreviewModal = ({ card, onClose, onMarkSigned }) => {
  const [signed, setSigned] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const valor = card?.valor || 4200;
  const funcionarios = card?.funcionarios || 100;
  const totalAnual = valor * 12;
  const vigencia = card?.vigencia || "12";

  const resendContract = async () => {
    setSending(true); setStatus("");
    try {
      saveContractSnapshot(card);
      await sendTransactionalEmail(contractEmail(card));
      setStatus(`Link reenviado para ${card?.email || TEST_RECIPIENT}.`);
    }
    catch (err) { setStatus(err.message || "Nao foi possivel reenviar."); }
    finally { setSending(false); }
  };

  const handleMarkSigned = () => {
    setSigned(true);
    onMarkSigned && onMarkSigned(card);
  };

  const alreadyAcceptedViaLink = card && window.localStorage.getItem(CONTRACT_ACCEPTED_KEY(card.id));

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", padding: 24, animation: "fade-in 200ms ease-out" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(1040px, 100%)", maxHeight: "88vh", overflow: "hidden", background: "var(--canvas)", borderRadius: 18, boxShadow: "var(--shadow-modal)", display: "grid", gridTemplateRows: "auto 1fr", animation: "sheet-in 320ms var(--ease-spring)" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".09em", color: "var(--health-deep)", marginBottom: 1 }}>VISUALIZAR CONTRATO</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, letterSpacing: "-0.025em", fontSize: 22, color: "var(--ink)" }}>{card?.empresa || "Contrato comercial"}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resendContract} disabled={sending} className="btn btn-soft" style={{ height: 32, fontSize: 12, opacity: sending ? 0.7 : 1 }}><Icon name="send" size={13}/> {sending ? "Enviando..." : "Reenviar e-mail"}</button>
            <button onClick={async () => { const ok = await copyContractLink(card); if (ok) alert("Link personalizado copiado! Envie para o cliente assinar pelo portal."); }} className="btn btn-soft" style={{ height: 32, fontSize: 12 }}><Icon name="link" size={13}/> Copiar link do cliente</button>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)" }}><Icon name="x" size={17}/></button>
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: 28, background: "var(--canvas-warm)" }}>
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.09)" }}>
            {status && <div style={{ padding: "10px 24px", background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 12.5, borderBottom: "1px solid #cde8dc" }}>{status}</div>}

            {(alreadyAcceptedViaLink || signed) && (
              <div style={{ padding: "8px 24px", background: "#f0f7f3", color: "var(--health-deep)", fontSize: 12.5, borderBottom: "1px solid #cde8dc", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={13} /> Assinado pelo cliente via link
              </div>
            )}

            <div style={{ padding: "32px 40px", color: "#222", lineHeight: 1.65 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", color: "#1F5A50", marginBottom: 6 }}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS • NR-01</div>
                  <h2 className="display" style={{ fontSize: 36, lineHeight: 1.05, margin: 0, color: "#1f2b26", maxWidth: "18ch" }}>
                    Contrato Menctor para {card?.empresa || "sua empresa"}.
                  </h2>
                </div>
                <div style={{ minWidth: 176, padding: 16, borderRadius: 14, background: "var(--accent)", color: "#fff" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>INVESTIMENTO MENSAL</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 28, color: "#F66B0A", marginTop: 4 }}>R$ {valor.toLocaleString("pt-BR")}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)" }}>{funcionarios} colaboradores • {vigencia} meses</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "18px 0 6px" }}>
                {[
                  ["Colaboradores", funcionarios.toLocaleString("pt-BR")],
                  ["Valor anual", `R$ ${totalAnual.toLocaleString("pt-BR")}`],
                  ["Vigência", `${vigencia} meses`]
                ].map(([l, v], i) => (
                  <div key={i} style={{ padding: "13px 15px", borderRadius: 11, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", color: "#7A817B", fontWeight: 700 }}>{l}</div>
                    <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, color: "#1f2b26", marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 22, padding: "19px 22px", borderRadius: 14, background: "#1f2b26", color: "#FAF8F2", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center" }}>
                {(signed || alreadyAcceptedViaLink) ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <Icon name="check" size={22} color="var(--health)" />
                    <div>
                      <div style={{ fontSize: 17, fontFamily: "var(--display)" }}>Contrato assinado.</div>
                      <div style={{ fontSize: 12.5, opacity: .7 }}>Negócio avança para fechado / onboarding.</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: 11, opacity: .65, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Próxima etapa</div>
                      <div style={{ fontSize: 17.5, fontFamily: "var(--display)", marginTop: 3 }}>Assinatura do contrato para concluir</div>
                    </div>
                    <button onClick={handleMarkSigned} className="btn btn-accent" style={{ height: 40, padding: "0 18px" }}>
                      <Icon name="check" size={15}/> Marcar como assinado
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Proposta preview modal ────────────────────────────────────
const PropostaPreviewModal = ({ card, onClose, onAcceptProposal }) => {
  const [accepted, setAccepted] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const valor = card?.valor || 4200;
  const funcionarios = card?.funcionarios || 100;
  const ticket = funcionarios ? valor / funcionarios : valor;
  const resendProposal = async () => {
    setSending(true); setStatus("");
    try { await sendTransactionalEmail(proposalEmail(card)); setStatus(`Proposta reenviada para ${card?.email || TEST_RECIPIENT}.`); }
    catch (err) { setStatus(err.message || "Nao foi possivel reenviar."); }
    finally { setSending(false); }
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", padding: 24, animation: "fade-in 200ms ease-out" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(1040px, 100%)", maxHeight: "88vh", overflow: "hidden", background: "var(--canvas)", borderRadius: 18, boxShadow: "var(--shadow-modal)", display: "grid", gridTemplateRows: "auto 1fr", animation: "sheet-in 320ms var(--ease-spring)" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".09em", color: "var(--health-deep)", marginBottom: 1 }}>VISUALIZAR PROPOSTA</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, letterSpacing: "-0.025em", fontSize: 22, color: "var(--ink)" }}>{card?.empresa || "Proposta comercial"}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resendProposal} disabled={sending} className="btn btn-soft" style={{ height: 32, fontSize: 12, opacity: sending ? 0.7 : 1 }}><Icon name="send" size={13}/> {sending ? "Enviando..." : "Reenviar e-mail"}</button>
            <button onClick={async () => { const ok = await copyProposalLink(card); if (ok) alert("Link personalizado copiado! Envie para o cliente aceitar pelo portal."); }} className="btn btn-soft" style={{ height: 32, fontSize: 12 }}><Icon name="link" size={13}/> Copiar link do cliente</button>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)" }}><Icon name="x" size={17}/></button>
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: 28, background: "var(--canvas-warm)" }}>
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.09)" }}>
            {status && <div style={{ padding: "10px 24px", background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 12.5, borderBottom: "1px solid #cde8dc" }}>{status}</div>}
            {card && window.localStorage.getItem(PROPOSAL_ACCEPTED_KEY(card.id)) && (
              <div style={{ padding: "8px 24px", background: "#f0f7f3", color: "var(--health-deep)", fontSize: 12.5, borderBottom: "1px solid #cde8dc", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={13} /> Aceita pelo cliente via link
              </div>
            )}
            <div style={{ padding: "32px 40px", color: "#222", lineHeight: 1.65 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", color: "#1F5A50", marginBottom: 6 }}>PROPOSTA COMERCIAL • NR-01</div>
                  <h2 className="display" style={{ fontSize: 38, lineHeight: 1.0, margin: 0, color: "#1f2b26", maxWidth: "17ch" }}>Saúde psicossocial e conformidade NR-1 para {card?.empresa || "sua empresa"}.</h2>
                </div>
                <div style={{ minWidth: 176, padding: 16, borderRadius: 14, background: "var(--accent)", color: "#fff" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>INVESTIMENTO MENSAL</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 28, color: "#F66B0A", marginTop: 4 }}>R$ {valor.toLocaleString("pt-BR")}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)" }}>{funcionarios} colaboradores</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "18px 0 6px" }}>
                {[["Colaboradores", funcionarios.toLocaleString("pt-BR")], ["Por colaborador", `R$ ${ticket.toFixed(2).replace(".",",")}`], ["Implantação", "7 dias"]].map(([l,v], i) => (
                  <div key={i} style={{ padding: "13px 15px", borderRadius: 11, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", color: "#7A817B", fontWeight: 700 }}>{l}</div>
                    <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, color: "#1f2b26", marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 22, padding: "19px 22px", borderRadius: 14, background: "#1f2b26", color: "#FAF8F2", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center" }}>
                {!accepted ? (
                  <>
                    <div>
                      <div style={{ fontSize: 11, opacity: .65, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Próxima etapa</div>
                      <div style={{ fontSize: 17.5, fontFamily: "var(--display)", marginTop: 3 }}>Aceite da proposta para gerar contrato</div>
                    </div>
                    <button onClick={() => { setAccepted(true); onAcceptProposal && onAcceptProposal(card); }} className="btn btn-accent" style={{ height: 40, padding: "0 18px" }}><Icon name="check" size={15}/> Aceitar proposta</button>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <Icon name="check" size={22} color="var(--health)" />
                    <div><div style={{ fontSize: 17, fontFamily: "var(--display)" }}>Proposta aceita.</div><div style={{ fontSize: 12.5, opacity: .7 }}>Negócio avança para contrato.</div></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Pipeline state helpers ────────────────────────────────────
const buildPipeline = () => ({
  ...LEADS_PIPELINE,
  lead: [...LEADS_PIPELINE.lead], proposta: [...LEADS_PIPELINE.proposta],
  aceita: [...LEADS_PIPELINE.aceita], contrato: [...LEADS_PIPELINE.contrato],
  fechado: [...LEADS_PIPELINE.fechado],
});

const mergeCardsIntoPipeline = (base, cards) => {
  const incomingIds = new Set(cards.map(card => card.id));
  const next = Object.fromEntries(Object.entries(base).map(([stage, stageCards]) => [stage, stageCards.filter(card => !incomingIds.has(card.id))]));
  cards.forEach(card => { const stage = card.stage || "lead"; next[stage] = [card, ...(next[stage] || [])]; });
  return next;
};

// ════════════════════════════════════════════════════════════
// PIPELINE SCREEN
// ════════════════════════════════════════════════════════════
const PipelineScreen = ({ navigate }) => {
  const [inviting,             setInviting]             = React.useState(false);
  const [editingCard,          setEditingCard]          = React.useState(null);
  const [proposalCard,         setProposalCard]         = React.useState(null);
  const [contractPreviewCard,  setContractPreviewCard]  = React.useState(null);
  const [contractSendCard,     setContractSendCard]     = React.useState(null);
  const [pipeline, setPipeline] = React.useState(buildPipeline);

  const persistPipelineCard = (card, stage) => {
    if (!window.MenctorDB || !card) return;
    window.MenctorDB.upsertPipelineCard(card, stage).catch(err => console.warn("Falha ao sincronizar pipeline", err));
  };

  const moveCard = (card, toStage, patch = {}) => {
    if (!card) return;
    const persistCard = { ...card, ...patch, dias: 0 };
    setPipeline(prev => {
      let moving = null;
      const next = Object.fromEntries(Object.entries(prev).map(([stage, cards]) => {
        const found = cards.find(item => item.id === card.id);
        if (found) moving = found;
        return [stage, cards.filter(item => item.id !== card.id)];
      }));
      return { ...next, [toStage]: [{ ...(moving || card), ...patch, dias: 0 }, ...(next[toStage] || [])] };
    });
    persistPipelineCard(persistCard, toStage);
  };

  const moveCardById = (cardId, toStage) => {
    const currentCard = Object.values(pipeline).flat().find(card => card.id === cardId);
    const persistCard = currentCard ? { ...currentCard, dias: 0 } : null;
    setPipeline(prev => {
      let moving = null; let fromStage = null;
      const next = Object.fromEntries(Object.entries(prev).map(([stage, cards]) => {
        const found = cards.find(item => item.id === cardId);
        if (found) { moving = found; fromStage = stage; }
        return [stage, cards.filter(item => item.id !== cardId)];
      }));
      if (!moving || fromStage === toStage) return prev;
      return { ...next, [toStage]: [{ ...moving, dias: 0 }, ...(next[toStage] || [])] };
    });
    if (persistCard) persistPipelineCard(persistCard, toStage);
  };

  React.useEffect(() => {
    if (window.MenctorDB) {
      window.MenctorDB.listPipelineCards()
        .then(cards => { if (cards.length) setPipeline(prev => mergeCardsIntoPipeline(prev, cards)); })
        .catch(err => console.warn("Falha ao carregar pipeline do Supabase", err));
    }
    const syncLeads = () => {
      const lead = window.__MENCTOR_LAST_LEAD;
      if (!lead) return;
      setPipeline(prev => {
        const activeIds = new Set(Object.entries(prev).flatMap(([stage, cards]) => stage === "lead" ? [] : cards.map(c => c.id)));
        const leadIds = new Set(prev.lead.map(c => c.id));
        if (activeIds.has(lead.id) || leadIds.has(lead.id)) return prev;
        return { ...prev, lead: [lead, ...prev.lead] };
      });
    };

    // Accept via client link → auto advance proposta → aceita (with visual feedback sync)
    const advanceAcceptedProposals = () => {
      setPipeline(prev => {
        const propostas = prev.proposta || [];
        const toMove = propostas.filter(c => {
          try { return !!window.localStorage.getItem(PROPOSAL_ACCEPTED_KEY(c.id)); } catch (e) { return false; }
        });
        if (toMove.length === 0) return prev;

        const remainingPropostas = propostas.filter(c => !toMove.some(m => m.id === c.id));
        const newAceitas = [...(prev.aceita || [])];
        toMove.forEach(c => {
          const accRaw = window.localStorage.getItem(PROPOSAL_ACCEPTED_KEY(c.id));
          let acc = {};
          try { acc = accRaw ? JSON.parse(accRaw) : {}; } catch (e) {}
          const moved = { ...c, proximoPasso: "Enviar contrato para assinatura", probabilidade: Math.max(c.probabilidade || 75, 88), propostaAceitaEm: acc.acceptedAt || new Date().toISOString() };
          newAceitas.unshift(moved);
          persistPipelineCard(moved, "aceita");
        });
        return { ...prev, proposta: remainingPropostas, aceita: newAceitas };
      });
    };

    // Contract signed via client link → auto advance contrato → fechado
    const advanceSignedContracts = () => {
      setPipeline(prev => {
        const contratos = prev.contrato || [];
        const toMove = contratos.filter(c => {
          try { return !!window.localStorage.getItem(CONTRACT_ACCEPTED_KEY(c.id)); } catch (e) { return false; }
        });
        if (toMove.length === 0) return prev;

        const remainingContratos = contratos.filter(c => !toMove.some(m => m.id === c.id));
        const newFechados = [...(prev.fechado || [])];
        toMove.forEach(c => {
          const accRaw = window.localStorage.getItem(CONTRACT_ACCEPTED_KEY(c.id));
          let acc = {};
          try { acc = accRaw ? JSON.parse(accRaw) : {}; } catch (e) {}
          const moved = {
            ...c,
            proximoPasso: "Ativar conta e iniciar onboarding",
            probabilidade: 100,
            assinado: true,
            contratoAceitoEm: acc.acceptedAt || new Date().toISOString(),
          };
          newFechados.unshift(moved);
          persistPipelineCard(moved, "fechado");
        });
        return { ...prev, contrato: remainingContratos, fechado: newFechados };
      });
    };

    window.addEventListener("storage", (e) => {
      if (e.key && e.key.startsWith("MENCTOR_PROPOSAL_ACCEPTED_")) advanceAcceptedProposals();
      if (e.key && e.key.startsWith("MENCTOR_CONTRACT_ACCEPTED_")) advanceSignedContracts();
      syncLeads();
    });
    window.addEventListener("menctor:lead-created", syncLeads);
    window.addEventListener("menctor:proposal-accepted", advanceAcceptedProposals);
    window.addEventListener("menctor:contract-accepted", advanceSignedContracts);

    // initial sweeps
    setTimeout(advanceAcceptedProposals, 60);
    setTimeout(advanceSignedContracts, 80);

    return () => {
      window.removeEventListener("storage", syncLeads);
      window.removeEventListener("menctor:lead-created", syncLeads);
      window.removeEventListener("menctor:proposal-accepted", advanceAcceptedProposals);
      window.removeEventListener("menctor:contract-accepted", advanceSignedContracts);
    };
  }, []);


  if (editingCard) {
    return <window.NovoClienteFullPage onClose={() => setEditingCard(null)} mode="proposta"
      onProposalSent={async (proposalData) => {
        const proposalCardData = { ...editingCard, empresa: proposalData.fantasia || proposalData.razao || editingCard.empresa, contato: proposalData.contatoNome || editingCard.contato, email: proposalData.contatoEmail || editingCard.email, funcionarios: Number(proposalData.colab) || editingCard.funcionarios, valor: Number(proposalData.mrr) || editingCard.valor, proximoPasso: "Aguardar aceite da proposta enviada", probabilidade: Math.max(editingCard.probabilidade || 55, 70) };
        saveProposalSnapshot(proposalCardData);
        // Enhance email with direct client link
        const link = getProposalLink(proposalCardData);
        const emailPayload = proposalEmail(proposalCardData);
        const htmlWithLink = (emailPayload.html || "") + `<p style="margin-top:16px"><a href="${link}" style="display:inline-block;background:#E87722;color:#fff;text-decoration:none;padding:11px 20px;border-radius:999px;font-weight:700">Abrir proposta e aceitar →</a></p>`;
        await sendTransactionalEmail({ ...emailPayload, html: htmlWithLink });
        moveCard(editingCard, "proposta", proposalCardData);
        setEditingCard(null);
      }}
      initialData={{ fantasia: editingCard.empresa, razao: editingCard.empresa, setor: editingCard.setor || "", contatoNome: editingCard.contato, contatoEmail: editingCard.email || "", colab: String(editingCard.funcionarios || ""), mrr: editingCard.valor || 4200, plano: editingCard.valor >= 8000 ? "scale" : editingCard.valor >= 3000 ? "growth" : "starter", subdominio: (editingCard.empresa || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) }}
    />;
  }

  return (
    <Page>
      {inviting && <InviteModal onClose={() => setInviting(false)} />}
      {proposalCard && <PropostaPreviewModal card={proposalCard} onClose={() => setProposalCard(null)} onAcceptProposal={(card) => {
        // Also mark accepted so client link reflects it if reopened
        try { window.localStorage.setItem(PROPOSAL_ACCEPTED_KEY(card.id), JSON.stringify({ id: card.id, acceptedAt: new Date().toISOString() })); } catch(e){}
        moveCard(card, "aceita", { proximoPasso: "Enviar contrato para assinatura", probabilidade: Math.max(card.probabilidade || 75, 85) });
        setProposalCard(null);
      }} />}

      {contractSendCard && <NovoContratoFullPage 
        card={contractSendCard} 
        onClose={() => setContractSendCard(null)} 
        onContractSent={(updated) => {
          moveCard(contractSendCard, "contrato", updated);
          setContractSendCard(null);
          // After sending from rich form, open the nice proposal-like preview modal
          setTimeout(() => setContractPreviewCard(updated), 80);
        }} 
      />}
      {contractPreviewCard && <ContratoPreviewModal card={contractPreviewCard} onClose={() => setContractPreviewCard(null)} onMarkSigned={(c) => {
        const target = c || contractPreviewCard;
        try { window.localStorage.setItem(CONTRACT_ACCEPTED_KEY(target.id), JSON.stringify({ id: target.id, acceptedAt: new Date().toISOString() })); } catch(e){}
        moveCard(target, "fechado", { assinado: true, proximoPasso: "Ativar conta e iniciar onboarding", probabilidade: 100 });
        setContractPreviewCard(null);
      }} />}

      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Comercial</div>
        <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Pipeline</h1>
        <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 560 }}>
          Acompanhe leads e negociações do primeiro contato ao fechamento.
        </p>
      </div>

      <PipelineView
        navigate={navigate}
        onEditCard={setEditingCard}
        onContractCard={setContractSendCard}
        onPreviewProposal={setProposalCard}
        onPreviewContract={setContractPreviewCard}
        onMoveCardStage={moveCardById}
        pipeline={pipeline}
        actions={(
          <button onClick={() => setInviting(true)} className="btn btn-soft" style={{ height: 42 }}><Icon name="send" size={15} /> Convidar por e-mail</button>
        )}
      />
    </Page>
  );
};

// ── Kanban ────────────────────────────────────────────────────
const STAGES = [
  { id: "lead",     label: "Lead",           color: "var(--ink-faint)", desc: "Primeiro contato" },
  { id: "proposta", label: "Proposta enviada",color: "var(--sky)",      desc: "Aguardando resposta" },
  { id: "aceita",   label: "Aceita",          color: "var(--amber)",    desc: "Cliente concordou" },
  { id: "contrato", label: "Contrato",        color: "var(--health)",   desc: "Em assinatura" },
  { id: "fechado",  label: "Fechado",         color: "var(--ink)",      desc: "Cliente ativo" },
];

const PipelineView = ({ navigate, pipeline, onEditCard, onContractCard, onPreviewProposal, onPreviewContract, onMoveCardStage, actions }) => {
  const [dragOverStage, setDragOverStage] = React.useState(null);
  const totalProposta = pipeline.proposta.reduce((s,p)=>s+p.valor,0) + pipeline.aceita.reduce((s,p)=>s+p.valor,0);

  const handleDrop = (event, stageId) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/menctor-card");
    setDragOverStage(null);
    if (cardId && onMoveCardStage) onMoveCardStage(cardId, stageId);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
        <div style={{ display: "flex", gap: 28, fontSize: 13, color: "var(--ink-muted)" }}>
          <span><strong style={{ color: "var(--ink)", fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20 }}>R$ {(totalProposta/1000).toFixed(1)}k</strong> em proposta</span>
          <span><strong style={{ color: "var(--ink)", fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 20 }}>{Object.values(pipeline).flat().length}</strong> negócios ativos</span>
        </div>
        {actions}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(220px, 1fr))", gap: 14, overflow: "auto", paddingBottom: 12 }}>
        {STAGES.map(s => {
          const activeDrop = dragOverStage === s.id;
          return (
            <div key={s.id}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverStage(s.id); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverStage(null); }}
              onDrop={(e) => handleDrop(e, s.id)}
              style={{ background: activeDrop ? "var(--surface-sage)" : "var(--surface-2)", borderRadius: 14, padding: 14, border: activeDrop ? "1px solid var(--health)" : "1px solid var(--line)", minHeight: 480, boxShadow: activeDrop ? "0 0 0 3px var(--health-soft)" : "none", transition: "background .15s, border-color .15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="dot" style={{ background: s.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{s.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-muted)" }}>{pipeline[s.id].length}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-faint)", marginBottom: 14 }}>{s.desc}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pipeline[s.id].map(card => <DealCard key={card.id} card={card} stage={s} navigate={navigate} onEditCard={onEditCard} onContractCard={onContractCard} onPreviewProposal={onPreviewProposal} onPreviewContract={onPreviewContract} />)}
                {pipeline[s.id].length === 0 && (
                  <div style={{ padding: "28px 12px", border: "1px dashed var(--line-strong)", borderRadius: 10, textAlign: "center" }}>
                    <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 6 }}>Sem negócios aqui.</div>
                    {s.id === "lead" && <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>Use "Convidar por e-mail" para adicionar leads.</div>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DealCard = ({ card, stage, navigate, onEditCard, onContractCard, onPreviewProposal, onPreviewContract }) => (
  <div draggable
    onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/menctor-card", card.id); e.currentTarget.style.opacity = "0.55"; e.currentTarget.style.transform = "scale(0.98)"; }}
    onDragEnd={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
    style={{ background: "var(--surface)", borderRadius: 10, padding: 12, boxShadow: "var(--shadow-card)", cursor: "grab", transition: "opacity .12s, transform .12s" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>{card.empresa}</div>
      <Icon name="more" size={14} color="var(--ink-faint)" />
    </div>
    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 10 }}>{card.contato}</div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 10.5, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Valor / mês</div>
        <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 18, color: "var(--ink)", lineHeight: 1, marginTop: 2 }}>R$ {(card.valor/1000).toFixed(1)}k</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 10.5, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Colab.</div>
        <div style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 2 }}>{card.funcionarios}</div>
      </div>
    </div>
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: "var(--ink-muted)" }}>
      <span>Há {card.dias}d</span>
      {stage.id === "lead"     && <button onClick={(e) => { e.stopPropagation(); onEditCard && onEditCard(card); }} style={{ fontSize: 11, color: "#fff", background: "var(--health-deep)", display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, fontWeight: 600, border: "none", cursor: "pointer" }}><Icon name="send" size={11}/> Enviar proposta</button>}
      {stage.id === "proposta" && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPreviewProposal && onPreviewProposal(card); }} style={{ fontSize: 11, color: "var(--health-deep)", display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}><Icon name="eye" size={11}/> Ver</button>
          <button onClick={async (e) => { e.stopPropagation(); const ok = await copyProposalLink(card); if (ok) { const t = e.currentTarget; t.innerHTML = "✓ Copiado"; setTimeout(() => { if (t && t.isConnected) t.innerHTML = `<span style='display:inline-flex;align-items:center;gap:3px'><svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3'><path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'></path></svg> Link</span>`; }, 1400); } }} style={{ fontSize: 11, color: "var(--health-deep)", display: "inline-flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", marginLeft: 6 }}>
            <Icon name="link" size={10}/> Link
          </button>
          {window.localStorage.getItem(PROPOSAL_ACCEPTED_KEY(card.id)) && <span style={{ fontSize: 10, background: "var(--surface-sage)", color: "var(--health-deep)", padding: "1px 7px", borderRadius: 999, marginLeft: 6 }}>Aceita</span>}
        </>
      )}
      {stage.id === "aceita"   && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onContractCard && onContractCard(card); }} style={{ fontSize: 11, color: "#fff", background: "var(--orange)", display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, fontWeight: 600, border: "none", cursor: "pointer" }}><Icon name="file" size={11}/> Enviar contrato</button>
          <button onClick={async (e) => { e.stopPropagation(); const c = { ...card, proximoPasso: "Aguardando assinatura do contrato" }; saveContractSnapshot(c); const ok = await copyContractLink(c); if (ok) { moveCard(card, "contrato", c); } }} style={{ fontSize: 11, color: "var(--health-deep)", display: "inline-flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", marginLeft: 4 }} title="Copiar link direto e mover para Contrato">
            <Icon name="link" size={10}/> Link
          </button>
          {card.propostaAceitaEm && <span title="Aceita via link pelo cliente" style={{ fontSize: 10, marginLeft: 6, padding: "1px 6px", borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)" }}>via link</span>}
        </>
      )}
      {stage.id === "contrato" && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPreviewContract && onPreviewContract(card); }} style={{ fontSize: 11, color: "var(--health-deep)", display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}><Icon name="eye" size={11}/> Ver</button>
          <button onClick={async (e) => { e.stopPropagation(); const ok = await copyContractLink(card); if (ok) { const t = e.currentTarget; const orig = t.innerHTML; t.innerHTML = "✓ Copiado"; setTimeout(() => { if (t && t.isConnected) t.innerHTML = orig; }, 1400); } }} style={{ fontSize: 11, color: "var(--health-deep)", display: "inline-flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", marginLeft: 6 }}>
            <Icon name="link" size={10}/> Link
          </button>
          {window.localStorage.getItem(CONTRACT_ACCEPTED_KEY(card.id)) && <span style={{ fontSize: 10, background: "var(--surface-sage)", color: "var(--health-deep)", padding: "1px 7px", borderRadius: 999, marginLeft: 6 }}>Assinado</span>}
        </>
      )}
      {stage.id === "fechado"  && <span className="pill" style={{ fontSize: 10, padding: "2px 8px" }}>Cliente ativo</span>}
    </div>
  </div>
);

Object.assign(window, { PipelineScreen, LeadInviteForm, getProposalLink, copyProposalLink, PROPOSAL_ACCEPTED_KEY, getContractLink, copyContractLink, CONTRACT_ACCEPTED_KEY });
