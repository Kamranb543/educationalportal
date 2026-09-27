"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ModalActions, SelectField, TextField } from "@/components/ui/form-fields";
import { studentSchema, fieldErrors, type StudentFormValues } from "@/lib/forms/schemas";
import { terminology } from "@/lib/config";
import { useStore } from "@/lib/store/store-context";
import type { Student } from "@/types";

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  /** Existing student to edit, or undefined when adding a new one. */
  student?: Student;
  onSubmit: (values: StudentFormValues) => void;
}

function initialValues(student?: Student): Partial<StudentFormValues> {
  if (!student) return { status: "active" };
  return {
    name: student.name,
    email: student.email,
    phone: student.phone,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    classId: student.classId,
    status: student.status,
  };
}

export function StudentModal({ open, onClose, student, onSubmit }: StudentModalProps) {
  const isEdit = Boolean(student);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${isEdit ? "Edit" : "Add"} ${terminology.studentLabel}`}
      description={
        isEdit
          ? `Update ${terminology.studentLabel.toLowerCase()} record`
          : `Enroll a new ${terminology.studentLabel.toLowerCase()}`
      }
      footer={<ModalActions form="student-form" onCancel={onClose} submitLabel={isEdit ? "Save Changes" : `Add ${terminology.studentLabel}`} />}
    >
      <StudentForm
        student={student}
        onSubmitted={(v) => {
          onSubmit(v);
          onClose();
        }}
      />
    </Modal>
  );
}

/** State lives here so each open mounts a fresh form seeded from props. */
function StudentForm({
  student,
  onSubmitted,
}: {
  student?: Student;
  onSubmitted: (values: StudentFormValues) => void;
}) {
  const store = useStore();
  const [values, setValues] = useState<Partial<StudentFormValues>>(() => initialValues(student));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Roll number is always system-generated — never hand-typed.
  const rollNumber = student?.rollNumber ?? store.nextRollNumber();

  function set<K extends keyof StudentFormValues>(key: K, value: StudentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = studentSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onSubmitted(parsed.data);
  }

  return (
    <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-muted bg-muted/40 px-3 py-2">
        <p className="text-xs text-secondary">Roll Number (auto-generated)</p>
        <p className="font-mono text-sm font-semibold text-primary">{rollNumber}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="st-name" label="Full Name" value={values.name ?? ""} error={errors.name} onChange={(e) => set("name", e.target.value)} />
        <TextField id="st-email" label="Email" type="email" value={values.email ?? ""} error={errors.email} onChange={(e) => set("email", e.target.value)} />
        <TextField id="st-phone" label="Phone" value={values.phone ?? ""} error={errors.phone} onChange={(e) => set("phone", e.target.value)} />
        <TextField id="st-guardian" label="Guardian Name" value={values.guardianName ?? ""} error={errors.guardianName} onChange={(e) => set("guardianName", e.target.value)} />
        <TextField id="st-gphone" label="Guardian Phone" value={values.guardianPhone ?? ""} error={errors.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} />
        <SelectField id="st-class" label={terminology.classLabel} value={values.classId ?? ""} error={errors.classId} onChange={(e) => set("classId", e.target.value)}>
          <option value="">Select {terminology.classLabel}</option>
          {store.classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <SelectField id="st-status" label="Status" value={values.status ?? "active"} onChange={(e) => set("status", e.target.value as StudentFormValues["status"])}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </SelectField>
      </div>
    </form>
  );
}
