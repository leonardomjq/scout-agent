"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmail } from "@/lib/appwrite/auth-actions";
import { AuthShell } from "@/components/auth-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/oauth-buttons";
import {
  clipRevealStagger,
  clipRevealItem,
  scanLine,
} from "@/lib/motion";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_failed: "Sign in with provider failed. Please try again.",
  missing_params: "Invalid callback — please try signing in again.",
};

function LoginPanel() {
  return (
    <motion.div
      className="space-y-8"
      variants={clipRevealStagger}
      initial="hidden"
      animate="visible"
    >
      {/* Scan line accent */}
      <motion.div
        className="h-px bg-accent-green w-24"
        variants={scanLine}
      />

      <motion.div variants={clipRevealItem}>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-text">
          Welcome back.
        </h2>
      </motion.div>

      <motion.p
        className="font-[family-name:var(--font-serif)] text-text-muted text-base leading-relaxed"
        variants={clipRevealItem}
      >
        Your latest opportunity briefs are waiting.
      </motion.p>
    </motion.div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signInWithEmail(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <Card variant="default" className="p-8 shadow-glow border-accent-green/30 texture-paper">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-dim mb-2">
          Sign In
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Welcome back
        </h1>
      </div>

      {oauthError && OAUTH_ERRORS[oauthError] && (
        <p className="text-accent-red text-sm mb-4">
          {OAUTH_ERRORS[oauthError]}
        </p>
      )}

      <OAuthButtons />

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-text-muted">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-text-muted hover:text-accent-green transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
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
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-text-muted text-sm mt-4">
        No account?{" "}
        <Link href="/signup" className="text-accent-green hover:underline">
          Start free
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <AuthShell panel={<LoginPanel />}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
