"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shell/section-header";
import { PanelCard, StatusBadge } from "@/components/ui/primitives";
import { TokenGeneratorModal } from "@/components/modals/token-generator-modal";
import { HasPermission } from "@/components/auth/has-permission";
import { config, terminology } from "@/lib/config";
import { formatCurrency } from "@/data";
import { useAuth } from "@/lib/auth/auth-context";
import { useStore } from "@/lib/store/store-context";
import type { OnboardingApplication } from "@/types";

/** Admin queue: issue/revoke tokens and review onboarding submissions. */
export function OnboardingApprovalsManager() {
  const store = useStore();
  const [genOpen, setGenOpen] = useState(false);

  const pending = useMemo(
    () => store.applications.filter((a) => a.status === "pending"),
    [store.applications],
  );
  const reviewed = useMemo(
    () => store.applications.filter((a) => a.status !== "pending"),
    [store.applications],
  );
  const activeTokens = useMemo(
    () => store.tokens.filter((t) => t.status === "active"),
    [store.tokens],
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Onboarding Approvals"
        description={`${pending.length} pending application(s) · ${activeTokens.length} active token(s)`}
        action={
          <HasPermission allow="manageOnboarding">
            <button
              type="button"
              onClick={() => setGenOpen(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
              style={{ background: "var(--app-accent)" }}
            >
              + Generate Token
            </button>
          </HasPermission>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <PanelCard title="Pending Applications" description="Review and assign before approving">
          {pending.length === 0 ? (
            <p className="rounded-lg border border-dashed border-muted px-4 py-6 text-center text-sm text-secondary">
              No pending applications.
            </p>
          ) : (
            <ul className="space-y-3">
              {pending.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard title="Invitation Tokens" description="Active, used, and revoked codes">
          <ul className="divide-y divide-muted">
            {store.tokens.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-primary">{t.code}</p>
                  <p className="text-xs capitalize text-secondary">
                    {t.role === "teacher" ? terminology.teacherLabel : terminology.studentLabel}
                    {t.offeredSalary ? ` · ${formatCurrency(t.offeredSalary)}/mo` : ""}
                    {t.feeDiscount ? ` · ${formatCurrency(t.feeDiscount)} off` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <HasPermission allow="manageOnboarding">
                    {t.status === "active" && (
                      <button
                        type="button"
                        onClick={() => {
                          store.revokeInviteToken(t.id);
                          toast.success("Token revoked", { description: t.code });
                        }}
                        className="rounded-md border border-muted px-2 py-1 text-xs font-medium text-secondary hover:bg-muted"
                      >
                        Revoke
                      </button>
                    )}
                    {t.status !== "active" && (
                      <button
                        type="button"
                        onClick={() => {
                          store.deleteInviteToken(t.id);
                          toast.success("Token deleted", { description: t.code });
                        }}
                        className="rounded-md border border-muted px-2 py-1 text-xs font-medium text-secondary hover:bg-muted"
                      >
                        Delete
                      </button>
                    )}
                  </HasPermission>
                </div>
              </li>
            ))}
            {store.tokens.length === 0 && (
              <li className="py-6 text-center text-sm text-secondary">No tokens issued yet.</li>
            )}
          </ul>
        </PanelCard>
      </div>

      {reviewed.length > 0 && (
        <PanelCard title="Decision History" description="Previously approved or rejected submissions">
          <ul className="divide-y divide-muted">
            {reviewed.map((app) => (
              <li key={app.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-primary">{app.name}</p>
                  <p className="text-xs text-secondary">
                    {app.email} · {app.tokenCode}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </li>
            ))}
          </ul>
        </PanelCard>
      )}

      <TokenGeneratorModal open={genOpen} onClose={() => setGenOpen(false)} />
    </div>
  );
}

/** One pending application with inline class/subject assignment and approve/reject. */
function ApplicationCard({ application }: { application: OnboardingApplication }) {
  const store = useStore();
  const { currentUser } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [classId, setClassId] = useState("");
  const [courseIds, setCourseIds] = useState<string[]>([]);

  const isTeacher = application.role === "teacher";

  function toggleCourse(id: string) {
    setCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function approve() {
    if (!classId) {
      toast.error("Select a class", {
        description: `Choose the ${terminology.classLabel.toLowerCase()} this ${isTeacher ? terminology.teacherLabel.toLowerCase() : terminology.studentLabel.toLowerCase()} joins.`,
      });
      return;
    }
    if (isTeacher && courseIds.length === 0) {
      toast.error("Assign at least one subject", {
        description: "Select the subjects this teacher will deliver.",
      });
      return;
    }
    store.approveApplication(
      application.id,
      { classId: classId || null, courseIds },
      currentUser?.id ?? "usr-01",
    );
    toast.success("Application approved", {
      description: `${application.name} onboarded and a login account was created`,
    });
  }

  return (
    <li className="rounded-lg border border-muted p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">{application.name}</p>
          <p className="text-xs text-secondary">{application.email}</p>
          <p className="mt-1 text-xs text-secondary">
            {isTeacher ? terminology.teacherLabel : terminology.studentLabel} · token{" "}
            <span className="font-mono">{application.tokenCode}</span>
          </p>
        </div>
        <StatusBadge status="pending" />
      </div>
      <div className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-xs text-secondary">
        {isTeacher ? (
          <>
            <p>
              Qualification: <span className="text-primary">{application.qualification}</span>
            </p>
            <p>
              Offered salary:{" "}
              <span className="text-primary">
                {application.offeredSalary ? `${formatCurrency(application.offeredSalary)}/mo` : "—"}
              </span>
            </p>
          </>
        ) : (
          <p>
            Fee concession:{" "}
            <span className="text-primary">
              {application.feeDiscount ? formatCurrency(application.feeDiscount) : "—"}
            </span>
          </p>
        )}
        {application.contractNotes && <p className="mt-1 italic">{application.contractNotes}</p>}
      </div>

      {!expanded ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-card hover:opacity-90"
          >
            Approve &amp; Assign
          </button>
          <button
            type="button"
            onClick={() => {
              store.rejectApplication(application.id, currentUser?.id ?? "usr-01");
              toast.success("Application rejected", { description: application.name });
            }}
            className="rounded-lg border border-muted px-3 py-2 text-sm font-medium text-secondary hover:bg-muted"
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <label className="block text-xs text-secondary">
            {isTeacher
              ? `Assign subjects within ${terminology.classLabel}`
              : `Enroll in ${terminology.classLabel}`}
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setCourseIds([]);
              }}
              className="mt-1 w-full rounded-lg border border-muted bg-card px-3 py-2 text-sm text-primary focus:border-accent"
            >
              <option value="">Select {terminology.classLabel}</option>
              {store.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {isTeacher && (
            <div className="rounded-lg border border-muted p-2">
              <p className="mb-2 text-xs font-medium text-secondary">
                Assign {terminology.courseLabel}s
              </p>
              {classId ? (
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {store
                    .getClassById(classId)
                    ?.courseIds.map((cid) => store.getCourseById(cid))
                    .filter((c): c is NonNullable<typeof c> => Boolean(c))
                    .map((c) => (
                      <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={courseIds.includes(c.id)}
                          onChange={() => toggleCourse(c.id)}
                          className="h-4 w-4 accent-[var(--app-accent)]"
                        />
                        <span className="text-primary">{c.title}</span>
                      </label>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-secondary">Pick a {terminology.classLabel.toLowerCase()} first to see its subjects.</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={approve}
              className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-card hover:opacity-90"
            >
              Confirm Approval
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-lg border border-muted px-3 py-2 text-sm font-medium text-secondary hover:bg-muted"
            >
              Cancel
            </button>
          </div>
          <p className="text-[11px] text-secondary">
            Approving creates an active {isTeacher ? terminology.teacherLabel.toLowerCase() : terminology.studentLabel.toLowerCase()} record and a login account ({config.identity.shortName} default password).
          </p>
        </div>
      )}
    </li>
  );
}
