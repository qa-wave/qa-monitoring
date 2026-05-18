# Zornik -- SDLC Monitoring Dashboard

Zornik je white-label SDLC monitoring dashboard, ktery sjednocuje signaly z verzovani, CI/CD, testu, releasu, observability a feedbacku do jednoho prehledu.

## Rychly start

```bash
git clone git@github.com:qa-wave/qa-monitoring.git
cd qa-monitoring
cp .env.example .env.local
npm install
npm run dev    # http://localhost:3000
```

Demo pristupy:
- **Admin:** admin@example.com / demo
- **Viewer:** viewer@example.com / demo

## Stack

- **Framework:** Next.js 16 (App Router, RSC), React 19, TypeScript
- **Styling:** Tailwind CSS v4 + Radix UI + CVA
- **Hosting:** Vercel (Fluid Compute), Node.js 24 LTS
- **Persistence:** Vercel Blob (prod) / lokalni JSON (dev)
- **Auth:** Cookie session, bcrypt + HMAC, 3 role (Admin, Operator, Viewer)
- **Logging:** Structured JSON logger (stdout)
- **Analytics:** Vercel Analytics

## Struktura projektu

```
src/
├── app/                    # Next.js App Router stranky
│   ├── (dashboard)/        # Autentizovane stranky
│   │   ├── page.tsx        # Prehled (overview dashboard)
│   │   ├── environments/   # Prostredi (CRUD)
│   │   ├── applications/   # Aplikace (CRUD)
│   │   ├── releases/       # Releasy + detail stranka
│   │   ├── tests/          # Testy (s filtry)
│   │   ├── incidents/      # Incidenty (s filtry)
│   │   ├── quality/        # Kvalita & bezpecnost
│   │   ├── product/        # Produktove metriky
│   │   └── admin/          # Admin sekce (users, branding, integrations, alerts, audit)
│   ├── api/                # API routes (s paginaci)
│   ├── login/              # Login stranka
│   └── status/             # Verejna status stranka
├── components/
│   ├── ui/                 # Radix + CVA primitives
│   ├── layout/             # AppShell, Sidebar, Header
│   └── dashboard/          # KpiCard, StatusMatrix, DoraCard...
├── lib/
│   ├── auth.ts             # Autentizace + session
│   ├── rbac.ts             # RBAC -- 3 role, 17 granularnich opravneni
│   ├── logger.ts           # Structured JSON logger
│   ├── storage.ts          # Postgres / Vercel Blob / lokalni JSON
│   ├── db.ts               # Postgres (Neon) klient
│   ├── export.ts           # CSV export
│   ├── alerts/             # Alert pravidla + evaluation engine
│   ├── audit/              # Audit log s automatickym logovanim
│   ├── applications/       # Application store (CRUD)
│   ├── environments/       # Environment store (CRUD)
│   ├── i18n/               # Internacionalizace (CZ/EN)
│   ├── branding/           # White-label konfigurace
│   ├── integrations/       # Provider registry + adaptery (s retry + rate limiting)
│   ├── notifications/      # Slack webhooky
│   └── users/              # User store
└── data/                   # Fixture data (MVP)
```

## Testy

- **76 unit testu** (Jest) -- 16 test suites, ~2s
- **E2E testy** (Playwright) -- kriticke user flows

```bash
npm test             # Unit testy
npm run test:e2e     # E2E testy
```

## Features

### Dashboard
- **Persona-aware widgety** -- Vyvojar, Product Owner, Tester, Vsechno
- **DORA metriky** -- Deploy frequency, Lead time, Change failure rate, MTTR
- **Deploy heatmapa** -- GitHub-style contribution graph
- **Service map** -- Radial SVG vizualizace zavislosti
- **Drag & drop** -- Prerazeni widgetu na dashboardu
- **Saved views** -- Ulozeni filtru jako zalozka

### Full CRUD pro vsechny entity
- **Aplikace** -- vytvoreni, editace, smazani, filtrovani
- **Prostredi** -- vytvoreni, editace, smazani, razeni
- **Uzivatele** -- vytvoreni, editace, smazani, zmena role
- **Integrace** -- vytvoreni, editace, smazani, test pripojeni
- **Alert pravidla** -- vytvoreni, editace, smazani, zapnuti/vypnuti

### Filtry
- **Incidenty** -- filtr dle severity, stavu, aplikace
- **Testy** -- filtr dle stavu, aplikace, prostredi
- **Aplikace** -- filtr dle tagu, jazyka

### Release detail
Samostatna stranka s detailem releasu -- changelog, deploye, testy, rollback info.

### Alert pravidla + evaluation engine
- Definice pravidel na metriky (latency, errorRate, uptime, deployFailRate, flakyTests)
- Operatory gt/lt/eq s prahem
- Notifikacni kanaly: email, Slack, oba
- Automaticke vyhodnoceni

### Audit log
- Automaticke logovani vsech admin akci (CRUD operaci)
- Prohledavatelny log s casovymi razitky
- Kdo, co, kdy, na cem

