/* global React, CLIENTES, getDiagnosticoResultadoMock */
const { useEffect: useRelDocEffect } = React;

// ════════════════════════════════════════════════════════════
// RELATORIO DOC — página pública, imprimível (Salvar como PDF),
// identidade própria (navy/orange editorial), independente do app.
// Acessível via /doc/relatorio?cliente=<id>&tipo=clima|matriz&autoprint=1
// ════════════════════════════════════════════════════════════

const relRiskColor = (v) => (v >= 2.5 ? "#C0392B" : v >= 1.5 ? "#B98900" : "#1F7A5C");
const relRiskLabel = (v) => (v >= 2.5 ? "Alto risco" : v >= 1.5 ? "Moderado" : "Saudável");

const TIPO_RELATORIO_META = {
  clima:  { titulo: "Pesquisa de Clima Organizacional", subtitulo: "Diagnóstico consolidado com adesão, score geral, dimensões COPSOQ II e plano de ação.", eyebrow: "Diagnóstico Organizacional", codigo: "PCO" },
  matriz: { titulo: "Matriz NR-1",                      subtitulo: "Classificação por severidade e plano de ação priorizado conforme os critérios da NR-1.", eyebrow: "Conformidade NR-01", codigo: "NR1" },
  aep:    { titulo: "Análise Ergonômica Preliminar",    subtitulo: "Diagnóstico ergonômico do posto de trabalho conforme a NR-17 — mobiliário, esforço físico, condições ambientais e plano de ação.", eyebrow: "Ergonomia · NR-17", codigo: "AEP" },
};

const AEP_PRIORIDADE = { risk: "Intervenção imediata", warn: "Ajuste em curto prazo", safe: "Manutenção do padrão" };

