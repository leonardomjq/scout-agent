"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { deleteAccount } from "@/lib/appwrite/account-actions";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeleteAccountButtonProps {
  email: string;
}

export function DeleteAccountButton({ email }: DeleteAccountButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isConfirmed = confirmation.toLowerCase() === email.toLowerCase();

  async function handleDelete() {
    if (!isConfirmed) return;
    setLoading(true);

    const result = await deleteAccount();
    if (result.error) {
      toast(result.error, "error");
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="text-accent-red hover:text-accent-red"
      >
        Delete account
      </Button>

      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-modal flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => !loading && setShowDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border rounded-lg shadow-elevated max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-accent-red">
                  <AlertTriangle className="size-5" />
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                    Delete Account
                  </h3>
                </div>
                <button
                  onClick={() => !loading && setShowDialog(false)}
                  disabled={loading}
                  className="text-text-muted hover:text-text transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="text-sm text-text-muted mb-4">
                This action is permanent and cannot be undone. All your data,
                including saved cards and subscription, will be permanently
                deleted.
              </p>

              <label className="block text-sm text-text-muted mb-2">
                Type <span className="font-mono text-text">{email}</span> to confirm
              </label>
              <Input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={email}
                className="mb-4"
                autoComplete="off"
              />

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <button
                  onClick={handleDelete}
                  disabled={!isConfirmed || loading}
                  className="px-4 py-1.5 text-sm font-mono rounded bg-accent-red text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {loading ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
