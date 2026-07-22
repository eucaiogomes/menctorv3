/* global React, Icon, Logo */

// ════════════════════════════════════════════════════════════
// ADMIN RH SHELL — Loghaus' HR view. Single-company, applied focus.
// ════════════════════════════════════════════════════════════

const ADMIN_NAV = [
  { id: "admin-home",         icon: "home",     label: "Visão geral" },
  { id: "admin-diagnosticos", icon: "pulse",    label: "Diagnósticos" },
  { id: "admin-relatorios",   icon: "file",     label: "Relatórios Finais" },
  { id: "admin-colaboradores",icon: "users",    label: "Colaboradores" },
  { id: "admin-vitrine",      icon: "globe",    label: "Vitrine" },
  { id: "admin-aprendizado",  icon: "book",     label: "Aprendizado" },
];

const downloadPDF = () => {
  const link = document.createElement("a");

  // arquivo real no projeto
  link.href = "relatorio_psicossocial.pdf";

  // nome do download
  link.download = "relatorio_psicossocial.pdf";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Loghaus brand (the client company) — distinct from Menctor
const LoghausLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "#F66B0A",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden"
    }}>
      {/* stylized L + arrow (logistics) */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M6 4v14h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 14l4 4-4 4" stroke="#FF8636" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 -6)"/>
      </svg>
    </div>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span style={{ fontFamily: "var(--sans)", fontSize: 17, fontWeight: 700, color: "#00204D", letterSpacing: "-0.01em" }}>LOGHAUS</span>
      <span style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-muted)", textTransform: "uppercase", marginTop: 3 }}>logística</span>
    </div>
  </div>
);

const AdminSidebar = ({ active, onNavigate, open = true, onClose }) => (
  <aside className={`sidebar${open ? " open" : ""}`} style={{ background: "#FAFBFD", borderRight: "1px solid #E7EAF1" }}>
    <div style={{ padding: "8px 12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <LoghausLogo />
      {onClose && (
        <button onClick={onClose} style={{ width: 32, height: 32, border: "none", background: "#F1F2F7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#5C667C" }} aria-label="Fechar menu">×</button>
      )}
    </div>

    <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {ADMIN_NAV.map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} className={`nav-item${isActive ? " is-active" : ""}`} onClick={() => onNavigate(item.id)}>
            <Icon name={item.icon} size={17} strokeWidth={isActive ? 2 : 1.6}
              color={isActive ? "#F66B0A" : "#5C667C"} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>

    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card" style={{ padding: 14, background: "#FFFFFF", border: "1px solid #E7EAF1" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#F66B0A", lineHeight: 1.2 }}>
          Suporte do consultor
        </div>
        <p style={{ fontSize: 12, color: "#5C667C", margin: "6px 0 10px" }}>
          Caio Guedes responde em até 24h.
        </p>
        <button className="btn btn-primary" style={{ height: 30, fontSize: 12, padding: "0 12px" }}>
          Falar com Caio <Icon name="arrow-right" size={12} />
        </button>
      </div>
      <div style={{ padding: "6px 8px", fontSize: 10.5, color: "#838DA0", display: "flex", alignItems: "center", gap: 6 }}>
        Saúde psicossocial por
        <span style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 13, color: "#89919F" }}>menctor</span>
      </div>
    </div>
  </aside>
);

// ════════════════════════════════════════════════════════════
// ADMIN HOME — single company NR-1 view, filtered by setor
// ════════════════════════════════════════════════════════════
const SETORES = [
  { id: "ops",    nome: "Operações",     colab: 142, risco: 2.61, adesao: 94 },
  { id: "adm",    nome: "Administrativo", colab: 48,  risco: 2.04, adesao: 89 },
  { id: "com",    nome: "Comercial",     colab: 72,  risco: 2.32, adesao: 87 },
  { id: "log",    nome: "Logística",     colab: 64,  risco: 2.18, adesao: 92 },
  { id: "ti",     nome: "Tecnologia",    colab: 14,  risco: 1.86, adesao: 100 },
];

const UNIDADES = [
  { id: "matriz",   nome: "Matriz · SP",        colab: 198, risco: 2.38, adesao: 93 },
  { id: "filial-rj",nome: "Filial · RJ",         colab: 87,  risco: 2.55, adesao: 88 },
  { id: "filial-mg",nome: "Filial · MG",         colab: 55,  risco: 2.12, adesao: 96 },
];

const TURNOS = [
  { id: "manha",   nome: "Manhã (06h–14h)",    colab: 134, risco: 2.27, adesao: 95 },
  { id: "tarde",   nome: "Tarde (14h–22h)",    colab: 128, risco: 2.44, adesao: 91 },
  { id: "noite",   nome: "Noite (22h–06h)",    colab: 78,  risco: 2.71, adesao: 86 },
];

const GROUPING_DATA = { setor: SETORES, unidade: UNIDADES, turno: TURNOS };

