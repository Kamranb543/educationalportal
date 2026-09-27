import { config } from "@/lib/config";
import { resolveColor, sidebarTheme } from "@/lib/theme";
import { BrandMark } from "@/components/shell/brand";
import { MobileNav } from "@/components/shell/mobile-nav";
import { AccountMenu } from "@/components/shell/account-menu";

/**
 * Top app bar. Identity/branding derive from institution.config.ts; the
 * account menu shows the active session user and a Sign Out action.
 */
export function Header() {
  const sidebar = sidebarTheme(config);
  const card = resolveColor("card");
  const onCard = resolveColor("primary");

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 lg:px-6"
      style={{ background: card, borderColor: resolveColor("muted"), color: onCard }}
    >
      {/* Mobile: hamburger nav + compact brand. Desktop: tagline only. */}
      <div className="flex items-center gap-2 lg:hidden">
        <MobileNav />
        <BrandMark size={32} />
        <span className="font-semibold text-sm">{config.identity.shortName}</span>
      </div>

      <div className="hidden lg:block text-sm opacity-80">{config.identity.tagline}</div>

      <div className="flex items-center gap-3">
        <span
          className="hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: sidebar.activeItemColor, color: card }}
        >
          {config.identity.type}
        </span>
        <AccountMenu />
      </div>
    </header>
  );
}
