import type { ReactNode } from "react";

/** Shared config-token-styled UI primitives for dashboards and directories. */

export function PanelCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-muted bg-card p-5 shadow-sm ${className ?? ""}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-primary">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-secondary">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "accent" | "positive" | "negative";
}) {
  const valueClass =
    tone === "accent"
      ? "text-accent"
      : tone === "positive"
        ? "text-accent"
        : tone === "negative"
          ? "text-primary"
          : "text-primary";
  return (
    <div className="rounded-xl border border-muted bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${valueClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-secondary">{hint}</p>}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  paid: "bg-accent/10 text-accent",
  active: "bg-accent/10 text-accent",
  approved: "bg-accent/10 text-accent",
  present: "bg-accent/10 text-accent",
  partial: "bg-secondary/10 text-secondary",
  processing: "bg-secondary/10 text-secondary",
  pending: "bg-secondary/10 text-secondary",
  late: "bg-secondary/10 text-secondary",
  leave: "bg-muted text-secondary",
  inactive: "bg-muted text-secondary",
  suspended: "bg-muted text-secondary",
  overdue: "bg-primary/10 text-primary",
  absent: "bg-primary/10 text-primary",
  rejected: "bg-primary/10 text-primary",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? "bg-muted text-secondary";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tone}`}
    >
      {status}
    </span>
  );
}

export function ProgressMeter({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const barColor =
    clamped >= 75 ? "bg-accent" : clamped >= 50 ? "bg-secondary" : "bg-primary";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        {label && <span className="text-secondary">{label}</span>}
        <span className="font-semibold text-primary">{clamped}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