const AdminHome = ({ navigate }) => {
  const [sectorGrouping, setSectorGrouping] = React.useState("setor");
  const [lembreteToast, setLembreteToast] = React.useState(false);
  const grupoAtivo = GROUPING_DATA[sectorGrouping];
  const media = SETORES.reduce((s,x) => s + x.risco * x.colab, 0) / SETORES.reduce((s,x) => s + x.colab, 0);
  const loghausAvaliacao = AVALIACOES_ATIVAS.find(a => a.cliente === "Loghaus" && a.status === "Em campo") || AVALIACOES_ATIVAS.find(a => a.cliente === "Loghaus");
  return (
    <Page>
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Quinta · 27 de maio · Loghaus Logística</div>
        <h1 className="display" style={{ fontSize: 48, margin: 0, lineHeight: 1.05 }}>
          Bom dia, Mariana.
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, color: "var(--ink-soft)", maxWidth: 620, lineHeight: 1.5 }}>
          O Caio Guedes acaba de disponibilizar a <strong style={{ color: "var(--ink)" }}>Pesquisa de Clima 1º Trim/2026</strong>. 312 dos seus 340 colaboradores já responderam.
        </p>
      </div>

      {/* Action banner */}
      <div className="card" style={{ padding: 20, marginBottom: 24, display: "flex", gap: 18, alignItems: "center" }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: "#F6F7FA", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#F66B0A" }}>
          <Icon name="send" size={20}/>
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F66B0A", marginBottom: 4 }}>Ação requerida</div>
          <div style={{ fontSize: 15, color: "var(--ink)" }}>
            <strong>28 colaboradores ainda não responderam</strong> a Pesquisa de Clima. Que tal enviar um lembrete?
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0 }}>
          <button className="btn btn-accent" style={{ height: 36 }} onClick={() => { setLembreteToast(true); setTimeout(() => setLembreteToast(false), 3000); }}>Enviar lembrete <Icon name="send" size={13}/></button>
          {lembreteToast && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#F66B0A" }}>
              <Icon name="check" size={14} color="var(--health-deep)" />
              Lembrete enviado para 28 colaboradores pendentes
            </div>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ padding: 22, display: "flex", alignItems: "center", gap: 20 }}>
          <RiskMedallion value={media} size={84}/>
          <div>
            <div className="eyebrow">Saúde NR-1 Loghaus</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 26, color: "var(--ink)", lineHeight: 1.1, marginTop: 4 }}>
              {media < 2.5 ? "Dentro do limite" : "Acima do limite"}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 4 }}>
              <span style={{ color: "var(--health)" }}>↓ 0.22</span> vs trimestre anterior
            </div>
          </div>
        </div>
        <AStat label="Colaboradores"   value="340" sub="ativos no sistema" icon="users" />
        <AStat label="Adesão atual"    value="92%" sub="312 / 340 respostas" icon="check" />
        <AStat label="Próxima ação"    value="Workshop" sub="Operações · 02/jun" icon="calendar" />
      </div>

      {/* Setores grid */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <h2 className="display" style={{ fontSize: 26, margin: 0 }}>Saúde por setor</h2>
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--canvas-warm)", borderRadius: 999 }}>
            {[["setor","Setor"],["unidade","Unidade"],["turno","Turno"]].map(([id, label]) => (
              <button key={id} onClick={() => setSectorGrouping(id)} style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: sectorGrouping === id ? 600 : 500, background: sectorGrouping === id ? "var(--surface)" : "transparent", boxShadow: sectorGrouping === id ? "var(--shadow-card)" : "none", color: sectorGrouping === id ? "var(--ink)" : "var(--ink-muted)" }}>{label}</button>
            ))}
          </div>
        </div>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--ink-muted)" }}>
          Recorte da pesquisa atual. Clique para ver o detalhamento por dimensão COPSOQ.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {grupoAtivo.map(s => {
            const color = s.risco >= 2.5 ? "var(--coral)" : s.risco >= 1.5 ? "var(--amber)" : "var(--health)";
            return (
              <button key={s.id} onClick={() => navigate("diagnostico-detalhe", { avaliacao: loghausAvaliacao, setor: s })} style={{ padding: 18, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--line)", textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{s.nome}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{s.colab} colab.</div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 32, color, lineHeight: 1 }}>{s.risco.toFixed(2)}</div>
                  <div className={`pill ${riskPill(s.risco)}`} style={{ fontSize: 10.5 }}>{riskLabel(s.risco)}</div>
                </div>
                <div style={{ position: "relative", height: 5, background: "var(--canvas-warm)", borderRadius: 99 }}>
                  <div style={{ position: "absolute", inset: 0, width: `${(s.risco/4)*100}%`, background: color, borderRadius: 99 }} />
                  <div style={{ position: "absolute", left: "62.5%", top: -2, bottom: -2, width: 1, background: "var(--ink-faint)" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 8 }}>Adesão {s.adesao}%</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Atividade recente */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div className="card" style={{ padding: 26 }}>
          <h3 className="display" style={{ fontSize: 22, margin: "0 0 18px" }}>Diagnósticos disponíveis</h3>
          {AVALIACOES_ATIVAS.filter(a => a.cliente === "Loghaus").concat([
            { id: "x", titulo: "Pulse Bem-Estar abril",  periodo: "Mar/2026", cliente: "Loghaus", code: "PULSO-ABR", media: null, status: "Aguardando", adesao: 0, alvo: 340, respondidos: 0 }
          ]).map((a,i) => (
            <div key={a.id+i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, padding: "14px 0", borderTop: i > 0 ? "1px dashed var(--line-strong)" : "none", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{a.titulo}</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{a.periodo} · enviado pelo Caio</div>
              </div>
              <span className={`pill ${a.status === "Em campo" ? "pill" : "pill-amber"}`} style={{ fontSize: 11 }}>
                {a.status === "Em campo" && <span className="dot" style={{ background: "var(--health)" }} />}
                {a.status}
              </span>
              <button onClick={() => a.status === "Aguardando" ? navigate("admin-diagnosticos", { create: true }) : navigate("diagnostico-detalhe", { avaliacao: a })} className="btn btn-soft" style={{ height: 32, fontSize: 12 }}>
                {a.status === "Aguardando" ? "Aplicar agora" : "Ver resultados"} <Icon name="arrow-right" size={12}/>
              </button>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 26 }}>
          <h3 className="display" style={{ fontSize: 22, margin: "0 0 18px" }}>Plano de ação ativo</h3>
          <ActionItem index={1} title="Workshop anti-burnout · Operações" tag="02/jun · 14h" />
          <ActionItem index={2} title="Conversas 1:1 com gestores em risco" tag="Em andamento" />
          <ActionItem index={3} title="Revisão de carga horária" tag="Concluído" />
          <button className="btn btn-soft" style={{ width: "100%", justifyContent: "center", marginTop: 14, height: 34, fontSize: 13 }}>
            Ver plano completo <Icon name="arrow-right" size={13}/>
          </button>
        </div>
      </div>
    </Page>
  );
};

const AStat = ({ label, value, sub, icon }) => (
  <div className="card" style={{ padding: 22 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--ink-muted)" }}>
      <Icon name={icon} size={14}/>
      <span style={{ fontSize: 12.5 }}>{label}</span>
    </div>
    <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 32, lineHeight: 1, color: "var(--ink)" }}>{value}</div>
    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 6 }}>{sub}</div>
  </div>
);

// ════════════════════════════════════════════════════════════
// ADMIN COLABORADORES — Simplified user list (no more 6 tabs)
// ════════════════════════════════════════════════════════════

const COLABORADORES = [
  { id: "c1",  nome: "Mariana Aguiar",    cargo: "Coordenadora de RH",        setor: "Operações",      ultimoDiag: "12/05/2026", risk: 2.35, status: "ativo"    },
  { id: "c2",  nome: "Pedro Santos",      cargo: "Analista Logístico",         setor: "Operações",      ultimoDiag: "12/05/2026", risk: 3.10, status: "ativo"    },
  { id: "c3",  nome: "Camila Ferreira",   cargo: "Supervisora de Depósito",    setor: "Operações",      ultimoDiag: "12/05/2026", risk: 2.80, status: "ativo"    },
  { id: "c4",  nome: "Lucas Prado",       cargo: "Motorista Sênior",           setor: "Distribuição",   ultimoDiag: "12/05/2026", risk: 1.95, status: "ativo"    },
  { id: "c5",  nome: "Renata Oliveira",   cargo: "Analista Financeira",        setor: "Administrativo", ultimoDiag: "12/05/2026", risk: 1.60, status: "ativo"    },
  { id: "c6",  nome: "Bruno Carvalho",    cargo: "Técnico de TI",              setor: "Administrativo", ultimoDiag: null,         risk: null, status: "pendente" },
  { id: "c7",  nome: "Thais Mendonça",    cargo: "Operadora de Empilhadeira",  setor: "Operações",      ultimoDiag: "12/05/2026", risk: 2.55, status: "ativo"    },
  { id: "c8",  nome: "Rodrigo Almeida",   cargo: "Coordenador Comercial",      setor: "Comercial",      ultimoDiag: null,         risk: null, status: "afastado" },
  { id: "c9",  nome: "Isabela Nunes",     cargo: "Assistente de RH",           setor: "Administrativo", ultimoDiag: "12/05/2026", risk: 1.45, status: "ativo"    },
  { id: "c10", nome: "Felipe Monteiro",   cargo: "Auxiliar de Logística",      setor: "Distribuição",   ultimoDiag: "12/05/2026", risk: 2.90, status: "ativo"    },
];

const AdminColaboradores = () => {
  const [editing, setEditing] = React.useState(null);
  const [filter, setFilter] = React.useState("todos");
  return (
    <Page>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Gestão de pessoas</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Colaboradores</h1>
          <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 560 }}>
            340 colaboradores · 312 ativos · 28 com convite pendente
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-soft" style={{ height: 38 }}><Icon name="download" size={14}/> Importar CSV</button>
          <button className="btn btn-accent" style={{ height: 38 }}><Icon name="plus" size={14}/> Convidar</button>
        </div>
      </div>

      {/* filter row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--canvas-warm)", borderRadius: 999 }}>
          {["Todos", "Ativos", "Convite pendente", "Em risco"].map((t,i) => {
            const id = ["todos","ativos","convite","risco"][i];
            const active = filter === id;
            return (
              <button key={id} onClick={() => setFilter(id)} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: active ? 600 : 500, background: active ? "var(--surface)" : "transparent", color: active ? "var(--ink)" : "var(--ink-muted)", boxShadow: active ? "var(--shadow-card)" : "none" }}>{t}</button>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-soft" style={{ height: 34, fontSize: 13 }}><Icon name="filter" size={13}/> Setor · Perfil</button>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 0.9fr 0.9fr auto", gap: 16, padding: "14px 22px", borderBottom: "1px solid var(--line)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-muted)" }}>
          <span>Colaborador</span>
          <span>Cargo</span>
          <span>Setor</span>
          <span>Último diag.</span>
          <span>Risco NR-1</span>
          <span>Situação</span>
          <span style={{ width: 32 }}></span>
        </div>
        {COLABORADORES.map((c, i) => {
          const statusColor = c.status === "ativo" ? "var(--health-deep)" : c.status === "afastado" ? "var(--coral)" : "var(--amber)";
          const statusLabel = c.status === "ativo" ? "Ativo" : c.status === "afastado" ? "Afastado" : "Pendente";
          return (
            <button key={c.id} onClick={() => setEditing(c)} style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 0.9fr 0.9fr auto", gap: 16, padding: "14px 22px", borderTop: i > 0 ? "1px solid var(--line)" : "none", textAlign: "left", width: "100%", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 34, height: 34, borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 15 }}>
                  {c.nome.split(" ").map(x => x[0]).slice(0,2).join("")}
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{c.nome}</div>
              </div>
              <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{c.cargo}</span>
              <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{c.setor}</span>
              <span style={{ fontSize: 13, color: c.ultimoDiag ? "var(--ink-soft)" : "var(--ink-faint)" }}>{c.ultimoDiag || "—"}</span>
              <span>{c.risk != null ? <span className={`pill ${riskPill(c.risk)}`} style={{ fontSize: 10.5 }}>{c.risk.toFixed(2)}</span> : <span style={{ color: "var(--ink-faint)", fontSize: 13 }}>—</span>}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{statusLabel}</span>
              <span style={{ width: 32, color: "var(--ink-muted)" }}><Icon name="chevron-right" size={16}/></span>
            </button>
          );
        })}
      </div>

      {editing && <UserDrawer user={editing} onClose={() => setEditing(null)} />}
    </Page>
  );
};

// 6 tabs → 3 tabs drawer
const UserDrawer = ({ user, onClose }) => {
  const [tab, setTab] = React.useState("geral");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(31,36,33,0.36)", zIndex: 300, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: "92vw", height: "100vh", background: "var(--canvas)", boxShadow: "var(--shadow-modal)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 26px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 18 }}>
              {user.nome.split(" ").map(x => x[0]).slice(0,2).join("")}
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{user.nome}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{user.cargo} · {user.setor}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)" }}>
            <Icon name="x" size={16}/>
          </button>
        </div>

        <div style={{ padding: "0 26px", display: "flex", gap: 4, borderBottom: "1px solid var(--line)" }}>
          {[["geral","Perfil"],["acesso","Acesso & permissões"],["aprendizado","Aprendizado"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: "14px 4px", marginRight: 18, borderBottom: `2px solid ${tab===id ? "var(--ink)" : "transparent"}`, color: tab===id ? "var(--ink)" : "var(--ink-muted)", fontSize: 13.5, fontWeight: tab===id ? 600 : 500 }}>{label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 26 }}>
          {tab === "geral" && <DrawerSection rows={[
            ["Nome completo", user.nome],
            ["E-mail corporativo", user.nome.toLowerCase().replace(" ", ".") + "@loghaus.com.br"],
            ["Cargo", user.cargo],
            ["Setor", user.setor],
            ["Unidade", "Matriz · São Paulo"],
            ["Data de admissão", "12/03/2022"],
          ]} />}
          {tab === "acesso" && <>
            <DrawerSection rows={[
              ["Perfil de acesso", "Colaborador"],
              ["Status", user.status === "ativo" ? "Ativo" : user.status === "afastado" ? "Afastado" : "Convite pendente"],
              ["Último diagnóstico", user.ultimoDiag || "Não realizado"],
              ["Risco NR-1", user.risk != null ? user.risk.toFixed(2) : "—"],
              ["Último acesso", "Hoje · 09:14"],
            ]} />
            <div style={{ marginTop: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Permissões</div>
              {["Responder diagnósticos","Ver próprio relatório","Acessar trilhas","Gerenciar equipe"].map((p,i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--line)", marginBottom: 6 }}>
                  <input type="checkbox" defaultChecked={i < 3} style={{ accentColor: "var(--health)" }}/>
                  <span style={{ fontSize: 13.5 }}>{p}</span>
                </label>
              ))}
            </div>
          </>}
          {tab === "aprendizado" && <>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Trilhas inscritas</div>
            {["Saúde mental para gestores","Resiliência e regulação emocional"].map((n,i) => (
              <div key={i} style={{ padding: 14, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line)", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{n}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <div style={{ flex: 1, height: 5, background: "var(--canvas-warm)", borderRadius: 99 }}>
                    <div style={{ width: `${[60,30][i]}%`, height: "100%", background: "var(--health)", borderRadius: 99 }}/>
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{[60,30][i]}%</span>
                </div>
              </div>
            ))}
          </>}
        </div>

        <div style={{ padding: "14px 26px", borderTop: "1px solid var(--line)", background: "var(--surface-2)", display: "flex", justifyContent: "space-between" }}>
          <button className="btn btn-ghost" style={{ height: 36, color: "var(--coral)", borderColor: "transparent" }}><Icon name="trash" size={14}/> Remover</button>
          <button className="btn btn-primary" style={{ height: 36 }}>Salvar alterações</button>
        </div>
      </div>
    </div>
  );
};

const DrawerSection = ({ rows }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {rows.map(([k,v],i) => (
      <div key={i} style={{ padding: "12px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginBottom: 4 }}>{k}</div>
        <div style={{ fontSize: 14, color: "var(--ink)" }}>{v}</div>
      </div>
    ))}
  </div>
);

// ════════════════════════════════════════════════════════════
// ADMIN VITRINE config — what employees see in their portal
// ════════════════════════════════════════════════════════════
const DEFAULT_PORTAL_CONFIG = {
  diagnosticos: true,
  trilhas: true,
  historico: true,
  falarRh: false,
  welcome: "Bem-vindo ao espaco de cuidado da Loghaus. Sua resposta e confidencial e nos ajuda a construir um ambiente de trabalho mais saudavel.",
};
window.MENCTOR_PORTAL_CONFIG = window.MENCTOR_PORTAL_CONFIG || DEFAULT_PORTAL_CONFIG;

const AdminVitrine = () => {
  const [config, setConfig] = React.useState(window.MENCTOR_PORTAL_CONFIG || DEFAULT_PORTAL_CONFIG);
  const [published, setPublished] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState("desktop");
  const update = (key, value) => {
    setPublished(false);
    setConfig(prev => ({ ...prev, [key]: value }));
  };
  const publish = () => {
    window.MENCTOR_PORTAL_CONFIG = config;
    window.dispatchEvent(new CustomEvent("menctor:portal-config", { detail: config }));
    setPublished(true);
  };

  return (
  <Page>
    <div style={{ marginBottom: 28 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Portal do colaborador</div>
      <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Vitrine</h1>
      <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 560 }}>
        O que seus colaboradores veem quando entram em <strong style={{ color: "var(--ink)" }}>loghaus.menctor.com.br</strong>.
      </p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>
      {/* Config panel */}
      <div className="card" style={{ padding: 22 }}>
        <h3 className="display" style={{ fontSize: 22, margin: "0 0 18px" }}>Configurações</h3>

        <ConfigSection title="Identidade visual">
          <ConfigRow label="Cor principal">
            <div style={{ display: "flex", gap: 6 }}>
              {["#2F7D6F","#1B8CA6","#5BAD72","#E87722","#1C4B82"].map(c => (
                <span key={c} style={{ width: 26, height: 26, borderRadius: 999, background: c, border: c === "#2F7D6F" ? "2px solid var(--ink)" : "2px solid transparent", boxShadow: c === "#2F7D6F" ? "0 0 0 2px var(--surface)" : "none" }}/>
              ))}
            </div>
          </ConfigRow>
          <ConfigRow label="Logo">
            <button className="btn btn-soft" style={{ height: 30, fontSize: 12 }}>Trocar imagem</button>
          </ConfigRow>
        </ConfigSection>

        <ConfigSection title="Mensagem de boas-vindas">
          <textarea value={config.welcome} onChange={e => update("welcome", e.target.value)} style={{ width: "100%", minHeight: 90, padding: 12, border: "1px solid var(--line)", borderRadius: 10, fontSize: 13.5, lineHeight: 1.5, resize: "vertical", background: "var(--surface)" }}/>
        </ConfigSection>

        <ConfigSection title="O que mostrar">
          <Toggle label="Diagnósticos ativos" on={config.diagnosticos} onClick={() => update("diagnosticos", !config.diagnosticos)} />
          <Toggle label="Trilhas de aprendizado" on={config.trilhas} onClick={() => update("trilhas", !config.trilhas)} />
          <Toggle label="Histórico de respostas" on={config.historico} onClick={() => update("historico", !config.historico)} />
          <Toggle label="Falar com o RH" on={config.falarRh} onClick={() => update("falarRh", !config.falarRh)} />
        </ConfigSection>

        <button onClick={publish} className="btn btn-primary" style={{ width: "100%", height: 38, justifyContent: "center", marginTop: 12 }}>Salvar e publicar</button>
        {published && (
          <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 10, background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="check" size={13}/> Publicado no portal do aluno.
          </div>
        )}
      </div>

      {/* Live preview */}
      <div className="card" style={{ padding: 22, background: "var(--surface-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="eyebrow">Pré-visualização ao vivo</div>
            <div style={{ fontSize: 13.5, color: "var(--ink-muted)", marginTop: 4 }}>loghaus.menctor.com.br</div>
          </div>
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--canvas-warm)", borderRadius: 999 }}>
            {["desktop", "mobile"].map(mode => (
              <button key={mode} onClick={() => setPreviewMode(mode)} style={{
                padding: "4px 12px", borderRadius: 999, fontSize: 12,
                fontWeight: previewMode === mode ? 600 : 500,
                background: previewMode === mode ? "var(--surface)" : "transparent",
                boxShadow: previewMode === mode ? "var(--shadow-card)" : "none",
                color: previewMode === mode ? "var(--ink)" : "var(--ink-muted)",
              }}>{mode === "desktop" ? "Desktop" : "Mobile"}</button>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 16, overflow: "auto", border: "1px solid var(--line)", background: "var(--canvas)", height: 640 }}>
          <div style={{ width: previewMode === "mobile" ? 390 : "100%", minHeight: "100%", margin: previewMode === "mobile" ? "0 auto" : 0, borderLeft: previewMode === "mobile" ? "1px solid var(--line)" : "none", borderRight: previewMode === "mobile" ? "1px solid var(--line)" : "none" }}>
            {window.AlunoApp ? <window.AlunoApp previewConfig={config} /> : (
              <div style={{ padding: 28, color: "var(--ink-muted)", fontSize: 13 }}>Carregando preview do portal do aluno...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </Page>
  );
};

const ConfigSection = ({ title, children }) => (
  <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: "1px dashed var(--line-strong)" }}>
    <div className="eyebrow" style={{ marginBottom: 10 }}>{title}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
  </div>
);
const ConfigRow = ({ label, children }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{label}</span>
    {children}
  </div>
);
const Toggle = ({ label, on, onClick }) => (
  <button onClick={onClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left" }}>
    <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{label}</span>
    <span style={{ width: 34, height: 20, borderRadius: 99, background: on ? "var(--health)" : "var(--line-strong)", position: "relative", transition: ".2s" }}>
      <span style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 999, background: "#fff" }}/>
    </span>
  </button>
);

// ════════════════════════════════════════════════════════════
// RELATÓRIOS FINAIS
// ════════════════════════════════════════════════════════════

const DIMS_RELATORIO = [
  { name: "Carga de trabalho",         v: 3.12 },
  { name: "Burnout",                   v: 2.95 },
  { name: "Estresse",                  v: 2.88 },
  { name: "Conflito trabalho-família", v: 2.74 },
  { name: "Ritmo de trabalho",         v: 2.68 },
  { name: "Reconhecimento",            v: 2.51 },
  { name: "Suporte social",            v: 2.42 },
  { name: "Qualidade da liderança",    v: 2.38 },
  { name: "Justiça e respeito",        v: 2.20 },
  { name: "Influência no trabalho",    v: 2.15 },
  { name: "Comunidade social",         v: 1.88 },
  { name: "Significado do trabalho",   v: 1.72 },
];

const RelatorioPsicossocial = ({ avaliacao, dims }) => (
  <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6, color: "#333", padding: 40 }}>
    <div style={{ textAlign: "center", borderBottom: "3px solid #2F7D6F", paddingBottom: 40, marginBottom: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#2F7D6F", margin: "0 0 10px" }}>Relatório de Risco Psicossocial</h1>
      <p style={{ fontSize: 14, color: "#666", margin: 0 }}>Avaliação COPSOQ II · Norma NR-1</p>
    </div>
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#2F7D6F", borderBottom: "1px solid #ddd", paddingBottom: 10, marginBottom: 20 }}>1. Informações da Avaliação</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {[["Título", avaliacao.titulo], ["Período", avaliacao.periodo], ["Respondentes", `${avaliacao.respondidos} de ${avaliacao.alvo} (${avaliacao.adesao}% adesão)`], ["Código", avaliacao.code]].map(([k, v]) => (
            <tr key={k} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8, fontWeight: 600, width: "30%" }}>{k}:</td>
              <td style={{ padding: 8 }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#2F7D6F", borderBottom: "1px solid #ddd", paddingBottom: 10, marginBottom: 20 }}>2. Resultado Geral</h2>
      <div style={{ display: "flex", gap: 40 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", marginBottom: 5 }}>Média Geral</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: avaliacao.media >= 2.5 ? "#C75A4C" : "#2F7D6F", margin: 0 }}>{avaliacao.media.toFixed(2)}/4.0</p>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", marginBottom: 5 }}>Status NR-1</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: avaliacao.media >= 2.5 ? "#C75A4C" : "#2F7D6F", margin: 0 }}>{avaliacao.media >= 2.5 ? "⚠ ACIMA DO LIMITE" : "✓ Dentro do Limite"}</p>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", marginBottom: 5 }}>Dimensões em Risco</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#C75A4C", margin: 0 }}>{dims.filter(d => d.v >= 2.5).length} de {dims.length}</p>
        </div>
      </div>
    </div>
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#2F7D6F", borderBottom: "1px solid #ddd", paddingBottom: 10, marginBottom: 20 }}>3. Dimensões Críticas (≥ 2.5)</h2>
      {dims.filter(d => d.v >= 2.5).map((dim, idx) => (
        <div key={dim.name} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: idx < dims.filter(d => d.v >= 2.5).length - 1 ? "1px solid #eee" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>{dim.name}</span>
            <span style={{ fontWeight: 700, color: "#C75A4C" }}>{dim.v.toFixed(2)}</span>
          </div>
          <div style={{ height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(dim.v / 4) * 100}%`, background: "#C75A4C" }} />
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#2F7D6F", borderBottom: "1px solid #ddd", paddingBottom: 10, marginBottom: 16 }}>4. Recomendações</h2>
      <ol style={{ paddingLeft: 20 }}>
        {["Implementar plano de ação imediato para as dimensões acima do limite de 2.5/4.0.",
          "Realizar pulses mensais para monitorar evolução das dimensões críticas.",
          "Workshops de capacitação para gestores em saúde psicossocial.",
          "Compartilhar resultados com equipes de forma transparente e participativa.",
          "Documentar todas as ações tomadas para demonstrar conformidade com a NR-1."
        ].map((txt, i) => <li key={i} style={{ marginBottom: 8, fontSize: 14 }}>{txt}</li>)}
      </ol>
    </div>
    <div style={{ marginTop: 60, paddingTop: 20, borderTop: "2px solid #eee", fontSize: 11, color: "#999", textAlign: "center" }}>
      <p>Relatório gerado pelo Menctor · Consultor: Caio Guedes · 27 de maio de 2026</p>
    </div>
  </div>
);

const MatrizNR1 = ({ avaliacao, dims }) => (
  <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6, color: "var(--text)", padding: 40, background: "var(--bg)" }}>
    <div style={{ textAlign: "center", borderBottom: "3px solid #F66B0A", paddingBottom: 40, marginBottom: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0E2748", margin: "0 0 10px" }}>Matriz de Risco NR-1</h1>
      <p style={{ fontSize: 14, color: "#5C667C", margin: 0 }}>Mapeamento por Severidade · {avaliacao.titulo}</p>
    </div>
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F66B0A", borderBottom: "1px solid #E7EAF1", paddingBottom: 10, marginBottom: 20 }}>Classificação por Dimensão</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#F6F7FA", borderBottom: "2px solid #F66B0A" }}>
            {["Dimensão", "Escore", "Nível", "Ação Recomendada"].map(h => (
              <th key={h} style={{ padding: 12, textAlign: h === "Escore" || h === "Nível" ? "center" : "left", fontWeight: 700, color: "#F66B0A" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dims.map(dim => {
            const nivel = dim.v >= 3.5 ? "CRÍTICA" : dim.v >= 2.5 ? "ALTA" : dim.v >= 1.5 ? "MÉDIA" : "OK";
            const cor   = dim.v >= 3.5 ? "#8B0000" : dim.v >= 2.5 ? "#C75A4C" : dim.v >= 1.5 ? "#D89A3F" : "#2F7D6F";
            const acao  = dim.v >= 3.5 ? "Ação urgente — reunião imediata" : dim.v >= 2.5 ? "Plano de ação em até 15 dias" : dim.v >= 1.5 ? "Monitorar mensalmente" : "Manter práticas atuais";
            return (
              <tr key={dim.name} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 12 }}>{dim.name}</td>
                <td style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>{dim.v.toFixed(2)}</td>
                <td style={{ padding: 12, textAlign: "center" }}>
                  <span style={{ display: "inline-block", padding: "4px 10px", background: cor, color: "#fff", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{nivel}</span>
                </td>
                <td style={{ padding: 12, fontSize: 13 }}>{acao}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1C4B82", borderBottom: "1px solid #ddd", paddingBottom: 10, marginBottom: 16 }}>Plano de Ação Priorizado</h2>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#C75A4C", marginBottom: 8 }}>Prioridade 1 — Implementar em até 15 dias</p>
      <ul style={{ paddingLeft: 20, fontSize: 13 }}>
        {dims.filter(d => d.v >= 2.5).map(dim => (
          <li key={dim.name} style={{ marginBottom: 6 }}><strong>{dim.name}</strong> ({dim.v.toFixed(2)}/4.0)</li>
        ))}
      </ul>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#D89A3F", marginTop: 16, marginBottom: 8 }}>Prioridade 2 — Monitorar</p>
      <ul style={{ paddingLeft: 20, fontSize: 13 }}>
        {dims.filter(d => d.v >= 1.5 && d.v < 2.5).map(dim => (
          <li key={dim.name} style={{ marginBottom: 6 }}><strong>{dim.name}</strong> ({dim.v.toFixed(2)}/4.0)</li>
        ))}
      </ul>
    </div>
    <div style={{ marginTop: 60, paddingTop: 20, borderTop: "2px solid #eee", fontSize: 11, color: "#999", textAlign: "center" }}>
      <p>Matriz de Risco NR-1 · Menctor · Consultor: Caio Guedes · 27 de maio de 2026</p>
    </div>
  </div>
);

const RelatoriosFinaisScreen = ({ navigate }) => {
  const [expandedId, setExpandedId]   = React.useState(null);
  const [previewInfo, setPreviewInfo] = React.useState(null);
  const [exportMsg, setExportMsg]     = React.useState("");

  const lista = AVALIACOES_ATIVAS.filter(a => a.media !== null);

  if (previewInfo) {
    return (
      <div style={{ padding: "20px 40px", background: "#fff", minHeight: "100vh" }}>
        <button onClick={() => setPreviewInfo(null)} style={{ marginBottom: 20, padding: "8px 14px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="chevron-left" size={14} /> Voltar
        </button>
        <div style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #eee" }}>
          {previewInfo.tipo === "psicossocial"
            ? <RelatorioPsicossocial avaliacao={previewInfo.avaliacao} dims={DIMS_RELATORIO} />
            : <MatrizNR1             avaliacao={previewInfo.avaliacao} dims={DIMS_RELATORIO} />
          }
        </div>
      </div>
    );
  }

  return (
    <Page>
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Administrador · Loghaus Logística</div>
        <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Relatórios Finais</h1>
        <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 680 }}>
          Exporte o Relatório de Risco Psicossocial e a Matriz NR-1 das avaliações concluídas.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {lista.map(a => {
          const aberta = expandedId === a.id;
          return (
            <div key={a.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => setExpandedId(aberta ? null : a.id)}
                style={{ width: "100%", padding: 24, display: "flex", alignItems: "center", gap: 20, border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
              >
                <RiskMedallion value={a.media} size={80} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 20, margin: 0, color: "var(--ink)" }}>{a.titulo}</h3>
                    <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: a.status === "Encerrada" ? "var(--surface-sage)" : "var(--canvas-warm)", color: a.status === "Encerrada" ? "var(--health-deep)" : "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {a.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--ink-muted)" }}>
                    {a.periodo} · {a.respondidos} de {a.alvo} respostas ({a.adesao}% adesão)
                  </p>
                </div>
                <Icon name={aberta ? "chevron-down" : "chevron-right"} size={20} color="var(--ink-muted)" />
              </button>

              {aberta && (
                <div style={{ borderTop: "1px solid var(--line)", padding: 24, background: "var(--canvas-warm)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="card" style={{ padding: 22, background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Icon name="file" size={18} color="var(--health-deep)" />
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Risco Psicossocial</h4>
                    </div>
                    <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                      Análise COPSOQ II com dimensões, recomendações e insights por setor.
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setPreviewInfo({ tipo: "psicossocial", avaliacao: a })} className="btn btn-soft" style={{ flex: 1, height: 34, fontSize: 12 }}>
                        <Icon name="eye" size={13} /> Ver
                      </button>
                    <button
  onClick={() => {
    downloadPDF();

    setExportMsg("Relatório Psicossocial iniciado para download.");

    setTimeout(() => setExportMsg(""), 3000);
  }}
  className="btn btn-health"
  style={{ flex: 1, height: 34, fontSize: 12 }}
>
  <Icon name="download" size={13} /> PDF
</button>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 22, background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Icon name="file" size={18} color="var(--coral)" />
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Matriz NR-1</h4>
                    </div>
                    <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                      Classificação por severidade e plano de ação priorizado conforme NR-1.
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setPreviewInfo({ tipo: "matriz", avaliacao: a })} className="btn btn-soft" style={{ flex: 1, height: 34, fontSize: 12 }}>
                        <Icon name="eye" size={13} /> Ver
                      </button>
                     <button
                          onClick={() => {
                        downloadPDF();

    setExportMsg("Matriz NR-1 iniciada para download.");

    setTimeout(() => setExportMsg(""), 3000);
  }}
  className="btn btn-accent"
  style={{ flex: 1, height: 34, fontSize: 12 }}
>
  <Icon name="download" size={13} /> PDF
</button>
                    </div>
                  </div>


                  {exportMsg && (
                    <div style={{ gridColumn: "1 / -1", padding: "10px 14px", borderRadius: 8, background: "var(--surface-sage)", color: "var(--health-deep)", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon name="check" size={14} /> {exportMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
};

Object.assign(window, { AdminSidebar, AdminHome, AdminColaboradores, AdminVitrine, RelatoriosFinaisScreen });
