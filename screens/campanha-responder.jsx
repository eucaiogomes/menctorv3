/* global React, Icon, Logo, CLIENTES, DIAGNOSTICOS, CAMPANHAS, getCampanhaRespondidos, getCampanhaStatusEfetivo, jaRespondeuCampanha, registrarRespostaCampanha, fmtData */

// ════════════════════════════════════════════════════════════
// CAMPANHA RESPONDER — página pública (link da campanha):
// cadastro anônimo → questionário do diagnóstico → conclusão.
// Bancos de questões representativos para COPSOQ II, HSE-IT e EDRPS.
// ════════════════════════════════════════════════════════════

const ESCALA_FREQUENCIA = [
  { label: "Nunca / quase nunca", value: 0 },
  { label: "Raramente",           value: 1 },
  { label: "Às vezes",            value: 2 },
  { label: "Frequentemente",      value: 3 },
  { label: "Sempre",              value: 4 },
];

const ESCALA_CONCORDANCIA = [
  { label: "Discordo totalmente", value: 0 },
  { label: "Discordo",            value: 1 },
  { label: "Neutro",              value: 2 },
  { label: "Concordo",            value: 3 },
  { label: "Concordo totalmente", value: 4 },
];

const ESCALA_INTENSIDADE = [
  { label: "Muito baixo", value: 0 },
  { label: "Baixo",       value: 1 },
  { label: "Moderado",    value: 2 },
  { label: "Alto",        value: 3 },
  { label: "Muito alto",  value: 4 },
];

const SETORES_RESP = ["Operações", "Administrativo", "Comercial", "Logística", "Tecnologia", "RH"];
const CARGOS_RESP  = ["Estagiário", "Assistente", "Analista", "Coordenador", "Gerente", "Diretor"];

// ── Bancos de questões (representativos — para fins de demonstração do fluxo) ──
const COPSOQ_QUESTIONARIO = {
  escala: ESCALA_FREQUENCIA,
  dimensoes: [
    { nome: "Carga de trabalho", perguntas: [
      "Você precisa trabalhar muito rapidamente?",
      "Sua carga de trabalho é distribuída de forma desigual, causando acúmulo de tarefas?",
      "Você tem tempo suficiente para realizar suas tarefas?",
      "Você leva trabalho para casa com frequência?",
    ]},
    { nome: "Burnout", perguntas: [
      "Você se sente fisicamente esgotado(a) ao final do dia de trabalho?",
      "Você se sente emocionalmente exausto(a) pelo trabalho?",
      "Você sente que não tem mais energia para lidar com outra pessoa?",
      "Você acorda cansado(a) mesmo após uma noite de sono?",
    ]},
    { nome: "Estresse", perguntas: [
      "Você se sente tenso(a) ou irritado(a) durante o trabalho?",
      "Você tem dificuldade para relaxar após o expediente?",
      "Você sente que está sob pressão constante no trabalho?",
      "Você tem sentido dores de cabeça, tensão muscular ou insônia relacionadas ao trabalho?",
    ]},
    { nome: "Conflito trabalho-família", perguntas: [
      "As exigências do seu trabalho interferem na sua vida pessoal/familiar?",
      "Você sente falta de tempo para a família por causa do trabalho?",
      "Você leva as preocupações do trabalho para casa?",
    ]},
    { nome: "Ritmo de trabalho", perguntas: [
      "O ritmo do seu trabalho é definido por prazos apertados?",
      "Você precisa acelerar o ritmo de trabalho para cumprir metas?",
      "Seu ritmo de trabalho é irregular ao longo do dia?",
    ]},
    { nome: "Reconhecimento", perguntas: [
      "Seu trabalho é reconhecido e valorizado pela gestão?",
      "Você recebe feedback adequado sobre seu desempenho?",
      "Você sente que seus esforços são recompensados de forma justa?",
    ]},
    { nome: "Suporte social", perguntas: [
      "Você pode contar com seus colegas quando precisa de ajuda no trabalho?",
      "Existe um bom espírito de equipe no seu setor?",
      "Você se sente à vontade para pedir ajuda a colegas quando necessário?",
    ]},
    { nome: "Qualidade da liderança", perguntas: [
      "Sua liderança direta garante boas condições para o desenvolvimento do seu trabalho?",
      "Sua liderança resolve conflitos de forma justa?",
      "Sua liderança dá prioridade à satisfação no trabalho?",
      "Você recebe orientações claras da sua liderança?",
    ]},
    { nome: "Justiça e respeito", perguntas: [
      "Os conflitos são resolvidos de forma justa no seu ambiente de trabalho?",
      "Você é tratado(a) de forma justa no seu local de trabalho?",
      "As decisões que afetam você são tomadas de forma transparente?",
    ]},
    { nome: "Influência no trabalho", perguntas: [
      "Você tem influência sobre a quantidade de trabalho atribuída a você?",
      "Você pode decidir como realizar suas tarefas?",
      "Você participa das decisões sobre o seu próprio trabalho?",
      "Você tem autonomia para organizar sua rotina de trabalho?",
    ]},
    { nome: "Comunidade social", perguntas: [
      "Existe um bom ambiente de convivência entre os colegas de trabalho?",
      "Você se sente parte de uma comunidade no seu local de trabalho?",
      "Há momentos de descontração e integração entre a equipe?",
    ]},
    { nome: "Significado do trabalho", perguntas: [
      "Seu trabalho tem sentido para você?",
      "Você sente que seu trabalho é importante para a empresa?",
      "Você se sente motivado(a) com as atividades que realiza?",
    ]},
  ],
};

