import type { Role } from "@/types";

// Permission mapping (Phase 4) — single source of truth for role-based access.
// Derived from the EMP Role Matrix: Super Admin (full), Admin (operations),
// Teacher (schedule/attendance/payslips), Student (own data only).

export type Permission =
  | "viewDashboard"
  | "viewOwnProfile"
  | "viewStudents"
  | "manageStudents"
  | "viewTeachers"
  | "manageTeachers"
  | "viewCourses"
  | "viewClasses"
  | "manageClasses"
  | "viewSubjects"
  | "manageSubjects"
  | "viewTimetable"
  | "manageOnboarding"
  | "markAttendance"
  | "viewOwnAttendance"
  | "viewOwnVouchers"
  | "viewFinance"
  | "manageExpenses"
  | "generateVouchers"
  | "payOwnFees"
  | "viewPayroll"
  | "viewOwnPayslips"
  | "viewReports"
  | "viewAnnouncements"
  | "manageAnnouncements"
  | "viewSettings"
  | "manageUsers";

const ALL_ROLES: readonly Role[] = ["super_admin", "admin", "teacher", "student"];

/** Which roles hold each permission. Extend here as later phases add actions. */
export const ROLE_PERMISSIONS: Record<Permission, readonly Role[]> = {
  viewDashboard: ALL_ROLES,
  viewOwnProfile: ALL_ROLES,

  viewStudents: ["super_admin", "admin"],
  manageStudents: ["super_admin", "admin"],

  viewTeachers: ["super_admin", "admin"],
  manageTeachers: ["super_admin", "admin"],

  viewCourses: ALL_ROLES,
  viewClasses: ALL_ROLES,
  manageClasses: ["super_admin", "admin"],
  viewSubjects: ALL_ROLES,
  manageSubjects: ["super_admin", "admin"],
  viewTimetable: ALL_ROLES,
  manageOnboarding: ["super_admin", "admin"],

  markAttendance: ["super_admin", "admin", "teacher"],
  viewOwnAttendance: ["student"],
  viewOwnVouchers: ["student"],

  viewFinance: ["super_admin", "admin"],
  manageExpenses: ["super_admin", "admin"],
  generateVouchers: ["super_admin", "admin"],
  payOwnFees: ["student"],

  viewPayroll: ["super_admin"],
  viewOwnPayslips: ["teacher"],

  viewReports: ["super_admin", "admin"],

  viewAnnouncements: ALL_ROLES,
  manageAnnouncements: ["super_admin", "admin"],

  viewSettings: ["super_admin"],
  manageUsers: ["super_admin"],
};

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (role === null) return false;
  return ROLE_PERMISSIONS[permission].includes(role);
}

export function hasAnyPermission(role: Role | null, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role | null, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/** Route → required permission. A route absent from this map is public to all roles. */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/students": "viewStudents",
  "/teachers": "viewTeachers",
  "/class-directory": "viewClasses",
  "/subjects": "viewSubjects",
  "/timetable": "viewTimetable",
  "/onboarding-approvals": "manageOnboarding",
  "/attendance": "markAttendance",
  "/finance": "viewFinance",
  "/expenses": "manageExpenses",
  "/reports": "viewReports",
  "/settings": "viewSettings",
  "/my-vouchers": "viewOwnVouchers",
};

export function canAccessRoute(role: Role | null, href: string): boolean {
  if (role === null) return false;
  const required = ROUTE_PERMISSIONS[href];
  return required === undefined || hasPermission(role, required);
}

