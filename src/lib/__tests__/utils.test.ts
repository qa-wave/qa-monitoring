import { cn, formatDuration, formatNumber, formatPercent, formatRelativeTime } from "../utils";

describe("utils", () => {
  describe("cn", () => {
    it("spojuje class names a dedupe Tailwind", () => {
      expect(cn("text-sm", "text-base")).toBe("text-base");
      expect(cn("text-sm", undefined, false, "font-medium")).toBe("text-sm font-medium");
    });
  });

  describe("formatRelativeTime", () => {
    const now = new Date("2026-04-17T12:44:00.000Z");

    it("vrací 'teď' pro krátký rozestup", () => {
      expect(formatRelativeTime(new Date(now.getTime() - 5_000), now)).toBe("teď");
    });

    it("vrací minuty", () => {
      expect(formatRelativeTime(new Date(now.getTime() - 5 * 60_000), now)).toBe("před 5 min");
    });

    it("vrací hodiny", () => {
      expect(formatRelativeTime(new Date(now.getTime() - 3 * 60 * 60_000), now)).toBe("před 3 h");
    });
  });

  describe("formatDuration", () => {
    it("formátuje sekundy", () => {
      expect(formatDuration(45)).toBe("45 s");
    });
    it("formátuje minuty a sekundy", () => {
      expect(formatDuration(125)).toBe("2 min 5 s");
    });
    it("formátuje hodiny", () => {
      expect(formatDuration(3660)).toBe("1 h 1 min");
    });
  });

  describe("formatPercent", () => {
    it("používá čárku místo tečky", () => {
      expect(formatPercent(99.94)).toBe("99,94 %");
    });
  });

  describe("formatNumber", () => {
    it("formátuje česky s mezerami", () => {
      const result = formatNumber(1234567);
      // cs-CZ používá úzké neporušitelné mezery U+00A0
      expect(result.replace(/[\s\u00A0]/g, " ")).toBe("1 234 567");
    });
  });
});
