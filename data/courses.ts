import type { Course } from "@/types";

export const courses: Course[] = [
  {
    id: "crs-01",
    code: "WEB-301",
    title: "Modern Web Development",
    description: "HTML, CSS, JavaScript, React and Next.js fundamentals with portfolio projects.",
    syllabus: [
      {
        id: "ch-0101",
        title: "Frontend Foundations",
        topics: [
          { id: "tp-0101", title: "Semantic HTML & Accessibility", testRange: "1-2" },
          { id: "tp-0102", title: "CSS Layout & Flexbox/Grid", testRange: "3-4" },
        ],
      },
      {
        id: "ch-0102",
        title: "React & Next.js",
        topics: [
          { id: "tp-0103", title: "Components & Hooks", testRange: "5-6" },
          { id: "tp-0104", title: "App Router & Server Components", testRange: "7-8" },
        ],
      },
    ],
  },
  {
    id: "crs-02",
    code: "DSA-201",
    title: "Data Structures & Algorithms",
    description: "Arrays, trees, graphs, sorting and complexity analysis with interview drills.",
    syllabus: [
      {
        id: "ch-0201",
        title: "Linear Structures",
        topics: [
          { id: "tp-0201", title: "Arrays, Stacks & Queues", testRange: "1-3" },
          { id: "tp-0202", title: "Linked Lists", testRange: "4-5" },
        ],
      },
      {
        id: "ch-0202",
        title: "Non-Linear & Sorting",
        topics: [
          { id: "tp-0203", title: "Trees & Graphs", testRange: "6-8" },
          { id: "tp-0204", title: "Sorting & Complexity", testRange: "9-10" },
        ],
      },
    ],
  },
  {
    id: "crs-03",
    code: "ACC-105",
    title: "Principles of Accounting",
    description: "Double-entry bookkeeping, ledgers, trial balance and final accounts.",
    syllabus: [
      {
        id: "ch-0301",
        title: "Bookkeeping",
        topics: [
          { id: "tp-0301", title: "Journals & Ledgers", testRange: "1-2" },
          { id: "tp-0302", title: "Trial Balance", testRange: "3-4" },
        ],
      },
    ],
  },
  {
    id: "crs-04",
    code: "ENG-110",
    title: "English & Business Communication",
    description: "Grammar, email etiquette, presentation and interview speaking skills.",
    syllabus: [
      {
        id: "ch-0401",
        title: "Written Communication",
        topics: [
          { id: "tp-0401", title: "Grammar & Composition", testRange: "1-3" },
          { id: "tp-0402", title: "Business Emails & Reports", testRange: "4-5" },
        ],
      },
    ],
  },
  {
    id: "crs-05",
    code: "CS-101",
    title: "Introduction to Computing",
    description: "Computer basics, OS concepts, number systems and digital literacy.",
    syllabus: [
      {
        id: "ch-0501",
        title: "Computing Basics",
        topics: [
          { id: "tp-0501", title: "Hardware & Number Systems", testRange: "1-2" },
          { id: "tp-0502", title: "Operating Systems", testRange: "3-4" },
        ],
      },
    ],
  },
  {
    id: "crs-06",
    code: "PHY-120",
    title: "Applied Physics",
    description: "Mechanics, electricity and optics with practical problem sets.",
    syllabus: [
      {
        id: "ch-0601",
        title: "Mechanics",
        topics: [{ id: "tp-0601", title: "Motion & Forces", testRange: "1-3" }],
      },
    ],
  },
  {
    id: "crs-07",
    code: "BIO-120",
    title: "Biology Fundamentals",
    description: "Cell biology, genetics and human physiology essentials.",
    syllabus: [
      {
        id: "ch-0701",
        title: "Cell Biology",
        topics: [{ id: "tp-0701", title: "Cells & Genetics", testRange: "1-4" }],
      },
    ],
  },
];
