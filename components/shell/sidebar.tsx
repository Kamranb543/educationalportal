"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { config } from "@/lib/config";
import { sidebarTheme, readableTextOn } from "@/lib/theme";
import { BrandIdentity } from "@/components/shell/brand";
import { roleLabel, useAuth } from "@/lib/auth/auth-context";
import { filterNavItems } from "@/components/shell/nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const { currentRole } = useAuth();
  const theme = sidebarTheme(config);
  const itemText = readableTextOn(theme.backgroundColor);
  const items = filterNavItems(currentRole);

  return (
    <aside
      className="hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0 lg:h-screen lg:sticky lg:top-0"
      style={{ background: theme.backgroundColor, color: itemText }}
      aria-label="Primary"
    >
      <div className="px-5 py-6 border-b" style={{ borderColor: theme.activeItemColor + "33" }}>
        <BrandIdentity />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
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
      </nav>
      <div className="px-5 py-4 text-xs opacity-60">
        {config.identity.shortName} &middot; {config.localization.currencyCode} &middot;{" "}
        {roleLabel(currentRole)}
      </div>
    </aside>
  );
}
