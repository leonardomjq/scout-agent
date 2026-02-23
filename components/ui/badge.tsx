import { cn } from "@/lib/utils";

const variantClasses = {
  default:
    "bg-surface-elevated text-text-muted border-border",
  success:
    "bg-signal-high/10 text-signal-high border-signal-high/30",
  warning:
    "bg-signal-medium/10 text-signal-medium border-signal-medium/30",
  danger:
    "bg-accent-red/10 text-accent-red border-accent-red/30",
  info:
    "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
} as const;

const shapeClasses = {
  pill: "rounded-full px-2.5 py-0.5",
  tag: "rounded-sm px-2 py-0.5",
} as const;

const baseClasses = "text-xs font-mono border inline-flex items-center gap-1";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantClasses;
  shape?: keyof typeof shapeClasses;
  ref?: React.Ref<HTMLSpanElement>;
}

export function Badge({
  variant = "default",
  shape = "tag",
  className,
  ref,
  ...props
}: BadgeProps) {
  return (
    <span
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], shapeClasses[shape], className)}
      {...props}
    />
  );
}