### 10 vizualnich temat
1. Vercel
2. Linear
3. Grafana
4. Datadog
5. Stripe
6. GitHub
7. Notion
8. Supabase
9. PlanetScale
10. Railway

Prepinani pres ikonu stetce v headeru (instant, client-side).

### Integrace (Provider Registry)
Realne adaptery s retry logikou a rate limit handling:
- **GitHub** -- releasy + Actions workflow runs
- **Vercel** -- deploye a jejich stav
- **Sentry** -- unresolved issues, pocty, affected users
- **PagerDuty** -- incidenty

Mock adaptery: 18 dalsich (GitLab, Jira, Datadog, Slack...)

### RBAC
3 systemove role:
- **Admin** -- plny pristup (17 opravneni)
- **Operator** -- cteni + sprava incidentu a integraci
- **Viewer** -- pouze cteni dashboardu a dat

17 granularnich opravneni: dashboard:view, environments:view, applications:view, releases:view, tests:view, incidents:view, incidents:manage, quality:view, product:view, status:view, integrations:view, integrations:manage, branding:manage, users:view, users:manage, audit:view, alerts:manage

### i18n
Cestina (default) + anglictina. Prepinac v headeru.

### API (s paginaci)
Vsechny list endpointy podporuji `?limit=N&offset=M` a vracejici `X-Total-Count` hlavicku.

- POST /api/auth/login -- prihlaseni
- POST /api/auth/logout -- odhlaseni
- GET/PUT /api/branding -- brand settings
- GET/POST /api/users -- CRUD uzivatelu
- GET/PATCH/DELETE /api/users/[id]
- GET/POST /api/applications -- CRUD aplikaci
- GET/PATCH/DELETE /api/applications/[id]
- GET/POST /api/environments -- CRUD prostredi
- GET/PATCH/DELETE /api/environments/[id]
- GET/POST /api/alerts -- CRUD alert pravidel
- PATCH/DELETE /api/alerts/[id]
- GET /api/audit -- audit log (read-only)
- GET/POST /api/integrations -- CRUD integraci
- GET/PATCH/DELETE /api/integrations/[id]
- POST /api/integrations/[id]/test -- test pripojeni
- POST /api/integrations/[id]/sync -- sync jedne integrace do ingest store
- POST /api/integrations/sync -- sync vsech aktivnich integraci
- GET /api/status/public -- verejny status (ISR 30s)
- POST /api/status/subscribe -- email odber
- POST /api/webhooks/github -- GitHub webhook
- POST /api/webhooks/sentry -- Sentry webhook
- GET /api/stream/health -- SSE health stream
- GET /api/cron/health-check -- Vercel Cron
- GET /api/cron/ingest -- Vercel Cron pro sync integraci
- GET /api/db/migrate -- DB migrace
- GET /api/health -- health check

### Structured Logging
JSON logger s levely debug/info/warn/error. Kazdy log entry obsahuje timestamp a volitelna metadata.

### Vercel Analytics
Automaticky sledovani vykonnosti a navstevnosti (zapnuto na Vercel).

### Keyboard Shortcuts
- Cmd+K / Ctrl+K -- Command palette
- g then h -- Go home
- g then i -- Go incidents
- g then t -- Go tests
- g then r -- Go releases
- g then e -- Go environments
- g then a -- Go applications
- g then q -- Go quality
- ? -- Zobrazit napovedu

## Skripty

```bash
npm run dev          # Dev server (:3000)
npm run build        # Produkcni build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Jest (76 testu)
npm run test:e2e     # Playwright

vercel deploy --yes              # Preview deploy
vercel deploy --prod --yes       # Produkcni deploy
```

## Deploy

Produkce: https://qa-monitoring.qawave.ai

```bash
npm run typecheck && npm run lint && npm test  # Vzdy pred deployem
vercel deploy --prod --yes
```

## Environment Variables

| Promenna | Popis | Povinna |
|---|---|---|
| SESSION_SECRET | HMAC secret pro cookie session | Ano (prod) |
| INTEGRATION_ENC_KEY | Sifrovaci klic pro integration credentials | Ano (prod) |
| BLOB_READ_WRITE_TOKEN | Vercel Blob token | Auto (Vercel) |
| DATABASE_URL | Postgres (Neon) connection string; aktivuje app_storage backend | Ne |
| GITHUB_WEBHOOK_SECRET | GitHub webhook HMAC secret | Ne |
| SENTRY_WEBHOOK_SECRET | Sentry webhook secret | Ne |
| SLACK_WEBHOOK_URL | Slack incoming webhook URL | Ne |
| CRON_SECRET | Secret pro Vercel Cron auth | Ne |
| VERCEL_ANALYTICS_ID | Vercel Analytics ID | Auto (Vercel) |

Viz `.env.example` pro kompletni sablonu.

## White-label

Vse zakaznicky specificke je v `/admin/branding`:
- Jmeno produktu a zakaznika
- 3 brand barvy (primary, secondary, tertiary)
- 1 z 10 vizualnich stylu

CSS tokeny: `--brand-primary`, `--brand-secondary`, `--brand-tertiary`
