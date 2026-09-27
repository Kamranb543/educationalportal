"use client";

import { terminology } from "@/lib/config";
import { roleLabel, useAuth } from "@/lib/auth/auth-context";
import { HasPermission } from "@/components/auth/has-permission";

function ActionButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
      style={{ background: "var(--app-accent)" }}
    >
      {children}
    </button>
  );
}

/**
 * Demonstrates the <HasPermission> UI guard: action buttons render only for
 * roles holding the matching permission. (Real handlers arrive in Phases 6–8.)
 */
export function QuickActions() {
  const { currentUser, currentRole } = useAuth();
  if (!currentUser) return null;
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-primary">Quick Actions</h2>
        <p className="text-sm text-secondary">
          Signed in as {currentUser.name} &middot; {roleLabel(currentRole)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <HasPermission allow="manageExpenses">
          <ActionButton>Add Expense</ActionButton>
        </HasPermission>
        <HasPermission allow="manageStudents">
          <ActionButton>Edit {terminology.studentLabel}</ActionButton>
        </HasPermission>
        <HasPermission allow="generateVouchers">
          <ActionButton>Generate Voucher</ActionButton>
        </HasPermission>
        <HasPermission allow="payOwnFees">
          <ActionButton>Pay Fee</ActionButton>
        </HasPermission>
        <HasPermission allow="markAttendance">
          <ActionButton>Mark Attendance</ActionButton>
        </HasPermission>
      </div>
    </section>
  );
}