const HSE_QUESTIONARIO = {
  escala: ESCALA_FREQUENCIA,
  dimensoes: [
    { nome: "Demandas", perguntas: [
      "Sou pressionado(a) a trabalhar horas extras.",
      "Diferentes grupos no trabalho exigem coisas difíceis de conciliar.",
      "Tenho prazos impossíveis de cumprir.",
      "Preciso negligenciar algumas tarefas porque tenho coisas demais para fazer.",
      "Sou obrigado(a) a trabalhar muito intensamente.",
      "Não tenho tempo suficiente para realizar meu trabalho.",
      "Sofro pressão de tempo desnecessária.",
      "Meu ritmo de trabalho é intenso durante todo o dia.",
    ]},
    { nome: "Controle", perguntas: [
      "Posso decidir quando fazer uma pausa.",
      "Tenho liberdade para decidir como fazer meu trabalho.",
      "Meu horário de trabalho pode ser flexível.",
      "Posso decidir a ordem em que realizo minhas tarefas.",
      "Tenho alguma escolha ao decidir o que fazer no trabalho.",
      "Tenho voz ativa sobre o meu ritmo de trabalho.",
    ]},
    { nome: "Apoio da chefia", perguntas: [
      "Recebo feedback útil sobre meu trabalho por parte da liderança.",
      "Posso contar com minha liderança para me ajudar diante de um problema no trabalho.",
      "Sou incentivado(a) pela minha liderança no trabalho.",
      "Minha liderança me apoia diante de um problema emocional no trabalho.",
      "Sinto que minha liderança respeita meu trabalho.",
    ]},
    { nome: "Apoio dos colegas", perguntas: [
      "Se o trabalho fica difícil, meus colegas me ajudam.",
      "Recebo a ajuda e o apoio que preciso dos colegas.",
      "Meus colegas estão dispostos a ouvir meus problemas relacionados ao trabalho.",
      "Existe um bom relacionamento entre eu e meus colegas de trabalho.",
    ]},
    { nome: "Relacionamentos", perguntas: [
      "Sou vítima de atitudes hostis ou de bullying no trabalho.",
      "Há atrito ou raiva entre colegas de trabalho.",
      "Os relacionamentos no trabalho são tensos.",
      "Sinto-me exposto(a) a conflitos interpessoais no trabalho.",
    ]},
    { nome: "Cargo e função", perguntas: [
      "Sei claramente o que se espera de mim no trabalho.",
      "Sei como realizar meu trabalho corretamente.",
      "Tenho clareza sobre meus objetivos e metas no trabalho.",
      "Entendo como meu trabalho se encaixa no propósito geral da organização.",
      "Sei quais são minhas responsabilidades no trabalho.",
    ]},
    { nome: "Mudança", perguntas: [
      "Tenho a oportunidade de opinar sobre mudanças que afetam meu trabalho.",
      "Quando são feitas mudanças no trabalho, sei claramente como elas funcionarão na prática.",
      "Sou consultado(a) sobre mudanças no trabalho.",
    ]},
  ],
};

