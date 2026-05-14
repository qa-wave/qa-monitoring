function toSmoothPath(coords: [number, number][]): string {
  if (coords.length < 2) return "";
  let path = `M${coords[0][0].toFixed(1)},${coords[0][1].toFixed(1)}`;
  for (let i = 1; i < coords.length; i++) {
    const [px, py] = coords[i - 1];
    const [cx, cy] = coords[i];
    const cpx = (px + cx) / 2;
    path += ` C${cpx.toFixed(1)},${py.toFixed(1)} ${cpx.toFixed(1)},${cy.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`;
  }
  return path;
}

interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  smooth?: boolean;
  ariaLabel?: string;
}

export function Sparkline({
  points,
  width = 120,
  height = 32,
  color = "hsl(var(--status-info))",
  fill = true,
  smooth = true,
  ariaLabel,
}: SparklineProps) {
  if (points.length === 0) {
    return <svg width={width} height={height} aria-label={ariaLabel} role="img" />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / Math.max(1, points.length - 1);
  const coords: [number, number][] = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * (height - 2) - 1;
    return [x, y];
  });
  const linePath = smooth
    ? toSmoothPath(coords)
    : coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L${width},${height} L0,${height} Z`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel ?? "Trend"}
    >
      {fill ? <path d={fillPath} fill={color} opacity={0.15} /> : null}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
