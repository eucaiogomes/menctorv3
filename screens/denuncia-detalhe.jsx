/* global React, Icon, Page, CLIENTES, TIPOS_DENUNCIA, DENUNCIA_STATUS, DENUNCIA_GRAVIDADE, DENUNCIAS_MOCK, MenctorDB */
const { useState, useMemo, useEffect } = React;

const ETAPAS_PADRAO = [
  { id: "triagem", nome: "Triagem e Análise Preliminar", icone: "search", cor: "#2A6FDB", ajuda: "Verificar se há elementos mínimos de autoria e materialidade antes de dar prosseguimento." },
  { id: "convocacao_comite", nome: "Convocação do Comitê para Análise do Caso", icone: "users", cor: "#16a34a", ajuda: "Reunir os membros designados para definir a estratégia de apuração." },
  { id: "acolhimento_vitima", nome: "Acolhimento e Escuta da Vítima", icone: "leaf", cor: "#0D9488", ajuda: "Ouvir a vítima com empatia, garantindo total segurança e ausência de retaliação." },
  { id: "acionamento_juridico", nome: "Acionamento do Departamento Jurídico", icone: "scale", cor: "#7C3AED", ajuda: "Avaliar riscos legais, trabalhistas e necessidade de medidas protetivas formais." },
  { id: "cuidado_medico", nome: "Cuidado Médico e Psicológico", icone: "pulse", cor: "#E5484D", ajuda: "Encaminhar para suporte de saúde mental e atendimento especializado quando necessário." },
  { id: "resposta_denunciante", nome: "Resposta ao Denunciante", icone: "bell", cor: "#F0A800", ajuda: "Manter o denunciante informado sobre o andamento sem revelar dados sigilosos da investigação." },
  { id: "coleta_evidencias", nome: "Coleta Complementar de Evidências", icone: "shield", cor: "#DC2626", ajuda: "Coletar documentos, depoimentos de testemunhas e registros pertinentes." },
  { id: "conclusao_caso", nome: "Registrar a conclusão do caso", icone: "check", cor: "#22c55e", final: true, ajuda: "Emitir o parecer final de apuração com classificação do resultado e recomendações." },
];

