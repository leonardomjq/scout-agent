import { cn } from "@/lib/utils";

const paddingClasses = {
  compact: "p-4",
  default: "p-5",
  spacious: "p-6",
} as const;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof paddingClasses;
  ref?: React.Ref<HTMLDivElement>;
}

export function Card({
  padding = "default",
  className,
  ref,
  ...props
}: CardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface border border-border rounded-lg",
        paddingClasses[padding],
        className
      )}
      {...props}
    />
  );
}
