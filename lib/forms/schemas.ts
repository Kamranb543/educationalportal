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

export const subjectSchema = z.object({
  code: trimmed(2, 12),
  title: trimmed(2, 80),
  description: trimmed(0, 240),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;

// Class creation is intentionally minimal; refinement happens via Edit Class.
export const classSchema = z.object({
  name: trimmed(2, 80),
  section: trimmed(1, 10),
  monthlyFee: z.coerce.number().int().min(0),
});

export type ClassFormValues = z.infer<typeof classSchema>;

// Full edit for a class batch, including add/remove of master subjects.
export const classEditSchema = z.object({
  name: trimmed(2, 80),
  section: trimmed(1, 10),
  monthlyFee: z.coerce.number().int().min(0),
  academicYear: trimmed(2, 10),
  teacherId: trimmed(1, 40),
  room: trimmed(1, 30),
  capacity: z.coerce.number().int().positive(),
  courseIds: z.array(z.string()),
});

export type ClassEditFormValues = z.infer<typeof classEditSchema>;

export const classMetaSchema = z.object({
  name: trimmed(2, 80),
  section: trimmed(1, 10),
  monthlyFee: z.coerce.number().int().min(0),
});

export type ClassMetaFormValues = z.infer<typeof classMetaSchema>;

export const slotSchema = z.object({
  classId: trimmed(1, 40),
  periodId: trimmed(1, 40),
  courseId: trimmed(1, 40),
  days: z.array(z.string()).min(1, "Pick at least one day"),
});

export type SlotFormValues = z.infer<typeof slotSchema>;

export const periodSchema = z.object({
  id: trimmed(1, 40),
  label: trimmed(1, 24),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  kind: z.enum(["lecture", "break"]),
});

export type PeriodFormValues = z.infer<typeof periodSchema>;

export const inviteTokenSchema = z.object({
  role: z.enum(["teacher", "student"]),
  offeredSalary: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.coerce.number().int().min(0).nullable(),
  ),
  feeDiscount: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.coerce.number().int().min(0).nullable(),
  ),
  contractNotes: trimmed(0, 240),
  expiresAt: trimmed(1, 40),
});

export type InviteTokenFormValues = z.infer<typeof inviteTokenSchema>;

export const applicationSchema = z
  .object({
    name: trimmed(2, 80),
    email: z.string().trim().email(),
    phone: trimmed(7, 20),
    qualification: trimmed(2, 120),
  })
  .superRefine((data, ctx) => {
    // Teacher applicants must carry a qualification detail.
    if (data.qualification.trim().length < 2) {
      ctx.addIssue({ code: "custom", path: ["qualification"], message: "Qualification is required" });
    }
  });

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

/** Flatten zod issues to a field → first-message map for form UIs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
