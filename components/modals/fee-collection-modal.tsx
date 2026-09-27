"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ModalActions, SelectField, TextField } from "@/components/ui/form-fields";
import { feePaymentSchema, fieldErrors, type FeePaymentFormValues } from "@/lib/forms/schemas";
import { config } from "@/lib/config";
import { formatCurrency, getStudentById } from "@/data";
import type { FeeVoucher } from "@/types";

interface FeeModalProps {
  open: boolean;
  onClose: () => void;
  voucher?: FeeVoucher;
  onSubmit: (values: FeePaymentFormValues, voucher: FeeVoucher) => void;
}

const METHODS: { value: FeePaymentFormValues["method"]; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "online", label: "Online Payment" },
];

function balanceOf(voucher?: FeeVoucher): number {
  return voucher ? voucher.amount - voucher.discount - voucher.paidAmount : 0;
}

export function FeeCollectionModal({ open, onClose, voucher, onSubmit }: FeeModalProps) {
  const student = voucher ? getStudentById(voucher.studentId) : undefined;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Collect Fee / Pay Voucher"
      description={student ? `${student.name} · ${voucher?.voucherNumber ?? ""}` : undefined}
      footer={<ModalActions form="fee-form" onCancel={onClose} submitLabel="Record Payment" />}
    >
      {voucher && (
        <FeeForm
          balance={balanceOf(voucher)}
          onSubmitted={(values) => {
            onSubmit(values, voucher);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

function FeeForm({ balance, onSubmitted }: { balance: number; onSubmitted: (values: FeePaymentFormValues) => void }) {
  const [values, setValues] = useState<Partial<FeePaymentFormValues>>(() => ({
    amount: balance,
    method: "cash",
    date: new Date().toISOString().slice(0, 10),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof FeePaymentFormValues>(key: K, value: FeePaymentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = feePaymentSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    if (parsed.data.amount > balance) {
      setErrors({ amount: `Amount cannot exceed outstanding balance of ${formatCurrency(balance)}` });
      return;
    }
    setErrors({});
    onSubmitted(parsed.data);
  }

  return (
    <form id="fee-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-muted bg-muted/40 px-3 py-2 text-sm">
        <p className="text-secondary">Outstanding balance</p>
        <p className="text-lg font-semibold text-primary">{formatCurrency(balance)}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="fv-amount"
          label="Amount to Collect"
          type="number"
          inputMode="numeric"
          prefix={config.localization.currencySymbol}
          value={values.amount ?? ""}
          error={errors.amount}
          onChange={(e) => set("amount", Number(e.target.value))}
        />
        <SelectField id="fv-method" label="Payment Mode" value={values.method ?? "cash"} onChange={(e) => set("method", e.target.value as FeePaymentFormValues["method"])}>
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </SelectField>
        <TextField id="fv-ref" label="Payment Reference" placeholder="TXN / receipt no." value={values.reference ?? ""} error={errors.reference} onChange={(e) => set("reference", e.target.value)} />
        <TextField id="fv-date" label="Payment Date" type="date" value={values.date ?? ""} error={errors.date} onChange={(e) => set("date", e.target.value)} />
      </div>
    </form>
  );
}
