import type { Expense } from "@/types";

export const expenses: Expense[] = [
  { id: "exp-01", receiptNumber: "RCP-2026-071", category: "rent", title: "Campus Rent — July", description: "Monthly rent for Main Campus, Education Zone.", amount: 60000, date: "2026-07-05", approvedById: "usr-01", status: "approved" },
  { id: "exp-02", receiptNumber: "RCP-2026-072", category: "utilities", title: "Electricity & Gas Bills", description: "K-Electric and SNGPL bills for July.", amount: 24500, date: "2026-07-12", approvedById: "usr-02", status: "approved" },
  { id: "exp-03", receiptNumber: "RCP-2026-073", category: "supplies", title: "Stationery & Print Media", description: "Voucher printing, markers, whiteboard supplies.", amount: 9200, date: "2026-07-20", approvedById: "usr-02", status: "approved" },
  { id: "exp-04", receiptNumber: "RCP-2026-081", category: "rent", title: "Campus Rent — August", description: "Monthly rent for Main Campus, Education Zone.", amount: 60000, date: "2026-08-05", approvedById: "usr-01", status: "approved" },
  { id: "exp-05", receiptNumber: "RCP-2026-082", category: "maintenance", title: "Lab AC & IT Maintenance", description: "Quarterly servicing of Lab-A/Lab-B systems.", amount: 18800, date: "2026-08-15", approvedById: "usr-02", status: "approved" },
  { id: "exp-06", receiptNumber: "RCP-2026-083", category: "marketing", title: "Social Media Admission Campaign", description: "Facebook/Instagram boosts for fall intake.", amount: 22000, date: "2026-08-22", approvedById: "usr-01", status: "approved" },
  { id: "exp-07", receiptNumber: "RCP-2026-091", category: "rent", title: "Campus Rent — September", description: "Monthly rent for Main Campus, Education Zone.", amount: 60000, date: "2026-09-05", approvedById: "usr-01", status: "approved" },
  { id: "exp-08", receiptNumber: "RCP-2026-092", category: "utilities", title: "Internet & Generator Fuel", description: "Fiber line upgrade plus backup fuel.", amount: 15600, date: "2026-09-10", approvedById: "usr-02", status: "approved" },
  { id: "exp-09", receiptNumber: "RCP-2026-093", category: "supplies", title: "Furniture for New Batch", description: "Desks and chairs for Full-Stack Intensive.", amount: 32000, date: "2026-09-18", approvedById: "usr-02", status: "pending" },
  { id: "exp-10", receiptNumber: "RCP-2026-094", category: "misc", title: "Event Catering (Seminar)", description: "Catering for guest speaker seminar.", amount: 15500, date: "2026-09-21", approvedById: "usr-02", status: "rejected" },
];
