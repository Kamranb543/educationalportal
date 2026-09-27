// Auto-generated identifier formatting driven by institution.config.ts.
import { config } from "@/lib/config";

/** Format a student roll number from a sequence, e.g. "FA26-001". */
export function formatRollNumber(sequence: number): string {
  const { prefix, pad, separator } = config.rollNumberConfig;
  return `${prefix}${separator}${String(sequence).padStart(pad, "0")}`;
}

/** Format a faculty employee ID from a sequence, e.g. "EMP-1001". */
export function formatEmployeeId(sequence: number): string {
  const { prefix, pad, separator } = config.teacherIdConfig;
  return `${prefix}${separator}${String(sequence).padStart(pad, "0")}`;
}

/** Highest numeric suffix currently in a set of IDs (returns 0 if none match). */
export function maxSequence(ids: string[], separator: string): number {
  return ids.reduce((acc, id) => {
    const tail = id.split(separator).pop();
    const n = tail === undefined ? Number.NaN : Number(tail);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
}
