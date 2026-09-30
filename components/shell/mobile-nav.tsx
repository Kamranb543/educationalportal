"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { config } from "@/lib/config";
import { sidebarTheme, readableTextOn } from "@/lib/theme";
import { BrandIdentity } from "@/components/shell/brand";
import { roleLabel, useAuth } from "@/lib/auth/auth-context";
import { filterNavGroups } from "@/components/shell/nav-items";

/**
 * Mobile navigation: a hamburger trigger (< lg where the sidebar is hidden)
 * that opens a slide-out sheet with the same grouped, role-filtered links.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { currentRole } = useAuth();
  const [open, setOpen] = useState(false);
  const theme = sidebarTheme(config);
  const itemText = readableTextOn(theme.backgroundColor);
  const groups = filterNavGroups(currentRole);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-muted text-primary transition-colors hover:bg-muted lg:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-in-out lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Slide-out sheet */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col shadow-2xl transition-transform duration-200 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: theme.backgroundColor, color: itemText }}
        aria-hidden={!open}
        aria-label="Mobile navigation"
      >
        <div className="px-5 py-6 border-b" style={{ borderColor: theme.activeItemColor + "33" }}>
          <BrandIdentity />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-50">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out hover:bg-black/10"
                        style={
                          active
                            ? {
                                background: theme.activeItemColor,
                                color: readableTextOn(theme.activeItemColor),
                              }
                            : { color: itemText }
                        }
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs opacity-60">
          {config.identity.shortName} · {roleLabel(currentRole)}
        </div>
      </aside>
    </>
  );
}
