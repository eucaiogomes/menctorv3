/* global React, Icon, Page, CLIENTES, TIPOS_DENUNCIA, DENUNCIA_STATUS, DENUNCIA_GRAVIDADE, DENUNCIAS_MOCK, GOVERNANCA_COMITES, GOVERNANCA_POLITICAS */
const { useState, useMemo } = React;

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

  const [denuncias, setDenuncias] = useState(() => {
    try {
      const saved = localStorage.getItem("MENCTOR_DENUNCIAS");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return DENUNCIAS_MOCK;
  });

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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 4 }}>
            Compliance & Ouvidoria · Lei 14.457/2022 & NR-01
          </div>
          <h1 className="display" style={{ fontSize: 28, margin: 0, color: "var(--ink)" }}>
            Canal de Denúncias e Escuta
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ink-muted)" }}>
            Ambiente sigiloso e independente para triagem, investigação, governança e tratamento humanizado de manifestações.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("denuncia-portal")}
            className="btn btn-soft"
            style={{ height: 40, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
          >
            <Icon name="external" size={15} /> Abrir Portal do Denunciante
          </button>
        </div>
      </div>

      {/* Main module navigation tabs */}
      <div style={{ display: "flex", gap: 6, borderBottom: "2px solid var(--border)", marginBottom: 24, paddingBottom: 2 }}>
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
                padding: "8px 16px", borderRadius: "8px 8px 0 0",
                background: isAct ? "var(--surface)" : "transparent",
                color: isAct ? "var(--accent)" : "var(--ink-muted)",
                fontWeight: isAct ? 700 : 500, fontSize: 13.5,
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                borderBottom: isAct ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -4, transition: "all .15s"
              }}
            >
              <Icon name={tab.icon} size={15} color={isAct ? "var(--accent)" : "var(--ink-muted)"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: DASHBOARD ─── */}
      {activeTab === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* 4 KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-muted)", letterSpacing: "0.06em" }}>
                Total de Denúncias
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: "var(--ink)" }}>{kpis.total}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--health-deep)" }}>+18% vs mês ant.</span>
              </div>
            </div>

            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--warning)", letterSpacing: "0.06em" }}>
                Em Tratamento
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: "var(--warning)" }}>{kpis.emTratamento}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--warning)" }}>+8% vs mês ant.</span>
              </div>
            </div>

            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--health-deep)", letterSpacing: "0.06em" }}>
                Concluídas
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: "var(--health-deep)" }}>{kpis.concluidas}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--health-deep)" }}>+20% vs mês ant.</span>
              </div>
            </div>

            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--sky)", letterSpacing: "0.06em" }}>
                Tempo Médio de Resposta
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: "var(--sky)" }}>{kpis.tempoMedio} dias</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--health-deep)" }}>-15% vs mês ant.</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Donut Chart Representation: Denúncias por Tipo */}
            <div className="card" style={{ padding: "22px 24px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "var(--ink)" }}>
                Denúncias por Tipo
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{
                  width: 140, height: 140, borderRadius: 999,
                  background: "conic-gradient(#2A6FDB 0% 42%, #F66B0A 42% 66%, #7C3AED 66% 80%, #E5484D 80% 92%, #5C667C 92% 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0
                }}>
                  <div style={{ width: 80, height: 80, borderRadius: 999, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--display)" }}>{denuncias.length}</span>
                    <span style={{ fontSize: 10, color: "var(--ink-muted)", textTransform: "uppercase" }}>Total</span>
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#2A6FDB" }} /> Assédio Moral</span>
                    <strong>42%</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#F66B0A" }} /> Assédio Sexual</span>
                    <strong>24%</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#7C3AED" }} /> Discriminação</span>
                    <strong>14%</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#E5484D" }} /> Violência Psicológica</span>
                    <strong>12%</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#5C667C" }} /> Outros</span>
                    <strong>8%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Chart Representation: Evolução */}
            <div className="card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                  Evolução das Denúncias
                </h3>
                <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: "#2A6FDB" }} /> 2026</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e" }} /> 2025</span>
                </div>
              </div>

              {/* Chart Visual Simulation */}
              <div style={{ height: 140, display: "flex", alignItems: "flex-end", gap: 14, paddingTop: 10, borderBottom: "1px solid var(--border)" }}>
                {[
                  { m: "Jan", v1: 30, v2: 20 },
                  { m: "Fev", v1: 45, v2: 30 },
                  { m: "Mar", v1: 60, v2: 35 },
                  { m: "Abr", v1: 50, v2: 38 },
                  { m: "Mai", v1: 75, v2: 45 },
                  { m: "Jun", v1: 90, v2: 50 },
                ].map(item => (
                  <div key={item.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "center", gap: 4, alignItems: "flex-end", height: "100%" }}>
                      <div style={{ width: 10, background: "#2A6FDB", height: `${item.v1}%`, borderRadius: "3px 3px 0 0" }} title={`2026: ${item.v1}`} />
                      <div style={{ width: 10, background: "#22c55e", height: `${item.v2}%`, borderRadius: "3px 3px 0 0" }} title={`2025: ${item.v2}`} />
                    </div>
                    <span style={{ fontSize: 10, color: "var(--ink-muted)" }}>{item.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Casos em Andamento Table */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                Casos em Andamento
              </h3>
              <button onClick={() => setActiveTab("casos")} className="btn btn-soft" style={{ height: 30, fontSize: 12 }}>
                Ver Todos os Casos
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
                  <th style={{ padding: "8px 10px" }}>Código / Protocolo</th>
                  <th style={{ padding: "8px 10px" }}>Tipo / Natureza</th>
                  <th style={{ padding: "8px 10px" }}>Data</th>
                  <th style={{ padding: "8px 10px" }}>Status</th>
                  <th style={{ padding: "8px 10px" }}>Responsável</th>
                  <th style={{ padding: "8px 10px" }}>Prazo</th>
                  <th style={{ padding: "8px 10px", textAlign: "right" }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {denuncias.slice(0, 4).map(d => {
                  const st = DENUNCIA_STATUS[d.status];
                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12 }}>{d.protocolo}</td>
                      <td style={{ padding: "10px", fontWeight: 600, color: "var(--ink)" }}>{d.natureza}</td>
                      <td style={{ padding: "10px", color: "var(--ink-muted)", fontSize: 12 }}>{new Date(d.data).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: `${st?.cor}15`, color: st?.cor }}>
                          {st?.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px", color: "var(--ink-soft)" }}>Ana Paula (Compliance)</td>
                      <td style={{ padding: "10px", color: "var(--ink-muted)", fontSize: 12 }}>{new Date(d.prazoFinal).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        <button
                          onClick={() => navigate("denuncia-detalhe", { id: d.id })}
                          className="btn btn-soft"
                          style={{ height: 28, fontSize: 12, padding: "0 8px" }}
                        >
                          Tratar Caso
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

      {/* ─── TAB 2: CASOS (Lista Geral de Manifestações) ─── */}
      {activeTab === "casos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Filters Bar */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <input
                type="text"
                placeholder="Buscar por protocolo, natureza ou relato..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: "100%", height: 36, padding: "0 10px 0 32px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", fontSize: 12.5, background: "#fff" }}
              />
              <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)" }}>
                <Icon name="search" size={14} />
              </div>
            </div>

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ height: 36, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", fontSize: 12.5, background: "#fff" }}>
              <option value="todos">Todos os Status</option>
              <option value="triagem">Em Triagem</option>
              <option value="investigacao">Em Investigação</option>
              <option value="concluido">Concluído</option>
              <option value="arquivado">Arquivado</option>
            </select>

            <select value={filterGravidade} onChange={e => setFilterGravidade(e.target.value)} style={{ height: 36, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", fontSize: 12.5, background: "#fff" }}>
              <option value="todos">Todas as Gravidades</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>

            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ height: 36, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", fontSize: 12.5, background: "#fff" }}>
              <option value="todos">Todas as Naturezas</option>
              {TIPOS_DENUNCIA.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>

            <select value={filterCliente} onChange={e => setFilterCliente(e.target.value)} style={{ height: 36, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", fontSize: 12.5, background: "#fff" }}>
              <option value="todos">Todas as Empresas</option>
              {CLIENTES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Cases Table with exact 6 required fields */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
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
                {filteredCasos.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "var(--ink-muted)" }}>
                      Nenhum caso encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredCasos.map(d => {
                    const st = DENUNCIA_STATUS[d.status];
                    const gr = DENUNCIA_GRAVIDADE[d.gravidade];
                    const dt = new Date(d.data);
                    const prazoDt = new Date(d.prazoFinal);
                    const diasRestantes = Math.max(0, Math.ceil((prazoDt - new Date()) / (1000 * 60 * 60 * 24)));

                    return (
                      <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 10px", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--ink)" }}>
                          {d.protocolo}
                        </td>
                        <td style={{ padding: "12px 10px", color: "var(--ink-muted)", fontSize: 12 }}>
                          {dt.toLocaleDateString("pt-BR")} às {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: `${st?.cor}15`, color: st?.cor }}>
                            {st?.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: `${gr?.cor}15`, color: gr?.cor }}>
                            {gr?.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px", fontWeight: 600, color: "var(--ink)" }}>
                          {d.natureza}
                        </td>
                        <td style={{ padding: "12px 10px", color: diasRestantes < 5 ? "var(--coral)" : "var(--ink-muted)", fontWeight: diasRestantes < 5 ? 700 : 400, fontSize: 12 }}>
                          {diasRestantes} dias restantes
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "right" }}>
                          <button
                            onClick={() => navigate("denuncia-detalhe", { id: d.id })}
                            className="btn btn-primary"
                            style={{ height: 30, fontSize: 12, padding: "0 12px" }}
                          >
                            Ver Detalhes <Icon name="chevron-right" size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: GOVERNANÇA ─── */}
      {activeTab === "governanca" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Sub-tabs Governança */}
          <div style={{ display: "flex", gap: 6, background: "var(--surface-2)", padding: 4, borderRadius: "var(--r-md)", width: "fit-content" }}>
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
                  color: govTab === sub.id ? "var(--ink)" : "var(--ink-muted)",
                  fontWeight: govTab === sub.id ? 700 : 500, fontSize: 12.5,
                  border: govTab === sub.id ? "1px solid var(--border)" : "none",
                  cursor: "pointer", boxShadow: govTab === sub.id ? "var(--shadow-card)" : "none"
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub 1: Membros */}
          {govTab === "membros" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Membros de Governança e Comitês</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--ink-muted)" }}>Usuários autorizados a receber, triar e investigar manifestações com sigilo legal.</p>
                </div>
                <button className="btn btn-primary" style={{ height: 34, fontSize: 12.5 }}>
                  <Icon name="plus" size={14} /> Convidar Novo Membro
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
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
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px", fontWeight: 600, color: "var(--ink)" }}>{m.nome}</td>
                      <td style={{ padding: "10px", color: "var(--ink-muted)" }}>{m.email}</td>
                      <td style={{ padding: "10px", color: "var(--ink-soft)" }}>{m.comite}</td>
                      <td style={{ padding: "10px", color: "var(--ink-soft)" }}>{m.papel}</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--health-soft)", color: "var(--health-deep)" }}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub 2: Comitês */}
          {govTab === "comites" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Comitês de Ética e Compliance</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--ink-muted)" }}>Estruturas colegiadas responsáveis pelo julgamento e deliberação dos casos.</p>
                </div>
                <button className="btn btn-primary" style={{ height: 34, fontSize: 12.5 }}>
                  <Icon name="plus" size={14} /> Criar Comitê
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {GOVERNANCA_COMITES.map(com => (
                  <div key={com.id} style={{ padding: "16px 18px", border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface-2)" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{com.nome}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>Empresa vinculada: {CLIENTES.find(c => c.id === com.clienteId)?.name || com.clienteId}</div>
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 6 }}>Membros Integrantes:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {com.membros.map((mb, i) => (
                          <span key={i} style={{ fontSize: 11.5, padding: "3px 8px", borderRadius: 6, background: "#fff", border: "1px solid var(--border)", color: "var(--ink-soft)" }}>
                            {mb}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub 3: Auditoria & 4 Tipos de Relatórios */}
          {govTab === "auditoria" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* 4 Compliance Reports Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                <div className="card" style={{ padding: "18px 20px", borderLeft: "4px solid var(--sky)" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>1. Relatórios de Auditoria (Trilha)</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.4 }}>
                    Registro inalterável de todos os acessos e ações por caso. Prova de diligência e conformidade legal.
                  </p>
                </div>
                <div className="card" style={{ padding: "18px 20px", borderLeft: "4px solid var(--health)" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>2. Relatórios de Acompanhamento Semestral</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.4 }}>
                    Consolidado semestral (30/jun e 31/dez) para Diretoria e Conselho. Arquivado por 5 anos para reguladores.
                  </p>
                </div>
                <div className="card" style={{ padding: "18px 20px", borderLeft: "4px solid var(--warning)" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>3. Relatórios de Apuração (Investigação)</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.4 }}>
                    Resultado conclusivo (procedente/improcedente) com medidas recomendadas e encaminhamento executivo.
                  </p>
                </div>
                <div className="card" style={{ padding: "18px 20px", borderLeft: "4px solid var(--accent)" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>4. Transparência para Stakeholders</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.4 }}>
                    Estatísticas e KPIs agregados para assegurar a seriedade e fortalecer a cultura de integridade.
                  </p>
                </div>
              </div>

              {/* General Audit Logs Table */}
              <div className="card" style={{ padding: "22px 24px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "var(--ink)" }}>
                  Trilha Geral de Auditoria (Logs de Acesso e Alterações)
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
                      <th style={{ padding: "8px 10px" }}>Data / Hora</th>
                      <th style={{ padding: "8px 10px" }}>Usuário / Agente</th>
                      <th style={{ padding: "8px 10px" }}>Ação Registrada</th>
                      <th style={{ padding: "8px 10px" }}>Protocolo / Caso</th>
                      <th style={{ padding: "8px 10px" }}>Integridade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { data: "2026-06-20 10:30", user: "Ana Paula Rios", acao: "Andamento registrado: Investigação iniciada", caso: "DEN-2026-0001", hash: "SHA256:8f2a...e91" },
                      { data: "2026-06-18 11:00", user: "Ana Paula Rios", acao: "Mensagem enviada via chat sigiloso", caso: "DEN-2026-0001", hash: "SHA256:4b1c...d82" },
                      { data: "2026-06-16 14:00", user: "Ana Paula Rios", acao: "Status alterado para: Em Investigação", caso: "DEN-2026-0001", hash: "SHA256:1a9f...c33" },
                      { data: "2026-06-15 09:23", user: "Sistema (Portal)", acao: "Novo relato recebido anonimamente", caso: "DEN-2026-0001", hash: "SHA256:7c3e...a12" },
                      { data: "2026-06-10 14:00", user: "Ana Paula Rios", acao: "Parecer final registrado: Procedente", caso: "DEN-2026-0003", hash: "SHA256:2d8a...b74" },
                    ].map((log, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px", color: "var(--ink-muted)" }}>{log.data}</td>
                        <td style={{ padding: "10px", fontWeight: 600, color: "var(--ink)" }}>{log.user}</td>
                        <td style={{ padding: "10px", color: "var(--ink-soft)" }}>{log.acao}</td>
                        <td style={{ padding: "10px", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>{log.caso}</td>
                        <td style={{ padding: "10px", color: "var(--health-deep)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                          ✓ {log.hash}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub 4: Políticas */}
          {govTab === "politicas" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Políticas Institucionais e Manuais</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--ink-muted)" }}>Documentos normativos que regem a conduta, apuração e proteção contra retaliações.</p>
                </div>
                <button className="btn btn-primary" style={{ height: 34, fontSize: 12.5 }}>
                  <Icon name="plus" size={14} /> Publicar Política
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {GOVERNANCA_POLITICAS.map(pol => (
                  <div key={pol.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface-2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Icon name="file-text" size={20} color="var(--accent)" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{pol.titulo}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Versão {pol.versao} · Publicada em {pol.dataPublicacao}</div>
                      </div>
                    </div>
                    <button className="btn btn-soft" style={{ height: 30, fontSize: 12 }}>
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
          {/* Sub-tabs Gestão */}
          <div style={{ display: "flex", gap: 6, background: "var(--surface-2)", padding: 4, borderRadius: "var(--r-md)", width: "fit-content" }}>
            {[
              { id: "tipos", label: "Tipos de Denúncias" },
              { id: "documentos", label: "Documentos" },
              { id: "treinamentos", label: "Treinamentos" },
              { id: "perfil", label: "Perfil & Acessos" },
              { id: "ajuda", label: "Central de Ajuda" },
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setGestaoTab(sub.id)}
                style={{
                  padding: "6px 14px", borderRadius: 6,
                  background: gestaoTab === sub.id ? "#fff" : "transparent",
                  color: gestaoTab === sub.id ? "var(--ink)" : "var(--ink-muted)",
                  fontWeight: gestaoTab === sub.id ? 700 : 500, fontSize: 12.5,
                  border: gestaoTab === sub.id ? "1px solid var(--border)" : "none",
                  cursor: "pointer", boxShadow: gestaoTab === sub.id ? "var(--shadow-card)" : "none"
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub: Tipos de Denúncias */}
          {gestaoTab === "tipos" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Categorias e Tipos de Relato</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--ink-muted)" }}>Opções apresentadas aos colaboradores no portal público de denúncias.</p>
                </div>
                <button className="btn btn-primary" style={{ height: 34, fontSize: 12.5 }}>
                  <Icon name="plus" size={14} /> Novo Tipo
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {TIPOS_DENUNCIA.map(tipo => (
                  <div key={tipo.id} style={{ padding: "14px 16px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: tipo.cor }} />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{tipo.nome}</span>
                    </div>
                    <button className="btn btn-soft" style={{ height: 26, fontSize: 11, padding: "0 8px" }}>
                      Editar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub: Documentos & Materiais de Apoio */}
          {gestaoTab === "documentos" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Materiais de Apoio ao Denunciante</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--ink-muted)" }}>Cartilhas e orientações disponíveis no portal do denunciante.</p>
                </div>
                <button className="btn btn-primary" style={{ height: 34, fontSize: 12.5 }}>
                  <Icon name="plus" size={14} /> Adicionar Material
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "CARTILHA - COMBATE A AGRESSÃO FÍSICA",
                  "CARTILHA - PREVENÇÃO E COMBATE AO ASSÉDIO MORAL",
                  "CARTILHA - PREVENÇÃO E COMBATE AO ASSÉDIO SEXUAL",
                  "CARTILHA - ASSÉDIO ELEITORAL NO TRABALHO",
                  "CARTILHA - COMBATE À CORRUPÇÃO",
                  "CARTILHA - EVITANDO O DESVIO DE ATIVOS",
                ].map((cart, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface-2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-soft)" }}>
                      <Icon name="file" size={16} color="var(--accent)" />
                      <span>{cart}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--health-deep)", fontWeight: 600 }}>Ativo no portal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub: Treinamentos */}
          {gestaoTab === "treinamentos" && (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "var(--ink)" }}>Treinamentos Obrigatórios Vinculados</h3>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-muted)" }}>
                Conforme a Lei 14.457/2022, as empresas devem realizar treinamentos anuais sobre prevenção ao assédio e temas de integridade.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ padding: "14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Treinamento: Prevenção e Combate ao Assédio no Ambiente de Trabalho</div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Carga horária: 2h · Adesão atual: 92% dos colaboradores</div>
                  </div>
                  <button className="btn btn-soft" style={{ height: 30, fontSize: 12 }}>Ver Detalhes</button>
                </div>
              </div>
            </div>
          )}

          {/* Sub: Perfil e Acessos */}
          {gestaoTab === "perfil" && (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "var(--ink)" }}>Configuração do Portal e Sigilo</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Mensagem Institucional do Canal (Texto Livre)</label>
                  <textarea
                    rows={3}
                    defaultValue="Este é um canal independente, privado e sigiloso, mantido por uma empresa externa à nossa, para compartilhamento das diretrizes de ética, recebimento de denúncias e sugestões de melhorias."
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked />
                    <span>Remoção automática de metadados de fotos e documentos anexados</span>
                  </label>
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked />
                    <span>Não rastreamento de endereço IP e geolocalização do denunciante</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Sub: Central de Ajuda */}
          {gestaoTab === "ajuda" && (
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: "var(--ink)" }}>Central de Ajuda e Diretrizes Operacionais</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                <div style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 6 }}>
                  <strong>Como funciona o juízo de admissibilidade?</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--ink-muted)", fontSize: 12.5 }}>
                    O analista deve verificar se o relato contém indícios mínimos de autoria e materialidade antes de iniciar a fase formal de apuração.
                  </p>
                </div>
                <div style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 6 }}>
                  <strong>Quais são os prazos recomendados para resposta?</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--ink-muted)", fontSize: 12.5 }}>
                    Triagem inicial em até 48 horas. Conclusão da investigação em até 30 dias, prorrogável justificadamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Page>
  );
};

Object.assign(window, { DenunciasScreen });
