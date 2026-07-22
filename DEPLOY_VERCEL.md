# 🚀 Guia de Deploy no Vercel

## Visão Geral

Este projeto é uma aplicação React HTML/Vanilla JavaScript com um backend Python Flask para gerar relatórios psicossociais em PDF.

## Arquitetura

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend)                │
│    Menctor Sistema - Interface Web       │
│   (HTML + React + JavaScript)            │
└──────────────┬──────────────────────────┘
               │ CORS + API Calls
               ▼
┌─────────────────────────────────────────┐
│    Backend Python (Separado)             │
│   Flask API + ReportLab (Gerador PDF)   │
│   (Precisa ser deployed em outro lugar)  │
└─────────────────────────────────────────┘
```

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Repositório no GitHub (já feito ✅)
3. Backend Flask rodando em um servidor separado (Heroku, Railway, etc.)

## 🔧 Configuração no Vercel

### Opção 1: Deploy Automático via GitHub (Recomendado)

1. Acesse [https://vercel.com/import](https://vercel.com/import)
2. Clique em "Continue with GitHub"
3. Selecione o repositório `menctor-sistema`
4. Configure as variáveis de ambiente:
   - `VITE_RELATORIO_API_URL`: URL do seu backend Flask

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

## 🔐 Variáveis de Ambiente

Configure no Vercel Dashboard → Settings → Environment Variables:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_RELATORIO_API_URL` | URL da API Python | `https://seu-api.herokuapp.com` |
| `VITE_APP_URL` | URL da aplicação | `https://seu-app.vercel.app` |

## 🐍 Backend Python (Separado)

O servidor Flask precisa ser deployed em um serviço diferente:

### Opção A: Heroku

```bash
# Login no Heroku
heroku login

# Criar app
heroku create seu-app-name

# Adicionar buildpack Python
heroku buildpacks:add heroku/python

# Deploy
git push heroku main
```

### Opção B: Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Opção C: Render

1. Acesse [https://render.com](https://render.com)
2. Create New → Web Service
3. Conectar repositório GitHub
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python server.py`

## 📝 Configuração CORS para Produção

Quando o frontend e backend estão em domínios diferentes, atualize `server.py`:

```python
from flask_cors import CORS

# Em produção:
CORS(app, resources={
    r"/api/*": {"origins": [
        "https://seu-app.vercel.app",
        "https://seu-outro-dominio.com"
    ]}
})
```

## 🧪 Testes Após Deploy

1. Abra seu app no Vercel
2. Navegue para uma avaliação
3. Clique em "Relatório PDF"
4. Verifique se o PDF é baixado corretamente

## 🔗 URLs Importantes

- **GitHub:** https://github.com/eucaiogomes/menctor-sistema
- **Vercel (depois de fazer deploy):** https://seu-app.vercel.app
- **Backend API:** Configure na variável de ambiente

## ⚠️ Troubleshooting

### CORS Error
- Verifique a URL da API nas variáveis de ambiente
- Certifique-se que CORS está configurado no backend

### PDF não funciona
- Teste a API separadamente: `curl https://seu-api.herokuapp.com/health`
- Verifique logs do backend

### 404 ao clicar no botão
- Verifique que o servidor Flask está rodando
- Valide a URL no navegador (DevTools Console)

## 📚 Referências

- [Vercel Docs](https://vercel.com/docs)
- [Heroku Docs](https://devcenter.heroku.com/)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)

## 🎯 Próximos Passos

1. Deploy o backend em Heroku/Railway/Render
2. Obter URL do backend
3. Configurar variável de ambiente no Vercel
4. Testar download de PDF

## 💡 Dica

Para desenvolvimento local:
```bash
# Terminal 1 - Backend
python server.py

# Terminal 2 - Frontend (se precisar de servidor local)
python -m http.server 3000
```

Bom deploy! 🚀
