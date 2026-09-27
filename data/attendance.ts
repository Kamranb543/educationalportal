import type { AttendanceRecord, AttendanceStatus } from "@/types";
import { classes } from "@/data/classes";
import { students } from "@/data/students";

/** Deterministic pseudo-random generator (mulberry32) so mock data is stable across reloads. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Instructional dates for the current billing window (Sep 2026). */
const SESSION_DATES = [
  "2026-09-01",
  "2026-09-02",
  "2026-09-03",
  "2026-09-04",
  "2026-09-07",
  "2026-09-08",
  "2026-09-09",
  "2026-09-10",
  "2026-09-11",
  "2026-09-14",
  "2026-09-15",
  "2026-09-16",
];

function pickStatus(rand: number): AttendanceStatus {
  if (rand < 0.78) return "present";
  if (rand < 0.88) return "late";
  if (rand < 0.95) return "absent";
  return "leave";
}

function buildAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let counter = 1;
  for (const cls of classes) {
    const roster = students.filter((s) => s.classId === cls.id && s.status === "active");
    for (const date of SESSION_DATES) {
      const rand = seeded(hash(`${cls.id}-${date}`));
      for (const student of roster) {
        const courseId = cls.courseIds[Math.floor(rand() * cls.courseIds.length)];
        records.push({
          id: `att-${String(counter++).padStart(4, "0")}`,
          date,
          classId: cls.id,
          studentId: student.id,
          teacherId: cls.teacherId,
          courseId,
          status: pickStatus(rand()),
          markedAt: `${date}T11:30:00+05:00`,
        });
      }
    }
  }
  return records;
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const attendance: AttendanceRecord[] = buildAttendance();
