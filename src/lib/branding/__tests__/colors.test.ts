import { describe, it, expect } from "@jest/globals";
import { hexToHslString, shiftLightness } from "@/lib/branding/colors";

describe("hexToHslString", () => {
  it("converts white", () => {
    expect(hexToHslString("#FFFFFF")).toBe("0 0% 100%");
  });
  it("converts black", () => {
    expect(hexToHslString("#000000")).toBe("0 0% 0%");
  });
  it("converts ČEPS blue", () => {
    const result = hexToHslString("#2162AD");
    expect(result).toMatch(/^\d+ \d+% \d+%$/);
  });
});

describe("shiftLightness", () => {
  it("shifts lightness up", () => {
    const result = shiftLightness("#2162AD", 0.1);
    expect(result).toMatch(/^\d+ \d+% \d+%$/);
  });
  it("doesn't exceed 100%", () => {
    const result = shiftLightness("#FFFFFF", 0.5);
    expect(result).toMatch(/\d+%$/);
  });
});
