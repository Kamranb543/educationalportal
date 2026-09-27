"use client";

import { Drawer } from "@/components/ui/drawer";
import { StatusBadge } from "@/components/ui/primitives";
import { formatCurrency } from "@/data";
import { terminology } from "@/lib/config";
import { useStore } from "@/lib/store/store-context";
import type { ClassBatch } from "@/types";

/**
 * Read-only slide-over drawer showing a class batch's enrolled student roster
 * plus its courses and lead instructor.
 */
export function ClassDetailDrawer({
  cls,
  onClose,
}: {
  cls: ClassBatch | null;
  onClose: () => void;
}) {
  const store = useStore();
  if (!cls) return null;

  const roster = store.getStudentsForClass(cls.id);
  const courses = cls.courseIds
    .map((id) => store.getCourseById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const lead = store.getTeacherById(cls.teacherId);
  const monthlyTuition = courses.reduce((s, c) => s + c.feePerStudent, 0);

  return (
    <Drawer
      open={cls !== null}
      onClose={onClose}
      title={`${cls.name} Roster`}
      description={`${roster.length} of ${cls.capacity} ${terminology.studentLabel.toLowerCase()}s enrolled`}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
        >
          Close
        </button>
      }
    >
      <div className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-muted p-3">
            <p className="text-xs text-secondary">Schedule</p>
            <p className="text-sm font-medium text-primary">{cls.schedule}</p>
          </div>
          <div className="rounded-lg border border-muted p-3">
            <p className="text-xs text-secondary">Room</p>
            <p className="text-sm font-medium text-primary">{cls.room}</p>
          </div>
          <div className="rounded-lg border border-muted p-3">
            <p className="text-xs text-secondary">Lead {terminology.teacherLabel}</p>
            <p className="text-sm font-medium text-primary">{lead?.name ?? "TBA"}</p>
          </div>
          <div className="rounded-lg border border-muted p-3">
            <p className="text-xs text-secondary">Monthly Tuition</p>
            <p className="text-sm font-medium text-primary">{formatCurrency(monthlyTuition)}</p>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-primary">
            {terminology.courseLabel}s
          </h3>
          <div className="flex flex-wrap gap-2">
            {courses.map((c) => (
              <span
                key={c.id}
                className="rounded-md border border-muted bg-muted/40 px-2 py-1 text-xs text-primary"
              >
                <span className="font-mono text-secondary">{c.code}</span> · {c.title}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-primary">Enrolled Roster</h3>
          {roster.length === 0 ? (
            <p className="rounded-lg border border-dashed border-muted px-4 py-6 text-center text-sm text-secondary">
              No {terminology.studentLabel.toLowerCase()}s enrolled.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-muted">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-muted bg-muted/50 text-xs uppercase tracking-wide text-secondary">
                    <th className="px-3 py-2 font-medium">Roll No.</th>
                    <th className="px-3 py-2 font-medium">{terminology.studentLabel}</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {roster.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-2 font-mono text-xs text-secondary">{s.rollNumber}</td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-primary">{s.name}</p>
                        <p className="text-xs text-secondary">{s.email}</p>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Drawer>
  );
}
