"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-lg border bg-card px-3 py-2 text-sm text-primary outline-none transition-colors focus:border-accent";

function fieldClass(error?: string) {
  return `${base} ${error ? "border-primary" : "border-muted"}`;
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-secondary">
      {children}
    </label>
  );
}

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-primary">{error}</p>;
}

export function TextField({
  id,
  label,
  error,
  prefix,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  /** Currency symbol prefix, e.g. config.currencySymbol. */
  prefix?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={`${fieldClass(error)} ${prefix ? "pl-10" : ""}`}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      </div>
      <ErrorText error={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={fieldClass(error)} aria-invalid={error ? true : undefined} {...props}>
        {children}
      </select>
      <ErrorText error={error} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <textarea id={id} className={`${fieldClass(error)} min-h-[72px]`} aria-invalid={error ? true : undefined} {...props} />
      <ErrorText error={error} />
    </div>
  );
}

export function ModalActions({
  onCancel,
  submitLabel,
  disabled,
  form,
}: {
  onCancel: () => void;
  submitLabel: string;
  disabled?: boolean;
  form?: string;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-muted px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
      >
        Cancel
      </button>
      <button
        type="submit"
        form={form}
        disabled={disabled}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </div>
  );
}
