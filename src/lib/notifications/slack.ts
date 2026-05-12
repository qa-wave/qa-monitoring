export async function sendSlackNotification(message: string, channel?: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[slack] SLACK_WEBHOOK_URL not configured");
    return false;
  }
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, channel }),
    });
    return res.ok;
  } catch (err) {
    console.error("[slack] Send failed:", err);
    return false;
  }
}

export function formatIncidentSlack(title: string, severity: string, url: string): string {
  return `\u{1F6A8} *${severity.toUpperCase()} Incident*: ${title}\n<${url}|Zobrazit detail>`;
}

export function formatDeploySlack(app: string, version: string, status: string): string {
  const emoji = status === "success" ? "\u2705" : status === "failed" ? "\u274C" : "\u{1F504}";
  return `${emoji} Deploy *${app}* verze \`${version}\` \u2014 ${status}`;
}
