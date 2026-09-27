"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/shell/section-header";
import { PanelCard, StatCard, StatusBadge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/data";
import { config, terminology } from "@/lib/config";
import { useAuth } from "@/lib/auth/auth-context";
import { useStore } from "@/lib/store/store-context";
import type { FeeVoucher } from "@/types";

/** Read-only receipt view for a single voucher (printable via the browser). */
function ReceiptModal({
  open,
  voucher,
  studentName,
  onClose,
}: {
  open: boolean;
  voucher: FeeVoucher | null;
  studentName: string;
  onClose: () => void;
}) {
  if (!voucher) return null;
  const balance = voucher.amount - voucher.discount - voucher.paidAmount;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Fee Receipt"
      description={voucher.voucherNumber}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-card hover:opacity-90"
          >
            Print / Save PDF
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-muted p-3">
          <div>
            <p className="text-xs text-secondary">{config.identity.name}</p>
            <p className="text-sm font-semibold text-primary">{studentName}</p>
          </div>
          <StatusBadge status={voucher.status} />
        </div>
        <dl className="divide-y divide-muted text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-secondary">Billing Period</dt>
            <dd className="font-medium text-primary">{voucher.period}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-secondary">Issue Date</dt>
            <dd className="font-medium text-primary">{voucher.issueDate}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-secondary">Due Date</dt>
            <dd className="font-medium text-primary">{voucher.dueDate}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-secondary">Gross Amount</dt>
            <dd className="font-medium text-primary">{formatCurrency(voucher.amount)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-secondary">Paid</dt>
            <dd className="font-medium text-primary">{formatCurrency(voucher.paidAmount)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-secondary">Balance</dt>
            <dd className={`font-medium ${balance > 0 ? "text-primary" : "text-accent"}`}>
              {balance > 0 ? formatCurrency(balance) : "Settled"}
            </dd>
          </div>
        </dl>
        {voucher.payments.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
              Payment History
            </p>
            <div className="overflow-x-auto rounded-lg border border-muted">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-muted bg-muted/50 text-xs uppercase text-secondary">
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Method</th>
                    <th className="px-3 py-2 font-medium">Reference</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {voucher.payments.map((p, i) => (
                    <tr key={`${p.reference}-${i}`}>
                      <td className="px-3 py-2 text-secondary">{p.date}</td>
                      <td className="px-3 py-2 capitalize text-primary">{p.method.replace("-", " ")}</td>
                      <td className="px-3 py-2 font-mono text-xs text-secondary">{p.reference}</td>
                      <td className="px-3 py-2 font-medium text-primary">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/** Trainee-only view: full personal fee ledger with downloadable receipts. */
export function MyVouchersManager() {
  const store = useStore();
  const { currentUser } = useAuth();
  const [selected, setSelected] = useState<FeeVoucher | null>(null);

  const studentId = currentUser?.studentId;
  const student = studentId ? store.getStudentById(studentId) : undefined;

  if (!student) {
    return (
      <p className="text-sm text-secondary">
        No {terminology.studentLabel.toLowerCase()} profile is linked to this account.
      </p>
    );
  }

  const vouchers = store
    .getVouchersForStudent(student.id)
    .sort((a, b) => (a.period < b.period ? 1 : -1));
  const outstanding = store.studentOutstandingBalance(student.id);
  const paid = vouchers.reduce((s, v) => s + v.paidAmount, 0);
  const totalBilled = vouchers.reduce((s, v) => s + (v.amount - v.discount), 0);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="My Vouchers"
        description={`${student.name} · ${student.rollNumber} — your complete fee ledger and receipts`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Billed" value={formatCurrency(totalBilled)} />
        <StatCard label="Total Paid" value={formatCurrency(paid)} tone="positive" />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          tone={outstanding > 0 ? "negative" : "positive"}
        />
      </div>

      <PanelCard title="Fee History" description="View or print a receipt for any billing period">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-muted text-xs uppercase tracking-wide text-secondary">
                <th className="px-3 py-2 font-medium">Period</th>
                <th className="px-3 py-2 font-medium">Voucher</th>
                <th className="px-3 py-2 font-medium">Due Date</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Balance</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {vouchers.map((v) => {
                const balance = v.amount - v.discount - v.paidAmount;
                return (
                  <tr key={v.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2 font-medium text-primary">{v.period}</td>
                    <td className="px-3 py-2 font-mono text-xs text-secondary">{v.voucherNumber}</td>
                    <td className="px-3 py-2 text-secondary">{v.dueDate}</td>
                    <td className="px-3 py-2 text-secondary">{formatCurrency(v.amount)}</td>
                    <td className={`px-3 py-2 font-medium ${balance > 0 ? "text-primary" : "text-accent"}`}>
                      {balance > 0 ? formatCurrency(balance) : "Settled"}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(v)}
                        className="rounded-md border border-muted px-2.5 py-1 text-xs font-medium text-secondary hover:bg-muted"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-secondary">
                    No vouchers issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <ReceiptModal
        open={selected !== null}
        voucher={selected}
        studentName={student.name}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
