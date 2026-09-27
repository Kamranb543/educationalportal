"use client";

import { useMemo, useState } from "react";
import { terminology } from "@/lib/config";
import { useAuth } from "@/lib/auth/auth-context";
import { useStore } from "@/lib/store/store-context";
import type { AttendanceStatus, ClassBatch } from "@/types";

const STATUSES: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "Leave" },
];

type Roster = Record<string, AttendanceStatus>;
type Tab = "student" | "faculty";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function StatusToggles({
  value,
  disabled,
  onChange,
}: {
  value: AttendanceStatus;
  disabled: boolean;
  onChange: (s: AttendanceStatus) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-muted p-1">
      {STATUSES.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              active ? "bg-accent text-card" : "text-secondary hover:bg-muted"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SummaryBar({
  label,
  counts,
  pct,
  total,
}: {
  label: string;
  counts: Record<AttendanceStatus, number>;
  pct: number;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-muted bg-card px-4 py-3 shadow-sm">
      <div className="mr-auto">
        <p className="text-sm font-semibold text-primary">Marking Summary</p>
        <p className="text-xs text-secondary">
          {total} {label} · {pct}% attendance
        </p>
      </div>
      {STATUSES.map((s) => (
        <div key={s.value} className="rounded-lg border border-muted px-3 py-1.5 text-center">
          <p className="text-lg font-semibold text-primary leading-none">{counts[s.value]}</p>
          <p className="mt-0.5 text-[11px] text-secondary">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Attendance marker with two tabs (student / faculty). Teacher scope is limited
 * to their own batches, and historical dates are locked for Teachers while
 * Admins must explicitly toggle "Edit Historical Attendance" to modify them.
 */
export function AttendanceMarker() {
  const store = useStore();
  const { currentUser, currentRole } = useAuth();
  const today = todayISO();
  const isTeacher = currentRole === "teacher";
  const canMarkFaculty = currentRole === "super_admin" || currentRole === "admin";

  const [tab, setTab] = useState<Tab>("student");
  const [date, setDate] = useState(today);
  const [editHistorical, setEditHistorical] = useState(false);

  // Teacher scope: only batches they lead. Admins/Super Admins see all.
  const visibleClasses: ClassBatch[] = useMemo(() => {
    if (isTeacher) {
      const tid = currentUser?.teacherId;
      return store.classes.filter((c) => c.teacherId === tid);
    }
    return store.classes;
  }, [store.classes, isTeacher, currentUser?.teacherId]);

  const [classId, setClassId] = useState<string>(visibleClasses[0]?.id ?? "");
  const activeClassId = visibleClasses.some((c) => c.id === classId) ? classId : visibleClasses[0]?.id ?? "";

  const isHistorical = date < today;
  // Teachers can never edit historical; Admins need the explicit toggle.
  const locked = isHistorical && (isTeacher || !editHistorical);

  const [draft, setDraft] = useState<Roster>({});
  const [saved, setSaved] = useState<string | null>(null);

  const rosterRows = tab === "student" ? store.getStudentsForClass(activeClassId) : store.teachers.filter((t) => t.status === "active");

  const existing = useMemo<Roster>(() => {
    const map: Roster = {};
    if (tab === "student") {
      for (const a of store.attendance) {
        if (a.classId === activeClassId && a.date === date) map[a.studentId] = a.status;
      }
    } else {
      for (const a of store.getTeacherAttendanceForDate(date)) map[a.teacherId] = a.status;
    }
    return map;
  }, [tab, store, activeClassId, date]);

  const current = (rowId: string): AttendanceStatus =>
    draft[rowId] ?? existing[rowId] ?? "present";

  const totals = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = { present: 0, absent: 0, late: 0, leave: 0 };
    for (const row of rosterRows) counts[current(row.id)]++;
    const pct = rosterRows.length ? Math.round(((counts.present + counts.late) / rosterRows.length) * 100) : 0;
    return { counts, pct };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- current reads draft+existing together
  }, [draft, existing, rosterRows]);

  function resetDraft() {
    setDraft({});
    setSaved(null);
  }

  function changeDate(next: string) {
    setDate(next);
    resetDraft();
  }

  function changeTab(next: Tab) {
    setTab(next);
    resetDraft();
  }

  function selectClass(id: string) {
    setClassId(id);
    resetDraft();
  }

  function toggleHistorical() {
    setEditHistorical((v) => !v);
    resetDraft();
  }

  function setStatus(rowId: string, status: AttendanceStatus) {
    setDraft((r) => ({ ...r, [rowId]: status }));
    setSaved(null);
  }

  function saveSession() {
    if (locked) return;
    const statuses: Roster = {};
    for (const row of rosterRows) statuses[row.id] = current(row.id);
    if (tab === "student") {
      store.recordAttendance(activeClassId, date, statuses);
    } else {
      store.recordTeacherAttendance(date, statuses);
    }
    resetDraft();
    const kind = tab === "student" ? terminology.studentLabel : terminology.teacherLabel;
    setSaved(`Saved ${rosterRows.length} ${kind} records for ${date}`);
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-muted bg-card p-1 shadow-sm" role="tablist" aria-label="Attendance type">
        <button
          role="tab"
          type="button"
          aria-selected={tab === "student"}
          onClick={() => changeTab("student")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "student" ? "bg-accent text-card" : "text-secondary hover:bg-muted"
          }`}
        >
          {terminology.studentLabel} Attendance
        </button>
        {canMarkFaculty && (
          <button
            role="tab"
            type="button"
            aria-selected={tab === "faculty"}
            onClick={() => changeTab("faculty")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "faculty" ? "bg-accent text-card" : "text-secondary hover:bg-muted"
            }`}
          >
            Faculty Attendance
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="grid gap-4 rounded-xl border border-muted bg-card p-4 shadow-sm sm:grid-cols-2">
        {tab === "student" && (
          <div>
            <label htmlFor="at-class" className="mb-1 block text-xs font-medium text-secondary">
              {terminology.classLabel} Batch
              {isTeacher && <span className="ml-1 normal-case"> (your assigned)</span>}
            </label>
            <select
              id="at-class"
              value={activeClassId}
              onChange={(e) => selectClass(e.target.value)}
              className="w-full rounded-lg border border-muted bg-card px-3 py-2 text-sm text-primary focus:border-accent"
            >
              {visibleClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="at-date" className="mb-1 block text-xs font-medium text-secondary">
            Session Date
          </label>
          <input
            id="at-date"
            type="date"
            value={date}
            onChange={(e) => changeDate(e.target.value)}
            className="w-full rounded-lg border border-muted bg-card px-3 py-2 text-sm text-primary focus:border-accent"
          />
          {isHistorical && (
            <p className="mt-1 text-xs text-primary">
              {isTeacher
                ? "Historical dates are read-only for your role."
                : "Historical date — locked until you enable editing."}
            </p>
          )}
        </div>
      </div>

      {/* Admin historical-edit toggle */}
      {isHistorical && !isTeacher && (
        <button
          type="button"
          onClick={toggleHistorical}
          aria-pressed={editHistorical}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            editHistorical
              ? "border-accent bg-accent text-card"
              : "border-muted bg-card text-secondary hover:bg-muted"
          }`}
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
              editHistorical ? "border-card bg-card" : "border-secondary"
            }`}
          >
            {editHistorical && <span className="h-2 w-2 rounded-full bg-accent" />}
          </span>
          {editHistorical ? "Editing historical attendance" : "Enable Edit Historical Attendance"}
        </button>
      )}

      <SummaryBar
        label={tab === "student" ? `${terminology.studentLabel}s` : `${terminology.teacherLabel}s`}
        counts={totals.counts}
        pct={totals.pct}
        total={rosterRows.length}
      />
      {saved && <p className="text-xs text-accent">{saved}</p>}
      {locked && (
        <p className="text-xs text-secondary">
          Records are shown read-only. {isTeacher ? "You can only mark attendance for today or scheduled dates." : "Use the toggle above to modify a past session."}
        </p>
      )}

      {/* Roster grid */}
      <div className="overflow-x-auto rounded-xl border border-muted bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-muted text-xs uppercase tracking-wide text-secondary">
              <th className="px-4 py-3 font-medium">{tab === "student" ? terminology.studentLabel : terminology.teacherLabel}</th>
              <th className="px-4 py-3 font-medium">Identifier</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {rosterRows.map((row) => {
              const status = current(row.id);
              const identifier = "rollNumber" in row ? row.rollNumber : "employeeId" in row ? row.employeeId : "";
              return (
                <tr key={row.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary">{row.name}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-secondary">{identifier}</td>
                  <td className="px-4 py-3">
                    <StatusToggles value={status} disabled={locked} onChange={(s) => setStatus(row.id, s)} />
                  </td>
                </tr>
              );
            })}
            {rosterRows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-sm text-secondary">
                  No {tab === "student" ? terminology.studentLabel.toLowerCase() : terminology.teacherLabel.toLowerCase()}s to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={saveSession}
        disabled={locked}
        className="rounded-lg px-4 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--app-accent)" }}
      >
        Save {tab === "student" ? terminology.studentLabel : "Faculty"} Session
      </button>
    </div>
  );
}
