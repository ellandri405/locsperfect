import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "light" | "whatsapp";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-white hover:bg-forest-deep",
  secondary: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white",
  ghost: "text-ink hover:bg-mist",
  light: "bg-white text-forest hover:bg-mist",
  whatsapp: "bg-whatsapp text-white hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-12 px-6 py-2.5 text-[0.9375rem]",
  lg: "min-h-14 px-7 py-3 text-base sm:px-8",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  /** Affiche une flèche animée au survol. */
  arrow?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & {
    href?: undefined;
    loading?: boolean;
  };

type LinkProps = CommonProps & {
  href: string;
  /** Lien externe : ouvert dans un nouvel onglet. */
  external?: boolean;
  "aria-label"?: string;
  onClick?: () => void;
};

function classes({ variant = "primary", size = "md", className }: CommonProps) {
  return cn(
    // Le texte peut passer sur deux lignes sur les très petits écrans plutôt que de déborder.
    "group inline-flex max-w-full items-center justify-center gap-2 rounded-full text-center leading-tight font-semibold",
    "transition-[background-color,color,border-color,transform,filter] duration-300 ease-soft active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
}

function Content({ arrow, icon, children }: Pick<CommonProps, "arrow" | "icon" | "children">) {
  return (
    <>
      {icon}
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 ease-soft group-hover:translate-x-1"
        />
      )}
    </>
  );
}

export function Button(props: ButtonProps | LinkProps) {
  if (props.href !== undefined) {
    const { href, external, variant, size, arrow, icon, className, children, ...rest } = props;
    const cls = classes({ variant, size, className, children });
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
          <Content arrow={arrow} icon={icon}>
            {children}
          </Content>
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        <Content arrow={arrow} icon={icon}>
          {children}
        </Content>
      </Link>
    );
  }

  const { variant, size, arrow, icon, className, children, loading, disabled, type, ...rest } = props;
  return (
    <button
      type={type ?? "button"}
      className={classes({ variant, size, className, children })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-[lp-spin_0.8s_linear_infinite] rounded-full border-2 border-current border-t-transparent"
          />
          <span>{children}</span>
        </>
      ) : (
        <Content arrow={arrow} icon={icon}>
          {children}
        </Content>
      )}
    </button>
  );
}
