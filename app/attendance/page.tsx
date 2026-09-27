import { SectionHeader } from "@/components/shell/section-header";
import { RequireRoute } from "@/components/auth/require-permission";
import { AttendanceMarker } from "@/components/attendance/attendance-marker";
import { terminology } from "@/lib/config";

export default function AttendancePage() {
  return (
    <RequireRoute href="/attendance">
      <div className="space-y-5">
        <SectionHeader
          title="Attendance Marker"
          description={`Mark ${terminology.studentLabel.toLowerCase()} attendance for each session and toggle status inline`}
        />
        <AttendanceMarker />
      </div>
    </RequireRoute>
  );
}
