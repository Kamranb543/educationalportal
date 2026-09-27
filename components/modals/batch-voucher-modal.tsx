"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/form-fields";
import { terminology } from "@/lib/config";
import { useStore } from "@/lib/store/store-context";

interface Props {
  open: boolean;
  onClose: () => void;
}

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Generates pending monthly fee vouchers for every active student in a batch. */
export function BatchVoucherModal({ open, onClose }: Props) {
  const store = useStore();
  const [classId, setClassId] = useState("");
  const [period, setPeriod] = useState(currentPeriod());
  const [result, setResult] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) return;
    const created = store.generateBatchVouchers(classId, period);
    setResult(created);
  }

  function reset() {
    setResult(null);
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Generate Batch Vouchers"
      description={`Issue ${terminology.studentLabel.toLowerCase()} fee vouchers for a monthly billing cycle`}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
          >
            Close
          </button>
          {!result ? (
            <button
              type="submit"
              form="batch-voucher-form"
              disabled={!classId}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-card hover:opacity-90 disabled:opacity-50"
            >
              Generate
            </button>
          ) : null}
        </div>
      }
    >
      {result !== null ? (
        <div className="rounded-lg border border-muted bg-muted/40 p-4 text-sm">
          <p className="font-semibold text-primary">
            {result > 0
              ? `Generated ${result} new pending voucher${result === 1 ? "" : "s"}.`
              : `No new vouchers — ${terminology.classLabel.toLowerCase()} is already billed for ${period}.`}
          </p>
          <p className="mt-1 text-secondary">Existing settled or in-progress vouchers were left untouched.</p>
        </div>
      ) : (
        <form id="batch-voucher-form" onSubmit={handleSubmit} className="space-y-4">
          <SelectField
            id="bv-class"
            label={terminology.classLabel}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Select {terminology.classLabel}</option>
            {store.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <div>
            <label htmlFor="bv-period" className="mb-1 block text-xs font-medium text-secondary">
              Billing Period
            </label>
            <input
              id="bv-period"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-lg border border-muted bg-card px-3 py-2 text-sm text-primary outline-none focus:border-accent"
            />
          </div>
          {classId && (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-secondary">
              {store.getStudentsForClass(classId).filter((s) => s.status === "active").length} active{" "}
              {terminology.studentLabel.toLowerCase()}s in this {terminology.classLabel.toLowerCase()}. Only
              students without a voucher for {period} will be billed.
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}
