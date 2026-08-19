/* global React, Icon, Page, CLIENTES, ENTREVISTA_ESTRUTURAS, ENTREVISTA_FATORES, ENTREVISTA_MATURIDADE, CLASSIFICACAO_LABELS, CLASSIFICACAO_CORES, ENTREVISTAS_MOCK */
const { useState, useMemo } = React;

const EntrevistasScreen = ({ navigate }) => {
  const [clienteFilter, setClienteFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [modalNovo, setModalNovo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  // Form novo
  const [novoClienteId, setNovoClienteId] = useState(CLIENTES[0]?.id || "");
  const [novoTitulo, setNovoTitulo] = useState("Entrevista de Avaliação dos Fatores Psicossociais");
  const [novoEntrevistador, setNovoEntrevistador] = useState("Caio Guedes");

  const [entrevistas, setEntrevistas] = useState(() => {
    try {
      const saved = localStorage.getItem("MENCTOR_ENTREVISTAS");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return ENTREVISTAS_MOCK;
  });

  const saveEntrevistas = (updated) => {
    setEntrevistas(updated);
    try {
      localStorage.setItem("MENCTOR_ENTREVISTAS", JSON.stringify(updated));
    } catch (e) { /* ignore */ }
  };

  const handleCriar = (e) => {
    e.preventDefault();
    const nova = {
      id: `ent-${Date.now()}`,
      clienteId: novoClienteId,
      titulo: novoTitulo,
      entrevistador: novoEntrevistador,
      data: new Date().toISOString().split("T")[0],
      status: "rascunho",
      fatoresAvaliados: {},
      atualizadoEm: `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    };
    const updated = [nova, ...entrevistas];
    saveEntrevistas(updated);
    setModalNovo(false);
    navigate("entrevista-detalhe", { id: nova.id });
  };

  const filtered = useMemo(() => {
    return entrevistas.filter(item => {
      if (clienteFilter !== "todos" && item.clienteId !== clienteFilter) return false;
      if (statusFilter !== "todos" && item.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const cli = CLIENTES.find(c => c.id === item.clienteId);
        const cliName = cli?.name?.toLowerCase() || "";
        const tit = item.titulo?.toLowerCase() || "";
        if (!cliName.includes(q) && !tit.includes(q)) return false;
      }
      return true;
    });
  }, [entrevistas, clienteFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const total = entrevistas.length;
    const concluidas = entrevistas.filter(e => e.status === "concluida").length;
    const emAndamento = entrevistas.filter(e => e.status === "em_andamento").length;
    return { total, concluidas, emAndamento };
  }, [entrevistas]);

  return (
    <Page>
      {/* ─── HERO HEADER BANNER (Soft Warm Orange Gradient) ─── */}
      <div style={{
        background: "linear-gradient(135deg, #FFFDFB 0%, #FFF4EB 50%, #FFE9D6 100%)",
        borderRadius: 16,
        padding: "32px 38px",
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        border: "1px solid #FED7AA",
        boxShadow: "0 4px 20px rgba(234,88,12,0.06)"
      }}>
        {/* Background Soft Glow Circles */}
        <div style={{
          position: "absolute",
          right: "18%",
          top: "-20%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(254,215,170,0.6) 0%, rgba(255,247,237,0) 70%)",
          pointerEvents: "none"
        }} />

        {/* Left Content */}
        <div style={{ zIndex: 2, maxWidth: 640 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#EA580C",
            marginBottom: 6
          }}>
            METODOLOGIA CERTIFICARI NR1 • AVALIAÇÃO QUALITATIVA
          </div>
          <h1 style={{
            fontSize: 27,
            fontWeight: 800,
            margin: 0,
            color: "#00204D",
            letterSpacing: "-0.02em"
          }}>
            Entrevistas de Riscos Psicossociais
          </h1>
          <p style={{
            margin: "10px 0 0",
            fontSize: 13.5,
            color: "#475569",
            lineHeight: 1.5,
            maxWidth: 580
          }}>
            Roteiro estruturado de 12 fatores em 3 estruturas (Relações, Atividades, Organizacional) para diagnóstico e classificação de maturidade.
          </p>
        </div>

        {/* Right Graphic: Clipboard + 3D Shield + Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, zIndex: 2 }}>
          {/* Stylized Vector Illustration */}
          <div style={{ position: "relative", width: 140, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Clipboard */}
            <div style={{
              width: 74,
              height: 94,
              background: "#FFFFFF",
              borderRadius: 8,
              border: "2px solid #CBD5E1",
              boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
              padding: "12px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              position: "relative"
            }}>
              {/* Clipboard clip */}
              <div style={{
                position: "absolute",
                top: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 26,
                height: 12,
                borderRadius: "4px 4px 0 0",
                background: "#94A3B8",
                border: "2px solid #64748B"
              }} />
              {/* Checked rows */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "#F97316", fontWeight: 800, fontSize: 10 }}>✓</span>
                <span style={{ height: 3, background: "#E2E8F0", borderRadius: 2, flex: 1 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "#F97316", fontWeight: 800, fontSize: 10 }}>✓</span>
                <span style={{ height: 3, background: "#E2E8F0", borderRadius: 2, flex: 1 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "#F97316", fontWeight: 800, fontSize: 10 }}>✓</span>
                <span style={{ height: 3, background: "#E2E8F0", borderRadius: 2, flex: 1 }} />
              </div>
            </div>

            {/* Person Silhouette behind shield */}
            <div style={{ position: "absolute", right: 28, bottom: 4 }}>
              <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
                <circle cx="17" cy="11" r="7" fill="#F97316"/>
                <path d="M5 36c0-6.6 5.4-12 12-12s12 5.4 12 12v6H5v-6z" fill="#EA580C"/>
              </svg>
            </div>

            {/* Glowing Orange 3D Shield */}
            <div style={{
              position: "absolute",
              right: 0,
              bottom: 8,
              width: 48,
              height: 56,
              borderRadius: "6px 6px 20px 20px",
              background: "linear-gradient(145deg, #FB923C, #EA580C)",
              border: "2px solid #FFEDD5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(234,88,12,0.4)"
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>

          {/* "+ Nova Entrevista" Button */}
          <button
            onClick={() => setModalNovo(true)}
            style={{
              height: 42,
              padding: "0 22px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #FF6A00, #EA580C)",
              border: "none",
              color: "#FFFFFF",
              fontSize: 13.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(234,88,12,0.3)",
              transition: "all .15s ease",
              flexShrink: 0
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <span style={{ fontSize: 16, fontWeight: 800 }}>+</span>
            Nova Entrevista
          </button>
        </div>
      </div>

      {/* ─── 3 KPI CARDS (Row of 3 Cards) ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 24 }}>

        {/* Card 1: TOTAL DE ENTREVISTAS */}
        <div className="card" style={{
          background: "#FFFFFF",
          borderRadius: 14,
          padding: "20px 24px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "#DBEAFE",
            color: "#2563EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em" }}>
              TOTAL DE ENTREVISTAS
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#00204D", margin: "2px 0" }}>
              {stats.total}
            </div>
            <div style={{ fontSize: 11.5, color: "#94A3B8" }}>
              Todos os registros
            </div>
          </div>
        </div>

        {/* Card 2: EM ANDAMENTO */}
        <div className="card" style={{
          background: "#FFFFFF",
          borderRadius: 14,
          padding: "20px 24px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "#FEF3C7",
            color: "#D97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 22h14"/>
              <path d="M5 2h14"/>
              <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
              <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em" }}>
              EM ANDAMENTO
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#00204D", margin: "2px 0" }}>
              {stats.emAndamento}
            </div>
            <div style={{ fontSize: 11.5, color: "#94A3B8" }}>
              Aguardando conclusão
            </div>
          </div>
        </div>

        {/* Card 3: CONCLUÍDAS */}
        <div className="card" style={{
          background: "#FFFFFF",
          borderRadius: 14,
          padding: "20px 24px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "#DCFCE7",
            color: "#16A34A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em" }}>
              CONCLUÍDAS
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#00204D", margin: "2px 0" }}>
              {stats.concluidas}
            </div>
            <div style={{ fontSize: 11.5, color: "#94A3B8" }}>
              Entrevistas finalizadas
            </div>
          </div>
        </div>

      </div>

      {/* ─── SEARCH & FILTER BAR ─── */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        {/* Search Input */}
        <div style={{ position: "relative", flex: "1 1 320px" }}>
          <input
            type="text"
            placeholder="Buscar por cliente ou título da entrevista..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: 42,
              padding: "0 14px 0 38px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              fontSize: 13,
              background: "#FFFFFF",
              color: "#0E2748",
              boxSizing: "border-box",
              outline: "none"
            }}
            onFocus={e => e.target.style.borderColor = "#EA580C"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>

        {/* Dropdown 1: Clientes */}
        <div style={{ position: "relative" }}>
          <select
            value={clienteFilter}
            onChange={e => setClienteFilter(e.target.value)}
            style={{
              height: 42,
              padding: "0 34px 0 36px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              fontSize: 13,
              background: "#FFFFFF",
              color: "#334155",
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
              appearance: "none"
            }}
          >
            <option value="todos">Todos os Clientes</option>
            {CLIENTES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        {/* Dropdown 2: Status */}
        <div style={{ position: "relative" }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              height: 42,
              padding: "0 34px 0 36px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              fontSize: 13,
              background: "#FFFFFF",
              color: "#334155",
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
              appearance: "none"
            }}
          >
            <option value="todos">Todos os Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ─── INTERVIEWS LIST ─── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center", color: "#64748B", background: "#FFFFFF", borderRadius: 14 }}>
            Nenhuma entrevista encontrada para os filtros selecionados.
          </div>
        ) : (
          filtered.map(item => {
            const cliente = CLIENTES.find(c => c.id === item.clienteId) || { name: "Cliente", sector: "Setor", color: "#EA580C" };
            const avaliadosCount = Object.keys(item.fatoresAvaliados || {}).length;
            const pct = Math.round((avaliadosCount / 12) * 100);

            // Structure progress
            const relCount = ENTREVISTA_FATORES.filter(f => f.estruturaId === "relacoes" && item.fatoresAvaliados?.[f.id]).length;
            const atvCount = ENTREVISTA_FATORES.filter(f => f.estruturaId === "atividades" && item.fatoresAvaliados?.[f.id]).length;
            const orgCount = ENTREVISTA_FATORES.filter(f => f.estruturaId === "organizacional" && item.fatoresAvaliados?.[f.id]).length;

            const isConcluida = item.status === "concluida";
            const isEmAndamento = item.status === "em_andamento";

            // Avatar background & initial
            const initial = cliente.name ? cliente.name[0].toUpperCase() : "E";
            let avatarBg = "#DBEAFE";
            let avatarColor = "#2563EB";
            if (cliente.id === "vitamed") {
              avatarBg = "#DCFCE7";
              avatarColor = "#16A34A";
            } else if (cliente.id === "agrocorp") {
              avatarBg = "#FFEDD5";
              avatarColor = "#EA580C";
            }

            // Status badge styling
            let statusLabel = "Rascunho";
            let statusBg = "#F1F5F9";
            let statusColor = "#64748B";
            if (isConcluida) {
              statusLabel = "Concluída";
              statusBg = "#DCFCE7";
              statusColor = "#16A34A";
            } else if (isEmAndamento) {
              statusLabel = "Em Andamento";
              statusBg = "#FEF3C7";
              statusColor = "#D97706";
            }

            // Timestamp text
            const timestampText = isConcluida
              ? `Concluída em ${new Date(item.data).toLocaleDateString("pt-BR")} às 16:45`
              : `Atualizado em ${new Date(item.data).toLocaleDateString("pt-BR")} às 10:32`;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  background: "#FFFFFF",
                  borderRadius: 14,
                  padding: "22px 26px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 24,
                  transition: "all .2s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#CBD5E1";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
                }}
              >
                {/* Left Side: Avatar + Details */}
                <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1, minWidth: 0 }}>
                  {/* Square Rounded Avatar */}
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    background: avatarBg,
                    color: avatarColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 20,
                    flexShrink: 0
                  }}>
                    {initial}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title + Status Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#00204D", margin: 0 }}>
                        {item.titulo}
                      </h3>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2.5px 10px",
                        borderRadius: 999,
                        background: statusBg,
                        color: statusColor
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Metadata line */}
                    <div style={{ fontSize: 12.5, color: "#64748B", marginBottom: 10 }}>
                      <span><strong>Cliente:</strong> {cliente.name}</span>
                      <span style={{ margin: "0 8px" }}>·</span>
                      <span><strong>Entrevistador:</strong> {item.entrevistador}</span>
                      <span style={{ margin: "0 8px" }}>·</span>
                      <span><strong>Data:</strong> {new Date(item.data).toLocaleDateString("pt-BR")}</span>
                    </div>

                    {/* Structure Chips */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 6,
                        background: isConcluida ? "#F0FDF4" : "#EFF6FF",
                        color: isConcluida ? "#16A34A" : "#2563EB"
                      }}>
                        Relações: {relCount}/4
                      </span>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 6,
                        background: isConcluida ? "#F0FDF4" : "#EFF6FF",
                        color: isConcluida ? "#16A34A" : "#2563EB"
                      }}>
                        Atividades: {atvCount}/4
                      </span>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 6,
                        background: isConcluida ? "#F0FDF4" : "#EFF6FF",
                        color: isConcluida ? "#16A34A" : "#2563EB"
                      }}>
                        Organizacional: {orgCount}/4
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Progress Bar + Action Button + Timestamp */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* Progress with bar */}
                    <div style={{ textAlign: "right", minWidth: 130 }}>
                      <div style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: isConcluida ? "#16A34A" : "#00204D",
                        marginBottom: 4
                      }}>
                        {avaliadosCount}/12 fatores ({pct}%)
                      </div>
                      <div style={{ width: 130, height: 6, borderRadius: 999, background: "#E2E8F0", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          background: isConcluida ? "#16A34A" : pct > 0 ? "linear-gradient(90deg, #FF6A00, #EA580C)" : "#CBD5E1",
                          width: `${pct}%`,
                          borderRadius: 999
                        }} />
                      </div>
                    </div>

                    {/* Action Pill Button */}
                    {isConcluida ? (
                      <button
                        onClick={() => navigate("entrevista-detalhe", { id: item.id })}
                        style={{
                          height: 38,
                          padding: "0 18px",
                          borderRadius: 999,
                          background: "#16A34A",
                          border: "none",
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        Ver Resultado ›
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("entrevista-detalhe", { id: item.id })}
                        style={{
                          height: 38,
                          padding: "0 20px",
                          borderRadius: 999,
                          background: "linear-gradient(135deg, #FF6A00, #EA580C)",
                          border: "none",
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: "0 2px 8px rgba(234,88,12,0.25)"
                        }}
                      >
                        Conduzir ›
                      </button>
                    )}

                    {/* Three Dots Menu */}
                    <span style={{ color: "#94A3B8", cursor: "pointer", fontSize: 18, padding: "0 4px" }}>⋮</span>
                  </div>

                  {/* Timestamp below */}
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                    {timestampText}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── PAGINATION FOOTER ─── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        paddingTop: 16,
        fontSize: 12.5,
        color: "#64748B"
      }}>
        {/* Left Count */}
        <div>
          Mostrando 1 a {filtered.length} de {entrevistas.length} entrevistas
        </div>

        {/* Center/Right Pagination Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              disabled={currentPage === 1}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentPage === 1 ? "not-allowed" : "pointer"
              }}
            >
              ‹
            </button>
            <button style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "#00204D",
              border: "none",
              color: "#FFFFFF",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}>
              1
            </button>
            <button
              disabled={true}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "not-allowed"
              }}
            >
              ›
            </button>
          </div>

          {/* Itens por página */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Itens por página:</span>
            <select
              value={itensPorPagina}
              onChange={e => setItensPorPagina(Number(e.target.value))}
              style={{
                height: 32,
                padding: "0 8px",
                borderRadius: 6,
                border: "1px solid #E2E8F0",
                fontSize: 12.5,
                background: "#FFFFFF",
                color: "#334155",
                cursor: "pointer"
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── MODAL NOVA ENTREVISTA ─── */}
      {modalNovo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(14,39,72,0.5)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 500, padding: 28, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #E2E8F0", paddingBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#00204D" }}>Nova Entrevista de Riscos</h2>
              <button onClick={() => setModalNovo(false)} style={{ color: "#94A3B8", fontSize: 22, background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>

            <form onSubmit={handleCriar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Empresa / Cliente *</label>
                <select
                  value={novoClienteId}
                  onChange={e => setNovoClienteId(e.target.value)}
                  style={{ width: "100%", height: 40, padding: "0 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  required
                >
                  {CLIENTES.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.sector})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Título da Avaliação *</label>
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={e => setNovoTitulo(e.target.value)}
                  style={{ width: "100%", height: 40, padding: "0 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Terapeuta Corporativo / Entrevistador</label>
                <input
                  type="text"
                  value={novoEntrevistador}
                  onChange={e => setNovoEntrevistador(e.target.value)}
                  style={{ width: "100%", height: 40, padding: "0 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => setModalNovo(false)} className="btn btn-soft" style={{ height: 38, fontSize: 13 }}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    height: 38,
                    padding: "0 20px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #FF6A00, #EA580C)",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Iniciar Entrevista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Page>
  );
};

Object.assign(window, { EntrevistasScreen });
