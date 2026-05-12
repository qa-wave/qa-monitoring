import { describe, it, expect } from "@jest/globals";
import translations from "@/lib/i18n/translations";

describe("i18n translations", () => {
  it("cs and en have same top-level keys", () => {
    const csKeys = Object.keys(translations.cs).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(csKeys).toEqual(enKeys);
  });

  it("nav section has all required keys", () => {
    for (const locale of ["cs", "en"] as const) {
      expect(translations[locale].nav).toHaveProperty("overview");
      expect(translations[locale].nav).toHaveProperty("incidents");
      expect(translations[locale].nav).toHaveProperty("tests");
    }
  });

  it("all translations are non-empty strings (recursive)", () => {
    function checkStrings(obj: Record<string, unknown>, path: string) {
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === "object" && val !== null) {
          checkStrings(val as Record<string, unknown>, `${path}.${key}`);
        } else if (typeof val === "string") {
          expect(val.length).toBeGreaterThan(0);
        }
      }
    }
    checkStrings(
      translations.cs as unknown as Record<string, unknown>,
      "cs",
    );
    checkStrings(
      translations.en as unknown as Record<string, unknown>,
      "en",
    );
  });

  it("cs and en nav sections have same keys", () => {
    const csNavKeys = Object.keys(translations.cs.nav).sort();
    const enNavKeys = Object.keys(translations.en.nav).sort();
    expect(csNavKeys).toEqual(enNavKeys);
  });
});
