export type Permission =
  | "dashboard:view"
  | "environments:view"
  | "applications:view"
  | "releases:view"
  | "tests:view"
  | "incidents:view"
  | "incidents:manage"
  | "quality:view"
  | "product:view"
  | "status:view"
  | "integrations:view"
  | "integrations:manage"
  | "branding:manage"
  | "users:view"
  | "users:manage"
  | "audit:view"
  | "alerts:manage";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

export const SYSTEM_ROLES: Role[] = [
  {
    id: "admin",
    name: "Administr\u00e1tor",
    description: "Pln\u00fd p\u0159\u00edstup ke v\u0161em funkc\u00edm",
    permissions: [
      "dashboard:view",
      "environments:view",
      "applications:view",
      "releases:view",
      "tests:view",
      "incidents:view",
      "incidents:manage",
      "quality:view",
      "product:view",
      "status:view",
      "integrations:view",
      "integrations:manage",
      "branding:manage",
      "users:view",
      "users:manage",
      "audit:view",
      "alerts:manage",
    ],
    isSystem: true,
  },
  {
    id: "viewer",
    name: "\u010cten\u00e1\u0159",
    description: "Pouze \u010dten\u00ed dashboardu a dat",
    permissions: [
      "dashboard:view",
      "environments:view",
      "applications:view",
      "releases:view",
      "tests:view",
      "incidents:view",
      "quality:view",
      "product:view",
      "status:view",
    ],
    isSystem: true,
  },
  {
    id: "operator",
    name: "Oper\u00e1tor",
    description: "\u010cten\u00ed + spr\u00e1va incident\u016f a integrac\u00ed",
    permissions: [
      "dashboard:view",
      "environments:view",
      "applications:view",
      "releases:view",
      "tests:view",
      "incidents:view",
      "incidents:manage",
      "quality:view",
      "product:view",
      "status:view",
      "integrations:view",
      "integrations:manage",
      "audit:view",
    ],
    isSystem: true,
  },
];

export function hasPermission(
  userPermissions: Permission[],
  required: Permission,
): boolean {
  return userPermissions.includes(required);
}

export function getPermissionsForRole(roleId: string): Permission[] {
  const role = SYSTEM_ROLES.find((r) => r.id === roleId);
  return role?.permissions ?? [];
}
