import { TableSkeleton } from "@/components/ui/skeletons";

export default function SubjectsLoading() {
  return (
    <div className="space-y-5">
      <div className="emp-skeleton h-8 w-56 rounded-md" />
      <div className="emp-skeleton h-12 w-full rounded-xl" />
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
