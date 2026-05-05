type Variant = "blue" | "neutral" | "green" | "amber";

interface BadgeProps {
  label: string;
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  blue: "bg-[#002452]/10 text-[#002452]",
  neutral: "bg-[#f5f4f0] text-slate-600 border border-[#ddd7cc]",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
};

export default function Badge({ label, variant = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {label}
    </span>
  );
}
