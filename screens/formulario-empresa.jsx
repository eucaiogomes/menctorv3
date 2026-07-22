/* global React, Icon, Logo */

// ════════════════════════════════════════════════════════════
// FORMULÁRIO DA EMPRESA — página pública, sem login
// Agora contém TODAS as 18 perguntas do cadastro para
// preenchimento completo pelo cliente (preenchimento automático no lado do consultor).
// ════════════════════════════════════════════════════════════

const EMPRESA_FORM_STORAGE_KEY = (token) => `MENCTOR_EMPRESA_FORM_${token}`;

const EmpresaInviteForm = ({ token }) => {
  const [done, setDone] = React.useState(false);
  const [data, setData] = React.useState({
    // 1-5 básicos
    razaoSocial: "", responsavel: "", email: "", telefone: "", cnpj: "",
    // 6
    qtdPorArea: { administrativo: "", operacional: "", vendas: "", producao: "", atendimento: "", qualidade: "" },
    // 7-11
    qtdCargos: "", segmento: "", unidades: "1", cidades: "", terceirizados: "",
    // 12-13
    possui: [], indicadores: [],
    // 14
    mapeamentoFormal: "", pesquisaClima: "", canaisEscuta: "", fiscalizacaoEvidencia: "", gestaoRiscosOutra: "",
    // 15
    pressaoMetas: "", ritmoIntenso: "", capacitacaoLideranca: "", conflitosRecorrentes: "", assedioMoral: "", liderancaOutra: "",
    // 16
    juridicoAcompanha: "", acaoTrabalhistaMental: "", senteProtegida: "", juridicaOutra: "",
    // 17
    excessoTrabalho: false, prazosInatingiveis: false, faltaControle: false, estruturaNaoAplica: false, estruturaOutra: "",
    // 18
    trabalhaCom: [],
    // compat legados (para auto-import em fluxos antigos)
    razao: "", nome: "", contatoNome: "", contatoEmail: "", contatoWhats: "", colaboradores: "", porte: "", site: "", cidade: "", estado: "", contatoCargo: "",
  });

  const upd = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const updArea = (area, v) => {
    setData(prev => ({ ...prev, qtdPorArea: { ...prev.qtdPorArea, [area]: v } }));
  };

  const toggleArray = (k, val) => {
    setData(prev => {
      const arr = prev[k] || [];
      const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
      return { ...prev, [k]: next };
    });
  };

  const setYesNo = (k, v) => upd(k, v);

  const areas = ["administrativo", "operacional", "vendas", "producao", "atendimento", "qualidade"];
  const possuiList = ["Técnico de Segurança do trabalho", "CIPA", "PGR - Programa de Gerenciamento de Riscos", "AEP - Análise Ergonômica Preliminar", "OS - Ordens de Serviços de todas as funções", "Modelo de Plano de ação de medidas preventivas", "GRO - Gerenciamento de Riscos Ocupacionais", "SESMT", "Outra"];
  const indicadoresList = ["Turnover médio dos últimos 12 meses", "Taxa de absenteísmo / faltas", "Afastamentos previdenciários (principalmente saúde mental)", "Horas extras frequentes", "Áreas com maior rotatividade ou desgaste", "Outros"];
  const trabalhaList = ["Metas individuais ou coletivas agressivas", "Trabalho por turnos ou jornadas noturnas", "Home office / híbrido", "Terceirizados ou prestadores de serviços", "Horários normais de trabalho"];

  const podeEnviar = (data.razaoSocial || data.razao || "").trim() && (data.responsavel || data.contatoNome || "").trim() && (data.email || data.contatoEmail || "").trim();

  // =====================================================
  // TEST HELPER: Preenche TODAS as 18 perguntas com dados realistas de exemplo
  // Útil para testar o fluxo "link -> preenchimento automático"
  // =====================================================
  const fillTestData = () => {
    const testData = {
      razaoSocial: "Indústria Metalúrgica São José Ltda",
      responsavel: "Carla Mendes de Souza",
      email: "carla.mendes@saojose.com.br",
      telefone: "(11) 98765-4321",
      cnpj: "12.345.678/0001-90",
      qtdPorArea: {
        administrativo: "48",
        operacional: "185",
        vendas: "22",
        producao: "210",
        atendimento: "35",
        qualidade: "18"
      },
      qtdCargos: "67",
      segmento: "Indústria metalúrgica e usinagem",
      unidades: "Matriz em São Paulo + 2 filiais (Campinas e Ribeirão Preto)",
      cidades: "São Paulo, Campinas, Ribeirão Preto",
      terceirizados: "42 (principalmente logística e limpeza)",
      possui: [
        "Técnico de Segurança do trabalho",
        "CIPA",
        "PGR - Programa de Gerenciamento de Riscos",
        "AEP - Análise Ergonômica Preliminar",
        "GRO - Gerenciamento de Riscos Ocupacionais",
        "SESMT"
      ],
      indicadores: [
        "Turnover médio dos últimos 12 meses",
        "Taxa de absenteísmo / faltas",
        "Afastamentos previdenciários (principalmente saúde mental)",
        "Horas extras frequentes"
      ],
      // 14
      mapeamentoFormal: "Parcialmente",
      pesquisaClima: "Sim",
      canaisEscuta: "Sim",
      fiscalizacaoEvidencia: "Não",
      gestaoRiscosOutra: "Estamos iniciando o mapeamento com consultoria externa este semestre.",
      // 15
      pressaoMetas: "Sim",
      ritmoIntenso: "Parcialmente",
      capacitacaoLideranca: "Não",
      conflitosRecorrentes: "Sim",
      assedioMoral: "Não",
      liderancaOutra: "Alta rotatividade de supervisores nos últimos 2 anos.",
      // 16
      juridicoAcompanha: "Sim",
      acaoTrabalhistaMental: "Parcialmente",
      senteProtegida: "Não",
      juridicaOutra: "Tivemos 2 notificações do MPT no último ano relacionadas a carga de trabalho.",
      // 17
      excessoTrabalho: true,
      prazosInatingiveis: true,
      faltaControle: false,
      estruturaNaoAplica: false,
      estruturaOutra: "Trabalho em 3 turnos fixos + escala de plantão.",
      // 18
      trabalhaCom: [
        "Metas individuais ou coletivas agressivas",
        "Trabalho por turnos ou jornadas noturnas",
        "Terceirizados ou prestadores de serviços"
      ],
      // legados
      razao: "Indústria Metalúrgica São José Ltda",
      nome: "São José Metais",
      contatoNome: "Carla Mendes de Souza",
      contatoEmail: "carla.mendes@saojose.com.br",
      contatoWhats: "(11) 98765-4321",
      colaboradores: "518",
      porte: "Grande",
      segmento: "Indústria metalúrgica e usinagem"
    };

    setData(prev => ({ ...prev, ...testData }));
    // feedback rápido
    setTimeout(() => {
      const el = document.createElement("div");
      el.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#2F7D6F;color:white;padding:8px 16px;border-radius:999px;font-size:13px;z-index:99999";
      el.textContent = "✓ 18 campos preenchidos com dados de teste. Clique em Enviar.";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2800);
    }, 50);
  };

  const submit = () => {
    if (!podeEnviar) return;

    // garante campos legados para compatibilidade com imports existentes
    const payload = {
      ...data,
      razao: data.razaoSocial || data.nome || data.razao,
      nome: data.razaoSocial || data.nome,
      contatoNome: data.responsavel || data.contatoNome,
      contatoEmail: data.email || data.contatoEmail,
      contatoWhats: data.telefone || data.contatoWhats,
      submittedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(EMPRESA_FORM_STORAGE_KEY(token || "sem-token"), JSON.stringify(payload));
    } catch (err) { /* localStorage indisponível */ }
    setDone(true);
  };

  // Auto-demo: se a URL tiver &demo=1 ou ?demo=1 junto com o token, pré-preenche automaticamente (para testes rápidos)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "1" || params.get("test") === "1") {
        // pequena espera para o React montar
        setTimeout(fillTestData, 120);
      }
    } catch (_) {}
  }, []);

  const Section = ({ num, title, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 6 }}>{num}. {title}</div>
      {children}
    </div>
  );

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );

  const Inp = ({ value, onChange, ...p }) => (
    <input value={value || ""} onChange={e => onChange(e.target.value)} style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface)", color: "var(--ink)", fontSize: 14 }} {...p} />
  );

  const YesNo = ({ label, value, onChange }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 13.5, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {["Sim", "Não", "Parcialmente"].map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12.5, border: value === opt ? "1px solid var(--health)" : "1px solid var(--line)", background: value === opt ? "var(--surface-sage)" : "var(--surface)" }}>{opt}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas-warm)", padding: "32px 20px", display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: 820, padding: 32 }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "32px 10px" }}>
            <div style={{ width: 68, height: 68, borderRadius: 999, background: "var(--surface-sage)", color: "var(--health-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Icon name="check" size={32} />
            </div>
            <div className="eyebrow" style={{ color: "var(--health-deep)", marginBottom: 10 }}>Cadastro enviado</div>
            <h1 className="display" style={{ fontSize: 32, margin: 0 }}>Obrigado! Recebemos o cadastro completo de {data.razaoSocial || data.nome || "sua empresa"}.</h1>
            <p style={{ margin: "14px auto 0", maxWidth: 520, color: "var(--ink-muted)", lineHeight: 1.55 }}>
              O consultor Menctor importará automaticamente todas as respostas para o sistema. Você não precisa fazer mais nada.
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Formulário Menctor — Cadastro Completo</div>
              <h1 className="display" style={{ fontSize: 32, margin: 0, lineHeight: 1.1 }}>Preencha o cadastro da empresa (18 perguntas)</h1>
              <p style={{ margin: "10px 0 0", color: "var(--ink-muted)", maxWidth: 620, lineHeight: 1.5 }}>
                Este é o formulário oficial de cadastro. Responda todas as perguntas com o máximo de detalhes possível. Os dados serão preenchidos automaticamente no sistema do consultor.
              </p>
            </div>

            {/* 1-5 */}
            <Section num="1" title="Razão Social da Empresa">
              <Inp value={data.razaoSocial} onChange={v => { upd("razaoSocial", v); upd("razao", v); upd("nome", v); }} placeholder="Razão Social da Empresa" />
            </Section>

            <Section num="2" title="Nome do responsável pela implantação dos Riscos Psicossociais">
              <Inp value={data.responsavel} onChange={v => { upd("responsavel", v); upd("contatoNome", v); }} placeholder="Nome completo do responsável" />
            </Section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Section num="3" title="E-mail do responsável">
                <Inp value={data.email} onChange={v => { upd("email", v); upd("contatoEmail", v); }} type="email" placeholder="responsavel@empresa.com.br" />
              </Section>
              <Section num="4" title="Telefone / WhatsApp">
                <Inp value={data.telefone} onChange={v => { upd("telefone", v); upd("contatoWhats", v); }} placeholder="(11) 99999-9999" />
              </Section>
            </div>

            <Section num="5" title="CNPJ">
              <Inp value={data.cnpj} onChange={v => upd("cnpj", v)} placeholder="00.000.000/0000-00" />
            </Section>

            {/* 6 */}
            <Section num="6" title="Quantidade de colaboradores por área">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                {areas.map(a => (
                  <div key={a}>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)", marginBottom: 3 }}>{a}</div>
                    <Inp value={data.qtdPorArea[a]} onChange={v => updArea(a, v)} placeholder="0" type="number" />
                  </div>
                ))}
              </div>
            </Section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Section num="7" title="Quantidade de cargos existentes">
                <Inp value={data.qtdCargos} onChange={v => upd("qtdCargos", v)} type="number" placeholder="42" />
              </Section>
              <Section num="8" title="Segmento de atuação">
                <Inp value={data.segmento} onChange={v => upd("segmento", v)} placeholder="indústria, serviços, call center, TI..." />
              </Section>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Section num="9" title="Número de estabelecimentos / unidades">
                <Inp value={data.unidades} onChange={v => upd("unidades", v)} placeholder="Matriz + 3 filiais" />
              </Section>
              <Section num="10" title="Cidades a serem abrangidas">
                <Inp value={data.cidades} onChange={v => upd("cidades", v)} placeholder="São Paulo, Rio, Belo Horizonte..." />
              </Section>
            </div>

            <Section num="11" title="Quantidade de colaboradores terceirizados (matriz e filiais)">
              <Inp value={data.terceirizados} onChange={v => upd("terceirizados", v)} placeholder="Ex.: 35 na matriz, 12 na filial SP" />
            </Section>

            {/* 12 */}
            <Section num="12" title="A empresa possui:">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 6, fontSize: 13.5 }}>
                {possuiList.map(item => (
                  <label key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 2px", cursor: "pointer" }}>
                    <input type="checkbox" checked={data.possui.includes(item)} onChange={() => toggleArray("possui", item)} style={{ marginTop: 3 }} />
                    {item}
                  </label>
                ))}
              </div>
            </Section>

            {/* 13 */}
            <Section num="13" title="A empresa possui indicadores de:">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 6, fontSize: 13.5 }}>
                {indicadoresList.map(item => (
                  <label key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 2px", cursor: "pointer" }}>
                    <input type="checkbox" checked={data.indicadores.includes(item)} onChange={() => toggleArray("indicadores", item)} style={{ marginTop: 3 }} />
                    {item}
                  </label>
                ))}
              </div>
            </Section>

            {/* 14 */}
            <Section num="14" title="Gestão de riscos psicossociais (alinhamento com a NR-1 revisada)">
              <YesNo label="Existe algum mapeamento formal de riscos psicossociais?" value={data.mapeamentoFormal} onChange={v => setYesNo("mapeamentoFormal", v)} />
              <YesNo label="A empresa já realizou pesquisa de clima organizacional?" value={data.pesquisaClima} onChange={v => setYesNo("pesquisaClima", v)} />
              <YesNo label="Existem canais formais de escuta e denúncia?" value={data.canaisEscuta} onChange={v => setYesNo("canaisEscuta", v)} />
              <YesNo label="Se houver fiscalização, a empresa consegue demonstrar método e evidência desse controle?" value={data.fiscalizacaoEvidencia} onChange={v => setYesNo("fiscalizacaoEvidencia", v)} />
              <Field label="Outra informação relevante sobre gestão de riscos">
                <Inp value={data.gestaoRiscosOutra} onChange={v => upd("gestaoRiscosOutra", v)} />
              </Field>
            </Section>

            {/* 15 */}
            <Section num="15" title="Liderança e organização do trabalho (identificando riscos sistêmicos)">
              <YesNo label="Pressão por metas é frequente?" value={data.pressaoMetas} onChange={v => setYesNo("pressaoMetas", v)} />
              <YesNo label="Ritmo de trabalho intenso ou imprevisível?" value={data.ritmoIntenso} onChange={v => setYesNo("ritmoIntenso", v)} />
              <YesNo label="Lideranças recebem capacitação em gestão de pessoas?" value={data.capacitacaoLideranca} onChange={v => setYesNo("capacitacaoLideranca", v)} />
              <YesNo label="Há conflitos recorrentes ou queixas informais?" value={data.conflitosRecorrentes} onChange={v => setYesNo("conflitosRecorrentes", v)} />
              <YesNo label="Há assédio moral e conflitos recorrentes?" value={data.assedioMoral} onChange={v => setYesNo("assedioMoral", v)} />
              <Field label="Outra informação sobre liderança">
                <Inp value={data.liderancaOutra} onChange={v => upd("liderancaOutra", v)} />
              </Field>
            </Section>

            {/* 16 */}
            <Section num="16" title="Aspectos jurídicos e governança (envolvimento da direção)">
              <YesNo label="Existe um Jurídico que acompanha as questões de saúde e segurança no trabalho?" value={data.juridicoAcompanha} onChange={v => setYesNo("juridicoAcompanha", v)} />
              <YesNo label="Já houve fiscalização ou ação trabalhista relacionada a adoecimento mental na empresa?" value={data.acaoTrabalhistaMental} onChange={v => setYesNo("acaoTrabalhistaMental", v)} />
              <YesNo label="Hoje a empresa se sente protegida?" value={data.senteProtegida} onChange={v => setYesNo("senteProtegida", v)} />
              <Field label="Outra informação jurídica">
                <Inp value={data.juridicaOutra} onChange={v => upd("juridicaOutra", v)} />
              </Field>
            </Section>

            {/* 17 */}
            <Section num="17" title="Estrutura das atividades">
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {[
                  ["excessoTrabalho", "Há excesso de trabalho"],
                  ["prazosInatingiveis", "Há prazos por metas inatingíveis"],
                  ["faltaControle", "Falta de controle sobre a forma como o trabalho é executado"],
                  ["estruturaNaoAplica", "Não se aplica"],
                ].map(([k, l]) => (
                  <label key={k} style={{ display: "flex", gap: 10, fontSize: 14, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!data[k]} onChange={e => upd(k, e.target.checked)} /> {l}
                  </label>
                ))}
              </div>
              <Field label="Outra estrutura relevante">
                <Inp value={data.estruturaOutra} onChange={v => upd("estruturaOutra", v)} />
              </Field>
            </Section>

            {/* 18 */}
            <Section num="18" title="A empresa trabalha com:">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 6, fontSize: 13.5 }}>
                {trabalhaList.map(item => (
                  <label key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 2px", cursor: "pointer" }}>
                    <input type="checkbox" checked={data.trabalhaCom.includes(item)} onChange={() => toggleArray("trabalhaCom", item)} style={{ marginTop: 3 }} />
                    {item}
                  </label>
                ))}
              </div>
            </Section>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={submit} disabled={!podeEnviar} className="btn btn-accent" style={{ flex: 1, height: 48, justifyContent: "center", fontSize: 15, opacity: podeEnviar ? 1 : 0.6 }}>
                <Icon name="send" size={16} /> Enviar cadastro completo
              </button>
              <button onClick={fillTestData} type="button" className="btn btn-soft" style={{ height: 48, padding: "0 18px", fontSize: 13, whiteSpace: "nowrap" }}>
                🧪 Usar dados de teste (todas as 18)
              </button>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", textAlign: "center", marginTop: 10 }}>
              Todas as 18 perguntas serão enviadas para preenchimento automático no sistema.
            </div>

            {/* Debug helper para console */}
            <div style={{ marginTop: 16, fontSize: 10, color: "var(--ink-faint)", textAlign: "center" }}>
              Dica teste: no console execute <code>window.__TEST_SUBMIT_EMPRESA_FORM("{token || 'f123'}")</code>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { EmpresaInviteForm, EMPRESA_FORM_STORAGE_KEY });

