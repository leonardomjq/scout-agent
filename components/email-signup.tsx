"use client";

import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Status = "idle" | "loading" | "success" | "error";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Something went wrong.");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm text-accent-muted">
        <Check className="size-3.5" />
        <span className="font-mono text-xs">Done. Check back at 8 AM UTC.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="size-3.5" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="text-xs"
      />
      <Button
        type="submit"
        size="sm"
        className="w-full"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          "Get daily briefs"
        )}
      </Button>
      {status === "error" && (
        <p className="font-mono text-xs text-accent-red">{errorMsg}</p>
      )}
      <p className="font-mono text-[10px] text-text-dim">
        Free, daily, no spam.
      </p>
    </form>
  );
}
