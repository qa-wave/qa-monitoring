"use client";

import * as React from "react";
import { BellRing, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AlertRule,
  METRIC_LABELS,
  OPERATOR_LABELS,
} from "@/lib/alerts";

interface Props {
  initialRules: AlertRule[];
}

export function AlertsAdminClient({ initialRules }: Props) {
  const [rules, setRules] = React.useState<AlertRule[]>(initialRules);
  const [showForm, setShowForm] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [metric, setMetric] = React.useState<AlertRule["metric"]>("latency");
  const [operator, setOperator] = React.useState<AlertRule["operator"]>("gt");
  const [threshold, setThreshold] = React.useState("");
  const [channel, setChannel] = React.useState<AlertRule["channel"]>("email");

  async function addRule() {
    if (!name || !threshold) return;
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        metric,
        operator,
        threshold: Number(threshold),
        channel,
        enabled: true,
      }),
    });
    if (!res.ok) return;
    // Refetch all rules to get server-generated id & createdAt
    const listRes = await fetch("/api/alerts");
    if (listRes.ok) {
      const data = await listRes.json();
      setRules(data.items);
    }
    setName("");
    setThreshold("");
    setShowForm(false);
  }

  async function toggleRule(id: string) {
    const rule = rules.find((r) => r.id === id);
    if (!rule) return;
    const res = await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !rule.enabled }),
    });
    if (!res.ok) return;
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  }

  async function deleteRule(id: string) {
    const res = await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nové pravidlo
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nové pravidlo alertu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="alert-name">Název</Label>
                <Input
                  id="alert-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="např. Alert na vysokou latenci"
                />
              </div>
              <div className="space-y-2">
                <Label>Metrika</Label>
                <Select value={metric} onValueChange={(v) => setMetric(v as AlertRule["metric"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(METRIC_LABELS) as AlertRule["metric"][]).map((m) => (
                      <SelectItem key={m} value={m}>
                        {METRIC_LABELS[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Operátor</Label>
                <Select value={operator} onValueChange={(v) => setOperator(v as AlertRule["operator"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(OPERATOR_LABELS) as AlertRule["operator"][]).map((o) => (
                      <SelectItem key={o} value={o}>
                        {OPERATOR_LABELS[o]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-threshold">Práh</Label>
                <Input
                  id="alert-threshold"
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="např. 500"
                />
              </div>
              <div className="space-y-2">
                <Label>Kanál</Label>
                <Select value={channel} onValueChange={(v) => setChannel(v as AlertRule["channel"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="both">Oba</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={addRule} disabled={!name || !threshold}>
                  Přidat pravidlo
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Zrušit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Pravidla
          </CardTitle>
          <Badge variant="outline">{rules.length}</Badge>
        </CardHeader>
        <CardContent className="pt-0">
          {rules.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Žádná pravidla alertů.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Název</th>
                    <th className="pb-2 pr-4 font-medium">Metrika</th>
                    <th className="pb-2 pr-4 font-medium">Podmínka</th>
                    <th className="pb-2 pr-4 font-medium">Kanál</th>
                    <th className="pb-2 pr-4 font-medium">Aktivní</th>
                    <th className="pb-2 font-medium">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="py-2 pr-4 font-medium">{rule.name}</td>
                      <td className="py-2 pr-4">{METRIC_LABELS[rule.metric]}</td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {OPERATOR_LABELS[rule.operator]} {rule.threshold}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline">{rule.channel}</Badge>
                      </td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            rule.enabled ? "bg-[hsl(var(--status-ok))]" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              rule.enabled ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRule(rule.id)}
                          aria-label="Smazat pravidlo"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
