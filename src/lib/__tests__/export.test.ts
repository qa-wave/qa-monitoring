import { describe, it, expect } from "@jest/globals";
import { toCSV } from "@/lib/export";

describe("toCSV", () => {
  it("generates CSV with header", () => {
    const data = [{ name: "Test", value: 42 }];
    const csv = toCSV(data, [
      { key: "name", label: "Jmeno" },
      { key: "value", label: "Hodnota" },
    ]);
    expect(csv).toContain("Jmeno,Hodnota");
    expect(csv).toContain("Test,42");
  });

  it("escapes commas in values", () => {
    const data = [{ name: "Hello, world" }];
    const csv = toCSV(data, [{ key: "name", label: "Name" }]);
    expect(csv).toContain('"Hello, world"');
  });

  it("escapes quotes in values", () => {
    const data = [{ name: 'Say "hi"' }];
    const csv = toCSV(data, [{ key: "name", label: "Name" }]);
    expect(csv).toContain('"Say ""hi"""');
  });

  it("handles null/undefined values as empty strings", () => {
    const data = [{ name: null, value: undefined }] as unknown as {
      name: string;
      value: string;
    }[];
    const csv = toCSV(data, [
      { key: "name", label: "Name" },
      { key: "value", label: "Value" },
    ]);
    const lines = csv.split("\n");
    // Data row should have a comma separator (both values empty)
    expect(lines[1]).toBe(",");
  });

  it("handles multiple rows", () => {
    const data = [
      { a: "x", b: "1" },
      { a: "y", b: "2" },
      { a: "z", b: "3" },
    ];
    const csv = toCSV(data, [
      { key: "a", label: "A" },
      { key: "b", label: "B" },
    ]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(4); // header + 3 rows
  });

  it("returns only header for empty data", () => {
    const csv = toCSV([], [{ key: "name" as never, label: "Name" }]);
    expect(csv).toBe("Name");
  });
});
