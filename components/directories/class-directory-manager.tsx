"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shell/section-header";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { BusyOverlay, useFilterBusy } from "@/components/ui/busy-overlay";
import { ClassFormModal, type ClassSubmit } from "@/components/modals/class-form-modal";
import { HasPermission } from "@/components/auth/has-permission";
import { matchesQuery } from "@/lib/store/selectors";
import { config, terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";

/** Primary hub for class management: cards route to dedicated detail pages. */
export function ClassDirectoryManager() {
  const store = useStore();
  const all = store.classes;
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  const busy = useFilterBusy([search, teacherFilter]);

  const teachers = useMemo(
    () => Array.from(new Set(all.map((c) => c.teacherId))),
    [all],
  );

  const rows = useMemo(
    () =>
      all.filter(
        (c) =>
          matchesQuery(search, c.name, c.section, c.room, c.academicYear) &&
          (teacherFilter === "all" || c.teacherId === teacherFilter),
      ),
    [all, search, teacherFilter],
  );

  function handleSubmit(submit: ClassSubmit) {
    if (submit.mode === "create") {
      const created = store.addClass(submit.values);
      toast.success(`${terminology.classLabel} created`, {
        description: `${created.name} (${created.section}) — open it to assign subjects`,
      });
      return;
    }
    // Editing happens on the dedicated class page.
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Class Directory"
        description={`${all.length} ${terminology.classLabel.toLowerCase()} batches · select a card to manage its details`}
        action={
          <HasPermission allow="manageClasses">
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
              style={{ background: "var(--app-accent)" }}
            >
              + Add {terminology.classLabel}
            </button>
          </HasPermission>
        }
      />
      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={`Search ${terminology.classLabel.toLowerCase()} batches...`}
        filters={
          <FilterSelect
            id="cd-teacher"
            ariaLabel={`Filter by lead ${terminology.teacherLabel}`}
            value={teacherFilter}
            onChange={setTeacherFilter}
            options={[
              { value: "all", label: `All ${terminology.teacherLabel}s` },
              ...teachers.map((id) => ({ value: id, label: store.getTeacherById(id)?.name ?? id })),
            ]}
          />
        }
      />

      <BusyOverlay busy={busy} rows={3}>
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((cls) => {
            const roster = store.getStudentsForClass(cls.id);
            const lead = store.getTeacherById(cls.teacherId);
            const fillPct = Math.round((roster.length / cls.capacity) * 100);
            return (
              <Link
                key={cls.id}
                href={`/class-directory/${cls.id}`}
                className="block rounded-xl border border-muted bg-card p-5 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-primary">
                      {cls.name}{" "}
                      <span className="text-sm font-normal text-secondary">({cls.section})</span>
                    </h2>
                    <p className="text-xs text-secondary">
                      {cls.academicYear} · {cls.room}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-secondary">
                    {roster.length}/{cls.capacity} {terminology.studentLabel}s
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted/40 px-2 py-1.5 text-center">
                    <p className="text-[11px] text-secondary">Monthly Fee</p>
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(cls.monthlyFee)}
                    </p>
                    <p className="text-[10px] text-secondary">/{config.localization.currencyCode}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-2 py-1.5 text-center">
                    <p className="text-[11px] text-secondary">Subjects</p>
                    <p className="text-sm font-semibold text-primary">{cls.courseIds.length}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-2 py-1.5 text-center">
                    <p className="text-[11px] text-secondary">Sessions</p>
                    <p className="text-sm font-semibold text-primary">{cls.sessions.length}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-secondary">
                    <span>Capacity utilization</span>
                    <span>{fillPct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                  </div>
                </div>

                {cls.schedule && <p className="mt-3 text-sm text-secondary">{cls.schedule}</p>}
                <p className="mt-1 text-xs text-secondary">
                  Lead {terminology.teacherLabel}:{" "}
                  <span className="font-medium text-primary">{lead?.name ?? "TBA"}</span>
                </p>
              </Link>
            );
          })}
          {rows.length === 0 && (
            <div className="col-span-full rounded-xl border border-muted bg-card p-8 text-center text-sm text-secondary shadow-sm">
              No {terminology.classLabel.toLowerCase()} batches match your filters.
            </div>
          )}
        </div>
      </BusyOverlay>

      <ClassFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}
