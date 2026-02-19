import Link from "next/link";

interface SectionCtaProps {
  text: string;
  href?: string;
  variant?: "primary" | "secondary";
}

export function SectionCta({
  text,
  href = "/signup",
  variant = "primary",
}: SectionCtaProps) {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-1 font-mono text-sm text-landing-signal border-b border-landing-signal/50 pb-0.5 hover:border-landing-signal transition-colors"
      >
        {text}
        <span aria-hidden>&rarr;</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center font-mono text-sm font-medium bg-landing-signal text-[#0A0A0A] px-6 py-2.5 rounded hover:opacity-90 transition-opacity"
    >
      {text}
    </Link>
  );
}
