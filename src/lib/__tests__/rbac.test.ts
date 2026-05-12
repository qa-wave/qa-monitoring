import { describe, it, expect } from "@jest/globals";
import { hasPermission, getPermissionsForRole, SYSTEM_ROLES } from "@/lib/rbac";

describe("RBAC", () => {
  it("admin has all permissions", () => {
    const perms = getPermissionsForRole("admin");
    expect(perms).toContain("users:manage");
    expect(perms).toContain("dashboard:view");
    expect(perms).toContain("branding:manage");
  });

  it("viewer cannot manage users", () => {
    const perms = getPermissionsForRole("viewer");
    expect(hasPermission(perms, "users:manage")).toBe(false);
    expect(hasPermission(perms, "branding:manage")).toBe(false);
  });

  it("viewer can view dashboard", () => {
    const perms = getPermissionsForRole("viewer");
    expect(hasPermission(perms, "dashboard:view")).toBe(true);
  });

  it("operator can manage incidents", () => {
    const perms = getPermissionsForRole("operator");
    expect(hasPermission(perms, "incidents:manage")).toBe(true);
    expect(hasPermission(perms, "incidents:view")).toBe(true);
  });

  it("operator cannot manage users", () => {
    const perms = getPermissionsForRole("operator");
    expect(hasPermission(perms, "users:manage")).toBe(false);
  });

  it("unknown role returns empty permissions", () => {
    const perms = getPermissionsForRole("nonexistent");
    expect(perms).toEqual([]);
  });

  it("system roles exist", () => {
    expect(SYSTEM_ROLES).toHaveLength(3);
    expect(SYSTEM_ROLES.map((r) => r.id)).toEqual([
      "admin",
      "viewer",
      "operator",
    ]);
  });
});
