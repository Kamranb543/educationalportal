import { RequireRoute } from "@/components/auth/require-permission";
import { FinanceManager } from "@/components/directories/finance-manager";

export default function FinancePage() {
  return (
    <RequireRoute href="/finance">
      <FinanceManager />
    </RequireRoute>
  );
}