const EDRPS_QUESTIONARIO = {
  escala: ESCALA_CONCORDANCIA,
  dimensoes: [
    { nome: "Organização do trabalho", perguntas: [
      "As normas para execução das tarefas são rígidas.",
      "Existe forte cobrança por resultados no meu trabalho.",
      "O ritmo de trabalho é determinado por terceiros, sem minha participação.",
      "Tenho pouca autonomia para organizar minhas atividades.",
      "As metas estabelecidas para o meu trabalho são realistas.",
    ]},
    { nome: "Condições de trabalho", perguntas: [
      "As condições físicas do meu ambiente de trabalho são adequadas.",
      "Tenho os equipamentos e recursos necessários para realizar meu trabalho.",
      "Meu ambiente de trabalho apresenta riscos à minha saúde.",
      "O espaço físico onde trabalho é confortável.",
      "Sinto-me seguro(a) fisicamente no meu ambiente de trabalho.",
    ]},
    { nome: "Relações socioprofissionais", perguntas: [
      "Existe cooperação entre os colegas de trabalho.",
      "Presencio ou sofro humilhações no ambiente de trabalho.",
      "A comunicação entre as equipes é clara e eficiente.",
      "Sinto-me respeitado(a) pelos meus colegas e superiores.",
      "Existem conflitos frequentes no meu ambiente de trabalho.",
    ]},
    { nome: "Reconhecimento e crescimento", perguntas: [
      "Tenho oportunidades de crescimento profissional na empresa.",
      "Meu esforço no trabalho é reconhecido pela organização.",
      "Recebo retorno adequado sobre meu desempenho.",
      "Sinto que meu trabalho contribui para meu desenvolvimento pessoal.",
      "A empresa investe no meu desenvolvimento profissional.",
    ]},
    { nome: "Sofrimento psíquico", perguntas: [
      "Sinto ansiedade relacionada às demandas do trabalho.",
      "Tenho pensamentos negativos frequentes relacionados ao trabalho.",
      "Sinto-me emocionalmente sobrecarregado(a) pelo trabalho.",
      "Tenho dificuldade em desligar-me mentalmente do trabalho fora do expediente.",
      "Sinto desmotivação frequente em relação ao meu trabalho.",
    ]},
    { nome: "Danos relacionados ao trabalho", perguntas: [
      "Tenho sentido problemas de sono relacionados ao trabalho.",
      "Tenho apresentado sintomas físicos (dores, tensão) relacionados ao trabalho.",
      "Já pensei em me afastar do trabalho por motivos de saúde mental.",
      "Sinto que o trabalho tem afetado negativamente minha vida pessoal.",
      "Tenho utilizado medicamentos ou tratamentos por conta do estresse do trabalho.",
    ]},
  ],
};

const PULSE_QUESTIONARIO = {
  escala: ESCALA_FREQUENCIA,
  dimensoes: [
    { nome: "Energia e disposição", perguntas: [
      "Você tem se sentido sem energia para realizar suas tarefas diárias?",
      "Você tem acordado cansado(a) mesmo depois de dormir?",
      "Você tem sentido baixa disposição física ao longo do dia?",
    ]},
    { nome: "Humor e ânimo", perguntas: [
      "Você tem se sentido desanimado(a) ou sem motivação?",
      "Você tem sentido ansiedade ou preocupação excessiva?",
      "Você tem tido dificuldade de concentração no trabalho?",
      "Você tem se sentido irritado(a) com facilidade?",
    ]},
    { nome: "Sono e recuperação", perguntas: [
      "Você tem tido dificuldade para dormir?",
      "Você tem sentido que não consegue relaxar fora do trabalho?",
      "Você tem sentido que não tem tempo suficiente de descanso?",
    ]},
  ],
};

const BURNOUT_QUESTIONARIO = {
  escala: ESCALA_FREQUENCIA,
  dimensoes: [
    { nome: "Exaustão emocional", perguntas: [
      "Sinto-me emocionalmente esgotado(a) pelo meu trabalho.",
      "Sinto-me esgotado(a) ao final de um dia de trabalho.",
      "Sinto-me cansado(a) quando me levanto de manhã e preciso enfrentar outro dia de trabalho.",
      "Trabalhar o dia todo é realmente uma tensão para mim.",
      "Sinto-me \"queimado(a)\" (esgotado) pelo meu trabalho.",
      "Sinto-me frustrado(a) com o meu trabalho.",
      "Sinto que estou trabalhando demais no meu emprego.",
      "Trabalhar diretamente com pessoas me causa muito estresse.",
      "Sinto que estou no limite das minhas forças.",
    ]},
    { nome: "Despersonalização/Cinismo", perguntas: [
      "Sinto que trato algumas pessoas no trabalho como se fossem objetos impessoais.",
      "Tornei-me mais insensível com as pessoas desde que comecei este trabalho.",
      "Preocupa-me o fato de este trabalho estar me endurecendo emocionalmente.",
      "Sinto que não me importo realmente com o que acontece com algumas pessoas com quem trabalho.",
      "Sinto que as pessoas me culpam por alguns dos seus problemas.",
    ]},
    { nome: "Falta de realização pessoal", perguntas: [
      "Sinto que não estou influenciando positivamente a vida de outras pessoas através do meu trabalho.",
      "Sinto que perdi o entusiasmo pelo meu trabalho.",
      "Sinto que não consigo lidar com os problemas de forma eficaz.",
      "Sinto que não estou alcançando os objetivos que estabeleci para minha carreira.",
      "Sinto que não crio um ambiente positivo com as pessoas com quem trabalho.",
      "Sinto-me sem energia e vitalidade no meu trabalho.",
      "Sinto que não tenho lidado bem com situações emocionalmente difíceis no trabalho.",
      "Sinto que meu trabalho não tem trazido a satisfação que eu esperava.",
    ]},
  ],
};

