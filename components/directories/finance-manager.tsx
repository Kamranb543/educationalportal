"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shell/section-header";
import { PanelCard, StatCard, StatusBadge } from "@/components/ui/primitives";
import { FeeCollectionModal } from "@/components/modals/fee-collection-modal";
import { BatchVoucherModal } from "@/components/modals/batch-voucher-modal";
import { HasPermission } from "@/components/auth/has-permission";
import { Toolbar, FilterSelect, EmptyRow } from "@/components/ui/toolbar";
import { matchesQuery, matchesClass } from "@/lib/store/selectors";
import { terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import type { FeeVoucher } from "@/types";
import type { FeePaymentFormValues } from "@/lib/forms/schemas";

type Row = FeeVoucher & { studentName: string; className: string; balance: number };

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
];

/** /finance ledger: reactive store data + voucher filters + collect-fee modal. */
export function FinanceManager() {
  const store = useStore();
  const vouchers = store.feeVouchers;
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [selected, setSelected] = useState<FeeVoucher | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);

  const rows = useMemo<Row[]>(
    () =>
      vouchers
        .map((v) => ({
          ...v,
          studentName: store.getStudentById(v.studentId)?.name ?? "Unknown",
          className: store.getClassById(v.classId)?.name ?? "Unassigned",
          balance: v.amount - v.discount - v.paidAmount,
        }))
        .filter(
          (v) =>
            matchesQuery(search, v.studentName, v.voucherNumber) &&
            matchesClass(v, classFilter) &&
            (statusFilter === "all" || v.status === statusFilter) &&
            (periodFilter === "all" || v.period === periodFilter),
        ),
    [vouchers, store, search, classFilter, statusFilter, periodFilter],
  );

  const periods = useMemo(
    () => Array.from(new Set(vouchers.map((v) => v.period))).sort().reverse(),
    [vouchers],
  );

  const net = store.netCashflow();

  function openCollect(v: FeeVoucher) {
    setSelected(v);
    setModalOpen(true);
  }

  function handlePayment(values: FeePaymentFormValues, voucher: FeeVoucher) {
    store.collectFee(voucher.id, {
      date: values.date,
      amount: values.amount,
      method: values.method,
      reference: values.reference,
    });
    toast.success("Fee collected", {
      description: `${voucher.voucherNumber} · ${formatCurrency(values.amount)}`,
    });
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Financial Ledger"
        description="Central cashflow — collect fees, review payroll, and track expenses"
        action={
          <HasPermission allow="generateVouchers">
            <button
              type="button"
              onClick={() => setBatchOpen(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
              style={{ background: "var(--app-accent)" }}
            >
              + Generate Batch Vouchers
            </button>
          </HasPermission>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fees Collected" value={formatCurrency(store.totalFeesCollected())} tone="positive" />
        <StatCard label="Payroll Paid" value={formatCurrency(store.totalPayrollPaid())} />
        <StatCard label="Expenses" value={formatCurrency(store.totalExpenses())} />
        <StatCard
          label="Net Cashflow"
          value={formatCurrency(net)}
          hint={net >= 0 ? "Surplus" : "Deficit"}
          tone={net >= 0 ? "positive" : "negative"}
        />
      </div>
      <p className="text-xs text-secondary">
        Outstanding across all {terminology.studentLabel.toLowerCase()}s:{" "}
        <span className="font-medium text-primary">{formatCurrency(store.totalOutstandingFees())}</span>
      </p>

      <PanelCard title="Fee Vouchers" description="Record a payment against any outstanding voucher">
        <div className="mb-4">
          <Toolbar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search by student or voucher…"
            filters={
              <>
                <FilterSelect
                  id="ff-class"
                  ariaLabel={`Filter by ${terminology.classLabel}`}
                  value={classFilter}
                  onChange={setClassFilter}
                  options={[
                    { value: "all", label: `All ${terminology.classLabel}s` },
                    ...store.classes.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
                <FilterSelect
                  id="ff-period"
                  ariaLabel="Filter by billing period"
                  value={periodFilter}
                  onChange={setPeriodFilter}
                  options={[{ value: "all", label: "All Periods" }, ...periods.map((p) => ({ value: p, label: p }))]}
                />
                <FilterSelect
                  id="ff-status"
                  ariaLabel="Filter by status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={STATUS_OPTIONS}
                />
              </>
            }
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-muted text-xs uppercase tracking-wide text-secondary">
                <th className="px-3 py-2 font-medium">Voucher</th>
                <th className="px-3 py-2 font-medium">{terminology.studentLabel}</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">{terminology.classLabel}</th>
                <th className="px-3 py-2 font-medium">Period</th>
                <th className="px-3 py-2 font-medium">Balance</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {rows.map((v) => (
                <tr key={v.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2 font-mono text-xs text-secondary">{v.voucherNumber}</td>
                  <td className="px-3 py-2 font-medium text-primary">{v.studentName}</td>
                  <td className="hidden px-3 py-2 text-secondary md:table-cell">{v.className}</td>
                  <td className="px-3 py-2 text-secondary">{v.period}</td>
                  <td className="px-3 py-2 font-medium text-primary">
                    {v.balance > 0 ? formatCurrency(v.balance) : "Settled"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <HasPermission allow="generateVouchers">
                      {v.balance > 0 ? (
                        <button
                          type="button"
                          onClick={() => openCollect(v)}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-card"
                          style={{ background: "var(--app-accent)" }}
                        >
                          Collect Fee
                        </button>
                      ) : (
                        <span className="text-xs text-secondary">Paid</span>
                      )}
                    </HasPermission>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <EmptyRow colSpan={7} label="No vouchers match your filters." />}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <HasPermission allow="viewPayroll">
        <PayrollPanel />
      </HasPermission>

      <FeeCollectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        voucher={selected}
        onSubmit={handlePayment}
      />
      <HasPermission allow="generateVouchers">
        <BatchVoucherModal open={batchOpen} onClose={() => setBatchOpen(false)} />
      </HasPermission>
    </div>
  );
}

/** Teacher Payroll disbursement table — Super Admin can mark payslips as paid,
 * which immediately reduces Net Cashflow through the reactive store. */
function PayrollPanel() {
  const store = useStore();
  const rows = [...store.payroll].sort((a, b) => (a.period < b.period ? 1 : -1));
  return (
    <PanelCard title="Teacher Payroll" description="Process monthly salary disbursements">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-muted text-xs uppercase tracking-wide text-secondary">
              <th className="px-3 py-2 font-medium">Payslip</th>
              <th className="px-3 py-2 font-medium">{terminology.teacherLabel}</th>
              <th className="px-3 py-2 font-medium">Period</th>
              <th className="px-3 py-2 font-medium">Net Pay</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {rows.map((p) => {
              const teacher = store.getTeacherById(p.teacherId);
              return (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2 font-mono text-xs text-secondary">{p.payslipNumber}</td>
                  <td className="px-3 py-2 font-medium text-primary">{teacher?.name ?? "Unknown"}</td>
                  <td className="px-3 py-2 text-secondary">{p.period}</td>
                  <td className="px-3 py-2 font-medium text-primary">{formatCurrency(p.netPay)}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    {p.status === "paid" ? (
                      <span className="text-xs text-secondary">Disbursed</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          store.markPayrollPaid(p.id);
                          toast.success("Payroll disbursed", {
                            description: `${teacher?.name ?? "Faculty"} · ${p.period}`,
                          });
                        }}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-card"
                        style={{ background: "var(--app-accent)" }}
                      >
                        Disburse
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}
