import { ChevronDown } from "lucide-react";
import { useId,type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  /** Ajoute « (facultatif) » au libellé. */
  optional?: boolean;
  className?: string;
}

const control =
  "w-full rounded-2xl border bg-white px-4 text-base text-ink placeholder:text-silver transition-[border-color,box-shadow] duration-200 " +
  "hover:border-charcoal focus:border-forest focus:shadow-[0_0_0_3px_var(--lp-mist)] focus:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-mist disabled:opacity-60";

function Shell({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-charcoal"> (facultatif)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-charcoal">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function aria(id: string, hint?: string, error?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  };
}

const border = (error?: string) => (error ? "border-error" : "border-silver");

export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  ...props
}: FieldShellProps & Omit<ComponentPropsWithoutRef<"input">, "className">) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input id={id} className={cn(control, "h-13", border(error))} {...aria(id, hint, error)} {...props} />
    </Shell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  optional,
  className,
  ...props
}: FieldShellProps & Omit<ComponentPropsWithoutRef<"textarea">, "className">) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={id}
        rows={4}
        className={cn(control, "resize-y py-3", border(error))}
        {...aria(id, hint, error)}
        {...props}
      />
    </Shell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  className,
  children,
  ...props
}: FieldShellProps & Omit<ComponentPropsWithoutRef<"select">, "className">) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="relative">
        <select
          id={id}
          className={cn(control, "h-13 appearance-none pr-11", border(error))}
          {...aria(id, hint, error)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-charcoal"
        />
      </div>
    </Shell>
  );
}
