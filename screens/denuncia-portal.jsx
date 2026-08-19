/* global React, Icon, Page, CLIENTES, TIPOS_DENUNCIA, DENUNCIA_STATUS, DENUNCIAS_MOCK */
const { useState, useMemo } = React;

const DenunciaPortalPage = ({ navigate }) => {
  const [selectedTipo, setSelectedTipo] = useState(null); // Type clicked for new report
  const [step, setStep] = useState(1); // 1: intro/unidade, 2: formulario, 3: sucesso
  const [selectedUnidade, setSelectedUnidade] = useState("Matriz — São Paulo");
  const [termoConcordado, setTermoConcordado] = useState(false);

  // Form state
  const [isAnonimo, setIsAnonimo] = useState(true);
  const [relatorNome, setRelatorNome] = useState("");
  const [relatorEmail, setRelatorEmail] = useState("");
  const [relatorTelefone, setRelatorTelefone] = useState("");
  const [relacaoOcorrido, setRelacaoOcorrido] = useState("vitima");
  const [descricaoRelato, setDescricaoRelato] = useState("");
  const [localEspecifico, setLocalEspecifico] = useState("");
  const [autorIdentificador, setAutorIdentificador] = useState("");
  const [sugestoesRelator, setSugestoesRelator] = useState("");
  const [termoFinal, setTermoFinal] = useState(false);
  const [geradoProtocolo, setGeradoProtocolo] = useState("");

  // Protocol lookup modal
  const [lookupProtocolo, setLookupProtocolo] = useState("");
  const [casoConsultado, setCasoConsultado] = useState(null);
  const [lookupError, setLookupError] = useState(false);

  // Material de apoio modal
  const [materialModal, setMaterialModal] = useState(null);

  // Chat in lookup
  const [lookupChatMsg, setLookupChatMsg] = useState("");

  const handleIniciarRelato = (tipo) => {
    setSelectedTipo(tipo);
    setStep(1);
    setTermoConcordado(false);
    setTermoFinal(false);
  };

  const handleEnviarDenuncia = (e) => {
    e.preventDefault();
    if (!termoFinal) return;

    // Generate protocol code like DEN-2026-0842
    const numPart = Math.floor(1000 + Math.random() * 9000);
    const prot = `DEN-2026-${numPart}`;

    const novaDenuncia = {
      id: `den-${Date.now()}`,
      protocolo: prot,
      clienteId: "loghaus",
      data: new Date().toISOString(),
      status: "triagem",
      gravidade: "media",
      tipoId: selectedTipo?.id || "outros",
      natureza: selectedTipo?.nome || "Outros",
      anonimo: isAnonimo,
      denunciante: isAnonimo ? null : relatorNome,
      area: `${selectedUnidade} ${localEspecifico ? `— ${localEspecifico}` : ""}`,
      relato: descricaoRelato,
      evidencias: [],
      admissibilidade: null,
      prazoFinal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      andamentos: [
        {
          data: new Date().toISOString(),
          etapa: "Relato Recebido",
          descricao: "Seu relato foi registrado com sucesso em ambiente criptografado e já está em processo de triagem pela comissão independente.",
          responsavel: "Sistema",
          visibilidade: "denunciante"
        }
      ],
      mensagens: [],
      auditLog: [
        {
          data: new Date().toLocaleString("pt-BR"),
          acao: "Denúncia registrada via portal do denunciante",
          usuario: isAnonimo ? "Denunciante Anônimo" : relatorNome
        }
      ]
    };

    // Save
    try {
      const saved = localStorage.getItem("MENCTOR_DENUNCIAS");
      const list = saved ? JSON.parse(saved) : DENUNCIAS_MOCK;
      localStorage.setItem("MENCTOR_DENUNCIAS", JSON.stringify([novaDenuncia, ...list]));
    } catch (err) { /* ignore */ }

    setGeradoProtocolo(prot);
    setStep(3);
  };

  const handleConsultarProtocolo = (e) => {
    e.preventDefault();
    if (!lookupProtocolo.trim()) return;

    try {
      const saved = localStorage.getItem("MENCTOR_DENUNCIAS");
      const list = saved ? JSON.parse(saved) : DENUNCIAS_MOCK;
      const found = list.find(d => d.protocolo.toLowerCase() === lookupProtocolo.trim().toLowerCase());
      if (found) {
        setCasoConsultado(found);
        setLookupError(false);
      } else {
        setCasoConsultado(null);
        setLookupError(true);
      }
    } catch (err) {
      setCasoConsultado(null);
      setLookupError(true);
    }
  };

  const handleEnviarChatDenunciante = (e) => {
    e.preventDefault();
    if (!lookupChatMsg.trim() || !casoConsultado) return;

    const novaMsg = {
      data: new Date().toISOString(),
      remetente: "denunciante",
      texto: lookupChatMsg
    };

    const updated = {
      ...casoConsultado,
      mensagens: [...(casoConsultado.mensagens || []), novaMsg]
    };

    setCasoConsultado(updated);
    try {
      const saved = localStorage.getItem("MENCTOR_DENUNCIAS");
      const list = saved ? JSON.parse(saved) : DENUNCIAS_MOCK;
      const nextList = list.map(d => d.id === updated.id ? updated : d);
      localStorage.setItem("MENCTOR_DENUNCIAS", JSON.stringify(nextList));
    } catch (err) { /* ignore */ }

    setLookupChatMsg("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F4F6F9",
      fontFamily: "var(--sans)",
      color: "#0E2748",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      {/* ─── TOP HEADER ─── */}
      <header style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "16px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
      }}>
        {/* Brand Logo / Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #FF6A00, #F66B0A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(246,107,10,0.25)"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#00204D", lineHeight: 1.2 }}>
              Canal de Denúncias e Escuta
            </div>
            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>
              Plataforma Independente de Integridade & Compliance
            </div>
          </div>
        </div>

        {/* Management Access Button */}
        <button
          onClick={() => navigate("denuncias")}
          style={{
            height: 38,
            padding: "0 18px",
            borderRadius: 8,
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            color: "#0E2748",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            transition: "all .15s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#94A3B8"; e.currentTarget.style.background = "#F8FAFC"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.background = "#FFFFFF"; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0E2748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Acesso da Gestão (Credenciado)
        </button>
      </header>

      {/* ─── MAIN CONTENT CONTAINER (Full Width / Fluid Window Alignment) ─── */}
      <main style={{
        width: "100%",
        maxWidth: 1680,
        margin: "0 auto",
        padding: "24px 40px 36px",
        boxSizing: "border-box",
        flex: 1
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr clamp(350px, 24vw, 420px)",
          gap: 28,
          alignItems: "flex-start"
        }}>
          {/* ════════════════════════════════════════════════
              LEFT COLUMN (Hero Banner + Categories)
             ════════════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* 1. HERO BANNER */}
            <div style={{
              background: "radial-gradient(ellipse at 85% 50%, #103366 0%, #00204D 55%, #05162E 100%)",
              borderRadius: 16,
              padding: "36px 42px",
              color: "#FFFFFF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,32,77,0.14)"
            }}>
              {/* Left Text in Hero */}
              <div style={{ maxWidth: 680, zIndex: 2 }}>
                <h1 style={{
                  fontSize: 30,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF"
                }}>
                  Sua voz faz a diferença.<br />
                  <span style={{ color: "#FF6A00", fontWeight: 800 }}>Aqui</span>, você é ouvido e protegido.
                </h1>
                <p style={{
                  margin: "14px 0 24px",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "rgba(255,255,255,0.85)"
                }}>
                  Um ambiente seguro, sigiloso e independente para denunciar, relatar ou sugerir melhorias. Sua identidade é protegida e sua mensagem importa.
                </p>

                {/* 3 Pills in Hero */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>Sigilo Garantido</div>
                      <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.7)" }}>Sua identidade protegida</div>
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>Independente</div>
                      <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.7)" }}>Canal externo e imparcial</div>
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>Ação Responsável</div>
                      <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.7)" }}>Investigamos e tratamos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 3D Shield Illustration */}
              <div style={{ position: "relative", width: 220, height: 180, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, flexShrink: 0 }}>
                {/* Outer Glow Ring */}
                <div style={{
                  position: "absolute",
                  width: 170,
                  height: 170,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(30,58,138,0) 70%)",
                  filter: "blur(10px)"
                }} />

                {/* Concentric Circle Grid Lines */}
                <svg width="200" height="160" viewBox="0 0 200 160" fill="none" style={{ position: "absolute" }}>
                  <ellipse cx="100" cy="125" rx="85" ry="24" stroke="rgba(59,130,246,0.4)" strokeWidth="1.2" strokeDasharray="3 3"/>
                  <ellipse cx="100" cy="125" rx="55" ry="15" stroke="rgba(96,165,250,0.6)" strokeWidth="1.5"/>
                </svg>

                {/* Main 3D Shield */}
                <div style={{
                  width: 96,
                  height: 114,
                  borderRadius: "14px 14px 48px 48px",
                  background: "linear-gradient(145deg, #3B82F6, #1E40AF 70%, #172554)",
                  border: "2.5px solid #93C5FD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 25px rgba(30,64,175,0.5), inset 0 2px 6px rgba(255,255,255,0.6)",
                  position: "relative",
                  zIndex: 3
                }}>
                  {/* Glowing Checkmark */}
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>

                {/* Left Floating Chat Bubble */}
                <div style={{
                  position: "absolute",
                  left: 12,
                  top: 70,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1E40AF, #1E3A8A)",
                  border: "1.5px solid #60A5FA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  zIndex: 4
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>

                {/* Right Floating Lock */}
                <div style={{
                  position: "absolute",
                  right: 12,
                  top: 70,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1E40AF, #1E3A8A)",
                  border: "1.5px solid #60A5FA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  zIndex: 4
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. SECTION 1: CANAIS DE RELATO (4 Cards) */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#00204D" }}>Canais de Relato</h2>
                <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 2 }}>Escolha o tipo de situação que deseja relatar.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  {
                    id: "agressao",
                    nome: "Agressão Física",
                    desc: "Agressões verbais ou físicas no ambiente de trabalho.",
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    )
                  },
                  {
                    id: "assedio_politico",
                    nome: "Assédio Político-Eleitoral",
                    desc: "Coerção ou direcionamento de voto no trabalho.",
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    )
                  },
                  {
                    id: "desvio_comportamento",
                    nome: "Desvio de Comportamento",
                    desc: "Condutas inadequadas ou desrespeitosas.",
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    )
                  },
                  {
                    id: "discriminacao",
                    nome: "Discriminação e Racismo",
                    desc: "Preconceito, intolerância religiosa ou de gênero.",
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                        <line x1="9" y1="9" x2="9.01" y2="9"/>
                        <line x1="15" y1="9" x2="15.01" y2="9"/>
                      </svg>
                    )
                  },
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleIniciarRelato(item)}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 12,
                      padding: "16px 18px",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 120,
                      cursor: "pointer",
                      transition: "all .2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
                      e.currentTarget.style.borderColor = "#CBD5E1";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
                      e.currentTarget.style.borderColor = "#E2E8F0";
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#00204D", lineHeight: 1.2 }}>{item.nome}</div>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.4, marginTop: 4 }}>{item.desc}</div>
                    </div>
                    <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: "#F97316", display: "flex", alignItems: "center" }}>
                      →
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. SECTION 2: PREVENÇÃO E COMBATE (LEI 14.457/2022) (2 Featured Cards) */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#00204D", display: "flex", alignItems: "center", gap: 6 }}>
                  Prevenção e Combate
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8" }}>(Lei 14.457/2022)</span>
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  {
                    id: "assedio_moral",
                    nome: "Assédio Moral",
                    desc: "Humilhações recorrentes, perseguições ou abuso de autoridade.",
                    cta: "Relatar com Sigilo Garantido →",
                    iconColor: "#E11D48",
                    iconBg: "#FFE4E6",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
                        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
                        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                      </svg>
                    )
                  },
                  {
                    id: "assedio_sexual",
                    nome: "Assédio Sexual",
                    desc: "Condutas indesejadas de teor sexual, toques ou investidas.",
                    cta: "Relatar com Sigilo Garantido →",
                    iconColor: "#E11D48",
                    iconBg: "#FFE4E6",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                    )
                  }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleIniciarRelato(item)}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      padding: "20px 22px",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      cursor: "pointer",
                      transition: "all .2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 18px rgba(225,29,72,0.08)";
                      e.currentTarget.style.borderColor = "#FECDD3";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
                      e.currentTarget.style.borderColor = "#E2E8F0";
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: item.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#00204D", marginBottom: 3 }}>
                        {item.nome}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.4, marginBottom: 8 }}>
                        {item.desc}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#E11D48", display: "flex", alignItems: "center", gap: 4 }}>
                        {item.cta}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. SECTION 3: QUESTÕES FINANCEIRAS E MELHORIAS (2 Cards) */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#00204D" }}>
                  Questões Financeiras e Melhorias
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  {
                    id: "fraude",
                    nome: "Fraude e Corrupção",
                    desc: "Desvio de recursos, propina ou favorecimento indevido.",
                    cta: "Participar →",
                    ctaColor: "#16A34A",
                    iconBg: "#DCFCE7",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                    )
                  },
                  {
                    id: "sugestao",
                    nome: "Sugerir Melhoria",
                    desc: "Propostas para aprimorar processos, clima e bem-estar.",
                    cta: "Participar →",
                    ctaColor: "#F97316",
                    iconBg: "#FEF3C7",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="9" y1="18" x2="15" y2="18"/>
                        <line x1="10" y1="22" x2="14" y2="22"/>
                        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
                      </svg>
                    )
                  }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleIniciarRelato(item)}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      padding: "20px 22px",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      cursor: "pointer",
                      transition: "all .2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.06)";
                      e.currentTarget.style.borderColor = "#CBD5E1";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
                      e.currentTarget.style.borderColor = "#E2E8F0";
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: item.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#00204D", marginBottom: 3 }}>
                        {item.nome}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.4, marginBottom: 8 }}>
                        {item.desc}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: item.ctaColor, display: "flex", alignItems: "center", gap: 4 }}>
                        {item.cta}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ════════════════════════════════════════════════
              RIGHT COLUMN (Lookup + Materials + Illustration)
             ════════════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* 1. PROTOCOL LOOKUP CARD */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "24px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "#00204D" }}>
                Acompanhe sua denúncia ou relato
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748B", lineHeight: 1.45 }}>
                Digite o número do protocolo recebido ao final do seu envio para consultar o status atual.
              </p>

              <form onSubmit={handleConsultarProtocolo}>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Ex.: DEN-2026-0001"
                    value={lookupProtocolo}
                    onChange={e => setLookupProtocolo(e.target.value)}
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "0 38px 0 12px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 13,
                      color: "#0E2748",
                      boxSizing: "border-box",
                      outline: "none",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em"
                    }}
                    onFocus={e => e.target.style.borderColor = "#FF6A00"}
                    onBlur={e => e.target.style.borderColor = "#CBD5E1"}
                    required
                  />
                  <div style={{ position: "absolute", right: 12, top: 12, color: "#94A3B8" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    height: 42,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #FF6A00, #F66B0A)",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(246,107,10,0.28)",
                    transition: "all .15s ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  CONSULTAR PROTOCOLO
                </button>
              </form>

              {lookupError && (
                <div style={{ marginTop: 10, fontSize: 11.5, color: "#E11D48", background: "#FFE4E6", padding: "8px 12px", borderRadius: 6 }}>
                  Protocolo não encontrado. Verifique o código e tente novamente.
                </div>
              )}

              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748B" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Seus dados estão protegidos e criptografados.</span>
              </div>
            </div>

            {/* 2. MATERIAIS DE APOIO CARD (Dark Blue Card) */}
            <div style={{
              background: "#0E2748",
              borderRadius: 14,
              padding: "24px",
              color: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0,32,77,0.12)"
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", color: "#FFFFFF" }}>
                Materiais de Apoio
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>
                Consulte diretrizes corporativas e cartilhas educativas.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { title: "Cartilha - Combate à Agressão Física", icon: "file", type: "pdf" },
                  { title: "Cartilha - Prevenção ao Assédio Moral", icon: "file", type: "pdf" },
                  { title: "Cartilha - Combate ao Assédio Sexual", icon: "file", type: "pdf" },
                  { title: "Vídeo: Boas Práticas no Trabalho", icon: "video", type: "video" },
                  { title: "Código de Conduta e Integridade", icon: "shield", type: "pdf" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setMaterialModal(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      transition: "all .15s ease"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "#FF6A00" }}>
                        {item.icon === "video" ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                        ) : item.icon === "shield" ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        )}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#FFFFFF" }}>{item.title}</span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>›</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. INSPIRATIONAL TEAM CARD */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "24px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden"
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "#00204D" }}>
                A confiança move a mudança.
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748B", lineHeight: 1.45 }}>
                Relatar é um ato de coragem que constrói um ambiente mais ético, seguro e respeitoso para todos.
              </p>

              {/* Team Silhouette SVG */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <svg width="140" height="64" viewBox="0 0 140 64" fill="none">
                  {/* Person 1 */}
                  <circle cx="28" cy="18" r="7" fill="#CBD5E1"/>
                  <path d="M16 48c0-6.6 5.4-12 12-12s12 5.4 12 12v16H16V48z" fill="#CBD5E1"/>
                  {/* Person 2 (Tall) */}
                  <circle cx="60" cy="14" r="8" fill="#94A3B8"/>
                  <path d="M46 44c0-7.7 6.3-14 14-14s14 6.3 14 14v20H46V44z" fill="#94A3B8"/>
                  {/* Person 3 (Child/Person) */}
                  <circle cx="88" cy="24" r="6" fill="#E2E8F0"/>
                  <path d="M78 52c0-5.5 4.5-10 10-10s10 4.5 10 10v12H78V52z" fill="#E2E8F0"/>
                  {/* Person 4 */}
                  <circle cx="116" cy="18" r="7" fill="#CBD5E1"/>
                  <path d="M104 48c0-6.6 5.4-12 12-12s12 5.4 12 12v16h-24V48z" fill="#CBD5E1"/>
                </svg>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer style={{
        textAlign: "center",
        padding: "16px 20px",
        borderTop: "1px solid #E2E8F0",
        background: "#FFFFFF",
        color: "#64748B",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>Todas as denúncias são tratadas com sigilo e responsabilidade.</span>
      </footer>

      {/* ════════════════════════════════════════════════
          MODAL: 3-STEP REPORTING FLOW
         ════════════════════════════════════════════════ */}
      {selectedTipo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(14,39,72,0.65)", backdropFilter: "blur(5px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", padding: 32, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #E2E8F0", paddingBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 24, background: "#FF6A00", borderRadius: 3 }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#00204D" }}>
                  Relato: {selectedTipo.nome}
                </h2>
              </div>
              <button onClick={() => setSelectedTipo(null)} style={{ fontSize: 22, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>

            {/* STEP 1: Introdução & Unidade */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.55, marginTop: 0 }}>
                  Por meio deste Canal de Ética e Compliance, você pode apresentar seu relato de forma 100% segura, confidencial e protegida contra qualquer tipo de retaliação.
                </p>

                <div style={{ padding: "14px 16px", background: "#F1F5F9", borderRadius: 8, fontSize: 12.5, color: "#334155", lineHeight: 1.5, marginBottom: 20 }}>
                  <strong>Importante:</strong> Todas as informações são tratadas por comitê independente. Você poderá optar por se identificar ou permanecer 100% anônimo no próximo passo.
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#00204D", marginBottom: 10 }}>
                    Informe a unidade onde ocorreu a situação:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {[
                      { nome: "Matriz — São Paulo", cor: "#FEF3C7" },
                      { nome: "Filial Logística / CD", cor: "#FED7AA" },
                      { nome: "Filial Transportes", cor: "#BAE6FD" },
                    ].map((un, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedUnidade(un.nome)}
                        style={{
                          padding: "14px 10px", borderRadius: 8,
                          background: un.cor, border: selectedUnidade === un.nome ? "2px solid #00204D" : "1px solid transparent",
                          cursor: "pointer", textAlign: "center", fontWeight: 700, fontSize: 12, color: "#0E2748",
                          boxShadow: selectedUnidade === un.nome ? "0 4px 10px rgba(0,32,77,0.15)" : "none"
                        }}
                      >
                        {un.nome}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "14px 16px", border: "1px solid #E2E8F0", borderRadius: 8, marginBottom: 24, background: "#F8FAFC" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#334155", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={termoConcordado}
                      onChange={e => setTermoConcordado(e.target.checked)}
                      style={{ width: 16, height: 16 }}
                    />
                    <span>Confirmo que li e estou ciente da responsabilidade e sigilo sobre este relato.</span>
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button type="button" onClick={() => setSelectedTipo(null)} className="btn btn-soft" style={{ height: 38, fontSize: 13 }}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!termoConcordado}
                    onClick={() => setStep(2)}
                    style={{
                      height: 38,
                      padding: "0 20px",
                      borderRadius: 8,
                      background: termoConcordado ? "#FF6A00" : "#CBD5E1",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: termoConcordado ? "pointer" : "not-allowed"
                    }}
                  >
                    Continuar para o Formulário →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Formulário de Preenchimento */}
            {step === 2 && (
              <form onSubmit={handleEnviarDenuncia} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: "16px", background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#00204D", marginBottom: 8 }}>
                    Forma de Identificação:
                  </label>
                  <div style={{ display: "flex", gap: 20 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", fontWeight: isAnonimo ? 700 : 400 }}>
                      <input type="radio" name="anon" checked={isAnonimo} onChange={() => setIsAnonimo(true)} />
                      <span>🔒 Quero relatar anonimamente</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", fontWeight: !isAnonimo ? 700 : 400 }}>
                      <input type="radio" name="anon" checked={!isAnonimo} onChange={() => setIsAnonimo(false)} />
                      <span>👤 Quero me identificar</span>
                    </label>
                  </div>

                  {!isAnonimo && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                      <input
                        type="text" placeholder="Seu nome completo *"
                        value={relatorNome} onChange={e => setRelatorNome(e.target.value)}
                        style={{ height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12.5 }}
                        required={!isAnonimo}
                      />
                      <input
                        type="email" placeholder="Seu e-mail corporativo ou pessoal"
                        value={relatorEmail} onChange={e => setRelatorEmail(e.target.value)}
                        style={{ height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12.5 }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                    Qual é o seu vínculo com o ocorrido?
                  </label>
                  <select
                    value={relacaoOcorrido}
                    onChange={e => setRelacaoOcorrido(e.target.value)}
                    style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}
                  >
                    <option value="vitima">Sou a vítima do ocorrido</option>
                    <option value="testemunha">Fui testemunha dos fatos</option>
                    <option value="terceiro">Tomei conhecimento por terceiros</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#00204D", marginBottom: 4 }}>
                    Descrição detalhada dos fatos *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Descreva o que aconteceu, datas aproximadas, quem foram os envolvidos e se houve testemunhas..."
                    value={descricaoRelato}
                    onChange={e => setDescricaoRelato(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                      Quem praticou a conduta? (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Nome, cargo ou setor da pessoa..."
                      value={autorIdentificador}
                      onChange={e => setAutorIdentificador(e.target.value)}
                      style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12.5, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                      Local específico / Departamento (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: Sala de reuniões 2, refeitório..."
                      value={localEspecifico}
                      onChange={e => setLocalEspecifico(e.target.value)}
                      style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12.5, boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ padding: "12px 14px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#F8FAFC" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "#475569", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={termoFinal}
                      onChange={e => setTermoFinal(e.target.checked)}
                      style={{ marginTop: 2 }}
                      required
                    />
                    <span>
                      Declaro, para os devidos fins, que o fato relatado acima é verídico e expressa a realidade dos acontecimentos de acordo com meu melhor conhecimento.
                    </span>
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-soft" style={{ height: 38, fontSize: 13 }}>
                    ← Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!termoFinal || !descricaoRelato.trim()}
                    style={{
                      height: 40,
                      padding: "0 22px",
                      borderRadius: 8,
                      background: termoFinal && descricaoRelato.trim() ? "linear-gradient(135deg, #FF6A00, #F66B0A)" : "#CBD5E1",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: termoFinal && descricaoRelato.trim() ? "pointer" : "not-allowed"
                    }}
                  >
                    Enviar Denúncia com Segurança
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Confirmação e Protocolo */}
            {step === 3 && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>

                <h3 style={{ fontSize: 21, fontWeight: 700, margin: "0 0 8px", color: "#00204D" }}>
                  Relato Registrado com Sucesso!
                </h3>
                <p style={{ fontSize: 13.5, color: "#64748B", maxWidth: 500, margin: "0 auto 20px" }}>
                  Seu relato foi encaminhado para a equipe independente de compliance. Guarde seu número de protocolo para consultar o andamento a qualquer momento:
                </p>

                <div style={{ padding: "18px 24px", background: "#F1F5F9", borderRadius: 12, border: "2px dashed #CBD5E1", display: "inline-block", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em" }}>Seu Número de Protocolo</div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-mono)", color: "#00204D", marginTop: 4, letterSpacing: "0.05em" }}>
                    {geradoProtocolo}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => { setSelectedTipo(null); setStep(1); }}
                    style={{
                      height: 40,
                      padding: "0 28px",
                      borderRadius: 8,
                      background: "#FF6A00",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Concluir e Voltar ao Início
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          MODAL: CONSULTA POR PROTOCOLO
         ════════════════════════════════════════════════ */}
      {casoConsultado && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(14,39,72,0.65)", backdropFilter: "blur(5px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: 28, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #E2E8F0", paddingBottom: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#94A3B8" }}>Acompanhamento do Relato</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 0", color: "#00204D" }}>Protocolo: {casoConsultado.protocolo}</h3>
              </div>
              <button onClick={() => setCasoConsultado(null)} style={{ fontSize: 22, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F1F5F9", borderRadius: 8, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748B" }}>Natureza: <strong>{casoConsultado.natureza}</strong></div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Data do Envio: {new Date(casoConsultado.data).toLocaleDateString("pt-BR")}</div>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#BAE6FD", color: "#0284C7" }}>
                {DENUNCIA_STATUS[casoConsultado.status]?.label || "Em Análise"}
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#00204D", marginBottom: 10 }}>Andamento das Ações:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(casoConsultado.andamentos || [])
                  .filter(a => a.visibilidade !== "comite")
                  .map((and, i) => (
                    <div key={i} style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFFFFF", fontSize: 12.5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <strong style={{ color: "#00204D" }}>{and.etapa}</strong>
                        <span style={{ color: "#94A3B8", fontSize: 11 }}>{new Date(and.data).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div style={{ color: "#475569" }}>{and.descricao}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#00204D", marginBottom: 6 }}>Canal de Comunicação Seguro:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto", marginBottom: 10, padding: "4px 0" }}>
                {(casoConsultado.mensagens || []).map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.remetente === "denunciante" ? "flex-end" : "flex-start",
                      background: m.remetente === "denunciante" ? "#FF6A00" : "#F1F5F9",
                      color: m.remetente === "denunciante" ? "#FFFFFF" : "#0E2748",
                      padding: "8px 12px", borderRadius: 10, fontSize: 12, maxWidth: "80%"
                    }}
                  >
                    {m.texto}
                  </div>
                ))}
              </div>

              <form onSubmit={handleEnviarChatDenunciante} style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Escreva uma mensagem para a equipe de compliance..."
                  value={lookupChatMsg}
                  onChange={e => setLookupChatMsg(e.target.value)}
                  style={{ flex: 1, height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12.5 }}
                />
                <button type="submit" style={{ height: 38, padding: "0 16px", borderRadius: 6, background: "#00204D", color: "#fff", border: "none", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          MODAL: MATERIAIS DE APOIO PREVIEW
         ════════════════════════════════════════════════ */}
      {materialModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(14,39,72,0.65)", backdropFilter: "blur(5px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 560, padding: 28, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #E2E8F0", paddingBottom: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#00204D" }}>{materialModal.title}</h3>
              <button onClick={() => setMaterialModal(null)} style={{ fontSize: 22, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
              Este documento institucional contém diretrizes normativas e boas práticas estabelecidas de acordo com as leis 14.457/2022 e NR-01.
            </p>
            <div style={{ padding: "20px", background: "#F8FAFC", borderRadius: 10, border: "1px dashed #CBD5E1", textAlign: "center", margin: "18px 0" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#00204D" }}>Visualização do Documento</div>
              <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 4 }}>Clique abaixo para baixar ou visualizar a versão em PDF.</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setMaterialModal(null)} className="btn btn-soft" style={{ height: 36, fontSize: 12.5 }}>
                Fechar
              </button>
              <button onClick={() => { alert("Download iniciado com sucesso."); setMaterialModal(null); }} style={{ height: 36, padding: "0 16px", borderRadius: 6, background: "#FF6A00", color: "#fff", border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                Baixar Material
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

Object.assign(window, { DenunciaPortalPage });
