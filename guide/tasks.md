# Educational Management Portal (EMP) — Execution Plan

## System Overview
A white-label Educational Management Portal (EMP) built using a config-first architecture (`institution.config.ts`).
- Tech Stack: Next.js, Tailwind CSS, shadcn/ui, TypeScript.
- Financial Model: Net Cashflow = Fees - (Payroll + Expenses).
- Config-Driven: All branding, titles, active modules, and UI themes are derived dynamically from `institution.config.ts`.

---

## Execution Phases

### Phase 1: Mock Data Architecture & Data Schema Setup ✅
- [x] Analyze required entities (Users, Students, Teachers, Courses, Classes, Attendance, Fee Vouchers, Payroll, Expenses).
- [x] Create structured JSON/TS mock data files in `/data` with complete relational IDs (e.g., `studentId` linked to `classId` and `feeVoucherId`).
- [x] Create TypeScript types/interfaces for all entities to ensure strict type safety across the app.

### Phase 2: Core Shell, Layout & Dynamic Theme Engine ✅
- [x] Connect `institution.config.ts` to the global layout.
- [x] Build responsive Sidebar & Header driven dynamically by config color tokens (`primary`, `accent`, `muted`, etc.).
- [x] Ensure branding identity (Logo, Institution Name, Terminology like "Student" vs "Trainee") renders dynamically from config across all shell components.

### Phase 3: Fake Auth Engine & Role Switching ✅
- [x] Build Mock Auth Provider / Context storing current session state.
- [x] Create interactive Header Role Switcher (`Super Admin`, `Admin`, `Teacher`, `Student`) allowing 1-click account switching.
- [x] Create persistent local state (or React Context) so logging in as a specific user profile instantly updates the app state.

### Phase 4: Role-Based Permission & Navigation Guarding ✅
- [x] Map navigation sidebar links to roles (e.g., restrict `/finance` and `/settings` from Teachers and Students).
- [x] Implement UI Permission Guards (`<HasPermission role={...}>`) to hide/show specific action buttons (e.g., "Add Expense", "Edit Student", "Pay Fee") based on active session.

### Phase 5: UI Design & Page Layouts (Dashboards & Directories) ✅
- [x] Build Dashboard Pages for all 4 roles (Super Admin cashflow summary, Admin operational stats, Teacher schedule, Student attendance/fees).
- [x] Build Directory UI Shells: `/students` table, `/teachers` table, `/courses` catalog, `/classes` batch view.

### Phase 6: Interactive Forms & Modal UI Design ✅
- [x] Build Modal UI for Student CRUD (Add/Edit Student form with Zod validation).
- [x] Build Modal UI for Teacher CRUD & Course Assignments.
- [x] Build Attendance Marker UI grid for Students and Teachers with status toggles (`Present`, `Absent`, `Late`, `Leave`).

### Phase 7: Data Wiring & Mock State Integration ✅
- [x] Connect Directory pages and Dashboards to reading from `/data` mock store.
- [x] Wire up search bars, class/grade filters, and status filters across all tables.
- [x] Connect CRUD modals to update state locally so adding/editing a student or teacher updates the UI in real time.

### Phase 8: Financial Logic, Ledger Calculations & Final Polish ✅
- [x] Wire up Fee Collection, Teacher Payroll, and Custom Expense forms to the Central Mock Store.
- [x] Implement Net Cashflow calculation logic:
      Net Cashflow = Sum(Fees Paid) - [Sum(Salaries Paid) + Sum(Custom Expenses)]
- [x] Ensure Super Admin Dashboard updates real-time financial metrics whenever fees are paid or expenses are logged.
- [x] Settings Page (`/settings`) review, light/dark mode verification, and final build chec


- [x] **Phase 9: Core Feature Completion & Access Control Polish**
  - [x] Implement unauthenticated `/login` page with role-preset switches, add `logout()` to `AuthProvider`, protect shell routes, and add "Sign Out" to `Header`.
  - [x] Create `<StudentDetailModal/>` displaying full profile, guardian contacts, attendance meter, and fee vouchers upon clicking a student row in `/students`.
  - [x] Add Faculty Attendance tab to `/attendance`, extend `useStore()` with `teacherAttendance` state and `recordTeacherAttendance` mutator.
  - [x] Scope-gate `/attendance` class selector to assigned batches for Teachers; lock historical attendance dates as read-only for Teachers and require explicit "Edit Historical Attendance" toggle for Admins.
  - [x] Build interactive `AnnouncementsManager` and `<AnnouncementModal/>` on `/announcements` backed by `useStore()` state and permission guards.
  - [x] Build `ReportsManager` on `/reports` featuring Financial Collection, Attendance Analytics, and Payroll/Expense breakdown widgets.
  - [x] Verify `tsc --noEmit`, `eslint .`, and `next build` pass cleanly across all routes.

  - [x] **Phase 10: System Productionization, Auto-IDs & Fee Flow Extensions**
  - [x] **Auto-Generated Roll Numbers & Teacher IDs:** Add `rollNumberConfig` and `teacherIdConfig` to `institution.config.ts`. Lock manual ID inputs in `StudentModal` and `TeacherModal`, generating sequence numbers automatically on submission.
  - [x] **Production Auth Flow:** Add credential inputs (Email + Password) to `/login`. Remove multi-account demo role switching from the Header dropdown, keeping only active user info and "Sign Out".
  - [x] **Student Directory UX Optimization:** Default `/students` to prompt for a Class Batch selection, or implement pagination (10 per page) when "All Classes" is selected.
  - [x] **Trainee Portal Finance View:** Add a dedicated `/my-vouchers` or `/fees` route for Trainees to view their fee ledger and download receipts.
  - [x] **Voucher Generation Engine:** Add a "Generate Batch Vouchers" modal to `/finance` for monthly billing cycles and installment schedule generation for course-based enrollments.
  - [x] **Multi-Role Announcement Targeting:** Update `AnnouncementModal` audience field to multi-select checkboxes (Trainees, Teachers, Admins) and adjust feed filtering rules.
  - [x] **Build & Quality Audit:** Verify `tsc --noEmit`, `eslint .`, and `next build` pass cleanly across all routes.

  - [x] **Phase 11: UI Polish, Mobile Navigation & Interactive Drawers**
  - [x] **Mobile Navigation Sheet/Drawer:** Add a responsive header with a hamburger menu trigger for screen widths `<768px` so mobile users can navigate across all pages seamlessly.
  - [x] **Teacher Detail Slide-Over Drawer:** Implement a slide-over drawer on `/teachers` when clicking a teacher card, showing assigned courses, qualification details, and the last 10 salary disbursement records.
  - [x] **Trainee & Class Detail Drawers:** Implement click-to-view slide-over drawers on `/students` (profile, fee history, attendance) and `/class-directory` (enrolled student roster).
  - [x] **Universal Skeleton Components:** Create reusable `<TableSkeleton />`, `<CardSkeleton />`, and `<StatSkeleton />` utilities with Next.js `loading.tsx` suspense boundaries across all route segments.
  - [x] **High-Performance Micro-Animations:** Add lightweight CSS transitions (`transition-all duration-200 ease-in-out hover:-translate-y-0.5`, backdrop fades, scale modal entrances) and subtle skeleton feedback during search/filter updates.
  - [x] **Toast Notifications:** Integrate `sonner` or a lightweight toast utility for animated visual confirmations on form saves and voucher actions.