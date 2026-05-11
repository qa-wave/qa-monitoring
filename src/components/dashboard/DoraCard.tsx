"use client";

import { Rocket, Clock, AlertTriangle, RotateCcw, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DoraMetrics } from "@/data/dora-metrics";

const ratingVariant: Record<string, "success" | "info" | "warning" | "danger"> = {
  elite: "success",
  high: "info",
  medium: "warning",
  low: "danger",
};

const ratingLabel: Record<string, string> = {
  elite: "Elite",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const metrics: {
  key: keyof DoraMetrics;
  label: string;
  icon: React.ElementType;
  tooltip: string;
}[] = [
  {
    key: "deploymentFrequency",
    label: "Deploy frekvence",
    icon: Rocket,
    tooltip: "Jak často organizace úspěšně nasazuje do produkce.",
  },
  {
    key: "leadTimeForChanges",
    label: "Lead time",
    icon: Clock,
    tooltip: "Čas od commitu po nasazení do produkce.",
  },
  {
    key: "changeFailureRate",
    label: "Change failure rate",
    icon: AlertTriangle,
    tooltip: "Procento nasazení, která způsobí degradaci služby a vyžadují opravu.",
  },
  {
    key: "timeToRestore",
    label: "Time to restore",
    icon: RotateCcw,
    tooltip: "Jak dlouho trvá obnovit službu po incidentu v produkci.",
  },
];

export function DoraCard({ data }: { data: DoraMetrics }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>DORA metriky</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground">
                <Info className="h-4 w-4" />
                <span className="sr-only">Co jsou DORA metriky</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              DORA metriky jsou 4 klíčové ukazatele výkonnosti softwarového dodávání: deploy frekvence, lead time, change failure rate a time to restore. Definuje je tým DORA (DevOps Research and Assessment).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map(({ key, label, icon: Icon, tooltip }) => {
            const m = data[key];
            return (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1 rounded-md border p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-xl font-semibold tabular-nums">{m.value}</span>
                        <span className="text-xs text-muted-foreground">{m.unit}</span>
                      </div>
                      <Badge variant={ratingVariant[m.rating]} className="w-fit text-[10px]">
                        {ratingLabel[m.rating]}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
