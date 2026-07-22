/* global React, Icon, Page, DIAGNOSTICOS, DIAG_DIMS_MAP */

const TEMPLATE_LEVEL_META = [
  { label: "Saudável",   color: "var(--health)", bg: "var(--surface-sage)" },
  { label: "Moderado",   color: "var(--amber)",  bg: "var(--amber-soft)" },
  { label: "Alto risco", color: "var(--coral)",  bg: "var(--coral-soft)" },
  { label: "Crítico",    color: "#9c3d31",       bg: "#F2D9D4" },
];

const DiagnosticosScreen = ({ initialCreate }) => {
  const [creating, setCreating] = React.useState(initialCreate || false);
  const [diagnosticos, setDiagnosticos] = React.useState(DIAGNOSTICOS);

  const handleCreate = (diagnostico) => {
    setDiagnosticos(prev => [diagnostico, ...prev]);
    setCreating(false);
  };

  if (creating) {
    return <CreateFullPage onClose={() => setCreating(false)} onCreate={handleCreate} />;
  }

  return (
    <Page>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Biblioteca de aplicacao</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Diagnosticos</h1>
          <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 620 }}>
            Crie e organize os diagnosticos disponiveis. Os diagnosticos em andamento ficam nos clientes, no roadmap e nos relatorios.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn btn-accent" style={{ height: 42, padding: "0 18px", fontSize: 14 }}>
          <Icon name="plus" size={16} /> Novo diagnostico
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        <DiagStat label="Diagnosticos criados" value={diagnosticos.length} />
        <DiagStat label="Templates base" value={DIAGNOSTICOS.length} accent="health" />
        <DiagStat label="Criar novo" value="+" accent="orange" />
      </div>

      <BibliotecaView diagnosticos={diagnosticos} onUse={() => setCreating(true)} />
    </Page>
  );
};

const BibliotecaView = ({ diagnosticos, onUse }) => {
  // Painel de detalhe é único e fica no nível da lista — evita abrir um
  // por card (o que empilhava vários modais ao clicar em olhinhos diferentes).
  const [detalheId, setDetalheId] = React.useState(null);
  const selecionado = diagnosticos.find(d => d.id === detalheId) || null;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {diagnosticos.map(d => <TemplateCard key={d.id} d={d} onUse={onUse} onVerDetalhe={() => setDetalheId(d.id)} />)}
      </div>
      {selecionado && (
        <TemplateDetalhePanel
          d={selecionado}
          onClose={() => setDetalheId(null)}
          onUse={() => { setDetalheId(null); onUse(); }}
        />
      )}
    </>
  );
};

const TEMPLATE_COLOR_MAP = {
  "COPSOQ II": ["#E8F0EC", "#2F7D6F"],
  "Pulse": ["#DCE6EE", "#4E83A8"],
  "Maslach": ["#F2D9D4", "#9c3d31"],
  "Gallup Q12": ["#F4E4C7", "#8a5a18"],
  "eNPS": ["#E8F0EC", "#2F7D6F"],
  "Clima": ["#F4E4D6", "#a05a25"],
  "DISC": ["#DCE6EE", "#4E83A8"],
  "NASA-TLX": ["#F2D9D4", "#9c3d31"],
};

const TemplateCard = ({ d, onUse, onVerDetalhe }) => {
  const [bg, fg] = TEMPLATE_COLOR_MAP[d.type] || ["var(--surface-2)", "var(--ink)"];

  return (
    <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14, minHeight: 220 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          padding: "4px 10px", borderRadius: 999,
          background: bg, color: fg,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase"
        }}>{d.type}</div>
        {d.popular && <span className="pill" style={{ fontSize: 10.5, background: "var(--surface-peach)", color: "#a05a25" }}>Popular</span>}
      </div>
      <div>
        <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 24, margin: 0, lineHeight: 1.15, color: "var(--ink)" }}>{d.name}</h3>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.5 }}>{d.desc}</p>
      </div>
      <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--ink-muted)", marginTop: "auto" }}>
        <span>{d.questions} questoes</span>
        <span>·</span>
        <span>{d.levels} niveis</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onUse} className="btn btn-primary" style={{ flex: 1, justifyContent: "center", height: 36, fontSize: 13 }}>
          <Icon name="plus" size={14} /> Duplicar
        </button>
        <button onClick={onVerDetalhe} aria-label={`Ver detalhes de ${d.name}`} title="Ver detalhes" className="btn btn-ghost" style={{ height: 36, width: 36, padding: 0, justifyContent: "center" }}>
          <Icon name="eye" size={15} />
        </button>
      </div>
    </div>
  );
};

