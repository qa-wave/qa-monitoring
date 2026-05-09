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
    <form className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]" onSubmit={handleSubmit}>
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
                Default &bdquo;Beacon&ldquo; &mdash; krátké, vyslovitelné v ČJ i AJ. Pro nasazení v jiné
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

        <Card>
          <CardHeader>
            <CardTitle>Vizuální styl</CardTitle>
            <p className="text-xs text-muted-foreground">
              Přepíná globální vzhled karet a pozadí. Změnu uvidíš okamžitě po uložení.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 pt-0 sm:grid-cols-2">
            {STYLE_KEYS.map((key) => {
              const preset = STYLE_PRESETS[key];
              const selected = style === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStyle(key)}
                  className={cn(
                    "group relative flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-colors",
                    selected
                      ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary)/0.08)]"
                      : "border-border hover:border-accent hover:bg-accent/40"
                  )}
                >
                  <StyleSwatch styleKey={key} previewStyle={previewStyle} />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{preset.label}</span>
                    {selected ? <Check className="h-3.5 w-3.5 text-[hsl(var(--brand-primary))]" /> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{preset.tagline}</p>
                </button>
              );
            })}
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
              productName={productName || "Beacon"}
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
  switch (styleKey) {
    case "flat":
      return <div style={{ ...base, background: "var(--p)" }} />;
    case "gradient":
      return (
        <div
          style={{
            ...base,
            backgroundImage: "linear-gradient(135deg, var(--p) 0%, var(--s) 50%, var(--t) 100%)",
          }}
        />
      );
    case "aurora":
      return (
        <div
          style={{
            ...base,
            backgroundColor: "hsl(var(--background))",
            backgroundImage: `
              radial-gradient(at 20% 20%, var(--p) 0px, transparent 50%),
              radial-gradient(at 80% 0%, var(--s) 0px, transparent 50%),
              radial-gradient(at 50% 100%, var(--t) 0px, transparent 50%)`,
          }}
        />
      );
    case "glass":
      return (
        <div
          style={{
            ...base,
            backgroundColor: "hsl(var(--card) / 0.6)",
            backgroundImage: `linear-gradient(135deg, var(--p) 0%, var(--t) 100%)`,
            backdropFilter: "blur(8px)",
            border: "1px solid var(--p)",
            boxShadow: "0 4px 16px hsl(0 0% 0% / 0.2)",
          }}
        />
      );
    case "contrast":
      return (
        <div
          style={{
            ...base,
            background: "var(--p)",
            border: "2px solid hsl(var(--foreground))",
            boxShadow: "4px 4px 0 0 var(--s)",
          }}
        />
      );
  }
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

  const cardBgByStyle: Record<StyleKey, React.CSSProperties> = {
    flat: { backgroundColor: "hsl(var(--card))" },
    gradient: {
      backgroundImage: `linear-gradient(135deg, hsl(var(--card)) 0%, ${primary}10 100%)`,
    },
    aurora: {
      backgroundColor: "hsl(var(--card))",
      backgroundImage: `
        radial-gradient(at 30% 20%, ${primary}30 0px, transparent 60%),
        radial-gradient(at 70% 90%, ${tertiary}25 0px, transparent 60%)`,
    },
    glass: {
      backgroundColor: "hsl(var(--card) / 0.55)",
      backdropFilter: "blur(10px)",
      border: `1px solid ${primary}55`,
      boxShadow: `0 8px 24px ${primary}22`,
    },
    contrast: {
      backgroundColor: "hsl(var(--card))",
      border: `2px solid ${primary}`,
      boxShadow: `4px 4px 0 0 ${primary}DD`,
    },
  };

  const wrapperBgByStyle: Record<StyleKey, React.CSSProperties> = {
    flat: {},
    gradient: {
      backgroundImage: `linear-gradient(135deg, hsl(var(--background)) 0%, ${primary}08 100%)`,
    },
    aurora: {
      backgroundImage: `
        radial-gradient(at 18% 12%, ${primary}28 0px, transparent 60%),
        radial-gradient(at 82% 8%, ${secondary}22 0px, transparent 60%),
        radial-gradient(at 65% 78%, ${tertiary}1F 0px, transparent 60%)`,
    },
    glass: {
      backgroundImage: `
        radial-gradient(at 28% 18%, ${primary}33 0px, transparent 60%),
        radial-gradient(at 72% 82%, ${tertiary}28 0px, transparent 60%)`,
    },
    contrast: {},
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
            backgroundImage:
              styleKey === "gradient"
                ? `linear-gradient(135deg, ${primary} 0%, ${tertiary} 100%)`
                : undefined,
            backgroundColor: styleKey === "gradient" ? undefined : primary,
            border: styleKey === "contrast" ? `2px solid hsl(var(--foreground))` : undefined,
            boxShadow: styleKey === "contrast" ? `3px 3px 0 0 ${secondary}` : undefined,
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
