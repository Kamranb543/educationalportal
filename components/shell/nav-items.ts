// Shared primary navigation model — consumed by both the desktop Sidebar and the
// mobile navigation sheet. Organized into grouped sections (Phase 14). Item
// visibility (modules + role) is resolved by filterNavGroups() so both surfaces
// stay in sync.
import { enabledModules, terminology } from "@/lib/config";
import { canAccessRoute } from "@/lib/auth/permissions";
import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  moduleKey?: keyof typeof enabledModules;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Academics",
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/class-directory", label: "Class Directory", moduleKey: "attendanceTracking" },
      { href: "/subjects", label: "Subject Manager", moduleKey: "attendanceTracking" },
      { href: "/timetable", label: "Timetable", moduleKey: "attendanceTracking" },
      { href: "/attendance", label: "Attendance", moduleKey: "attendanceTracking" },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/my-vouchers", label: "My Vouchers", moduleKey: "studentFees" },
      { href: `/students`, label: `Manage ${terminology.studentLabel}s`, moduleKey: "studentFees" },
      { href: `/teachers`, label: `Manage ${terminology.teacherLabel}s`, moduleKey: "teacherPayroll" },
      { href: "/onboarding-approvals", label: "Onboarding Approvals", moduleKey: "financialLedger" },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: "/finance", label: "Financial Ledger", moduleKey: "financialLedger" },
      { href: "/expenses", label: "Expenses", moduleKey: "customExpenses" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/announcements", label: "Announcements", moduleKey: "announcements" },
      { href: "/reports", label: "Reports & Analytics", moduleKey: "reportsAndAnalytics" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export function isNavItemVisible(item: NavItem, role: Role | null): boolean {
  return (
    (item.moduleKey === undefined || enabledModules[item.moduleKey]) &&
    canAccessRoute(role, item.href)
  );
}

/** Visible groups for a role; empty groups are omitted. */
export function filterNavGroups(role: Role | null): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => isNavItemVisible(item, role)),
  })).filter((group) => group.items.length > 0);
}

/** Flat list — still used for route-matching helpers. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** Items visible for a role, honoring enabledModules + route permissions. */
export function filterNavItems(role: Role | null): NavItem[] {
  return NAV_ITEMS.filter((item) => isNavItemVisible(item, role));
}