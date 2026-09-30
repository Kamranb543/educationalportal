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
  ClassSession,
  Course,
  ClassBatch,
  Expense,
  ExpenseCategory,
  FeePayment,
  FeeVoucher,
  InviteToken,
  InviteTokenRole,
  OnboardingApplication,
  OnboardingStatus,
  PayrollRecord,
  SchoolPeriod,
  Student,
  StudentWithRelations,
  SyllabusChapter,
  Teacher,
  TeacherAttendanceRecord,
  User,
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
import {
  inviteTokens as seedInviteTokens,
  onboardingApplications as seedApplications,
} from "@/data/onboarding";
import { periods as seedPeriods } from "@/data/periods";
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

export interface NewCourseInput {
  code: string;
  title: string;
  description: string;
}

export interface NewClassInput {
  name: string;
  section: string;
  monthlyFee: number;
}

export interface NewInviteTokenInput {
  role: InviteTokenRole;
  offeredSalary: number | null;
  feeDiscount: number | null;
  contractNotes: string;
  expiresAt: string;
  createdBy: string;
}

export interface ApplicationApplicant {
  role: InviteTokenRole;
  name: string;
  email: string;
  phone: string;
  qualification: string;
}

export interface ApplicationAssignment {
  classId: string | null;
  courseIds: string[];
}

interface StoreValue {
  // Reactive collections
  users: User[];
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
  tokens: InviteToken[];
  applications: OnboardingApplication[];
  periods: SchoolPeriod[];

  // Mutators
  addStudent: (input: NewStudentInput) => Student;
  updateStudent: (id: string, patch: Partial<Omit<Student, "id">>) => void;
  setStudentFeeConcession: (studentId: string, amount: number) => void;
  addTeacher: (input: NewTeacherInput) => Teacher;
  updateTeacher: (id: string, patch: Partial<Omit<Teacher, "id">>) => void;
  nextRollNumber: () => string;
  nextEmployeeId: () => string;
  addCourse: (input: NewCourseInput) => Course;
  updateCourse: (id: string, patch: Partial<Omit<Course, "id">>) => void;
  removeCourse: (id: string) => void;
  setCourseSyllabus: (courseId: string, syllabus: SyllabusChapter[]) => void;
  addClass: (input: NewClassInput) => ClassBatch;
  updateClass: (id: string, patch: Partial<Omit<ClassBatch, "id">>) => void;
  /** Add/remove master subjects on a batch, keeping teacher maps + slots in sync. */
  updateClassSubjects: (classId: string, courseIds: string[]) => void;
  setClassSubjectTeacher: (classId: string, courseId: string, teacherId: string) => void;
  setClassSessions: (classId: string, sessions: ClassSession[]) => void;
  setPeriods: (periods: SchoolPeriod[]) => void;
  addClassSession: (classId: string, session: Omit<ClassSession, "id">) => ClassSession;
  updateClassSession: (
    classId: string,
    sessionId: string,
    patch: Partial<Omit<ClassSession, "id">>,
  ) => void;
  removeClassSession: (classId: string, sessionId: string) => void;
  setTeacherSubjects: (teacherId: string, courseIds: string[]) => void;
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
  generateInviteToken: (input: NewInviteTokenInput) => InviteToken;
  revokeInviteToken: (id: string) => void;
  deleteInviteToken: (id: string) => void;
  findToken: (code: string) => InviteToken | undefined;
  submitApplication: (
    tokenCode: string,
    applicant: ApplicationApplicant,
  ) => OnboardingApplication;
  approveApplication: (
    applicationId: string,
    assignment: ApplicationAssignment,
    reviewedBy: string,
  ) => void;
  rejectApplication: (applicationId: string, reviewedBy: string) => void;

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
  /** Resolve the teacher delivering a session (explicit override → subject → batch lead). */
  resolveSessionTeacher: (cls: ClassBatch, session: ClassSession) => string;
  /** All subjects taught by a teacher across every batch (from subjectTeachers). */
  getCourseIdsForTeacher: (teacherId: string) => string[];
  /** Subjects for a batch as Course objects. */
  getSubjectsForClass: (classId: string) => Course[];
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
  const [userList, setUserList] = useState<User[]>(() => [...seedUsers]);
  const [teacherList, setTeacherList] = useState<Teacher[]>(() => [...seedTeachers]);
  const [students, setStudents] = useState<Student[]>(() => [...seedStudents]);
  const [courses, setCourses] = useState<Course[]>(() => [...seedCourses]);
  const [classes, setClasses] = useState<ClassBatch[]>(() => [...seedClasses]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => [...seedAttendance]);
  const [feeVouchers, setFeeVouchers] = useState<FeeVoucher[]>(() => [...seedVouchers]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => [...seedPayroll]);
  const [expenses, setExpenses] = useState<Expense[]>(() => [...seedExpenses]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => [...seedAnnouncements]);
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendanceRecord[]>(
    () => [...seedTeacherAttendance],
  );
  const [tokens, setTokens] = useState<InviteToken[]>(() => [...seedInviteTokens]);
  const [applications, setApplications] = useState<OnboardingApplication[]>(
    () => [...seedApplications],
  );
  const [periods, setPeriodsState] = useState<SchoolPeriod[]>(() => [...seedPeriods]);

