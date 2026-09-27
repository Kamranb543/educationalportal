"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ModalActions, SelectField, TextAreaField, TextField } from "@/components/ui/form-fields";
import { expenseSchema, fieldErrors, type ExpenseFormValues } from "@/lib/forms/schemas";
import { config } from "@/lib/config";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => void;
}

const CATEGORIES: ExpenseFormValues["category"][] = [
  "rent",
  "utilities",
  "supplies",
  "maintenance",
  "marketing",
  "misc",
];

export function ExpenseModal({ open, onClose, onSubmit }: ExpenseModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Expense"
      description="Log a new institutional expense for approval"
      footer={<ModalActions form="expense-form" onCancel={onClose} submitLabel="Add Expense" />}
    >
      <ExpenseForm
        onSubmitted={(v) => {
          onSubmit(v);
          onClose();
        }}
      />
    </Modal>
  );
}

function ExpenseForm({ onSubmitted }: { onSubmitted: (values: ExpenseFormValues) => void }) {
  const [values, setValues] = useState<Partial<ExpenseFormValues>>(() => ({
    category: "supplies",
    date: new Date().toISOString().slice(0, 10),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = expenseSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onSubmitted(parsed.data);
  }

  return (
    <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
      <TextField id="ex-title" label="Expense Title" value={values.title ?? ""} error={errors.title} onChange={(e) => set("title", e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField id="ex-cat" label="Category" value={values.category ?? "supplies"} onChange={(e) => set("category", e.target.value as ExpenseFormValues["category"])}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </SelectField>
        <TextField
          id="ex-amount"
          label="Amount"
          type="number"
          inputMode="numeric"
          prefix={config.localization.currencySymbol}
          value={values.amount ?? ""}
          error={errors.amount}
          onChange={(e) => set("amount", Number(e.target.value))}
        />
        <TextField id="ex-date" label="Date" type="date" value={values.date ?? ""} error={errors.date} onChange={(e) => set("date", e.target.value)} />
      </div>
      <TextAreaField id="ex-desc" label="Description" value={values.description ?? ""} error={errors.description} onChange={(e) => set("description", e.target.value)} />
    </form>
  );
}
