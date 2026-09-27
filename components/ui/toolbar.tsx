"use client";

/** Reusable directory toolbar: search + selects + optional actions. */
export function Toolbar({
  search,
  onSearch,
  searchPlaceholder = "Search…",
  filters,
  actions,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-muted bg-card p-3 shadow-sm">
      {onSearch && (
        <div className="relative min-w-[220px] flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
          >
            <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search ?? ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full rounded-lg border border-muted bg-card py-2 pl-9 pr-3 text-sm text-primary outline-none focus:border-accent"
          />
        </div>
      )}
      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
}

export function FilterSelect({
  id,
  ariaLabel,
  value,
  onChange,
  options,
}: {
  id: string;
  ariaLabel: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-muted bg-card px-3 py-2 text-sm text-primary outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-secondary">
        {label}
      </td>
    </tr>
  );
}
