import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
}

export default function Card({ children, className = "", hover = false, padding = "p-8" }: CardProps) {
  return (
    <div
      className={`bg-[#141C2E] border border-[#1F2A3D] rounded-3xl shadow-sm ${padding} ${hover ? "transition-shadow hover:shadow-md cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
