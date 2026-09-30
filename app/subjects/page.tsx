import { RequireRoute } from "@/components/auth/require-permission";
import { SubjectsManager } from "@/components/directories/subjects-manager";

export default function SubjectsPage() {
  return (
    <RequireRoute href="/subjects">
      <SubjectsManager />
    </RequireRoute>
  );
}
