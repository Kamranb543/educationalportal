"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { SelectField, TextField } from "@/components/ui/form-fields";
import { SlotFormModal, type EditingSlot } from "@/components/modals/slot-form-modal";
import { TimetableMatrix } from "@/components/timetable/timetable-matrix";
import { terminology } from "@/lib/config";
import { useAuth } from "@/lib/auth/auth-context";
import { useStore } from "@/lib/store/store-context";
import { collectSessions, type ScheduledSession } from "@/lib/timetable";
import type { SchoolPeriod } from "@/types";

/**
 * Role-based period timetable: Admins get the master matrix (all batches) plus
 * "Manage Periods" and slot assignment; teachers see their own lectures;
 * students see their batch schedule.
 */
export function TimetableView() {
  const store = useStore();
  const { currentRole, currentUser } = useAuth();
  const canAdmin = currentRole === "super_admin" || currentRole === "admin";
  const isTeacher = currentRole === "teacher";
  const isStudent = currentRole === "student";

  const [scopeClassId, setScopeClassId] = useState("all");
  const [assignOpen, setAssignOpen] = useState(false);
  const [periodsOpen, setPeriodsOpen] = useState(false);
  const [editing, setEditing] = useState<EditingSlot | undefined>(undefined);
  const [defaultPeriodId, setDefaultPeriodId] = useState<string | undefined>(undefined);

  const classes = store.classes;
  const courses = store.courses;
  const all = useMemo(
    () => collectSessions(classes, (id) => courses.find((c) => c.id === id)),
    [classes, courses],
  );

  const myClassId = store.getStudentById(currentUser?.studentId ?? "")?.classId ?? "";

  const visible = useMemo(() => {
    if (isTeacher) return all.filter((s) => s.teacherId === currentUser?.teacherId);
    if (isStudent) return all.filter((s) => s.classId === myClassId);
    if (scopeClassId !== "all") return all.filter((s) => s.classId === scopeClassId);
    return all;
  }, [all, isTeacher, isStudent, currentUser?.teacherId, myClassId, scopeClassId]);

  function editSession(s: ScheduledSession) {
    // Group multi-day rows for the same class+subject+period together.
    const cls = store.getClassById(s.classId);
    const siblings =
      cls?.sessions.filter(
        (x) =>
          x.courseId === s.session.courseId &&
          (x.periodId && s.session.periodId
            ? x.periodId === s.session.periodId
            : x.start === s.session.start && x.end === s.session.end),
      ) ?? [];
    const group = siblings.length > 0 ? siblings : [s.session];
    setEditing({
      classId: s.classId,
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

  function openAssign(periodId?: string) {
    setEditing(undefined);
    setDefaultPeriodId(periodId);
    setAssignOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-muted bg-card p-3 shadow-sm">
        <span className="text-sm font-medium text-primary">
          {isTeacher
            ? `Your weekly lectures (${visible.length})`
            : isStudent
              ? `${terminology.classLabel} schedule (${visible.length} lectures)`
              : `Master timetable${scopeClassId === "all" ? " — all batches" : ` — ${store.getClassById(scopeClassId)?.name ?? ""}`} (${visible.length} lectures)`}
        </span>
        {canAdmin && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <SelectField
              id="tt-scope"
              label=""
              wrapperClassName="w-48"
              value={scopeClassId}
              onChange={(e) => setScopeClassId(e.target.value)}
            >
              <option value="all">All batches</option>
              {store.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section})
                </option>
              ))}
            </SelectField>
            <button
              type="button"
              onClick={() => setPeriodsOpen(true)}
              className="rounded-lg border border-muted px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-muted"
            >
              Manage Periods
            </button>
            <button
              type="button"
              onClick={() => openAssign()}
              className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
              style={{ background: "var(--app-accent)" }}
            >
              + Assign Slot
            </button>
          </div>
        )}
      </div>

      <TimetableMatrix
        periods={store.periods}
        sessions={visible}
        allSessions={all}
        canManage={canAdmin}
        onEditSession={editSession}
        onDeleteSession={deleteSession}
      />

      <SlotFormModal
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          setEditing(undefined);
          setDefaultPeriodId(undefined);
        }}
        editing={editing}
        defaultPeriodId={defaultPeriodId}
      />
      <PeriodEditorModal open={periodsOpen} onClose={() => setPeriodsOpen(false)} />
    </div>
  );
}

/**
 * Master period definition editor: add, rename, retime, or remove the daily
 * lecture/break periods that form the timetable's rows.
 */
function PeriodEditorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const [draft, setDraft] = useState<SchoolPeriod[]>(store.periods);

  function update(id: string, patch: Partial<SchoolPeriod>) {
    setDraft((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function addPeriod() {
    const id = `pr-${Math.random().toString(36).slice(2, 7)}`;
    const lectureCount = draft.filter((p) => p.kind === "lecture").length;
    setDraft((prev) => [
      ...prev,
      { id, label: `Period ${lectureCount + 1}`, start: "09:00", end: "10:00", kind: "lecture" },
    ]);
  }

  function save() {
    store.setPeriods(draft);
    toast.success("Timetable periods updated", {
      description: `${draft.length} periods defined`,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Periods"
      description="Define the standard daily lecture periods and breaks"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-card hover:opacity-90"
          >
            Save Periods
          </button>
        </div>
      }
    >
      <div className="space-y-2">
        {draft
          .slice()
          .sort((a, b) => a.start.localeCompare(b.start))
          .map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-lg border border-muted p-2">
              <TextField
                id={`pe-label-${p.id}`}
                label=""
                wrapperClassName="min-w-0 flex-1"
                value={p.label}
                onChange={(e) => update(p.id, { label: e.target.value })}
              />
              <TextField
                id={`pe-start-${p.id}`}
                label=""
                type="time"
                wrapperClassName="w-32 shrink-0"
                value={p.start}
                onChange={(e) => update(p.id, { start: e.target.value })}
              />
              <TextField
                id={`pe-end-${p.id}`}
                label=""
                type="time"
                wrapperClassName="w-32 shrink-0"
                value={p.end}
                onChange={(e) => update(p.id, { end: e.target.value })}
              />
              <select
                aria-label="Kind"
                value={p.kind}
                onChange={(e) => update(p.id, { kind: e.target.value as SchoolPeriod["kind"] })}
                className="shrink-0 rounded-lg border border-muted bg-card px-2 py-2 text-xs text-primary focus:border-accent"
              >
                <option value="lecture">Lecture</option>
                <option value="break">Break</option>
              </select>
              <button
                type="button"
                aria-label={`Remove ${p.label}`}
                onClick={() => setDraft((prev) => prev.filter((x) => x.id !== p.id))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-muted text-secondary hover:bg-muted"
              >
                ×
              </button>
            </div>
          ))}
        <button
          type="button"
          onClick={addPeriod}
          className="w-full rounded-lg border border-dashed border-muted px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-muted"
        >
          + Add Period
        </button>
      </div>
    </Modal>
  );
}
