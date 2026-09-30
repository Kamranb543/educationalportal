import type { ClassBatch, ClassSession, Course, WeekDay } from "@/types";

export interface ScheduledSession {
  classId: string;
  className: string;
  session: ClassSession;
  /** Teacher delivering the slot = the subject's assigned teacher. */
  teacherId: string;
  course?: Course;
}

const WEEK_ORDER: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function weekOrder(day: WeekDay): number {
  return WEEK_ORDER.indexOf(day);
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Flatten every class batch's weekly sessions with resolved teacher + subject. */
export function collectSessions(
  classes: ClassBatch[],
  getCourseById: (id: string) => Course | undefined,
): ScheduledSession[] {
  const out: ScheduledSession[] = [];
  for (const cls of classes) {
    for (const session of cls.sessions) {
      const course = getCourseById(session.courseId);
      out.push({
        classId: cls.id,
        className: cls.name,
        session,
        teacherId:
          session.teacherId ?? cls.subjectTeachers[session.courseId] ?? cls.teacherId,
        course,
      });
    }
  }
  return out;
}

/** "HH:MM" → minutes since midnight. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Session ids whose teacher is double-booked (same teacher, day, overlap). */
export function findCollisionIds(sessions: ScheduledSession[]): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const a = sessions[i];
      const b = sessions[j];
      if (
        a.session.id !== b.session.id &&
        a.teacherId === b.teacherId &&
        a.session.day === b.session.day &&
        overlaps(a.session.start, a.session.end, b.session.start, b.session.end)
      ) {
        ids.add(a.session.id);
        ids.add(b.session.id);
      }
    }
  }
  return ids;
}

/** Session ids whose room is double-booked (same room, day, overlap). */
export function findRoomCollisionIds(sessions: ScheduledSession[]): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const a = sessions[i];
      const b = sessions[j];
      if (
        a.session.id !== b.session.id &&
        a.session.room === b.session.room &&
        a.session.day === b.session.day &&
        overlaps(a.session.start, a.session.end, b.session.start, b.session.end)
      ) {
        ids.add(a.session.id);
        ids.add(b.session.id);
      }
    }
  }
  return ids;
}

/** Distinct "HH:MM" start times across sessions, sorted — the timetable's rows. */
export function timeSlots(sessions: ScheduledSession[]): string[] {
  return Array.from(new Set(sessions.map((s) => s.session.start))).sort();
}
