# AGENTS.md

Briefing pro každou novou Codex / Codex CLI session v tomto repu.
Hlubší kontext (datový model, roadmap, design guidelines) je
v [LOVABLE-BRIEF.md](LOVABLE-BRIEF.md) — sahej po něm, když potřebuješ
rozhodovat o architektuře nebo přidávat větší feature.

## Pracovní styl

Postupuj přímo k řešení. Když potřebuješ nástroj, analýzu nebo výpočet,
udělej to rovnou — neptej se na povolení, pokud to není kriticky nutné
pro bezpečnost. Komunikace česky, kód a identifikátory anglicky.

## Co je tenhle projekt

**Zorník** — white-label SDLC monitoring dashboard. Pilotní zákazník: ČEPS.
Sjednocuje signály z verzování, CI/CD, testů, releasů, observability a
feedbacku do jednoho dashboardu pro vývojáře, PM, testery a koncové uživatele.
Produkční URL: **https://qa-monitoring.qawave.ai**.

## Stack a konvence

- **Next.js 16** (App Router, RSC), **React 19**, **TypeScript**, **Tailwind v4 + Radix UI + CVA**
- **Vercel Fluid Compute** (žádné Edge Functions), Node.js 24 LTS
- **Auth:** cookie session, bcrypt + HMAC, role `viewer` / `admin`
- **State:** Server Components + URL state. Žádný Zustand/Redux/Jotai.
- **Ikony:** výhradně `lucide-react`
- **AI (až přijde):** Vercel AI Gateway přes plain `"provider/model"` strings, NIKDY ne `@ai-sdk/anthropic` apod.
- **Komponenty:** Radix primitives + CVA, copy-paste pattern. Žádný `shadcn` CLI.
- **Persistence:** TS fixtures v `src/data/*.ts` + JSON v `.data/` (lokálně). Na Vercelu fs writes padají — viz [§ Persistence gotcha](#persistence-gotcha).

## Před commitem nebo deployem vždy

```bash
npm run typecheck && npm run lint && npm test
```

Všechny tři musí projít. 33 unit testů, ~2s. Build (`npm run build`)
spouštěj jen když měníš něco, co může rozbít produkční bundle (ne pro
běžné UI změny — Vercel build to chytne).

## Deploy

```bash
vercel deploy --yes              # preview (test)
vercel deploy --prod --yes       # produkce
```

Oba běží ~40 s. Pouštěj je `run_in_background: true` a počkej na
notifikaci. Nikdy nedělej `vercel deploy --prod` z větve mimo `main`
bez explicitního souhlasu uživatele.

Custom doména: **qa-monitoring.qawave.ai**. (Pozor: stará `qa.qawave.ai` z předchozích deployů už není v aliasech tohoto projektu.)

## Klíčové soubory

| Co | Kde |
|---|---|
| Provider interface (SDLC integrace) | [src/lib/integrations/types.ts](src/lib/integrations/types.ts) |
| Reálný GitHub adapter | [src/lib/integrations/github.ts](src/lib/integrations/github.ts) |
| Mock providers (22 ks) | [src/lib/integrations/mock.ts](src/lib/integrations/mock.ts) |
| Brand config (productName, tenantName) | [src/lib/branding/index.ts](src/lib/branding/index.ts) |
| Brand store (Vercel Blob) | [src/lib/branding/store.ts](src/lib/branding/store.ts) |
| Admin SDLC integrace | [src/app/(dashboard)/admin/integrations/page.tsx](src/app/(dashboard)/admin/integrations/page.tsx) |
| Admin Branding (color picker, 4 styly) | [src/app/(dashboard)/admin/branding/page.tsx](src/app/(dashboard)/admin/branding/page.tsx) |
| Theme switcher (header dropdown) | [src/components/layout/ThemeSwitcher.tsx](src/components/layout/ThemeSwitcher.tsx) |
| Unified storage (Blob/local) | [src/lib/storage.ts](src/lib/storage.ts) |
| DORA metriky | [src/data/dora-metrics.ts](src/data/dora-metrics.ts) |
| CSS tokeny (brand + status) | [src/app/globals.css](src/app/globals.css) |
| Personas + widgety | [src/lib/personas.ts](src/lib/personas.ts) |
| Auth | [src/lib/auth.ts](src/lib/auth.ts) |
| Domain typy | [src/lib/types.ts](src/lib/types.ts) |
| Fixtures (MVP data) | [src/data/](src/data/) |

## Persistence gotcha 🔴

**Vercel Functions mají read-only filesystem mimo `/tmp`.** Cokoli, co
volá `fs.writeFile` do projektového adresáře, lokálně funguje, na
produkci padá na `EROFS`.

Postižené dnes:
- `src/lib/branding/store.ts` (brand settings)
- `src/lib/integrations/store.ts` (instance integrací)
- `src/lib/users/store.ts` (uživatelé)

**Při přidávání nové persistence preferuj v tomto pořadí:**
1. **Vercel Blob (private)** — `@vercel/blob`, perzistentní, levné. Store na týmu už existuje (`store_*`), ale ještě není linknutý — najdi v `vercel blob list-stores --all` a linkni přes UI nebo `vercel blob create-store ... --link`.
2. **Vercel Edge Config** — pro read-heavy / rare-write data (např. brand settings).
3. **Postgres (Neon přes Vercel Marketplace)** — pro relační data (users, audit log, DORA metriky). Plánováno ve Vlně 1, krok 3.

**Nikdy nezapisuj do projektových souborů na Vercelu.** Lokální fallback (detekce přes `process.env.VERCEL`) je OK.

## Branding & white-label

Cokoli ČEPS-specific musí jít přes `branding` config nebo brand settings store.
Žádné hardcoded `"ČEPS"`, `"qa.qawave.ai"`, ani `#2162AD` v kódu —
vždy přes `branding.tenantName`, `branding.productName` nebo CSS var
`hsl(var(--brand-primary))`.

Default brand preset je ČEPS:
- primary `#2162AD`, secondary `#4F91CE`, tertiary `#6BC7F1`
- status ok `#007736`, warn `#FF9700`, down `#BF2A34`

Pro nasazení v jiné firmě admin v `/admin/branding` přepíše barvy +
vybere 1 ze 4 prémiových vizuálních stylů (Linear / Stripe / Grafana / Apple).
Theme switcher je dostupný i v headeru pro rychlé přepínání.

## Roadmap (kde jsme)

| Vlna | Stav |
|---|---|
| 1 — SDLC reorg + Postgres | reorg ✅, Blob persistence ✅, Postgres ⬜ |
| 2 — Visual (3 barvy + 4 styly + persistence) | ✅ (Linear/Stripe/Grafana/Apple + theme switcher) |
| 3 — DORA + Quality gates | ✅ (DORA na dashboardu, Quality page, Product page) |
| 4 — Reálné adaptery (Vercel, Sentry) | ⬜ |
| 5 — Webhooky + Queues + SSE + alerty | ⬜ |
| 6 — Wallboard + ⌘K + AI paleta z loga + AI incident summarizer | ⬜ |
| 7 — Service map + multi-tenant polish | ⬜ |

## Známé deprecation warnings

- **Next.js 16:** `middleware` file convention je deprecated → přejmenovat `src/middleware.ts` na `src/proxy.ts`.
- **Vercel CLI** je často zastaralé — pokud uživatel narazí, doporuč `npm i -g vercel@latest` (ale neupgraduj sám bez pokynu).

## Demo přístup

```
viewer@example.com / demo
admin@example.com / demo
```

Bcrypt 10 rounds, hesla lze změnit v `/admin/users`.

## Když uživatel řekne "nasaď to"

1. Zkontroluj `git status --short`. Pokud jsou neuložené změny,
   uživateli to zmiň, ale **nezakládej commit bez explicitního požadavku**.
2. Pusť preview a/nebo prod deploy paralelně přes
   `run_in_background: true`.
3. Jakmile přijdou notifikace, vytáhni z output souborů URLs
   (`Production:`, `Aliased:`, `readyState`) a nahlas je uživateli
   formátované jako klikací odkazy.
4. Pokud uživatel řekl „otevři v browseru", použij `open <url>` na
   macOS (default browser).
