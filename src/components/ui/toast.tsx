"use client";
import * as React from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastOptions = {
  title?: string;
  action?: { label: string; onClick: () => void };
};

const ToastContext = React.createContext<{
  toast: (type: ToastType, message: string, options?: ToastOptions) => void;
}>({ toast: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [
        ...prev,
        { id, type, message, title: options?.title, action: options?.action },
      ]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 lg:bottom-6 lg:right-6">
        {toasts.map((t) => {
          const hasTitle = !!t.title;
          return (
            <div
              key={t.id}
              className={cn(
                "flex gap-3 rounded-lg border shadow-lg animate-fade-in",
                hasTitle ? "min-w-[340px] max-w-[420px] px-4 py-3.5" : "px-4 py-3",
                !hasTitle && "items-center text-sm",
                t.type === "success" &&
                  "border-[hsl(var(--status-ok)/0.3)] bg-[hsl(var(--status-ok)/0.1)] text-[hsl(var(--status-ok))]",
                t.type === "error" &&
                  "border-destructive/30 bg-destructive/10 text-destructive",
                t.type === "info" && "border-border bg-card text-foreground"
              )}
            >
              {/* Icon */}
              <div className={cn("shrink-0", hasTitle && "mt-0.5")}>
                {t.type === "success" && <CheckCircle className="h-4 w-4" />}
                {t.type === "error" && <AlertTriangle className="h-4 w-4" />}
                {t.type === "info" && <Info className="h-4 w-4" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {hasTitle ? (
                  <>
                    <p className="text-sm font-medium leading-tight">{t.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">
                      {t.message}
                    </p>
                  </>
                ) : (
                  <span className="text-sm">{t.message}</span>
                )}
              </div>

              {/* Actions */}
              <div className={cn("flex shrink-0 gap-2", hasTitle && "mt-0.5")}>
                {t.action && (
                  <button
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                    className={cn(
                      "text-xs font-medium underline-offset-2 hover:underline",
                      t.type === "success" && "text-[hsl(var(--status-ok))]",
                      t.type === "error" && "text-destructive",
                      t.type === "info" && "text-foreground"
                    )}
                  >
                    {t.action.label}
                  </button>
                )}
                <button
                  onClick={() => dismiss(t.id)}
                  className="opacity-50 hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
