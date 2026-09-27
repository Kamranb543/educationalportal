import type { ClassBatch } from "@/types";

export const classes: ClassBatch[] = [
  {
    id: "cls-01",
    name: "Morning Web Development",
    academicYear: "2026",
    courseIds: ["crs-01", "crs-04"],
    teacherId: "tch-05",
    room: "Lab-A",
    schedule: "Mon–Wed–Fri, 09:00–11:00",
    capacity: 25,
  },
  {
    id: "cls-02",
    name: "Evening DSA Bootcamp",
    academicYear: "2026",
    courseIds: ["crs-02", "crs-04"],
    teacherId: "tch-02",
    room: "Room-2",
    schedule: "Tue–Thu, 17:00–19:00",
    capacity: 20,
  },
  {
    id: "cls-03",
    name: "Accounting Foundation",
    academicYear: "2026",
    courseIds: ["crs-03", "crs-04"],
    teacherId: "tch-03",
    room: "Room-1",
    schedule: "Sat–Sun, 10:00–13:00",
    capacity: 30,
  },
  {
    id: "cls-04",
    name: "Full-Stack Intensive",
    academicYear: "2026",
    courseIds: ["crs-01", "crs-02"],
    teacherId: "tch-05",
    room: "Lab-B",
    schedule: "Mon–Thu, 14:00–16:00",
    capacity: 18,
  },
];
