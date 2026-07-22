# 📋 Setup - Gerador de Relatório Psicossocial

## 🎯 O que foi implementado

Um sistema completo para gerar e baixar relatórios psicossociais em PDF com base nos dados das avaliações COPSOQ II.

### Componentes

1. **Backend Python (Flask)**
   - Servidor API REST em `server.py`
   - Serviço de geração de PDF usando ReportLab
   - Endpoints para gerar e retornar PDFs

2. **Frontend JavaScript (React)**
   - Integração no `screens/diagnostico-detalhe.jsx`
   - Função para chamar a API
   - Download automático do PDF no navegador
   - Cliente reutilizável em `api-client.js`

3. **Gerador de PDF**
   - Script principal em `gerar_relatorio_psicossocial.py`
   - Relatório com 13 páginas estruturadas
   - Customizável com dados de qualquer avaliação

## 🚀 Como usar

### 1. Instalação

```bash
# Instalar dependências Python
pip install -r requirements.txt
```

### 2. Iniciar o servidor

Abra um terminal na pasta do projeto:

```bash
python server.py
```

Você verá:
```
🚀 Servidor de Relatórios Psicossociais iniciado!
   Acesse http://localhost:5000/health para verificar o status
   ...
   Running on http://127.0.0.1:5000
```

### 3. Usar na aplicação web

Na interface web, navegue até uma avaliação (Diagnósticos > Detalhe) e clique no botão "Relatório PDF".

O PDF será gerado e baixado automaticamente.

## 📊 Testes

Para testar a API:

```bash
python test_api.py
```

Resultado esperado:
```
[OK] PASSOU: Health Check
[OK] PASSOU: Relatório de Teste
[OK] PASSOU: Relatório Customizado
```

## 🔗 Endpoints da API

### Health Check
```
GET /health
```

### Gerar Relatório
```
POST /api/gerar-relatorio
Content-Type: application/json

{
  "empresa": "Nome da Empresa",
  "respondentes": 100,
  "total_colaboradores": 120,
  "dimensoes": [
    {"nome": "Carga de trabalho", "score": 3.12},
    ...
  ]
}
```

### Teste Rápido
```
GET /api/teste
```

## 📁 Arquivos criados/modificados

### Novos arquivos
- `server.py` - Servidor Flask
- `api-client.js` - Cliente JavaScript reutilizável
- `test_api.py` - Script de testes
- `requirements.txt` - Dependências Python
- `README_RELATORIO.md` - Documentação detalhada
- `SETUP.md` - Este arquivo

### Arquivos modificados
- `gerar_relatorio_psicossocial.py` - Melhorado para suportar output_path customizado
- `screens/diagnostico-detalhe.jsx` - Integração com API

## ⚙️ Configuração

O servidor roda por padrão em:
- **Host:** 127.0.0.1 (localhost)
- **Port:** 5000
- **URL:** http://localhost:5000

Para alterar porta ou host, edite a última linha de `server.py`:

```python
app.run(debug=True, port=8080, host='0.0.0.0')
```

## 🐛 Troubleshooting

### Porta 5000 já está em uso

```bash
# Altere a porta em server.py
# Ou encerre o processo usando a porta:
netstat -ano | findstr :5000  # Ver processo
taskkill /PID <PID> /F         # Encerrar
```

### CORS Error no navegador

Certifique-se que `Flask-CORS` está instalado:

```bash
pip install Flask-CORS
```

### PDF vazio ou malformado

1. Verifique os logs do servidor
2. Teste com `/api/teste` primeiro
3. Valide os dados JSON enviados

## 📈 Performance

- Geração média: 2-5 segundos
- Tamanho do PDF: 30-50 KB
- Suporta até 50 dimensões diferentes

## 🔐 Segurança

**Em desenvolvimento:** CORS está habilitado para todos os domínios

**Em produção:**
1. Adicione validação mais rigorosa
2. Configure CORS adequadamente
3. Use HTTPS
4. Implemente autenticação

Exemplo de CORS restritivo:

```python
from flask_cors import CORS
CORS(app, resources={
    r"/api/*": {"origins": ["https://seu-dominio.com"]}
})
```

## 💡 Dicas de uso

1. **Teste primeiro:** Use `/api/teste` para validar que o servidor está funcionando

2. **Dados customizados:** Preparar dados no formato JSON antes de enviar

3. **Cliente reutilizável:** Use `RelatorioAPI` em `api-client.js` para chamar a API de qualquer lugar

4. **Monitorar logs:** Verifique os logs do servidor para diagnosticar problemas

## 📞 Suporte

Verifique o arquivo `README_RELATORIO.md` para documentação mais detalhada sobre:
- Estrutura completa do relatório
- Customizações avançadas
- Integração em produção

## 🎓 Próximos passos

1. Testar a aplicação web clicando no botão "Relatório PDF"
2. Verificar se o PDF é baixado corretamente
3. Validar conteúdo do PDF gerado
4. Adaptar layout conforme necessário

Bom uso! 🎉
