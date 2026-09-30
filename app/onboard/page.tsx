"use client";

import { useState } from "react";
import Link from "next/link";
import { config, terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { BrandMark } from "@/components/shell/brand";
import { TextField } from "@/components/ui/form-fields";
import { applicationSchema, fieldErrors, type ApplicationFormValues } from "@/lib/forms/schemas";
import { useStore } from "@/lib/store/store-context";
import type { InviteToken } from "@/types";

const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;

/** Public token redemption: validate an invite code, then submit registration. */
export default function OnboardPage() {
  const store = useStore();
  const [code, setCode] = useState("");
  const [token, setToken] = useState<InviteToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function validate(e: React.FormEvent) {
    e.preventDefault();
    const match = store.findToken(code);
    if (!match) {
      setError("This invitation code is invalid or already used.");
      return;
    }
    const expired = new Date(match.expiresAt) < new Date();
    if (expired) {
      setError("This invitation code has expired.");
      return;
    }
    setError(null);
    setToken(match);
  }

  function finish() {
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-muted bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark size={52} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-primary">Accept Invitation</h1>
            <p className="mt-1 text-sm text-secondary">
              Redeem your {config.identity.shortName} onboarding token
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="mt-7 space-y-4 text-center">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm font-semibold text-primary">Application submitted</p>
              <p className="mt-1 text-xs text-secondary">
                An administrator will review and approve your registration. You&apos;ll get portal
                access once approved.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-card hover:opacity-90"
            >
              Back to Sign In
            </Link>
          </div>
        ) : !token ? (
          <form onSubmit={validate} className="mt-7 space-y-4">
            <div>
              <label htmlFor="ob-code" className="mb-1 block text-xs font-medium text-secondary">
                Invitation Code
              </label>
              <input
                id="ob-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
                placeholder="TCH-8921 / STU-4410"
                className="w-full rounded-lg border border-muted bg-card px-3 py-2 text-sm font-mono uppercase text-primary outline-none focus:border-accent"
              />
              {error && (
                <p role="alert" className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-card hover:opacity-90"
            >
              Verify Token
            </button>
            <p className="text-center text-xs text-secondary">
              Already registered?{" "}
              <Link href="/login" className="font-medium text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <ApplicantForm token={token} onDone={finish} />
        )}
      </div>
    </div>
  );
}

function ApplicantForm({ token, onDone }: { token: InviteToken; onDone: () => void }) {
  const store = useStore();
  const [values, setValues] = useState<Partial<ApplicationFormValues>>({
    name: "",
    email: "",
    phone: "",
    qualification: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function set<K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const isTeacher = token.role === "teacher";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name || !values.email || !values.phone) {
      setSubmitError("Name, email, and phone are required.");
      return;
    }
    if (!PHONE_RE.test(values.phone)) {
      setSubmitError("Enter a valid phone number.");
      return;
    }
    const parsed = applicationSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitError(null);
    store.submitApplication(token.code, {
      role: token.role,
      name: values.name!.trim(),
      email: values.email!.trim(),
      phone: values.phone!.trim(),
      qualification: values.qualification?.trim() || "—",
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
      {/* Locked contract terms */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Agreed Terms (locked)
        </p>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-secondary">Role</dt>
            <dd className="font-medium text-primary">
              {isTeacher ? terminology.teacherLabel : terminology.studentLabel}
            </dd>
          </div>
          {isTeacher ? (
            <div className="flex justify-between">
              <dt className="text-secondary">Offered Salary</dt>
              <dd className="font-medium text-primary">
                {token.offeredSalary ? `${formatCurrency(token.offeredSalary)}/mo` : "—"}
              </dd>
            </div>
          ) : (
            <div className="flex justify-between">
              <dt className="text-secondary">Fee Concession</dt>
              <dd className="font-medium text-primary">
                {token.feeDiscount ? formatCurrency(token.feeDiscount) : "—"}
              </dd>
            </div>
          )}
        </dl>
        {token.contractNotes && (
          <p className="mt-2 text-xs italic text-secondary">{token.contractNotes}</p>
        )}
      </div>

      <TextField id="ob-name" label="Full Name" value={values.name ?? ""} error={errors.name} onChange={(e) => set("name", e.target.value)} />
      <TextField id="ob-email" label="Email" type="email" value={values.email ?? ""} error={errors.email} onChange={(e) => set("email", e.target.value)} />
      <TextField id="ob-phone" label="Phone" value={values.phone ?? ""} error={errors.phone} onChange={(e) => set("phone", e.target.value)} />
      <TextField
        id="ob-qual"
        label={isTeacher ? "Highest Qualification" : "Last Education / Grade"}
        value={values.qualification ?? ""}
        error={errors.qualification}
        onChange={(e) => set("qualification", e.target.value)}
      />

      {submitError && (
        <p role="alert" className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-card hover:opacity-90"
      >
        Submit for Approval
      </button>
    </form>
  );
}
