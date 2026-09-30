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


  ### Phase 12 ✅: Single Class Directory, Drawer Editing Capabilities & Onboarding Token Flow (Frontend Mock State)

> Tracker note: this arrived appended as a second "Phase 11"; recorded as **Phase 12** to keep phases unambiguous. All items complete — see section list below.

Refine and polish the **PakMillat** frontend architecture. Consolidate separate course/class pages into a unified, interactive **Class Directory** with full inline editing capabilities across slide-over drawers, and implement token-based onboarding UI using state stores.

---

#### 1. Page Consolidation: Master Class Directory (`/class-directory`)
- **Remove/Deprecate:** Standalone `/courses` pages or duplicate course list views.
- **Unified View:** `/class-directory` is the primary hub. Display cards for each class (e.g., *Class 9th*, *Class 10th*, *1st Year*).
- **Class Cards Display:**
  - Class Name, Section, and Monthly Fee (e.g., PKR 1,500/mo).
  - Assigned Lead Teacher(s).
  - Quick count badges for enrolled students and assigned subjects.

---

#### 2. Enhanced Class Detail Drawer
When clicking a Class Card, open a comprehensive Slide-Over Drawer:
- **Editable Class Header:** Inline edit toggle to update Class Name, Section, and Monthly Fee.
- **Subjects Section:**
  - List associated subjects (e.g., *Math*, *English*, *Computer*).
  - Include a **"View/Edit Syllabus Outline"** button per subject that opens a nested modal/drawer to add, reorder, or update chapters and topics.
  - Option to attach/assign specific teachers per subject.
- **Enrolled Roster Tab:**
  - Paginated/scrollable list of enrolled students with Roll Numbers and Status indicators.
  - Quick actions: Remove student or edit enrollment details.
- **Class Schedule / Timetable Tab:**
  - Displays timing slots for this specific class.

---

#### 3. Global Drawer Inline Editing Across All Entities
Ensure every detail drawer across the system supports direct inline editing:
- **Teacher Drawer (`/teachers`):**
  - View bio, salary details, and contract terms.
  - Add an **"Edit Teacher Profile"** mode inside the drawer to update name, contact, salary, and subject assignments without leaving the drawer.
- **Student/Trainee Drawer (`/students`):**
  - View roll number, monthly fee voucher history, and attendance.
  - Add an **"Edit Student Info"** toggle to update personal details, fee concessions, or class assignment.

---

#### 4. Subject Master Management (`/subjects`)
- Simple management page to create and maintain master subject names (e.g., *Mathematics*, *English*, *Biology*, *Computer Science*).
- When creating/editing a Class in `/class-directory`, display a **Checkbox List** populated from this Master Subject list.

---

#### 5. Token-Based Onboarding UI Flow (Mock State Store)
- **Admin Side (`/onboarding-tokens` or Modal):**
  - Modal to generate invitation codes (e.g., `TCH-8921` or `STU-4410`).
  - Form fields: Role (`Teacher` | `Student`), Offered Salary / Fee Discount, Contract Notes, Expiry.
  - Stores token state in Zustand.
- **Login Page (`/login`):**
  - Add a **"Have an invitation code / token?"** option.
  - Validates code against mock store and routes to a custom registration form pre-filled with locked salary/agreed terms.
- **Admin Verification Queue:**
  - Pending approval screen where Admin can review submitted registrations, click **"Approve & Assign Class-Subjects"**, delete the used token, and save the active user.

---

#### 6. Interactive Timetable View (`/timetable`)
- Grid layout supporting filter toggles for Admin, Teacher, and Student views:
  - **Admin View:** Full schedule grid with conflict highlighting if a teacher is double-booked.
  - **Teacher View:** Filtered schedule showing personal daily/weekly lecture periods.
  - **Student View:** Class-specific schedule with periods, room numbers, and subject teachers.

#### Phase 12 Completion Checklist ✅
- [x] **Class Directory Consolidation:** `/class-directory` is the single hub; `/courses` redirects to `/subjects`, `/classes` redirects to `/class-directory`. Class cards show monthly fee, subject count, lead teacher, enrolled counts, and sessions.
- [x] **Comprehensive Class Detail Drawer:** Inline edit (name/section/monthly fee) + Subjects tab with per-subject "View/Edit Syllabus" modal (chapters/topics/test ranges, reorder) and per-subject teacher assign + Roster tab + Schedule tab.
- [x] **Universal Inline Drawer Editing:** Teacher drawer edits bio/contact/salary/subject assignments; Student drawer edits profile/class assignment/fee concession.
- [x] **Master Subject CRUD (`/subjects`):** Create/edit/delete subjects (Courses) + syllabus counts, used as checkbox list in class creation/edit.
- [x] **Token-Based Onboarding UI:** Admin `TokenGeneratorModal` issues single-use codes (TCH-/STU-) with locked salary/concession terms; `/login` "Accept it" trigger routes to public `/onboard` redemption form pre-filled with locked terms; `/onboarding-approvals` queue reviews submissions, assigns class/subjects, approves (creating user + teacher/student records) / rejects, and revokes/deletes tokens.
- [x] **Multi-Role Timetable Engine (`/timetable`):** Grid with master/teacher/class scopes, role-default view, and double-booking collision warnings (shared `lib/timetable.ts`).
- [x] **Build & Quality Audit:** `tsc --noEmit`, `eslint .`, and `next build` (19 routes) pass cleanly.

