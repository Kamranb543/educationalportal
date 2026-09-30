"use client";

import { useMemo } from "react";
import {
  findCollisionIds,
  findRoomCollisionIds,
  type ScheduledSession,
} from "@/lib/timetable";
import { useStore } from "@/lib/store/store-context";
import type { SchoolPeriod, WeekDay } from "@/types";

const DAYS: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Period-based timetable matrix: rows = master periods, columns = Mon–Sun.
 * Break periods render as a full-width band. Collisions are computed against
 * the full session set and highlighted per cell.
 */
export function TimetableMatrix({
  periods,
  sessions,
  allSessions,
  canManage,
  onEditSession,
  onDeleteSession,
}: {
  periods: SchoolPeriod[];
  /** Sessions to render (already scoped to the current view). */
  sessions: ScheduledSession[];
  /** Full session universe, used only for collision detection. */
  allSessions: ScheduledSession[];
  canManage: boolean;
  onEditSession?: (s: ScheduledSession) => void;
  onDeleteSession?: (s: ScheduledSession) => void;
}) {
  const store = useStore();
  const teacherClashes = useMemo(() => findCollisionIds(allSessions), [allSessions]);
  const roomClashes = useMemo(() => findRoomCollisionIds(allSessions), [allSessions]);
  const sorted = useMemo(
    () => [...periods].sort((a, b) => a.start.localeCompare(b.start)),
    [periods],
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-muted bg-card p-10 text-center text-sm text-secondary shadow-sm">
        No periods defined yet. Use “Manage Periods” to build the daily schedule.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-muted bg-card shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-muted bg-muted/40 text-xs uppercase tracking-wide text-secondary">
            <th className="w-40 min-w-[140px] px-3 py-2 font-medium">Period</th>
            {DAYS.map((d) => (
              <th key={d} className="min-w-[120px] px-3 py-2 font-medium">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-muted">
          {sorted.map((period) => {
            if (period.kind === "break") {
              return (
                <tr key={period.id} className="bg-muted/30">
                  <td className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-secondary">
                    {period.label}
                  </td>
                  <td colSpan={7} className="px-3 py-2 text-center text-xs italic text-secondary">
                    {period.start}–{period.end} · no lectures scheduled
                  </td>
                </tr>
              );
            }
            return (
              <tr key={period.id} className="align-top">
                <td className="px-3 py-2">
                  <p className="text-sm font-semibold text-primary">{period.label}</p>
                  <p className="font-mono text-[11px] text-secondary">
                    {period.start}–{period.end}
                  </p>
                </td>
                {DAYS.map((day) => {
                  const cell = sessions.filter(
                    (s) =>
                      s.session.day === day &&
                      (s.session.periodId
                        ? s.session.periodId === period.id
                        : s.session.start === period.start && s.session.end === period.end),
                  );
                  return (
                    <td key={day} className="border-l border-muted px-1.5 py-1.5">
                      {cell.length === 0 ? (
                        <span className="text-xs text-secondary/40">—</span>
                      ) : (
                        <div className="space-y-1.5">
                          {cell.map((s) => {
                            const teacher = store.getTeacherById(s.teacherId);
                            const clash =
                              teacherClashes.has(s.session.id) || roomClashes.has(s.session.id);
                            return (
                              <div
                                key={s.session.id}
                                className={`rounded-md border p-1.5 text-xs transition-colors ${
                                  teacherClashes.has(s.session.id)
                                    ? "border-primary/60 bg-primary/10"
                                    : roomClashes.has(s.session.id)
                                      ? "border-secondary/60 bg-secondary/10"
                                      : "border-muted bg-muted/30"
                                }`}
                              >
                                <p className="truncate font-medium text-primary">
                                  {s.course?.title ?? "—"}
                                </p>
                                <p className="truncate text-secondary">{s.className}</p>
                                <p className="truncate text-secondary">{teacher?.name ?? "TBA"}</p>
                                {clash && (
                                  <p className="mt-1 font-semibold text-primary">
                                    {teacherClashes.has(s.session.id)
                                      ? "Teacher double-booked"
                                      : "Room conflict"}
                                  </p>
                                )}
                                {canManage && onEditSession && (
                                  <div className="mt-1 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => onEditSession(s)}
                                      className="rounded border border-muted px-1 py-0.5 text-[10px] font-medium text-secondary hover:bg-muted"
                                    >
                                      Edit
                                    </button>
                                    {onDeleteSession && (
                                      <button
                                        type="button"
                                        onClick={() => onDeleteSession(s)}
                                        className="rounded border border-muted px-1 py-0.5 text-[10px] font-medium text-secondary hover:bg-muted"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
