"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { signUpWithEmail } from "@/lib/appwrite/auth-actions";
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

function SignupPanel() {
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
          Know what to build.
          <br />
          <span className="text-accent-green">Before everyone else.</span>
        </h2>
      </motion.div>

      <motion.p
        className="font-[family-name:var(--font-serif)] text-text-muted text-base leading-relaxed"
        variants={clipRevealItem}
      >
        Your AI venture analyst — scanning market signals so you ship
        what people actually want.
      </motion.p>

      <motion.ul className="space-y-3" variants={clipRevealItem}>
        {[
          "Fresh opportunity briefs every 72h",
          "Evidence from Twitter, GitHub, HN, Reddit",
          "Thesis, strategy, and risk — not just trends",
        ].map((item) => (
          <li
            key={item}
            className="font-mono text-xs text-text-muted flex items-start gap-2"
          >
            <span className="text-accent-green mt-0.5">&#8227;</span>
            {item}
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

export default function SignupPage() {
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

    const result = await signUpWithEmail(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <AuthShell panel={<SignupPanel />}>
      <Card variant="default" className="p-8 shadow-glow border-accent-green/30 texture-paper">
        <div className="mb-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-dim mb-2">
            Create Account
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Start discovering opportunities
          </h1>
        </div>

        <p className="text-xs text-text-dim text-center mb-4">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-text-muted transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-text-muted transition-colors">
            Privacy Policy
          </Link>
        </p>

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
            <label className="block text-sm text-text-muted mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                className="pr-10"
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
            <p className="text-xs text-text-muted mt-1">
              Minimum 8 characters
            </p>
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
            {loading ? "Creating account..." : "Start Free"}
          </Button>
        </form>

        <p className="text-center text-text-muted text-sm mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-green hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
