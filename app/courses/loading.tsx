import { CardSkeletonGrid } from "@/components/ui/skeletons";

export default function CoursesLoading() {
  return (
    <div className="space-y-5">
      <div className="emp-skeleton h-8 w-56 rounded-md" />
      <div className="emp-skeleton h-12 w-full rounded-xl" />
      <CardSkeletonGrid count={6} />
    </div>
  );
}
