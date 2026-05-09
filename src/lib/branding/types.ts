export type StyleKey = "flat" | "gradient" | "aurora" | "glass" | "contrast";

export interface BrandSettings {
  productName: string;
  tenantName: string;
  primary: string; // hex #RRGGBB
  secondary: string;
  tertiary: string;
  style: StyleKey;
}

export const DEFAULT_BRAND: BrandSettings = {
  productName: "Beacon",
  tenantName: "ČEPS",
  primary: "#2162AD",
  secondary: "#4F91CE",
  tertiary: "#6BC7F1",
  style: "flat",
};

export const STYLE_KEYS: StyleKey[] = ["flat", "gradient", "aurora", "glass", "contrast"];