- [x] **Phase 13: Subject Manager Cleanup, Tabular Timetable CRUD & Read-Only Drawer States**
  - [x] **Subject Manager Refactoring:** Rename "Course Master" to "Subject Manager" across routing and sidebar. Strip out Fee, Credit Hours, and Teacher fields from the master creation modal and table.
  - [x] **Tabular Timetable & Editing:** Re-architect `/timetable` into a tabular grid (Days vs Time Slots) with full slot creation, editing, and teacher/room conflict detection.
  - [x] **Default Read-Only Drawer States:** Update Class Drawer Subjects tab and Syllabus Outline modal to render in read-only view mode by default with an explicit "Edit" toggle to allow edits.

#### Phase 13 Completion Checklist ✅
- [x] **Subject Manager Refactoring:** Sidebar item, page header, and modals renamed to "Subject Manager". `Course` entity stripped to `{ id, code, title, description, syllabus }` (Credit Hours / Fee / Teacher Assignment removed from the type, Zod `subjectSchema`, the table columns, and the Add/Edit modal). Subject→teacher relationships moved to `ClassBatch.subjectTeachers` + `ClassSession.teacherId`; consolidated billing lives on `ClassBatch.monthlyFee` (batch voucher generation now bills from it and applies each student's fee concession as the voucher discount).
- [x] **Tabular Timetable & Editing:** `/timetable` re-architected into a true matrix — rows = time periods, columns = Mon–Sun. "+ Add Slot" modal (class/day/subject/start/end/teacher/room) plus per-cell Edit/Delete for Admins; live validation blocks teacher double-bookings and warns on room clashes, with red (teacher) / amber (room) highlights across the grid. New store mutators: `addClassSession`, `updateClassSession`, `removeClassSession`; shared `lib/timetable.ts` gains `findRoomCollisionIds` and `timeSlots`.
- [x] **Default Read-Only Drawer States:** Class Drawer Subjects tab renders teacher assignments as static text behind a permissions-gated "Edit Assignments" toggle (`setClassSubjectTeacher` writes through). The Syllabus Outline modal now opens in a clean read-only chapter/topic/test-range list with a permissions-gated "Edit Syllabus" toggle switching to the full editor.
- [x] **Build & Quality Audit:** `tsc --noEmit`, `eslint .` (zero errors/warnings), and `next build` (19 routes) pass cleanly.

- [x] **Phase 14: Dedicated Class Detail Pages, Period-Based Timetable Engine & Sidebar Reorganization**
  - [x] **Dedicated Class Route (`/class-directory/[classId]`):** Remove class detail drawer. Make class cards route to a dedicated page containing full tabs (Overview, Subjects & Syllabus, Roster, Timetable) and a complete Edit Class Modal with Add/Remove Subject options.
  - [x] **Class Creation Simplification:** Remove scheduling input fields and capacity options from the Create Class modal (keep it limited to Class Name, Section, and Monthly Fee).
  - [x] **Period-Based Timetable Matrix:** Build master period definition logic (e.g., Period 1 to 5 + Break slots).
  - [x] **Multi-Day Slot Assignment:** Allow single-click multi-day selection (e.g., Mon–Sat) when assigning a class and subject to a period. Auto-fill assigned subject teacher and room, with custom overrides hidden under an "Advanced Settings" accordion.
  - [x] **Grouped Sidebar Architecture:** Reorganize sidebar navigation into structured categories (ACADEMICS, PEOPLE, FINANCE, SYSTEM) with muted section headings and active tab highlighting.

#### Phase 14 Completion Checklist ✅
- [x] **Dedicated Class Route:** New `/class-directory/[classId]` (dynamic, `params: Promise` awaited per Next 16) renders `ClassDetailPage` with header stat cards (monthly fee, subjects, enrolled/capacity, lead teacher) and four tabs: **Overview** (batch details + assigned subjects), **Subjects & Syllabus** (per-subject "View/Edit Syllabus" → `SyllabusModal`), **Trainee Roster** (contact details hidden for non-`viewStudents` roles), **Timetable** (scoped matrix + Admin "Assign Slot"). The old `class-detail-drawer` was removed; directory cards now `Link` to the page. A "Manage Periods" master editor lives on `/timetable`.
- [x] **Class Creation Simplification:** `classSchema` reduced to Class Name, Section, Monthly Fee only; the Create modal shows just those three. A separate `classEditSchema` powers the full "Edit Class" modal (adds Academic Year, lead Teacher, Room, Capacity, and a master-subject **add/remove** checkbox list). `store.addClass` accepts the minimal input and defaults the rest; new `updateClassSubjects` mutator keeps teacher maps + slots in sync when subjects change.
- [x] **Period-Based Timetable Matrix:** `SchoolPeriod` type + `data/periods.ts` master seed (P1–P8 + Break/Lunch). Timetable rows are now master periods (breaks render full-width); sessions carry an optional `periodId`. New `setPeriods` store state + mutator; `PeriodEditorModal` lets Admins add/rename/retime/remove periods. Slot assignment and collision detection work off periods.
- [x] **Multi-Day Slot Assignment:** `SlotFormModal` selects Class + Subject + Period and **multiple days at once**; teacher + room auto-fill from `ClassBatch.subjectTeachers`/batch room, with manual overrides behind a collapsed **"Advanced Settings"** toggle. Days where the teacher is already booked are blocked and auto-skipped (with a warning); room sharing is a soft notice. The dedicated class page locks the batch selector to that class.
- [x] **Grouped Sidebar Architecture:** `nav-items.ts` reorganized into `NAV_GROUPS` (Academics, People, Finance, System) with `filterNavGroups`; `Sidebar` and `MobileNav` render muted uppercase section headings + active highlighting. `TERMS`/labels stay terminology-driven.
- [x] **Build & Quality Audit:** `tsc --noEmit`, `eslint .` (zero errors/warnings), and `next build` (20 routes, incl. dynamic `/class-directory/[classId]`) pass cleanly.