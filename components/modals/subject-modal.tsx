"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ModalActions, TextAreaField, TextField } from "@/components/ui/form-fields";
import { subjectSchema, fieldErrors, type SubjectFormValues } from "@/lib/forms/schemas";
import type { Course } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Existing subject to edit, or undefined when adding a new one. */
  subject?: Course;
  onSubmit: (values: SubjectFormValues) => void;
}

function initialValues(subject?: Course): Partial<SubjectFormValues> {
  if (!subject) return {};
  return {
    code: subject.code,
    title: subject.title,
    description: subject.description,
  };
}

/** Create/edit a master subject. Master subjects only carry Code, Title & Description. */
export function SubjectModal({ open, onClose, subject, onSubmit }: Props) {
  const isEdit = Boolean(subject);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${isEdit ? "Edit" : "Add"} Subject`}
      description={
        isEdit ? "Update the master subject record" : "Create a new subject in the master list"
      }
      footer={
        <ModalActions
          form="subject-form"
          onCancel={onClose}
          submitLabel={isEdit ? "Save Changes" : "Add Subject"}
        />
      }
    >
      <SubjectForm
        subject={subject}
        onSubmitted={(v) => {
          onSubmit(v);
          onClose();
        }}
      />
    </Modal>
  );
}

function SubjectForm({
  subject,
  onSubmitted,
}: {
  subject?: Course;
  onSubmitted: (values: SubjectFormValues) => void;
}) {
  const [values, setValues] = useState<Partial<SubjectFormValues>>(() => initialValues(subject));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof SubjectFormValues>(key: K, value: SubjectFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = subjectSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onSubmitted(parsed.data);
  }

  return (
    <form id="subject-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="cj-code" label="Subject Code" value={values.code ?? ""} error={errors.code} onChange={(e) => set("code", e.target.value)} />
        <TextField id="cj-title" label="Subject Title" value={values.title ?? ""} error={errors.title} onChange={(e) => set("title", e.target.value)} />
      </div>
      <TextAreaField id="cj-desc" label="Description" value={values.description ?? ""} error={errors.description} onChange={(e) => set("description", e.target.value)} />
    </form>
  );
}