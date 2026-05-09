# Beacon — Lovable Brief

> Self-contained brief pro Lovable (nebo jiného AI app buildera). Obsahuje vše,
> co je potřeba k dalšímu vývoji nebo refaktoringu produktu **Beacon** —
> SDLC monitoring dashboardu pro firemní IT.

---

## TL;DR

**Beacon** je white-label SDLC monitoring dashboard. Sjednocuje signály
z verzování, CI/CD, testů, releasů, observability a feedbacku do
jednoho místa. Pilotní zákazník: **ČEPS** (česká přenosová soustava).
Produkt je postavený tak, aby ho šlo nasadit jiné firmě změnou
configu — `productName`, `tenantName`, paleta barev a vizuální styl.

- **Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript, Tailwind v4 + Radix UI
- **Hosting:** Vercel (Fluid Compute), custom doména `qa-monitoring.qawave.ai`
- **Auth:** cookie session, bcrypt + HMAC, role `viewer` / `admin`
- **Persistence:** TS fixtures v `/src/data/*.ts` (MVP, bez DB) + JSON soubory v `.data/` (BLOKUJE NA VERCELU — viz „Známé problémy")
- **Integrace:** registry pattern, jediný reálný adapter zatím GitHub, ostatních 17 jako mock

---

## Produkt

### Co Beacon dělá

Jednotná „mission control" pro životní cyklus softwaru ve firmě. Místo
toho, aby tým chodil do GitHubu, Vercelu, Sentry, Jiry, Datadogu, PagerDuty
a Slacku zvlášť, vidí na jedné stránce:

- **zdraví prostředí** (uptime, p95 latence, error rate, deploye dnes),
- **otevřené incidenty** s vlastníky a komunikačním stavem,
- **release health** (frequency, lead time, change failure, MTTR — DORA),
- **stav testů** (pass rate, flaky, coverage),
- **feature flagy** napříč prostředími,
- **top chyby** z error tracking nástroje,
- **stav závislostí** (CVE, expirující certifikáty),
- **veřejnou status stránku** pro koncové uživatele.

### Pro koho

4 personas, každá vidí jiný řez na stejných datech (přepínač v hlavičce + per-user default):

| Persona | Co ji zajímá | Widgety |
|---|---|---|
| **Vývojář** | poslední buildy, deploy, chyby, flaky testy | KPI, matrix, releases, incidents, tests, errors, flags |
| **Product Owner** | release readiness, dopad na zákazníka, roadmap | KPI, releases, incidents, flags |
| **Tester** | pass rate, regrese, nové issues k retestu | KPI, matrix, tests, errors, releases |
| **Koncový uživatel** | „funguje to?" — veřejný `/status` | jen status pages |

### White-label

Vše, co identifikuje konkrétního zákazníka, je v jednom souboru:
[`src/lib/branding.ts`](src/lib/branding.ts) +
[`src/app/globals.css`](src/app/globals.css) (CSS variables).

Pro nasazení v jiné firmě (např. ČEZ, T-Mobile, Škoda) admin v
`/admin/branding` přepíše:
- **productName** (default „Beacon")
- **tenantName** (default „ČEPS")
- **3 brand barvy** (primary / secondary / tertiary)
- **vizuální styl** (1 z 5 presetů — viz níže)

V budoucnu (Vlna 6): **AI vygeneruje paletu z nahraného loga** přes Vercel AI Gateway + vision model.

---

## Architektura

### Adresářová struktura

```
src/
├── app/
│   ├── (dashboard)/             # autentizované interní stránky se sdíleným AppShell
│   │   ├── layout.tsx           # Sidebar + Header + Mobile bottom nav
│   │   ├── page.tsx             # / — Přehled (per-persona widgety)
│   │   ├── environments/        # detail prostředí dev/test/stage/prod
│   │   ├── applications/        # katalog aplikací
│   │   ├── releases/            # historie releasů
│   │   ├── tests/               # test pass rate, flaky, last runs
│   │   ├── incidents/           # incident timeline
│   │   ├── quality/             # security & quality (CVE, coverage)
│   │   ├── product/             # produktové KPI (DAU, retence — z analytics)
│   │   ├── status/preview/      # interní náhled veřejné status stránky
│   │   └── admin/               # admin only (role guard)
│   │       ├── integrations/    # napojené nástroje seskupené dle SDLC fází
│   │       ├── branding/        # color picker + 5 stylů + live preview
│   │       ├── environments/    # CRUD prostředí
│   │       ├── apps/            # CRUD aplikací
│   │       └── users/           # CRUD uživatelů + role + heslo
│   ├── api/
│   │   ├── auth/{login,logout}/
│   │   ├── health/              # readiness probe
│   │   ├── status/public/       # JSON pro veřejný status (revalidate 30s)
│   │   ├── integrations/{,[id]/{,test}}/
│   │   ├── branding/            # GET / PUT brand settings
│   │   └── users/{,[id]}/
│   ├── login/
│   ├── status/                  # veřejná status stránka (neautentizovaná)
│   └── layout.tsx               # root, dark mode default
│
├── components/
│   ├── ui/                      # Radix + CVA primitives (Button, Card, Badge, Tabs, Sheet, Dialog, …)
│   ├── layout/                  # AppShell, Sidebar, Header, MobileBottomNav, EnvFilter, PersonaFilter, UserMenu
│   └── dashboard/               # KpiCard, StatusMatrix, IncidentBanner, ReleaseListItem, TestRunRow, FlagListItem, Sparkline, PageHeader
│
├── lib/
│   ├── auth.ts                  # cookie session, bcrypt, HMAC sign
│   ├── branding/
│   │   ├── index.ts             # re-export branding (productName, tenantName)
│   │   ├── colors.ts            # ČEPS palette + brand color types
│   │   ├── styles.ts            # 5 visual style presetů
│   │   ├── store.ts             # GET/PUT brand settings (BLOKUJE — viz problémy)
│   │   └── types.ts             # BrandSettings, VisualStyle
│   ├── dashboard-data.ts        # data aggregator pro dashboard
│   ├── personas.ts              # persona enum + widgety per persona
│   ├── types.ts                 # doménové typy (Application, Environment, Deployment, …)
│   ├── utils.ts                 # cn, formatNumber, formatPercent, formatRelativeTime, formatDateTime
│   ├── integrations/
│   │   ├── types.ts             # ProviderDefinition, ProviderCapability, SdlcStage, ProviderKind
│   │   ├── registry.ts          # listProviderDefinitions, getProviderDefinition
│   │   ├── github.ts            # reálný GitHub adapter (REST API)
│   │   ├── mock.ts              # 17 mock providerů s capabilities z fixtures
│   │   └── store.ts             # CRUD instancí integrací (BLOKUJE — viz problémy)
│   └── users/store.ts           # CRUD uživatelů (BLOKUJE — viz problémy)
│
├── data/                        # TS fixtures (MVP bez DB)
│   ├── applications.ts          # 6 aplikací
│   ├── environments.ts          # dev / test / stage / prod
│   ├── deployments.ts           # historie deployů
│   ├── health-checks.ts         # status per app per env
│   ├── pipeline-runs.ts         # CI runs
│   ├── test-runs.ts             # E2E + unit results
│   ├── incidents.ts             # otevřené + uzavřené
│   ├── errors.ts                # Sentry-like aggregates
│   ├── feature-flags.ts         # flagy + rollout %
│   ├── releases.ts              # tagged releases
│   ├── audit-log.ts             # admin akce
│   ├── maintenance.ts           # plánovaná údržba pro public status
│   └── users.ts                 # seed uživatelů (bcrypt hash hesla „demo")
│
├── middleware.ts                # auth guard pro /admin/* a /(dashboard)/*
└── test-setup.ts                # Jest + RTL setup
```

### Routing & autentizace

- **Public:** `/login`, `/status`
- **Authenticated (viewer + admin):** vše pod `(dashboard)`
- **Admin only:** `/admin/*` (route guard v middleware + UI hide v Sidebaru)

Cookie session je signed HMAC, expirace 7 dní. Žádné JWT, žádný DB
session store — jen in-memory user lookup a JSON soubor s users.

---

## Datový model

```ts
type Application = { id: string; name: string; ownerTeam: string; tier: "critical" | "high" | "normal"; }
type Environment = { id: string; appId: string; name: "dev"|"test"|"stage"|"prod"; url?: string; }
type HealthCheck = { id: string; appId: string; envId: string; status: "ok"|"warn"|"down"; checkedAt: string; latencyMs?: number; }
type Deployment = { id: string; appId: string; envId: string; version: string; commitSha: string; commitMessage: string; status: "success"|"failed"|"running"; startedAt: string; finishedAt: string|null; actor: string; durationSec: number; }
type PipelineRun = { id: string; appId: string; envId: string; branch: string; commitSha: string; actor: string; status: "queued"|"running"|"success"|"failed"; startedAt: string; durationSec: number; url: string; }
type TestRun = { id: string; appId: string; suite: string; passed: number; failed: number; skipped: number; durationSec: number; finishedAt: string; }
type Incident = { id: string; title: string; severity: "sev1"|"sev2"|"sev3"; status: "investigating"|"monitoring"|"resolved"; affectedAppIds: string[]; affectedEnvIds: string[]; startedAt: string; resolvedAt: string|null; commander?: string; }
type ErrorSummary = { id: string; appId: string; envId: string; title: string; level: "fatal"|"error"|"warning"; count24h: number; usersAffected: number; firstSeen: string; lastSeen: string; }
type FeatureFlag = { id: string; key: string; label: string; rolloutByEnv: Record<string, number>; owner: string; updatedAt: string; }
type User = { id: string; email: string; name: string; role: "viewer"|"admin"; personaPreference?: Persona; passwordHash: string; }
```

### Provider/integrace model

```ts
type SdlcStage = "plan"|"code"|"build"|"test"|"release"|"operate"|"observe"|"feedback"|"security"
type ProviderKind = "vcs"|"ci"|"paas"|"k8s"|"apm"|"errors"|"logs"|"incidents"|"tickets"|"flags"|"analytics"|"tests"|"security"|"uptime"|"db"|"comm"

interface ProviderDefinition<TConfig> {
  key: string;                   // "github", "sentry", "vercel", …
  kind: ProviderKind;
  sdlcStage: SdlcStage;          // do které fáze patří v admin UI
  label: string;
  labelCs: string;
  description: string;
  docsUrl: string;
  credentialsSchema: ZodType<TConfig>;
  capabilities: (keyof ProviderCapability)[];
  isReal: boolean;               // true = volá externí API; false = mock z fixtures
  create: (config: TConfig) => ProviderCapability;
}

interface ProviderCapability {
  fetchDeployments?(scope): Promise<Deployment[]>;
  fetchHealth?(scope): Promise<HealthCheck[]>;
  fetchErrors?(scope): Promise<ErrorSummary[]>;
  fetchPipelineRuns?(scope): Promise<PipelineRun[]>;
  fetchFlags?(scope): Promise<FeatureFlag[]>;
  fetchTestRuns?(scope): Promise<TestRun[]>;
  fetchIncidents?(scope): Promise<Incident[]>;
  testConnection(): Promise<{ok: boolean; message: string; latencyMs?: number}>;
}
```

---

## SDLC mapování (admin sekce „Integrace")

Admin v `/admin/integrations` vidí **kartu Pokrytí SDLC** (progress bar
+ 9 dlaždic s ikonou) a pod ní **9 sekcí** seskupených dle fáze.
Každá sekce má vlastní ikonu, popis, počet aktivních integrací a
katalog dostupných providerů jako dlaždice.

| Fáze | Reprezentanti dnes (mock + 1 reálný) |
|---|---|
| **Plan** — backlog, sprinty, roadmap | Jira, Linear |
| **Code** — verzování, code review | **GitHub** (reálný), GitLab, Bitbucket |
| **Build** — CI pipeliny, artefakty | (zatím prázdné — na řadě) |
| **Test** — unit/integration/E2E/perf/a11y | Playwright Cloud |
| **Release** — deploy, feature flagy | Vercel, LaunchDarkly, Unleash |
| **Operate** — k8s, DB, incidenty, on-call | Kubernetes, PagerDuty, Slack |
| **Observe** — APM, errors, logs, uptime | Sentry, Datadog, Grafana, UptimeRobot |
| **Feedback** — analytics, support | Mixpanel, PostHog |
| **Security** — CVE, secrets, compliance | Snyk |

Defaultní mapování `kind → sdlcStage` je v
[`src/lib/integrations/types.ts`](src/lib/integrations/types.ts) v `sdlcStageForKind`.
Konkrétní provider může mapování přepsat polem `sdlcStage`.

---

## Branding & Visual systém

### Brand tokeny (CSS variables, HSL)

V `:root` (light) a `.dark`:

```css
--brand-primary:   212 68% 40%;   /* #2162AD ČEPS dark blue */
--brand-secondary: 209 56% 56%;   /* #4F91CE ČEPS blue */
--brand-tertiary:  199 83% 68%;   /* #6BC7F1 ČEPS light blue */
--status-ok:       147 100% 23%;  /* #007736 ČEPS green */
--status-warn:     36 100% 50%;   /* #FF9700 ČEPS orange */
--status-down:     356 64% 46%;   /* #BF2A34 ČEPS red */
```

Tailwind v4 `@theme inline` je mapuje na `bg-brand-primary`, `text-status-ok` atd.

### 5 vizuálních stylů (k výběru v `/admin/branding`)

| # | Styl | Estetika | Kdy zvolit |
|---|---|---|---|
| 1 | **Solid Flat** | jednolité barvy, ostré hrany, bez stínů | bezpečná default volba, neutrální B2B |
| 2 | **Linear Gradient** | diagonální gradient primary → secondary → tertiary v hlavičkách a CTA | moderní SaaS look |
| 3 | **Mesh Aurora** | víceuzlový mesh gradient na pozadí (Stripe / Vercel landing styl) | „wow" prezentační dashboard |
| 4 | **Glassmorphism** | průsvitné panely, backdrop-blur, světelné akcenty | tmavé pozadí + barevné fotky/logo |
| 5 | **High Contrast** | silné hranice, plné barvy, velká písmena (WCAG AAA) | a11y / TV wallboard / starší monitory |

Implementace = jedna CSS třída na `<html>` (`theme-flat`, `theme-gradient`, `theme-mesh`, `theme-glass`, `theme-contrast`) + sada CSS vars overridů. Přepnutí instantní bez rebuildu.

### Roadmap pro Visual

- **Vlna 2 (probíhá):** color picker, 5 stylů, live preview, persistence brand settings
- **Vlna 6 (AI):** upload loga → AI Gateway + vision model vrátí 3 dominantní barvy + doporučený styl → admin akceptuje / upraví

---

## Co je hotové (MVP)

- [x] Auth (cookie + bcrypt + HMAC, role viewer/admin)
- [x] AppShell — Sidebar (desktop) + MobileBottomNav, Header s persona/env filtrem, UserMenu
- [x] Dashboard `/` s per-persona widgety (KPI, status matrix, releases, incidents, tests, flags, errors)
- [x] Stránky: prostředí, aplikace, releasy, testy, incidenty, kvalita & bezpečnost, produkt
- [x] Veřejná status stránka `/status` (cached 60s, history bar, plánovaná údržba)
- [x] Admin: integrations (s SDLC seskupením + coverage bar), environments, apps, users, branding (UI hotové, **persistence rozbitá na Vercelu**)
- [x] Provider registry — 1 reálný (GitHub) + 17 mock
- [x] Test infra: Jest + RTL (33 testů zelené) + Playwright smoke
- [x] Deployed na Vercel — `qa-monitoring.qawave.ai`

---

## Roadmap (vlny po ~1 týdnu)

| # | Vlna | Stav |
|---|---|---|
| **1** | SDLC reorg + **Postgres** (Vercel Marketplace, Neon) pro users/integrations | ⬜ admin reorg ✅, Postgres ⬜ |
| **2** | **Visual** — 3 barvy + 5 stylů + live preview + persistence | 🟡 UI hotové, persistence padá na Vercelu |
| **3** | **DORA + Quality gates** — deploy frequency, lead time, change failure, MTTR, flaky rate, coverage trend, escape rate | ⬜ |
| **4** | Reálné adaptery #2 a #3 — **Vercel** (vlastní platforma) + **Sentry** (issues + releases + perf) | ⬜ |
| **5** | Webhooky (`/api/webhooks/{github,sentry,vercel,pagerduty}`) + Vercel Queues + SSE stream + alert rules + inbox | ⬜ |
| **6** | Wallboard mode + command palette (⌘K) + saved views + **AI paleta z loga** + **AI incident summarizer** (Vercel AI Gateway) | ⬜ |
| **7** | Service map (force-directed graph), multi-tenant polish, **Vercel for Platforms** integrace | ⬜ |

---

## Známé problémy & technický dluh

### 🔴 Persistence padá na Vercelu (BLOKUJE Vlnu 2)

`src/lib/branding/store.ts`, `src/lib/integrations/store.ts`, `src/lib/users/store.ts`
zapisují JSON do `.data/*.json`. **Vercel Functions mají read-only filesystem
mimo `/tmp`**, takže `fs.writeFile` skončí `EROFS`. Lokálně funguje,
v produkci ne.

**Řešení (3 možnosti, doporučení 1+3):**
1. **Vercel Blob (private)** pro brand settings a integrations — pár řádek, perzistentní, levné. Store už je vytvořený (`store_*`), zbývá ho linknout k projektu a vytáhnout `BLOB_READ_WRITE_TOKEN`.
2. **Vercel Edge Config** — read-heavy distribuovaná store, write přes Vercel API. Vhodné pro brand settings (rare write, frequent read).
3. **Postgres (Neon přes Vercel Marketplace)** — pro users + integrations + budoucí audit log + DORA metriky. Plánováno ve Vlně 1, krok 3.

### 🟡 Vercel CLI je zastaralé (53.2.0 → 53.3.1)

`npm i -g vercel@latest`.

### 🟡 Projekt na Vercelu byl přejmenován

`package.json` říká `qa-monitoring`, `.vercel/project.json` říká `qa-app`,
custom doména je `qa-monitoring.qawave.ai`. Funguje, ale je to nekonzistentní —
sjednotit jméno všude.

### 🟡 Next.js 16 deprecation warning

> The "middleware" file convention is deprecated. Please use "proxy" instead.

Přejmenovat `src/middleware.ts` → `src/proxy.ts`.

### 🟡 Build sekce v admin/integrations je prázdná

V mock specs zatím chybí čistý CI provider (GitHub Actions je sloučený do GitHubu pod `code`). Přidat: GitHub Actions standalone, CircleCI, Buildkite, Jenkins.

---

## Demo přístup

```
URL:    https://qa-monitoring.qawave.ai
Viewer: viewer@example.com / demo
Admin:  admin@example.com / demo
```

Hesla jsou bcrypt hashe (10 rounds), v admin UI lze měnit nebo vytvořit nového uživatele.

---

## Skripty

```bash
npm run dev          # dev server na :3000
npm run build        # produkční build
npm run start        # produkční server
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Jest unit/snapshot (33 testů)
npm run test:e2e     # Playwright smoke

vercel deploy --yes               # preview deploy
vercel deploy --prod --yes        # produkční deploy
```

---

## Brief pro Lovable / dalšího AI buildera

### Co bys měl/a vědět

1. **Není to greenfield.** Beacon má hotovou MVP architekturu, design system, datový model, 33 testů a běží v produkci. Cílem dalšího sprintu není přepis, ale **dotažení Vlny 2 (Visual persistence) + start Vlny 3 (DORA)**.

2. **Vercel-first.** Veškeré nové features by měly počítat s Vercel platformou: Fluid Compute, AI Gateway, Blob, Cron, Queues, Marketplace. Vyhni se vlastní infrastruktuře.

3. **Czech-first UI, EN code.** Veškeré uživatelské texty jsou česky (target ČEPS), kód, identifikátory a komentáře v angličtině. Přidaný i18n vrstvu lze, ale není priorita.

4. **Dark mode default**, light mode podporovaný (CSS vars v `:root` + `.dark`). Theme toggle není zatím UI, ale připravený v tokenech.

5. **White-label core.** Cokoli, co je „ČEPS-specific", musí být v `branding.ts` nebo v brand settings store. Kód nesmí mít hardcoded „ČEPS" / „qa.qawave.ai" / barvu `#2162AD`.

### Co by lovable měl/by udělat (návrh dalších kroků)

**Priorita 1 — odblokovat Vlnu 2 (persistence):**
- Migrovat `branding-store.ts`, `integrations/store.ts`, `users/store.ts` z JSON souborů na Vercel Blob (private) nebo na Postgres (Neon přes Marketplace).
- Zachovat lokální fallback na JSON pro dev běh bez Vercel závislostí.
- Smoke test: PUT na `/api/branding` z UI musí přežít redeploy.

**Priorita 2 — dotáhnout Visual:**
- Implementovat 5 CSS tříd `theme-flat`, `theme-gradient`, `theme-mesh`, `theme-glass`, `theme-contrast` v `globals.css` (každá overriduje subset CSS vars + přidává dekorace).
- Live preview v admin sekci musí reagovat instantně bez round-tripu na server.
- Po uložení invalidovat cache a `router.refresh()` pro propagaci do root layoutu.

**Priorita 3 — DORA dashboard (Vlna 3):**
- Nové domain typy: `DeploymentEvent`, `ChangeFailure`, `LeadTimeMeasurement`, `FlakyTestStat`, `CoverageSnapshot`.
- Nová sekce na `/` — „Release health" se 4 KPI (deploy frequency, lead time, change failure rate, MTTR) + 30denní heatmapa deployů (řádek = env, sloupec = den, barva = úspěch %).
- Stránka `/quality` rozšířit o flaky list + coverage trend + escape rate.

**Priorita 4 — reálný Vercel adapter (Vlna 4):**
- Náhrada `vercel` mock provideru za reálný adapter volající Vercel REST API: deployments, env vars status, build cache hit-rate, function invocations.
- OAuth flow přes „Sign in with Vercel" (GA listopad 2025).

### Design guidelines

- **Barvy:** vždy přes CSS vars `--brand-*` a `--status-*`, nikdy hardcoded hex. Kontrast min. AA, optimálně AAA pro status barvy.
- **Typografie:** sans-serif system stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, …`), monospace pro tabulární čísla a kód.
- **Spacing:** 4-bodová grid (Tailwind defaults), `space-y-6` pro sekce, `space-y-2` uvnitř sekcí.
- **Komponenty:** preferovat Radix UI primitives + class-variance-authority (CVA) pro varianty. Žádný shadcn/ui CLI — komponenty jsou copy-pasted z Radix.
- **Ikony:** lucide-react, výlučně. Velikost 14-16px ve většině kontextů, 20-24px v page headerech.
- **Animace:** drobné transition-colors, transition-all, žádné JS animation libs.
- **A11y:** každá interaktivní komponenta musí mít focus ring (`ring-2 ring-ring`), klávesovou navigaci, ARIA role tam kde to není zřejmé z HTML.

### Co NEDĚLAT

- ❌ Nepřidávej shadcn/ui CLI dependency — Radix + CVA je záměrné rozhodnutí.
- ❌ Nepřidávej state management library (Zustand, Redux, Jotai) — Server Components + URL state stačí.
- ❌ Nepřidávej `@ai-sdk/anthropic` ani jiný provider-specific SDK — používej Vercel AI Gateway přes `"provider/model"` stringy.
- ❌ Nepoužívej Edge Functions — Fluid Compute je default a má lepší DX (full Node.js, žádná omezení).
- ❌ Nezapisuj do souborů na Vercelu (kromě `/tmp`) — viz „Známé problémy".

---

## Reference / odkazy v kódu

- Provider interface: [src/lib/integrations/types.ts](src/lib/integrations/types.ts)
- Reálný GitHub adapter: [src/lib/integrations/github.ts](src/lib/integrations/github.ts)
- Mock providers: [src/lib/integrations/mock.ts](src/lib/integrations/mock.ts)
- Branding config: [src/lib/branding/index.ts](src/lib/branding/index.ts) + [colors.ts](src/lib/branding/colors.ts) + [styles.ts](src/lib/branding/styles.ts)
- Brand store (rozbité na Vercelu): [src/lib/branding/store.ts](src/lib/branding/store.ts)
- Admin sekce SDLC: [src/app/(dashboard)/admin/integrations/page.tsx](src/app/(dashboard)/admin/integrations/page.tsx)
- Admin sekce Branding: [src/app/(dashboard)/admin/branding/page.tsx](src/app/(dashboard)/admin/branding/page.tsx)
- CSS tokeny: [src/app/globals.css](src/app/globals.css)
- Personas + widgety: [src/lib/personas.ts](src/lib/personas.ts)
- Auth: [src/lib/auth.ts](src/lib/auth.ts)
- Domain typy: [src/lib/types.ts](src/lib/types.ts)

---

*Generated 2026-05-09. Pokud chceš aktualizovaný brief, regeneruj ho z aktuálního stavu repozitáře.*
