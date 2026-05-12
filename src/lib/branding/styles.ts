import type { StyleKey } from "./types";

export const STYLE_PRESETS: Record<
  StyleKey,
  { label: string; description: string; tagline: string }
> = {
  vercel: {
    label: "Vercel",
    description: "Čistá čerň s bílým textem, minimální bordery, jemné hover efekty. Ikonický dark dashboard.",
    tagline: "▲ Černobílý minimalismus",
  },
  linear: {
    label: "Linear",
    description: "Tmavý s fialovými akcenty, subtle gradient pozadí, glow na hover. Moderní project management.",
    tagline: "Fialové akcenty na tmavé",
  },
  grafana: {
    label: "Grafana",
    description: "Tmavý ops dashboard s neonovými status barvami, dense layout. Monitoring klasika.",
    tagline: "Neonový mission control",
  },
  datadog: {
    label: "Datadog",
    description: "Tmavě fialový základ, saturované barvy, kompaktní karty. Observability platforma.",
    tagline: "Deep purple observability",
  },
  stripe: {
    label: "Stripe",
    description: "Světlý s indigo akcentem, gradient header, propracované stíny. Enterprise payments dashboard.",
    tagline: "Indigo enterprise",
  },
  github: {
    label: "GitHub",
    description: "Tmavý s šedými bordery, zelené akcenty, monospace příměs. Vývojářský klasik.",
    tagline: "Vývojářský tmavý mód",
  },
  notion: {
    label: "Notion",
    description: "Světlý, teplý, velký whitespace, tenké bordery, čistá typografie. Produktivní klid.",
    tagline: "Teplý minimalismus",
  },
  supabase: {
    label: "Supabase",
    description: "Tmavý se zeleným akcentem, zaoblené karty, moderní developer dashboard.",
    tagline: "Zelená na tmavé",
  },
  planetscale: {
    label: "PlanetScale",
    description: "Světlý s oranžovým akcentem, čisté grid, subtle shadows. Database dashboard.",
    tagline: "Oranžový svěží light",
  },
  railway: {
    label: "Railway",
    description: "Tmavý s bílým textem, fialové akcenty, velké zaoblení, glassmorphism karty.",
    tagline: "Fialové glass karty",
  },
};
