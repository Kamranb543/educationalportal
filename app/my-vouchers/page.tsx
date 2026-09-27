import { RequireRoute } from "@/components/auth/require-permission";
import { MyVouchersManager } from "@/components/finance/my-vouchers-manager";

export default function MyVouchersPage() {
  return (
    <RequireRoute href="/my-vouchers">
      <MyVouchersManager />
    </RequireRoute>
  );
}
