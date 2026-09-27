import type { FeeVoucher, VoucherStatus } from "@/types";
import { students } from "@/data/students";
import { classes } from "@/data/classes";
import { courses } from "@/data/courses";

const BILLING_PERIODS = [
  { period: "2026-07", issue: "2026-07-01", due: "2026-07-10" },
  { period: "2026-08", issue: "2026-08-01", due: "2026-08-10" },
  { period: "2026-09", issue: "2026-09-01", due: "2026-09-10" },
];

/** Gross monthly tuition for a batch = sum of its course fees. */
function classMonthlyAmount(classId: string): number {
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return 0;
  return cls.courseIds.reduce(
    (sum, cid) => sum + (courses.find((c) => c.id === cid)?.feePerStudent ?? 0),
    0,
  );
}

function buildVouchers(): FeeVoucher[] {
  const vouchers: FeeVoucher[] = [];
  let counter = 1;
  for (const student of students) {
    if (student.status === "inactive") continue;
    const gross = classMonthlyAmount(student.classId);
    const seq = Number(student.rollNumber.slice(-3));
    BILLING_PERIODS.forEach((bp, idx) => {
      const isPast = idx < BILLING_PERIODS.length - 1;
      // Past periods are fully settled; current period varies by roll number.
      // seq % 3 === 0 -> overdue (unpaid, due date 10th has passed), 1 -> partial, else paid.
      const paidAmount = isPast ? gross : seq % 3 === 0 ? 0 : seq % 3 === 1 ? Math.round(gross / 2) : gross;

      const balance = gross - paidAmount;
      let status: VoucherStatus;
      if (paidAmount === 0) {
        status = "overdue";
      } else if (balance > 0) {
        status = "partial";
      } else {
        status = "paid";
      }

      const payments =
        paidAmount > 0
          ? [
              {
                date: `${bp.period}-05`,
                amount: paidAmount,
                method: (paidAmount === gross ? "bank-transfer" : "cash") as FeeVoucher["payments"][number]["method"],
                reference: `TXN-${bp.period.replace("-", "")}-${student.rollNumber.slice(-3)}`,
              },
            ]
          : [];

      vouchers.push({
        id: `vch-${String(counter++).padStart(3, "0")}`,
        voucherNumber: `INV-2026-${String(counter).padStart(3, "0")}`,
        studentId: student.id,
        classId: student.classId,
        period: bp.period,
        issueDate: bp.issue,
        dueDate: bp.due,
        amount: gross,
        discount: 0,
        paidAmount,
        payments,
        status,
      });
    });
  }
  return vouchers;
}

export const feeVouchers: FeeVoucher[] = buildVouchers();
