/* global React, Icon, Page, TRILHAS */

const TRAIL_MODULES_CONSULT = {
  "t1": ["Identificando sinais de burnout na equipe", "Conversas difíceis com colaboradores em risco", "Construindo cultura de cuidado", "Reuniões 1:1 que cuidam", "Métricas de bem-estar para gestão", "Quando encaminhar para apoio profissional"],
  "t2": ["O que diz a NR-1 atualizada", "Mapeamento de riscos psicossociais", "Documentação e evidências", "Fiscalização e autuações — como se preparar"],
  "t3": ["Fundamentos da liderança humanizada", "Escuta ativa e empatia no trabalho", "Feedback que fortalece", "Gestão de conflitos", "Liderança em situações de crise", "Construindo equipes psicologicamente seguras", "Diversidade e inclusão na liderança", "Plano de desenvolvimento individual"],
  "t4": ["Identificando suas emoções no trabalho", "Técnicas de regulação emocional", "Reframing cognitivo", "Mindfulness para o dia a dia", "Construindo um plano pessoal de resiliência"],

  // ── Módulos dos novos 20 conteúdos ──
  "t5": ["Sinais precoces de burnout em operações", "Fatores de risco específicos por função", "Intervenções no nível da equipe", "Acompanhamento e retorno ao trabalho", "Métricas e alertas para gestores"],
  "t6": ["Os 4 passos da comunicação não-violenta", "Observação vs julgamento no dia a dia", "Expressando necessidades sem agressividade", "Escuta empática em reuniões difíceis"],
  "t7": ["Autoconsciência emocional do líder", "Gestão de emoções em situações de pressão", "Empatia estratégica e escuta profunda", "Motivação intrínseca e propósito", "Inteligência emocional em feedbacks", "Criando cultura emocionalmente inteligente"],
  "t8": ["Desafios únicos do trabalho híbrido", "Limites saudáveis entre vida pessoal e profissional", "Isolamento e conexão virtual", "Ritmos de trabalho e pausas no remoto"],
  "t9": ["Atenção plena: fundamentos práticos", "Técnicas de 3–5 minutos para o expediente", "Reduzindo multitarefa e reatividade", "Treino de foco e retomada de atenção", "Mindfulness em reuniões e decisões"],
  "t10": ["Identificando estilos de conflito", "Técnicas de mediação para gestores", "Conversas de reparação e acordo", "Prevenindo escaladas em equipes", "Quando envolver RH ou mediação externa"],
  "t11": ["Conceitos de inclusão e viés inconsciente", "Práticas inclusivas no dia a dia da liderança", "Equidade em promoções e oportunidades", "Criando espaços seguros para vozes diversas", "Medindo inclusão na equipe"],
  "t12": ["Ciclo do sono e produtividade", "Higiene do sono para profissionais", "Recuperação ativa e pausas estratégicas", "Sinais de fadiga crônica e o que fazer"],
  "t13": ["Carga cognitiva e sobrecarga mental", "Design de tarefas que respeitam o cérebro", "Ambiente físico e digital para foco", "Prevenção de fadiga por tela e atenção"],
  "t14": ["Estrutura de feedback de alto impacto", "Feedback positivo específico e sincero", "Feedback corretivo sem desmotivar", "Follow-up e desenvolvimento contínuo"],
  "t15": ["Sinais de sofrimento psíquico", "Como abordar sem invadir", "Roteiro de conversa de acolhimento", "Critérios para encaminhamento", "Acompanhamento pós-encaminhamento"],
  "t16": ["O que é segurança psicológica (pesquisa)", "Comportamentos que destroem ou constroem", "Perguntas e rituais que promovem segurança", "Lidando com erros e vulnerabilidade", "Medindo e evoluindo a segurança do time", "Casos práticos de transformação de equipe"],
  "t17": ["Autodiagnóstico de sobrecarga", "Micro-hábitos de autocuidado realistas", "Fronteiras pessoais no trabalho", "Recuperação entre picos de demanda", "Sustentabilidade de carreira de longo prazo"],
  "t18": ["Pilar 1: Carga e recuperação", "Pilar 2: Relacionamentos e pertencimento", "Pilar 3: Autonomia e significado", "Pilar 4: Reconhecimento e justiça", "Como diagnosticar e priorizar pilares"],
  "t19": ["Reconhecendo ativação emocional aguda", "Técnicas de grounding e respiração", "Decisões sob pressão emocional", "Pós-crise: descompressão e aprendizado"],
  "t20": ["O que é cultura de cuidado (definição)", "Exemplos práticos de líderes que cuidam", "Políticas e rituais que reforçam o cuidado", "Como o RH pode apoiar as lideranças", "Medindo o impacto da cultura de cuidado"],
  "t21": ["Definições legais e éticas de assédio", "Sinais sutis e microagressões", "Como criar canais de denúncia seguros", "Responsabilidade da liderança e do RH", "Prevenção ativa e educação contínua"],
  "t22": ["Psicologia da mudança e resistência", "Comunicação transparente em transições", "Sustentando bem-estar durante reestruturações", "Liderança que transmite confiança", "Construindo capacidade adaptativa da equipe"],
  "t23": ["Indicadores quantitativos de bem-estar", "Pesquisas de pulso e COPSOQ como base", "Dashboards práticos para RH e gestores", "Transformando dados em ações concretas"],
  "t24": ["Liderança adaptativa vs técnica", "Gestão de ansiedade coletiva", "Tomada de decisão em cenários incertos", "Cuidando da equipe enquanto se cuida", "Narrativas de esperança e direção"],
};

