# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Menctor is a web app for managing corporate psychosocial-risk assessments (COPSOQ II / NR-1 compliance) for a Brazilian consultancy ("Lector Tecnologia"). It has three user experiences — **credenciado** (consultant), **admin**, and **aluno** (student/employee taking a course) — plus a PDF report generator and an e-mail sender.

## Running it locally

There is no build step, no bundler, and no `package.json`. The frontend is plain React 18 + Babel Standalone loaded from CDN `<script>` tags in `index.html`; JSX is transpiled in the browser at request time.

**Frontend only** (mock data, no PDF/e-mail backend):
```bash
npx serve .
```
(matches `.claude/launch.json`, serves on port 3000; any static file server works, e.g. `python -m http.server 3000`)

**Frontend + Python backend** (PDF generation, e-mail sending, needed for `diagnostico-detalhe` report download and invite e-mails):
```bash
pip install -r requirements.txt
python server.py
```
Serves everything (static frontend + API) from `http://localhost:5000`. `server.py` reads a local `.env` file itself (no `python-dotenv` dependency — see `load_env_file()`), so copy `.env.example` to `.env` and fill in `MAIL_*` for e-mail sending to work.

**Smoke-testing the report API** (requires `python server.py` running):
```bash
python test_api.py
```
This is a plain `requests`-based script (prints `[OK] PASSOU: ...`), not a pytest suite — there is no automated test runner in this repo.

## Architecture

### No modules — everything is a global

Files are NOT ES modules. There are no `import`/`export` statements. Every `.jsx` file defines top-level `const`/`function` components that become implicit globals once the `<script type="text/babel">` tag runs, and other files reference them directly. The `/* global Foo, Bar */` comment at the top of each file is a lint annotation documenting which globals it consumes — check it before assuming a file is self-contained.

**Load order in `index.html` matters and is the source of truth for dependencies**: `components.jsx` (shared UI/icons/sidebar) → `supabase-client.js` → `data.jsx` (mock data) → each `screens/*.jsx` → `app.jsx` (router, mounted last). If you add a new screen or shared component, register its `<script>` tag in `index.html` in the right position, and add it to `sw.js`-equivalent caching if one exists.

Query strings on script tags (`?v=20260703a`) are manual cache-busters — bump them when editing a file if the user reports stale content in the browser.

### Routing

`app.jsx` implements its own client-side router — there is no react-router. `ROUTE_PATHS`/`PATH_ROUTES` map screen names to URL paths, `parseCurrentRoute()` reads `window.location`, and `navigate()` uses `window.history.pushState`. Role (`credenciado` / `admin` / `aluno`) is derived from the URL prefix (`/admin`, `/aluno`) and gates which screens and sidebar are rendered — see the three branches near the bottom of `App()`.

### Data layer

- `data.jsx` holds hardcoded mock data (`CLIENTES`, `DIAGNOSTICOS`, `COPSOQ_DIMS`, `AVALIACOES_ATIVAS`, `LEADS_PIPELINE`, `TRILHAS`, roadmap templates, etc.) used directly by most screens — there is no generic API layer for this data yet.
- `supabase-client.js` talks to Supabase via raw `fetch` against the REST endpoint (`/rest/v1/...`) — it does **not** use the `@supabase/supabase-js` SDK. It currently only backs the **pipeline** feature (`MenctorDB.listPipelineCards`/`upsertPipelineCard`/`updatePipelineStage`, attached to `window.MenctorDB`), converting between snake_case DB rows and camelCase app shapes (`toDbCard`/`toAppCard`). `supabase-schema.sql` defines the `pipeline_cards` table; its RLS policies allow full anon access (`_test` suffix) — tighten before real production use.
- The Supabase URL/anon key are hardcoded in `supabase-client.js` (fine for a publishable anon key, but don't add service-role keys to frontend files).

### Styling

`tokens.css` defines the design-token layer (CSS custom properties: brand colors, neutrals, semantic colors) for the Lector brand; `styles.css` consumes those tokens. `app.jsx`'s `TWEAK_DEFAULTS` block is wrapped in `/*EDITMODE-BEGIN*/ ... /*EDITMODE-END*/` markers — this is a machine-editable region for a design tool to swap theme values (accent role, density, headline font); preserve those markers exactly when touching that block.

### Backends (two separate Python surfaces — don't conflate them)

1. **`server.py`** (Flask, `requirements.txt`): local dev server. Serves the static frontend, plus `/health`, `/api/send-email`, `/api/gerar-relatorio`, `/api/teste`. Imports the PDF logic from `gerar_relatorio_psicossocial.py`.
2. **`api/send-email.py`**: a separate, dependency-free Vercel **serverless function** (stdlib `http.server.BaseHTTPRequestHandler`, not Flask) that duplicates the send-email logic for production, since Vercel only hosts the frontend per `vercel.json` (`buildCommand` is a no-op echo). If you change e-mail-sending behavior, update **both** `server.py`'s `/api/send-email` route and `api/send-email.py` — they are not shared code.
3. **`gerar_relatorio_psicossocial.py`**: standalone ReportLab PDF generator (largest file in the repo, ~1400 lines) producing the multi-page psychosocial report. Per `DEPLOY_VERCEL.md`, this whole Flask backend needs a separate host in production (Heroku/Railway/Render) since Vercel here is frontend-only — there is no serverless equivalent of PDF generation the way there is for e-mail.

### Deployment

Vercel (`vercel.json`) hosts only the static frontend with SPA-style rewrites to `index.html`, except paths under `/api/*` or containing a file extension. The Flask backend (`server.py` + PDF generator) must be deployed separately and pointed to via the `VITE_RELATORIO_API_URL` env var; see `DEPLOY_VERCEL.md` for the full split-deploy rationale and provider-specific steps.

## Language convention

UI copy, data, comments, and most commit messages are in Brazilian Portuguese (domain terms: *diagnóstico*, *avaliação*, *colaborador*, *credenciado*). Match this when writing user-facing strings or content in this repo; code identifiers are a mix of English and Portuguese, follow the existing convention in whichever file you're editing.
