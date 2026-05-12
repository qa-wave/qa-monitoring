"use client";

import { useState, useRef, useCallback, useId } from "react";

interface AreaChartDatum {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: AreaChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  unit?: string;
  ariaLabel?: string;
}

const VIEWBOX_W = 400;
const PADDING_TOP = 8;
const PADDING_BOTTOM = 20; // room for x-axis labels
const PADDING_LEFT = 4;
const PADDING_RIGHT = 4;

export function AreaChart({
  data,
  height = 160,
  color = "hsl(var(--brand-primary))",
  unit = "",
  ariaLabel,
}: AreaChartProps) {
  const reactId = useId();
  const gradientId = "area-grad-" + reactId.replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    datum: AreaChartDatum;
  } | null>(null);

  const plotW = VIEWBOX_W - PADDING_LEFT - PADDING_RIGHT;
  const plotH = height - PADDING_TOP - PADDING_BOTTOM;

  const values = data.length > 0 ? data.map((d) => d.value) : [0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const stepX = plotW / Math.max(1, data.length - 1);
  const coords = data.map((d, i) => {
    const x = PADDING_LEFT + i * stepX;
    const y = PADDING_TOP + plotH - ((d.value - min) / range) * plotH;
    return { x, y };
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (data.length === 0) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width; // 0..1
      const svgX = relX * VIEWBOX_W;

      // find closest data point
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < coords.length; i++) {
        const dist = Math.abs(coords[i].x - svgX);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }

      setHover({
        x: coords[closest].x,
        y: coords[closest].y,
        datum: data[closest],
      });
    },
    [coords, data],
  );

  const handleMouseLeave = useCallback(() => setHover(null), []);

  if (data.length === 0) {
    return (
      <svg
        width="100%"
        viewBox={`0 0 ${VIEWBOX_W} ${height}`}
        role="img"
        aria-label={ariaLabel ?? "Area chart"}
      />
    );
  }

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");

  const fillPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${PADDING_TOP + plotH} L${PADDING_LEFT},${PADDING_TOP + plotH} Z`;

  // X-axis labels: first, middle, last
  const xLabels: { label: string; x: number }[] = [];
  if (data.length >= 1) xLabels.push({ label: data[0].label, x: coords[0].x });
  if (data.length >= 3) {
    const mid = Math.floor(data.length / 2);
    xLabels.push({ label: data[mid].label, x: coords[mid].x });
  }
  if (data.length >= 2) {
    xLabels.push({
      label: data[data.length - 1].label,
      x: coords[coords.length - 1].x,
    });
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox={`0 0 ${VIEWBOX_W} ${height}`}
      role="img"
      aria-label={ariaLabel ?? "Area chart"}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="select-none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={fillPath} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* X-axis labels */}
      {xLabels.map((xl, i) => (
        <text
          key={i}
          x={xl.x}
          y={height - 4}
          textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
          fill="hsl(var(--muted-foreground))"
          fontSize={10}
          fontFamily="inherit"
        >
          {xl.label}
        </text>
      ))}

      {/* Hover elements */}
      {hover && (
        <>
          {/* Vertical line */}
          <line
            x1={hover.x}
            y1={PADDING_TOP}
            x2={hover.x}
            y2={PADDING_TOP + plotH}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.6}
          />
          {/* Dot */}
          <circle cx={hover.x} cy={hover.y} r={4} fill={color} />
          {/* Tooltip background + text */}
          <TooltipBox
            x={hover.x}
            y={hover.y}
            label={hover.datum.label}
            value={hover.datum.value}
            unit={unit}
            viewBoxW={VIEWBOX_W}
          />
        </>
      )}
    </svg>
  );
}

function TooltipBox({
  x,
  y,
  label,
  value,
  unit,
  viewBoxW,
}: {
  x: number;
  y: number;
  label: string;
  value: number;
  unit: string;
  viewBoxW: number;
}) {
  const text = `${label}: ${value}${unit ? " " + unit : ""}`;
  const boxW = Math.max(70, text.length * 6.5);
  const boxH = 24;

  // Flip tooltip to left if near right edge
  let bx = x + 8;
  if (bx + boxW > viewBoxW - 4) {
    bx = x - boxW - 8;
  }
  let by = y - boxH - 6;
  if (by < 0) by = y + 10;

  return (
    <g>
      <rect
        x={bx}
        y={by}
        width={boxW}
        height={boxH}
        rx={4}
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth={1}
      />
      <text
        x={bx + boxW / 2}
        y={by + boxH / 2 + 4}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize={11}
        fontFamily="inherit"
        fontWeight={500}
      >
        {text}
      </text>
    </g>
  );
}
