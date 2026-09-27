import { StatSkeletonRow, TableSkeleton } from "@/components/ui/skeletons";

export default function FinanceLoading() {
  return (
    <div className="space-y-5">
      <div className="emp-skeleton h-8 w-64 rounded-md" />
      <StatSkeletonRow count={4} />
      <div className="emp-skeleton h-12 w-full rounded-xl" />
      <TableSkeleton rows={7} cols={6} />
    </div>
  );
}
