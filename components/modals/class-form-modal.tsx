"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ModalActions, SelectField, TextField } from "@/components/ui/form-fields";
import {
  classSchema,
  classEditSchema,
  fieldErrors,
  type ClassFormValues,
  type ClassEditFormValues,
} from "@/lib/forms/schemas";
import { terminology, config } from "@/lib/config";
import { useStore } from "@/lib/store/store-context";
import type { ClassBatch } from "@/types";

/** Discriminated submit payload so parents handle create vs edit cleanly. */
export type ClassSubmit =
  | { mode: "create"; values: ClassFormValues }
  | { mode: "edit"; values: ClassEditFormValues };

interface Props {
  open: boolean;
  onClose: () => void;
  /** Batch present → Edit mode (full fields + subject add/remove). */
  batch?: ClassBatch;
  onSubmit: (submit: ClassSubmit) => void;
}

function editValues(batch?: ClassBatch): Partial<ClassEditFormValues> {
  if (!batch) return { academicYear: String(new Date().getFullYear()), courseIds: [] };
  return {
    name: batch.name,
    section: batch.section,
    monthlyFee: batch.monthlyFee,
    academicYear: batch.academicYear,
    teacherId: batch.teacherId,
    room: batch.room,
    capacity: batch.capacity,
    courseIds: batch.courseIds,
  };
}

/**
 * Create = Class Name, Section, Monthly Fee only.
 * Edit = full batch attributes + a multi-select master-subject checkbox list.
 */
export function ClassFormModal({ open, onClose, batch, onSubmit }: Props) {
  const isEdit = Boolean(batch);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${isEdit ? "Edit" : "Add"} ${terminology.classLabel}`}
      description={
        isEdit
          ? "Update batch details and add/remove master subjects"
          : `Create a new ${terminology.classLabel.toLowerCase()} — details are refined later`
      }
      footer={
        <ModalActions form="class-form" onCancel={onClose} submitLabel={isEdit ? "Save Changes" : "Create Class"} />
      }
    >
      <ClassForm
        key={batch?.id ?? "new"}
        batch={batch}
        onSubmitted={(v) => {
          onSubmit(v);
          onClose();
        }}
      />
    </Modal>
  );
}

function ClassForm({
  batch,
  onSubmitted,
}: {
  batch?: ClassBatch;
  onSubmitted: (submit: ClassSubmit) => void;
}) {
  const store = useStore();
  const isEdit = Boolean(batch);

  // Create-mode state (fee kept as raw string until Zod coercion on submit).
  const [create, setCreate] = useState<{
    name: string;
    section: string;
    monthlyFee: string;
  }>({ name: "", section: "", monthlyFee: "" });
  // Edit-mode state.
  const [edit, setEdit] = useState<Partial<ClassEditFormValues>>(() => editValues(batch));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCourses = edit.courseIds ?? [];

  function toggleCourse(courseId: string) {
    setEdit((v) => {
      const current = v.courseIds ?? [];
      const next = current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId];
      return { ...v, courseIds: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEdit) {
      const parsed = classSchema.safeParse(create);
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        return;
      }
      setErrors({});
      onSubmitted({ mode: "create", values: parsed.data });
      return;
    }
    const parsed = classEditSchema.safeParse(edit);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onSubmitted({ mode: "edit", values: parsed.data });
  }

  return (
    <form id="class-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="cb-name"
          label={`${terminology.classLabel} Name`}
          value={(isEdit ? edit.name : create.name) ?? ""}
          error={errors.name}
          onChange={(e) =>
            isEdit ? setEdit((v) => ({ ...v, name: e.target.value })) : setCreate((v) => ({ ...v, name: e.target.value }))
          }
        />
        <TextField
          id="cb-section"
          label="Section"
          value={(isEdit ? edit.section : create.section) ?? ""}
          error={errors.section}
          onChange={(e) =>
            isEdit ? setEdit((v) => ({ ...v, section: e.target.value })) : setCreate((v) => ({ ...v, section: e.target.value }))
          }
        />
        <TextField
          id="cb-fee"
          label="Monthly Fee"
          type="number"
          prefix={config.localization.currencySymbol}
          value={String((isEdit ? edit.monthlyFee : create.monthlyFee) ?? "")}
          error={errors.monthlyFee}
          onChange={(e) =>
            isEdit
              ? setEdit((v) => ({ ...v, monthlyFee: Number(e.target.value) }))
              : setCreate((v) => ({ ...v, monthlyFee: e.target.value }))
          }
        />
        {isEdit && (
          <>
            <TextField
              id="cb-year"
              label="Academic Year"
              value={edit.academicYear ?? ""}
              error={errors.academicYear}
              onChange={(e) => setEdit((v) => ({ ...v, academicYear: e.target.value }))}
            />
            <SelectField
              id="cb-teacher"
              label={`Lead ${terminology.teacherLabel}`}
              value={edit.teacherId ?? ""}
              error={errors.teacherId}
              onChange={(e) => setEdit((v) => ({ ...v, teacherId: e.target.value }))}
            >
              <option value="">Select {terminology.teacherLabel}</option>
              {store.teachers
                .filter((t) => t.status === "active")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </SelectField>
            <TextField
              id="cb-room"
              label="Room"
              value={edit.room ?? ""}
              error={errors.room}
              onChange={(e) => setEdit((v) => ({ ...v, room: e.target.value }))}
            />
            <TextField
              id="cb-capacity"
              label="Capacity"
              type="number"
              value={String(edit.capacity ?? "")}
              error={errors.capacity}
              onChange={(e) => setEdit((v) => ({ ...v, capacity: Number(e.target.value) }))}
            />
          </>
        )}
      </div>

      {isEdit && (
        <fieldset className="rounded-lg border border-muted p-3">
          <legend className="px-1 text-xs font-medium text-secondary">
            Subjects (add / remove master subjects)
          </legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {store.courses.map((c) => {
              const checked = selectedCourses.includes(c.id);
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
          {errors.courseIds && <p className="mt-1 text-xs text-primary">{errors.courseIds}</p>}
        </fieldset>
      )}

      {!isEdit && (
        <p className="text-xs text-secondary">
          Subjects, room, lead {terminology.teacherLabel.toLowerCase()}, and schedule are assigned
          from the class page after creation.
        </p>
      )}
    </form>
  );
}