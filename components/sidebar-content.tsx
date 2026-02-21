"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Bookmark, Activity, Settings, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const links = [
  { href: "/feed", label: "Alpha Feed", icon: Zap },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/pulse", label: "Pulse", icon: Activity, proBadge: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarContentProps {
  onNavigate?: () => void;
  tier?: string;
}

export function SidebarContent({ onNavigate, tier }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <nav className="space-y-1 px-3">
        {links.map((link) => {
          const active =
            link.href === "/feed"
              ? pathname === "/feed" || pathname.startsWith("/alpha")
              : pathname.startsWith(link.href);
          const Icon = link.icon;
          const showProBadge = link.proBadge && (!tier || tier === "free");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                active
                  ? "bg-surface-elevated text-accent-green"
                  : "text-text-muted hover:text-text hover:bg-surface-elevated"
              }`}
            >
              <Icon className="size-4" />
              {link.label}
              {showProBadge && (
                <Badge variant="success" shape="pill" className="text-[9px] px-1.5 py-0 ml-auto">
                  Pro
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA for free users */}
      {(!tier || tier === "free") && (
        <div className="mt-auto px-3 pb-2">
          <Link
            href="/settings"
            onClick={onNavigate}
            className="block rounded-lg bg-accent-green/5 border border-accent-green/20 p-3 transition-colors hover:bg-accent-green/10"
          >
            <div className="flex items-center gap-2 text-accent-green text-sm font-semibold mb-1">
              <Sparkles className="size-3.5" />
              Go Pro
            </div>
            <p className="text-text-muted text-xs">
              Full briefs, blueprints, and trends.
            </p>
            <p className="text-accent-green text-xs font-mono mt-1">
              $24/mo
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}
