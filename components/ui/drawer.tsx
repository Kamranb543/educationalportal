"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * Accessible right-side slide-over drawer with a blurred backdrop. Uses a CSS
 * keyframe for the entrance so the panel mounts only while open (no cascading
 * setState), and an instant unmount on close.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="emp-fade absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="emp-drawer-in relative z-10 flex h-full w-full max-w-md flex-col border-l border-muted bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-muted px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-primary">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-secondary">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-muted px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
