import type { ReactNode } from "react";

/** Reusable shimmer skeletons (Phase 11). */

function Bone({ className = "" }: { className?: string }) {
  return <div className={`emp-skeleton rounded-md ${className}`} />;
}

export function StatSkeleton() {
  return (
    <div className="rounded-xl border border-muted bg-card p-4 shadow-sm">
      <Bone className="h-3 w-20" />
      <Bone className="mt-2 h-6 w-28" />
      <Bone className="mt-2 h-3 w-16" />
    </div>
  );
}

export function StatSkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-muted bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Bone className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Bone className="h-3.5 w-28" />
          <Bone className="mt-2 h-3 w-20" />
        </div>
      </div>
      <Bone className="mt-4 h-3 w-full" />
      <Bone className="mt-2 h-3 w-4/5" />
      <Bone className="mt-4 h-10 w-full" />
    </div>
  );
}

export function CardSkeletonGrid({ count = 6, cols = "sm:grid-cols-2 xl:grid-cols-3" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-muted bg-card shadow-sm">
      <div className="border-b border-muted bg-muted/40 px-4 py-3">
        <Bone className="h-3 w-40" />
      </div>
      <div className="divide-y divide-muted">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((_, c) => (
              <Bone key={c} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Faint shimmering overlay shown over a table/grid while a filter is applied. */
export function FilterOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="emp-skeleton pointer-events-none absolute inset-0 rounded-xl opacity-0" />
    </div>
  );
}
