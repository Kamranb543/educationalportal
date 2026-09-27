import type { PayrollRecord } from "@/types";
import { teachers } from "@/data/teachers";

const PAY_PERIODS = [
  { period: "2026-07", paidDate: "2026-07-28" },
  { period: "2026-08", paidDate: "2026-08-28" },
  { period: "2026-09", paidDate: null },
];

function buildPayroll(): PayrollRecord[] {
  const records: PayrollRecord[] = [];
  let counter = 1;
  for (const teacher of teachers) {
    if (teacher.status === "inactive") continue;
    PAY_PERIODS.forEach((pp) => {
      const allowances = Math.round(teacher.baseSalary * 0.1);
      const deductions = Math.round(teacher.baseSalary * 0.05);
      const netPay = teacher.baseSalary + allowances - deductions;
      const isSettled = pp.paidDate !== null;
      records.push({
        id: `prl-${String(counter++).padStart(3, "0")}`,
        payslipNumber: `PS-2026-${String(counter).padStart(3, "0")}`,
        teacherId: teacher.id,
        period: pp.period,
        baseSalary: teacher.baseSalary,
        allowances,
        deductions,
        netPay,
        status: isSettled ? "paid" : "processing",
        paidDate: pp.paidDate,
      });
    });
  }
  return records;
}

export const payroll: PayrollRecord[] = buildPayroll();
