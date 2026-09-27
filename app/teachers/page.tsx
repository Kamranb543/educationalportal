import { RequireRoute } from "@/components/auth/require-permission";
import { TeachersManager } from "@/components/directories/teachers-manager";

export default function TeachersPage() {
  return (
    <RequireRoute href="/teachers">
      <TeachersManager />
    </RequireRoute>
  );
}
