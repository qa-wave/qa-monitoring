"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Activity, Check, Palette, RefreshCw, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DEFAULT_BRAND,
  STYLE_KEYS,
  type BrandSettings,
  type StyleKey,
} from "@/lib/branding/types";
import { STYLE_PRESETS } from "@/lib/branding/styles";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function BrandingForm({ initial }: { initial: BrandSettings }) {
  const router = useRouter();
  const [productName, setProductName] = React.useState(initial.productName);
  const [tenantName, setTenantName] = React.useState(initial.tenantName);
  const [primary, setPrimary] = React.useState(initial.primary);
  const [secondary, setSecondary] = React.useState(initial.secondary);
  const [tertiary, setTertiary] = React.useState(initial.tertiary);
  const [style, setStyle] = React.useState<StyleKey>(initial.style);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const valid =
    productName.trim().length > 0 &&
    tenantName.trim().length > 0 &&
    HEX_RE.test(primary) &&
    HEX_RE.test(secondary) &&
    HEX_RE.test(tertiary);

  const previewStyle: React.CSSProperties = {
    // pomocí --p/--s/--t inline vytvoříme lokální token sadu pro preview
    ["--p" as string]: primary,
    ["--s" as string]: secondary,
    ["--t" as string]: tertiary,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, tenantName, primary, secondary, tertiary, style }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage({ kind: "err", text: body.error ?? "Uložení selhalo." });
        setPending(false);
        return;
      }
      setMessage({ kind: "ok", text: "Uloženo. Načítám novou paletu." });
      router.refresh();
      setPending(false);
    } catch (err) {
      setMessage({ kind: "err", text: `Výjimka: ${(err as Error).message}` });
      setPending(false);
    }
  }

  function reset() {
    setProductName(DEFAULT_BRAND.productName);
    setTenantName(DEFAULT_BRAND.tenantName);
    setPrimary(DEFAULT_BRAND.primary);
    setSecondary(DEFAULT_BRAND.secondary);
    setTertiary(DEFAULT_BRAND.tertiary);
    setStyle(DEFAULT_BRAND.style);
    setMessage(null);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Style picker — compact horizontal strip, always visible */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Vizuální styl</CardTitle>
          <p className="text-xs text-muted-foreground">
            Klikni pro okamžitý náhled. Uložení aplikuje styl permanentně.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            {STYLE_KEYS.map((key) => {
              const preset = STYLE_PRESETS[key];
              const selected = style === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStyle(key)}
                  className={cn(
                    "group relative flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-all shrink-0 w-[100px]",
                    selected
                      ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary)/0.08)] ring-2 ring-[hsl(var(--brand-primary)/0.3)]"
                      : "border-border hover:border-accent hover:bg-accent/40"
                  )}
                >
                  <StyleSwatch styleKey={key} previewStyle={previewStyle} />
                  <span className="text-xs font-semibold leading-tight">{preset.label}</span>
                  {selected && <Check className="absolute top-1 right-1 h-3.5 w-3.5 text-[hsl(var(--brand-primary))]" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Levý sloupec: form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="productName">Jméno produktu</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                maxLength={40}
                required
              />
              <p className="text-xs text-muted-foreground">
                Default &bdquo;Zorník&ldquo; &mdash; krátké, vyslovitelné v ČJ i AJ. Pro nasazení v jiné
                firmě stačí změnit zde.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantName">Jméno zákazníka / tenanta</Label>
              <Input
                id="tenantName"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                maxLength={40}
                required
              />
              <p className="text-xs text-muted-foreground">
                Zobrazuje se v patičce sidebaru a na veřejné status stránce.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barvy</CardTitle>
            <p className="text-xs text-muted-foreground">
              Tři barvy v hex formátu. Default jsou oficiální ČEPS barvy z brand manuálu.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <ColorRow
              label="Primární"
              hint="Hlavní brand barva — logo, primární tlačítka, focus ring."
              value={primary}
              onChange={setPrimary}
            />
            <ColorRow
              label="Sekundární"
              hint="Doplňková barva — sekundární akcenty, hover states."
              value={secondary}
              onChange={setSecondary}
            />
            <ColorRow
              label="Třetí"
              hint="Akcent — gradient cíl, ilustrace, decorative prvky."
              value={tertiary}
              onChange={setTertiary}
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={reset} disabled={pending}>
            <RefreshCw className="h-4 w-4" />
            Reset na ČEPS default
          </Button>
          <div className="flex items-center gap-3">
            {message ? (
              <span
                className={cn(
                  "text-xs",
                  message.kind === "ok" ? "text-[hsl(var(--status-ok))]" : "text-destructive"
                )}
              >
                {message.text}
              </span>
            ) : null}
            <Button type="submit" disabled={!valid || pending}>
              {pending ? "Ukládám…" : "Uložit a aplikovat"}
            </Button>
          </div>
        </div>
      </div>

      {/* Pravý sloupec: live preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Náhled
            </CardTitle>
            <Badge variant="outline">{STYLE_PRESETS[style].label}</Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <LivePreview
              productName={productName || "Zorník"}
              tenantName={tenantName || "ČEPS"}
              primary={primary}
              secondary={secondary}
              tertiary={tertiary}
              styleKey={style}
            />
            <p className="text-xs text-muted-foreground">
              Náhled používá zadané hex barvy přímo. V aplikaci se barvy převedou na HSL tokeny
              a zapojí se do dark mode varianty automaticky.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </form>
  );
}

function ColorRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const valid = HEX_RE.test(value);
  return (
    <div className="space-y-2">
      <Label className="flex items-center justify-between">
        <span>{label}</span>
        {!valid ? <span className="text-xs font-normal text-destructive">Neplatný hex</span> : null}
      </Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
          aria-label={`${label} – výběr barvy`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono"
          placeholder="#RRGGBB"
          maxLength={7}
        />
        <div
          className="h-10 w-10 rounded-md border border-border"
          style={{ backgroundColor: valid ? value : "transparent" }}
          aria-hidden
        />
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function StyleSwatch({
  styleKey,
  previewStyle,
}: {
  styleKey: StyleKey;
  previewStyle: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    height: 48,
    width: "100%",
    borderRadius: 6,
    border: "1px solid hsl(var(--border))",
    ...previewStyle,
  };
  const swatchStyles: Record<StyleKey, React.CSSProperties> = {
    vercel: { background: "#000", borderBottom: "1px solid #222", border: "none", borderRadius: 0 },
    linear: { background: "#15101e", backgroundImage: "radial-gradient(at 20% 30%, #5b3a9e44 0, transparent 50%)", border: "1px solid #2a1e3a" },
    grafana: { background: "#0d0f18", border: "1px solid #1a1e30" },
    datadog: { background: "#120a1e", border: "1px solid #2a1840" },
    stripe: { backgroundImage: "linear-gradient(135deg, #1a2744 0%, #1a2744 40%, #f5f5f5 40.1%)", border: "1px solid #ccc" },
    github: { background: "#0d1117", border: "1px solid #21262d" },
    notion: { background: "#faf8f5", border: "1px solid #e0d8c8", borderRadius: 3 },
    supabase: { background: "var(--p)", opacity: 0.15, border: "1px solid var(--p)" },
    planetscale: { backgroundImage: "linear-gradient(90deg, #fde8ee, #e8eeff, #e8faf0, #f0e8ff)", border: "none", borderRadius: 14 },
    railway: { backgroundImage: "linear-gradient(135deg, #1a0840, #0a2040)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 },
  };
  return <div style={{ ...base, ...swatchStyles[styleKey] }} />;
}

function LivePreview({
  productName,
  tenantName,
  primary,
  secondary,
  tertiary,
  styleKey,
}: {
  productName: string;
  tenantName: string;
  primary: string;
  secondary: string;
  tertiary: string;
  styleKey: StyleKey;
}) {
  // Inline tokens používané vnitřními kartami preview.
  const wrapperStyle: React.CSSProperties = {
    ["--p" as string]: primary,
    ["--s" as string]: secondary,
    ["--t" as string]: tertiary,
  };

  const defaultCard: React.CSSProperties = { backgroundColor: "hsl(var(--card))" };
  const cardBgByStyle: Record<StyleKey, React.CSSProperties> = {
    vercel: { backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", borderRadius: 0 },
    linear: { backgroundColor: "#15101e", border: "1px solid #2a1e3a" },
    grafana: { backgroundColor: "#0d0f18", border: "1px solid #1a1e30" },
    datadog: { backgroundColor: "#120a1e", border: "1px solid #2a1840" },
    stripe: { backgroundColor: "#fff", border: "1px solid #d0d5dd", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
    github: { backgroundColor: "#0d1117", border: "1px solid #21262d" },
    notion: { backgroundColor: "#faf8f5", border: "1px solid #e0d8c8" },
    supabase: { backgroundColor: `${primary}0a`, border: `1px solid ${primary}20` },
    planetscale: { backgroundColor: "#fde8ee", border: "none", borderRadius: 14 },
    railway: { backgroundColor: "rgba(40,20,80,0.35)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 },
  };

  const wrapperBgByStyle: Record<StyleKey, React.CSSProperties> = {
    vercel: { backgroundColor: "#000", color: "#e0e0e0" },
    linear: { backgroundColor: "#0d0a14", color: "#d8d0e8" },
    grafana: { backgroundColor: "#0a0c14", color: "#d0d4dc" },
    datadog: { backgroundColor: "#0a0614", color: "#d8d0e8" },
    stripe: { backgroundColor: "#f0f2f5", color: "#1a2744" },
    github: { backgroundColor: "#010409", color: "#c9d1d9" },
    notion: { backgroundColor: "#faf8f5", color: "#37352f" },
    supabase: { backgroundColor: `${primary}06` },
    planetscale: { backgroundColor: "#fafafe" },
    railway: { backgroundImage: "linear-gradient(135deg, #1a0840, #0a2040)", color: "#e0e0f0" },
  };

  return (
    <div
      className="rounded-md p-4"
      style={{ ...wrapperStyle, ...wrapperBgByStyle[styleKey], minHeight: 320 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: primary,
              boxShadow: `0 0 8px ${primary}99`,
            }}
            aria-hidden
          />
          <span>
            {productName}{" "}
            <span className="font-normal text-muted-foreground">· {tenantName}</span>
          </span>
        </div>
        <span
          className="rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider"
          style={{ backgroundColor: `${primary}22`, color: primary }}
        >
          live
        </span>
      </div>

      {/* Mini KPI karta */}
      <div className="rounded-lg p-4" style={cardBgByStyle[styleKey]}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Uptime 30d</div>
            <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">99,97 %</div>
          </div>
          <Activity className="h-8 w-8" style={{ color: primary }} />
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "hsl(var(--status-ok))" }}
            />
            12 OK
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "hsl(var(--status-warn))" }}
            />
            2 WARN
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "hsl(var(--status-down))" }}
            />
            0 DOWN
          </span>
        </div>
      </div>

      {/* CTA tlačítko v primární barvě */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white"
          style={{
            backgroundColor: primary,
            border: styleKey === "datadog" ? `1px solid ${primary}` : undefined,
            boxShadow: styleKey === "datadog" ? `0 0 8px ${primary}88` : undefined,
          }}
        >
          <Rocket className="h-4 w-4" />
          Deploy
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm font-medium"
          style={{ borderColor: primary, color: primary }}
        >
          Detail
        </button>
      </div>

      {/* Tří barevné swatche */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { hex: primary, label: "Primary" },
          { hex: secondary, label: "Secondary" },
          { hex: tertiary, label: "Tertiary" },
        ].map((c) => (
          <div key={c.label} className="overflow-hidden rounded-md border border-border">
            <div className="h-10" style={{ backgroundColor: c.hex }} />
            <div className="flex items-center justify-between px-2 py-1 text-[10px]">
              <span className="text-muted-foreground">{c.label}</span>
              <span className="font-mono">{c.hex.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
