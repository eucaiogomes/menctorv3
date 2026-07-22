/* global React, Icon, Page, CLIENTES, DIAGNOSTICOS, CAMPANHAS, getCampanhaRespondidos, getCampanhaStatusEfetivo */

// ════════════════════════════════════════════════════════════
// CAMPANHAS — cria e distribui um link de coleta para um
// diagnóstico habilitado de uma empresa, com controle de período
// e checagem de CPF único.
// ════════════════════════════════════════════════════════════

const SETORES_CAMPANHA = ["Operações", "Administrativo", "Comercial", "Logística", "Tecnologia", "RH"];
const CARGOS_CAMPANHA  = ["Estagiário", "Assistente", "Analista", "Coordenador", "Gerente", "Diretor"];

const CAMPANHA_LINK_KEY = (id) => `MENCTOR_CAMPANHA_${id}`;

const saveCampanhaSnapshot = (campanha) => {
  if (!campanha || !campanha.id) return;
  try {
    window.localStorage.setItem(CAMPANHA_LINK_KEY(campanha.id), JSON.stringify({ ...campanha, savedAt: new Date().toISOString() }));
  } catch (e) {}
};

const getCampanhaLink = (campanha, extra = {}) => {
  if (!campanha || !campanha.id) return "";
  const url = new URL(`${window.location.origin}/`);
  url.searchParams.set("campanha", campanha.id);
  if (extra.setor) url.searchParams.set("setor", extra.setor);
  if (extra.cargo) url.searchParams.set("cargo", extra.cargo);
  return url.toString();
};

const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    window.prompt("Copie o link:", text);
    return true;
  }
};

const fmtData = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

// ── iOS-style toggle switch ──────────────────────────────────
const Toggle = ({ on, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!on)}
    disabled={disabled}
    style={{
      width: 42, height: 25, borderRadius: 999, border: "none", padding: 2,
      background: on ? "var(--health)" : "var(--line-strong)",
      display: "inline-flex", alignItems: "center",
      justifyContent: on ? "flex-end" : "flex-start",
      cursor: disabled ? "default" : "pointer",
      transition: "background .18s ease", flexShrink: 0,
    }}
    aria-pressed={on}
  >
    <span style={{ width: 21, height: 21, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "transform .18s ease" }} />
  </button>
);

