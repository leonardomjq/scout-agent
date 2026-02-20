"use client";

import { useState } from "react";
import { changePassword } from "@/lib/appwrite/auth-actions";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);

    if (result.error) {
      toast(result.error, "error");
    } else {
      toast("Password updated successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-text-muted mb-1">
          Current password
        </label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className="block text-sm text-text-muted mb-1">
          New password
        </label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        {newPassword.length > 0 && newPassword.length < 8 && (
          <p className="text-xs text-accent-red mt-1">
            Must be at least 8 characters
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm text-text-muted mb-1">
          Confirm new password
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        {confirmPassword.length > 0 && confirmPassword !== newPassword && (
          <p className="text-xs text-accent-red mt-1">
            Passwords don&apos;t match
          </p>
        )}
      </div>
      <Button type="submit" size="sm" disabled={!isValid || loading}>
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
