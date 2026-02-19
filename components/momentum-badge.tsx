import { ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface MomentumBadgeProps {
  score: number;
  direction: "accelerating" | "decelerating" | "new";
}

const directionVariant: Record<string, BadgeProps["variant"]> = {
  accelerating: "success",
  decelerating: "danger",
  new: "warning",
};

const directionIcon: Record<string, typeof ArrowUp> = {
  accelerating: ArrowUp,
  decelerating: ArrowDown,
  new: Sparkles,
};

const directionLabel: Record<string, string> = {
  accelerating: "Accelerating",
  decelerating: "Decelerating",
  new: "New",
};

export function MomentumBadge({ score, direction }: MomentumBadgeProps) {
  const Icon = directionIcon[direction];
  return (
    <Badge variant={directionVariant[direction]} shape="pill">
      <Icon className="size-3" /> {Math.round(score * 100)}%
    </Badge>
  );
}
