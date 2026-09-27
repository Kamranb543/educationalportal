import { RequireRoute } from "@/components/auth/require-permission";
import { ReportsManager } from "@/components/reports/reports-manager";

export default function ReportsPage() {
  return (
    <RequireRoute href="/reports">
      <ReportsManager />
    </RequireRoute>
  );
}
