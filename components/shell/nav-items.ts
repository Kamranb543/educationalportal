// Shared primary navigation model — consumed by both the desktop Sidebar and the
// mobile navigation sheet. Item visibility (modules + role) is resolved by
// filterNavItems() so both surfaces stay in sync.
import { enabledModules, terminology } from "@/lib/config";
import { canAccessRoute } from "@/lib/auth/permissions";
import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  moduleKey?: keyof typeof enabledModules;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/my-vouchers", label: "My Vouchers", moduleKey: "studentFees" },
  { href: "/students", label: `Manage ${terminology.studentLabel}s`, moduleKey: "studentFees" },
  { href: "/teachers", label: `Manage ${terminology.teacherLabel}s`, moduleKey: "teacherPayroll" },
  { href: "/courses", label: `All ${terminology.courseLabel}s`, moduleKey: "attendanceTracking" },
  { href: "/classes", label: `${terminology.classLabel} Directory`, moduleKey: "attendanceTracking" },
  { href: "/attendance", label: "Attendance", moduleKey: "attendanceTracking" },
  { href: "/finance", label: "Financial Ledger", moduleKey: "financialLedger" },
  { href: "/expenses", label: "Expenses", moduleKey: "customExpenses" },
  { href: "/announcements", label: "Announcements", moduleKey: "announcements" },
  { href: "/reports", label: "Reports & Analytics", moduleKey: "reportsAndAnalytics" },
  { href: "/settings", label: "Settings" },
];

/** Items visible for a role, honoring enabledModules + route permissions. */
export function filterNavItems(role: Role | null): NavItem[] {
  return NAV_ITEMS.filter(
    (item) =>
      (item.moduleKey === undefined || enabledModules[item.moduleKey]) &&
      canAccessRoute(role, item.href),
  );
}
