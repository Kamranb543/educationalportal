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
}

export interface Course {
  id: string;
  code: string;
  title: string;
  /** Assigned teacher (tch-xx). */
  teacherId: string;
  creditHours: number;
  /** Tuition charged per enrolled student, per month. */
  feePerStudent: number;
  description: string;
}

export interface ClassBatch {
  id: string;
  name: string;
  academicYear: string;
  /** Courses taught in this batch (crs-xx). */
  courseIds: string[];
  /** Lead teacher responsible for the batch (tch-xx). */
  teacherId: string;
  room: string;
  schedule: string;
  capacity: number;
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
