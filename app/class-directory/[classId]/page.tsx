import { RequireRoute } from "@/components/auth/require-permission";
import { ClassDetailPage } from "@/components/classes/class-detail-page";

export default async function ClassDetailRoute({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return (
    <RequireRoute href="/class-directory">
      <ClassDetailPage classId={classId} />
    </RequireRoute>
  );
}
