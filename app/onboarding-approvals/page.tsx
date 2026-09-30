import { RequireRoute } from "@/components/auth/require-permission";
import { OnboardingApprovalsManager } from "@/components/directories/onboarding-approvals-manager";

export default function OnboardingApprovalsPage() {
  return (
    <RequireRoute href="/onboarding-approvals">
      <OnboardingApprovalsManager />
    </RequireRoute>
  );
}
