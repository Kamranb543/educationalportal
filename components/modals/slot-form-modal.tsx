"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ModalActions, SelectField, TextField } from "@/components/ui/form-fields";
import { fieldErrors, slotSchema } from "@/lib/forms/schemas";
import { terminology } from "@/lib/config";
import { useStore } from "@/lib/store/store-context";
import type { SchoolPeriod, WeekDay } from "@/types";

const DAYS: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface EditingSlot {
  classId: string;
  /** All session ids for the same class+subject+period row (multi-day). */
  sessionIds: string[];
  courseId: string;
  periodId?: string;
  days: WeekDay[];
}

/**
 * Assign a class + subject to a period across multiple days in one action.
 * Teacher and room auto-fill from the batch's subject assignment; manual
 * overrides live behind an "Advanced Settings" toggle. Days where the chosen
 * teacher is already booked are blocked (skipped with a warning).
 */
export function SlotFormModal({
  open,
  onClose,
  editing,
  defaultPeriodId,
  defaultClassId,
  classLocked = false,
}: {
  open: boolean;
  onClose: () => void;
  editing?: EditingSlot;
  defaultPeriodId?: string;
  /** Pre-select the batch (used from the dedicated class page). */
  defaultClassId?: string;
  /** Disable the batch picker — assignment is confined to defaultClassId. */
  classLocked?: boolean;
}) {
  const store = useStore();
  const lecturePeriods = useMemo(
    () => store.periods.filter((p) => p.kind === "lecture"),
    [store.periods],
  );
  const firstClass = store.classes[0];

  const initialPeriod =
    editing?.periodId ?? defaultPeriodId ?? lecturePeriods[0]?.id ?? "";
  const initialClass = editing?.classId ?? defaultClassId ?? firstClass?.id ?? "";
  const initialCourse =
    editing?.courseId ??
    (store.getClassById(initialClass)?.courseIds[0] ?? "");

  const [classId, setClassId] = useState(initialClass);
  const [periodId, setPeriodId] = useState(initialPeriod);
  const [courseId, setCourseId] = useState(initialCourse);
  const [days, setDays] = useState<WeekDay[]>(editing?.days ?? ["Mon"]);
  const [advanced, setAdvanced] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [room, setRoom] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cls = store.getClassById(classId);
  const period = store.periods.find((p) => p.id === periodId);
  const effectiveTeacher = advanced
    ? teacherId
    : cls?.subjectTeachers[courseId] ?? cls?.teacherId ?? "";
  const effectiveRoom = advanced ? room : cls?.room ?? "";

  function changeClass(next: string) {
    const target = store.getClassById(next);
    setClassId(next);
    setCourseId(target?.courseIds[0] ?? "");
    setAdvanced(false);
    setTeacherId("");
    setRoom("");
  }

  function toggleDay(day: WeekDay) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  // Per-day teacher clashes against all other sessions in the same period.
  const blockedDays = useMemo(() => {
    if (!period || !courseId || !cls) return new Set<WeekDay>();
    const replacing = new Set(editing?.sessionIds ?? []);
    const blocked = new Set<WeekDay>();
    for (const other of store.classes) {
      for (const s of other.sessions) {
        if (replacing.has(s.id)) continue;
        if (!days.includes(s.day)) continue;
        const samePeriod = s.periodId
          ? s.periodId === period.id
          : s.start === period.start && s.end === period.end;
        if (!samePeriod) continue;
        const otherTeacher =
          s.teacherId ?? other.subjectTeachers[s.courseId] ?? other.teacherId;
        if (otherTeacher === effectiveTeacher) blocked.add(s.day);
      }
    }
    return blocked;
  }, [store.classes, period, courseId, cls, days, effectiveTeacher, editing]);

  const roomSharedDays = useMemo(() => {
    if (!period || !cls) return new Set<WeekDay>();
    const replacing = new Set(editing?.sessionIds ?? []);
    const shared = new Set<WeekDay>();
    for (const other of store.classes) {
      if (other.id === cls.id) continue;
      for (const s of other.sessions) {
        if (replacing.has(s.id) || !days.includes(s.day)) continue;
        const samePeriod = s.periodId
          ? s.periodId === period.id
          : s.start === period.start && s.end === period.end;
        if (samePeriod && s.room === effectiveRoom && effectiveRoom) shared.add(s.day);
      }
    }
    return shared;
  }, [store.classes, period, cls, days, effectiveRoom, editing]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = slotSchema.safeParse({ classId, periodId, courseId, days });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    if (!period) return;
    const saveDays = days.filter((d) => !blockedDays.has(d));
    if (saveDays.length === 0) {
      setErrors({
        days: `The selected ${terminology.teacherLabel.toLowerCase()} is double-booked on all chosen days.`,
      });
      return;
    }
    setErrors({});
    // Replacing an existing row: remove all its slots, then recreate per day.
    if (editing) {
      for (const id of editing.sessionIds) store.removeClassSession(editing.classId, id);
    }
    for (const day of saveDays) {
      store.addClassSession(classId, {
        day,
        start: period.start,
        end: period.end,
        courseId,
        room: effectiveRoom,
        teacherId: effectiveTeacher,
        periodId: period.id,
      });
    }
    onClose();
  }

  if (!cls || !period) return null;

  const saveDays = days.filter((d) => !blockedDays.has(d));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Lecture Slot" : "Assign Lecture Slot"}
      description="Pick a period, subject, and the days it repeats"
      footer={
        <ModalActions
          form="slot-form"
          onCancel={onClose}
          submitLabel={editing ? "Save Slot" : "Assign Slot"}
        />
      }
    >
      <form id="slot-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="sl-class"
            label={terminology.classLabel}
            value={classId}
            disabled={classLocked}
            onChange={(e) => changeClass(e.target.value)}
          >
            {(classLocked ? store.classes.filter((c) => c.id === classId) : store.classes).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.section})
              </option>
            ))}
          </SelectField>
          <SelectField
            id="sl-period"
            label="Period"
            value={periodId}
            error={errors.periodId}
            onChange={(e) => setPeriodId(e.target.value)}
          >
            {store.periods
              .filter((p): p is SchoolPeriod => p.kind === "lecture")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} · {p.start}–{p.end}
                </option>
              ))}
          </SelectField>
          <SelectField
            id="sl-subject"
            label="Subject"
            value={courseId}
            error={errors.courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Select subject</option>
            {cls.courseIds.map((id) => {
              const course = store.getCourseById(id);
              return (
                <option key={id} value={id}>
                  {course?.title ?? id}
                </option>
              );
            })}
          </SelectField>
        </div>

        <fieldset className="rounded-lg border border-muted p-3">
          <legend className="px-1 text-xs font-medium text-secondary">Repeat on days</legend>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d) => {
              const checked = days.includes(d);
              const blocked = blockedDays.has(d);
              return (
                <label
                  key={d}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                    blocked
                      ? "border-primary/50 bg-primary/10 text-primary opacity-70"
                      : checked
                        ? "border-accent bg-accent/10 text-primary"
                        : "border-muted text-secondary hover:bg-muted"
                  }`}
                  title={blocked ? "Teacher already booked at this period" : undefined}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDay(d)}
                    className="h-4 w-4 accent-[var(--app-accent)]"
                  />
                  {d}
                </label>
              );
            })}
          </div>
          {errors.days && <p className="mt-2 text-xs text-primary">{errors.days}</p>}
        </fieldset>

        <div className="rounded-lg border border-muted">
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            aria-expanded={advanced}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-secondary transition-colors hover:bg-muted"
          >
            <span>
              Advanced Settings — auto-filled:{" "}
              <span className="font-medium text-primary">
                {store.getTeacherById(effectiveTeacher)?.name ?? "TBA"} ·{" "}
                {effectiveRoom || "TBA"}
              </span>
            </span>
            <span aria-hidden>{advanced ? "▴" : "▾"}</span>
          </button>
          {advanced && (
            <div className="grid gap-4 border-t border-muted p-3 sm:grid-cols-2">
              <SelectField
                id="sl-teacher"
                label={terminology.teacherLabel}
                value={teacherId || cls.subjectTeachers[courseId] || cls.teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              >
                {store.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </SelectField>
              <TextField
                id="sl-room"
                label="Room"
                value={room || cls.room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
          )}
        </div>

        {blockedDays.size > 0 && (
          <p className="text-xs font-medium text-primary">
            Blocked ({terminology.teacherLabel.toLowerCase()} double-booked):{" "}
            {Array.from(blockedDays).join(", ")} — saving skips these days.
          </p>
        )}
        {roomSharedDays.size > 0 && (
          <p className="text-xs text-secondary">
            Note: room shared with another batch on {Array.from(roomSharedDays).join(", ")}.
          </p>
        )}
        <p className="text-xs text-secondary">
          Saving assigns {period.label} for {cls.name} · {store.getCourseById(courseId)?.title} on{" "}
          {saveDays.join(", ") || "no available days"}.
        </p>
      </form>
    </Modal>
  );
}