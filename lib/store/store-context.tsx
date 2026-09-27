"use client";

// Central mock store (Phase 7). Single reactive source of application data,
// seeded from the static /data datasets and exposed through useStore().
// Mutators update state in place so dashboards, directories and managers stay
// synchronized application-wide. Static /data remains the seed + pure helpers.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Announcement,
  AnnouncementAudience,
  AttendanceRecord,
  AttendanceStatus,
  Course,
  ClassBatch,
  Expense,
  ExpenseCategory,
  FeePayment,
  FeeVoucher,
  PayrollRecord,
  Student,
  StudentWithRelations,
  Teacher,
  TeacherAttendanceRecord,
} from "@/types";
import { users as seedUsers } from "@/data/users";
import { teachers as seedTeachers } from "@/data/teachers";
import { students as seedStudents } from "@/data/students";
import { courses as seedCourses } from "@/data/courses";
import { classes as seedClasses } from "@/data/classes";
import { attendance as seedAttendance } from "@/data/attendance";
import { feeVouchers as seedVouchers } from "@/data/feeVouchers";
import { payroll as seedPayroll } from "@/data/payroll";
import { expenses as seedExpenses } from "@/data/expenses";
import { announcements as seedAnnouncements } from "@/data/announcements";
import { teacherAttendance as seedTeacherAttendance } from "@/data/teacherAttendance";
import { formatEmployeeId, formatRollNumber, maxSequence } from "@/lib/ids";
import { config } from "@/lib/config";

export interface NewStudentInput {
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  classId: string;
  status: Student["status"];
}

export interface NewTeacherInput {
  name: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  baseSalary: number;
  status: Teacher["status"];
}

export interface NewExpenseInput {
  title: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
}

export interface NewAnnouncementInput {
  title: string;
  body: string;
  audience: AnnouncementAudience[];
  priority: Announcement["priority"];
  pinned: boolean;
  authorId: string;
}

interface StoreValue {
  // Reactive collections
  users: typeof seedUsers;
  teachers: Teacher[];
  students: Student[];
  courses: Course[];
  classes: ClassBatch[];
  attendance: AttendanceRecord[];
  feeVouchers: FeeVoucher[];
  payroll: PayrollRecord[];
  expenses: Expense[];
  announcements: Announcement[];
  teacherAttendance: TeacherAttendanceRecord[];

  // Mutators
  addStudent: (input: NewStudentInput) => Student;
  updateStudent: (id: string, patch: Partial<Omit<Student, "id">>) => void;
  addTeacher: (input: NewTeacherInput) => Teacher;
  updateTeacher: (id: string, patch: Partial<Omit<Teacher, "id">>) => void;
  nextRollNumber: () => string;
  nextEmployeeId: () => string;
  recordAttendance: (
    classId: string,
    date: string,
    statuses: Record<string, AttendanceStatus>,
  ) => void;
  recordTeacherAttendance: (
    date: string,
    statuses: Record<string, AttendanceStatus>,
  ) => void;
  collectFee: (voucherId: string, payment: FeePayment) => void;
  generateBatchVouchers: (classId: string, period: string) => number;
  markPayrollPaid: (payslipId: string) => void;
  addExpense: (input: NewExpenseInput, approvedById?: string) => Expense;
  addAnnouncement: (input: NewAnnouncementInput) => Announcement;
  toggleAnnouncementPin: (id: string) => void;

  // Derived lookups (from current reactive state)
  getStudentById: (id: string) => Student | undefined;
  getTeacherById: (id: string) => Teacher | undefined;
  getClassById: (id: string) => ClassBatch | undefined;
  getCourseById: (id: string) => Course | undefined;
  getStudentsForClass: (classId: string) => Student[];
  getVouchersForStudent: (studentId: string) => FeeVoucher[];
  getPayrollForTeacher: (teacherId: string) => PayrollRecord[];
  getAttendanceForTeacher: (teacherId: string) => TeacherAttendanceRecord[];
  getTeacherAttendanceForDate: (date: string) => TeacherAttendanceRecord[];
  attendancePercentageForStudent: (studentId: string) => number;
  studentOutstandingBalance: (studentId: string) => number;
  getStudentsWithRelations: () => StudentWithRelations[];

  // Financial aggregations
  totalFeesCollected: () => number;
  totalOutstandingFees: () => number;
  totalPayrollPaid: () => number;
  totalExpenses: () => number;
  netCashflow: () => number;
  getExpensesByCategory: () => Record<string, number>;
}

const StoreContext = createContext<StoreValue | null>(null);

