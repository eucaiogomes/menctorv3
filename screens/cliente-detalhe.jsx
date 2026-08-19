/* global React, Icon, Page, CLIENTES, ROADMAP_ESTADO, ROADMAP_FASES, riskPill, riskLabel */

// ════════════════════════════════════════════════════════════
// CLIENTE DETALHE — overview + documentos gerados
// ════════════════════════════════════════════════════════════

const getRoadmapProgressDet = (clienteId) => {
  const est = ROADMAP_ESTADO[clienteId];
  if (!est) return null;
  const faseIdx = est.faseAtual;
  const fase = ROADMAP_FASES[faseIdx];
  const etapasEstado = est.etapas[faseIdx] || [];
  const concluidas = etapasEstado.filter(e => e.status === "concluida").length;
  const emAndamentoIdx = etapasEstado.findIndex(e => e.status === "em_andamento");
  const etapaAtual = emAndamentoIdx >= 0 ? emAndamentoIdx + 1 : concluidas + 1;
  const pct = Math.round((concluidas / 8) * 100);
  return { faseNumero: faseIdx + 1, faseLabel: fase.label, etapaAtual, concluidas, pct };
};

const DocLinkCard = ({ icon, title, subtitle, status, actionLabel, onAction }) => (
  <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--canvas-warm)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={icon} size={18} color="var(--health-deep)" strokeWidth={1.7} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{title}</span>
        <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: ["Pronto", "Assinado"].includes(status) ? "var(--surface-sage)" : "var(--canvas-warm)", color: ["Pronto", "Assinado"].includes(status) ? "var(--health-deep)" : "var(--ink-faint)" }}>
          {status}
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{subtitle}</div>
    </div>
    <button onClick={onAction} className="btn btn-soft" style={{ flexShrink: 0, height: 36, fontSize: 12.5 }}>
      {actionLabel} <Icon name="chevron-right" size={13} />
    </button>
  </div>
);

const ClienteDetalheScreen = ({ navigate, params = {} }) => {
  const cliente = CLIENTES.find(c => c.id === params.clienteId) || CLIENTES[0];
  const prog = getRoadmapProgressDet(cliente.id);

  let assinatura = null;
  try {
    const raw = window.localStorage.getItem(`MENCTOR_SIGN_${cliente.id}`);
    if (raw) assinatura = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  const copyDocLink = (kind) => {
    const link = `${window.location.origin}/doc/${kind}?cliente=${cliente.id}`;
    navigator.clipboard?.writeText(link);
  };

  return (
    <Page>
      <button
        onClick={() => navigate("clientes")}
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}
      >
        <Icon name="chevron-left" size={14} /> Voltar para clientes
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 28 }}>
        <span style={{
          flexShrink: 0, width: 56, height: 56, borderRadius: 14,
          background: cliente.color, color: "#fff",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--display)", fontWeight: 700, fontSize: 24,
        }}>
          {cliente.name[0]}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{cliente.sector} · {cliente.cnpj}</div>
          <h1 className="display" style={{ fontSize: 36, margin: 0 }}>{cliente.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, fontSize: 13, color: "var(--ink-muted)" }}>
            <span>{cliente.contact}</span>
            <span>·</span>
            <span>{cliente.employees.toLocaleString("pt-BR")} colaboradores</span>
            {cliente.risk && (
              <>
                <span>·</span>
                <span className={`pill ${riskPill(cliente.risk)}`} style={{ fontSize: 11 }}>{cliente.risk.toFixed(2)} · {riskLabel(cliente.risk)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        <div style={{ padding: "14px 18px", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>MRR</div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 24, marginTop: 6, color: "var(--ink)" }}>R$ {cliente.mrr.toLocaleString("pt-BR")}</div>
        </div>
        <div style={{ padding: "14px 18px", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Última avaliação</div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 24, marginTop: 6, color: "var(--ink)" }}>{cliente.lastDiag || "—"}</div>
        </div>
        <div style={{ padding: "14px 18px", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Progresso do roadmap</div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 24, marginTop: 6, color: "var(--health-deep)" }}>{prog ? `${prog.pct}%` : "—"}</div>
        </div>
      </div>

      {prog && (
        <div className="card" style={{ padding: "18px 20px", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="map" size={14} color="var(--health-deep)" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--health-deep)" }}>
                Fase {prog.faseNumero} · Etapa {prog.etapaAtual}/8 — {prog.faseLabel}
              </span>
            </div>
            <span style={{ fontSize: 12, color: "var(--health-deep)", fontWeight: 600 }}>{prog.pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "rgba(47,125,111,0.18)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, background: "var(--health)", width: `${prog.pct}%`, transition: "width .4s ease" }} />
          </div>
        </div>
      )}

      <div className="eyebrow" style={{ marginBottom: 14 }}>Documentos gerados</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        <DocLinkCard
          icon="file-text"
          title="Contrato NR-01"
          subtitle={assinatura
            ? `Assinado por ${assinatura.signerName} · código ${assinatura.signatureId}`
            : "Página com assinatura eletrônica — envie o link para o cliente assinar"}
          status={assinatura ? "Assinado" : "Aguardando assinatura"}
          actionLabel="Ver contrato"
          onAction={() => navigate("doc-contrato", { cliente: cliente.id })}
        />
        <DocLinkCard
          icon="presentation"
          title="Proposta personalizada"
          subtitle="Apresentação premium — o cliente pode visualizar e baixar em PDF"
          status="Pronto"
          actionLabel="Ver proposta"
          onAction={() => navigate("doc-proposta", { cliente: cliente.id })}
        />
        <DocLinkCard
          icon="map"
          title="Plano do roadmap"
          subtitle={prog ? `Fase ${prog.faseNumero} de 3 · Etapa ${prog.etapaAtual}/8` : "Ainda não iniciado"}
          status={prog ? "Em andamento" : "Pendente"}
          actionLabel="Abrir roadmap"
          onAction={() => navigate("roadmap", { clienteId: cliente.id })}
        />
        <DocLinkCard
          icon="activity"
          title="Matriz de Risco (PGR)"
          subtitle="Classificação 5×5 (Probabilidade × Severidade) por fator psicossocial e framework normativo"
          status="Configurada"
          actionLabel="Abrir matriz"
          onAction={() => navigate("matriz-risco", { clienteId: cliente.id })}
        />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("roadmap", { clienteId: cliente.id })} className="btn btn-primary" style={{ height: 40, fontSize: 13 }}>
          <Icon name="map" size={14} /> Gerenciar 8 Etapas do Projeto
        </button>
        <button onClick={() => navigate("matriz-risco", { clienteId: cliente.id })} className="btn btn-soft" style={{ height: 38, fontSize: 13, background: "var(--accent-soft)", color: "var(--accent-cta)", border: "1px solid var(--accent-light)" }}>
          <Icon name="activity" size={13} color="var(--accent-cta)" /> Matriz de Risco (PGR)
        </button>
        <button onClick={() => navigate("plano-acao", { clienteId: cliente.id })} className="btn btn-soft" style={{ height: 38, fontSize: 13 }}>
          <Icon name="clipboard" size={13} /> Plano de Ação
        </button>
        <button onClick={() => navigate("relatorios", { clienteId: cliente.id })} className="btn btn-soft" style={{ height: 38, fontSize: 13 }}>
          <Icon name="file" size={13} /> Relatórios
        </button>
      </div>
    </Page>
  );
};
