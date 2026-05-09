import type { StyleKey } from "./types";

export const STYLE_PRESETS: Record<
  StyleKey,
  { label: string; description: string; tagline: string }
> = {
  flat: {
    label: "Solid Flat",
    description:
      "Jednolité barvy, ostré hrany, žádné stíny. Bezpečná default volba pro většinu produktových B2B nasazení.",
    tagline: "Klasika bez šumu",
  },
  gradient: {
    label: "Linear Gradient",
    description:
      "Hlavičky, KPI karty a CTA dostanou diagonální gradient z primární přes sekundární do terciární barvy.",
    tagline: "Moderní SaaS look",
  },
  aurora: {
    label: "Mesh Aurora",
    description:
      "Víceuzlový mesh gradient na pozadí v tlumeném tónu — Stripe / Vercel landing page styl. Wow faktor pro prezentace.",
    tagline: "Prezentační efekt",
  },
  glass: {
    label: "Glassmorphism",
    description:
      "Průsvitné panely s backdrop-blur a světelnými okraji. Funguje na tmavém pozadí nebo s barevnou fotografií.",
    tagline: "Sklo a světlo",
  },
  contrast: {
    label: "High Contrast",
    description:
      "Silné bordery, plné barvy, nulový subtle. Optimalizováno pro wallboard, TV display a WCAG AAA přístupnost.",
    tagline: "Wallboard / a11y AAA",
  },
};
