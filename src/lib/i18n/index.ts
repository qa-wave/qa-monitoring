export {
  default as translations,
  type Locale,
  type Translations,
} from "./translations";

import translations, { type Locale } from "./translations";

const DEFAULT_LOCALE: Locale = "cs";

export function getLocale(): Locale {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/zornik-locale=(cs|en)/);
    if (match) return match[1] as Locale;
  }
  return DEFAULT_LOCALE;
}

export function setLocale(locale: Locale): void {
  document.cookie = `zornik-locale=${locale};path=/;max-age=${365 * 86400}`;
}

export function t(locale: Locale | undefined) {
  return translations[locale ?? DEFAULT_LOCALE];
}
