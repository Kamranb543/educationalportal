"use client";

import Link from "next/link";
import { config } from "@/lib/config";
import { roleLabel, useAuth } from "@/lib/auth/auth-context";

export function AccessDenied({ href }: { href?: string }) {
  const { currentRole } = useAuth();
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "var(--app-muted)", color: "var(--app-secondary)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-primary">Unauthorized Access</h1>
        <p className="mt-1 max-w-md text-sm text-secondary">
          The{" "}
          <span className="font-medium text-primary">
            {roleLabel(currentRole)}
          </span>{" "}
          role is not permitted to view
          {href ? (
            <>
              {" "}
              <code className="rounded bg-black/[0.05] px-1 py-0.5 text-xs">
                {href}
              </code>
            </>
          ) : (
            " this resource"
          )}{" "}
          in {config.identity.shortName}.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-full px-4 py-2 text-sm font-medium text-card"
        style={{ background: "var(--app-primary)" }}
      >
        Back to Dashboard
      </Link>
    </section>
  );
}
