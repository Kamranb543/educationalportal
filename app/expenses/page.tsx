import { RequireRoute } from "@/components/auth/require-permission";
import { ExpensesManager } from "@/components/directories/expenses-manager";

export default function ExpensesPage() {
  return (
    <RequireRoute href="/expenses">
      <ExpensesManager />
    </RequireRoute>
  );
}