const GALLUP_QUESTIONARIO = {
  escala: ESCALA_CONCORDANCIA,
  dimensoes: [
    { nome: "Engajamento Gallup Q12", perguntas: [
      "Sei o que é esperado de mim no trabalho.",
      "Tenho os materiais e equipamentos necessários para fazer bem o meu trabalho.",
      "No trabalho, tenho a oportunidade de fazer o que faço de melhor todos os dias.",
      "Nos últimos sete dias, recebi reconhecimento ou elogio por um bom trabalho.",
      "Meu superior, ou alguém no trabalho, parece se importar comigo como pessoa.",
      "Há alguém no trabalho que estimula o meu desenvolvimento.",
      "No trabalho, minhas opiniões parecem ser levadas em consideração.",
      "A missão/propósito da empresa faz com que eu sinta que meu trabalho é importante.",
      "Meus colegas de trabalho estão comprometidos em fazer um trabalho de qualidade.",
      "Tenho um bom amigo no trabalho.",
      "Nos últimos seis meses, alguém no trabalho falou comigo sobre o meu progresso.",
      "Neste último ano, tive oportunidades no trabalho para aprender e crescer.",
    ]},
  ],
};

const ENPS_QUESTIONARIO = {
  escala: ESCALA_CONCORDANCIA,
  dimensoes: [
    { nome: "Satisfação e recomendação", perguntas: [
      "Eu recomendaria esta empresa como um bom lugar para trabalhar.",
      "Estou satisfeito(a) com meu trabalho nesta empresa.",
      "Sinto orgulho de fazer parte desta empresa.",
    ]},
  ],
};

const CLIMA_QUESTIONARIO = {
  escala: ESCALA_CONCORDANCIA,
  dimensoes: [
    { nome: "Comunicação interna", perguntas: [
      "As informações importantes chegam até mim em tempo hábil.",
      "Compreendo claramente as decisões tomadas pela empresa.",
      "Sinto-me à vontade para expressar minhas opiniões abertamente.",
      "A comunicação entre os diferentes setores da empresa é eficiente.",
      "Recebo feedback claro sobre o meu desempenho.",
    ]},
    { nome: "Cultura e valores", perguntas: [
      "Os valores da empresa são praticados no dia a dia, não apenas divulgados.",
      "Sinto-me alinhado(a) com a cultura da empresa.",
      "A empresa promove um ambiente de diversidade e respeito.",
      "As decisões da empresa são coerentes com os valores declarados.",
      "Tenho orgulho de fazer parte desta empresa.",
    ]},
    { nome: "Liderança e gestão", perguntas: [
      "Minha liderança inspira confiança na equipe.",
      "Minha liderança está disponível quando preciso de apoio.",
      "As decisões da gestão são justas e transparentes.",
      "Minha liderança reconhece o bom trabalho da equipe.",
      "Sinto que posso confiar na minha liderança.",
    ]},
    { nome: "Reconhecimento e carreira", perguntas: [
      "Vejo oportunidades reais de crescimento profissional na empresa.",
      "Meu esforço é reconhecido de forma justa.",
      "A empresa investe no meu desenvolvimento profissional.",
      "Tenho clareza sobre meu plano de carreira na empresa.",
      "Sinto que sou remunerado(a) de forma justa pelo meu trabalho.",
    ]},
    { nome: "Ambiente e infraestrutura", perguntas: [
      "O ambiente físico de trabalho é adequado e confortável.",
      "Tenho os recursos necessários para realizar bem meu trabalho.",
      "Sinto-me seguro(a) no meu ambiente de trabalho.",
      "A empresa oferece boas condições de bem-estar (ex: alimentação, espaço de descanso).",
    ]},
    { nome: "Colaboração e trabalho em equipe", perguntas: [
      "Existe boa colaboração entre as equipes da empresa.",
      "Meus colegas estão dispostos a me ajudar quando preciso.",
      "Há um bom espírito de equipe no meu setor.",
      "Conflitos são resolvidos de forma saudável e produtiva.",
    ]},
  ],
};

const DISC_QUESTIONARIO = {
  escala: ESCALA_CONCORDANCIA,
  dimensoes: [
    { nome: "Dominância (D)", perguntas: [
      "Gosto de tomar decisões rapidamente, mesmo sob pressão.",
      "Prefiro assumir o controle das situações no trabalho.",
      "Sou direto(a) ao expressar minhas opiniões.",
      "Gosto de desafios e de correr riscos calculados.",
      "Tenho facilidade para liderar e determinar prioridades.",
      "Fico impaciente quando as coisas demoram para acontecer.",
    ]},
    { nome: "Influência (I)", perguntas: [
      "Gosto de me comunicar e interagir com muitas pessoas.",
      "Sou entusiasmado(a) e otimista na maioria das situações.",
      "Tenho facilidade para persuadir e influenciar outras pessoas.",
      "Gosto de estar em ambientes sociais e dinâmicos.",
      "Costumo expressar meus sentimentos abertamente.",
      "Prefiro trabalhar em equipe do que sozinho(a).",
    ]},
    { nome: "Estabilidade (S)", perguntas: [
      "Prefiro rotinas previsíveis a mudanças constantes.",
      "Sou paciente e calmo(a) diante de conflitos.",
      "Gosto de apoiar e cooperar com meus colegas.",
      "Prefiro seguir processos já estabelecidos.",
      "Sou leal e confiável com a equipe e a empresa.",
      "Evito confrontos e busco harmonia no ambiente de trabalho.",
    ]},
    { nome: "Conformidade (C)", perguntas: [
      "Gosto de seguir regras e procedimentos com precisão.",
      "Presto muita atenção aos detalhes no meu trabalho.",
      "Prefiro analisar dados antes de tomar uma decisão.",
      "Busco sempre a qualidade e a exatidão no que faço.",
      "Sinto-me desconfortável com ambiguidade ou falta de estrutura.",
      "Sou cauteloso(a) antes de expressar minha opinião.",
    ]},
  ],
};

