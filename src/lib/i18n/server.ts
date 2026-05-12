import { cookies } from "next/headers";
import type { Locale } from "./translations";
import translations from "./translations";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("zornik-locale")?.value;
  if (locale === "en") return "en";
  return "cs";
}

export async function getT() {
  const locale = await getServerLocale();
  return { t: translations[locale], locale };
}
