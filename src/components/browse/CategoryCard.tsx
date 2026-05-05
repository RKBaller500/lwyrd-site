import Link from "next/link";
import { LegalCategory } from "@/types";
import * as Icons from "lucide-react";

interface CategoryCardProps {
  category: LegalCategory;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Dynamically resolve the icon from lucide-react
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[category.icon] as React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

  return (
    <Link href={`/services/${category.slug}`}>
      <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm p-7 h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-[#002452]/30 group cursor-pointer">
        {/* Icon box */}
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#002452]/8 border border-[#ddd7cc] mb-5 group-hover:bg-[#002452] group-hover:border-[#002452] transition-colors">
          {IconComponent ? (
            <IconComponent size={20} className="text-[#002452] group-hover:text-white transition-colors" strokeWidth={1.5} />
          ) : (
            <span className="text-[#002452] group-hover:text-white text-sm font-bold transition-colors">{category.name[0]}</span>
          )}
        </div>

        {/* Name */}
        <h3
          className="text-[#002452] text-lg mb-2"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          {category.name}
        </h3>

        {/* Short description */}
        <p className="text-slate-500 text-sm leading-relaxed mb-5">{category.shortDescription}</p>

        {/* Footer row */}
        <div className="flex items-center justify-end">
          <span className="text-xs text-[#002452] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  );
}
