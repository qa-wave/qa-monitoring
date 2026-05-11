export interface DoraMetrics {
  deploymentFrequency: { value: number; unit: string; rating: "elite" | "high" | "medium" | "low" };
  leadTimeForChanges: { value: number; unit: string; rating: "elite" | "high" | "medium" | "low" };
  changeFailureRate: { value: number; unit: string; rating: "elite" | "high" | "medium" | "low" };
  timeToRestore: { value: number; unit: string; rating: "elite" | "high" | "medium" | "low" };
}

export function computeDoraMetrics(): DoraMetrics {
  return {
    deploymentFrequency: { value: 4.2, unit: "/ den", rating: "elite" },
    leadTimeForChanges: { value: 2.1, unit: "h", rating: "high" },
    changeFailureRate: { value: 8, unit: "%", rating: "medium" },
    timeToRestore: { value: 45, unit: "min", rating: "high" },
  };
}
