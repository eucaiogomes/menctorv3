/**
 * api-client.js
 * Cliente JavaScript para gerar relatórios psicossociais via API
 */

// Detectar URL da API baseado no environment
const getAPIURL = () => {
  // Tentar usar variável de ambiente primeiro
  if (typeof process !== 'undefined' && process.env && process.env.VITE_RELATORIO_API_URL) {
    return process.env.VITE_RELATORIO_API_URL;
  }
  // Tentar localStorage (para configuração dinâmica)
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('RELATORIO_API_URL');
    if (saved) return saved;
  }
  // Padrão local para desenvolvimento
  return "http://localhost:5000";
};

class RelatorioAPI {
  constructor(baseURL = null) {
    this.baseURL = baseURL || getAPIURL();
  }

  /**
   * Testa a conexão com o servidor
   */
  async testarConexao() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (e) {
      console.error("Erro ao conectar com servidor:", e);
      return false;
    }
  }

  /**
   * Gera um relatório com dados customizados
   * @param {Object} dados - Dados da avaliação
   * @returns {Promise<Blob>} - PDF como Blob
   */
  async gerarRelatorio(dados) {
    try {
      const response = await fetch(`${this.baseURL}/api/gerar-relatorio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar relatório");
      }

      return await response.blob();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      throw error;
    }
  }

  /**
   * Gera um relatório de teste
   * @returns {Promise<Blob>} - PDF de teste como Blob
   */
  async gerarRelatorioDeTeste() {
    try {
      const response = await fetch(`${this.baseURL}/api/teste`);

      if (!response.ok) {
        throw new Error("Erro ao gerar relatório de teste");
      }

      return await response.blob();
    } catch (error) {
      console.error("Erro ao gerar relatório de teste:", error);
      throw error;
    }
  }

  /**
   * Baixa um PDF (helper)
   * @param {Blob} pdfBlob - PDF como Blob
   * @param {String} filename - Nome do arquivo
   */
  static baixarPDF(pdfBlob, filename = "relatorio.pdf") {
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }

  /**
   * Prepara dados de uma avaliação para envio
   * @param {Object} avaliacao - Objeto com dados da avaliação
   * @param {Array} dimensoes - Array com dimensões COPSOQ
   * @returns {Object} - Dados formatados para API
   */
  static prepararDados(avaliacao, dimensoes) {
    return {
      codigo: avaliacao.code || "PCL-Q2",
      titulo_linha1: "Pesquisa de Clima Organizacional —",
      titulo_linha2: avaliacao.periodo?.split("—")[0].trim() || "2° Trimestre/2026",
      descricao: "Pesquisa trimestral combinando dimensões COPSOQ II com indicadores de clima e engajamento.",
      periodo: avaliacao.periodo || "Abril a Junho - 2026",
      aplicacao: avaliacao.periodo || "15/04/2026 a 30/04/2026",
      responsavel: "Comite de Pessoas & Cultura",
      respondentes: avaliacao.respondidos || 0,
      total_colaboradores: avaliacao.alvo || 0,
      taxa_adesao: `${avaliacao.adesao}%`,
      foco: "Toda a organização",
      emissao: new Date().toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }),
      empresa: avaliacao.cliente || "Empresa",
      cnpj: avaliacao.cnpj || "XX.XXX.XXX/0001-XX",
      endereco: avaliacao.endereco || "—",
      data_avaliacao: new Date().toLocaleDateString("pt-BR"),
      rt_nome: "Caio Guedes",
      rt_registro: "CRP-06/12345",
      rt_especialidade: "Psicologia Organizacional",
      rt_contato: "(11) 99999-9999",
      output_filename: `relatorio_${avaliacao.code || "relatorio"}_${Date.now()}.pdf`,
      dimensoes: dimensoes.map(d => ({
        nome: d.name,
        score: d.v,
      })),
    };
  }

  /**
   * Define a URL da API (útil para mudanças em runtime)
   * @param {String} url - Nova URL da API
   */
  setBaseURL(url) {
    this.baseURL = url;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('RELATORIO_API_URL', url);
    }
  }
}

// Exportar para uso global
if (typeof window !== "undefined") {
  window.RelatorioAPI = RelatorioAPI;
}

// Para uso em Node.js (módulo)
if (typeof module !== "undefined" && module.exports) {
  module.exports = RelatorioAPI;
}
