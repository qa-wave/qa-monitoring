export type StyleKey = "vercel" | "linear" | "grafana" | "datadog" | "stripe" | "github" | "notion" | "supabase" | "planetscale" | "railway";

export interface BrandSettings {
  productName: string;
  tenantName: string;
  primary: string;
  secondary: string;
  tertiary: string;
  style: StyleKey;
}

export const DEFAULT_BRAND: BrandSettings = {
  productName: "Zorník",
  tenantName: "ČEPS",
  primary: "#2162AD",
  secondary: "#4F91CE",
  tertiary: "#6BC7F1",
  style: "vercel",
};

export const STYLE_KEYS: StyleKey[] = ["vercel", "linear", "grafana", "datadog", "stripe", "github", "notion", "supabase", "planetscale", "railway"];