const TLX_QUESTIONARIO = {
  escala: ESCALA_INTENSIDADE,
  dimensoes: [
    { nome: "Demanda mental", perguntas: ["Quão mentalmente exigente foi o seu trabalho nesta semana?"] },
    { nome: "Demanda física", perguntas: ["Quão fisicamente exigente foi o seu trabalho nesta semana?"] },
    { nome: "Demanda temporal", perguntas: ["Quão apressado(a) ou acelerado(a) foi o ritmo das suas tarefas?"] },
    { nome: "Esforço", perguntas: ["Quanto esforço mental e físico você precisou empregar para atingir seu nível de desempenho?"] },
    { nome: "Frustração", perguntas: ["Quão inseguro(a), desencorajado(a), irritado(a) ou estressado(a) você se sentiu?"] },
    { nome: "Desempenho percebido", perguntas: ["Quão insatisfeito(a) você ficou com o seu próprio desempenho?"] },
  ],
};

const QUESTIONARIOS_POR_DIAGNOSTICO = {
  copsoq: COPSOQ_QUESTIONARIO,
  hse: HSE_QUESTIONARIO,
  edrps: EDRPS_QUESTIONARIO,
  pulse: PULSE_QUESTIONARIO,
  burnout: BURNOUT_QUESTIONARIO,
  gallup: GALLUP_QUESTIONARIO,
  enps: ENPS_QUESTIONARIO,
  clima: CLIMA_QUESTIONARIO,
  disc: DISC_QUESTIONARIO,
  tlx: TLX_QUESTIONARIO,
};

const getQuestionario = (diagnostico) => {
  if (!diagnostico) return null;
  const banco = QUESTIONARIOS_POR_DIAGNOSTICO[diagnostico.id];
  if (banco) return banco;
  // fallback genérico para diagnósticos sem banco dedicado ainda
  const n = diagnostico.questions || 10;
  return {
    escala: ESCALA_FREQUENCIA,
    dimensoes: [{
      nome: diagnostico.name,
      perguntas: Array.from({ length: n }, (_, i) => `Pergunta ${i + 1} de ${n} — ${diagnostico.name}`),
    }],
  };
};

// ── CPF: máscara e validação (algoritmo padrão de dígito verificador) ──
const maskCPF = (value) => {
  const d = String(value || "").replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const validarCPF = (raw) => {
  const cpf = String(raw || "").replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
};

// ════════════════════════════════════════════════════════════
// UI helpers
// ════════════════════════════════════════════════════════════
const RespField = ({ label, opcional, children }) => (
  <div>
    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>
      {label} {opcional ? <span style={{ fontWeight: 500, color: "var(--ink-faint)", textTransform: "uppercase", fontSize: 10.5 }}>(opcional)</span> : <span style={{ color: "var(--coral)" }}>*</span>}
    </div>
    {children}
  </div>
);

const respFieldStyle = { width: "100%", height: 44, padding: "0 13px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", fontSize: 14 };

const LikertScale = ({ escala, value, onChange }) => (
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
    {escala.map(opt => {
      const selected = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            flex: "1 1 100px", padding: "10px 8px", borderRadius: 10, fontSize: 12.5, fontWeight: selected ? 700 : 500,
            border: selected ? "1.5px solid var(--health)" : "1px solid var(--line)",
            background: selected ? "var(--surface-sage)" : "var(--surface)",
            color: selected ? "var(--health-deep)" : "var(--ink-soft)",
            textAlign: "center", cursor: "pointer", transition: "all .15s",
          }}>
          {opt.label}
        </button>
      );
    })}
  </div>
);

const RespHeader = ({ cliente, diagnostico }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 4px", marginBottom: 8 }}>
    <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: "var(--ink-muted)", letterSpacing: "-0.01em" }}>
      {cliente ? cliente.name : "Empresa"}
    </div>
    <div style={{ width: 1, height: 20, background: "var(--line-strong)" }} />
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Logo size={32} />
    </div>
  </div>
);

const StepProgressBar = ({ current, total }) => (
  <div style={{ display: "flex", gap: 4, margin: "18px 0" }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= current ? "var(--health)" : "var(--line)", transition: "background .25s" }} />
    ))}
  </div>
);

