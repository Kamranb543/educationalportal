import type { Student } from "@/types";

// Realistic multi-cohort roster so the demo institution runs at a positive
// net cashflow (fees > payroll + expenses) while Sep billing keeps a healthy
// mix of paid / partial / overdue vouchers for testing.

interface Seed {
  name: string;
  classId: string;
}

const SEEDS: Seed[] = [
  // cls-01 — Morning Web Development
  { name: "Ahmed Raza", classId: "cls-01" },
  { name: "Fatima Noor", classId: "cls-01" },
  { name: "Hamza Sheikh", classId: "cls-01" },
  { name: "Danish Iqbal", classId: "cls-01" },
  { name: "Areeba Khan", classId: "cls-01" },
  { name: "Zohaib Ali", classId: "cls-01" },
  { name: "Mahnoor Raza", classId: "cls-01" },
  { name: "Talha Younas", classId: "cls-01" },
  { name: "Hira Nadeem", classId: "cls-01" },
  { name: "Usama Tariq", classId: "cls-01" },
  // cls-02 — Evening DSA Bootcamp
  { name: "Ayesha Malik", classId: "cls-02" },
  { name: "Bilal Hussain", classId: "cls-02" },
  { name: "Iqra Batool", classId: "cls-02" },
  { name: "Faizan Ahmed", classId: "cls-02" },
  { name: "Laiba Arif", classId: "cls-02" },
  { name: "Hassan Shah", classId: "cls-02" },
  { name: "Amna Javed", classId: "cls-02" },
  { name: "Rehan Aslam", classId: "cls-02" },
  { name: "Sadia Mumtaz", classId: "cls-02" },
  // cls-03 — Accounting Foundation
  { name: "Zainab Farooq", classId: "cls-03" },
  { name: "Umar Farooq", classId: "cls-03" },
  { name: "Nimra Shahid", classId: "cls-03" },
  { name: "Bilal Aslam", classId: "cls-03" },
  { name: "Sana Tariq", classId: "cls-03" },
  { name: "Kamran Ali", classId: "cls-03" },
  { name: "Rabia Iqbal", classId: "cls-03" },
  { name: "Junaid Khan", classId: "cls-03" },
  { name: "Maryam Aziz", classId: "cls-03" },
  { name: "Fahad Mirza", classId: "cls-03" },
  { name: "Ayesha Siddiqui", classId: "cls-03" },
  { name: "Owais Riaz", classId: "cls-03" },
  // cls-04 — Full-Stack Intensive
  { name: "Maryam Siddiqui", classId: "cls-04" },
  { name: "Hassan Ali", classId: "cls-04" },
  { name: "Sana Aslam", classId: "cls-04" },
  { name: "Abdul Rehman", classId: "cls-04" },
  { name: "Zoya Khan", classId: "cls-04" },
  { name: "Tariq Aziz", classId: "cls-04" },
  { name: "Hira Aslam", classId: "cls-04" },
  { name: "Musa Idrees", classId: "cls-04" },
];

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");
}

function phone(i: number): string {
  const base = 3000000000 + i * 1111111;
  return `+92 ${String(base).slice(0, 3)} ${String(base).slice(3, 6)}${String(base).slice(6, 10)}`;
}

export const students: Student[] = SEEDS.map((seed, i): Student => {
  const n = i + 1;
  // Keep one deactivated record for status variety in the directory filters.
  const status: Student["status"] = n === 7 ? "inactive" : "active";
  return {
    id: `std-${String(n).padStart(2, "0")}`,
    rollNumber: `FA26-${String(n).padStart(3, "0")}`,
    name: seed.name,
    email: `${slug(seed.name)}@student.pakmillat.edu.pk`,
    phone: phone(n),
    guardianName: `Mr. ${seed.name.split(" ").slice(-1)[0]}`,
    guardianPhone: phone(n + 50),
    classId: seed.classId,
    admissionDate: `2026-01-${String((n % 28) + 1).padStart(2, "0")}`,
    status,
  };
});
