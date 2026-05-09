/**
 * Brand konfigurace produktu. White-label friendly — pro nasazení v jiné firmě
 * stačí změnit hodnoty v `/admin/branding`. Default jméno produktu je "Beacon"
 * (krátké, vyslovitelné v ČJ i AJ, metafora „světla nad celou SDLC").
 */
export type { BrandSettings, StyleKey } from "./types";
export { DEFAULT_BRAND, STYLE_KEYS } from "./types";
export { STYLE_PRESETS } from "./styles";
export { getBrandSettings, saveBrandSettings, brandSettingsSchema } from "./store";
export { hexToHslString, shiftLightness } from "./colors";

import { DEFAULT_BRAND } from "./types";

/**
 * Statický fallback pro client komponenty. Dynamické hodnoty z brand storu
 * teče přes prop drilling z server layoutu. Tento export pokrývá místa, kde
 * je default akceptovatelný (např. fallback pro non-async server komponenty).
 */
export const branding = {
  productName: DEFAULT_BRAND.productName,
  productTagline: "Sjednocený pohled na zdraví aplikací napříč SDLC",
  tenantName: DEFAULT_BRAND.tenantName,
} as const;

export const productMeta = {
  title: {
    default: `${branding.productName} — ${branding.productTagline.toLowerCase()}`,
    template: `%s · ${branding.productName}`,
  },
  description: `${branding.productName} sjednocuje signály z verzování, CI/CD, testů, releasů, observability a feedbacku do jednoho přehledu pro vývojáře, product ownery, testery i koncové uživatele.`,
} as const;
