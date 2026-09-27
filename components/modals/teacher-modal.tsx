"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ModalActions, SelectField, TextField } from "@/components/ui/form-fields";
import { teacherSchema, fieldErrors, type TeacherFormValues } from "@/lib/forms/schemas";
import { config, terminology } from "@/lib/config";
import { useStore } from "@/lib/store/store-context";
import type { Teacher } from "@/types";

interface TeacherModalProps {
  open: boolean;
  onClose: () => void;
  teacher?: Teacher;
  onSubmit: (values: TeacherFormValues) => void;
}

function initialValues(teacher?: Teacher): Partial<TeacherFormValues> {
  if (!teacher) return { status: "active", courseIds: [] };
  return {
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    department: teacher.department,
    qualification: teacher.qualification,
    baseSalary: teacher.baseSalary,
    status: teacher.status,
  };
}

export function TeacherModal({ open, onClose, teacher, onSubmit }: TeacherModalProps) {
  const isEdit = Boolean(teacher);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${isEdit ? "Edit" : "Add"} ${terminology.teacherLabel}`}
      description={isEdit ? "Update faculty record" : `Add a new ${terminology.teacherLabel.toLowerCase()} to staff`}
      footer={<ModalActions form="teacher-form" onCancel={onClose} submitLabel={isEdit ? "Save Changes" : `Add ${terminology.teacherLabel}`} />}
    >
      <TeacherForm
        teacher={teacher}
        onSubmitted={(v) => {
          onSubmit(v);
          onClose();
        }}
      />
    </Modal>
  );
}

function TeacherForm({
  teacher,
  onSubmitted,
}: {
  teacher?: Teacher;
  onSubmitted: (values: TeacherFormValues) => void;
}) {
  const store = useStore();
  const courses = store.courses;
  const [values, setValues] = useState<Partial<TeacherFormValues>>(() => ({
    ...initialValues(teacher),
    courseIds: teacher
      ? courses.filter((c) => c.teacherId === teacher.id).map((c) => c.id)
      : [],
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Employee ID is always system-generated — never hand-typed.
  const employeeId = teacher?.employeeId ?? store.nextEmployeeId();

  function set<K extends keyof TeacherFormValues>(key: K, value: TeacherFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleCourse(courseId: string) {
    setValues((v) => {
      const current = v.courseIds ?? [];
      const next = current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId];
      return { ...v, courseIds: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = teacherSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onSubmitted(parsed.data);
  }

  return (
    <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-muted bg-muted/40 px-3 py-2">
        <p className="text-xs text-secondary">Employee ID (auto-generated)</p>
        <p className="font-mono text-sm font-semibold text-primary">{employeeId}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="tc-name" label="Full Name" value={values.name ?? ""} error={errors.name} onChange={(e) => set("name", e.target.value)} />
        <TextField id="tc-email" label="Email" type="email" value={values.email ?? ""} error={errors.email} onChange={(e) => set("email", e.target.value)} />
        <TextField id="tc-phone" label="Phone" value={values.phone ?? ""} error={errors.phone} onChange={(e) => set("phone", e.target.value)} />
        <TextField id="tc-dept" label="Department" value={values.department ?? ""} error={errors.department} onChange={(e) => set("department", e.target.value)} />
        <TextField id="tc-qual" label="Qualification" value={values.qualification ?? ""} error={errors.qualification} onChange={(e) => set("qualification", e.target.value)} />
        <TextField
          id="tc-salary"
          label="Base Salary / month"
          type="number"
          inputMode="numeric"
          prefix={config.localization.currencySymbol}
          value={values.baseSalary ?? ""}
          error={errors.baseSalary}
          onChange={(e) => set("baseSalary", Number(e.target.value))}
        />
        <SelectField id="tc-status" label="Status" value={values.status ?? "active"} onChange={(e) => set("status", e.target.value as TeacherFormValues["status"])}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </SelectField>
      </div>

      <fieldset className="rounded-lg border border-muted p-3">
        <legend className="px-1 text-xs font-medium text-secondary">
          Assign {terminology.courseLabel}s
        </legend>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {courses.map((c) => {
            const checked = (values.courseIds ?? []).includes(c.id);
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
    </form>
  );
}
