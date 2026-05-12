function sanitizeCell(val: string): string {
  if (/^[=+\-@\t\r]/.test(val)) {
    return "'" + val;
  }
  return val;
}

export function toCSV<T extends object>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  const header = columns.map((c) => c.label).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = sanitizeCell(String(row[c.key] ?? ""));
        return val.includes(",") || val.includes('"')
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