// =====================================================
// Helpers globais de TESTE (use no console do navegador)
// =====================================================
window.__TEST_SUBMIT_EMPRESA_FORM = (testToken = "test-" + Date.now().toString(36), autoSubmit = true) => {
  const key = `MENCTOR_EMPRESA_FORM_${testToken}`;
  const sample = {
    razaoSocial: "Fábrica de Alimentos Bom Sabor S/A",
    responsavel: "Roberto Lima",
    email: "roberto.lima@bomsabor.com.br",
    telefone: "(19) 99887-6655",
    cnpj: "98.765.432/0001-10",
    qtdPorArea: { administrativo: "65", operacional: "240", vendas: "38", producao: "320", atendimento: "55", qualidade: "27" },
    qtdCargos: "92",
    segmento: "Alimentos e bebidas",
    unidades: "3 (Matriz + 2 filiais)",
    cidades: "Campinas, Jundiaí, São Paulo",
    terceirizados: "58",
    possui: ["CIPA", "PGR - Programa de Gerenciamento de Riscos", "SESMT", "Técnico de Segurança do trabalho"],
    indicadores: ["Turnover médio dos últimos 12 meses", "Afastamentos previdenciários (principalmente saúde mental)", "Horas extras frequentes"],
    mapeamentoFormal: "Não",
    pesquisaClima: "Parcialmente",
    canaisEscuta: "Sim",
    fiscalizacaoEvidencia: "Parcialmente",
    gestaoRiscosOutra: "",
    pressaoMetas: "Sim",
    ritmoIntenso: "Sim",
    capacitacaoLideranca: "Não",
    conflitosRecorrentes: "Parcialmente",
    assedioMoral: "Não",
    liderancaOutra: "Falta de feedback estruturado das lideranças.",
    juridicoAcompanha: "Sim",
    acaoTrabalhistaMental: "Não",
    senteProtegida: "Parcialmente",
    juridicaOutra: "",
    excessoTrabalho: true,
    prazosInatingiveis: true,
    faltaControle: true,
    estruturaNaoAplica: false,
    estruturaOutra: "Produção contínua 24h.",
    trabalhaCom: ["Metas individuais ou coletivas agressivas", "Trabalho por turnos ou jornadas noturnas", "Terceirizados ou prestadores de serviços"],
    razao: "Fábrica de Alimentos Bom Sabor S/A",
    nome: "Bom Sabor",
    contatoNome: "Roberto Lima",
    contatoEmail: "roberto.lima@bomsabor.com.br",
    contatoWhats: "(19) 99887-6655",
    submittedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(key, JSON.stringify(sample));
    console.log("%c[TEST] Payload salvo em", "color:#2F7D6F", key, sample);
    const link = `${location.origin}${location.pathname}?empresa-form=${testToken}`;
    console.log("%c[TEST] Link para abrir:", "color:#E87722", link);
    if (autoSubmit) {
      // abre o form com o token para que a pessoa veja a página de "obrigado"
      window.open(link, "_blank");
    }
    return { key, payload: sample, link };
  } catch (e) {
    console.error("Falha ao salvar payload de teste", e);
  }
};

console.log("%c[Menctor] Test helper pronto: window.__TEST_SUBMIT_EMPRESA_FORM('meutoken')", "color:#838DA0");
