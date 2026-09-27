"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shell/section-header";
import { StatusBadge } from "@/components/ui/primitives";
import { TeacherModal } from "@/components/modals/teacher-modal";
import { TeacherDetailDrawer } from "@/components/drawers/teacher-detail-drawer";
import { HasPermission } from "@/components/auth/has-permission";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { BusyOverlay, useFilterBusy } from "@/components/ui/busy-overlay";
import { matchesQuery, matchesStatus } from "@/lib/store/selectors";
import { config, terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import type { Teacher } from "@/types";
import type { TeacherFormValues } from "@/lib/forms/schemas";

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
      style={{ background: "var(--app-accent)" }}
    >
      + Add {terminology.teacherLabel}
    </button>
  );
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

/** /teachers directory: reactive store data + search/filter + CRUD & assignment modal. */
export function TeachersManager() {
  const store = useStore();
  const all = store.teachers;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | undefined>(undefined);
  const [viewing, setViewing] = useState<Teacher | null>(null);

  const busy = useFilterBusy([search, statusFilter, deptFilter]);

  const departments = useMemo(
    () => Array.from(new Set(all.map((t) => t.department))).sort(),
    [all],
  );

  const rows = useMemo(
    () =>
      all.filter(
        (t) =>
          matchesQuery(search, t.name, t.employeeId, t.email, t.department) &&
          matchesStatus(t, statusFilter) &&
          (deptFilter === "all" || t.department === deptFilter),
      ),
    [all, search, statusFilter, deptFilter],
  );

  function openAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(teacher: Teacher) {
    setEditing(teacher);
    setModalOpen(true);
  }

  function handleSubmit(values: TeacherFormValues) {
    const { courseIds: _courseIds, ...fields } = values;
    void _courseIds;
    if (editing) {
      store.updateTeacher(editing.id, fields);
      toast.success(`${terminology.teacherLabel} updated`, { description: fields.name });
      return;
    }
    const created = store.addTeacher(fields);
    toast.success(`${terminology.teacherLabel} added`, { description: `${created.name} · ${created.employeeId}` });
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title={`${terminology.teacherLabel} & Faculty`}
        description={`${rows.length} of ${all.length} ${terminology.teacherLabel.toLowerCase()}s shown (${all.filter((t) => t.status === "active").length} active)`}
        action={
          <HasPermission allow="manageTeachers">
            <AddButton onClick={openAdd} />
          </HasPermission>
        }
      />
      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={`Search ${terminology.teacherLabel.toLowerCase()}s…`}
        filters={
          <>
            <FilterSelect
              id="tf-dept"
              ariaLabel="Filter by department"
              value={deptFilter}
              onChange={setDeptFilter}
              options={[
                { value: "all", label: "All Departments" },
                ...departments.map((d) => ({ value: d, label: d })),
              ]}
            />
            <FilterSelect
              id="tf-status"
              ariaLabel="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
            />
          </>
        }
      />
      <BusyOverlay busy={busy} rows={4}>
        {rows.length === 0 ? (
          <div className="rounded-xl border border-muted bg-card p-8 text-center text-sm text-secondary shadow-sm">
            No {terminology.teacherLabel.toLowerCase()}s match your filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((t) => {
              const assignedClasses = store.classes.filter((c) => c.teacherId === t.id);
              const assignedCourses = store.courses.filter((c) => c.teacherId === t.id);
              const latestPayslip = store.getPayrollForTeacher(t.id).at(-1);
              return (
                <div
                  key={t.id}
                  onClick={() => setViewing(t)}
                  className="flex cursor-pointer flex-col rounded-xl border border-muted bg-card p-5 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-card">
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-primary">{t.name}</p>
                        <p className="text-xs text-secondary">{t.department}</p>
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-3 text-xs text-secondary">{t.qualification}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-muted pt-4 text-sm">
                    <div>
                      <dt className="text-xs text-secondary">Classes</dt>
                      <dd className="font-medium text-primary">{assignedClasses.length}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-secondary">{terminology.courseLabel}s</dt>
                      <dd className="font-medium text-primary">{assignedCourses.length}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-secondary">Base Salary</dt>
                      <dd className="font-medium text-primary">
                        {formatCurrency(t.baseSalary)} / {config.localization.currencyCode}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-secondary">Last Net Pay</dt>
                      <dd className="font-medium text-primary">
                        {latestPayslip ? formatCurrency(latestPayslip.netPay) : "—"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex justify-end border-t border-muted pt-3">
                    <HasPermission allow="manageTeachers">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(t);
                        }}
                        className="rounded-md border border-muted px-2.5 py-1 text-xs font-medium text-secondary transition-colors hover:bg-muted"
                      >
                        Edit {terminology.teacherLabel}
                      </button>
                    </HasPermission>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </BusyOverlay>
      <TeacherDetailDrawer teacher={viewing} onClose={() => setViewing(null)} />
      <TeacherModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        teacher={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
