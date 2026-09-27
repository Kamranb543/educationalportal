import { RequireRoute } from "@/components/auth/require-permission";
import { CoursesManager } from "@/components/directories/courses-manager";

export default function CoursesPage() {
  return (
    <RequireRoute href="/courses">
      <CoursesManager />
    </RequireRoute>
  );
}
