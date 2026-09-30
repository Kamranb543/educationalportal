import type { InviteToken, OnboardingApplication } from "@/types";

export const inviteTokens: InviteToken[] = [
  {
    id: "tok-01",
    code: "TCH-8921",
    role: "teacher",
    offeredSalary: 38000,
    feeDiscount: null,
    contractNotes: "Full-time faculty, DSA + Web tracks, 6-day probation.",
    createdBy: "usr-01",
    createdAt: "2026-09-18T10:00:00+05:00",
    expiresAt: "2026-10-18",
    status: "active",
  },
  {
    id: "tok-02",
    code: "STU-4410",
    role: "student",
    offeredSalary: null,
    feeDiscount: 1000,
    contractNotes: "Merit scholarship — Rs. 1,000 monthly fee concession.",
    createdBy: "usr-02",
    createdAt: "2026-09-20T14:30:00+05:00",
    expiresAt: "2026-10-31",
    status: "used",
  },
];

export const onboardingApplications: OnboardingApplication[] = [
  {
    id: "app-01",
    tokenCode: "STU-4410",
    role: "student",
    name: "Zara Qureshi",
    email: "zara.qureshi@student.pakmillat.edu.pk",
    phone: "+92 345 7012345",
    qualification: "F.Sc Pre-Engineering",
    offeredSalary: null,
    feeDiscount: 1000,
    contractNotes: "Merit scholarship — Rs. 1,000 monthly fee concession.",
    classId: null,
    courseIds: [],
    submittedAt: "2026-09-21T09:15:00+05:00",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
  },
];
