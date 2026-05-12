# Zornik -- SDLC Monitoring Dashboard

Zornik je white-label SDLC monitoring dashboard, ktery sjednocuje signaly z verzovani, CI/CD, testu, releasu, observability a feedbacku do jednoho prehledu.

## Rychly start

```bash
git clone git@github.com:qa-wave/qa-monitoring.git
cd qa-monitoring
npm install
npm run dev    # http://localhost:3000
```

Demo pristupy:
- **Admin:** admin@example.com / demo
- **Viewer:** viewer@example.com / demo

## Stack

- **Framework:** Next.js 16 (App Router, RSC), React 19, TypeScript
- **Styling:** Tailwind CSS v4 + Radix UI + CVA
- **Hosting:** Vercel (Fluid Compute)
- **Persistence:** Vercel Blob (prod) / lokalni JSON (dev)
- **Auth:** Cookie session, bcrypt + HMAC

## Struktura projektu

```
src/
├── app/                    # Next.js App Router stranky
│   ├── (dashboard)/        # Autentizovane stranky
│   │   ├── page.tsx        # Prehled (overview dashboard)
│   │   ├── environments/   # Prostredi
│   │   ├── applications/   # Aplikace
│   │   ├── releases/       # Releasy
│   │   ├── tests/          # Testy
│   │   ├── incidents/      # Incidenty
│   │   ├── quality/        # Kvalita & bezpecnost
│   │   ├── product/        # Produktove metriky
│   │   └── admin/          # Admin sekce
│   ├── api/                # API routes
│   ├── login/              # Login stranka
│   └── status/             # Verejna status stranka
├── components/
│   ├── ui/                 # Radix + CVA primitives
│   ├── layout/             # AppShell, Sidebar, Header
│   └── dashboard/          # KpiCard, StatusMatrix, DoraCard...
├── lib/
│   ├── auth.ts             # Autentizace + RBAC
│   ├── rbac.ts             # Role a opravneni
│   ├── storage.ts          # Vercel Blob / lokalni JSON
│   ├── db.ts               # Postgres (Neon) klient
│   ├── export.ts           # CSV export
│   ├── alerts.ts           # Alert pravidla
│   ├── i18n/               # Internacionalizace (CZ/EN)
│   ├── branding/           # White-label konfigurace
│   ├── integrations/       # Provider registry + adaptery
│   ├── notifications/      # Slack webhooky
│   └── users/              # User store
└── data/                   # Fixture data (MVP)
```

## Features

### Dashboard
- **Persona-aware widgety** -- Vyvojar, Product Owner, Tester, Vsechno
- **DORA metriky** -- Deploy frequency, Lead time, Change failure rate, MTTR
- **Deploy heatmapa** -- GitHub-style contribution graph
- **Service map** -- Radial SVG vizualizace zavislosti
- **Drag & drop** -- Prerazeni widgetu na dashboardu
- **Saved views** -- Ulozeni filtru jako zalozka

### 10 vizualnich temat
Vercel, Linear, Grafana, Datadog, Stripe, GitHub, Notion, Supabase, PlanetScale, Railway

Prepinani pres ikonu stetce v headeru (instant, client-side).

### Integrace (Provider Registry)
Realne adaptery: GitHub, Vercel, Sentry, PagerDuty
Mock adaptery: 18 dalsich (GitLab, Jira, Datadog, Slack...)

### RBAC
3 systemove role: Admin, Operator, Viewer
16 granularnich opravneni

### i18n
Cestina (default) + anglictina. Prepinac v headeru.

### API
- POST /api/auth/login -- prihlaseni
- POST /api/auth/logout -- odhlaseni
- GET/PUT /api/branding -- brand settings
- GET/POST /api/users -- CRUD uzivatelu
- GET/PATCH/DELETE /api/users/[id]
- GET/POST /api/integrations -- CRUD integraci
- GET/PATCH/DELETE /api/integrations/[id]
- POST /api/integrations/[id]/test -- test pripojeni
- GET /api/status/public -- verejny status (ISR 30s)
- POST /api/status/subscribe -- email odber
- POST /api/webhooks/github -- GitHub webhook
- POST /api/webhooks/sentry -- Sentry webhook
- GET /api/stream/health -- SSE health stream
- GET /api/cron/health-check -- Vercel Cron
- GET /api/db/migrate -- DB migrace
- GET /api/health -- health check

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
npm test             # Jest
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
| BLOB_READ_WRITE_TOKEN | Vercel Blob token | Auto (Vercel) |
| DATABASE_URL | Postgres (Neon) connection string | Ne |
| GITHUB_WEBHOOK_SECRET | GitHub webhook HMAC secret | Ne |
| SENTRY_WEBHOOK_SECRET | Sentry webhook secret | Ne |
| SLACK_WEBHOOK_URL | Slack incoming webhook URL | Ne |
| CRON_SECRET | Secret pro Vercel Cron auth | Ne |

## White-label

Vse zakaznicky specificke je v `/admin/branding`:
- Jmeno produktu a zakaznika
- 3 brand barvy (primary, secondary, tertiary)
- 1 z 10 vizualnich stylu

CSS tokeny: `--brand-primary`, `--brand-secondary`, `--brand-tertiary`
