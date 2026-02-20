"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStripeRedirect } from "@/hooks/use-stripe-redirect";

export function ManageSubscriptionButton() {
  const { redirect, loading } = useStripeRedirect(
    "/api/stripe/portal",
    "Could not open billing portal. Please try again."
  );

  return (
    <Button variant="secondary" size="sm" onClick={redirect} disabled={loading}>
      <CreditCard className="size-3.5" />
      {loading ? "Loading..." : "Manage Subscription"}
    </Button>
  );
}
