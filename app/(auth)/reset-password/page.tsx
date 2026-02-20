"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { confirmPasswordReset } from "@/lib/appwrite/auth-actions";
import { AuthShell } from "@/components/auth-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  clipRevealStagger,
  clipRevealItem,
  scanLine,
} from "@/lib/motion";

function ResetPasswordPanel() {
  return (
    <motion.div
      className="space-y-8"
      variants={clipRevealStagger}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="h-px bg-accent-green w-24"
        variants={scanLine}
      />

      <motion.div variants={clipRevealItem}>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-text">
          Almost there.
        </h2>
      </motion.div>

      <motion.p
        className="font-[family-name:var(--font-serif)] text-text-muted text-base leading-relaxed"
        variants={clipRevealItem}
      >
        Set a new password and get back to your opportunities.
      </motion.p>
    </motion.div>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-redirect to login after success
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.push("/login"), 2000);
    return () => clearTimeout(timer);
  }, [success, router]);

  // Invalid link
  if (!userId || !secret) {
    return (
      <Card
        variant="default"
        className="p-8 shadow-glow border-accent-green/30 texture-paper"
      >
        <div className="text-center py-4">
          <div className="bg-accent-red/10 rounded-full p-4 inline-flex mb-4">
            <AlertCircle className="size-8 text-accent-red" />
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
            Invalid or expired link
          </h2>
          <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm leading-relaxed mb-6">
            This reset link is no longer valid. Request a new one below.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm text-accent-green hover:underline"
          >
            Request new reset link
          </Link>
        </div>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPw) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await confirmPasswordReset(userId!, secret!, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <Card
        variant="default"
        className="p-8 shadow-glow border-accent-green/30 texture-paper"
      >
        <div className="text-center py-4">
          <div className="bg-accent-green/10 rounded-full p-4 inline-flex mb-4">
            <CheckCircle className="size-8 text-accent-green" />
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
            Password updated
          </h2>
          <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm">
            Redirecting to sign in...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="default"
      className="p-8 shadow-glow border-accent-green/30 texture-paper"
    >
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-dim mb-2">
          Account Recovery
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Set new password
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">
            New password
          </label>
          <Input
            icon={<Lock className="size-4" />}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-xs text-text-muted mt-1">
            Minimum 8 characters
          </p>
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">
            Confirm password
          </label>
          <Input
            icon={<Lock className="size-4" />}
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        {error && (
          <p className="text-accent-red text-sm">{error}</p>
        )}

        <Button
          type="submit"
          size="md"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell panel={<ResetPasswordPanel />}>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
