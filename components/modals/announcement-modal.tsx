"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ModalActions, SelectField, TextAreaField, TextField } from "@/components/ui/form-fields";
import { fieldErrors, announcementSchema, type AnnouncementFormValues } from "@/lib/forms/schemas";
import { config, terminology } from "@/lib/config";
import type { NewAnnouncementInput } from "@/lib/store/store-context";
import type { AnnouncementAudience } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  authorId: string;
  onSubmit: (input: NewAnnouncementInput) => void;
}

const AUDIENCES: { value: AnnouncementAudience; label: string }[] = [
  { value: "students", label: `${terminology.studentLabel}s` },
  { value: "teachers", label: `${terminology.teacherLabel}s` },
  { value: "admins", label: "Admins" },
];

export function AnnouncementModal({ open, onClose, authorId, onSubmit }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Announcement"
      description={`Post an update to ${config.identity.shortName} audiences`}
      footer={<ModalActions form="announcement-form" onCancel={onClose} submitLabel="Publish" />}
    >
      <AnnouncementForm
        onSubmitted={(values) => {
          onSubmit({ ...values, authorId });
          onClose();
        }}
      />
    </Modal>
  );
}

function AnnouncementForm({ onSubmitted }: { onSubmitted: (values: AnnouncementFormValues) => void }) {
  const [values, setValues] = useState<Partial<AnnouncementFormValues>>({
    audience: [],
    priority: "normal",
    pinned: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof AnnouncementFormValues>(key: K, value: AnnouncementFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleAudience(aud: AnnouncementAudience) {
    setValues((v) => {
      const current = v.audience ?? [];
      const next = current.includes(aud)
        ? current.filter((a) => a !== aud)
        : [...current, aud];
      return { ...v, audience: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = announcementSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onSubmitted(parsed.data);
  }

  const selected = values.audience ?? [];

  return (
    <form id="announcement-form" onSubmit={handleSubmit} className="space-y-4">
      <TextField id="an-title" label="Title" value={values.title ?? ""} error={errors.title} onChange={(e) => set("title", e.target.value)} />
      <TextAreaField id="an-body" label="Message" value={values.body ?? ""} error={errors.body} onChange={(e) => set("body", e.target.value)} />

      <fieldset className="rounded-lg border border-muted p-3">
        <legend className="px-1 text-xs font-medium text-secondary">Target Audiences</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {AUDIENCES.map((a) => {
            const checked = selected.includes(a.value);
            return (
              <label key={a.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAudience(a.value)}
                  className="h-4 w-4 accent-[var(--app-accent)]"
                />
                <span className="text-primary">{a.label}</span>
              </label>
            );
          })}
        </div>
        {errors.audience && (
          <p className="mt-2 text-xs text-primary">Select at least one audience.</p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField id="an-priority" label="Priority" value={values.priority ?? "normal"} onChange={(e) => set("priority", e.target.value as AnnouncementFormValues["priority"])}>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
        </SelectField>
        <label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={values.pinned ?? false}
            onChange={(e) => set("pinned", e.target.checked)}
            className="h-4 w-4 accent-[var(--app-accent)]"
          />
          <span className="text-primary">Pin to top</span>
        </label>
      </div>
    </form>
  );
}