// ════════════════════════════════════════════════════════════
// SCREEN
// ════════════════════════════════════════════════════════════
const CampanhasScreen = ({ navigate }) => {
  const [campanhas, setCampanhas] = React.useState(CAMPANHAS);
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [linkFor, setLinkFor] = React.useState(null);

  const clienteById = (id) => CLIENTES.find(c => c.id === id);
  const diagnosticoById = (id) => DIAGNOSTICOS.find(d => d.id === id);

  const upsertCampanha = (campanha) => {
    setCampanhas(prev => {
      const exists = prev.some(c => c.id === campanha.id);
      return exists ? prev.map(c => c.id === campanha.id ? campanha : c) : [campanha, ...prev];
    });
    setCreating(false);
    setEditing(null);
  };

  const toggleStatus = (id) => {
    setCampanhas(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "ativa" ? "inativa" : "ativa" } : c));
  };

  const duplicar = (campanha) => {
    setCampanhas(prev => [{ ...campanha, id: `campanha-${Date.now()}`, titulo: `${campanha.titulo} (cópia)`, status: "inativa", respondidos: 0, createdAt: new Date().toISOString() }, ...prev]);
  };

  const excluir = (campanha) => {
    if (!window.confirm(`Excluir a campanha "${campanha.titulo}"? Essa ação não pode ser desfeita.`)) return;
    setCampanhas(prev => prev.filter(c => c.id !== campanha.id));
  };

  return (
    <Page>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Coleta de avaliações</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Campanhas</h1>
          <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 620 }}>
            Gere campanhas com período definido para os diagnósticos habilitados de cada empresa, e distribua o link de resposta com controle de CPF único.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn btn-accent" style={{ height: 42, padding: "0 18px", fontSize: 14 }}>
          <Icon name="plus" size={16} /> Nova Campanha
        </button>
      </div>

      {campanhas.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-muted)" }}>
          Nenhuma campanha criada ainda. Clique em "Nova Campanha" para começar.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {campanhas.map(c => {
            const cliente = clienteById(c.clienteId);
            const diagnostico = diagnosticoById(c.diagnosticoId);
            const respondidos = getCampanhaRespondidos(c);
            const pct = c.quantidadeFuncionarios ? Math.min(100, Math.round((respondidos / c.quantidadeFuncionarios) * 100)) : 0;
            const completa = respondidos >= c.quantidadeFuncionarios;
            const statusEfetivo = getCampanhaStatusEfetivo(c);
            const encerradaPorPrazo = statusEfetivo === "encerrada" && !completa;
            return (
              <div key={c.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 17, color: "var(--ink)" }}>{c.titulo}</span>
                    {encerradaPorPrazo ? (
                      <span className="pill pill-neutral" style={{ fontSize: 10.5 }}>Encerrada</span>
                    ) : (
                      <span className={`pill ${c.status === "ativa" ? "pill-brand" : "pill-neutral"}`} style={{ fontSize: 10.5 }}>{c.status === "ativa" ? "Ativa" : "Inativa"}</span>
                    )}
                    {completa && <span className="pill pill-sky" style={{ fontSize: 10.5 }}>Meta atingida</span>}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span>{cliente ? cliente.name : "Empresa removida"}</span>
                    <span>·</span>
                    <span>{diagnostico ? diagnostico.name : "Diagnóstico removido"}</span>
                    <span>·</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="calendar" size={12} /> {fmtData(c.dataInicial)} – {fmtData(c.dataFinal)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9, maxWidth: 320 }}>
                    <div style={{ flex: 1, height: 5, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: completa ? "var(--health)" : "var(--accent)", transition: "width .4s ease" }} />
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
                      <Icon name="users" size={11} style={{ marginRight: 3, verticalAlign: -1 }} />{respondidos} / {c.quantidadeFuncionarios} ({pct}%)
                    </span>
                  </div>
                </div>
                {completa ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => navigate && navigate("campanha-resultado", { campanhaId: c.id })} className="btn btn-accent" style={{ height: 34, fontSize: 12.5 }}>
                      <Icon name="bar-chart" size={13} /> Resultado final
                    </button>
                    <button onClick={() => navigate && navigate("relatorios", { clienteId: c.clienteId })} className="btn btn-soft" style={{ height: 34, fontSize: 12.5 }}>
                      <Icon name="file" size={13} /> Relatório
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Toggle on={c.status === "ativa"} onChange={() => toggleStatus(c.id)} />
                    <button onClick={() => setLinkFor(c)} className="btn btn-soft" style={{ height: 34, fontSize: 12.5 }}><Icon name="link" size={13} /> Link</button>
                    <button onClick={() => duplicar(c)} title="Duplicar" style={{ width: 34, height: 34, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)" }}><Icon name="clipboard" size={15} /></button>
                    <button onClick={() => setEditing(c)} title="Editar" style={{ width: 34, height: 34, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)" }}><Icon name="edit" size={15} /></button>
                    <button onClick={() => excluir(c)} title="Excluir" style={{ width: 34, height: 34, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--coral)" }}><Icon name="trash" size={15} /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <NovaCampanhaModal
          initial={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={upsertCampanha}
        />
      )}

      {linkFor && (
        <LinkCampanhaModal
          campanha={linkFor}
          cliente={clienteById(linkFor.clienteId)}
          onClose={() => setLinkFor(null)}
        />
      )}
    </Page>
  );
};

// ════════════════════════════════════════════════════════════
// NOVA CAMPANHA — modal de criação/edição
// ════════════════════════════════════════════════════════════
const NovaCampanhaModal = ({ initial, onClose, onSave }) => {
  const isEdit = !!initial;
  const [titulo, setTitulo] = React.useState(initial?.titulo || "");
  const [clienteId, setClienteId] = React.useState(initial?.clienteId || "");
  const [diagnosticoId, setDiagnosticoId] = React.useState(initial?.diagnosticoId || "");
  const [dataInicial, setDataInicial] = React.useState(initial?.dataInicial || "");
  const [dataFinal, setDataFinal] = React.useState(initial?.dataFinal || "");
  const [quantidade, setQuantidade] = React.useState(initial?.quantidadeFuncionarios ? String(initial.quantidadeFuncionarios) : "");
  const [ativa, setAtiva] = React.useState(initial ? initial.status === "ativa" : true);

  const cliente = CLIENTES.find(c => c.id === clienteId);
  const diagnosticosDisponiveis = cliente
    ? DIAGNOSTICOS.filter(d => (cliente.diagnosticosHabilitados || []).includes(d.id))
    : [];

  React.useEffect(() => {
    // se trocar de empresa e o diagnóstico atual não estiver mais disponível, limpa
    if (diagnosticoId && !diagnosticosDisponiveis.some(d => d.id === diagnosticoId)) {
      setDiagnosticoId("");
    }
  }, [clienteId]); // eslint-disable-line

  const valido = titulo.trim() && clienteId && diagnosticoId && dataInicial && dataFinal && Number(quantidade) > 0;

  const salvar = () => {
    if (!valido) return;
    onSave({
      id: initial?.id || `campanha-${Date.now()}`,
      titulo: titulo.trim(),
      clienteId,
      diagnosticoId,
      dataInicial,
      dataFinal,
      quantidadeFuncionarios: Number(quantidade),
      status: ativa ? "ativa" : "inativa",
      respondidos: initial?.respondidos || 0,
      createdAt: initial?.createdAt || new Date().toISOString(),
    });
  };

  const fieldStyle = { width: "100%", height: 42, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", fontSize: 14 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", padding: 24, animation: "fade-in 200ms ease-out" }}>
      <div onClick={e => e.stopPropagation()} className="modal" style={{ width: "min(480px, 100%)", maxHeight: "88vh", overflowY: "auto", padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Icon name="calendar" size={18} color="var(--health-deep)" />
            <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 19, color: "var(--ink)" }}>{isEdit ? "Editar Campanha" : "Nova Campanha"}</span>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)" }}><Icon name="x" size={16} /></button>
        </div>
        <p style={{ margin: "4px 0 20px", fontSize: 13, color: "var(--ink-muted)" }}>
          Crie uma campanha para coletar avaliações com período definido e controle de CPF único.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>Título da campanha *</div>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Avaliação Semestral 2026" style={fieldStyle} />
          </div>

          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>Empresa *</div>
            <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={fieldStyle}>
              <option value="">Selecione a empresa</option>
              {CLIENTES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>Diagnóstico *</div>
            <select value={diagnosticoId} onChange={e => setDiagnosticoId(e.target.value)} disabled={!clienteId} style={{ ...fieldStyle, opacity: clienteId ? 1 : 0.6 }}>
              <option value="">{clienteId ? "Selecione o diagnóstico" : "Selecione a empresa primeiro"}</option>
              {diagnosticosDisponiveis.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {clienteId && diagnosticosDisponiveis.length === 0 && (
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--coral)" }}>
                Nenhum diagnóstico habilitado para esta empresa. Habilite em Diagnósticos.
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>Data Inicial *</div>
              <input type="date" value={dataInicial} onChange={e => setDataInicial(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>Data Final *</div>
              <input type="date" value={dataFinal} onChange={e => setDataFinal(e.target.value)} style={fieldStyle} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>Quantidade de funcionários *</div>
            <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="Ex: 50" style={fieldStyle} />
            <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-faint)" }}>A campanha será encerrada automaticamente ao atingir este número de avaliações.</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Status da Campanha</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{ativa ? "Campanha recebendo avaliações" : "Campanha pausada"}</div>
            </div>
            <Toggle on={ativa} onChange={setAtiva} />
          </div>

          <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--surface-sage)", border: "1px solid var(--health-soft)", fontSize: 12, color: "var(--health-deep)", lineHeight: 1.5 }}>
            <strong>Dica:</strong> Cada CPF poderá responder apenas uma vez por campanha, garantindo respostas únicas e evitando duplicidades.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", height: 42 }}>Cancelar</button>
          <button onClick={salvar} disabled={!valido} className="btn btn-accent" style={{ flex: 1, justifyContent: "center", height: 42, opacity: valido ? 1 : 0.55 }}>
            {isEdit ? "Salvar alterações" : "Criar Campanha"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// LINK DA CAMPANHA — link simples + link com parâmetros (setor/cargo)
// ════════════════════════════════════════════════════════════
const LinkCampanhaModal = ({ campanha, cliente, onClose }) => {
  const [setor, setSetor] = React.useState("");
  const [cargo, setCargo] = React.useState("");
  const [copied, setCopied] = React.useState("");

  React.useEffect(() => { saveCampanhaSnapshot(campanha); }, [campanha]);

  const linkSimples = getCampanhaLink(campanha);
  const linkParametrizado = getCampanhaLink(campanha, { setor, cargo });

  const qrUrl = (link) => `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(link)}`;

  const handleCopy = async (link, key) => {
    const ok = await copyToClipboard(link);
    if (ok) { setCopied(key); setTimeout(() => setCopied(""), 1600); }
  };

  const LinkBlock = ({ label, hint, link, copyKey, disabled }) => (
    <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", opacity: disabled ? 0.55 : 1 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginBottom: 12 }}>{hint}</div>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ padding: "9px 11px", borderRadius: 9, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--ink-soft)", overflowWrap: "break-word" }}>
            {link}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button disabled={disabled} onClick={() => handleCopy(link, copyKey)} className="btn btn-soft" style={{ height: 32, fontSize: 12 }}>
              <Icon name="clipboard" size={13} /> {copied === copyKey ? "Copiado!" : "Copiar"}
            </button>
            <button disabled={disabled} onClick={() => window.open(link, "_blank", "noopener")} className="btn btn-primary" style={{ height: 32, fontSize: 12 }}>
              <Icon name="external" size={13} /> Abrir
            </button>
          </div>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <img src={qrUrl(link)} width={90} height={90} alt={`QR code — ${label}`} style={{ borderRadius: 8, border: "1px solid var(--line)" }} />
          <a href={qrUrl(link)} download={`qr-${campanha.id}.png`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--health-deep)", marginTop: 6 }}>
            <Icon name="download" size={11} /> Baixar
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", padding: 24, animation: "fade-in 200ms ease-out" }}>
      <div onClick={e => e.stopPropagation()} className="modal" style={{ width: "min(560px, 100%)", maxHeight: "88vh", overflowY: "auto", padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Icon name="link" size={18} color="var(--health-deep)" />
            <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 19, color: "var(--ink)" }}>Link da Campanha</span>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)" }}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{campanha.titulo}{cliente ? ` — ${cliente.name}` : ""}</div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="calendar" size={12} /> {fmtData(campanha.dataInicial)} até {fmtData(campanha.dataFinal)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <LinkBlock
            label="Link Simples"
            hint="O respondente preencherá setor e cargo manualmente."
            link={linkSimples}
            copyKey="simples"
          />

          <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>Link com Parâmetros</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginBottom: 12 }}>Pré-defina setor e cargo para facilitar o preenchimento.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <select value={setor} onChange={e => setSetor(e.target.value)} style={{ height: 38, padding: "0 10px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 12.5, color: "var(--ink)" }}>
                <option value="">Selecione o setor</option>
                {SETORES_CAMPANHA.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={cargo} onChange={e => setCargo(e.target.value)} style={{ height: 38, padding: "0 10px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 12.5, color: "var(--ink)" }}>
                <option value="">Selecione o cargo</option>
                {CARGOS_CAMPANHA.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ padding: "9px 11px", borderRadius: 9, background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--ink-soft)", overflowWrap: "break-word" }}>
                  {linkParametrizado}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => handleCopy(linkParametrizado, "params")} className="btn btn-soft" style={{ height: 32, fontSize: 12 }}>
                    <Icon name="clipboard" size={13} /> {copied === "params" ? "Copiado!" : "Copiar"}
                  </button>
                  <button onClick={() => window.open(linkParametrizado, "_blank", "noopener")} className="btn btn-primary" style={{ height: 32, fontSize: 12 }}>
                    <Icon name="external" size={13} /> Abrir
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <img src={qrUrl(linkParametrizado)} width={90} height={90} alt="QR code — link com parâmetros" style={{ borderRadius: 8, border: "1px solid var(--line)" }} />
                <a href={qrUrl(linkParametrizado)} download={`qr-${campanha.id}-parametros.png`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--health-deep)", marginTop: 6 }}>
                  <Icon name="download" size={11} /> Baixar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CampanhasScreen, getCampanhaLink, CAMPANHA_LINK_KEY });
