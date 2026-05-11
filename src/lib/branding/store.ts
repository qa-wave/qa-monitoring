import { z } from "zod";
import { readJson, writeJson } from "@/lib/storage";
import { DEFAULT_BRAND, STYLE_KEYS, type BrandSettings } from "./types";

const STORE_KEY = "branding.json";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Barva musí být ve formátu #RRGGBB");

export const brandSettingsSchema = z.object({
  productName: z.string().min(1).max(40),
  tenantName: z.string().min(1).max(40),
  primary: hex,
  secondary: hex,
  tertiary: hex,
  style: z.enum(STYLE_KEYS as [string, ...string[]]),
});

let cache: BrandSettings | null = null;

export async function getBrandSettings(): Promise<BrandSettings> {
  if (cache) return cache;
  const raw = await readJson<BrandSettings | null>(STORE_KEY, null);
  if (raw) {
    const parsed = brandSettingsSchema.safeParse(raw);
    if (parsed.success) {
      cache = parsed.data as BrandSettings;
      return cache;
    }
  }
  cache = DEFAULT_BRAND;
  return cache;
}

export async function saveBrandSettings(settings: BrandSettings): Promise<BrandSettings> {
  const validated = brandSettingsSchema.parse(settings) as BrandSettings;
  await writeJson(STORE_KEY, validated);
  cache = validated;
  return validated;
}

export function invalidateBrandCache(): void {
  cache = null;
}
