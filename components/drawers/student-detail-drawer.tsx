"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/drawer";
import { StatusBadge } from "@/components/ui/primitives";
import { SelectField, TextField } from "@/components/ui/form-fields";
import { fieldErrors, studentSchema } from "@/lib/forms/schemas";
import { config, terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import type { Student } from "@/types";

/** Slide-over drawer for a trainee with inline editing (profile/class/concession). */
export function StudentDetailDrawer({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  if (!student) return null;
  // Keyed by id so per-student edit state never leaks between openings.
  return <StudentDrawerBody key={student.id} studentId={student.id} onClose={onClose} />;
}

function StudentDrawerBody({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const store = useStore();
  const student = store.getStudentById(studentId);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: student?.name ?? "",
    email: student?.email ?? "",
    phone: student?.phone ?? "",
    guardianName: student?.guardianName ?? "",
    guardianPhone: student?.guardianPhone ?? "",
    classId: student?.classId ?? "",
    status: student?.status ?? "active",
  });
  const [concession, setConcession] = useState(String(student?.feeConcession ?? 0));

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

  function save() {
    // Validate only the fields exposed in this inline form.
    const parsed = studentSchema.safeParse({ ...form });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    store.updateStudent(student!.id, {
      name: form.name,
      email: form.email,
      phone: form.phone,
      guardianName: form.guardianName,
      guardianPhone: form.guardianPhone,
      classId: form.classId,
      status: form.status,
    });
    store.setStudentFeeConcession(student!.id, Math.max(0, Number(concession) || 0));
    setEditing(false);
    setErrors({});
    toast.success(`${terminology.studentLabel} updated`, {
      description: `${form.name} · concession ${formatCurrency(Number(concession) || 0)}`,
    });
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={`${terminology.studentLabel} Profile`}
      description={`${student.name} · ${student.rollNumber}`}
      footer={
        <div className="flex w-full items-center justify-between">
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setForm({
                  name: student.name,
                  email: student.email,
                  phone: student.phone,
                  guardianName: student.guardianName,
                  guardianPhone: student.guardianPhone,
                  classId: student.classId,
                  status: student.status,
                });
                setConcession(String(student.feeConcession ?? 0));
                setEditing(true);
              }}
              className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
            >
              Edit Info
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setErrors({});
                }}
                className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-card hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          )}
          <span className="text-xs text-secondary">
            Roll {student.rollNumber}
          </span>
        </div>
      }
    >
      {editing ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="sd-name" label="Full Name" value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField id="sd-email" label="Email" type="email" value={form.email} error={errors.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <TextField id="sd-phone" label="Phone" value={form.phone} error={errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <TextField id="sd-guardian" label="Guardian Name" value={form.guardianName} error={errors.guardianName} onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))} />
            <TextField id="sd-gphone" label="Guardian Phone" value={form.guardianPhone} error={errors.guardianPhone} onChange={(e) => setForm((f) => ({ ...f, guardianPhone: e.target.value }))} />
            <SelectField id="sd-class" label={terminology.classLabel} value={form.classId} error={errors.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}>
              <option value="">Select {terminology.classLabel}</option>
              {store.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <SelectField id="sd-status" label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Student["status"] }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </SelectField>
            <TextField
              id="sd-concession"
              label="Fee Concession / month"
              type="number"
              prefix={config.localization.currencySymbol}
              value={concession}
              onChange={(e) => setConcession(e.target.value)}
            />
          </div>
        </div>
      ) : (
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
            <div className="grid grid-cols-4 gap-3">
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
              <div className="rounded-lg border border-muted p-3 text-center">
                <p className="text-xs text-secondary">Concession</p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {student.feeConcession ? formatCurrency(student.feeConcession) : "—"}
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
                      <th className="px-3 py-2 font-medium">Discount</th>
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
                          <td className="px-3 py-2 text-secondary">
                            {v.discount > 0 ? formatCurrency(v.discount) : "—"}
                          </td>
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
      )}
    </Drawer>
  );
}
