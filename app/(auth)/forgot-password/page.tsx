"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";
import { requestPasswordReset } from "@/lib/appwrite/auth-actions";
import { AuthShell } from "@/components/auth-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  clipRevealStagger,
  clipRevealItem,
  scanLine,
} from "@/lib/motion";

function ForgotPasswordPanel() {
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
          Locked out?
          <br />
          <span className="text-accent-green">We&apos;ll fix that.</span>
        </h2>
      </motion.div>

      <motion.p
        className="font-[family-name:var(--font-serif)] text-text-muted text-base leading-relaxed"
        variants={clipRevealItem}
      >
        Your opportunity briefs aren&apos;t going anywhere.
      </motion.p>
    </motion.div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await requestPasswordReset(email);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell panel={<ForgotPasswordPanel />}>
      <Card
        variant="default"
        className="p-8 shadow-glow border-accent-green/30 texture-paper"
      >
        {sent ? (
          <div className="text-center py-4">
            <div className="bg-accent-green/10 rounded-full p-4 inline-flex mb-4">
              <CheckCircle className="size-8 text-accent-green" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
              Check your inbox
            </h2>
            <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm leading-relaxed mb-6">
              If an account exists for {email}, we sent a reset link.
              It may take a minute to arrive.
            </p>
            <Link
              href="/login"
              className="text-sm text-text-muted hover:text-accent-green transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-dim mb-2">
                Account Recovery
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-1">
                Reset your password
              </h1>
              <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Email
                </label>
                <Input
                  icon={<Mail className="size-4" />}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
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
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <p className="text-center text-text-muted text-sm mt-4">
              <Link
                href="/login"
                className="hover:text-accent-green transition-colors"
              >
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </Card>
    </AuthShell>
  );
}
