import { CardSkeletonGrid, StatSkeletonRow } from "@/components/ui/skeletons";

export default function ClassDetailLoading() {
  return (
    <div className="space-y-5">
      <div className="emp-skeleton h-8 w-64 rounded-md" />
      <StatSkeletonRow count={4} />
      <CardSkeletonGrid count={2} cols="lg:grid-cols-2" />
    </div>
  );
}
