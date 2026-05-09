import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { DEFAULT_BRAND, STYLE_KEYS, type BrandSettings } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "branding.json");

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
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = brandSettingsSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      cache = parsed.data as BrandSettings;
      return cache;
    }
  } catch {
    // soubor zatím neexistuje nebo je rozbitý — vrátíme default
  }
  cache = DEFAULT_BRAND;
  return cache;
}

export async function saveBrandSettings(settings: BrandSettings): Promise<BrandSettings> {
  const validated = brandSettingsSchema.parse(settings) as BrandSettings;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(validated, null, 2), "utf-8");
  cache = validated;
  return validated;
}

export function invalidateBrandCache(): void {
  cache = null;
}
