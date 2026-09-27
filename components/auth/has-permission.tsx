"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { hasPermission, hasAnyPermission, type Permission } from "@/lib/auth/permissions";

interface HasPermissionProps {
  /** Single permission required. */
  allow?: Permission;
  /** Or any one of these permissions. */
  allowAny?: Permission[];
  /** Rendered instead when the active role lacks permission. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * UI-level permission guard: renders children only when the active session's
 * role satisfies the required permission(s). Use to hide action buttons such as
 * "Add Expense", "Edit Student", or "Pay Fee" from unauthorized roles.
 */
export function HasPermission({ allow, allowAny, fallback = null, children }: HasPermissionProps) {
  const { currentRole } = useAuth();

  const allowed =
    allowAny !== undefined
      ? hasAnyPermission(currentRole, allowAny)
      : allow !== undefined
        ? hasPermission(currentRole, allow)
        : true;

  return allowed ? <>{children}</> : <>{fallback}</>;
}
