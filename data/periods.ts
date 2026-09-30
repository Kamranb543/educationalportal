import type { SchoolPeriod } from "@/types";

/** Master daily timetable periods: lectures + breaks. Single source for the
 * period-based matrix (rows) across the school. */
export const periods: SchoolPeriod[] = [
  { id: "pr-1", label: "Period 1", start: "09:00", end: "10:00", kind: "lecture" },
  { id: "pr-2", label: "Period 2", start: "10:00", end: "11:00", kind: "lecture" },
  { id: "pr-brk-1", label: "Break", start: "11:00", end: "11:30", kind: "break" },
  { id: "pr-3", label: "Period 3", start: "11:30", end: "12:30", kind: "lecture" },
  { id: "pr-4", label: "Period 4", start: "12:30", end: "13:30", kind: "lecture" },
  { id: "pr-brk-2", label: "Lunch", start: "13:30", end: "14:00", kind: "break" },
  { id: "pr-5", label: "Period 5", start: "14:00", end: "15:00", kind: "lecture" },
  { id: "pr-6", label: "Period 6", start: "15:00", end: "16:00", kind: "lecture" },
  { id: "pr-7", label: "Period 7", start: "17:00", end: "18:00", kind: "lecture" },
  { id: "pr-8", label: "Period 8", start: "18:00", end: "19:00", kind: "lecture" },
];
