"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "./toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Interval = "monthly" | "annual";

export function UpgradePrompt() {
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState<Interval>("annual");
  const { toast } = useToast();

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stripe/checkout?interval=${interval}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast("Could not start checkout. Please try again.", "error");
        setLoading(false);
      }
    } catch {
      toast("Could not start checkout. Please try again.", "error");
      setLoading(false);
    }
  }

  return (
    <Card padding="spacious" className="text-center max-w-sm">
      <div className="flex items-center justify-center gap-2 text-accent-green text-2xl mb-2">
        <Sparkles className="size-5" />
        <span>Pro</span>
      </div>
      <h3 className="font-semibold mb-2">Unlock the Full Brief</h3>
      <p className="text-text-muted text-sm mb-4">
        Get complete strategy, risk analysis, competitive landscape, and full
        evidence for every opportunity.
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

      <Button onClick={handleUpgrade} disabled={loading}>
        {loading ? "Loading..." : "Upgrade to Pro"}
      </Button>
    </Card>
  );
}
