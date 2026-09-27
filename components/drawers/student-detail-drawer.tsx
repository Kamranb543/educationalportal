"use client";

import { Drawer } from "@/components/ui/drawer";
import { StatusBadge } from "@/components/ui/primitives";
import { formatCurrency } from "@/data";
import { terminology } from "@/lib/config";
import { useStore } from "@/lib/store/store-context";
import type { Student } from "@/types";

/**
 * Read-only slide-over drawer for a student: profile, guardian, attendance
 * history, and fee vouchers.
 */
export function StudentDetailDrawer({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  const store = useStore();
  if (!student) return null;

  const cls = store.getClassById(student.classId);
  const attendance = store.attendance
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 20);
  const vouchers = store
    .getVouchersForStudent(student.id)
    .sort((a, b) => (a.period < b.period ? 1 : -1));

  const attendancePct = store.attendancePercentageForStudent(student.id);
  const balance = store.studentOutstandingBalance(student.id);

  return (
    <Drawer
      open={student !== null}
      onClose={onClose}
      title={`${terminology.studentLabel} Profile`}
      description={`${student.name} · ${student.rollNumber}`}
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
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-muted p-3">
            <p className="text-xs text-secondary">Email</p>
            <p className="text-sm font-medium text-primary">{student.email}</p>
          </div>
          <div className="rounded-lg border border-muted p-3">
            <p className="text-xs text-secondary">Phone</p>
            <p className="text-sm font-medium text-primary">{student.phone}</p>
          </div>
          <div className="rounded-lg border border-muted p-3">
            <p className="text-xs text-secondary">Guardian</p>
            <p className="text-sm font-medium text-primary">
              {student.guardianName} · {student.guardianPhone}
            </p>
          </div>
          <div className="rounded-lg border border-muted p-3">
            <p className="text-xs text-secondary">Status</p>
            <StatusBadge status={student.status} />
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-primary">
            {terminology.classLabel} & Performance
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-muted p-3 text-center">
              <p className="text-xs text-secondary">{terminology.classLabel}</p>
              <p className="mt-1 truncate text-sm font-medium text-primary">{cls?.name ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-muted p-3 text-center">
              <p className="text-xs text-secondary">Attendance</p>
              <p className={`mt-1 text-lg font-semibold ${attendancePct >= 75 ? "text-accent" : "text-primary"}`}>
                {attendancePct}%
              </p>
            </div>
            <div className="rounded-lg border border-muted p-3 text-center">
              <p className="text-xs text-secondary">Balance</p>
              <p className={`mt-1 text-sm font-semibold ${balance > 0 ? "text-primary" : "text-accent"}`}>
                {balance > 0 ? formatCurrency(balance) : "Settled"}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-primary">Fee Vouchers</h3>
          {vouchers.length === 0 ? (
            <p className="rounded-lg border border-dashed border-muted px-4 py-6 text-center text-sm text-secondary">
              No vouchers issued.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-muted">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-muted bg-muted/50 text-xs uppercase tracking-wide text-secondary">
                    <th className="px-3 py-2 font-medium">Period</th>
                    <th className="px-3 py-2 font-medium">Balance</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {vouchers.map((v) => {
                    const bal = v.amount - v.discount - v.paidAmount;
                    return (
                      <tr key={v.id}>
                        <td className="px-3 py-2 font-medium text-primary">{v.period}</td>
                        <td className={`px-3 py-2 font-medium ${bal > 0 ? "text-primary" : "text-accent"}`}>
                          {bal > 0 ? formatCurrency(bal) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={v.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-primary">Attendance History (last 20)</h3>
          {attendance.length === 0 ? (
            <p className="rounded-lg border border-dashed border-muted px-4 py-6 text-center text-sm text-secondary">
              No attendance records.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {attendance.map((a) => (
                <span
                  key={a.id}
                  className="flex items-center gap-1.5 rounded-md border border-muted px-2 py-1 text-xs text-secondary"
                >
                  {a.date}
                  <StatusBadge status={a.status} />
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </Drawer>
  );
}