// ════════════════════════════════════════════════════════════
// CADASTRO — coleta anônima antes de iniciar
// ════════════════════════════════════════════════════════════
const CampanhaCadastroView = ({ campanha, diagnostico, totalPerguntas, setorInicial, cargoInicial, onStart }) => {
  const [cpf, setCpf] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [idade, setIdade] = React.useState("");
  const [sexo, setSexo] = React.useState("");
  const [setor, setSetor] = React.useState(setorInicial || "");
  const [cargo, setCargo] = React.useState(cargoInicial || "");
  const [erro, setErro] = React.useState("");

  const minutos = Math.max(3, Math.round(totalPerguntas * 0.22));

  const iniciar = () => {
    if (!validarCPF(cpf)) { setErro("Informe um CPF válido."); return; }
    if (jaRespondeuCampanha(campanha.id, cpf)) { setErro("Este CPF já respondeu a esta campanha."); return; }
    const idadeNum = Number(idade);
    if (!idadeNum || idadeNum < 14 || idadeNum > 100) { setErro("Informe uma idade válida."); return; }
    if (!sexo) { setErro("Selecione o sexo."); return; }
    if (!setor) { setErro("Selecione o setor."); return; }
    if (!cargo) { setErro("Selecione o cargo/função."); return; }
    setErro("");
    onStart({ cpf, nome: nome.trim(), idade: idadeNum, sexo, setor, cargo });
  };

  return (
    <div style={{ width: "100%", maxWidth: 620 }}>
      <div style={{ marginBottom: 18, textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "var(--health-deep)" }}>{diagnostico?.type || "Avaliação"}</div>
        <h1 className="display" style={{ fontSize: 30, margin: "6px 0 0" }}>{campanha.titulo}</h1>
      </div>

      <div style={{ display: "flex", gap: 12, padding: 18, borderRadius: 14, background: "var(--sky-soft, #EAF2FB)", border: "1px solid #C5D9F7", marginBottom: 20 }}>
        <Icon name="shield" size={20} color="#1E4A9E" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em", color: "#1E4A9E", textTransform: "uppercase", marginBottom: 6 }}>Garantia de anonimato</div>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#1E4A9E" }}>
            Todas as informações coletadas neste formulário são <strong>completamente anônimas</strong>. Seus dados pessoais <strong>não serão disponibilizados para a empresa</strong>. Utilizamos essas informações apenas para análises estatísticas agregadas que ajudarão a melhorar o ambiente de trabalho.
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 12.5, lineHeight: 1.6, color: "#1E4A9E" }}>
            Esta avaliação tem como objetivo compreender melhor o ambiente de trabalho e identificar fatores de riscos psicossociais que possam impactar a saúde dos trabalhadores, contribuindo para a melhoria contínua das condições de trabalho, conforme determina a NR-01.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <RespField label="CPF">
            <input value={cpf} onChange={e => setCpf(maskCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" style={respFieldStyle} />
          </RespField>
          <RespField label="Primeiro nome" opcional>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Como prefere ser chamado(a)" style={respFieldStyle} />
          </RespField>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <RespField label="Idade">
            <input value={idade} onChange={e => setIdade(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Ex: 27" inputMode="numeric" style={respFieldStyle} />
          </RespField>
          <RespField label="Sexo">
            <select value={sexo} onChange={e => setSexo(e.target.value)} style={respFieldStyle}>
              <option value="">Selecione</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="prefiro-nao-informar">Prefiro não informar</option>
            </select>
          </RespField>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <RespField label="Setor">
            <select value={setor} onChange={e => setSetor(e.target.value)} style={respFieldStyle}>
              <option value="">Selecione o setor</option>
              {SETORES_RESP.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </RespField>
          <RespField label="Cargo/Função">
            <select value={cargo} onChange={e => setCargo(e.target.value)} style={respFieldStyle}>
              <option value="">Selecione o cargo</option>
              {CARGOS_RESP.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
          </RespField>
        </div>

        <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Instruções:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.8 }}>
            <li>O questionário leva cerca de {minutos} minutinhos</li>
            <li>Marque apenas uma resposta por pergunta</li>
            <li>Suas respostas são completamente anônimas</li>
            <li>Em caso de dúvidas, entre em contato com seu supervisor</li>
          </ul>
        </div>

        {erro && <div style={{ fontSize: 12.5, color: "var(--coral)", fontWeight: 600 }}>{erro}</div>}

        <button onClick={iniciar} className="btn btn-accent" style={{ height: 46, justifyContent: "center", fontSize: 14.5 }}>
          Começar Avaliação <Icon name="arrow-right" size={15} />
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// QUESTIONÁRIO — uma dimensão por página + comentários finais
// ════════════════════════════════════════════════════════════
const CampanhaQuestionarioView = ({ campanha, diagnostico, questionario, onFinish, onBack }) => {
  const dimensoes = questionario.dimensoes;
  const totalSteps = dimensoes.length + 1; // + página de comentários
  const [step, setStep] = React.useState(0);
  const [respostas, setRespostas] = React.useState({}); // "dimIdx-qIdx" -> value
  const [comentario, setComentario] = React.useState("");

  const isComentarios = step === dimensoes.length;
  const dimensaoAtual = !isComentarios ? dimensoes[step] : null;

  const respondida = (dimIdx, qIdx) => respostas[`${dimIdx}-${qIdx}`] !== undefined;
  const dimensaoCompleta = dimensaoAtual ? dimensaoAtual.perguntas.every((_, qIdx) => respondida(step, qIdx)) : true;

  const setResposta = (qIdx, value) => setRespostas(prev => ({ ...prev, [`${step}-${qIdx}`]: value }));

  const avancar = () => {
    if (!dimensaoCompleta) return;
    if (step < totalSteps - 1) setStep(step + 1);
  };
  const voltar = () => {
    if (step === 0) { onBack(); return; }
    setStep(step - 1);
  };

  const finalizar = () => {
    const valores = Object.values(respostas);
    const media = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
    const porDimensao = {};
    dimensoes.forEach((dim, dimIdx) => {
      const vals = dim.perguntas.map((_, qIdx) => respostas[`${dimIdx}-${qIdx}`]).filter(v => v !== undefined);
      if (vals.length) porDimensao[dim.nome] = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
    });
    onFinish({ respostas, porDimensao, comentario: comentario.trim(), media: Number(media.toFixed(2)) });
  };

  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div className="eyebrow" style={{ color: "var(--health-deep)" }}>{diagnostico?.type}</div>
        <h2 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 22, margin: "4px 0 0", color: "var(--ink)" }}>
          {campanha.titulo}
        </h2>
      </div>

      <StepProgressBar current={step} total={totalSteps} />

      <div className="card" style={{ padding: "26px 28px" }}>
        {!isComentarios ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 19, margin: 0, color: "var(--ink)" }}>{dimensaoAtual.nome}</h3>
              <span style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>Bloco {step + 1} de {dimensoes.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {dimensaoAtual.perguntas.map((texto, qIdx) => (
                <div key={qIdx}>
                  <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1.5 }}>{texto}</div>
                  <LikertScale escala={questionario.escala} value={respostas[`${step}-${qIdx}`]} onChange={v => setResposta(qIdx, v)} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Icon name="file-text" size={18} color="var(--health-deep)" />
              <h3 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 19, margin: 0, color: "var(--ink)" }}>Comentários Adicionais</h3>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55 }}>
              Gostaria de compartilhar algum comentário adicional sobre sua experiência de trabalho? Este campo é opcional, mas suas observações podem ser muito valiosas para melhorar o ambiente de trabalho.
            </p>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>Seus comentários (opcional)</div>
            <textarea
              value={comentario}
              maxLength={1000}
              onChange={e => setComentario(e.target.value)}
              placeholder="Compartilhe suas observações, sugestões ou qualquer comentário que considere importante sobre sua experiência de trabalho..."
              style={{ width: "100%", minHeight: 140, padding: 14, border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", fontSize: 13.5, lineHeight: 1.55, resize: "vertical", fontFamily: "inherit" }}
            />
            <div style={{ textAlign: "right", fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>{comentario.length}/1000 caracteres</div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
          <button onClick={voltar} className="btn btn-ghost" style={{ height: 40 }}><Icon name="chevron-left" size={14} /> Voltar</button>
          {!isComentarios ? (
            <button onClick={avancar} disabled={!dimensaoCompleta} className="btn btn-primary" style={{ height: 40, opacity: dimensaoCompleta ? 1 : 0.5 }}>
              Avançar <Icon name="chevron-right" size={14} />
            </button>
          ) : (
            <button onClick={finalizar} className="btn btn-accent" style={{ height: 40 }}>
              Finalizar Avaliação <Icon name="arrow-right" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// TELAS DE ESTADO (encerrada / não encontrada / já respondeu / concluída)
// ════════════════════════════════════════════════════════════
const CampanhaStateCard = ({ icon, iconColor, title, desc, tone = "neutral" }) => (
  <div style={{ width: "100%", maxWidth: 480, textAlign: "center", padding: "8px 4px" }}>
    <div style={{
      width: 68, height: 68, borderRadius: 999, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center",
      background: tone === "success" ? "var(--surface-sage)" : tone === "danger" ? "var(--coral-soft)" : "var(--surface-2)",
    }}>
      <Icon name={icon} size={30} color={iconColor} />
    </div>
    <h1 className="display" style={{ fontSize: 28, margin: 0 }}>{title}</h1>
    <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6 }}>{desc}</p>
  </div>
);

// ════════════════════════════════════════════════════════════
// SCREEN principal
// ════════════════════════════════════════════════════════════
const CampanhaResponderScreen = ({ campanhaId, setorParam, cargoParam }) => {
  const campanha = CAMPANHAS.find(c => c.id === campanhaId);
  const cliente = campanha ? CLIENTES.find(c => c.id === campanha.clienteId) : null;
  const diagnostico = campanha ? DIAGNOSTICOS.find(d => d.id === campanha.diagnosticoId) : null;
  const questionario = diagnostico ? getQuestionario(diagnostico) : null;

  const [fase, setFase] = React.useState("cadastro"); // cadastro | questionario | concluido
  const [respondente, setRespondente] = React.useState(null);

  const statusEfetivo = campanha ? getCampanhaStatusEfetivo(campanha) : null;
  const disponivel = statusEfetivo === "ativa";

  const wrapperStyle = { minHeight: "100vh", background: "var(--canvas-warm)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 20px 60px" };
  const innerContainer = { width: "100%", maxWidth: 720 };

  if (!campanha || !cliente || !diagnostico || !questionario) {
    return (
      <div style={wrapperStyle}>
        <div style={innerContainer}><RespHeader cliente={null} /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <CampanhaStateCard icon="x" iconColor="var(--coral)" tone="danger" title="Campanha não encontrada" desc="O link que você acessou não corresponde a nenhuma campanha de avaliação ativa. Verifique o link recebido ou fale com o responsável pela pesquisa." />
        </div>
      </div>
    );
  }

  if (fase === "cadastro" && !disponivel) {
    const respondidos = getCampanhaRespondidos(campanha);
    const metaAtingida = respondidos >= campanha.quantidadeFuncionarios;
    const hoje = new Date().toISOString().slice(0, 10);
    const prazoVencido = statusEfetivo === "encerrada" && !metaAtingida && hoje > campanha.dataFinal;

    return (
      <div style={wrapperStyle}>
        <div style={innerContainer}><RespHeader cliente={cliente} diagnostico={diagnostico} /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          {metaAtingida ? (
            <CampanhaStateCard icon="check" iconColor="var(--health-deep)" tone="success" title="Meta de avaliações atingida" desc={`A campanha "${campanha.titulo}" já coletou o número de avaliações previsto. Obrigado pelo interesse!`} />
          ) : prazoVencido ? (
            <CampanhaStateCard icon="calendar" iconColor="var(--ink-muted)" title="Campanha encerrada" desc={`A campanha "${campanha.titulo}" foi encerrada. O período de coleta foi até ${fmtData(campanha.dataFinal)}. Fale com o responsável pela pesquisa na sua empresa para mais informações.`} />
          ) : statusEfetivo === "agendada" ? (
            <CampanhaStateCard icon="calendar" iconColor="var(--ink-muted)" title="Campanha ainda não começou" desc={`A campanha "${campanha.titulo}" abre para respostas em ${fmtData(campanha.dataInicial)}. Volte a acessar o link a partir dessa data.`} />
          ) : (
            <CampanhaStateCard icon="calendar" iconColor="var(--ink-muted)" title="Campanha pausada" desc={`A campanha "${campanha.titulo}" está pausada no momento. Fale com o responsável pela pesquisa na sua empresa.`} />
          )}
        </div>
      </div>
    );
  }

  if (fase === "cadastro") {
    return (
      <div style={wrapperStyle}>
        <div style={innerContainer}><RespHeader cliente={cliente} diagnostico={diagnostico} /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <CampanhaCadastroView
            campanha={campanha}
            diagnostico={diagnostico}
            totalPerguntas={questionario.dimensoes.reduce((n, d) => n + d.perguntas.length, 0)}
            setorInicial={setorParam}
            cargoInicial={cargoParam}
            onStart={(dados) => { setRespondente(dados); setFase("questionario"); }}
          />
        </div>
      </div>
    );
  }

  if (fase === "questionario") {
    return (
      <div style={wrapperStyle}>
        <div style={innerContainer}><RespHeader cliente={cliente} diagnostico={diagnostico} /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", width: "100%", paddingTop: 10 }}>
          <CampanhaQuestionarioView
            campanha={campanha}
            diagnostico={diagnostico}
            questionario={questionario}
            onBack={() => setFase("cadastro")}
            onFinish={({ media, porDimensao, comentario }) => {
              registrarRespostaCampanha(campanha, { cpf: respondente.cpf, setor: respondente.setor, cargo: respondente.cargo, mediaRisco: media, porDimensao });
              setFase("concluido");
            }}
          />
        </div>
      </div>
    );
  }

  // concluído
  return (
    <div style={wrapperStyle}>
      <div style={innerContainer}><RespHeader cliente={cliente} diagnostico={diagnostico} /></div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <CampanhaStateCard
          icon="check"
          iconColor="var(--health-deep)"
          tone="success"
          title="Avaliação concluída!"
          desc="Obrigado por participar. Suas respostas foram registradas de forma totalmente anônima e vão ajudar a melhorar o ambiente de trabalho na sua empresa."
        />
      </div>
    </div>
  );
};

Object.assign(window, { CampanhaResponderScreen });
