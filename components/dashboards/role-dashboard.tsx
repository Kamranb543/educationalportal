"use client";

import { roleLabel, useAuth } from "@/lib/auth/auth-context";
import { config, terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import { PanelCard, ProgressMeter, StatCard, StatusBadge } from "@/components/ui/primitives";
import { QuickActions } from "@/components/auth/quick-actions";

function Greeting() {
  const { currentUser, currentRole } = useAuth();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm text-secondary">
          {roleLabel(currentRole)} Dashboard
        </p>
        {currentUser && (
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-primary">
            Welcome back, {currentUser.name}
          </h1>
        )}
        <p className="mt-1 text-sm text-secondary">{config.identity.tagline}</p>
      </div>
      <QuickActions />
    </div>
  );
}

/** Super Admin / Admin: institution-wide financial health & operations. */
function AdminFinanceView() {
  const store = useStore();
  const net = store.netCashflow();
  const expensesByCategory = store.getExpensesByCategory();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fees Collected" value={formatCurrency(store.totalFeesCollected())} hint="All settled vouchers" tone="positive" />
        <StatCard label="Payroll Paid" value={formatCurrency(store.totalPayrollPaid())} hint="Disbursed salaries" />
        <StatCard label="Expenses" value={formatCurrency(store.totalExpenses())} hint="Approved operational" />
        <StatCard
          label="Net Cashflow"
          value={formatCurrency(net)}
          hint={net >= 0 ? "Surplus" : "Deficit"}
          tone={net >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelCard
          title="Fee Collection"
          description={`Outstanding balance across all ${terminology.studentLabel.toLowerCase()}s`}
        >
          <div className="space-y-3">
            <StatCard label="Total Outstanding" value={formatCurrency(store.totalOutstandingFees())} tone="negative" />
            <ul className="divide-y divide-muted rounded-lg border border-muted">
              {store.classes.map((cls) => {
                const roster = store.getStudentsForClass(cls.id);
                const unpaid = roster
                  .flatMap((s) => store.getVouchersForStudent(s.id))
                  .reduce((sum, v) => sum + (v.amount - v.paidAmount), 0);
                return (
                  <li key={cls.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-primary">{cls.name}</span>
                    <span className="font-medium text-secondary">{roster.length} {terminology.studentLabel}s &middot; {formatCurrency(unpaid)} due</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </PanelCard>

        <PanelCard title="Expense Breakdown" description="Approved expenses by category">
          <ul className="space-y-2">
            {Object.entries(expensesByCategory).map(([cat, amount]) => {
              const max = Math.max(...Object.values(expensesByCategory));
              return (
                <li key={cat}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-primary">{cat}</span>
                    <span className="text-secondary">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${(amount / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </PanelCard>
      </div>
    </div>
  );
}

/** Teacher: assigned class schedule and payslip summary. */
function TeacherView() {
  const { currentUser } = useAuth();
  const store = useStore();
  const teacher = currentUser?.teacherId ? store.getTeacherById(currentUser.teacherId) : undefined;
  if (!teacher) {
    return <p className="text-sm text-secondary">No faculty profile linked to this account.</p>;
  }
  const subjectCourseIds = store.getCourseIdsForTeacher(teacher.id);
  const myClasses = store.classes.filter(
    (c) => c.teacherId === teacher.id || subjectCourseIds.some((id) => c.courseIds.includes(id)),
  );
  const myCourses = store.courses.filter((c) => subjectCourseIds.includes(c.id));
  const payslips = store.getPayrollForTeacher(teacher.id).slice(-3).reverse();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned Classes" value={myClasses.length} hint={`${terminology.classLabel} batches`} />
        <StatCard label={`${terminology.courseLabel}s Taught`} value={myCourses.length} />
        <StatCard label="Base Salary" value={formatCurrency(teacher.baseSalary)} hint="Per month" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PanelCard title="Class Schedule" description={`${terminology.classLabel} batches you lead`}>
          {myClasses.length === 0 ? (
            <p className="text-sm text-secondary">No classes assigned.</p>
          ) : (
            <ul className="divide-y divide-muted">
              {myClasses.map((cls) => (
                <li key={cls.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">{cls.name}</p>
                    <span className="text-xs text-secondary">{cls.room}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-secondary">{cls.schedule}</p>
                  <p className="mt-1 text-xs text-secondary">
                    {store.getStudentsForClass(cls.id).length} {terminology.studentLabel}s &middot;{" "}
                    {cls.courseIds.map((id) => store.getCourseById(id)?.code).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
        <PanelCard title="Recent Payslips" description="Your last salary disbursements">
          {payslips.length === 0 ? (
            <p className="text-sm text-secondary">No payslips yet.</p>
          ) : (
            <ul className="divide-y divide-muted">
              {payslips.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-primary">{p.payslipNumber}</p>
                    <p className="text-xs text-secondary">{p.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{formatCurrency(p.netPay)}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </div>
    </div>
  );
}

/** Student: personal attendance %, voucher status, enrolled courses. */
function StudentView() {
  const { currentUser } = useAuth();
  const store = useStore();
  const student = currentUser?.studentId ? store.getStudentById(currentUser.studentId) : undefined;
  if (!student) {
    return <p className="text-sm text-secondary">No {terminology.studentLabel.toLowerCase()} profile linked to this account.</p>;
  }
  const cls = store.classes.find((c) => c.id === student.classId);
  const vouchers = store.getVouchersForStudent(student.id);
  const attendancePct = store.attendancePercentageForStudent(student.id);
  const outstanding = store.studentOutstandingBalance(student.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Attendance" value={`${attendancePct}%`} tone={attendancePct >= 75 ? "positive" : "negative"} />
        <StatCard label="Outstanding Fees" value={formatCurrency(outstanding)} tone={outstanding > 0 ? "negative" : "positive"} />
        <StatCard label={terminology.classLabel} value={cls?.name ?? "—"} hint={cls?.schedule} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PanelCard title="Attendance Meter">
          <ProgressMeter percent={attendancePct} label="Sessions attended (present or late)" />
          <p className="mt-3 text-xs text-secondary">
            75% minimum required for {config.identity.shortName} examinations.
          </p>
        </PanelCard>
        <PanelCard title="Fee Vouchers" description="Download or pay outstanding vouchers">
          <ul className="divide-y divide-muted">
            {vouchers.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-primary">{v.voucherNumber}</p>
                  <p className="text-xs text-secondary">{v.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{formatCurrency(v.amount)}</p>
                  <StatusBadge status={v.status} />
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
      {cls && (
        <PanelCard title={`Enrolled ${terminology.courseLabel}s`}>
          <div className="grid gap-3 sm:grid-cols-2">
            {cls.courseIds.map((id) => {
              const course = store.getCourseById(id);
              if (!course) return null;
              return (
                <div key={id} className="rounded-lg border border-muted p-3">
                  <p className="text-sm font-medium text-primary">{course.title}</p>
                  <p className="text-xs text-secondary">
                    {course.code} &middot;{" "}
                    {store.getTeacherById(cls.subjectTeachers[id] ?? cls.teacherId)?.name ?? "TBA"}
                  </p>
                </div>
              );
            })}
          </div>
        </PanelCard>
      )}
    </div>
  );
}

/** Renders the dashboard tailored to the active session's role. */
export function RoleDashboard() {
  const { currentRole } = useAuth();
  return (
    <div className="space-y-6">
      <Greeting />
      {currentRole === "student" ? (
        <StudentView />
      ) : currentRole === "teacher" ? (
        <TeacherView />
      ) : (
        <AdminFinanceView />
      )}
    </div>
  );
}
