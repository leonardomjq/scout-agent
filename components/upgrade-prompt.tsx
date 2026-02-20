"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStripeRedirect } from "@/hooks/use-stripe-redirect";

type Interval = "monthly" | "annual";

export function UpgradePrompt() {
  const [interval, setInterval] = useState<Interval>("annual");
  const { redirect, loading } = useStripeRedirect(
    `/api/stripe/checkout?interval=${interval}`,
    "Could not start checkout. Please try again."
  );

  return (
    <Card padding="spacious" className="text-center max-w-sm">
      <div className="flex items-center justify-center gap-2 text-accent-green text-2xl mb-2">
        <Sparkles className="size-5" />
        <span>Pro</span>
      </div>
      <h3 className="font-[family-name:var(--font-display)] font-semibold mb-2">Unlock the Full Brief</h3>
      <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mb-4">
        See what to build, who you&apos;re up against, and how long the window
        stays open.
      </p>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-1 mb-3">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
            interval === "monthly"
              ? "bg-accent-green/20 text-accent-green"
              : "text-text-muted hover:text-text"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setInterval("annual")}
          className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
            interval === "annual"
              ? "bg-accent-green/20 text-accent-green"
              : "text-text-muted hover:text-text"
          }`}
        >
          Annual
        </button>
      </div>

      <div className="mb-4">
        <span className="text-2xl font-bold font-mono">
          {interval === "annual" ? "$24" : "$29"}
        </span>
        <span className="text-text-muted text-sm">/mo</span>
        {interval === "annual" && (
          <p className="text-xs text-accent-green font-mono mt-1">
            $288/yr — save $60
          </p>
        )}
      </div>

      <Button onClick={redirect} disabled={loading}>
        {loading ? "Loading..." : "Upgrade to Pro"}
      </Button>
    </Card>
  );
}
