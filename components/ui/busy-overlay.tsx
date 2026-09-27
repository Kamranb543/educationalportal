"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Returns a short-lived `busy` flag that flips true whenever any of the given
 * dependencies change (search/filter updates), so tables can flash a shimmer
 * overlay for responsive feedback. Cleared after ~250ms.
 */
export function useFilterBusy(deps: unknown[]): boolean {
  const [busy, setBusy] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setBusy(true);
    const t = setTimeout(() => setBusy(false), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run on any dep change
  }, deps);

  return busy;
}

/** Dims content and overlays shimmer rows while `busy`. */
export function BusyOverlay({
  busy,
  children,
  rows = 4,
}: {
  busy: boolean;
  children: ReactNode;
  rows?: number;
}) {
  return (
    <div className="relative">
      <div className={`transition-opacity duration-200 ease-in-out ${busy ? "opacity-40" : "opacity-100"}`}>
        {children}
      </div>
      {busy && (
        <div className="emp-fade absolute inset-0 flex flex-col justify-start gap-3 px-4 py-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="emp-skeleton h-4 rounded-md" />
          ))}
        </div>
      )}
    </div>
  );
}
