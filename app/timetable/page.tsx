import { RequireRoute } from "@/components/auth/require-permission";
import { SectionHeader } from "@/components/shell/section-header";
import { TimetableView } from "@/components/timetable/timetable-view";

export default function TimetablePage() {
  return (
    <RequireRoute href="/timetable">
      <div className="space-y-5">
        <SectionHeader
          title="Timetable"
          description="Weekly lecture schedule with role-based views and double-booking detection"
        />
        <TimetableView />
      </div>
    </RequireRoute>
  );
}