const REL_DOCS_CSS = `
  .rel-root { background: #F8F7F4; min-height: 100vh; font-family: Georgia, 'Times New Roman', serif; color: #1F2535; padding-bottom: 60px; }
  .rel-sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
  .rel-toolbar { position: sticky; top: 0; z-index: 50; background: rgba(248,247,244,0.96); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,32,77,0.08); padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
  .rel-btn { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 18px; border-radius: 999px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; transition: all .15s ease; }
  .rel-btn:hover { transform: translateY(-1px); filter: brightness(1.06); }
  .rel-btn-primary { background: #F66B0A; color: #fff; box-shadow: 0 2px 8px rgba(246,107,10,0.3); }
  .rel-btn-ghost { background: transparent; color: #00204D; border: 1px solid rgba(0,32,77,0.2); }
  .rel-page { max-width: 880px; margin: 24px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #EDEAE3; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .rel-section { padding: 36px 56px; border-bottom: 1px solid #EDEAE3; }
  .rel-section:last-child { border-bottom: none; }
  .rel-header { display: flex; justify-content: space-between; align-items: center; background: #00204D; color: #fff; padding: 26px 56px; }
  .rel-brand-name { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.02em; }
  .rel-brand-sub { display: block; font-size: 11px; opacity: .65; margin-top: 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .rel-doc-meta { text-align: right; font-family: ui-monospace, monospace; font-size: 12px; opacity: .8; line-height: 1.6; }
  .rel-eyebrow { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #F66B0A; }
  .rel-title { font-size: 32px; margin: 8px 0 6px; letter-spacing: -0.02em; color: #00204D; }
  .rel-lead { font-size: 15px; color: #4B5468; max-width: 62ch; line-height: 1.6; margin: 0 0 20px; }
  .rel-client-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; padding-top: 18px; border-top: 1px dashed #EDEAE3; }
  .rel-client-box label { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A93A6; font-weight: 700; }
  .rel-client-box .val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; color: #00204D; margin-top: 3px; }
  .rel-h2 { font-size: 20px; color: #00204D; margin: 0 0 6px; }
  .rel-p { font-size: 13.5px; color: #6B7280; margin: 0 0 20px; line-height: 1.6; }
  .rel-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .rel-stat { padding: 18px 20px; background: #F8F7F4; border-radius: 12px; border: 1px solid #EDEAE3; }
  .rel-stat .num { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 34px; font-weight: 800; color: #00204D; line-height: 1; }
  .rel-stat .label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A93A6; font-weight: 700; margin-top: 6px; }
  .rel-stat .sub { font-size: 12px; color: #6B7280; margin-top: 2px; }
  .rel-dims { display: flex; flex-direction: column; gap: 12px; }
  .rel-dim-row { display: grid; grid-template-columns: 200px 1fr 56px; gap: 14px; align-items: center; }
  .rel-dim-name { font-size: 13px; color: #374155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .rel-dim-track { position: relative; height: 16px; background: #F1F1EC; border-radius: 6px; }
  .rel-dim-fill { position: absolute; inset: 0; border-radius: 6px; opacity: .9; }
  .rel-dim-limit { position: absolute; left: 62.5%; top: -3px; bottom: -3px; width: 2px; background: #00204D; border-radius: 99px; }
  .rel-dim-value { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 700; font-size: 14px; text-align: right; color: #00204D; }
  .rel-table { width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; }
  .rel-table th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A93A6; padding: 8px 10px; border-bottom: 2px solid #EDEAE3; }
  .rel-table td { padding: 10px; border-bottom: 1px solid #F1F1EC; color: #374155; }
  .rel-mono { font-family: ui-monospace, monospace; font-weight: 700; }
  .rel-sev-pill { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .rel-sev-pill.safe { background: #E7F6EE; color: #1F7A5C; }
  .rel-sev-pill.warn { background: #FCF1DA; color: #8A6100; }
  .rel-sev-pill.risk { background: #FBE7E5; color: #B23324; }
  .rel-sev-summary { display: flex; gap: 20px; margin-top: 16px; font-size: 12.5px; color: #4B5468; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .rel-sev-summary .dot { display: inline-block; width: 8px; height: 8px; border-radius: 99px; margin-right: 6px; }
  .rel-sev-summary .dot.safe { background: #1F7A5C; }
  .rel-sev-summary .dot.warn { background: #B98900; }
  .rel-sev-summary .dot.risk { background: #C0392B; }
  .rel-actions { display: flex; flex-direction: column; gap: 2px; }
  .rel-act-item { display: flex; gap: 12px; padding: 10px 0; border-top: 1px dashed #EDEAE3; }
  .rel-act-item:first-child { border-top: none; }
  .rel-act-item .n { width: 22px; height: 22px; flex-shrink: 0; border-radius: 999px; background: #FFF1E6; color: #C25C0F; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .rel-act-item .t { font-size: 13.5px; font-weight: 600; color: #00204D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .rel-act-item .s { font-size: 11.5px; color: #8A93A6; margin-top: 2px; }
  .rel-footer { display: flex; justify-content: space-between; font-size: 11px; color: #8A93A6; padding: 20px 56px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

  @media print {
    .rel-toolbar, .no-print { display: none !important; }
    .rel-root { background: #fff; padding: 0; }
    .rel-page { box-shadow: none; border: none; border-radius: 0; max-width: none; margin: 0; }
    .rel-section { padding: 26px 40px; break-inside: avoid; }
    .rel-header { padding: 20px 40px; }
  }
`;

