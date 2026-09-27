"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { roleLabel, useAuth } from "@/lib/auth/auth-context";
import { resolveColor } from "@/lib/theme";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Minimal authenticated-user badge with a Sign Out action. */
export function AccountMenu() {
  const { currentUser, currentRole, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const accent = resolveColor("accent");
  const muted = resolveColor("muted");
  const card = resolveColor("card");
  const primary = resolveColor("primary");
  const secondary = resolveColor("secondary");

  if (!currentUser) return null;

  function handleSignOut() {
    setOpen(false);
    logout();
    router.replace("/login");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border px-2 py-1.5 text-left transition-colors hover:bg-black/[0.03]"
        style={{ borderColor: muted, background: card, color: primary }}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: accent, color: card }}
        >
          {initials(currentUser.name)}
        </span>
        <span className="hidden sm:flex sm:flex-col sm:leading-tight">
          <span className="max-w-[140px] truncate text-sm font-medium">
            {currentUser.name}
          </span>
          <span className="text-xs" style={{ color: secondary }}>
            {roleLabel(currentRole)}
          </span>
        </span>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden className="opacity-60">
          <path
            d="M6 8l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border shadow-lg"
          style={{ borderColor: muted, background: card, color: primary }}
        >
          <div
            className="border-b px-4 py-3"
            style={{ borderColor: muted, background: resolveColor("background") }}
          >
            <p className="text-sm font-medium text-primary">{currentUser.name}</p>
            <p className="truncate text-xs" style={{ color: secondary }}>
              {currentUser.email}
            </p>
            <p className="mt-1 text-xs" style={{ color: secondary }}>
              {roleLabel(currentRole)}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-black/[0.04]"
            style={{ color: secondary }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M8 15l-4-3 4-3M4 12h9M13 6v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h5a2 2 0 002-2v-1"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
