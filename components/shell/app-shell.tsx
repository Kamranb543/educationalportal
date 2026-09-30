"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { useAuth } from "@/lib/auth/auth-context";

/** Unauthenticated surfaces: sign-in page and token redemption (onboarding). */
const PUBLIC_PATHS = ["/login", "/onboard"];

/**
 * Application frame + session gate. Authenticated users get the Sidebar/Header
 * shell; public routes render bare; unauthenticated users are redirected to
 * /login. This protects the entire shell surface (all non-public routes).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && !isPublic) router.replace("/login");
    if (isAuthenticated && pathname === "/login") router.replace("/");
  }, [hydrated, isAuthenticated, isPublic, pathname, router]);

  // Bounce the wrong session state without flashing the underlying page.
  if (!hydrated) return null;
  if (isPublic) return isAuthenticated ? null : <>{children}</>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
