import { SectionHeader } from "@/components/shell/section-header";
import { PanelCard } from "@/components/ui/primitives";
import { RequireRoute } from "@/components/auth/require-permission";
import { config } from "@/lib/config";
import { resolveColor } from "@/lib/theme";
import type { ThemeColorKey } from "@/institution.config";
import type { ReactNode } from "react";

const THEME_ORDER: { key: ThemeColorKey; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "card", label: "Card" },
  { key: "muted", label: "Muted" },
];

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-muted py-2.5 last:border-0">
      <dt className="text-sm text-secondary">{label}</dt>
      <dd className="text-right text-sm font-medium text-primary">{value}</dd>
    </div>
  );
}

function EnabledPill({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        on ? "bg-accent/10 text-accent" : "bg-muted text-secondary"
      }`}
    >
      {on ? "Enabled" : "Disabled"}
    </span>
  );
}

export default function SettingsPage() {
  const { identity, localization, terminology, branding, enabledModules } = config;

  return (
    <RequireRoute href="/settings">
      <div className="space-y-5">
        <SectionHeader
          title="Settings"
          description={`Active configuration for ${identity.name} — loaded from institution.config.ts`}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <PanelCard title="Institution Identity">
            <dl>
              <Row label="Name" value={identity.name} />
              <Row label="Short Name" value={identity.shortName} />
              <Row label="Type" value={identity.type} />
              <Row label="Tagline" value={identity.tagline} />
              <Row label="Owner" value={identity.ownerName} />
              <Row label="Email" value={identity.contactEmail} />
              <Row label="Phone" value={identity.contactPhone} />
              <Row label="Address" value={identity.address} />
            </dl>
          </PanelCard>

          <div className="space-y-5">
            <PanelCard title="Localization">
              <dl>
                <Row label="Currency Symbol" value={localization.currencySymbol} />
                <Row label="Currency Code" value={localization.currencyCode} />
                <Row label="Date Format" value={localization.dateFormat} />
                <Row label="Timezone" value={localization.timezone} />
              </dl>
            </PanelCard>

            <PanelCard title="Terminology">
              <dl>
                <Row label="Student Label" value={terminology.studentLabel} />
                <Row label="Teacher Label" value={terminology.teacherLabel} />
                <Row label="Class Label" value={terminology.classLabel} />
                <Row label="Course Label" value={terminology.courseLabel} />
              </dl>
            </PanelCard>
          </div>

          <PanelCard title="Branding & Theme">
            <dl className="mb-4">
              <Row label="Theme Mode" value={<span className="capitalize">{branding.themeMode}</span>} />
              <Row label="Sidebar Variant" value={<span className="capitalize">{branding.sidebar.variant}</span>} />
            </dl>
            <div className="grid grid-cols-3 gap-3">
              {THEME_ORDER.map(({ key, label }) => {
                const hex = resolveColor(key);
                return (
                  <div key={key} className="rounded-lg border border-muted p-2">
                    <div
                      className="h-10 w-full rounded-md border border-muted"
                      style={{ background: hex }}
                    />
                    <p className="mt-1.5 text-xs font-medium text-primary">{label}</p>
                    <p className="font-mono text-[10px] uppercase text-secondary">{hex}</p>
                  </div>
                );
              })}
            </div>
          </PanelCard>

          <PanelCard title="Enabled Modules">
            <dl>
              {Object.entries(enabledModules).map(([key, on]) => (
                <Row
                  key={key}
                  label={key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                  value={<EnabledPill on={on} />}
                />
              ))}
            </dl>
          </PanelCard>
        </div>

        <p className="text-xs text-secondary">
          All branding, nomenclature, currency, and active modules derive from
          institution.config.ts — edit that file (or the future backend) to rebrand the
          portal without touching components.
        </p>
      </div>
    </RequireRoute>
  );
}
