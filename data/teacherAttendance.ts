import type { AttendanceStatus, TeacherAttendanceRecord } from "@/types";
import { teachers } from "@/data/teachers";

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

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const WORK_DATES = [
  "2026-09-01",
  "2026-09-02",
  "2026-09-03",
  "2026-09-04",
  "2026-09-07",
  "2026-09-08",
  "2026-09-09",
  "2026-09-10",
  "2026-09-11",
];

function pick(rand: number): AttendanceStatus {
  if (rand < 0.86) return "present";
  if (rand < 0.93) return "late";
  if (rand < 0.97) return "leave";
  return "absent";
}

function build(): TeacherAttendanceRecord[] {
  const records: TeacherAttendanceRecord[] = [];
  let counter = 1;
  for (const teacher of teachers) {
    if (teacher.status === "inactive") continue;
    for (const date of WORK_DATES) {
      const rand = seeded(hash(`${teacher.id}-${date}`));
      records.push({
        id: `tat-${String(counter++).padStart(4, "0")}`,
        teacherId: teacher.id,
        date,
        status: pick(rand()),
        markedAt: `${date}T09:00:00+05:00`,
      });
    }
  }
  return records;
}

export const teacherAttendance: TeacherAttendanceRecord[] = build();
