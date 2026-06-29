import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-white text-[#0A0F1C] hover:bg-[#E6EAF2] active:bg-[#C8CDD8]",
  outline: "border border-[#1F2A3D] text-[#C8CDD8] hover:bg-[#1F2A3D] hover:text-[#E6EAF2]",
  ghost: "text-[#C8CDD8] hover:bg-white/8",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled,
  type = "button",
  className = "",
  children,
  fullWidth = false,
}: ButtonProps) {
  const base = `inline-flex items-center justify-center rounded-2xl font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {children}
    </button>
  );
}
