"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/drawer";
import { StatusBadge } from "@/components/ui/primitives";
import { TextField } from "@/components/ui/form-fields";
import { teacherSchema, fieldErrors } from "@/lib/forms/schemas";
import { config, terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
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

/** Slide-over drawer for a faculty member with full inline editing. */
export function TeacherDetailDrawer({
  teacher,
  onClose,
}: {
  teacher: Teacher | null;
  onClose: () => void;
}) {
  if (!teacher) return null;
  // Keyed by id so per-teacher edit state never leaks between openings.
  return <TeacherDrawerBody key={teacher.id} teacherId={teacher.id} onClose={onClose} />;
}

function TeacherDrawerBody({ teacherId, onClose }: { teacherId: string; onClose: () => void }) {
  const store = useStore();
  const teacher = store.getTeacherById(teacherId);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: teacher?.name ?? "",
    email: teacher?.email ?? "",
    phone: teacher?.phone ?? "",
    department: teacher?.department ?? "",
    qualification: teacher?.qualification ?? "",
    baseSalary: String(teacher?.baseSalary ?? 0),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseIds, setCourseIds] = useState<string[]>(() =>
    teacher ? store.getCourseIdsForTeacher(teacher.id) : [],
  );

  if (!teacher) return null;

  const subjectCourseIds = store.getCourseIdsForTeacher(teacher.id);
  const assignedClasses = store.classes.filter(
    (c) => c.teacherId === teacher.id || c.courseIds.some((id) => subjectCourseIds.includes(id)),
  );
  const assignedCourses = store.courses.filter((c) => subjectCourseIds.includes(c.id));
  const payroll = store.getPayrollForTeacher(teacher.id).slice().reverse().slice(0, 10);

  function toggleCourse(courseId: string) {
    setCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );
  }

  function save() {
    const parsed = teacherSchema.safeParse({
      name: form.name,
      email: form.email,
      phone: form.phone,
      department: form.department,
      qualification: form.qualification,
      baseSalary: Number(form.baseSalary),
      status: teacher!.status,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    const { courseIds: _omit, ...fields } = parsed.data;
    void _omit;
    store.updateTeacher(teacher!.id, fields);
    // Sync subject assignments (class-centric subjectTeachers maps).
    store.setTeacherSubjects(teacher!.id, courseIds);
    setEditing(false);
    setErrors({});
    toast.success(`${terminology.teacherLabel} updated`, { description: fields.name });
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={`${terminology.teacherLabel} Profile`}
      description={`${teacher.name} · ${teacher.employeeId}`}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
            >
              Edit Profile
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      }
    >
      {editing ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="td-name" label="Full Name" value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField id="td-email" label="Email" type="email" value={form.email} error={errors.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <TextField id="td-phone" label="Phone" value={form.phone} error={errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <TextField id="td-dept" label="Department" value={form.department} error={errors.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
            <TextField id="td-qual" label="Qualification" value={form.qualification} error={errors.qualification} onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))} />
            <TextField
              id="td-salary"
              label="Base Salary / month"
              type="number"
              inputMode="numeric"
              prefix={config.localization.currencySymbol}
              value={form.baseSalary}
              error={errors.baseSalary}
              onChange={(e) => setForm((f) => ({ ...f, baseSalary: e.target.value }))}
            />
          </div>
          <fieldset className="rounded-lg border border-muted p-3">
            <legend className="px-1 text-xs font-medium text-secondary">
              Assign {terminology.courseLabel}s
            </legend>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {store.courses.map((c) => {
                const checked = courseIds.includes(c.id);
                return (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCourse(c.id)}
                      className="h-4 w-4 accent-[var(--app-accent)]"
                    />
                    <span className="text-primary">{c.title}</span>
                    <span className="font-mono text-xs text-secondary">{c.code}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      ) : (
        <div className="space-y-5">
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

          <section>
            <h3 className="mb-2 text-sm font-semibold text-primary">
              Assigned {terminology.courseLabel}s
            </h3>
            {assignedCourses.length === 0 ? (
              <p className="text-sm text-secondary">No {terminology.courseLabel.toLowerCase()}s assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assignedCourses.map((c) => (
                  <span key={c.id} className="rounded-md border border-muted bg-muted/40 px-2 py-1 text-xs text-primary">
                    <span className="font-mono text-secondary">{c.code}</span> · {c.title}
                  </span>
                ))}
              </div>
            )}
          </section>

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
      )}
    </Drawer>
  );
}
