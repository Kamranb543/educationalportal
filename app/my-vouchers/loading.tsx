import { StatSkeletonRow, TableSkeleton } from "@/components/ui/skeletons";

export default function MyVouchersLoading() {
  return (
    <div className="space-y-5">
      <div className="emp-skeleton h-8 w-56 rounded-md" />
      <StatSkeletonRow count={3} />
      <TableSkeleton rows={5} cols={6} />
    </div>
  );
}
