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

    // Generate protocol code like HL2A-CPPX-VUB5
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const genPart = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const prot = `DEN-${genPart(4)}-${genPart(4)}`;

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
          descricao: "Seu relato foi registrado com sucesso em ambiente criptografado e já está em triagem.",
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
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--sans)", color: "var(--ink)" }}>
      {/* Top Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 12, height: 28, background: "var(--accent)", borderRadius: 3 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>Canal de Denúncias e Escuta</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>Plataforma Independente de Integridade & Compliance</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("denuncias")}
          className="btn btn-soft"
          style={{ height: 36, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon name="lock" size={13} /> Acesso da Gestão (Credenciado)
        </button>
      </header>

      {/* Main Container with 2-Column Grid */}
      <div style={{ maxWidth: 1240, margin: "24px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "flex-start" }}>
        {/* ─── LEFT COLUMN: Main Public Content ─── */}
        <div>
          {/* Institutional Banner */}
          <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, #00204D, #0E2748)", borderRadius: "var(--r-xl)", color: "#fff", marginBottom: 24 }}>
            <h1 className="display" style={{ fontSize: 24, margin: "0 0 8px", color: "#fff" }}>
              Um ambiente seguro para ouvir, acolher e agir.
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, opacity: 0.9 }}>
              Este é um <strong>canal independente, privado e sigiloso</strong>, mantido por uma empresa externa à nossa, para: compartilhamento das diretrizes de ética e compliance · recebimento e tratamento de denúncias · sugestões de melhorias.
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent)" }}>
              Este é um canal que está dividido em assuntos (tipos de relatos)
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>
              Acesse o tipo de relato desejado para obter mais informações ou para realizar uma denúncia.
            </div>
          </div>

          {/* ─── Category Group 1: PROBLEMAS COMPORTAMENTAIS ─── */}
          <div style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ color: "var(--ink-faint)", marginBottom: 10 }}>PROBLEMAS COMPORTAMENTAIS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { id: "agressao", nome: "AGRESSÃO FÍSICA", desc: "Agressões verbais ou físicas no ambiente de trabalho" },
                { id: "assedio_politico", nome: "ASSÉDIO POLÍTICO-ELEITORAL", desc: "Coação ou direcionamento de voto no trabalho" },
                { id: "desvio_comportamento", nome: "DESVIO DE COMPORTAMENTO", desc: "Condutas inadequadas ou desrespeitosas" },
                { id: "discriminacao", nome: "DISCRIMINAÇÃO E RACISMO", desc: "Preconceito, intolerância religiosa ou de gênero" },
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => handleIniciarRelato(item)}
                  className="card"
                  style={{ padding: "18px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 130, transition: "all .2s", border: "1px solid var(--border)" }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{item.nome}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4 }}>{item.desc}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                    Relatar →
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Category Group 2: PREVENÇÃO E COMBATE AO ASSÉDIO ─── */}
          <div style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ color: "var(--ink-faint)", marginBottom: 10 }}>PREVENÇÃO E COMBATE AO ASSÉDIO (LEI 14.457/2022)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {[
                { id: "assedio_moral", nome: "ASSÉDIO MORAL", desc: "Humilhações recorrentes, perseguições ou abuso de autoridade" },
                { id: "assedio_sexual", nome: "ASSÉDIO SEXUAL", desc: "Condutas indesejadas de teor sexual, toques ou investidas" },
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => handleIniciarRelato(item)}
                  className="card"
                  style={{ padding: "20px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 130, borderLeft: "4px solid var(--coral)" }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{item.nome}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>{item.desc}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--coral)", display: "flex", alignItems: "center", gap: 4 }}>
                    Relatar com Sigilo Garantido →
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Category Group 3: QUESTÕES FINANCEIRAS E SUGESTÕES ─── */}
          <div>
            <div className="eyebrow" style={{ color: "var(--ink-faint)", marginBottom: 10 }}>QUESTÕES FINANCEIRAS E MELHORIAS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {[
                { id: "fraude", nome: "FRAUDE E CORRUPÇÃO", desc: "Desvio de recursos, propina ou favorecimento indevido" },
                { id: "sugestao", nome: "SUGERIR MELHORIA", desc: "Propostas para aprimorar processos, clima e bem-estar" },
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => handleIniciarRelato(item)}
                  className="card"
                  style={{ padding: "20px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 130 }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{item.nome}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>{item.desc}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                    Participar →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Protocol Lookup & Materials ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Lookup Box */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", color: "var(--ink)" }}>
              Acompanhar uma denúncia ou relato
            </h3>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink-muted)" }}>
              Digite o número de protocolo recebido ao final do seu envio para consultar o status atual:
            </p>

            <form onSubmit={handleConsultarProtocolo}>
              <input
                type="text"
                placeholder="Ex.: DEN-2026-0001"
                value={lookupProtocolo}
                onChange={e => setLookupProtocolo(e.target.value)}
                style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", fontSize: 13, textTransform: "uppercase", marginBottom: 8 }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 36, fontSize: 13 }}>
                CONSULTAR PROTOCOLO
              </button>
            </form>

            {lookupError && (
              <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--coral)", background: "var(--coral-soft)", padding: "6px 10px", borderRadius: 6 }}>
                Protocolo não encontrado. Verifique o código digitado.
              </div>
            )}
          </div>

          {/* Support Materials */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>
              Materiais de Apoio
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--ink-muted)" }}>
              Consulte diretrizes corporativas e cartilhas educativas:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { t: "CARTILHA - COMBATE A AGRESSÃO FÍSICA", icon: "file" },
                { t: "CARTILHA - PREVENÇÃO AO ASSÉDIO MORAL", icon: "file" },
                { t: "CARTILHA - COMBATE AO ASSÉDIO SEXUAL", icon: "file" },
                { t: "VÍDEO: BOAS PRÁTICAS NO TRABALHO", icon: "external" },
                { t: "CÓDIGO DE CONDUTA E INTEGRIDADE", icon: "shield" },
              ].map((mat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, background: "var(--surface-2)", fontSize: 11.5, color: "var(--ink-soft)", cursor: "pointer" }}>
                  <Icon name={mat.icon} size={14} color="var(--accent)" />
                  <span style={{ fontWeight: 600 }}>{mat.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL: 3-STEP REPORTING FLOW ─── */}
      {selectedTipo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(14,39,72,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", padding: 28, background: "#fff", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-modal)" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 24, background: "var(--accent)", borderRadius: 2 }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)", textTransform: "uppercase" }}>
                  {selectedTipo.nome}
                </h2>
              </div>
              <button onClick={() => setSelectedTipo(null)} style={{ fontSize: 20, color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>

            {/* ─── STEP 1: Introdução, Termos e Unidade ─── */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5, marginTop: 0 }}>
                  Por meio deste Canal de Ética e Compliance, você pode apresentar seu relato de forma 100% segura, confidencial e protegida contra qualquer tipo de retaliação.
                </p>

                <div style={{ padding: "14px 16px", background: "var(--surface-2)", borderRadius: 8, fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 18 }}>
                  <strong>Importante:</strong> Todas as informações são tratadas por equipe especializada externa. Você terá a opção de se identificar ou permanecer totalmente anônimo.
                </div>

                {/* Seleção de Unidade */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                    Informe onde ocorreu o fato:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {[
                      { nome: "Matriz — São Paulo", cor: "#fef3c7" },
                      { nome: "Filial Logística / CD", cor: "#fed7aa" },
                      { nome: "Filial Transportes", cor: "#bae6fd" },
                    ].map((un, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedUnidade(un.nome)}
                        style={{
                          padding: "14px 10px", borderRadius: 8,
                          background: un.cor, border: selectedUnidade === un.nome ? "2px solid var(--navy)" : "1px solid transparent",
                          cursor: "pointer", textAlign: "center", fontWeight: 700, fontSize: 12, color: "var(--ink)"
                        }}
                      >
                        {un.nome}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkbox Concordância */}
                <div style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 20 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink)", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={termoConcordado}
                      onChange={e => setTermoConcordado(e.target.checked)}
                    />
                    <span>Confirmo que li e estou ciente da responsabilidade sobre a denúncia ou relato.</span>
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
                    className="btn btn-primary"
                    style={{ height: 38, fontSize: 13, opacity: termoConcordado ? 1 : 0.5 }}
                  >
                    Continuar para o Formulário →
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 2: Formulário de Preenchimento ─── */}
            {step === 2 && (
              <form onSubmit={handleEnviarDenuncia} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Anonimato Selector */}
                <div style={{ padding: "14px 16px", background: "var(--surface-2)", borderRadius: 8 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                    Forma de Identificação:
                  </label>
                  <div style={{ display: "flex", gap: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input type="radio" name="anon" checked={isAnonimo} onChange={() => setIsAnonimo(true)} />
                      <span>🔒 Quero denunciar anonimamente</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input type="radio" name="anon" checked={!isAnonimo} onChange={() => setIsAnonimo(false)} />
                      <span>👤 Quero me identificar</span>
                    </label>
                  </div>

                  {!isAnonimo && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                      <input
                        type="text" placeholder="Seu nome completo *"
                        value={relatorNome} onChange={e => setRelatorNome(e.target.value)}
                        style={{ height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12.5 }}
                        required={!isAnonimo}
                      />
                      <input
                        type="email" placeholder="Seu e-mail corporativo ou pessoal"
                        value={relatorEmail} onChange={e => setRelatorEmail(e.target.value)}
                        style={{ height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12.5 }}
                      />
                    </div>
                  )}
                </div>

                {/* Relação */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>
                    Qual é a sua relação com o ocorrido?
                  </label>
                  <select
                    value={relacaoOcorrido}
                    onChange={e => setRelacaoOcorrido(e.target.value)}
                    style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}
                  >
                    <option value="vitima">Sou a vítima do ocorrido</option>
                    <option value="testemunha">Fui testemunha dos fatos</option>
                    <option value="terceiro">Tomei conhecimento por terceiros</option>
                  </select>
                </div>

                {/* Descrição do relato */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                    Descrição detalhada dos fatos *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Descreva o que aconteceu, datas aproximadas, quem foram os envolvidos e se houve testemunhas..."
                    value={descricaoRelato}
                    onChange={e => setDescricaoRelato(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}
                    required
                  />
                </div>

                {/* Autor do Fato */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>
                    Quem praticou a conduta relatada? (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nome, cargo ou setor da pessoa..."
                    value={autorIdentificador}
                    onChange={e => setAutorIdentificador(e.target.value)}
                    style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}
                  />
                </div>

                {/* Próximos passos / Sugestão */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>
                    Sugestão para lidarmos com este caso (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Escreva sua sugestão para a resolução deste caso..."
                    value={sugestoesRelator}
                    onChange={e => setSugestoesRelator(e.target.value)}
                    style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}
                  />
                </div>

                {/* Termo Final de Aceite */}
                <div style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 8 }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "var(--ink-soft)", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={termoFinal}
                      onChange={e => setTermoFinal(e.target.checked)}
                      style={{ marginTop: 2 }}
                      required
                    />
                    <span>
                      Declaro, para os devidos fins de direito, sob as penas da lei, que o fato relatado acima constitui uma denúncia verídica e que as informações prestadas correspondem à realidade dos fatos.
                    </span>
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-soft" style={{ height: 38, fontSize: 13 }}>
                    ← Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!termoFinal || !descricaoRelato.trim()}
                    className="btn btn-primary"
                    style={{ height: 38, fontSize: 13, opacity: termoFinal && descricaoRelato.trim() ? 1 : 0.5 }}
                  >
                    Enviar Denúncia com Segurança
                  </button>
                </div>
              </form>
            )}

            {/* ─── STEP 3: Confirmação e Protocolo ─── */}
            {step === 3 && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--health-soft)", color: "var(--health-deep)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Icon name="check" size={28} />
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
                  Relato Registrado com Sucesso!
                </h3>
                <p style={{ fontSize: 13.5, color: "var(--ink-muted)", maxWidth: 500, margin: "0 auto 20px" }}>
                  Seu relato foi encaminhado para a equipe de compliance e ouvirdoria. Guarde seu número de protocolo para acompanhar o andamento.
                </p>

                <div style={{ padding: "16px 20px", background: "var(--surface-2)", borderRadius: 12, border: "2px dashed var(--border)", display: "inline-block", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-faint)" }}>Seu Número de Protocolo</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--navy)", marginTop: 4, letterSpacing: "0.05em" }}>
                    {geradoProtocolo}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => { setSelectedTipo(null); setStep(1); }}
                    className="btn btn-primary"
                    style={{ height: 40, fontSize: 13.5, padding: "0 24px" }}
                  >
                    Concluir e Voltar ao Início
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL: CONSULTA POR PROTOCOLO (Complainant tracking view) ─── */}
      {casoConsultado && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(14,39,72,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: 28, background: "#fff", borderRadius: "var(--r-xl)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-faint)" }}>Acompanhamento do Relato</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 0", color: "var(--ink)" }}>Protocolo: {casoConsultado.protocolo}</h3>
              </div>
              <button onClick={() => setCasoConsultado(null)} style={{ fontSize: 20, color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>

            {/* Status overview */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--surface-2)", borderRadius: 8, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Natureza: <strong>{casoConsultado.natureza}</strong></div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Data do Envio: {new Date(casoConsultado.data).toLocaleDateString("pt-BR")}</div>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "var(--sky-soft)", color: "var(--sky)" }}>
                {DENUNCIA_STATUS[casoConsultado.status]?.label || "Em Análise"}
              </span>
            </div>

            {/* Visible Timeline to Complainant */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>Andamento das Ações:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(casoConsultado.andamentos || [])
                  .filter(a => a.visibilidade !== "comite")
                  .map((and, i) => (
                    <div key={i} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "#fff", fontSize: 12.5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <strong style={{ color: "var(--ink)" }}>{and.etapa}</strong>
                        <span style={{ color: "var(--ink-muted)", fontSize: 11 }}>{new Date(and.data).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div style={{ color: "var(--ink-soft)" }}>{and.descricao}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Safe Chat Box for Complainant */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Canal de Comunicação Seguro:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto", marginBottom: 10, padding: "4px 0" }}>
                {(casoConsultado.mensagens || []).map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.remetente === "denunciante" ? "flex-end" : "flex-start",
                      background: m.remetente === "denunciante" ? "var(--accent)" : "var(--surface-2)",
                      color: m.remetente === "denunciante" ? "#fff" : "var(--ink)",
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
                  style={{ flex: 1, height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12.5 }}
                />
                <button type="submit" className="btn btn-primary" style={{ height: 36, fontSize: 12.5 }}>
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { DenunciaPortalPage });
