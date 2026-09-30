// types/index.ts — Strict entity contracts for the EMP mock database.
// All IDs follow a "<prefix>-<nn>" convention (usr-, tch-, std-, crs-, cls-, att-, vch-, prl-, exp-).

export type Role = "super_admin" | "admin" | "teacher" | "student";

export type AccountStatus = "active" | "inactive" | "suspended";

export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export type VoucherStatus = "paid" | "partial" | "pending" | "overdue";

export type PayrollStatus = "paid" | "processing" | "pending";

export type ExpenseStatus = "approved" | "pending" | "rejected";

export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "supplies"
  | "maintenance"
  | "marketing"
  | "misc";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Mock credential for the demo login flow (never a real secret). */
  password: string;
  /** Linked teacher profile when role === "teacher". */
  teacherId: string | null;
  /** Linked student profile when role === "student". */
  studentId: string | null;
  status: AccountStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  /** Monthly gross base salary in institution currency. */
  baseSalary: number;
  joiningDate: string;
  status: AccountStatus;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  /** Owning class batch (cls-xx). */
  classId: string;
  admissionDate: string;
  status: AccountStatus;
  /** Monthly fee concession (discount) granted by an admin. */
  feeConcession?: number;
}

/** A single teaching unit in a subject syllabus. */
export interface SyllabusTopic {
  id: string;
  title: string;
  /** Chapters covered, e.g. "1-4". */
  testRange: string;
}

export interface SyllabusChapter {
  id: string;
  title: string;
  topics: SyllabusTopic[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  /** Structured syllabus outline (chapters → topics → test ranges). */
  syllabus: SyllabusChapter[];
}

export type WeekDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

/** A master timetable period (lecture or break) defining the schedule rows. */
export interface SchoolPeriod {
  id: string;
  label: string;
  start: string;
  end: string;
  kind: "lecture" | "break";
}

/** One scheduled lecture slot for a class batch (timetable cell). */
export interface ClassSession {
  id: string;
  day: WeekDay;
  /** Lecture start/end in HH:MM. */
  start: string;
  end: string;
  /** Subject taught in this slot (crs-xx). */
  courseId: string;
  room: string;
  /** Optional explicit teacher override for this slot. */
  teacherId?: string;
  /** Master period (per-school timetable period) this slot occupies. */
  periodId?: string;
}

export interface ClassBatch {
  id: string;
  name: string;
  /** Section identifier, e.g. "A" / "B". */
  section: string;
  academicYear: string;
  /** Subjects taught in this batch (crs-xx). */
  courseIds: string[];
  /** Teacher assigned to each subject in this batch (courseId → tch-xx). */
  subjectTeachers: Record<string, string>;
  /** Lead teacher responsible for the batch (tch-xx). */
  teacherId: string;
  room: string;
  schedule: string;
  capacity: number;
  /** Consolidated monthly fee billed per student (e.g. PKR 1,500/mo). */
  monthlyFee: number;
  /** Weekly timetable slots for this batch. */
  sessions: ClassSession[];
}

export interface AttendanceRecord {
  id: string;
  /** ISO date (YYYY-MM-DD) of the session. */
  date: string;
  classId: string;
  studentId: string;
  /** Teacher who marked the session (crs teacher or batch lead). */
  teacherId: string;
  courseId: string;
  status: AttendanceStatus;
  markedAt: string;
}

export interface FeePayment {
  date: string;
  amount: number;
  method: "cash" | "bank-transfer" | "online";
  reference: string;
}

export interface FeeVoucher {
  id: string;
  voucherNumber: string;
  studentId: string;
  classId: string;
  /** Billing month as YYYY-MM. */
  period: string;
  issueDate: string;
  dueDate: string;
  /** Gross amount = sum of course fees for the batch. */
  amount: number;
  discount: number;
  paidAmount: number;
  payments: FeePayment[];
  status: VoucherStatus;
}

export interface PayrollRecord {
  id: string;
  payslipNumber: string;
  teacherId: string;
  /** Payslip month as YYYY-MM. */
  period: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
  paidDate: string | null;
}

export interface Expense {
  id: string;
  receiptNumber: string;
  category: ExpenseCategory;
  title: string;
  description: string;
  amount: number;
  date: string;
  /** Approving admin user (usr-xx). */
  approvedById: string;
  status: ExpenseStatus;
}

export type AnnouncementAudience = "students" | "teachers" | "admins";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  /** One or more target role groups; an empty array means everyone. */
  audience: AnnouncementAudience[];
  priority: "normal" | "urgent";
  pinned: boolean;
  /** Author user (usr-xx). */
  authorId: string;
  createdAt: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  /** Faculty member (tch-xx). */
  teacherId: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  status: AttendanceStatus;
  markedAt: string;
}

export type InviteTokenRole = "teacher" | "student";
export type InviteTokenStatus = "active" | "used" | "revoked";

/** Single-use invitation issued by an admin to onboard a teacher/trainee. */
export interface InviteToken {
  id: string;
  /** Human-readable code, e.g. "TCH-8921" or "STU-4410". */
  code: string;
  role: InviteTokenRole;
  /** Offered monthly salary (teacher) or fee discount % (student). */
  offeredSalary: number | null;
  feeDiscount: number | null;
  contractNotes: string;
  createdBy: string;
  createdAt: string;
  /** ISO date after which the token can no longer be redeemed. */
  expiresAt: string;
  status: InviteTokenStatus;
}

export type OnboardingStatus = "pending" | "approved" | "rejected";

/** A registration submitted against an invitation token, awaiting admin review. */
export interface OnboardingApplication {
  id: string;
  tokenCode: string;
  role: InviteTokenRole;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  /** Snapshot of the token's agreed terms at submission time. */
  offeredSalary: number | null;
  feeDiscount: number | null;
  contractNotes: string;
  /** Class + subjects the admin assigns on approval (teacher). */
  classId: string | null;
  courseIds: string[];
  submittedAt: string;
  status: OnboardingStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

/** Aggregated shape of the whole mock database. */
export interface MockDatabase {
  users: User[];
  teachers: Teacher[];
  students: Student[];
  courses: Course[];
  classes: ClassBatch[];
  attendance: AttendanceRecord[];
  feeVouchers: FeeVoucher[];
  payroll: PayrollRecord[];
  expenses: Expense[];
}

/** Derived, join-annotated view used by dashboards in later phases. */
export interface StudentWithRelations extends Student {
  className: string;
  enrolledCourseIds: string[];
  outstandingBalance: number;
  attendancePercentage: number;
}

export interface PayrollWithTeacher extends PayrollRecord {
  teacherName: string;
}

export interface VoucherWithStudent extends FeeVoucher {
  studentName: string;
  className: string;
  balance: number;
}
