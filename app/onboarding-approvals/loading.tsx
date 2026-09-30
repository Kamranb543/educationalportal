import { CardSkeletonGrid } from "@/components/ui/skeletons";

export default function OnboardingApprovalsLoading() {
  return (
    <div className="space-y-5">
      <div className="emp-skeleton h-8 w-64 rounded-md" />
      <CardSkeletonGrid count={3} cols="grid-cols-1" />
    </div>
  );
}
