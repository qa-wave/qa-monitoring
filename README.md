# qa-app

Dashboard pro sledování stavu vývojových prostředí napříč aplikacemi. Čtyři cílové skupiny: vývojář, product owner, tester, koncový uživatel.

## Tech stack

- Next.js 16 (App Router, React Server Components)
- React 19 + TypeScript
- Tailwind v4 + Radix UI + class-variance-authority
- Jednoduchá cookie session (role viewer/admin)
- Jest + React Testing Library + Playwright

## Rychlý start

```bash
npm install
cp .env.example .env.local
npm run dev
# otevři http://localhost:3000
```

Demo přihlášení:

- **viewer** — `viewer@example.com` / `demo`
- **admin** — `admin@example.com` / `demo`

Hesla jsou hashována přes bcrypt (10 rounds). Seed vytvoří `.data/users.json`
s bcrypt hashem `demo` pro všech 6 fixture účtů; v admin UI (viz
`/admin/users`) lze heslo změnit nebo vytvořit nového uživatele s vlastním
heslem (min. 6 znaků).

## Dostupné skripty

| Skript | Účel |
|---|---|
| `npm run dev` | Lokální development server |
| `npm run build` | Produkční build |
| `npm run start` | Spustit produkční build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest unit/snapshot testy |
| `npm run test:e2e` | Playwright smoke test |

## Struktura

```
src/
├── app/                    # App Router routy
│   ├── (dashboard)/        # Autentizované interní stránky se sdíleným AppShell
│   ├── status/             # Veřejná status stránka (neautentizovaná)
│   ├── admin/              # Admin sekce (role admin)
│   ├── login/              # Login
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Radix + CVA primitives
│   ├── layout/             # AppShell, Sidebar, Header
│   └── dashboard/          # Feature-specific widgets
├── lib/
│   ├── auth.ts             # cookie session + role helpers
│   ├── integrations/       # Provider interface + adapters
│   └── utils.ts
└── data/                   # TS fixtures (MVP bez DB)
```

## Integrace

Aplikace je postavena kolem pluggable **Provider interface** (`src/lib/integrations/types.ts`). Admin přidává integrace přes UI na `/admin/integrations`. MVP obsahuje:

- **GitHub** — reálný adapter (releases, PRs, Actions).
- **Mock** — společný pro ostatní kategorie (Sentry, Vercel, k8s, Datadog, Jira, LaunchDarkly, PagerDuty, Slack, UptimeRobot, …).

## Licence

Interní nástroj.
