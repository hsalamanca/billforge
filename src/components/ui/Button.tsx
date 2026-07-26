import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-brass text-ink hover:bg-brass-glow border border-brass-deep/30 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset]",
  secondary: "bg-ink text-paper hover:bg-ink-soft border border-ink",
  ghost: "bg-transparent text-ink hover:bg-white/50 border border-line",
  danger: "bg-danger text-white hover:opacity-90 border border-danger",
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-[2px] px-4 py-2.5 text-sm font-semibold tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
