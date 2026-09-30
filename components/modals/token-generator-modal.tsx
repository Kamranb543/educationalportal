"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { ModalActions, SelectField, TextAreaField, TextField } from "@/components/ui/form-fields";
import { fieldErrors, inviteTokenSchema, type InviteTokenFormValues } from "@/lib/forms/schemas";
import { config, terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import { useAuth } from "@/lib/auth/auth-context";
import type { InviteToken } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Admin modal to issue single-use invitation tokens with pre-set contract terms. */
export function TokenGeneratorModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Invitation Token"
      description={`Issue a single-use ${config.identity.shortName} onboarding code`}
      footer={<ModalActions form="token-form" onCancel={onClose} submitLabel="Generate" />}
    >
      <TokenForm
        onCreated={(token) => {
          toast.success("Token generated", {
            description: `${token.code} — share it with the invitee`,
          });
          onClose();
        }}
      />
    </Modal>
  );
}

function TokenForm({ onCreated }: { onCreated: (token: InviteToken) => void }) {
  const store = useStore();
  const { currentUser } = useAuth();
  const [values, setValues] = useState<Partial<InviteTokenFormValues>>({
    role: "teacher",
    expiresAt: defaultExpiry(),
    contractNotes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof InviteTokenFormValues>(key: K, value: InviteTokenFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = inviteTokenSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    const token = store.generateInviteToken({
      role: parsed.data.role,
      offeredSalary: parsed.data.offeredSalary,
      feeDiscount: parsed.data.feeDiscount,
      contractNotes: parsed.data.contractNotes,
      expiresAt: parsed.data.expiresAt,
      createdBy: currentUser?.id ?? "usr-01",
    });
    onCreated(token);
  }

  const isTeacher = values.role === "teacher";

  return (
    <form id="token-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField id="tk-role" label="Invite For" value={values.role ?? "teacher"} onChange={(e) => set("role", e.target.value as InviteTokenFormValues["role"])}>
          <option value="teacher">{terminology.teacherLabel}</option>
          <option value="student">{terminology.studentLabel}</option>
        </SelectField>
        <TextField id="tk-expiry" label="Valid Until" type="date" value={values.expiresAt ?? ""} error={errors.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
        {isTeacher ? (
          <TextField
            id="tk-salary"
            label="Offered Monthly Salary"
            type="number"
            inputMode="numeric"
            prefix={config.localization.currencySymbol}
            value={values.offeredSalary ?? ""}
            error={errors.offeredSalary}
            onChange={(e) => set("offeredSalary", e.target.value === "" ? null : Number(e.target.value))}
          />
        ) : (
          <TextField
            id="tk-discount"
            label="Fee Concession / month"
            type="number"
            inputMode="numeric"
            prefix={config.localization.currencySymbol}
            value={values.feeDiscount ?? ""}
            error={errors.feeDiscount}
            onChange={(e) => set("feeDiscount", e.target.value === "" ? null : Number(e.target.value))}
          />
        )}
      </div>
      <TextAreaField id="tk-notes" label="Contract Notes" placeholder="Terms shown to the invitee and locked on their form" value={values.contractNotes ?? ""} error={errors.contractNotes} onChange={(e) => set("contractNotes", e.target.value)} />
      {isTeacher && values.offeredSalary ? (
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-secondary">
          Approved {terminology.teacherLabel.toLowerCase()} will start at {formatCurrency(values.offeredSalary)}/month on hire.
        </p>
      ) : null}
    </form>
  );
}

function defaultExpiry(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
