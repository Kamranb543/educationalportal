import { config } from "@/lib/config";

/**
 * Interim section shell for directories/feature pages whose full UI is built in
 * Phase 5. Renders dynamic branding/terminology so the shell is demonstrable now.
 */
export function SectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-primary">{title}</h1>
        <p className="mt-1 text-sm text-secondary">{description}</p>
      </div>
      <div className="rounded-xl border border-dashed border-muted bg-card p-8 text-center">
        <p className="text-sm text-secondary">
          {config.identity.shortName} module — full interface arrives in Phase 5.
        </p>
      </div>
    </section>
  );
}
