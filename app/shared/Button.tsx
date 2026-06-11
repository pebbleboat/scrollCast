import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-[0_8px_16px_-4px_rgba(91,91,246,0.4)] hover:bg-indigo-500",
  secondary:
    "border border-[#2a2a33] text-zinc-200 hover:bg-[#16161c]",
  ghost:
    "border border-[#2a2a33] text-zinc-300 hover:bg-[#1a1a21]",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex cursor-pointer items-center justify-center gap-2.5 rounded-lg px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
