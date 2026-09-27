"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { config } from "@/lib/config";
import { BrandMark } from "@/components/shell/brand";

/** Credential-based sign-in (demo: mock accounts match on email + password). */
export default function LoginPage() {
  const { loginWithCredentials } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = loginWithCredentials(email, password);
    if (ok) {
      router.replace("/");
    } else {
      setError("Invalid email or password. Check your credentials and try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-muted bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark size={52} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-primary">
              {config.identity.name}
            </h1>
            <p className="mt-1 text-sm text-secondary">Sign in to the management portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-xs font-medium text-secondary">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="you@pakmillat.edu.pk"
              className="w-full rounded-lg border border-muted bg-card px-3 py-2 text-sm text-primary outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1 block text-xs font-medium text-secondary">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="••••••••"
              className="w-full rounded-lg border border-muted bg-card px-3 py-2 text-sm text-primary outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-card transition-opacity hover:opacity-90"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 rounded-lg border border-dashed border-muted px-4 py-3 text-center text-xs text-secondary">
          Demo credentials — Super Admin{" "}
          <code className="font-mono">{config.identity.contactEmail}</code> /{" "}
          <code className="font-mono">admin123</code>. Other accounts use{" "}
          <code className="font-mono">admin123</code>, <code className="font-mono">teach123</code>, or{" "}
          <code className="font-mono">learn123</code> by role.
        </p>
      </div>
    </div>
  );
}