const TemplateDetalhePanel = ({ d, onClose, onUse }) => {
  const [bg, fg] = TEMPLATE_COLOR_MAP[d.type] || ["var(--surface-2)", "var(--ink)"];
  const dims = (DIAG_DIMS_MAP || {})[d.id];
  const niveis = TEMPLATE_LEVEL_META.slice(0, d.levels);

  React.useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="side-panel-scrim" onClick={onClose} />
      <div
        className="side-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes do diagnóstico ${d.name}`}
      >
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                padding: "4px 10px", borderRadius: 999,
                background: bg, color: fg,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase"
              }}>{d.type}</div>
              {d.popular && <span className="pill" style={{ fontSize: 10.5, background: "var(--surface-peach)", color: "#a05a25" }}>Popular</span>}
            </div>
            <button onClick={onClose} aria-label="Fechar" style={{ color: "var(--ink-muted)", padding: 4, borderRadius: 8, flexShrink: 0 }}>
              <Icon name="x" size={18} />
            </button>
          </div>

          <h2 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 26, margin: 0, lineHeight: 1.2, color: "var(--ink)" }}>{d.name}</h2>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.55 }}>{d.desc}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, margin: "20px 0" }}>
            <div style={{ padding: "12px 14px", background: "var(--canvas-warm)", borderRadius: 10 }}>
              <div style={{ fontSize: 10.5, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Perguntas</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 20, marginTop: 4, color: "var(--ink)" }}>{d.questions}</div>
            </div>
            <div style={{ padding: "12px 14px", background: "var(--canvas-warm)", borderRadius: 10 }}>
              <div style={{ fontSize: 10.5, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Níveis de classificação</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 20, marginTop: 4, color: "var(--ink)" }}>{d.levels}</div>
            </div>
          </div>

          {dims && (
            <div style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Dimensões avaliadas</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {dims.map(dim => (
                  <span key={dim.name} className="pill" style={{ fontSize: 12, background: "var(--canvas-warm)", color: "var(--ink)" }}>{dim.name}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 8 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Escala de classificação de risco</div>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 8, marginBottom: 10 }}>
              {niveis.map(n => (
                <div key={n.label} style={{ flex: 1, background: n.color }} />
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {niveis.map(n => (
                <span key={n.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ink-muted)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: n.color, flexShrink: 0 }} />
                  {n.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, padding: "16px 28px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, height: 42, justifyContent: "center" }}>Fechar</button>
          <button onClick={onUse} className="btn btn-accent" style={{ flex: 1, height: 42, justifyContent: "center" }}>
            <Icon name="plus" size={14} /> Duplicar este diagnóstico
          </button>
        </div>
      </div>
    </>
  );
};

const CreateFullPage = ({ onClose, onCreate }) => {
  const [step, setStep] = React.useState(1);
  const [template, setTemplate] = React.useState("copsoq");
  const [nome, setNome] = React.useState("");
  const [tipo, setTipo] = React.useState("COPSOQ II");
  const [questions, setQuestions] = React.useState(41);
  const tpl = DIAGNOSTICOS.find(d => d.id === template) || DIAGNOSTICOS[0];

  React.useEffect(() => {
    if (!nome) {
      setNome(`${tpl.name} - ${new Date().getFullYear()}`);
      setTipo(tpl.type);
      setQuestions(tpl.questions);
    }
  }, [tpl, nome]);

  const criar = () => {
    onCreate({
      id: `diag-${Date.now()}`,
      type: tipo,
      name: nome || `${tpl.name} - ${new Date().getFullYear()}`,
      questions: Number(questions) || tpl.questions,
      levels: tpl.levels,
      popular: false,
      desc: tpl.desc,
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", display: "flex", flexDirection: "column" }}>
      <div className="frosted" style={{ padding: "22px 36px", borderBottom: "var(--hairline)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ink-muted)", fontSize: 13.5 }}>
          <Icon name="chevron-left" size={15}/> Voltar para diagnosticos
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {[
            { n: 1, label: "Escolher base" },
            { n: 2, label: "Configurar" },
          ].map(s => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 999,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: s.n < step ? "var(--health)" : s.n === step ? "var(--ink)" : "var(--surface-2)",
                border: s.n > step ? "1px solid var(--line-strong)" : "none",
                color: s.n <= step ? "#fff" : "var(--ink-muted)",
                fontSize: 11, fontWeight: 700
              }}>
                {s.n < step ? "✓" : s.n}
              </span>
              <span style={{ fontSize: 13, color: s.n === step ? "var(--ink)" : "var(--ink-muted)", fontWeight: s.n === step ? 600 : 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: 13 }}>
          Sair <Icon name="x" size={14}/>
        </button>
      </div>

      <div style={{ flex: 1, padding: "48px 36px 120px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: step === 1 ? 1080 : 720 }}>
          <div style={{ marginBottom: 36 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Etapa {step} de 2</div>
            <h1 className="display" style={{ fontSize: 44, margin: 0, lineHeight: 1.05 }}>
              {step === 1 ? "Escolha uma base para comecar." : "Configure o novo diagnostico."}
            </h1>
          </div>

          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {DIAGNOSTICOS.map(d => (
                <button key={d.id} onClick={() => { setTemplate(d.id); setNome(`${d.name} - ${new Date().getFullYear()}`); setTipo(d.type); setQuestions(d.questions); }} className="card" style={{
                  padding: 22, textAlign: "left",
                  border: template === d.id ? "1px solid var(--health)" : "1px solid transparent",
                  outline: template === d.id ? "3px solid var(--surface-sage)" : "none",
                  display: "flex", flexDirection: "column", gap: 10, minHeight: 190
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-muted)" }}>{d.type}</span>
                    <span style={{
                      width: 22, height: 22, borderRadius: 99,
                      border: template === d.id ? "6px solid var(--health)" : "1px solid var(--line-strong)",
                      background: template === d.id ? "var(--surface)" : "transparent"
                    }}/>
                  </div>
                  <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 22, margin: 0, lineHeight: 1.2, color: "var(--ink)" }}>{d.name}</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0, lineHeight: 1.5 }}>{d.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <EditableField label="Nome do diagnostico" value={nome} onChange={setNome} />
              <EditableField label="Tipo" value={tipo} onChange={setTipo} />
              <EditableField label="Quantidade de questoes" value={questions} onChange={setQuestions} type="number" />
              <div style={{ padding: 18, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Base selecionada</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{tpl.name}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>{tpl.desc}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="frosted" style={{
        position: "sticky", bottom: 0, padding: "16px 36px",
        borderTop: "var(--hairline)",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <button onClick={step > 1 ? () => setStep(step - 1) : onClose} className="btn btn-ghost" style={{ height: 40 }}>
          <Icon name="chevron-left" size={14}/> {step > 1 ? "Voltar" : "Cancelar"}
        </button>
        <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
          {step === 1 ? "Escolha uma base e avance para configurar." : "Ao criar, ele aparece na lista de diagnosticos."}
        </div>
        {step < 2
          ? <button onClick={() => setStep(step + 1)} className="btn btn-primary" style={{ height: 40, padding: "0 22px" }}>Continuar <Icon name="arrow-right" size={14}/></button>
          : <button onClick={criar} className="btn btn-accent" style={{ height: 40, padding: "0 22px" }}><Icon name="plus" size={14}/> Criar diagnostico</button>
        }
      </div>
    </div>
  );
};

const EditableField = ({ label, value, onChange, type = "text" }) => (
  <label>
    <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", fontSize: 14 }}
    />
  </label>
);

const DiagStat = ({ label, value, accent }) => (
  <div className="card" style={{ padding: "14px 18px", borderRadius: "var(--r-md)" }}>
    <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    <div style={{
      fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em",
      fontSize: 28, marginTop: 6,
      color: accent === "health" ? "var(--health-deep)" : accent === "orange" ? "var(--orange)" : "var(--ink)",
    }}>{value}</div>
  </div>
);

Object.assign(window, { DiagnosticosScreen });
