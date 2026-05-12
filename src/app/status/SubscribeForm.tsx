"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Zadejte platnou e-mailovou adresu.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/status/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? "Hotovo!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Nepodařilo se přihlásit k odběru.");
      }
    } catch {
      setStatus("error");
      setMessage("Chyba sítě. Zkuste to později.");
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Mail className="h-4 w-4" />
        Odběr notifikací
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Zadejte svůj e-mail a budeme vás informovat o výpadcích a plánované údržbě.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "loading") setStatus("idle");
          }}
          placeholder="vas@email.cz"
          required
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-[hsl(var(--brand-primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "Odesílám..." : "Odebírat"}
        </button>
      </form>
      {status === "success" && (
        <p className="mt-2 text-sm text-[hsl(var(--status-ok))]">{message}</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-[hsl(var(--status-down))]">{message}</p>
      )}
    </section>
  );
}