const AprendizadoScreen = ({ navigate }) => {
  const [selected, setSelected] = React.useState(null);
  const [recomendado, setRecomendado] = React.useState(false);

  const trilhas = window.TRILHAS || [];
  if (typeof console !== "undefined") console.log("[AprendizadoScreen] trilhas disponíveis:", trilhas.length);

  const handleRecomendar = () => {
    setRecomendado(true);
    setTimeout(() => setRecomendado(false), 2500);
  };

  if (selected) {
    return <TrailDetail trail={selected} onBack={() => setSelected(null)} navigate={navigate} />;
  }

  return (
    <Page>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Trilhas · Treinamentos</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0 }}>Aprendizado</h1>
          <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--ink-muted)", maxWidth: 560 }}>
            Conteúdo para complementar os planos de ação dos seus clientes.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-soft" style={{ height: 38 }}><Icon name="filter" size={14}/> Filtrar</button>
          <button className="btn btn-accent" style={{ height: 38 }}><Icon name="plus" size={14}/> Nova trilha</button>
        </div>
      </div>

      {/* Featured */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 24, display: "grid", gridTemplateColumns: "1.2fr 1fr" }}>
        <div style={{
          background: "linear-gradient(135deg, #F66B0A 0%, #FF8636 100%)",
          padding: 36, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 280
        }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", background: "rgba(255,255,255,0.18)", borderRadius: 999 }}>Em destaque</span>
            <h2 className="display" style={{ fontSize: 36, margin: "18px 0 12px", color: "#fff", lineHeight: 1.05 }}>
              Saúde mental para<br/>gestores e lideranças
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.85)", maxWidth: 360 }}>
              {trilhas[0] ? `${trilhas[0].modulos} módulos, ${trilhas[0].duracao}.` : 'Carregando...'} Recomendado para clientes com Burnout {">"} 2.5 no COPSOQ.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button className="btn btn-primary" style={{ height: 38 }} onClick={handleRecomendar}>
              Recomendar a cliente <Icon name="arrow-right" size={14}/>
            </button>
            <button className="btn" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", height: 38 }} onClick={() => trilhas[0] && setSelected(trilhas[0])}>Ver conteúdo</button>
          </div>
          {recomendado && (
            <div style={{ marginTop: 12, padding: "8px 14px", background: "rgba(255,255,255,0.22)", borderRadius: 10, fontSize: 13, color: "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="check" size={13} color="#fff"/> Trilha recomendada! Seu cliente receberá uma notificação.
            </div>
          )}
        </div>
        <div style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", background: "var(--surface)" }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>O que está dentro</div>
          {(TRAIL_MODULES_CONSULT[(trilhas[0] && trilhas[0].id) || ''] || []).map((t,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i > 0 ? "1px dashed var(--line)" : "none", fontSize: 13.5, color: "var(--ink-soft)" }}>
              <Icon name="check" size={14} color="var(--health)" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trilhas */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "baseline", gap: 12 }}>
        <h2 className="display" style={{ fontSize: 26, margin: 0 }}>Trilhas disponíveis</h2>
        <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>({trilhas.length} conteúdos)</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {trilhas.map(t => <TrailCard key={t.id} t={t} onClick={() => setSelected(t)} />)}
      </div>
    </Page>
  );
};

