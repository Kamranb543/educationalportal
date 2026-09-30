import { redirect } from "next/navigation";

// Master subject management moved to /subjects; deprecated here (Phase 12).
export default function CoursesRedirect() {
  redirect("/subjects");
}
