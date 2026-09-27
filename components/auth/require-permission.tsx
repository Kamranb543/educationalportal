"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { hasPermission, canAccessRoute, type Permission } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/auth/access-denied";

interface RequirePermissionProps {
  /** Required permission for this page. */
  permission: Permission;
  /** Route path shown in the AccessDenied fallback (optional). */
  href?: string;
  children: ReactNode;
}

/**
 * Page-level access guard. Wrap a restricted route's body in this component;
 * it renders an "Unauthorized Access" fallback if the active session lacks the
 * required permission.
 */
export function RequirePermission({ permission, href, children }: RequirePermissionProps) {
  const { currentRole } = useAuth();
  if (!hasPermission(currentRole, permission)) {
    return <AccessDenied href={href} />;
  }
  return <>{children}</>;
}

/** Convenience: guards a page by its route path using ROUTE_PERMISSIONS. */
export function RequireRoute({ href, children }: { href: string; children: ReactNode }) {
  const { currentRole } = useAuth();
  if (!canAccessRoute(currentRole, href)) {
    return <AccessDenied href={href} />;
  }
  return <>{children}</>;
}
