import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, ThumbsUp, Clock, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { weeklyMetrics, featureAdoption, conversionFunnel } from "@/data/product-analytics";
import { formatNumber } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export default async function ProductPage() {
  const { t } = await getT();
  const latest = weeklyMetrics[weeklyMetrics.length - 1];
  const prev = weeklyMetrics.length > 1 ? weeklyMetrics[weeklyMetrics.length - 2] : latest;

  const dauTrend = weeklyMetrics.map((w) => w.dau);
  const retentionD7 = weeklyMetrics.map((w) => 100 - w.bounceRatePct);
  const npsTrend = weeklyMetrics.map((w) => w.nps);

  const sessionMin = Math.floor(latest.sessionDurationAvgSec / 60);
  const sessionSec = latest.sessionDurationAvgSec % 60;

  const latestRetention = (100 - latest.bounceRatePct).toFixed(1);
  const prevRetention = (100 - prev.bounceRatePct).toFixed(1);

  const maxFunnelUsers = conversionFunnel[0]?.users ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.product.title}
        description={t.pages.product.description}
      />

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="DAU"
          value={formatNumber(latest.dau)}
          status="info"
          icon={Users}
          delta={{
            value: `${latest.dau > prev.dau ? "+" : ""}${formatNumber(latest.dau - prev.dau)}`,
            direction: latest.dau > prev.dau ? "up" : latest.dau < prev.dau ? "down" : "flat",
            positive: latest.dau >= prev.dau,
          }}
          hint="denních aktivních uživatelů"
        />
        <KpiCard
          label="Retence D7"
          value={`${latestRetention.replace(".", ",")} %`}
          status={Number(latestRetention) >= 70 ? "ok" : Number(latestRetention) >= 50 ? "warn" : "down"}
          icon={TrendingUp}
          delta={{
            value: `${Number(latestRetention) > Number(prevRetention) ? "+" : ""}${(Number(latestRetention) - Number(prevRetention)).toFixed(1).replace(".", ",")} %`,
            direction: Number(latestRetention) > Number(prevRetention) ? "up" : Number(latestRetention) < Number(prevRetention) ? "down" : "flat",
            positive: Number(latestRetention) >= Number(prevRetention),
          }}
          hint="týdenní retence"
        />
        <KpiCard
          label="NPS"
          value={String(latest.nps)}
          status={latest.nps >= 50 ? "ok" : latest.nps >= 30 ? "warn" : "down"}
          icon={ThumbsUp}
          delta={{
            value: `${latest.nps > prev.nps ? "+" : ""}${latest.nps - prev.nps}`,
            direction: latest.nps > prev.nps ? "up" : latest.nps < prev.nps ? "down" : "flat",
            positive: latest.nps >= prev.nps,
          }}
          hint="Net Promoter Score"
        />
        <KpiCard
          label="Prům. session"
          value={`${sessionMin}:${String(sessionSec).padStart(2, "0")}`}
          unit="min"
          status="info"
          icon={Clock}
          hint="průměrná délka session"
        />
      </section>

      {/* Sparkline trend cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">DAU trend</CardTitle>
            {latest.dau > prev.dau ? <ArrowUp className="h-3.5 w-3.5 text-[hsl(var(--status-ok))]" /> : latest.dau < prev.dau ? <ArrowDown className="h-3.5 w-3.5 text-[hsl(var(--status-down))]" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
          </CardHeader>
          <CardContent className="pt-0">
            <Sparkline points={dauTrend} width={280} height={40} color="hsl(var(--status-info))" ariaLabel="DAU trend" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retence trend</CardTitle>
            {Number(latestRetention) > Number(prevRetention) ? <ArrowUp className="h-3.5 w-3.5 text-[hsl(var(--status-ok))]" /> : Number(latestRetention) < Number(prevRetention) ? <ArrowDown className="h-3.5 w-3.5 text-[hsl(var(--status-down))]" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
          </CardHeader>
          <CardContent className="pt-0">
            <Sparkline points={retentionD7} width={280} height={40} color="hsl(var(--status-ok))" ariaLabel="Retention trend" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NPS trend</CardTitle>
            {latest.nps > prev.nps ? <ArrowUp className="h-3.5 w-3.5 text-[hsl(var(--status-ok))]" /> : latest.nps < prev.nps ? <ArrowDown className="h-3.5 w-3.5 text-[hsl(var(--status-down))]" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
          </CardHeader>
          <CardContent className="pt-0">
            <Sparkline points={npsTrend} width={280} height={40} color="hsl(var(--brand-primary))" ariaLabel="NPS trend" />
          </CardContent>
        </Card>
      </section>

      {/* Feature adoption */}
      <Card>
        <CardHeader>
          <CardTitle>Adopce funkcí</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {featureAdoption.map((f) => (
            <div key={f.feature} className="flex items-center gap-3">
              <span className="w-40 text-sm font-medium truncate">{f.feature}</span>
              <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-[hsl(var(--brand-primary))]"
                  style={{ width: `${f.adoptionPct}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-mono tabular-nums">{f.adoptionPct} %</span>
              <span className="w-20 text-right text-xs text-muted-foreground">
                {formatNumber(f.weeklyActiveUsers)} WAU
              </span>
              <Badge
                variant={f.trend === "up" ? "success" : f.trend === "down" ? "danger" : "outline"}
                className="w-12 justify-center"
              >
                {f.trend === "up" ? <ArrowUp className="h-3 w-3" /> : f.trend === "down" ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Conversion funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Konverzní funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {conversionFunnel.map((step, i) => (
            <div key={step.step} className="flex items-center gap-3">
              <span className="w-48 text-sm truncate">{step.step}</span>
              <div className="flex-1 h-6 rounded bg-muted overflow-hidden relative">
                <div
                  className="h-full rounded bg-[hsl(var(--brand-primary))] transition-all"
                  style={{
                    width: `${(step.users / maxFunnelUsers) * 100}%`,
                    opacity: 1 - i * 0.15,
                  }}
                />
                <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">
                  {formatNumber(step.users)}
                </span>
              </div>
              <span className="w-14 text-right text-sm font-mono tabular-nums">
                {step.conversionPct.toFixed(1)} %
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
