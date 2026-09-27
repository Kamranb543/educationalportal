// lib/theme.ts — Resolves branding config into runtime CSS variables & Tailwind tokens.
import {
  defaultInstitutionConfig,
  type InstitutionConfig,
  type ThemeColorKey,
} from "@/institution.config";

/** CSS custom property names injected on the root <html> element. */
export const THEME_VAR = {
  primary: "--app-primary",
  secondary: "--app-secondary",
  accent: "--app-accent",
  background: "--app-background",
  card: "--app-card",
  muted: "--app-muted",
} as const satisfies Record<ThemeColorKey, string>;

const COLOR_KEY_ORDER: ThemeColorKey[] = [
  "primary",
  "secondary",
  "accent",
  "background",
  "card",
  "muted",
];

export type CSSVars = Record<string, string>;

/** Build the `--app-*` variables from `branding.colors` for inline injection. */
export function themeCssVariables(
  config: InstitutionConfig = defaultInstitutionConfig,
): CSSVars {
  const vars: CSSVars = {};
  for (const key of COLOR_KEY_ORDER) {
    vars[THEME_VAR[key]] = config.branding.colors[key];
  }
  return vars;
}

/** Resolve a config color key to its concrete hex value. */
export function resolveColor(
  key: ThemeColorKey,
  config: InstitutionConfig = defaultInstitutionConfig,
): string {
  return config.branding.colors[key];
}

/**
 * Resolve the sidebar surface/text/active colors from `branding.sidebar`,
 * mapping each ThemeColorKey back to its hex value in `branding.colors`.
 */
export function sidebarTheme(config: InstitutionConfig = defaultInstitutionConfig) {
  const { sidebar } = config.branding;
  return {
    variant: sidebar.variant,
    backgroundColor: resolveColor(sidebar.backgroundColor, config),
    textColor: resolveColor(sidebar.textColor, config),
    activeItemColor: resolveColor(sidebar.activeItemColor, config),
  } as const;
}

/** Pick legible foreground text over a given background (naive luminance test). */
export function readableTextOn(hex: string): "#0f172a" | "#f8fafc" {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#f8fafc";
}
