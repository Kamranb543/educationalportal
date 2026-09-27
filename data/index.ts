import type {
  MockDatabase,
  Student,
  Teacher,
  Course,
  ClassBatch,
  FeeVoucher,
  PayrollRecord,
  Expense,
  User,
  StudentWithRelations,
  VoucherWithStudent,
  PayrollWithTeacher,
} from "@/types";
import { defaultInstitutionConfig } from "@/institution.config";
import { users } from "@/data/users";
import { teachers } from "@/data/teachers";
import { students } from "@/data/students";
import { courses } from "@/data/courses";
import { classes } from "@/data/classes";
import { attendance } from "@/data/attendance";
import { feeVouchers } from "@/data/feeVouchers";
import { payroll } from "@/data/payroll";
import { expenses } from "@/data/expenses";

/** Root of the frontend mock database. Swap for a real API client in a later phase. */
export const db: MockDatabase = {
  users,
  teachers,
  students,
  courses,
  classes,
  attendance,
  feeVouchers,
  payroll,
  expenses,
};

// ---------------------------------------------------------------------------
// ID-based lookup helpers (strict, return undefined if not found)
// ---------------------------------------------------------------------------

export const getTeacherById = (id: string): Teacher | undefined =>
  teachers.find((t) => t.id === id);

export const getStudentById = (id: string): Student | undefined =>
  students.find((s) => s.id === id);

export const getClassById = (id: string): ClassBatch | undefined =>
  classes.find((c) => c.id === id);

export const getCourseById = (id: string): Course | undefined =>
  courses.find((c) => c.id === id);

export const getUserById = (id: string): User | undefined =>
  users.find((u) => u.id === id);

export const getCoursesForClass = (classId: string): Course[] => {
  const cls = getClassById(classId);
  if (!cls) return [];
  return cls.courseIds
    .map((cid) => getCourseById(cid))
    .filter((c): c is Course => c !== undefined);
};

export const getStudentsForClass = (classId: string): Student[] =>
  students.filter((s) => s.classId === classId);

export const getVouchersForStudent = (studentId: string): FeeVoucher[] =>
  feeVouchers.filter((v) => v.studentId === studentId);

export const getPayrollForTeacher = (teacherId: string): PayrollRecord[] =>
  payroll.filter((p) => p.teacherId === teacherId);

// ---------------------------------------------------------------------------
// Financial aggregations (Net Cashflow = Fees - (Payroll + Expenses))
// ---------------------------------------------------------------------------

export const totalFeesCollected = (): number =>
  feeVouchers.reduce((sum, v) => sum + v.paidAmount, 0);

export const totalOutstandingFees = (): number =>
  feeVouchers.reduce((sum, v) => sum + (v.amount - v.discount - v.paidAmount), 0);

export const totalPayrollPaid = (): number =>
  payroll
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.netPay, 0);

export const totalPayrollCommitted = (): number =>
  payroll.reduce((sum, p) => sum + p.netPay, 0);

export const totalExpenses = (): number =>
  expenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);

export const netCashflow = (): number =>
  totalFeesCollected() - (totalPayrollPaid() + totalExpenses());

// ---------------------------------------------------------------------------
// Formatting bound to institution.config.ts (never hardcode currency)
// ---------------------------------------------------------------------------

const { currencySymbol, currencyCode } = defaultInstitutionConfig.localization;

export const formatCurrency = (amount: number): string =>
  `${currencySymbol} ${new Intl.NumberFormat("en-PK", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount)}`.trim();

export const currencyCodeLabel = currencyCode;

// ---------------------------------------------------------------------------
// Joined view helpers for dashboards
// ---------------------------------------------------------------------------

export const attendancePercentageForStudent = (studentId: string): number => {
  const records = attendance.filter((a) => a.studentId === studentId);
  if (records.length === 0) return 0;
  const present = records.filter(
    (a) => a.status === "present" || a.status === "late",
  ).length;
  return Math.round((present / records.length) * 100);
};

export const studentOutstandingBalance = (studentId: string): number =>
  getVouchersForStudent(studentId).reduce(
    (sum, v) => sum + (v.amount - v.discount - v.paidAmount),
    0,
  );

export const getStudentsWithRelations = (): StudentWithRelations[] =>
  students.map((s) => {
    const cls = getClassById(s.classId);
    return {
      ...s,
      className: cls?.name ?? "Unassigned",
      enrolledCourseIds: cls?.courseIds ?? [],
      outstandingBalance: studentOutstandingBalance(s.id),
      attendancePercentage: attendancePercentageForStudent(s.id),
    };
  });

export const getVouchersWithStudent = (): VoucherWithStudent[] =>
  feeVouchers.map((v) => {
    const student = getStudentById(v.studentId);
    const cls = getClassById(v.classId);
    return {
      ...v,
      studentName: student?.name ?? "Unknown",
      className: cls?.name ?? "Unassigned",
      balance: v.amount - v.discount - v.paidAmount,
    };
  });

export const getPayrollWithTeacher = (): PayrollWithTeacher[] =>
  payroll.map((p) => {
    const teacher = getTeacherById(p.teacherId);
    return { ...p, teacherName: teacher?.name ?? "Unknown" };
  });

export const getExpensesByCategory = (): Record<string, number> =>
  expenses
    .filter((e: Expense) => e.status === "approved")
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});
