import { RequireRoute } from "@/components/auth/require-permission";
import { StudentsManager } from "@/components/directories/students-manager";

export default function StudentsPage() {
  return (
    <RequireRoute href="/students">
      <StudentsManager />
    </RequireRoute>
  );
}
