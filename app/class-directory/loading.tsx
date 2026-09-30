import { CardSkeletonGrid } from "@/components/ui/skeletons";

export default function ClassDirectoryLoading() {
  return (
    <div className="space-y-5">
      <div className="emp-skeleton h-8 w-56 rounded-md" />
      <div className="emp-skeleton h-12 w-full rounded-xl" />
      <CardSkeletonGrid count={4} cols="lg:grid-cols-2" />
    </div>
  );
}
