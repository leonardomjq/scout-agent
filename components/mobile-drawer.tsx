"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SidebarContent } from "./sidebar-content";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { X, LogOut } from "lucide-react";
import { signOut } from "@/lib/appwrite/auth-actions";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  tier?: string;
  user?: { email: string; name?: string } | null;
}

export function MobileDrawer({ open, onClose, tier, user }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-overlay lg:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-modal flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <Logo size="md" />
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="py-4 flex-1 overflow-y-auto">
              <SidebarContent onNavigate={onClose} tier={tier} />
            </div>

            {/* User section */}
            {user && (
              <div className="border-t border-border px-4 py-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-8 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center text-sm font-bold font-mono shrink-0">
                    {user.name ? user.name[0].toUpperCase() : (user.email[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <Badge
                      variant={tier === "pro" ? "success" : "default"}
                      shape="pill"
                      className="mt-0.5"
                    >
                      {tier === "pro" ? "Pro" : "Free"}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/";
                  }}
                  className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors w-full"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
