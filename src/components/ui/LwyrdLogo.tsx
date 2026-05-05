import Image from "next/image";

interface Props {
  variant?: "navy" | "white" | "black";
  className?: string;
  priority?: boolean;
}

const logoSrcs: Record<NonNullable<Props["variant"]>, string> = {
  navy: "/Logos/LWYRD_Navy.png",
  white: "/Logos/LWYRD_White.png",
  black: "/Logos/LWYRD_Black.png",
};

export default function LwyrdLogo({ variant = "navy", className, priority }: Props) {
  return (
    <Image
      src={logoSrcs[variant]}
      alt="LWYRD"
      width={165}
      height={40}
      className={className}
      style={{ width: "auto" }}
      priority={priority}
    />
  );
}
