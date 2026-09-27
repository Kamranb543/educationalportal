"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/shell/section-header";
import { PanelCard, StatCard } from "@/components/ui/primitives";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import type { AttendanceStatus, ExpenseCategory } from "@/types";

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-accent",
  late: "bg-secondary",
  absent: "bg-primary",
  leave: "bg-muted",
};

const CATEGORIES: ExpenseCategory[] = [
  "rent",
  "utilities",
  "supplies",
  "maintenance",
  "marketing",
  "misc",
];

function Bar({
  label,
  value,
  max,
  display,
  color = "bg-accent",
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-primary">{label}</span>
        <span className="text-secondary">{display}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function LegendChip({ status, count }: { status: AttendanceStatus; count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-secondary">
      <span className={`h-3 w-3 rounded-full ${STATUS_COLORS[status]}`} />
      <span className="capitalize">{status}</span>
      <span className="font-medium text-primary">{count}</span>
    </span>
  );
}

/** Institution-wide analytics: financial collection, attendance, payroll/expenses. */
export function ReportsManager() {
  const store = useStore();
  const [period, setPeriod] = useState("all");

  const periods = useMemo(
    () => Array.from(new Set(store.feeVouchers.map((v) => v.period))).sort().reverse(),
    [store.feeVouchers],
  );

  // --- Financial Collection ---
  const finance = useMemo(() => {
    const vouchers =
      period === "all" ? store.feeVouchers : store.feeVouchers.filter((v) => v.period === period);
    const collected = vouchers.reduce((s, v) => s + v.paidAmount, 0);
    const billed = vouchers.reduce((s, v) => s + (v.amount - v.discount), 0);
    const outstanding = billed - collected;
    const collectionRate = billed > 0 ? Math.round((collected / billed) * 100) : 0;

    const byClass = store.classes.map((cls) => {
      const inClass = vouchers.filter((v) => v.classId === cls.id);
      const done = inClass.reduce((s, v) => s + v.paidAmount, 0);
      const due = inClass.reduce((s, v) => s + (v.amount - v.discount - v.paidAmount), 0);
      return { name: cls.name, collected: done, outstanding: due };
    });

    const byPeriod = periods.map((p) => {
      const inPeriod = store.feeVouchers.filter((v) => v.period === p);
      return { period: p, collected: inPeriod.reduce((s, v) => s + v.paidAmount, 0) };
    });

    return { collected, billed, outstanding, collectionRate, byClass, byPeriod };
  }, [store.feeVouchers, store.classes, period, periods]);

  // --- Attendance Analytics ---
  const attendance = useMemo(() => {
    const scoped = store.attendance.filter((a) => {
      if (period === "all") return true;
      return a.date.startsWith(period);
    });
    const totals: Record<AttendanceStatus, number> = { present: 0, absent: 0, late: 0, leave: 0 };
    for (const a of scoped) totals[a.status]++;
    const sessions = scoped.length;
    const attended = totals.present + totals.late;
    const rate = sessions > 0 ? Math.round((attended / sessions) * 100) : 0;

    const byClass = store.classes.map((cls) => {
      const recs = scoped.filter((a) => a.classId === cls.id);
      const ok = recs.filter((a) => a.status === "present" || a.status === "late").length;
      return {
        name: cls.name,
        pct: recs.length ? Math.round((ok / recs.length) * 100) : 0,
      };
    });

    return { totals, sessions, rate, byClass };
  }, [store.attendance, store.classes, period]);

  // Faculty attendance rate (single snapshot date-independent)
  const facultyRate = useMemo(() => {
    const recs = store.teacherAttendance;
    const ok = recs.filter((a) => a.status === "present" || a.status === "late").length;
    return recs.length ? Math.round((ok / recs.length) * 100) : 0;
  }, [store.teacherAttendance]);

  // --- Payroll & Expense breakdown ---
  const payroll = useMemo(() => {
    const paid = store.totalPayrollPaid();
    const byTeacher = store.teachers
      .filter((t) => t.status === "active")
      .map((t) => ({
        name: t.name,
        amount: store
          .getPayrollForTeacher(t.id)
          .filter((p) => p.status === "paid")
          .reduce((s, p) => s + p.netPay, 0),
      }))
      .filter((r) => r.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    return { paid, byTeacher };
  }, [store]);

  const expenses = useMemo(() => {
    const byCategory = CATEGORIES.map((c) => ({
      category: c,
      amount: store.expenses
        .filter((e) => e.status === "approved" && e.category === c)
        .reduce((s, e) => s + e.amount, 0),
    })).filter((r) => r.amount > 0);
    return { byCategory };
  }, [store.expenses]);

  const net = store.netCashflow();

  const maxClassFee = Math.max(1, ...finance.byClass.map((c) => c.collected + c.outstanding));
  const maxPeriod = Math.max(1, ...finance.byPeriod.map((p) => p.collected));
  const maxPayroll = Math.max(1, ...payroll.byTeacher.map((t) => t.amount));
  const maxExpense = Math.max(1, ...expenses.byCategory.map((e) => e.amount));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Reports & Analytics"
        description="Institution-wide financial, attendance, and payroll insights"
      />

      <Toolbar
        filters={
          <FilterSelect
            id="rf-period"
            ariaLabel="Filter by period"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "all", label: "All Periods" },
              ...periods.map((p) => ({ value: p, label: p })),
            ]}
          />
        }
      />

      {/* Financial Collection */}
      <PanelCard title="Financial Collection" description={`Billing period: ${period === "all" ? "all periods" : period}`}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Collected" value={formatCurrency(finance.collected)} tone="positive" />
          <StatCard label="Outstanding" value={formatCurrency(finance.outstanding)} tone="negative" />
          <StatCard label="Collection Rate" value={`${finance.collectionRate}%`} hint={`of ${formatCurrency(finance.billed)} billed`} />
        </div>
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">By {terminology.classLabel}</p>
          {finance.byClass.map((c) => (
            <Bar
              key={c.name}
              label={c.name}
              value={c.collected}
              max={maxClassFee}
              display={`${formatCurrency(c.collected)} · ${c.outstanding > 0 ? `${formatCurrency(c.outstanding)} due` : "settled"}`}
            />
          ))}
        </div>
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Monthly Collection</p>
          {finance.byPeriod.map((p) => (
            <Bar
              key={p.period}
              label={p.period}
              value={p.collected}
              max={maxPeriod}
              display={formatCurrency(p.collected)}
              color="bg-secondary"
            />
          ))}
        </div>
      </PanelCard>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Attendance Analytics */}
        <PanelCard title="Attendance Analytics">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Session Attendance" value={`${attendance.rate}%`} hint={`${attendance.sessions} records`} />
            <StatCard label="Faculty Attendance" value={`${facultyRate}%`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {(Object.keys(attendance.totals) as AttendanceStatus[]).map((s) => (
              <LegendChip key={s} status={s} count={attendance.totals[s]} />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">By {terminology.classLabel}</p>
            {attendance.byClass.map((c) => (
              <Bar key={c.name} label={c.name} value={c.pct} max={100} display={`${c.pct}%`} />
            ))}
          </div>
        </PanelCard>

        {/* Payroll & Expenses */}
        <PanelCard title="Payroll & Expense Breakdown">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <StatCard label="Payroll Paid" value={formatCurrency(payroll.paid)} />
            <StatCard label="Net Cashflow" value={formatCurrency(net)} tone={net >= 0 ? "positive" : "negative"} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Salary by {terminology.teacherLabel}</p>
          <div className="space-y-3">
            {payroll.byTeacher.map((t) => (
              <Bar
                key={t.name}
                label={t.name}
                value={t.amount}
                max={maxPayroll}
                display={formatCurrency(t.amount)}
                color="bg-primary"
              />
            ))}
          </div>
          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-secondary">Approved Expenses by Category</p>
          <div className="space-y-3">
            {expenses.byCategory.map((e) => (
              <Bar
                key={e.category}
                label={e.category.charAt(0).toUpperCase() + e.category.slice(1)}
                value={e.amount}
                max={maxExpense}
                display={formatCurrency(e.amount)}
                color="bg-secondary"
              />
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
