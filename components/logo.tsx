import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-xl",
} as const;

interface LogoProps {
  size?: keyof typeof sizeClasses;
  href?: string;
  className?: string;
}

export function Logo({ size = "sm", href, className }: LogoProps) {
  const inner = (
    <span
      className={cn(
        "font-mono tracking-widest text-text",
        sizeClasses[size],
        className
      )}
    >
      scout<span className="text-accent">_</span>
      <span className="text-text-dim">daily</span>
    </span>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  return inner;
}
