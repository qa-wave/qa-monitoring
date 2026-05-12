"use client";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export function DashboardLayout({ children }: { children: React.ReactNode[] }) {
  return <DashboardGrid>{children}</DashboardGrid>;
}
