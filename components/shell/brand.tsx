import { config } from "@/lib/config";
import { resolveColor } from "@/lib/theme";

/**
 * Config-driven brand mark. Renders an inline SVG monogram from
 * `identity.shortName` tinted with `branding.colors`, so the shell never
 * hardcodes the institution name or colors.
 */
export function BrandMark({ size = 40 }: { size?: number }) {
  const bg = resolveColor(config.branding.sidebar.backgroundColor);
  const fg = resolveColor("card");
  const accent = resolveColor("accent");
  const initials = config.identity.shortName.slice(0, 2).toUpperCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={config.identity.name}
    >
      <rect width="48" height="48" rx="10" fill={bg} />
      <rect x="34" y="6" width="8" height="8" rx="2" fill={accent} />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill={fg}
      >
        {initials}
      </text>
    </svg>
  );
}

export function BrandIdentity() {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <BrandMark size={40} />
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="truncate font-semibold tracking-tight">
          {config.identity.name}
        </span>
        <span className="truncate text-xs opacity-70">{config.identity.tagline}</span>
      </div>
    </div>
  );
}
