import { RequireRoute } from "@/components/auth/require-permission";
import { ClassDirectoryManager } from "@/components/directories/class-directory-manager";

export default function ClassDirectoryPage() {
  return (
    <RequireRoute href="/class-directory">
      <ClassDirectoryManager />
    </RequireRoute>
  );
}
