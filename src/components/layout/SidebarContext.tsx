"use client";

import { createContext, useContext, useCallback, useSyncExternalStore } from "react";

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
});

const STORAGE_KEY = "sidebar-collapsed";

// Tiny external store backed by localStorage
let listeners: Array<() => void> = [];
function subscribe(cb: () => void) {
  listeners = [...listeners, cb];
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
function getSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}
function getServerSnapshot(): boolean {
  return false;
}
function setStored(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // localStorage unavailable
  }
  for (const l of listeners) l();
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    setStored(!getSnapshot());
  }, []);

  const value = { collapsed, toggle };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  return useContext(SidebarContext);
}
