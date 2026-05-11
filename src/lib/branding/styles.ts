import type { StyleKey } from "./types";

export const STYLE_PRESETS: Record<
  StyleKey,
  { label: string; description: string; tagline: string }
> = {
  noir: {
    label: "Luxusní čerň",
    description:
      "Čistá čerň bez okrajů, luxusní monochromatický vzhled. Minimalistický a elegantní dark mode.",
    tagline: "Pure black, borderless luxury",
  },
  terminal: {
    label: "Retro terminál",
    description:
      "Zelená na černé, monospace font, čárkované okraje. Nostalgický hacker aesthetic.",
    tagline: "Green on black, monospace vibes",
  },
  glass: {
    label: "Mléčné sklo",
    description:
      "Matné karty na mesh gradientu, backdrop-blur efekt. Moderní a vzdušný glassmorphism.",
    tagline: "Frosted cards, mesh gradient backdrop",
  },
  paper: {
    label: "Tištěný report",
    description:
      "Teplý krémový papír, jemné linky, knižní typografie. Připomíná tištěnou zprávu.",
    tagline: "Warm cream, hairline borders, book-like",
  },
  neon: {
    label: "Neonová záře",
    description:
      "Horká růžová a cyan na tmavém pozadí, zářící okraje. Futuristický cyberpunk styl.",
    tagline: "Hot pink & cyan glow on dark",
  },
  corporate: {
    label: "Enterprise navy",
    description:
      "Navy sidebar, bílý hlavní panel, Bloomberg-like rozložení. Profesionální enterprise look.",
    tagline: "Navy sidebar, white main, Bloomberg-like",
  },
  pastel: {
    label: "Hravé pastely",
    description:
      "Barevné pastelové odstíny karet, velký radius, hravý a přívětivý vzhled.",
    tagline: "Colorful card tints, large radius, playful",
  },
  monochrome: {
    label: "Jedna barva",
    description:
      "Celý dashboard v jednom odstínu brand barvy. Jednotný a konzistentní monochromatický styl.",
    tagline: "Entire dashboard in one brand hue",
  },
  arctic: {
    label: "Ledová čistota",
    description:
      "Ledově modrá, mrazivé okraje, skandinávský minimalismus. Čistý a svěží severský styl.",
    tagline: "Icy blue, frost borders, Scandinavian",
  },
  ember: {
    label: "Žhavé uhlíky",
    description:
      "Tmavý teplý antracit, jantarové akcenty. Dramatický a energický warm dark mode.",
    tagline: "Dark warm charcoal, amber accents",
  },
};