const DenunciaDetalheScreen = ({ navigate, id: paramId, params = {} }) => {
  const casoId = paramId || params.id || "den-001";

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

  const caso = useMemo(() => {
    return denuncias.find(d => d.id === casoId) || denuncias[0] || DENUNCIAS_MOCK[0];
  }, [denuncias, casoId]);

  // Right column active sub-view: "processo", "conteudo", "novo_andamento", "chat", "conclusao", "auditoria"
  const [rightTab, setRightTab] = useState("processo");

  // Novo Andamento Form State
  const [selectedEtapa, setSelectedEtapa] = useState(ETAPAS_PADRAO[0]);
  const [andamentoTitulo, setAndamentoTitulo] = useState(ETAPAS_PADRAO[0].nome);
  const [andamentoVisibilidade, setAndamentoVisibilidade] = useState("comite"); // "comite" or "denunciante"
  const [notificarComite, setNotificarComite] = useState(true);
  const [notificarDenunciante, setNotificarDenunciante] = useState(false);
  const [andamentoFeedback, setAndamentoFeedback] = useState("");
  const [andamentoAnexo, setAndamentoAnexo] = useState(null);

  // Chat State
  const [chatMsg, setChatMsg] = useState("");

  // Conclusão State
  const [parecerTexto, setParecerTexto] = useState(caso.parecer || "");
  const [resultadoClassif, setResultadoClassif] = useState(caso.resultado || "procedente");
  const [recomendacoesTexto, setRecomendacoesTexto] = useState(caso.recomendacoes || "");

  // Helper to persist updates: atualiza a lista local na hora (otimista) e
  // sincroniza com o Supabase em segundo plano.
  const saveCaso = (updatedCaso) => {
    const updatedList = denuncias.map(d => d.id === updatedCaso.id ? updatedCaso : d);
    setDenuncias(updatedList);
    MenctorDB.upsertDenuncia(updatedCaso).catch(err => console.warn("Falha ao sincronizar denúncia", err));
  };

  const handleSalvarAndamento = (e) => {
    e.preventDefault();
    if (!andamentoFeedback.trim()) return;

    const now = new Date();
    const novo = {
      data: now.toISOString(),
      etapa: andamentoTitulo,
      descricao: andamentoFeedback,
      responsavel: "Ana Paula (Compliance)",
      visibilidade: andamentoVisibilidade,
      notificadoComite: notificarComite,
      notificadoDenunciante: notificarDenunciante,
      anexo: andamentoAnexo ? andamentoAnexo.name : null
    };

    const newAudit = {
      data: `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      acao: `Andamento registrado: ${andamentoTitulo}`,
      usuario: "Ana Paula Rios"
    };

    const updated = {
      ...caso,
      andamentos: [...(caso.andamentos || []), novo],
      auditLog: [...(caso.auditLog || []), newAudit]
    };

    saveCaso(updated);
    setAndamentoFeedback("");
    setAndamentoAnexo(null);
    setRightTab("processo");
  };

  const handleEnviarChat = (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;

    const novaMsg = {
      data: new Date().toISOString(),
      remetente: "compliance",
      texto: chatMsg
    };

    const updated = {
      ...caso,
      mensagens: [...(caso.mensagens || []), novaMsg]
    };

    saveCaso(updated);
    setChatMsg("");
  };

  const handleSalvarConclusao = (e) => {
    e.preventDefault();
    const updated = {
      ...caso,
      status: "concluido",
      parecer: parecerTexto,
      resultado: resultadoClassif,
      recomendacoes: recomendacoesTexto,
      andamentos: [
        ...(caso.andamentos || []),
        {
          data: new Date().toISOString(),
          etapa: "Conclusão do Caso",
          descricao: `Processo finalizado como ${resultadoClassif.toUpperCase()}. Parecer emitido pela equipe de compliance.`,
          responsavel: "Ana Paula (Compliance)",
          visibilidade: "denunciante"
        }
      ]
    };
    saveCaso(updated);
    setRightTab("processo");
  };

  if (loading) {
    return (
      <Page>
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-muted)" }}>Carregando denúncia...</div>
      </Page>
    );
  }

  const st = DENUNCIA_STATUS[caso.status];
  const dtRelato = new Date(caso.data);

  return (
    <Page>
      {/* Top Breadcrumb / Return */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => navigate("denuncias")}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer" }}
        >
          <Icon name="chevron-left" size={15} /> Voltar para Gestão de Denúncias
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setRightTab("chat")}
            className={`btn ${rightTab === "chat" ? "btn-primary" : "btn-soft"}`}
            style={{ height: 34, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Icon name="megaphone" size={13} /> Chat Sigiloso ({caso.mensagens?.length || 0})
          </button>
          <button
            onClick={() => setRightTab("auditoria")}
            className={`btn ${rightTab === "auditoria" ? "btn-primary" : "btn-soft"}`}
            style={{ height: 34, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Icon name="file-text" size={13} /> Trilha de Auditoria
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "480px 1fr", gap: 24, alignItems: "flex-start" }}>
        {/* ─── LEFT COLUMN: Dados do Caso ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Card 1: Header do Caso */}
          <div className="card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)", textTransform: "uppercase" }}>
                {caso.natureza}
              </h2>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                background: `${st?.cor}15`, color: st?.cor, textTransform: "uppercase"
              }}>
                {st?.label}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 16 }}>
              <span>🔒 <strong>NOME DO RELATOR:</strong> {caso.anonimo ? "T***E (Anônimo protegido)" : caso.denunciante}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div>
                <span style={{ color: "var(--ink-muted)", display: "block" }}>PROTOCOLO:</span>
                <strong style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>{caso.protocolo}</strong>
              </div>
              <div>
                <span style={{ color: "var(--ink-muted)", display: "block" }}>DATA DO RELATO:</span>
                <strong style={{ color: "var(--ink)" }}>
                  {dtRelato.toLocaleDateString("pt-BR")} {dtRelato.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </strong>
              </div>
              <div>
                <span style={{ color: "var(--ink-muted)", display: "block" }}>LOCAL / UNIDADE:</span>
                <strong style={{ color: "var(--ink)" }}>{caso.area}</strong>
              </div>
              <div>
                <span style={{ color: "var(--ink-muted)", display: "block" }}>ÚLTIMA ATUALIZAÇÃO:</span>
                <strong style={{ color: "var(--ink)" }}>Hoje</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Identificação & Dados do Ocorrido */}
          <div className="card" style={{ padding: "20px 22px", fontSize: 12.5, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--ink-faint)", marginBottom: 6 }}>IDENTIFICAÇÃO</div>
              <div style={{ color: "var(--ink-soft)" }}>
                <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11.5 }}>QUAL É A SUA RELAÇÃO COM O OCORRIDO?</span>
                <strong style={{ color: "var(--health-deep)" }}>✓ Sou a vítima</strong>
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11.5 }}>SEU NOME / CONTATOS (OPCIONAL):</span>
                <span style={{ color: "var(--ink-soft)" }}>{caso.anonimo ? "— Não fornecido (Denúncia Anônima protegida pela LGPD)" : `${caso.denunciante} · (11) 98765-4321`}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div className="eyebrow" style={{ color: "var(--ink-faint)", marginBottom: 6 }}>DADOS DO OCORRIDO</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11.5 }}>TIPO DO AUTOR:</span>
                  <strong style={{ color: "var(--ink)" }}>✓ Uma pessoa</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11.5 }}>FAZ PARTE DO COMITÊ?</span>
                  <strong style={{ color: "var(--ink)" }}>✓ Não</strong>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11.5 }}>DESCRIÇÃO DO OCORRIDO:</span>
                <div style={{ marginTop: 4, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 6, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                  {caso.relato}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--ink-muted)", display: "block", fontSize: 11.5 }}>EVIDÊNCIAS ANEXADAS:</span>
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                  {caso.evidencias && caso.evidencias.length > 0 ? (
                    caso.evidencias.map((ev, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--sky)", fontSize: 12 }}>
                        <Icon name="file" size={14} color="var(--sky)" /> {ev}
                      </div>
                    ))
                  ) : (
                    <span style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>Nenhum arquivo enviado</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div className="eyebrow" style={{ color: "var(--ink-faint)", marginBottom: 4 }}>TERMO DE ACEITE / CONSENTIMENTO</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)", lineHeight: 1.4 }}>
                "DECLARO, PARA OS DEVIDOS FINS DE DIREITO, SOB AS PENAS DA LEI, QUE O FATO RELATADO ACIMA CONSTITUI UMA DENÚNCIA VERÍDICA..."
              </div>
              <div style={{ marginTop: 6, fontWeight: 700, color: "var(--health-deep)", fontSize: 12 }}>
                ✓ ACEITO PELO USUÁRIO NO MOMENTO DO ENVIO
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Gestão, Andamento & Ferramentas ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Sub-view Navigation Bar */}
          <div style={{ display: "flex", gap: 6, background: "var(--surface-2)", padding: 4, borderRadius: "var(--r-md)" }}>
            <button
              onClick={() => setRightTab("processo")}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 6,
                background: rightTab === "processo" ? "#fff" : "transparent",
                color: rightTab === "processo" ? "var(--ink)" : "var(--ink-muted)",
                fontWeight: rightTab === "processo" ? 700 : 500, fontSize: 12.5,
                border: rightTab === "processo" ? "1px solid var(--border)" : "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}
            >
              <Icon name="activity" size={14} /> Acompanhar Processo
            </button>

            <button
              onClick={() => setRightTab("conteudo")}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 6,
                background: rightTab === "conteudo" ? "#fff" : "transparent",
                color: rightTab === "conteudo" ? "var(--ink)" : "var(--ink-muted)",
                fontWeight: rightTab === "conteudo" ? 700 : 500, fontSize: 12.5,
                border: rightTab === "conteudo" ? "1px solid var(--border)" : "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}
            >
              <Icon name="book" size={14} /> Acessar Conteúdo & Guia
            </button>

            <button
              onClick={() => setRightTab("novo_andamento")}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 6,
                background: rightTab === "novo_andamento" ? "var(--accent)" : "transparent",
                color: rightTab === "novo_andamento" ? "#fff" : "var(--accent)",
                fontWeight: 700, fontSize: 12.5,
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}
            >
              <Icon name="plus" size={14} color={rightTab === "novo_andamento" ? "#fff" : "var(--accent)"} /> Registrar Andamento
            </button>
          </div>

          {/* ─── TAB 1: ACOMPANHAR PROCESSO (Timeline) ─── */}
          {rightTab === "processo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* "Saiba Como Agir" Banner */}
              <div style={{ padding: "16px 20px", borderRadius: "var(--r-lg)", background: "linear-gradient(135deg, #0E2748, #2A6FDB)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>SAIBA COMO AGIR</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                    Acesse nossa seção de orientações e descubra como tratar este caso com segurança jurídica e acolhimento.
                  </div>
                </div>
                <button
                  onClick={() => setRightTab("conteudo")}
                  className="btn"
                  style={{ background: "#fff", color: "var(--navy)", height: 32, fontSize: 12, fontWeight: 700, padding: "0 14px", flexShrink: 0 }}
                >
                  Acessar conteúdo →
                </button>
              </div>

              {/* Timeline Card */}
              <div className="card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                    Acompanhamento do Relato (Linha do Tempo)
                  </h3>
                  <button
                    onClick={() => setRightTab("novo_andamento")}
                    className="btn btn-primary"
                    style={{ height: 30, fontSize: 12, padding: "0 10px" }}
                  >
                    + Registrar Andamento
                  </button>
                </div>

                {/* Timeline Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", paddingLeft: 30 }}>
                  {/* Vertical bar */}
                  <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 2, background: "var(--border)" }} />

                  {(caso.andamentos || []).map((and, idx) => {
                    const dt = new Date(and.data);
                    return (
                      <div key={idx} style={{ position: "relative" }}>
                        {/* Dot */}
                        <div style={{
                          position: "absolute", left: -30, top: 0,
                          width: 24, height: 24, borderRadius: 999,
                          background: "#fff", border: "2px solid var(--accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: "var(--accent)"
                        }}>
                          {idx + 1}
                        </div>

                        <div style={{ background: "var(--surface-2)", padding: "14px 16px", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <strong style={{ fontSize: 13.5, color: "var(--ink)" }}>{and.etapa}</strong>
                              {and.visibilidade === "comite" && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "var(--amber-soft)", color: "var(--warning)" }}>
                                  VISÍVEL APENAS PARA O COMITÊ
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                              {dt.toLocaleDateString("pt-BR")} {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.45 }}>
                            {and.descricao}
                          </div>

                          <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11, color: "var(--ink-muted)" }}>
                            <span>Responsável: <strong>{and.responsavel}</strong></span>
                            <span>·</span>
                            <span style={{ color: "var(--health-deep)" }}>📧 Comitê notificado</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <button
                    onClick={() => setRightTab("novo_andamento")}
                    className="btn btn-soft"
                    style={{ height: 34, fontSize: 12.5, width: "100%" }}
                  >
                    + Registrar Novo Andamento
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: ACESSAR CONTEÚDO (Saiba como agir) ─── */}
          {rightTab === "conteudo" && (
            <div className="card" style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                  Saiba Como Agir — Diretrizes de Apuração
                </h3>
                <button onClick={() => setRightTab("processo")} className="btn btn-soft" style={{ height: 30, fontSize: 12 }}>
                  Voltar ao Processo
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                <div style={{ padding: "14px 16px", background: "var(--accent-soft)", borderRadius: 8, borderLeft: "3px solid var(--accent)" }}>
                  Ao receber uma denúncia, a empresa deve agir com <strong>seriedade, responsabilidade e estrita confidencialidade</strong>, priorizando sempre a proteção da vítima e a manutenção de um ambiente de trabalho seguro e respeitoso.
                </div>

                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                    1. Responsabilidades do Comitê de Gestão e Compliance:
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Conduzir a apuração inicial dos fatos relatados com neutralidade e imparcialidade.</li>
                    <li>Avaliar as informações e evidências apresentadas sem expor as partes.</li>
                    <li>Identificar a gravidade do incidente e a necessidade de medidas protetivas imediatas.</li>
                  </ol>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                    2. Papel do Recursos Humanos (RH):
                  </h4>
                  <p style={{ margin: 0 }}>
                    O setor de RH deve oferecer suporte psicossocial à vítima, providenciar eventuais remanejamentos temporários de posto e acompanhar as medidas preventivas para evitar reincidência.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                    3. Garantias de Proteção e Não Retaliação (Lei 14.457/2022):
                  </h4>
                  <p style={{ margin: 0 }}>
                    É terminantemente vedada qualquer forma de retaliação contra o denunciante ou testemunhas. A violação deste princípio configura infração grave com sanções civis e trabalhistas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 3: REGISTRAR ANDAMENTO (2-Panel Layout) ─── */}
          {rightTab === "novo_andamento" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                  Registrar Andamento do Processo
                </h3>
                <button onClick={() => setRightTab("processo")} className="btn btn-soft" style={{ height: 30, fontSize: 12 }}>
                  Cancelar
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, alignItems: "flex-start" }}>
                {/* Left Panel: Etapas Sugeridas */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 10 }}>
                    Etapas Sugeridas
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ETAPAS_PADRAO.map(etp => {
                      const isSel = selectedEtapa.id === etp.id;
                      const jaRealizado = (caso.andamentos || []).some(a => a.etapa.includes(etp.nome.split(" ")[0]));

                      return (
                        <button
                          key={etp.id}
                          type="button"
                          onClick={() => {
                            setSelectedEtapa(etp);
                            setAndamentoTitulo(etp.nome);
                          }}
                          style={{
                            textAlign: "left", padding: "10px", borderRadius: 8,
                            background: isSel ? "var(--accent-soft)" : "var(--surface-2)",
                            border: isSel ? "1px solid var(--accent)" : "1px solid var(--border)",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 999, background: etp.cor, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: isSel ? 700 : 500, color: isSel ? "var(--accent-cta)" : "var(--ink)" }}>
                              {etp.nome}
                            </span>
                          </div>
                          {jaRealizado && (
                            <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "var(--health-soft)", color: "var(--health-deep)", fontWeight: 700 }}>
                              REALIZADO
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Panel: Form */}
                <form onSubmit={handleSalvarAndamento} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Título da Etapa *</label>
                    <input
                      type="text"
                      value={andamentoTitulo}
                      onChange={e => setAndamentoTitulo(e.target.value)}
                      style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}
                      required
                    />
                  </div>

                  {/* Visibilidade */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                      Visibilidade do Item da Etapa *
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--surface-2)", padding: "10px 12px", borderRadius: 8 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="visib"
                          checked={andamentoVisibilidade === "comite"}
                          onChange={() => setAndamentoVisibilidade("comite")}
                        />
                        <span>Etapa visível apenas para o Comitê (Sigiloso)</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="visib"
                          checked={andamentoVisibilidade === "denunciante"}
                          onChange={() => setAndamentoVisibilidade("denunciante")}
                        />
                        <span>Etapa visível para o denunciante (Consulta via protocolo)</span>
                      </label>
                    </div>
                  </div>

                  {/* Notificações */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>
                      Enviar notificações aos envolvidos (opcional)
                    </label>
                    <div style={{ display: "flex", gap: 16 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                        <input type="checkbox" checked={notificarComite} onChange={e => setNotificarComite(e.target.checked)} />
                        <span>Notificar comitê por e-mail</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                        <input type="checkbox" checked={notificarDenunciante} onChange={e => setNotificarDenunciante(e.target.checked)} />
                        <span>Notificar denunciante por e-mail</span>
                      </label>
                    </div>
                  </div>

                  {/* Feedback Rich Text Area */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                      Feedback desta etapa (Ações Realizadas) *
                    </label>
                    {/* Rich text mock bar */}
                    <div style={{ display: "flex", gap: 4, padding: "4px 8px", background: "var(--surface-2)", border: "1px solid var(--border)", borderBottom: "none", borderRadius: "6px 6px 0 0" }}>
                      <button type="button" style={{ padding: "2px 8px", fontWeight: 700, fontSize: 12 }}>B</button>
                      <button type="button" style={{ padding: "2px 8px", fontStyle: "italic", fontSize: 12 }}>I</button>
                      <button type="button" style={{ padding: "2px 8px", textDecoration: "underline", fontSize: 12 }}>U</button>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="Descreva detalhadamente o que foi apurado ou executado nesta etapa..."
                      value={andamentoFeedback}
                      onChange={e => setAndamentoFeedback(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "0 0 6px 6px", border: "1px solid var(--border)", fontSize: 13 }}
                      required
                    />
                  </div>

                  {/* Anexar Arquivo */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>
                      Anexar arquivo da etapa (opcional)
                    </label>
                    <div style={{ border: "2px dashed var(--border)", padding: "14px", borderRadius: 8, textAlign: "center", fontSize: 12, color: "var(--ink-muted)" }}>
                      <span>Arraste o arquivo aqui ou clique para selecionar</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                    <button type="button" onClick={() => setRightTab("processo")} className="btn btn-soft" style={{ height: 36, fontSize: 13 }}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
                      Salvar Andamento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── TAB 4: CHAT SIGILOSO ─── */}
          {rightTab === "chat" && (
            <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", height: 500 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Chat Sigiloso Bidirecional</h3>
                  <span style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>Canal seguro para solicitar esclarecimentos mantendo o anonimato</span>
                </div>
                <button onClick={() => setRightTab("processo")} className="btn btn-soft" style={{ height: 28, fontSize: 12 }}>
                  Fechar Chat
                </button>
              </div>

              {/* Messages History */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "10px 0" }}>
                {(caso.mensagens || []).length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--ink-muted)", fontSize: 12.5, margin: "auto" }}>
                    Nenhuma mensagem trocada ainda. Envie uma mensagem para iniciar o diálogo seguro.
                  </div>
                ) : (
                  (caso.mensagens || []).map((msg, idx) => {
                    const isComp = msg.remetente === "compliance";
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isComp ? "flex-end" : "flex-start",
                          maxWidth: "80%",
                          padding: "10px 14px",
                          borderRadius: 12,
                          background: isComp ? "var(--accent)" : "var(--surface-2)",
                          color: isComp ? "#fff" : "var(--ink)",
                          fontSize: 12.5,
                          lineHeight: 1.4
                        }}
                      >
                        <div style={{ fontSize: 10.5, fontWeight: 700, marginBottom: 2, opacity: 0.85 }}>
                          {isComp ? "Equipe de Compliance" : "Denunciante (Anônimo)"}
                        </div>
                        {msg.texto}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleEnviarChat} style={{ display: "flex", gap: 8, marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <input
                  type="text"
                  placeholder="Digite sua mensagem ao denunciante..."
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  style={{ flex: 1, height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
                />
                <button type="submit" className="btn btn-primary" style={{ height: 38, fontSize: 13 }}>
                  Enviar
                </button>
              </form>
            </div>
          )}

          {/* ─── TAB 5: AUDITORIA DO CASO ─── */}
          {rightTab === "auditoria" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Trilha de Auditoria deste Caso</h3>
                <button onClick={() => setRightTab("processo")} className="btn btn-soft" style={{ height: 28, fontSize: 12 }}>
                  Voltar
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left", color: "var(--ink-muted)" }}>
                    <th style={{ padding: "8px 10px" }}>Data / Hora</th>
                    <th style={{ padding: "8px 10px" }}>Ação Realizada</th>
                    <th style={{ padding: "8px 10px" }}>Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {(caso.auditLog || []).map((log, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px", color: "var(--ink-muted)" }}>{log.data}</td>
                      <td style={{ padding: "10px", fontWeight: 600, color: "var(--ink)" }}>{log.acao}</td>
                      <td style={{ padding: "10px", color: "var(--ink-soft)" }}>{log.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

Object.assign(window, { DenunciaDetalheScreen });