const TrailCard = ({ t, onClick }) => (
  <button onClick={onClick} className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column", textAlign: "left", padding: 0 }}>
    <div 
      style={{ 
        height: 130, 
        position: "relative", 
        overflow: "hidden", 
        background: t.capa || "#E5E7EB" 
      }}
    >
      {t.imagem && (
        <img 
          src={t.imagem} 
          alt={t.nome}
          loading="lazy"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
          onError={(e) => { 
            // If image fails to load (404, etc.), hide it so the gradient background shows
            e.target.style.display = 'none'; 
          }}
        />
      )}
      {/* subtle overlay to improve badge legibility */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, rgba(0,0,0,0.28), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 12, right: 12, padding: "3px 9px", background: "rgba(255,255,255,0.92)", borderRadius: 999, fontSize: 10.5, fontWeight: 600, color: "var(--ink)" }}>
        {t.modulos} módulos
      </div>
    </div>
    <div style={{ padding: 18 }}>
      <h3 style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 19, margin: 0, lineHeight: 1.2 }}>{t.nome}</h3>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-muted)", marginTop: 10 }}>
        <span>{t.duracao}</span>
        <span>·</span>
        <span>{t.inscritos} inscritos</span>
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 5, background: "var(--canvas-warm)", borderRadius: 99 }}>
          <div style={{ width: `${t.conclusao}%`, height: "100%", background: "var(--health)", borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: 12, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}>{t.conclusao}% conclusão</span>
      </div>
    </div>
  </button>
);

// ── TRAIL DETAIL ───────────────────────────────────────────────
const TrailDetail = ({ trail, onBack, navigate }) => {
  const modules = TRAIL_MODULES_CONSULT[trail.id] || Array.from({ length: trail.modulos }, (_, i) => `Módulo ${i + 1}`);
  return (
    <Page>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: 13, marginBottom: 20 }}>
        <Icon name="chevron-left" size={14}/> Aprendizado
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32, alignItems: "start" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Trilha · {trail.modulos} módulos · {trail.duracao}</div>
          <h1 className="display" style={{ fontSize: 44, margin: 0 }}>{trail.nome}</h1>
          <div style={{ display: "flex", gap: 20, marginTop: 16, fontSize: 14, color: "var(--ink-muted)" }}>
            <span><strong style={{ color: "var(--ink)" }}>{trail.inscritos}</strong> inscritos</span>
            <span><strong style={{ color: "var(--ink)" }}>{trail.conclusao}%</strong> de conclusão média</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button className="btn btn-health" style={{ height: 40, padding: "0 20px" }}>
              Recomendar a cliente <Icon name="arrow-right" size={14}/>
            </button>
            <button className="btn btn-ghost" style={{ height: 40 }}>
              <Icon name="eye" size={14}/> Pré-visualizar
            </button>
          </div>
        </div>
        <div style={{ height: 220, borderRadius: 20, background: trail.capa || "#E5E7EB", overflow: "hidden", position: "relative" }}>
          {trail.imagem && (
            <img 
              src={trail.imagem} 
              alt={trail.nome}
              loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <h2 className="display" style={{ fontSize: 24, margin: "0 0 18px" }}>Módulos</h2>
        {modules.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderTop: i > 0 ? "1px dashed var(--line-strong)" : "none" }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, background: "#FFF4EC", color: "#F66B0A", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            <div style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>{m}</div>
            <button className="btn btn-soft" style={{ height: 30, fontSize: 12 }}>Ver módulo</button>
          </div>
        ))}
      </div>
    </Page>
  );
};

Object.assign(window, { AprendizadoScreen });
