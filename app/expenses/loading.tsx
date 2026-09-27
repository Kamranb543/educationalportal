import { StatSkeletonRow, TableSkeleton } from "@/components/ui/skeletons";

export default function ExpensesLoading() {
  return (
    <div className="space-y-5">
      <div className="emp-skeleton h-8 w-48 rounded-md" />
      <StatSkeletonRow count={2} />
      <div className="emp-skeleton h-12 w-full rounded-xl" />
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
