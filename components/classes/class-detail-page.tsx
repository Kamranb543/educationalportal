"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { StatusBadge, StatCard } from "@/components/ui/primitives";
import { ClassFormModal, type ClassSubmit } from "@/components/modals/class-form-modal";
import { SlotFormModal, type EditingSlot } from "@/components/modals/slot-form-modal";
import { SyllabusModal } from "@/components/modals/syllabus-modal";
import { TimetableMatrix } from "@/components/timetable/timetable-matrix";
import { HasPermission } from "@/components/auth/has-permission";
import { hasPermission } from "@/lib/auth/permissions";
import { useAuth } from "@/lib/auth/auth-context";
import { config, terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useStore } from "@/lib/store/store-context";
import { collectSessions, type ScheduledSession } from "@/lib/timetable";
import type { Course } from "@/types";

type Tab = "overview" | "subjects" | "roster" | "timetable";

/**
 * Dedicated class page: header stats, tabbed sections (Overview, Subjects &
 * Syllabus, Trainee Roster, Timetable), and a full Edit Class modal for
 * adding/removing master subjects.
 */
export function ClassDetailPage({ classId }: { classId: string }) {
  const store = useStore();
  const { currentRole } = useAuth();
  const canManage = hasPermission(currentRole, "manageClasses");
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<EditingSlot | undefined>(undefined);
  const [syllabusCourse, setSyllabusCourse] = useState<Course | null>(null);

  const cls = store.getClassById(classId);
  const classes = store.classes;
  const courses = store.courses;
  const allSessions = useMemo(
    () => collectSessions(classes, (id) => courses.find((c) => c.id === id)),
    [classes, courses],
  );
  const ownSessions = useMemo(
    () => allSessions.filter((s) => s.classId === classId),
    [allSessions, classId],
  );

  if (!cls) notFound();

  const roster = store.getStudentsForClass(cls.id);
  const subjects = cls.courseIds
    .map((id) => store.getCourseById(id))
    .filter((c): c is Course => Boolean(c));
  const lead = store.getTeacherById(cls.teacherId);
  const fillPct = Math.round((roster.length / cls.capacity) * 100);

  function handleEditSubmit(submit: ClassSubmit) {
    if (submit.mode !== "edit") return;
    const { courseIds, ...patch } = submit.values;
    store.updateClass(cls!.id, patch);
    store.updateClassSubjects(cls!.id, courseIds);
    toast.success(`${terminology.classLabel} updated`, { description: patch.name });
  }

  function editSession(s: ScheduledSession) {
    const siblings =
      cls!.sessions.filter(
        (x) =>
          x.courseId === s.session.courseId &&
          (x.periodId && s.session.periodId
            ? x.periodId === s.session.periodId
            : x.start === s.session.start && x.end === s.session.end),
      ) ?? [];
    const group = siblings.length > 0 ? siblings : [s.session];
    setEditingSlot({
      classId: cls!.id,
      sessionIds: group.map((x) => x.id),
      courseId: s.session.courseId,
      periodId: s.session.periodId,
      days: group.map((x) => x.day),
    });
    setAssignOpen(true);
  }

  function deleteSession(s: ScheduledSession) {
    store.removeClassSession(s.classId, s.session.id);
    toast.success("Slot removed", { description: `${s.className} · ${s.course?.title ?? ""}` });
  }

  function openAssign() {
    setEditingSlot(undefined);
    setAssignOpen(true);
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb + title */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/class-directory"
            className="text-xs font-medium text-accent hover:underline"
          >
            ← {terminology.classLabel} Directory
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary">
            {cls.name} <span className="text-base font-normal text-secondary">({cls.section})</span>
          </h1>
          <p className="mt-0.5 text-sm text-secondary">
            {cls.academicYear} · {cls.room} · {cls.schedule || "schedule pending"}
          </p>
        </div>
        <HasPermission allow="manageClasses">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
            style={{ background: "var(--app-accent)" }}
          >
            Edit {terminology.classLabel}
          </button>
        </HasPermission>
      </div>

      {/* Header stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly Fee" value={`${formatCurrency(cls.monthlyFee)}`} hint={`per ${terminology.studentLabel.toLowerCase()} / ${config.localization.currencyCode}`} />
        <StatCard label="Subjects" value={subjects.length} hint="master subjects assigned" />
        <StatCard label="Enrolled" value={`${roster.length}/${cls.capacity}`} hint={`${fillPct}% capacity`} tone={fillPct >= 90 ? "negative" : "default"} />
        <StatCard label="Lead Teacher" value={lead?.name ?? "TBA"} hint={`${ownSessions.length} weekly sessions`} />
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-muted bg-card p-1 shadow-sm" role="tablist" aria-label="Class sections">
        {(["overview", "subjects", "roster", "timetable"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-accent text-card" : "text-secondary hover:bg-muted"
            }`}
          >
            {t === "subjects" ? `Subjects & Syllabus` : t === "roster" ? `${terminology.studentLabel} Roster` : t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-muted bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-primary">Batch Details</h2>
            <dl className="divide-y divide-muted text-sm">
              <DetailRow label="Name" value={cls.name} />
              <DetailRow label="Section" value={cls.section} />
              <DetailRow label="Academic Year" value={cls.academicYear} />
              <DetailRow label="Room" value={cls.room} />
              <DetailRow label="Schedule" value={cls.schedule || "—"} />
              <DetailRow label="Monthly Fee" value={`${formatCurrency(cls.monthlyFee)} / ${config.localization.currencyCode}`} />
              <DetailRow label="Capacity" value={`${roster.length} / ${cls.capacity}`} />
              <DetailRow label="Lead Teacher" value={lead?.name ?? "TBA"} />
            </dl>
          </div>
          <div className="rounded-xl border border-muted bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-primary">Assigned Subjects</h2>
            {subjects.length === 0 ? (
              <p className="text-sm text-secondary">
                No subjects yet — use “Edit {terminology.classLabel}” to add master subjects.
              </p>
            ) : (
              <ul className="divide-y divide-muted">
                {subjects.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-medium text-primary">{c.title}</p>
                      <p className="font-mono text-xs text-secondary">{c.code}</p>
                    </div>
                    <span className="text-xs text-secondary">
                      {store.getTeacherById(cls.subjectTeachers[c.id] ?? cls.teacherId)?.name ?? "TBA"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "subjects" && (
        <div className="space-y-3">
          {subjects.map((c) => {
            const teacher = store.getTeacherById(cls.subjectTeachers[c.id] ?? cls.teacherId);
            return (
              <div key={c.id} className="rounded-xl border border-muted bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-primary">{c.title}</h3>
                    <p className="font-mono text-xs text-secondary">{c.code}</p>
                    <p className="mt-1 text-xs text-secondary">
                      {teacher?.name ?? "Unassigned"} · {c.syllabus.length} chapters
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSyllabusCourse(c)}
                    className="rounded-lg border border-muted px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-muted"
                  >
                    View/Edit Syllabus
                  </button>
                </div>
              </div>
            );
          })}
          {subjects.length === 0 && (
            <p className="rounded-xl border border-dashed border-muted bg-card p-8 text-center text-sm text-secondary">
              Add subjects via “Edit {terminology.classLabel}”.
            </p>
          )}
        </div>
      )}

      {tab === "roster" && (
        <div className="overflow-x-auto rounded-xl border border-muted bg-card shadow-sm">
          {!hasPermission(currentRole, "viewStudents") && (
            <p className="border-b border-muted bg-muted/30 px-4 py-2 text-xs text-secondary">
              Contact details hidden for your role — enrollment status only.
            </p>
          )}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-muted bg-muted/40 text-xs uppercase tracking-wide text-secondary">
                <th className="px-4 py-3 font-medium">Roll No.</th>
                <th className="px-4 py-3 font-medium">{terminology.studentLabel}</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {roster.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs text-secondary">{s.rollNumber}</td>
                  <td className="px-4 py-3 font-medium text-primary">{s.name}</td>
                  <td className="px-4 py-3 text-secondary">
                    {hasPermission(currentRole, "viewStudents") ? (
                      <>
                        {s.email}
                        <p className="text-xs">{s.phone}</p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
              {roster.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-secondary">
                    No {terminology.studentLabel.toLowerCase()}s enrolled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "timetable" && (
        <div className="space-y-4">
          <HasPermission allow="manageClasses">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openAssign}
                className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
                style={{ background: "var(--app-accent)" }}
              >
                + Assign Slot
              </button>
            </div>
          </HasPermission>
          <TimetableMatrix
            periods={store.periods}
            sessions={ownSessions}
            allSessions={allSessions}
            canManage={canManage}
            onEditSession={editSession}
            onDeleteSession={deleteSession}
          />
        </div>
      )}

      <ClassFormModal
        open={editOpen}
        batch={cls}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
      <SlotFormModal
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          setEditingSlot(undefined);
        }}
        editing={editingSlot}
        defaultClassId={cls.id}
        classLocked
      />
      <SyllabusModal
        open={syllabusCourse !== null}
        onClose={() => setSyllabusCourse(null)}
        course={syllabusCourse ?? undefined}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-secondary">{label}</dt>
      <dd className="font-medium text-primary">{value}</dd>
    </div>
  );
}
