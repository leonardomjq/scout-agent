"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Settings, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dropdownMenu } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: { email: string; name?: string } | null;
  tier?: string;
}

function getInitials(user: { email: string; name?: string } | null): string {
  if (!user) return "?";
  if (user.name) return user.name[0].toUpperCase();
  return (user.email[0] ?? "?").toUpperCase();
}

export function UserMenu({ user, tier }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="font-mono text-xs text-text-muted hover:text-text transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const initial = getInitials(user);

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="size-8 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center text-sm font-bold font-mono transition-opacity hover:opacity-80"
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...dropdownMenu}
            role="menu"
            className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-elevated z-modal"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <Badge
                variant={tier === "pro" ? "success" : "default"}
                shape="pill"
                className="mt-1"
              >
                {tier === "pro" ? "Pro" : "Free"}
              </Badge>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
              >
                <Settings className="size-4" />
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-elevated transition-colors w-full text-left"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSignOut}
      className={cn(className)}
    >
      <LogOut className="size-3.5" />
      Sign out
    </Button>
  );
}