const RelatorioDocPage = ({ params = {} }) => {
  const cliente = CLIENTES.find(c => c.id === params.cliente) || CLIENTES[0];
  const tipo = TIPO_RELATORIO_META[params.tipo] ? params.tipo : "clima";
  const meta = TIPO_RELATORIO_META[tipo];
  const resultado = getDiagnosticoResultadoMock(cliente.id, tipo === "aep" ? "nr17" : "copsoq");
  const dims = resultado.porDimensao;
  const altoRisco = dims.filter(d => d.v >= 2.5);
  const moderado = dims.filter(d => d.v >= 1.5 && d.v < 2.5);
  const saudavel = dims.filter(d => d.v < 1.5);
  const dataGeracao = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const codigo = `${meta.codigo}-${cliente.id.toUpperCase().slice(0, 4)}-${new Date().getFullYear()}`;
  const [baixando, setBaixando] = React.useState(false);

  const baixarComoPDF = async () => {
    if (!window.html2canvas || !(window.jspdf && window.jspdf.jsPDF)) {
      window.print();
      return;
    }
    setBaixando(true);
    try {
      const el = document.querySelector(".rel-page");
      const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${codigo}_${cliente.name.replace(/\s+/g, "_")}.pdf`);
    } finally {
      setBaixando(false);
      if (params.autodownload && window.self !== window.top) {
        window.parent.postMessage({ type: "menctor-relatorio-baixado" }, window.location.origin);
      }
    }
  };

  useRelDocEffect(() => {
    if (params.autodownload) {
      const t = setTimeout(() => { baixarComoPDF(); }, 600);
      return () => clearTimeout(t);
    }
    if (params.autoprint) {
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line

  const planoDims = (altoRisco.length ? altoRisco : dims.slice(0, 3)).slice(0, 5);

  return (
    <div className="rel-root">
      <style>{REL_DOCS_CSS}</style>

      <div className="rel-toolbar no-print">
        <button onClick={() => window.history.back()} className="rel-btn rel-btn-ghost">← Voltar</button>
        <button onClick={baixarComoPDF} disabled={baixando} className="rel-btn rel-btn-primary">
          {baixando ? "Gerando…" : "⬇ Baixar PDF"}
        </button>
      </div>

      <div className="rel-page">
        <div className="rel-header">
          <div>
            <span className="rel-brand-name">menctor</span>
            <span className="rel-brand-sub">por Lector Tecnologia</span>
          </div>
          <div className="rel-doc-meta">
            <div>{codigo}</div>
            <div>{dataGeracao}</div>
          </div>
        </div>

        <div className="rel-section">
          <span className="rel-eyebrow">{meta.eyebrow}</span>
          <h1 className="rel-title">{meta.titulo}</h1>
          <p className="rel-lead">{meta.subtitulo}</p>
          <div className="rel-client-box">
            <div><label>Empresa</label><div className="val">{cliente.name}</div></div>
            <div><label>Setor</label><div className="val">{cliente.sector}</div></div>
            <div><label>Colaboradores</label><div className="val">{cliente.employees}</div></div>
            <div><label>Responsável técnico</label><div className="val">Caio Guedes — Lector Tecnologia</div></div>
          </div>
        </div>

        <div className="rel-section">
          <h2 className="rel-h2">Visão geral</h2>
          <div className="rel-stats-grid">
            <div className="rel-stat">
              <div className="num" style={{ color: relRiskColor(resultado.media) }}>{resultado.media.toFixed(2)}</div>
              <div className="label">Média geral (0–4)</div>
              <div className="sub">{resultado.media >= 2.5 ? "Acima do limite NR-1" : "Dentro do limite NR-1"}</div>
            </div>
            <div className="rel-stat">
              <div className="num">{resultado.adesao}%</div>
              <div className="label">Adesão à pesquisa</div>
              <div className="sub">{resultado.respondidos} de {resultado.alvo} colaboradores</div>
            </div>
            <div className="rel-stat">
              <div className="num" style={{ color: "#C0392B" }}>{altoRisco.length}<span style={{ fontSize: 18, color: "#8A93A6" }}> / {dims.length}</span></div>
              <div className="label">Dimensões em risco</div>
              <div className="sub">Necessitam plano de ação</div>
            </div>
          </div>
        </div>

        {tipo === "clima" && (
          <div className="rel-section">
            <h2 className="rel-h2">Dimensões COPSOQ II</h2>
            <p className="rel-p">Ordenadas do maior para o menor risco. A marca vertical indica o limite de ação NR-1 (2.5/4).</p>
            <div className="rel-dims">
              {dims.map(d => (
                <div key={d.name} className="rel-dim-row">
                  <div className="rel-dim-name">{d.name}</div>
                  <div className="rel-dim-track">
                    <div className="rel-dim-fill" style={{ width: `${(d.v / 4) * 100}%`, background: relRiskColor(d.v) }} />
                    <div className="rel-dim-limit" />
                  </div>
                  <div className="rel-dim-value">{d.v.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tipo === "matriz" && (
          <div className="rel-section">
            <h2 className="rel-h2">Matriz de classificação por severidade</h2>
            <p className="rel-p">Classificação conforme critérios da NR-1: <strong>Saudável</strong> (&lt; 1.5), <strong>Moderado</strong> (1.5 – 2.49), <strong>Alto risco</strong> (≥ 2.5).</p>
            <table className="rel-table">
              <thead><tr><th>Dimensão</th><th>Média</th><th>Classificação</th><th>Prioridade</th></tr></thead>
              <tbody>
                {dims.map(d => (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td className="rel-mono">{d.v.toFixed(2)}</td>
                    <td><span className={`rel-sev-pill ${d.v >= 2.5 ? "risk" : d.v >= 1.5 ? "warn" : "safe"}`}>{relRiskLabel(d.v)}</span></td>
                    <td>{d.v >= 2.5 ? "Imediata" : d.v >= 1.5 ? "Curto prazo" : "Monitoramento"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="rel-sev-summary">
              <div><span className="dot risk" /> {altoRisco.length} em alto risco</div>
              <div><span className="dot warn" /> {moderado.length} moderadas</div>
              <div><span className="dot safe" /> {saudavel.length} saudáveis</div>
            </div>
          </div>
        )}

        {tipo === "aep" && (
          <div className="rel-section">
            <h2 className="rel-h2">Fatores ergonômicos avaliados — NR-17</h2>
            <p className="rel-p">Classificação por fator de risco ergonômico do posto de trabalho: <strong>Adequado</strong> (&lt; 1.5), <strong>Atenção</strong> (1.5 – 2.49), <strong>Não conforme</strong> (≥ 2.5).</p>
            <table className="rel-table">
              <thead><tr><th>Fator ergonômico</th><th>Média</th><th>Classificação</th><th>Ação recomendada</th></tr></thead>
              <tbody>
                {dims.map(d => {
                  const sev = d.v >= 2.5 ? "risk" : d.v >= 1.5 ? "warn" : "safe";
                  return (
                    <tr key={d.name}>
                      <td>{d.name}</td>
                      <td className="rel-mono">{d.v.toFixed(2)}</td>
                      <td><span className={`rel-sev-pill ${sev}`}>{sev === "risk" ? "Não conforme" : sev === "warn" ? "Atenção" : "Adequado"}</span></td>
                      <td>{AEP_PRIORIDADE[sev]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="rel-sev-summary">
              <div><span className="dot risk" /> {altoRisco.length} não conformes</div>
              <div><span className="dot warn" /> {moderado.length} em atenção</div>
              <div><span className="dot safe" /> {saudavel.length} adequados</div>
            </div>
          </div>
        )}

        <div className="rel-section">
          <h2 className="rel-h2">Plano de ação recomendado</h2>
          <div className="rel-actions">
            {planoDims.map((d, i) => (
              <div key={d.name} className="rel-act-item">
                <span className="n">{i + 1}</span>
                <div>
                  <div className="t">Plano de intervenção — {d.name}</div>
                  <div className="s">Prioridade {d.v >= 2.5 ? "alta" : d.v >= 1.5 ? "média" : "baixa"} · revisão em até {d.v >= 2.5 ? 30 : d.v >= 1.5 ? 60 : 90} dias</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rel-section rel-footer">
          <div>Documento gerado automaticamente pela plataforma <strong>Menctor</strong> — Lector Tecnologia.</div>
          <div>Uso interno e confidencial · {dataGeracao}</div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { RelatorioDocPage });
