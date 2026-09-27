"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/shell/section-header";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { ClassDetailDrawer } from "@/components/drawers/class-detail-drawer";
import { BusyOverlay, useFilterBusy } from "@/components/ui/busy-overlay";
import { matchesQuery } from "@/lib/store/selectors";
import { terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import type { ClassBatch } from "@/types";

export function ClassesManager() {
  const store = useStore();
  const all = store.classes;
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [viewing, setViewing] = useState<ClassBatch | null>(null);

  const busy = useFilterBusy([search, teacherFilter]);

  const teachers = useMemo(
    () => Array.from(new Set(all.map((c) => c.teacherId))),
    [all],
  );

  const rows = useMemo(
    () =>
      all.filter(
        (c) =>
          matchesQuery(search, c.name, c.room, c.academicYear, c.schedule) &&
          (teacherFilter === "all" || c.teacherId === teacherFilter),
      ),
    [all, search, teacherFilter],
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title={`${terminology.classLabel} Directory`}
        description={`${rows.length} of ${all.length} scheduled ${terminology.classLabel.toLowerCase()} batches`}
      />
      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={`Search ${terminology.classLabel.toLowerCase()} batches…`}
        filters={
          <FilterSelect
            id="clf-teacher"
            ariaLabel={`Filter by ${terminology.teacherLabel}`}
            value={teacherFilter}
            onChange={setTeacherFilter}
            options={[
              { value: "all", label: `All ${terminology.teacherLabel}s` },
              ...teachers.map((id) => ({
                value: id,
                label: store.getTeacherById(id)?.name ?? id,
              })),
            ]}
          />
        }
      />
      <BusyOverlay busy={busy} rows={3}>
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((cls) => {
          const roster = store.getStudentsForClass(cls.id);
          const enrolledCourses = cls.courseIds
            .map((id) => store.getCourseById(id))
            .filter((c): c is NonNullable<typeof c> => Boolean(c));
          const lead = store.getTeacherById(cls.teacherId);
          const fillPct = Math.round((roster.length / cls.capacity) * 100);
          const monthlyTuition = enrolledCourses.reduce((s, c) => s + c.feePerStudent, 0);
          return (
            <div
              key={cls.id}
              onClick={() => setViewing(cls)}
              className="cursor-pointer rounded-xl border border-muted bg-card p-5 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-primary">{cls.name}</h2>
                  <p className="text-xs text-secondary">
                    {cls.academicYear} &middot; {cls.room}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-secondary">
                  {roster.length}/{cls.capacity} {terminology.studentLabel}s
                </span>
              </div>

              <p className="mt-3 text-sm text-secondary">{cls.schedule}</p>

              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-secondary">
                  <span>Capacity utilization</span>
                  <span>{fillPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, fillPct)}%` }} />
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-muted pt-4 text-sm">
                <div>
                  <dt className="text-xs text-secondary">Lead {terminology.teacherLabel}</dt>
                  <dd className="font-medium text-primary">{lead?.name ?? "TBA"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-secondary">Monthly Tuition</dt>
                  <dd className="font-medium text-primary">{formatCurrency(monthlyTuition)}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap gap-2">
                {enrolledCourses.map((c) => (
                  <span key={c.id} className="rounded-md border border-muted px-2 py-0.5 font-mono text-xs text-secondary">
                    {c.code}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="col-span-full rounded-xl border border-muted bg-card p-8 text-center text-sm text-secondary shadow-sm">
            No {terminology.classLabel.toLowerCase()} batches match your filters.
          </div>
        )}
      </div>
      </BusyOverlay>
      <ClassDetailDrawer cls={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
