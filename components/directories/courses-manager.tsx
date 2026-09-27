"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/shell/section-header";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { matchesQuery } from "@/lib/store/selectors";
import { terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";

export function CoursesManager() {
  const store = useStore();
  const all = store.courses;
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");

  const teachers = useMemo(
    () => Array.from(new Set(all.map((c) => c.teacherId))),
    [all],
  );

  const rows = useMemo(
    () =>
      all.filter(
        (c) =>
          matchesQuery(search, c.title, c.code, c.description) &&
          (teacherFilter === "all" || c.teacherId === teacherFilter),
      ),
    [all, search, teacherFilter],
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title={`${terminology.courseLabel} Catalog`}
        description={`${rows.length} of ${all.length} ${terminology.courseLabel.toLowerCase()}s offered`}
      />
      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={`Search ${terminology.courseLabel.toLowerCase()}s…`}
        filters={
          <FilterSelect
            id="cf-teacher"
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => {
          const teacher = store.getTeacherById(c.teacherId);
          const batchCount = store.classes.filter((cls) => cls.courseIds.includes(c.id)).length;
          return (
            <div key={c.id} className="flex flex-col rounded-xl border border-muted bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-accent/10 px-2 py-0.5 font-mono text-xs font-semibold text-accent">
                  {c.code}
                </span>
                <span className="text-xs text-secondary">{c.creditHours} credit hrs</span>
              </div>
              <h2 className="mt-3 text-base font-semibold text-primary">{c.title}</h2>
              <p className="mt-1 flex-1 text-sm text-secondary">{c.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-muted pt-3">
                <div className="text-xs">
                  <p className="text-secondary">Instructor</p>
                  <p className="font-medium text-primary">{teacher?.name ?? "TBA"}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-secondary">Monthly Fee</p>
                  <p className="font-medium text-primary">{formatCurrency(c.feePerStudent)}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-secondary">
                Offered in {batchCount} {terminology.classLabel}
                {batchCount === 1 ? "" : "es"}
              </p>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="col-span-full rounded-xl border border-muted bg-card p-8 text-center text-sm text-secondary shadow-sm">
            No {terminology.courseLabel.toLowerCase()}s match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
