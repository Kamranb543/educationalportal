import type { Announcement } from "@/types";

export const announcements: Announcement[] = [
  {
    id: "an-01",
    title: "Fall 2026 Admissions Now Open",
    body: "New batches for Web Development, DSA, and Accounting begin next month. Early-bird scholarship vouchers available for the first 10 enrollees.",
    audience: ["students", "teachers", "admins"],
    priority: "normal",
    pinned: true,
    authorId: "usr-01",
    createdAt: "2026-09-15T09:00:00+05:00",
  },
  {
    id: "an-02",
    title: "Fee Deadline Reminder — September",
    body: "September vouchers are due by the 10th. Students with outstanding balances should settle via bank transfer or at the front desk.",
    audience: ["students"],
    priority: "urgent",
    pinned: false,
    authorId: "usr-02",
    createdAt: "2026-09-08T11:30:00+05:00",
  },
  {
    id: "an-03",
    title: "Faculty Payroll Cycle — October",
    body: "Salary disbursements will be processed on the 28th. Please submit any reimbursement claims to the accounts desk by the 25th.",
    audience: ["teachers"],
    priority: "normal",
    pinned: false,
    authorId: "usr-01",
    createdAt: "2026-09-20T16:45:00+05:00",
  },
  {
    id: "an-04",
    title: "Lab-B Network Upgrade Scheduled",
    body: "The Full-Stack Intensive batch will use Lab-A on Saturday while Lab-B cabling is upgraded. Timings unchanged.",
    audience: ["students", "teachers", "admins"],
    priority: "normal",
    pinned: false,
    authorId: "usr-02",
    createdAt: "2026-09-22T08:15:00+05:00",
  },
];
