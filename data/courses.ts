import type { Course } from "@/types";

export const courses: Course[] = [
  {
    id: "crs-01",
    code: "WEB-301",
    title: "Modern Web Development",
    teacherId: "tch-05",
    creditHours: 3,
    feePerStudent: 5000,
    description: "HTML, CSS, JavaScript, React and Next.js fundamentals with portfolio projects.",
  },
  {
    id: "crs-02",
    code: "DSA-201",
    title: "Data Structures & Algorithms",
    teacherId: "tch-02",
    creditHours: 4,
    feePerStudent: 4000,
    description: "Arrays, trees, graphs, sorting and complexity analysis with interview drills.",
  },
  {
    id: "crs-03",
    code: "ACC-105",
    title: "Principles of Accounting",
    teacherId: "tch-03",
    creditHours: 3,
    feePerStudent: 3000,
    description: "Double-entry bookkeeping, ledgers, trial balance and final accounts.",
  },
  {
    id: "crs-04",
    code: "ENG-110",
    title: "English & Business Communication",
    teacherId: "tch-04",
    creditHours: 2,
    feePerStudent: 2500,
    description: "Grammar, email etiquette, presentation and interview speaking skills.",
  },
  {
    id: "crs-05",
    code: "CS-101",
    title: "Introduction to Computing",
    teacherId: "tch-01",
    creditHours: 3,
    feePerStudent: 3500,
    description: "Computer basics, OS concepts, number systems and digital literacy.",
  },
];
