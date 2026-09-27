"use client";

import { Drawer } from "@/components/ui/drawer";
import { StatusBadge } from "@/components/ui/primitives";
import { formatCurrency } from "@/data";
import { config, terminology } from "@/lib/config";
import { useStore } from "@/lib/store/store-context";
import type { Teacher } from "@/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Read-only slide-over drawer for a faculty member: qualification, active
 * assigned courses/classes, and the last 10 salary disbursement records.
 */
export function TeacherDetailDrawer({
  teacher,
  onClose,
}: {
  teacher: Teacher | null;
  onClose: () => void;
}) {
  const store = useStore();
  if (!teacher) return null;

  const assignedClasses = store.classes.filter((c) => c.teacherId === teacher.id);
  const assignedCourses = store.courses.filter((c) => c.teacherId === teacher.id);
  const payroll = store
    .getPayrollForTeacher(teacher.id)
    .slice()
    .reverse()
    .slice(0, 10);

  return (
    <Drawer
      open={teacher !== null}
      onClose={onClose}
      title={`${terminology.teacherLabel} Profile`}
      description={`${teacher.name} · ${teacher.employeeId}`}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
        >
          Close
        </button>
      }
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-card">
            {initials(teacher.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-primary">{teacher.name}</p>
            <p className="text-xs text-secondary">{teacher.department}</p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={teacher.status} />
          </div>
        </div>

        {/* Qualification & contact */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-primary">Qualification & Contact</h3>
          <dl className="divide-y divide-muted text-sm">
            <div className="flex justify-between py-2">
              <dt className="text-secondary">Qualification</dt>
              <dd className="font-medium text-primary">{teacher.qualification}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-secondary">Email</dt>
              <dd className="font-medium text-primary">{teacher.email}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-secondary">Phone</dt>
              <dd className="font-medium text-primary">{teacher.phone}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-secondary">Joined</dt>
              <dd className="font-medium text-primary">{teacher.joiningDate}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-secondary">Base Salary</dt>
              <dd className="font-medium text-primary">
                {formatCurrency(teacher.baseSalary)} / {config.localization.currencyCode}
              </dd>
            </div>
          </dl>
        </section>

        {/* Assigned courses */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-primary">
            Assigned {terminology.courseLabel}s
          </h3>
          {assignedCourses.length === 0 ? (
            <p className="text-sm text-secondary">No {terminology.courseLabel.toLowerCase()}s assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedCourses.map((c) => (
                <span
                  key={c.id}
                  className="rounded-md border border-muted bg-muted/40 px-2 py-1 text-xs text-primary"
                >
                  <span className="font-mono text-secondary">{c.code}</span> · {c.title}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Classes */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-primary">
            Active {terminology.classLabel} Batches
          </h3>
          {assignedClasses.length === 0 ? (
            <p className="text-sm text-secondary">No classes assigned.</p>
          ) : (
            <ul className="divide-y divide-muted rounded-lg border border-muted">
              {assignedClasses.map((cls) => (
                <li key={cls.id} className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary">{cls.name}</span>
                    <span className="text-xs text-secondary">{cls.room}</span>
                  </div>
                  <p className="text-xs text-secondary">{cls.schedule}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Last 10 disbursements */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-primary">Recent Salary Disbursements</h3>
          {payroll.length === 0 ? (
            <p className="text-sm text-secondary">No payroll records yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-muted">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-muted bg-muted/50 text-xs uppercase tracking-wide text-secondary">
                    <th className="px-3 py-2 font-medium">Payslip</th>
                    <th className="px-3 py-2 font-medium">Period</th>
                    <th className="px-3 py-2 font-medium">Net Pay</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {payroll.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 font-mono text-xs text-secondary">{p.payslipNumber}</td>
                      <td className="px-3 py-2 text-secondary">{p.period}</td>
                      <td className="px-3 py-2 font-medium text-primary">{formatCurrency(p.netPay)}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Drawer>
  );
}
