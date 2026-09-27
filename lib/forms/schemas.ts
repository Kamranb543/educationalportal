import { z } from "zod";

// Zod validation schemas for CRUD/financial forms (Phase 6).
// Labels shown to users come from terminology in components, not here.

const trimmed = (min: number, max: number) =>
  z.string().trim().min(min).max(max);

export const studentSchema = z.object({
  name: trimmed(2, 80),
  email: z.string().trim().email(),
  phone: trimmed(7, 20),
  guardianName: trimmed(2, 80),
  guardianPhone: trimmed(7, 20),
  classId: trimmed(1, 40),
  status: z.enum(["active", "inactive", "suspended"]),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export const teacherSchema = z.object({
  name: trimmed(2, 80),
  email: z.string().trim().email(),
  phone: trimmed(7, 20),
  department: trimmed(2, 60),
  qualification: trimmed(2, 120),
  baseSalary: z.coerce.number().int().positive(),
  status: z.enum(["active", "inactive", "suspended"]),
  courseIds: z.array(z.string()).optional(),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

export const expenseSchema = z.object({
  title: trimmed(2, 80),
  description: trimmed(0, 240),
  category: z.enum([
    "rent",
    "utilities",
    "supplies",
    "maintenance",
    "marketing",
    "misc",
  ]),
  amount: z.coerce.number().positive(),
  date: trimmed(1, 40),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const feePaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(["cash", "bank-transfer", "online"]),
  reference: trimmed(1, 40),
  date: trimmed(1, 40),
});

export type FeePaymentFormValues = z.infer<typeof feePaymentSchema>;

export const announcementSchema = z.object({
  title: trimmed(4, 120),
  body: z.string().trim().min(10).max(600),
  audience: z.array(z.enum(["students", "teachers", "admins"])).min(1),
  priority: z.enum(["normal", "urgent"]),
  pinned: z.boolean(),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

/** Flatten zod issues to a field → first-message map for form UIs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
