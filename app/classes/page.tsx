import { RequireRoute } from "@/components/auth/require-permission";
import { ClassesManager } from "@/components/directories/classes-manager";

export default function ClassesPage() {
  return (
    <RequireRoute href="/classes">
      <ClassesManager />
    </RequireRoute>
  );
}
