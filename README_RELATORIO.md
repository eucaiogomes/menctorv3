# Gerador de Relatório Psicossocial

Sistema completo para geração de relatórios psicossociais em PDF usando COPSOQ II.

## Instalação

### 1. Instalar dependências Python

```bash
pip install -r requirements.txt
```

### 2. Iniciar o servidor

```bash
python server.py
```

O servidor iniciará em `http://localhost:5000`

## Uso

### Via Interface Web

1. Abra a aplicação web
2. Navegue até o detalhe de um diagnóstico
3. Clique no botão "Relatório PDF"
4. O relatório será gerado e baixado automaticamente

### Via API REST

#### Endpoint: POST `/api/gerar-relatorio`

**URL:** `http://localhost:5000/api/gerar-relatorio`

**Body (JSON):**

```json
{
  "empresa": "Nome da Empresa",
  "cnpj": "XX.XXX.XXX/0001-XX",
  "endereco": "Endereço da empresa",
  "data_avaliacao": "DD/MM/YYYY",
  "respondentes": 100,
  "total_colaboradores": 120,
  "taxa_adesao": "83.3%",
  "periodo": "Janeiro a Março - 2026",
  "aplicacao": "10/03/2026 a 28/03/2026",
  "foco": "Toda a organização",
  "responsavel": "Nome do Comite",
  "rt_nome": "Nome do Psicólogo",
  "rt_registro": "CRP-XX/XXXXX",
  "rt_especialidade": "Psicologia Organizacional",
  "rt_contato": "(11) 99999-9999",
  "dimensoes": [
    {
      "nome": "Carga de trabalho",
      "score": 3.12
    },
    {
      "nome": "Burnout",
      "score": 2.95
    },
    {
      "nome": "Estresse",
      "score": 2.88
    },
    {
      "nome": "Conflito trabalho-família",
      "score": 2.74
    },
    {
      "nome": "Ritmo de trabalho",
      "score": 2.68
    },
    {
      "nome": "Reconhecimento",
      "score": 2.51
    },
    {
      "nome": "Suporte social",
      "score": 2.42
    },
    {
      "nome": "Qualidade da liderança",
      "score": 2.38
    },
    {
      "nome": "Justiça e respeito",
      "score": 2.20
    },
    {
      "nome": "Influência no trabalho",
      "score": 2.15
    },
    {
      "nome": "Comunidade social",
      "score": 1.88
    },
    {
      "nome": "Significado do trabalho",
      "score": 1.72
    }
  ]
}
```

**Resposta:** Arquivo PDF para download

#### Endpoint: GET `/api/teste`

Gera um relatório com dados de teste padrão (útil para testes).

**URL:** `http://localhost:5000/api/teste`

#### Endpoint: GET `/health`

Verifica se o servidor está ativo.

**URL:** `http://localhost:5000/health`

## Estrutura do Relatório

O relatório gerado contém:

1. **Capa** - Com informações da pesquisa e dados da empresa
2. **Introdução** - Contextualização do COPSOQ II
3. **Dados da Empresa** - Informações identificatórias
4. **Metodologia** - Descrição do instrumento usado
5. **Resumo Executivo** - KPIs principais
6. **Ranking de Dimensões** - Gráficos com scores
7. **Análise Técnica** - Interpretação de cada dimensão
8. **Plano de Ação** - Recomendações e próximos passos
9. **Metodologia e Referências** - Fundamentação técnica
10. **Análise Global** - Consolidação de resultados
11. **Recomendações por Domínio** - Estratégias práticas
12. **Conclusão** - Fechamento técnico

## Configurações

### Variáveis de Ambiente (Opcional)

```bash
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000
```

### Alterando Porta

Para usar uma porta diferente, modifique a última linha de `server.py`:

```python
app.run(debug=True, port=8080, host='127.0.0.1')
```

## Troubleshooting

### Erro: "Módulo reportlab não encontrado"

```bash
pip install reportlab
```

### Erro: "Conexão recusada em localhost:5000"

Certifique-se de que o servidor está rodando:

```bash
python server.py
```

### Erro: "CORS policy blocked"

Se o frontend estiver em outro domínio, certifique-se que Flask-CORS está instalado:

```bash
pip install Flask-CORS
```

## Desenvolvimento

### Estrutura dos Arquivos

- `gerar_relatorio_psicossocial.py` - Gerador de PDF com ReportLab
- `server.py` - Servidor Flask com API REST
- `screens/diagnostico-detalhe.jsx` - Interface web para download
- `requirements.txt` - Dependências Python

### Customização

Para customizar o relatório:

1. Edite `CONFIG` em `gerar_relatorio_psicossocial.py`
2. Ou envie dados customizados via API

## Performance

- Geração média de relatório: 2-5 segundos
- Tamanho típico de PDF: 500-800 KB
- Recomenda-se usar em navegadores modernos

## Segurança

- O servidor está configurado para CORS (para desenvolvimento)
- Em produção, configure CORS adequadamente
- Valide todos os dados de entrada
- Use HTTPS em produção

## Licença

© 2026 Menctor Ferramentar

## Contato

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.
