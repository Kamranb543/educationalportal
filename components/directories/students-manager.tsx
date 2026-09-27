"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shell/section-header";
import { StatusBadge } from "@/components/ui/primitives";
import { StudentModal } from "@/components/modals/student-modal";
import { StudentDetailDrawer } from "@/components/drawers/student-detail-drawer";
import { HasPermission } from "@/components/auth/has-permission";
import { Toolbar, FilterSelect, EmptyRow } from "@/components/ui/toolbar";
import { BusyOverlay, useFilterBusy } from "@/components/ui/busy-overlay";
import { matchesQuery, matchesStatus, matchesClass } from "@/lib/store/selectors";
import { terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import type { StudentWithRelations } from "@/types";
import type { StudentFormValues } from "@/lib/forms/schemas";

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
      style={{ background: "var(--app-accent)" }}
    >
      + Add {terminology.studentLabel}
    </button>
  );
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

/** /students directory: reactive store data + live search/filter + CRUD modal. */
export function StudentsManager() {
  const store = useStore();
  const all = store.getStudentsWithRelations();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentWithRelations | undefined>(undefined);
  const [viewing, setViewing] = useState<StudentWithRelations | null>(null);

  const busy = useFilterBusy([search, classFilter, statusFilter, page]);

  const rows = useMemo(
    () =>
      all.filter(
        (s) =>
          matchesQuery(search, s.name, s.rollNumber, s.email, s.guardianName) &&
          matchesClass(s, classFilter) &&
          matchesStatus(s, statusFilter),
      ),
    [all, search, classFilter, statusFilter],
  );

  // Pagination: 10 per page when viewing "All Classes" (or any view).
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, rows.length);

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }
  function onClassChange(value: string) {
    setClassFilter(value);
    setPage(1);
  }
  function onStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function openAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(row: StudentWithRelations) {
    setEditing(row);
    setModalOpen(true);
  }

  function handleSubmit(values: StudentFormValues) {
    if (editing) {
      store.updateStudent(editing.id, values);
      toast.success(`${terminology.studentLabel} updated`, { description: values.name });
      return;
    }
    const created = store.addStudent(values);
    toast.success(`${terminology.studentLabel} enrolled`, { description: `${created.name} · ${created.rollNumber}` });
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title={`${terminology.studentLabel} Directory`}
        description={`${rows.length} of ${all.length} ${terminology.studentLabel.toLowerCase()}s · ${store.classes.length} ${terminology.classLabel.toLowerCase()} batches`}
        action={
          <HasPermission allow="manageStudents">
            <AddButton onClick={openAdd} />
          </HasPermission>
        }
      />
      <Toolbar
        search={search}
        onSearch={onSearchChange}
        searchPlaceholder={`Search ${terminology.studentLabel.toLowerCase()}s…`}
        filters={
          <>
            <FilterSelect
              id="sf-class"
              ariaLabel={`Filter by ${terminology.classLabel}`}
              value={classFilter}
              onChange={onClassChange}
              options={[
                { value: "all", label: `All ${terminology.classLabel}s` },
                ...store.classes.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <FilterSelect
              id="sf-status"
              ariaLabel="Filter by status"
              value={statusFilter}
              onChange={onStatusChange}
              options={STATUS_OPTIONS}
            />
          </>
        }
      />
      <BusyOverlay busy={busy} rows={6}>
      <div className="overflow-x-auto rounded-xl border border-muted bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-muted text-xs uppercase tracking-wide text-secondary">
              <th className="px-4 py-3 font-medium">Roll No.</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Guardian</th>
              <th className="px-4 py-3 font-medium">{terminology.classLabel}</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Attendance</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {paged.map((s) => (
              <tr
                key={s.id}
                onClick={() => setViewing(s)}
                className="cursor-pointer hover:bg-muted/40"
                aria-label={`View ${s.name} details`}
              >
                <td className="px-4 py-3 font-mono text-xs text-secondary">{s.rollNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-primary">{s.name}</p>
                  <p className="text-xs text-secondary">{s.email}</p>
                </td>
                <td className="hidden px-4 py-3 text-secondary md:table-cell">
                  <p>{s.guardianName}</p>
                  <p className="text-xs">{s.guardianPhone}</p>
                </td>
                <td className="px-4 py-3 text-secondary">{s.className}</td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <span className={s.attendancePercentage >= 75 ? "font-medium text-accent" : "font-medium text-primary"}>
                    {s.attendancePercentage}%
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-primary">
                  {s.outstandingBalance > 0 ? formatCurrency(s.outstandingBalance) : "Settled"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <HasPermission allow="manageStudents">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(s);
                      }}
                      className="rounded-md border border-muted px-2.5 py-1 text-xs font-medium text-secondary hover:bg-muted"
                    >
                      Edit
                    </button>
                  </HasPermission>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow colSpan={8} label={`No ${terminology.studentLabel.toLowerCase()}s match your filters.`} />}
          </tbody>
        </table>
      </div>
      </BusyOverlay>

      {rows.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-secondary">
            Showing {rangeStart}–{rangeEnd} of {rows.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-lg border border-muted bg-card px-3 py-1.5 font-medium text-secondary transition-colors hover:bg-muted disabled:opacity-50 disabled:hover:bg-card"
            >
              Previous
            </button>
            <span className="px-2 text-secondary">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-lg border border-muted bg-card px-3 py-1.5 font-medium text-secondary transition-colors hover:bg-muted disabled:opacity-50 disabled:hover:bg-card"
            >
              Next
            </button>
          </div>
        </div>
      )}
      <StudentModal open={modalOpen} onClose={() => setModalOpen(false)} student={editing} onSubmit={handleSubmit} />
      <StudentDetailDrawer student={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
