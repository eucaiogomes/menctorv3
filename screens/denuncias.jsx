/* global React, Icon, Page, CLIENTES, TIPOS_DENUNCIA, DENUNCIA_STATUS, DENUNCIA_GRAVIDADE, DENUNCIAS_MOCK, GOVERNANCA_COMITES, GOVERNANCA_POLITICAS, MenctorDB */
const { useState, useMemo, useEffect } = React;

const DenunciasScreen = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "casos", "governanca", "gestao"
  const [govTab, setGovTab] = useState("membros"); // "membros", "comites", "auditoria", "politicas"
  const [gestaoTab, setGestaoTab] = useState("tipos"); // "tipos", "documentos", "treinamentos", "perfil", "ajuda"

  // Filter state for "Casos"
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterGravidade, setFilterGravidade] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterCliente, setFilterCliente] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await MenctorDB.listDenuncias();
        if (active) setDenuncias(rows);
      } catch (e) {
        console.error("Erro ao carregar denúncias", e);
        if (active) setDenuncias(DENUNCIAS_MOCK);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    const total = denuncias.length;
    const emTratamento = denuncias.filter(d => ["triagem", "investigacao"].includes(d.status)).length;
    const concluidas = denuncias.filter(d => d.status === "concluido").length;
    const tempoMedio = 3.2; // dias
    return { total, emTratamento, concluidas, tempoMedio };
  }, [denuncias]);

  // Filtered cases
  const filteredCasos = useMemo(() => {
    return denuncias.filter(d => {
      if (filterStatus !== "todos" && d.status !== filterStatus) return false;
      if (filterGravidade !== "todos" && d.gravidade !== filterGravidade) return false;
      if (filterTipo !== "todos" && d.tipoId !== filterTipo) return false;
      if (filterCliente !== "todos" && d.clienteId !== filterCliente) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const prot = d.protocolo.toLowerCase();
        const nat = d.natureza.toLowerCase();
        const rel = d.relato.toLowerCase();
        if (!prot.includes(q) && !nat.includes(q) && !rel.includes(q)) return false;
      }
      return true;
    });
  }, [denuncias, filterStatus, filterGravidade, filterTipo, filterCliente, searchTerm]);

  return (
    <Page>
      {/* ─── HERO HEADER BANNER ─── */}
      <div style={{
        background: "radial-gradient(ellipse at 70% 50%, #0F3870 0%, #00204D 55%, #05162E 100%)",
        borderRadius: 14,
        padding: "26px 34px",
        color: "#FFFFFF",
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,32,77,0.12)"
      }}>
        {/* Network nodes background graphic */}
        <div style={{ position: "absolute", right: 260, top: 0, bottom: 0, width: 340, pointerEvents: "none", opacity: 0.65 }}>
          <svg width="340" height="130" viewBox="0 0 340 130" fill="none">
            {/* Connection lines */}
            <line x1="30" y1="40" x2="100" y2="80" stroke="rgba(96,165,250,0.35)" strokeWidth="1" strokeDasharray="3 3"/>
            <line x1="100" y1="80" x2="170" y2="30" stroke="rgba(96,165,250,0.4)" strokeWidth="1"/>
            <line x1="170" y1="30" x2="240" y2="90" stroke="rgba(96,165,250,0.35)" strokeWidth="1" strokeDasharray="2 2"/>
            <line x1="240" y1="90" x2="310" y2="50" stroke="rgba(96,165,250,0.4)" strokeWidth="1"/>
            <line x1="100" y1="80" x2="240" y2="90" stroke="rgba(96,165,250,0.25)" strokeWidth="1"/>

            {/* Nodes */}
            <circle cx="30" cy="40" r="14" fill="#0E2748" stroke="#3B82F6" strokeWidth="1.5"/>
            <circle cx="100" cy="80" r="16" fill="#0E2748" stroke="#60A5FA" strokeWidth="1.5"/>
            <circle cx="170" cy="30" r="14" fill="#0E2748" stroke="#3B82F6" strokeWidth="1.5"/>
            <circle cx="240" cy="90" r="15" fill="#0E2748" stroke="#60A5FA" strokeWidth="1.5"/>
            <circle cx="310" cy="50" r="14" fill="#0E2748" stroke="#3B82F6" strokeWidth="1.5"/>

            {/* User icons in nodes */}
            <circle cx="30" cy="37" r="3.5" fill="#93C5FD"/>
            <path d="M22 47c0-2.5 3.5-4 8-4s8 1.5 8 4" fill="#93C5FD"/>

            <circle cx="100" cy="77" r="4" fill="#93C5FD"/>
            <path d="M91 88c0-3 4-5 9-5s9 2 9 5" fill="#93C5FD"/>

            <circle cx="170" cy="27" r="3.5" fill="#93C5FD"/>
            <path d="M162 37c0-2.5 3.5-4 8-4s8 1.5 8 4" fill="#93C5FD"/>

            <circle cx="240" cy="87" r="3.5" fill="#93C5FD"/>
            <path d="M232 97c0-2.5 3.5-4 8-4s8 1.5 8 4" fill="#93C5FD"/>

            <circle cx="310" cy="47" r="3.5" fill="#93C5FD"/>
            <path d="M302 57c0-2.5 3.5-4 8-4s8 1.5 8 4" fill="#93C5FD"/>
          </svg>
        </div>

        {/* Central glowing shield illustration */}
        <div style={{ position: "absolute", right: 290, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
          <div style={{
            width: 72, height: 86,
            borderRadius: "10px 10px 34px 34px",
            background: "linear-gradient(145deg, #3B82F6, #1D4ED8 70%, #172554)",
            border: "2px solid #93C5FD",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 35px rgba(59,130,246,0.6), inset 0 2px 6px rgba(255,255,255,0.6)"
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>

        {/* Left Headline */}
        <div style={{ zIndex: 3, maxWidth: 580 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#FF6A00",
            marginBottom: 6
          }}>
            COMPLIANCE & OUVIDORIA • LEI 14.457/2022 & NR-01
          </div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            margin: 0,
            color: "#FFFFFF",
            letterSpacing: "-0.01em"
          }}>
            Canal de Denúncias e Escuta
          </h1>
          <p style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.45
          }}>
            Ambiente sigiloso e independente para triagem, investigação, governança e tratamento humanizado de manifestações.
          </p>
        </div>

        {/* Right Action Button */}
        <div style={{ zIndex: 3 }}>
          <button
            onClick={() => navigate("denuncia-portal")}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#FFFFFF",
              fontSize: 12.5,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "all .15s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Abrir Portal do Denunciante
          </button>
        </div>
      </div>

      {/* ─── NAVIGATION TABS (Active Orange Underline) ─── */}
      <div style={{
        display: "flex",
        gap: 28,
        borderBottom: "1px solid #E2E8F0",
        marginBottom: 24,
        paddingBottom: 0
      }}>
        {[
          { id: "dashboard", label: "Dashboard", icon: "bar-chart" },
          { id: "casos", label: `Casos (${denuncias.length})`, icon: "shield" },
          { id: "governanca", label: "Governança", icon: "users" },
          { id: "gestao", label: "Gestão & Configurações", icon: "settings" },
        ].map(tab => {
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 4px 14px",
                background: "transparent",
                color: isAct ? "#FF6A00" : "#64748B",
                fontWeight: isAct ? 700 : 500,
                fontSize: 13.5,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: isAct ? "2.5px solid #FF6A00" : "2.5px solid transparent",
                marginBottom: -1,
                transition: "all .15s ease"
              }}
            >
              {tab.id === "dashboard" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              )}
              {tab.id === "casos" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              )}
              {tab.id === "governanca" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              )}
              {tab.id === "gestao" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-muted)" }}>
          Carregando denúncias...
        </div>
      )}

      {/* ─── TAB 1: DASHBOARD ─── */}
      {!loading && activeTab === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* 1. 4 KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>

            {/* KPI 1: TOTAL DE DENÚNCIAS */}
            <div className="card" style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "#DBEAFE", color: "#2563EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em" }}>
                    TOTAL DE DENÚNCIAS
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#00204D", margin: "2px 0 2px" }}>
                    {kpis.total}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#16A34A" }}>
                    ↑ 18% vs mês ant.
                  </div>
                </div>
              </div>

              {/* Sparkline Blue */}
              <div style={{ width: 60, height: 28 }}>
                <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
                  <path d="M2 22 L15 19 L28 23 L42 12 L58 10" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* KPI 2: EM TRATAMENTO */}
            <div className="card" style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "#FEF3C7", color: "#D97706",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 22h14"/>
                    <path d="M5 2h14"/>
                    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
                    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em" }}>
                    EM TRATAMENTO
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#00204D", margin: "2px 0 2px" }}>
                    {kpis.emTratamento}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#F97316" }}>
                    ↑ 8% vs mês ant.
                  </div>
                </div>
              </div>

              {/* Sparkline Orange */}
              <div style={{ width: 60, height: 28 }}>
                <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
                  <path d="M2 20 L16 17 L29 22 L42 14 L58 12" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* KPI 3: CONCLUÍDAS */}
            <div className="card" style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "#D1FAE5", color: "#10B981",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em" }}>
                    CONCLUÍDAS
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#00204D", margin: "2px 0 2px" }}>
                    {kpis.concluidas}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#16A34A" }}>
                    ↑ 20% vs mês ant.
                  </div>
                </div>
              </div>

              {/* Sparkline Green */}
              <div style={{ width: 60, height: 28 }}>
                <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
                  <path d="M2 24 L16 23 L30 19 L44 21 L58 11" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* KPI 4: TEMPO MÉDIO DE RESPOSTA */}
            <div className="card" style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "#EDE9FE", color: "#8B5CF6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em" }}>
                    TEMPO MÉDIO DE RESPOSTA
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#00204D", margin: "2px 0 2px" }}>
                    {kpis.tempoMedio} dias
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#16A34A" }}>
                    ↓ 15% vs mês ant.
                  </div>
                </div>
              </div>

              {/* Sparkline Purple */}
              <div style={{ width: 60, height: 28 }}>
                <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
                  <path d="M2 19 L16 16 L30 19 L44 14 L58 18" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

          </div>

          {/* 2. Charts Row (2 Columns) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Left Chart: Denúncias por Tipo */}
            <div className="card" style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "24px 26px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#00204D" }}>
                  Denúncias por Tipo
                </h3>
                <span style={{ color: "#94A3B8", cursor: "pointer", fontSize: 16 }}>⋮</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                {/* SVG Donut Chart */}
                <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                  <svg width="140" height="140" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#E2E8F0" strokeWidth="5.5"/>
                    {/* Blue segment: 42% */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#2563EB" strokeWidth="5.5" strokeDasharray="42 58" strokeDashoffset="25"/>
                    {/* Orange segment: 24% */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#FF6A00" strokeWidth="5.5" strokeDasharray="24 76" strokeDashoffset="-17"/>
                    {/* Purple segment: 14% */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#8B5CF6" strokeWidth="5.5" strokeDasharray="14 86" strokeDashoffset="-41"/>
                    {/* Red segment: 12% */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#E11D48" strokeWidth="5.5" strokeDasharray="12 88" strokeDashoffset="-55"/>
                    {/* Grey segment: 8% */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#64748B" strokeWidth="5.5" strokeDasharray="8 92" strokeDashoffset="-67"/>
                  </svg>
                  {/* Center Text */}
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#00204D", lineHeight: 1 }}>{denuncias.length}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginTop: 2 }}>TOTAL</span>
                  </div>
                </div>

                {/* Legend with Percentages */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Assédio Moral", pct: "42%", cor: "#2563EB" },
                    { label: "Assédio Sexual", pct: "24%", cor: "#FF6A00" },
                    { label: "Discriminação", pct: "14%", cor: "#8B5CF6" },
                    { label: "Violência Psicológica", pct: "12%", cor: "#E11D48" },
                    { label: "Outros", pct: "8%", cor: "#64748B" },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2.5, background: item.cor }} />
                        <span style={{ color: "#334155", fontWeight: 500 }}>{item.label}</span>
                      </div>
                      <strong style={{ color: "#00204D" }}>{item.pct}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Chart: Evolução das Denúncias */}
            <div className="card" style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "24px 26px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#00204D" }}>
                  Evolução das Denúncias
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11.5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748B" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB" }} /> 2026
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748B" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} /> 2025
                  </span>
                  <span style={{ color: "#94A3B8", cursor: "pointer", fontSize: 16 }}>⋮</span>
                </div>
              </div>

              {/* Bar Chart Grid with Y Axis */}
              <div style={{ display: "flex", gap: 12, height: 140 }}>
                {/* Y Axis Labels */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 10, color: "#94A3B8", textAlign: "right", paddingRight: 4, height: "82%" }}>
                  <span>8</span>
                  <span>6</span>
                  <span>4</span>
                  <span>2</span>
                  <span>0</span>
                </div>

                {/* Bars Area */}
                <div style={{ flex: 1, display: "flex", justifyContent: "space-around", alignItems: "flex-end", borderBottom: "1px solid #E2E8F0", height: "82%", position: "relative" }}>
                  {/* Subtle horizontal grid lines */}
                  <div style={{ position: "absolute", left: 0, right: 0, top: "25%", borderTop: "1px dashed #F1F5F9", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderTop: "1px dashed #F1F5F9", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", left: 0, right: 0, top: "75%", borderTop: "1px dashed #F1F5F9", pointerEvents: "none" }} />

                  {[
                    { m: "Jan", v26: 48, v25: 35 },
                    { m: "Fev", v26: 64, v25: 48 },
                    { m: "Mar", v26: 80, v25: 50 },
                    { m: "Abr", v26: 64, v25: 55 },
                    { m: "Mai", v26: 90, v25: 64 },
                    { m: "Jun", v26: 100, v25: 75 },
                  ].map(col => (
                    <div key={col.m} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end", zIndex: 2 }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: "100%" }}>
                        <div style={{ width: 8, height: `${col.v26}%`, background: "#2563EB", borderRadius: "3px 3px 0 0" }} title={`2026: ${col.v26}%`} />
                        <div style={{ width: 8, height: `${col.v25}%`, background: "#22C55E", borderRadius: "3px 3px 0 0" }} title={`2025: ${col.v25}%`} />
                      </div>
                      <span style={{ fontSize: 11, color: "#64748B", position: "relative", bottom: -20 }}>{col.m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* 3. Casos em Andamento Table Card */}
          <div className="card" style={{
            background: "#FFFFFF",
            borderRadius: 14,
            padding: "24px 26px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#00204D" }}>
                Casos em Andamento
              </h3>
              <button
                onClick={() => setActiveTab("casos")}
                style={{
                  height: 32,
                  padding: "0 14px",
                  borderRadius: 999,
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  color: "#0E2748",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer"
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Ver Todos os Casos
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #E2E8F0", textAlign: "left" }}>
                    <th style={{ padding: "10px 8px", color: "#94A3B8", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>CÓDIGO / PROTOCOLO</th>
                    <th style={{ padding: "10px 8px", color: "#94A3B8", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>TIPO / NATUREZA</th>
                    <th style={{ padding: "10px 8px", color: "#94A3B8", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>DATA DE ABERTURA</th>
                    <th style={{ padding: "10px 8px", color: "#94A3B8", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>STATUS</th>
                    <th style={{ padding: "10px 8px", color: "#94A3B8", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>RESPONSÁVEL</th>
                    <th style={{ padding: "10px 8px", color: "#94A3B8", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>PRAZO</th>
                    <th style={{ padding: "10px 8px", color: "#94A3B8", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em", textAlign: "right" }}>AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {denuncias.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "24px 8px", textAlign: "center", color: "#94A3B8" }}>
                        Nenhum caso registrado até o momento.
                      </td>
                    </tr>
                  )}
                  {denuncias
                    .slice()
                    .sort((a, b) => new Date(b.data) - new Date(a.data))
                    .slice(0, 6)
                    .map(d => {
                      const st = DENUNCIA_STATUS[d.status];
                      const dt = new Date(d.data);
                      const prazoDt = d.prazoFinal ? new Date(d.prazoFinal) : null;

                      return (
                        <tr key={d.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "14px 8px", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#00204D" }}>
                            {d.protocolo}
                          </td>
                          <td style={{ padding: "14px 8px", fontWeight: 600, color: "#0E2748" }}>
                            {d.natureza}
                          </td>
                          <td style={{ padding: "14px 8px", color: "#64748B" }}>
                            {dt.toLocaleDateString("pt-BR")}
                          </td>
                          <td style={{ padding: "14px 8px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 6,
                              fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                              background: `${st?.cor}18`, color: st?.cor
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: st?.cor }} />
                              {st?.label}
                            </span>
                          </td>
                          <td style={{ padding: "14px 8px", color: "#334155" }}>
                            {d.responsavel || "Não atribuído"}
                          </td>
                          <td style={{ padding: "14px 8px", color: "#64748B" }}>
                            {prazoDt ? prazoDt.toLocaleDateString("pt-BR") : "—"}
                          </td>
                          <td style={{ padding: "14px 8px", textAlign: "right" }}>
                            <button
                              onClick={() => navigate("denuncia-detalhe", { id: d.id })}
                              style={{
                                height: 28,
                                padding: "0 10px",
                                borderRadius: 6,
                                background: "#F8FAFC",
                                border: "1px solid #CBD5E1",
                                color: "#0E2748",
                                fontSize: 11.5,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4
                              }}
                            >
                              Tratar Caso ›
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 2: CASOS ─── */}
      {!loading && activeTab === "casos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <input
                type="text"
                placeholder="Buscar por protocolo, natureza ou relato..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: "100%", height: 38, padding: "0 10px 0 34px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, background: "#fff", boxSizing: "border-box" }}
              />
              <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                <Icon name="search" size={15} />
              </div>
            </div>

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, background: "#fff" }}>
              <option value="todos">Todos os Status</option>
              <option value="triagem">Em Triagem</option>
              <option value="investigacao">Em Investigação</option>
              <option value="concluido">Concluído</option>
              <option value="arquivado">Arquivado</option>
            </select>

            <select value={filterGravidade} onChange={e => setFilterGravidade(e.target.value)} style={{ height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, background: "#fff" }}>
              <option value="todos">Todas as Gravidades</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>

            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, background: "#fff" }}>
              <option value="todos">Todas as Naturezas</option>
              {TIPOS_DENUNCIA.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>

          <div className="card" style={{ background: "#FFFFFF", borderRadius: 14, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E2E8F0", textAlign: "left", color: "#64748B" }}>
                  <th style={{ padding: "10px" }}>1. Número do Protocolo</th>
                  <th style={{ padding: "10px" }}>2. Data e Hora</th>
                  <th style={{ padding: "10px" }}>3. Status Atual</th>
                  <th style={{ padding: "10px" }}>4. Gravidade</th>
                  <th style={{ padding: "10px" }}>5. Natureza / Categoria</th>
                  <th style={{ padding: "10px" }}>6. Prazo Restante</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCasos.map(d => {
                  const st = DENUNCIA_STATUS[d.status];
                  const gr = DENUNCIA_GRAVIDADE[d.gravidade];
                  const dt = new Date(d.data);
                  const prazoDt = new Date(d.prazoFinal);
                  const diasRestantes = Math.max(0, Math.ceil((prazoDt - new Date()) / (1000 * 60 * 60 * 24)));

                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px 10px", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#00204D" }}>
                        {d.protocolo}
                      </td>
                      <td style={{ padding: "14px 10px", color: "#64748B", fontSize: 12 }}>
                        {dt.toLocaleDateString("pt-BR")} às {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td style={{ padding: "14px 10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: `${st?.cor}18`, color: st?.cor }}>
                          {st?.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: `${gr?.cor}18`, color: gr?.cor }}>
                          {gr?.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 10px", fontWeight: 600, color: "#0E2748" }}>
                        {d.natureza}
                      </td>
                      <td style={{ padding: "14px 10px", color: diasRestantes < 5 ? "#E11D48" : "#64748B", fontWeight: diasRestantes < 5 ? 700 : 400, fontSize: 12 }}>
                        {diasRestantes} dias restantes
                      </td>
                      <td style={{ padding: "14px 10px", textAlign: "right" }}>
                        <button
                          onClick={() => navigate("denuncia-detalhe", { id: d.id })}
                          style={{
                            height: 30, padding: "0 12px", borderRadius: 6,
                            background: "#00204D", color: "#fff", border: "none",
                            fontWeight: 600, fontSize: 12, cursor: "pointer"
                          }}
                        >
                          Ver Detalhes ›
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: GOVERNANÇA ─── */}
      {activeTab === "governanca" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 6, background: "#F1F5F9", padding: 4, borderRadius: 8, width: "fit-content" }}>
            {[
              { id: "membros", label: "Convite Membros" },
              { id: "comites", label: "Comitês" },
              { id: "auditoria", label: "Auditoria & Logs" },
              { id: "politicas", label: "Políticas e Informação" },
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setGovTab(sub.id)}
                style={{
                  padding: "6px 14px", borderRadius: 6,
                  background: govTab === sub.id ? "#fff" : "transparent",
                  color: govTab === sub.id ? "#00204D" : "#64748B",
                  fontWeight: govTab === sub.id ? 700 : 500, fontSize: 12.5,
                  border: "none", cursor: "pointer",
                  boxShadow: govTab === sub.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none"
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {govTab === "membros" && (
            <div className="card" style={{ background: "#fff", padding: "24px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#00204D" }}>Membros de Governança e Comitês</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748B" }}>Usuários autorizados a receber, triar e investigar manifestações com sigilo legal.</p>
                </div>
                <button style={{ height: 34, padding: "0 14px", borderRadius: 6, background: "#FF6A00", color: "#fff", border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                  + Convidar Novo Membro
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #E2E8F0", textAlign: "left", color: "#94A3B8" }}>
                    <th style={{ padding: "8px 10px" }}>Nome</th>
                    <th style={{ padding: "8px 10px" }}>Email</th>
                    <th style={{ padding: "8px 10px" }}>Comitê</th>
                    <th style={{ padding: "8px 10px" }}>Papel</th>
                    <th style={{ padding: "8px 10px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { nome: "Ana Paula Rios", email: "ana.paula@ednacompliance.com.br", comite: "Comitê de Ética", papel: "Coordenadora / Analista", status: "Ativo" },
                    { nome: "Mariana Aguiar", email: "mariana@loghaus.com.br", comite: "Comitê de Ética", papel: "Membro RH", status: "Ativo" },
                    { nome: "Dr. Carlos Mendes", email: "juridico@loghaus.com.br", comite: "Comitê de Ética", papel: "Assessor Jurídico", status: "Ativo" },
                    { nome: "Roberto Lima", email: "roberto@vitamed.com.br", comite: "Comitê de Integridade", papel: "Membro", status: "Ativo" },
                  ].map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 10px", fontWeight: 600, color: "#00204D" }}>{m.nome}</td>
                      <td style={{ padding: "12px 10px", color: "#64748B" }}>{m.email}</td>
                      <td style={{ padding: "12px 10px", color: "#334155" }}>{m.comite}</td>
                      <td style={{ padding: "12px 10px", color: "#334155" }}>{m.papel}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "#D1FAE5", color: "#10B981" }}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {govTab === "comites" && (
            <div className="card" style={{ background: "#fff", padding: "24px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "#00204D" }}>Comitês Ativos</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {GOVERNANCA_COMITES.map(com => (
                  <div key={com.id} style={{ padding: "16px 18px", border: "1px solid #E2E8F0", borderRadius: 10, background: "#F8FAFC" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#00204D" }}>{com.nome}</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Empresa: {CLIENTES.find(c => c.id === com.clienteId)?.name || com.clienteId}</div>
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {com.membros.map((mb, i) => (
                        <span key={i} style={{ fontSize: 11.5, padding: "3px 8px", borderRadius: 6, background: "#fff", border: "1px solid #CBD5E1", color: "#334155" }}>
                          {mb}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {govTab === "auditoria" && (
            <div className="card" style={{ background: "#fff", padding: "24px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "#00204D" }}>Logs e Trilha de Auditoria</h3>
              <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#64748B" }}>Todos os acessos a denúncias possuem hash criptográfico inalterável conforme a Lei 14.457/2022.</p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #E2E8F0", textAlign: "left", color: "#94A3B8" }}>
                    <th style={{ padding: "8px 10px" }}>Data / Hora</th>
                    <th style={{ padding: "8px 10px" }}>Usuário</th>
                    <th style={{ padding: "8px 10px" }}>Ação Registrada</th>
                    <th style={{ padding: "8px 10px" }}>Caso</th>
                    <th style={{ padding: "8px 10px" }}>Integridade</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { data: "2026-06-20 10:30", user: "Ana Paula Rios", acao: "Andamento registrado: Investigação iniciada", caso: "DEN-2026-0001", hash: "SHA256:8f2a...e91" },
                    { data: "2026-06-18 11:00", user: "Ana Paula Rios", acao: "Mensagem enviada via chat sigiloso", caso: "DEN-2026-0001", hash: "SHA256:4b1c...d82" },
                    { data: "2026-06-16 14:00", user: "Ana Paula Rios", acao: "Status alterado para: Em Investigação", caso: "DEN-2026-0001", hash: "SHA256:1a9f...c33" },
                  ].map((l, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "10px", color: "#64748B" }}>{l.data}</td>
                      <td style={{ padding: "10px", fontWeight: 600, color: "#00204D" }}>{l.user}</td>
                      <td style={{ padding: "10px", color: "#334155" }}>{l.acao}</td>
                      <td style={{ padding: "10px", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>{l.caso}</td>
                      <td style={{ padding: "10px", color: "#16A34A", fontFamily: "var(--font-mono)", fontSize: 11 }}>✓ {l.hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {govTab === "politicas" && (
            <div className="card" style={{ background: "#fff", padding: "24px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "#00204D" }}>Políticas e Código de Conduta</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {GOVERNANCA_POLITICAS.map(pol => (
                  <div key={pol.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#F8FAFC" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#00204D" }}>{pol.titulo}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>Versão {pol.versao} · {pol.dataPublicacao}</div>
                    </div>
                    <button style={{ height: 28, padding: "0 12px", borderRadius: 6, background: "#fff", border: "1px solid #CBD5E1", fontSize: 12, cursor: "pointer" }}>
                      Visualizar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: GESTÃO & CONFIGURAÇÕES ─── */}
      {activeTab === "gestao" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 6, background: "#F1F5F9", padding: 4, borderRadius: 8, width: "fit-content" }}>
            {[
              { id: "tipos", label: "Tipos de Denúncias" },
              { id: "documentos", label: "Documentos" },
              { id: "treinamentos", label: "Treinamentos" },
              { id: "perfil", label: "Perfil & Acessos" },
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setGestaoTab(sub.id)}
                style={{
                  padding: "6px 14px", borderRadius: 6,
                  background: gestaoTab === sub.id ? "#fff" : "transparent",
                  color: gestaoTab === sub.id ? "#00204D" : "#64748B",
                  fontWeight: gestaoTab === sub.id ? 700 : 500, fontSize: 12.5,
                  border: "none", cursor: "pointer"
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ background: "#fff", padding: "24px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "#00204D" }}>Configurações de Integridade & Compliance</h3>
            <p style={{ fontSize: 13, color: "#64748B" }}>Parâmetros ativos de anonimização e conformidade com a NR-01 e Lei 14.457/2022.</p>
          </div>
        </div>
      )}

    </Page>
  );
};

Object.assign(window, { DenunciasScreen });
