type Variant = "blue" | "neutral" | "green" | "amber";

interface BadgeProps {
  label: string;
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  blue: "bg-white/10 text-[#E6EAF2]",
  neutral: "bg-[#0A0F1C] text-[#C8CDD8] border border-[#1F2A3D]",
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
