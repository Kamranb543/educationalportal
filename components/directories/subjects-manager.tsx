"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shell/section-header";
import { SubjectModal } from "@/components/modals/subject-modal";
import { HasPermission } from "@/components/auth/has-permission";
import { Toolbar } from "@/components/ui/toolbar";
import { matchesQuery } from "@/lib/store/selectors";
import { useStore } from "@/lib/store/store-context";
import type { Course } from "@/types";
import type { SubjectFormValues } from "@/lib/forms/schemas";

/** Master subject CRUD hub used by the class directory to assign subjects. */
export function SubjectsManager() {
  const store = useStore();
  const all = store.courses;
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | undefined>(undefined);

  const rows = useMemo(
    () => all.filter((c) => matchesQuery(search, c.title, c.code, c.description)),
    [all, search],
  );

  function openAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(subject: Course) {
    setEditing(subject);
    setModalOpen(true);
  }

  function handleSubmit(values: SubjectFormValues) {
    if (editing) {
      store.updateCourse(editing.id, values);
      toast.success("Subject updated", { description: values.title });
      return;
    }
    const created = store.addCourse(values);
    toast.success("Subject created", { description: `${created.code} · ${created.title}` });
  }

  function handleDelete(subject: Course) {
    store.removeCourse(subject.id);
    toast.success("Subject removed", {
      description: `${subject.code} detached from all classes`,
    });
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Subject Manager"
        description={`${all.length} master subjects available for class assignment`}
        action={
          <HasPermission allow="manageSubjects">
            <button
              type="button"
              onClick={openAdd}
              className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
              style={{ background: "var(--app-accent)" }}
            >
              + Add Subject
            </button>
          </HasPermission>
        }
      />
      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search subjects..."
      />

      <div className="overflow-x-auto rounded-xl border border-muted bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-muted text-xs uppercase tracking-wide text-secondary">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Description</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Chapters</th>
              <th className="px-4 py-3 font-medium">In Classes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {rows.map((c) => {
              const inClasses = store.classes.filter((cls) => cls.courseIds.includes(c.id)).length;
              return (
                <tr key={c.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs text-secondary">{c.code}</td>
                  <td className="px-4 py-3 font-medium text-primary">{c.title}</td>
                  <td className="hidden max-w-[320px] truncate px-4 py-3 text-secondary lg:table-cell">
                    {c.description}
                  </td>
                  <td className="hidden px-4 py-3 text-secondary md:table-cell">{c.syllabus.length}</td>
                  <td className="px-4 py-3 text-secondary">{inClasses}</td>
                  <td className="px-4 py-3 text-right">
                    <HasPermission allow="manageSubjects">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="rounded-md border border-muted px-2.5 py-1 text-xs font-medium text-secondary transition-colors hover:bg-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="rounded-md border border-muted px-2.5 py-1 text-xs font-medium text-secondary transition-colors hover:bg-muted"
                        >
                          Delete
                        </button>
                      </div>
                    </HasPermission>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-secondary">
                  No subjects match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SubjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        subject={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}