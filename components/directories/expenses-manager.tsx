"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shell/section-header";
import { PanelCard, StatCard, StatusBadge } from "@/components/ui/primitives";
import { ExpenseModal } from "@/components/modals/expense-modal";
import { HasPermission } from "@/components/auth/has-permission";
import { Toolbar, FilterSelect, EmptyRow } from "@/components/ui/toolbar";
import { matchesQuery, matchesStatus, matchesDate } from "@/lib/store/selectors";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import type { ExpenseCategory } from "@/types";
import type { ExpenseFormValues } from "@/lib/forms/schemas";

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: "Rent",
  utilities: "Utilities",
  supplies: "Supplies",
  maintenance: "Maintenance",
  marketing: "Marketing",
  misc: "Misc",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

/** /expenses register: reactive store data + search/category/status/date filters. */
export function ExpensesManager() {
  const store = useStore();
  const rowsAll = store.expenses;
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const months = useMemo(
    () => Array.from(new Set(rowsAll.map((e) => e.date.slice(0, 7)))).sort().reverse(),
    [rowsAll],
  );

  const rows = useMemo(
    () =>
      rowsAll.filter(
        (e) =>
          matchesQuery(search, e.title, e.description, e.receiptNumber) &&
          (categoryFilter === "all" || e.category === categoryFilter) &&
          matchesStatus(e, statusFilter) &&
          matchesDate(e.date, monthFilter),
      ),
    [rowsAll, search, categoryFilter, statusFilter, monthFilter],
  );

  const approvedTotal = rowsAll
    .filter((e) => e.status === "approved")
    .reduce((s, e) => s + e.amount, 0);
  const pendingTotal = rowsAll
    .filter((e) => e.status === "pending")
    .reduce((s, e) => s + e.amount, 0);

  function handleSubmit(values: ExpenseFormValues) {
    store.addExpense(values);
    setNotice("Logged expense is awaiting approval");
    toast.success("Expense logged", {
      description: `${values.title} · ${formatCurrency(values.amount)} (pending approval)`,
    });
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Expenses"
        description="Log and approve operational expenses of the institution"
        action={
          <HasPermission allow="manageExpenses">
            <button
              type="button"
              onClick={() => {
                setNotice(null);
                setModalOpen(true);
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
              style={{ background: "var(--app-accent)" }}
            >
              + Add Expense
            </button>
          </HasPermission>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total Approved" value={formatCurrency(approvedTotal)} hint="All approved expenses" />
        <StatCard label="Pending Approval" value={formatCurrency(pendingTotal)} hint="Awaiting review" tone="negative" />
      </div>
      {notice && <p className="text-xs text-accent">{notice}</p>}

      <PanelCard title="Expense Register" description="Most recent entries first">
        <div className="mb-4">
          <Toolbar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search expenses…"
            filters={
              <>
                <FilterSelect
                  id="ef-cat"
                  ariaLabel="Filter by category"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { value: "all", label: "All Categories" },
                    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
                  ]}
                />
                <FilterSelect
                  id="ef-status"
                  ariaLabel="Filter by status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={STATUS_OPTIONS}
                />
                <FilterSelect
                  id="ef-month"
                  ariaLabel="Filter by month"
                  value={monthFilter}
                  onChange={setMonthFilter}
                  options={[{ value: "", label: "All Months" }, ...months.map((m) => ({ value: m, label: m }))]}
                />
              </>
            }
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-muted text-xs uppercase tracking-wide text-secondary">
                <th className="px-3 py-2 font-medium">Receipt</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2 font-mono text-xs text-secondary">{e.receiptNumber}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-primary">{e.title}</p>
                    <p className="text-xs text-secondary">{e.description}</p>
                  </td>
                  <td className="px-3 py-2 text-secondary">{CATEGORY_LABELS[e.category]}</td>
                  <td className="px-3 py-2 text-secondary">{e.date}</td>
                  <td className="px-3 py-2 font-medium text-primary">{formatCurrency(e.amount)}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={e.status} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <EmptyRow colSpan={6} label="No expenses match your filters." />}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-secondary">
          Approved expenses reduce the institution Net Cashflow (see Financial Ledger).
        </p>
      </PanelCard>

      <ExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}