  const attCounter = useRef(seedAttendance.length);
  const tatCounter = useRef(seedTeacherAttendance.length);
  const expCounter = useRef(0);
  const annCounter = useRef(seedAnnouncements.length);
  const vchCounter = useRef(seedVouchers.length);
  const usrCounter = useRef(seedUsers.length);
  const tokCounter = useRef(seedInviteTokens.length);
  const appCounter = useRef(seedApplications.length);
  const crsCounter = useRef(seedCourses.length);
  const clsCounter = useRef(seedClasses.length);

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

  const setStudentFeeConcession = useCallback<StoreValue["setStudentFeeConcession"]>(
    (studentId, amount) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, feeConcession: amount } : s)),
      );
      // Apply the concession to any not-yet-fully-paid voucher of this student.
      setFeeVouchers((prev) =>
        prev.map((v) =>
          v.studentId === studentId && v.status !== "paid"
            ? { ...v, discount: amount }
            : v,
        ),
      );
    },
    [],
  );

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

  // Gross monthly tuition for a batch = its consolidated monthly fee.
  const classMonthlyAmount = useCallback(
    (classId: string): number =>
      classes.find((c) => c.id === classId)?.monthlyFee ?? 0,
    [classes],
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
          discount: student.feeConcession ?? 0,
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

  // ---- Subjects (master Course list) --------------------------------------

  const addCourse = useCallback<StoreValue["addCourse"]>((input) => {
    crsCounter.current += 1;
    const id = `crs-${String(crsCounter.current).padStart(2, "0")}`;
    const created: Course = {
      id,
      code: input.code.toUpperCase(),
      title: input.title,
      description: input.description,
      syllabus: [],
    };
    setCourses((prev) => [...prev, created]);
    return created;
  }, []);

  const updateCourse = useCallback<StoreValue["updateCourse"]>((id, patch) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const removeCourse = useCallback<StoreValue["removeCourse"]>((id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    // Detach the subject from every class that referenced it.
    setClasses((prev) =>
      prev.map((cls) => {
        if (!cls.courseIds.includes(id)) return cls;
        const subjectTeachers = { ...cls.subjectTeachers };
        delete subjectTeachers[id];
        return {
          ...cls,
          courseIds: cls.courseIds.filter((cid) => cid !== id),
          subjectTeachers,
          sessions: cls.sessions.filter((s) => s.courseId !== id),
        };
      }),
    );
  }, []);

  const setCourseSyllabus = useCallback<StoreValue["setCourseSyllabus"]>((courseId, syllabus) => {
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, syllabus } : c)));
  }, []);

  // ---- Class directory -----------------------------------------------------

  // Class creation is intentionally minimal (name/section/monthly fee); other
  // batch attributes are refined later via Edit Class.
  const addClass = useCallback<StoreValue["addClass"]>((input) => {
    clsCounter.current += 1;
    const id = `cls-${String(clsCounter.current).padStart(2, "0")}`;
    const created: ClassBatch = {
      id,
      name: input.name,
      section: input.section,
      academicYear: String(new Date().getFullYear()),
      courseIds: [],
      subjectTeachers: {},
      teacherId: teacherList[0]?.id ?? "",
      room: "Room-1",
      schedule: "",
      capacity: 20,
      monthlyFee: input.monthlyFee,
      sessions: [],
    };
    setClasses((prev) => [...prev, created]);
    return created;
  }, [teacherList]);

  const updateClass = useCallback<StoreValue["updateClass"]>((id, patch) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  // Add/remove master subjects on a batch. Newly added subjects default their
  // teacher to the batch lead; removed subjects are detached from teacher map +
  // any lecture slots referencing them.
  const updateClassSubjects = useCallback<StoreValue["updateClassSubjects"]>(
    (classId, courseIds) => {
      setClasses((prev) =>
        prev.map((cls) => {
          if (cls.id !== classId) return cls;
          const subjectTeachers: Record<string, string> = {};
          for (const courseId of courseIds) {
            subjectTeachers[courseId] =
              cls.subjectTeachers[courseId] ?? cls.teacherId ?? "";
          }
          const keep = new Set(courseIds);
          return {
            ...cls,
            courseIds,
            subjectTeachers,
            sessions: cls.sessions.filter((s) => keep.has(s.courseId)),
          };
        }),
      );
    },
    [],
  );

  const setPeriods = useCallback<StoreValue["setPeriods"]>((next) => {
    setPeriodsState(next);
  }, []);

  const setClassSubjectTeacher = useCallback<StoreValue["setClassSubjectTeacher"]>(
    (classId, courseId, teacherId) => {
      setClasses((prev) =>
        prev.map((cls) => {
          if (cls.id !== classId) return cls;
          const subjectTeachers = { ...cls.subjectTeachers, [courseId]: teacherId };
          // Re-stamp teacher on existing slots for this subject.
          const sessions = cls.sessions.map((s) =>
            s.courseId === courseId ? { ...s, teacherId } : s,
          );
          return { ...cls, subjectTeachers, sessions };
        }),
      );
    },
    [],
  );

  const setClassSessions = useCallback<StoreValue["setClassSessions"]>(
    (classId, sessions) => {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId
            ? {
                ...c,
                sessions: sessions.map((s, i) => ({
                  ...s,
                  id: s.id || `${classId}-live-${i}`,
                  // Fall back to the batch's subject assignment when unset.
                  teacherId: s.teacherId ?? c.subjectTeachers[s.courseId] ?? c.teacherId,
                })),
              }
            : c,
        ),
      );
    },
    [],
  );

  // Replace which subjects a teacher delivers, across every batch, keeping the
  // class-centric subjectTeachers/sessions maps consistent with the new set.
  const setTeacherSubjects = useCallback<StoreValue["setTeacherSubjects"]>(
    (teacherId, courseIds) => {
      const wanted = new Set(courseIds);
      setClasses((prev) =>
        prev.map((cls) => {
          let changed = false;
          const subjectTeachers = { ...cls.subjectTeachers };
          // Un-assign this teacher from any subject not in the new set.
          for (const [courseId, assigned] of Object.entries(subjectTeachers)) {
            if (assigned === teacherId && !wanted.has(courseId)) {
              delete subjectTeachers[courseId];
              changed = true;
            }
          }
          // Assign the teacher to requested subjects this batch teaches.
          for (const courseId of courseIds) {
            if (cls.courseIds.includes(courseId) && subjectTeachers[courseId] !== teacherId) {
              subjectTeachers[courseId] = teacherId;
              changed = true;
            }
          }
          if (!changed) return cls;
          // Recompute every slot's teacher from the final assignment map.
          const sessions = cls.sessions.map((s) => ({
            ...s,
            teacherId: subjectTeachers[s.courseId] ?? cls.teacherId,
          }));
          return { ...cls, subjectTeachers, sessions };
        }),
      );
    },
    [],
  );

  const addClassSession = useCallback<StoreValue["addClassSession"]>(
    (classId, session) => {
      const cls = classes.find((c) => c.id === classId);
      const created: ClassSession = {
        ...session,
        id: `${classId}-ses-${Date.now().toString(36)}`,
        teacherId:
          session.teacherId ??
          (cls ? cls.subjectTeachers[session.courseId] ?? cls.teacherId : undefined),
      };
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, sessions: [...c.sessions, created] } : c)),
      );
      return created;
    },
    [classes],
  );

  const updateClassSession = useCallback<StoreValue["updateClassSession"]>(
    (classId, sessionId, patch) => {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId
            ? {
                ...c,
                sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, ...patch } : s)),
              }
            : c,
        ),
      );
    },
    [],
  );

  const removeClassSession = useCallback<StoreValue["removeClassSession"]>(
    (classId, sessionId) => {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId ? { ...c, sessions: c.sessions.filter((s) => s.id !== sessionId) } : c,
        ),
      );
    },
    [],
  );

  // ---- Token-based onboarding ---------------------------------------------

  const findToken = useCallback(
    (code: string) =>
      tokens.find(
        (t) => t.code.toUpperCase() === code.trim().toUpperCase() && t.status === "active",
      ),
    [tokens],
  );

  const generateInviteToken = useCallback<StoreValue["generateInviteToken"]>(
    (input) => {
      tokCounter.current += 1;
      const prefix = input.role === "teacher" ? "TCH" : "STU";
      const created: InviteToken = {
        id: `tok-${String(tokCounter.current).padStart(2, "0")}`,
        code: `${prefix}-${String(1000 + Math.floor(Math.random() * 9000))}`,
        role: input.role,
        offeredSalary: input.role === "teacher" ? input.offeredSalary ?? null : null,
        feeDiscount: input.role === "student" ? input.feeDiscount ?? null : null,
        contractNotes: input.contractNotes,
        createdBy: input.createdBy,
        createdAt: new Date().toISOString(),
        expiresAt: input.expiresAt,
        status: "active",
      };
      setTokens((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const revokeInviteToken = useCallback<StoreValue["revokeInviteToken"]>((id) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "revoked" } : t)),
    );
  }, []);

  const deleteInviteToken = useCallback<StoreValue["deleteInviteToken"]>((id) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const submitApplication = useCallback<StoreValue["submitApplication"]>(
    (tokenCode, applicant) => {
      appCounter.current += 1;
      const token = tokens.find(
        (t) => t.code.toUpperCase() === tokenCode.trim().toUpperCase(),
      );
      const created: OnboardingApplication = {
        id: `app-${String(appCounter.current).padStart(2, "0")}`,
        tokenCode: token?.code ?? tokenCode.toUpperCase(),
        role: (token?.role ?? applicant.role) as InviteTokenRole,
        name: applicant.name,
        email: applicant.email,
        phone: applicant.phone,
        qualification: applicant.qualification,
        offeredSalary: token?.offeredSalary ?? null,
        feeDiscount: token?.feeDiscount ?? null,
        contractNotes: token?.contractNotes ?? "",
        classId: null,
        courseIds: [],
        submittedAt: new Date().toISOString(),
        status: "pending",
        reviewedBy: null,
        reviewedAt: null,
      };
      setApplications((prev) => [created, ...prev]);
      // A token is consumed the moment it spawns a submission.
      if (token) setTokens((prev) => prev.map((t) => (t.id === token.id ? { ...t, status: "used" } : t)));
      return created;
    },
    [tokens],
  );

  const approveApplication = useCallback<StoreValue["approveApplication"]>(
    (applicationId, assignment, reviewedBy) => {
      const app = applications.find((a) => a.id === applicationId);
      if (!app) return;

      let linkedTeacherId: string | null = null;
      let linkedStudentId: string | null = null;

      if (app.role === "teacher") {
        const teacherId = nextId(teacherList.map((t) => t.id), "tch");
        linkedTeacherId = teacherId;
        const teacher: Teacher = {
          id: teacherId,
          employeeId: formatEmployeeId(nextEmployeeSequence()),
          name: app.name,
          email: app.email,
          phone: app.phone,
          department: "General Faculty",
          qualification: app.qualification,
          baseSalary: app.offeredSalary ?? 0,
          joiningDate: new Date().toISOString().slice(0, 10),
          status: "active",
        };
        setTeacherList((prev) => [...prev, teacher]);
        // Bind approved subjects to the new faculty member via class batches.
        if (assignment.courseIds.length > 0) {
          if (assignment.classId) {
            setClasses((prev) =>
              prev.map((cls) => {
                if (cls.id !== assignment.classId) return cls;
                const subjectTeachers = { ...cls.subjectTeachers };
                for (const courseId of assignment.courseIds) {
                  if (cls.courseIds.includes(courseId)) {
                    subjectTeachers[courseId] = teacherId;
                  }
                }
                const sessions = cls.sessions.map((s) => ({
                  ...s,
                  teacherId: subjectTeachers[s.courseId] ?? s.teacherId ?? cls.teacherId,
                }));
                return { ...cls, subjectTeachers, sessions };
              }),
            );
          }
        }
      } else {
        const studentId = nextId(students.map((s) => s.id), "std");
        linkedStudentId = studentId;
        const student: Student = {
          id: studentId,
          rollNumber: formatRollNumber(nextRollSequence()),
          name: app.name,
          email: app.email,
          phone: app.phone,
          guardianName: app.name,
          guardianPhone: app.phone,
          classId: assignment.classId ?? "",
          admissionDate: new Date().toISOString().slice(0, 10),
          status: "active",
          feeConcession: app.feeDiscount ?? 0,
        };
        setStudents((prev) => [...prev, student]);
      }

      // Create the linked login account for the approved user.
      usrCounter.current += 1;
      const createdUser: User = {
        id: `usr-${String(usrCounter.current).padStart(2, "0")}`,
        name: app.name,
        email: app.email,
        role: app.role,
        password: `${app.role === "teacher" ? "teach" : "learn"}123`,
        teacherId: linkedTeacherId,
        studentId: linkedStudentId,
        status: "active",
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
      };
      setUserList((prev) => [...prev, createdUser]);

      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? {
                ...a,
                status: "approved" as OnboardingStatus,
                classId: assignment.classId,
                courseIds: assignment.courseIds,
                reviewedBy,
                reviewedAt: new Date().toISOString(),
              }
            : a,
        ),
      );
    },
    [applications, teacherList, students, nextEmployeeSequence, nextRollSequence],
  );

  const rejectApplication = useCallback<StoreValue["rejectApplication"]>(
    (applicationId, reviewedBy) => {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? {
                ...a,
                status: "rejected" as OnboardingStatus,
                reviewedBy,
                reviewedAt: new Date().toISOString(),
              }
            : a,
        ),
      );
    },
    [],
  );

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

  const resolveSessionTeacher = useCallback(
    (cls: ClassBatch, session: ClassSession): string =>
      session.teacherId ?? cls.subjectTeachers[session.courseId] ?? cls.teacherId,
    [],
  );

  const getCourseIdsForTeacher = useCallback(
    (teacherId: string) => {
      const ids = new Set<string>();
      for (const cls of classes) {
        for (const [courseId, assigned] of Object.entries(cls.subjectTeachers)) {
          if (assigned === teacherId) ids.add(courseId);
        }
      }
      return Array.from(ids);
    },
    [classes],
  );

  const getSubjectsForClass = useCallback(
    (classId: string) => {
      const cls = classById.get(classId);
      if (!cls) return [];
      return cls.courseIds
        .map((id) => courseById.get(id))
        .filter((c): c is Course => Boolean(c));
    },
    [classById, courseById],
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
      users: userList,
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
      tokens,
      applications,
      periods,
      addStudent,
      updateStudent,
      setStudentFeeConcession,
      addTeacher,
      updateTeacher,
      nextRollNumber,
      nextEmployeeId,
      addCourse,
      updateCourse,
      removeCourse,
      setCourseSyllabus,
      addClass,
      updateClass,
      updateClassSubjects,
      setClassSubjectTeacher,
      setClassSessions,
      setPeriods,
      addClassSession,
      updateClassSession,
      removeClassSession,
      setTeacherSubjects,
      recordAttendance,
      recordTeacherAttendance,
      collectFee,
      generateBatchVouchers,
      markPayrollPaid,
      addExpense,
      addAnnouncement,
      toggleAnnouncementPin,
      generateInviteToken,
      revokeInviteToken,
      deleteInviteToken,
      findToken,
      submitApplication,
      approveApplication,
      rejectApplication,
      getStudentById,
      getTeacherById,
      getClassById,
      getCourseById,
      getStudentsForClass,
      getVouchersForStudent,
      getPayrollForTeacher,
      getAttendanceForTeacher,
      getTeacherAttendanceForDate,
      resolveSessionTeacher,
      getCourseIdsForTeacher,
      getSubjectsForClass,
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
      userList,
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
      tokens,
      applications,
      periods,
      addStudent,
      updateStudent,
      setStudentFeeConcession,
      addTeacher,
      updateTeacher,
      nextRollNumber,
      nextEmployeeId,
      addCourse,
      updateCourse,
      removeCourse,
      setCourseSyllabus,
      addClass,
      updateClass,
      updateClassSubjects,
      setClassSubjectTeacher,
      setClassSessions,
      setPeriods,
      addClassSession,
      updateClassSession,
      removeClassSession,
      setTeacherSubjects,
      recordAttendance,
      recordTeacherAttendance,
      collectFee,
      generateBatchVouchers,
      markPayrollPaid,
      addExpense,
      addAnnouncement,
      toggleAnnouncementPin,
      generateInviteToken,
      revokeInviteToken,
      deleteInviteToken,
      findToken,
      submitApplication,
      approveApplication,
      rejectApplication,
      getStudentById,
      getTeacherById,
      getClassById,
      getCourseById,
      getStudentsForClass,
      getVouchersForStudent,
      getPayrollForTeacher,
      getAttendanceForTeacher,
      getTeacherAttendanceForDate,
      resolveSessionTeacher,
      getCourseIdsForTeacher,
      getSubjectsForClass,
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
