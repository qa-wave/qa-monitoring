/**
 * Konverze mezi hex (#RRGGBB) a Tailwind-style HSL stringem ("h s% l%").
 * Tokeny v `globals.css` jsou uloženy jako tři čísla bez funkce `hsl()`,
 * aby šly použít jako `hsl(var(--token))` i `hsl(var(--token) / 0.5)`.
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace("#", "").trim();
  const v = m.length === 3
    ? m.split("").map((c) => c + c).join("")
    : m;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN:
        h = (gN - bN) / d + (gN < bN ? 6 : 0);
        break;
      case gN:
        h = (bN - rN) / d + 2;
        break;
      case bN:
        h = (rN - gN) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, l };
}

export function hexToHslString(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Posun lightness o `delta` (0..1) — užitečné pro odvození dark variant. */
export function shiftLightness(hex: string, delta: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const newL = Math.max(0, Math.min(1, l + delta));
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(newL * 100)}%`;
}