/** Next numeric id for a "<prefix>-<nn>" collection, based on existing max. */
function nextId(existing: string[], prefix: string): string {
  const max = existing.reduce((acc, id) => {
    const n = Number(id.split("-")[1]);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(2, "0")}`;
}

function voucherBalance(v: FeeVoucher): number {
  return v.amount - v.discount - v.paidAmount;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [teacherList, setTeacherList] = useState<Teacher[]>(() => [...seedTeachers]);
  const [students, setStudents] = useState<Student[]>(() => [...seedStudents]);
  const [courses] = useState<Course[]>(() => [...seedCourses]);
  const [classes] = useState<ClassBatch[]>(() => [...seedClasses]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => [...seedAttendance]);
  const [feeVouchers, setFeeVouchers] = useState<FeeVoucher[]>(() => [...seedVouchers]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => [...seedPayroll]);
  const [expenses, setExpenses] = useState<Expense[]>(() => [...seedExpenses]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => [...seedAnnouncements]);
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendanceRecord[]>(
    () => [...seedTeacherAttendance],
  );

  const attCounter = useRef(seedAttendance.length);
  const tatCounter = useRef(seedTeacherAttendance.length);
  const expCounter = useRef(0);
  const annCounter = useRef(seedAnnouncements.length);
  const vchCounter = useRef(seedVouchers.length);

  // Roll numbers / employee IDs are auto-generated from config formats, never
  // hand-typed, so sequence stays unique. Peek helpers let modals preview them.
  const nextRollSequence = useCallback(
    () => maxSequence(students.map((s) => s.rollNumber), config.rollNumberConfig.separator) + 1,
    [students],
  );
  const nextRollNumber = useCallback(
    () => formatRollNumber(nextRollSequence()),
    [nextRollSequence],
  );
  const nextEmployeeSequence = useCallback(
    () => {
      const max = maxSequence(
        teacherList.map((t) => t.employeeId),
        config.teacherIdConfig.separator,
      );
      return Math.max(max, config.teacherIdConfig.startAt - 1) + 1;
    },
    [teacherList],
  );
  const nextEmployeeId = useCallback(
    () => formatEmployeeId(nextEmployeeSequence()),
    [nextEmployeeSequence],
  );

  const addStudent = useCallback<StoreValue["addStudent"]>(
    (input) => {
      const created: Student = {
        id: nextId(students.map((s) => s.id), "std"),
        rollNumber: formatRollNumber(nextRollSequence()),
        ...input,
        admissionDate: new Date().toISOString().slice(0, 10),
      };
      setStudents((prev) => [...prev, created]);
      return created;
    },
    [students, nextRollSequence],
  );

  const updateStudent = useCallback<StoreValue["updateStudent"]>((id, patch) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const addTeacher = useCallback<StoreValue["addTeacher"]>(
    (input) => {
      const created: Teacher = {
        id: nextId(teacherList.map((t) => t.id), "tch"),
        employeeId: formatEmployeeId(nextEmployeeSequence()),
        ...input,
        joiningDate: new Date().toISOString().slice(0, 10),
      };
      setTeacherList((prev) => [...prev, created]);
      return created;
    },
    [teacherList, nextEmployeeSequence],
  );

  const updateTeacher = useCallback<StoreValue["updateTeacher"]>((id, patch) => {
    setTeacherList((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const recordAttendance = useCallback<StoreValue["recordAttendance"]>(
    (classId, date, statuses) => {
      setAttendance((prev) => {
        const without = prev.filter((a) => !(a.classId === classId && a.date === date));
        const teacherId = classes.find((c) => c.id === classId)?.teacherId ?? "";
        const courseId = classes.find((c) => c.id === classId)?.courseIds[0] ?? "";
        const added: AttendanceRecord[] = Object.entries(statuses).map(
          ([studentId, status]) => {
            attCounter.current += 1;
            return {
              id: `att-live-${attCounter.current}`,
              date,
              classId,
              studentId,
              teacherId,
              courseId,
              status,
              markedAt: new Date().toISOString(),
            };
          },
        );
        return [...without, ...added];
      });
    },
    [classes],
  );

  const collectFee = useCallback<StoreValue["collectFee"]>((voucherId, payment) => {
    setFeeVouchers((prev) =>
      prev.map((v) => {
        if (v.id !== voucherId) return v;
        const paidAmount = v.paidAmount + payment.amount;
        const gross = v.amount - v.discount;
        const status: FeeVoucher["status"] = paidAmount >= gross ? "paid" : "partial";
        return { ...v, paidAmount, payments: [...v.payments, payment], status };
      }),
    );
  }, []);

  // Gross monthly tuition for a batch = sum of its course per-student fees.
  const classMonthlyAmount = useCallback(
    (classId: string): number => {
      const cls = classes.find((c) => c.id === classId);
      if (!cls) return 0;
      return cls.courseIds.reduce(
        (sum, cid) => sum + (courses.find((c) => c.id === cid)?.feePerStudent ?? 0),
        0,
      );
    },
    [classes, courses],
  );

  const generateBatchVouchers = useCallback<StoreValue["generateBatchVouchers"]>(
    (classId, period) => {
      const roster = students.filter(
        (s) => s.classId === classId && s.status === "active",
      );
      const gross = classMonthlyAmount(classId);
      const existing = new Set(
        feeVouchers
          .filter((v) => v.classId === classId && v.period === period)
          .map((v) => v.studentId),
      );
      const newVouchers: FeeVoucher[] = [];
      for (const student of roster) {
        if (existing.has(student.id)) continue;
        vchCounter.current += 1;
        newVouchers.push({
          id: `vch-${String(vchCounter.current).padStart(3, "0")}`,
          voucherNumber: `INV-${period.replace("-", "")}-${String(vchCounter.current).padStart(3, "0")}`,
          studentId: student.id,
          classId,
          period,
          issueDate: `${period}-01`,
          dueDate: `${period}-10`,
          amount: gross,
          discount: 0,
          paidAmount: 0,
          payments: [],
          status: "pending",
        });
      }
      if (newVouchers.length > 0) {
        setFeeVouchers((prev) => [...prev, ...newVouchers]);
      }
      return newVouchers.length;
    },
    [students, feeVouchers, classMonthlyAmount],
  );

  const addExpense = useCallback<StoreValue["addExpense"]>(
    (input, approvedById = "usr-01") => {
      expCounter.current += 1;
      const created: Expense = {
        id: `exp-live-${expCounter.current}`,
        receiptNumber: `RCP-LIVE-${String(expCounter.current).padStart(3, "0")}`,
        ...input,
        approvedById,
        status: "pending",
      };
      setExpenses((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const markPayrollPaid = useCallback<StoreValue["markPayrollPaid"]>((payslipId) => {
    setPayroll((prev) =>
      prev.map((p) =>
        p.id === payslipId
          ? { ...p, status: "paid", paidDate: new Date().toISOString().slice(0, 10) }
          : p,
      ),
    );
  }, []);

  const recordTeacherAttendance = useCallback<StoreValue["recordTeacherAttendance"]>(
    (date, statuses) => {
      setTeacherAttendance((prev) => {
        const without = prev.filter((a) => a.date !== date);
        const added: TeacherAttendanceRecord[] = Object.entries(statuses).map(
          ([teacherId, status]) => {
            tatCounter.current += 1;
            return {
              id: `tat-live-${tatCounter.current}`,
              teacherId,
              date,
              status,
              markedAt: new Date().toISOString(),
            };
          },
        );
        return [...without, ...added];
      });
    },
    [],
  );

  const addAnnouncement = useCallback<StoreValue["addAnnouncement"]>((input) => {
    annCounter.current += 1;
    const created: Announcement = {
      id: `an-live-${annCounter.current}`,
      ...input,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements((prev) => [created, ...prev]);
    return created;
  }, []);

  const toggleAnnouncementPin = useCallback<StoreValue["toggleAnnouncementPin"]>((id) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)),
    );
  }, []);

  // ---- Derived lookups bound to current reactive state --------------------

  const studentById = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const teacherById = useMemo(() => new Map(teacherList.map((t) => [t.id, t])), [teacherList]);
  const classById = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const getStudentById = useCallback((id: string) => studentById.get(id), [studentById]);
  const getTeacherById = useCallback((id: string) => teacherById.get(id), [teacherById]);
  const getClassById = useCallback((id: string) => classById.get(id), [classById]);
  const getCourseById = useCallback((id: string) => courseById.get(id), [courseById]);

  const getStudentsForClass = useCallback(
    (classId: string) => students.filter((s) => s.classId === classId),
    [students],
  );
  const getVouchersForStudent = useCallback(
    (studentId: string) => feeVouchers.filter((v) => v.studentId === studentId),
    [feeVouchers],
  );
  const getPayrollForTeacher = useCallback(
    (teacherId: string) => payroll.filter((p) => p.teacherId === teacherId),
    [payroll],
  );
  const getAttendanceForTeacher = useCallback(
    (teacherId: string) => teacherAttendance.filter((a) => a.teacherId === teacherId),
    [teacherAttendance],
  );
  const getTeacherAttendanceForDate = useCallback(
    (date: string) => teacherAttendance.filter((a) => a.date === date),
    [teacherAttendance],
  );

  const attendancePercentageForStudent = useCallback(
    (studentId: string) => {
      const records = attendance.filter((a) => a.studentId === studentId);
      if (records.length === 0) return 0;
      const present = records.filter((a) => a.status === "present" || a.status === "late").length;
      return Math.round((present / records.length) * 100);
    },
    [attendance],
  );

  const studentOutstandingBalance = useCallback(
    (studentId: string) =>
      feeVouchers
        .filter((v) => v.studentId === studentId)
        .reduce((sum, v) => sum + voucherBalance(v), 0),
    [feeVouchers],
  );

  const getStudentsWithRelations = useCallback(
    (): StudentWithRelations[] =>
      students.map((s) => {
        const cls = classById.get(s.classId);
        return {
          ...s,
          className: cls?.name ?? "Unassigned",
          enrolledCourseIds: cls?.courseIds ?? [],
          outstandingBalance: feeVouchers
            .filter((v) => v.studentId === s.id)
            .reduce((sum, v) => sum + voucherBalance(v), 0),
          attendancePercentage:
            (() => {
              const recs = attendance.filter((a) => a.studentId === s.id);
              if (!recs.length) return 0;
              const ok = recs.filter((a) => a.status === "present" || a.status === "late").length;
              return Math.round((ok / recs.length) * 100);
            })(),
        };
      }),
    [students, feeVouchers, attendance, classById],
  );

  const totalFeesCollected = useCallback(
    () => feeVouchers.reduce((sum, v) => sum + v.paidAmount, 0),
    [feeVouchers],
  );
  const totalOutstandingFees = useCallback(
    () => feeVouchers.reduce((sum, v) => sum + voucherBalance(v), 0),
    [feeVouchers],
  );
  const totalPayrollPaid = useCallback(
    () => payroll.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.netPay, 0),
    [payroll],
  );
  const totalExpenses = useCallback(
    () => expenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );
  const netCashflow = useCallback(
    () => totalFeesCollected() - (totalPayrollPaid() + totalExpenses()),
    [totalFeesCollected, totalPayrollPaid, totalExpenses],
  );
  const getExpensesByCategory = useCallback(
    () =>
      expenses
        .filter((e) => e.status === "approved")
        .reduce<Record<string, number>>((acc, e) => {
          acc[e.category] = (acc[e.category] ?? 0) + e.amount;
          return acc;
        }, {}),
    [expenses],
  );

  const value = useMemo<StoreValue>(
    () => ({
      users: seedUsers,
      teachers: teacherList,
      students,
      courses,
      classes,
      attendance,
      feeVouchers,
      payroll,
      expenses,
      announcements,
      teacherAttendance,
      addStudent,
      updateStudent,
      addTeacher,
      updateTeacher,
      nextRollNumber,
      nextEmployeeId,
      recordAttendance,
      recordTeacherAttendance,
      collectFee,
      generateBatchVouchers,
      markPayrollPaid,
      addExpense,
      addAnnouncement,
      toggleAnnouncementPin,
      getStudentById,
      getTeacherById,
      getClassById,
      getCourseById,
      getStudentsForClass,
      getVouchersForStudent,
      getPayrollForTeacher,
      getAttendanceForTeacher,
      getTeacherAttendanceForDate,
      attendancePercentageForStudent,
      studentOutstandingBalance,
      getStudentsWithRelations,
      totalFeesCollected,
      totalOutstandingFees,
      totalPayrollPaid,
      totalExpenses,
      netCashflow,
      getExpensesByCategory,
    }),
    [
      teacherList,
      students,
      courses,
      classes,
      attendance,
      feeVouchers,
      payroll,
      expenses,
      announcements,
      teacherAttendance,
      addStudent,
      updateStudent,
      addTeacher,
      updateTeacher,
      nextRollNumber,
      nextEmployeeId,
      recordAttendance,
      recordTeacherAttendance,
      collectFee,
      generateBatchVouchers,
      markPayrollPaid,
      addExpense,
      addAnnouncement,
      toggleAnnouncementPin,
      getStudentById,
      getTeacherById,
      getClassById,
      getCourseById,
      getStudentsForClass,
      getVouchersForStudent,
      getPayrollForTeacher,
      getAttendanceForTeacher,
      getTeacherAttendanceForDate,
      attendancePercentageForStudent,
      studentOutstandingBalance,
      getStudentsWithRelations,
      totalFeesCollected,
      totalOutstandingFees,
      totalPayrollPaid,
      totalExpenses,
      netCashflow,
      getExpensesByCategory,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
