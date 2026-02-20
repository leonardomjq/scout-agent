"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

interface UseStripeRedirectReturn {
  redirect: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useStripeRedirect(
  endpoint: string,
  errorMessage = "Could not connect to Stripe. Please try again."
): UseStripeRedirectReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function redirect() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        const msg = errorMessage;
        setError(msg);
        toast(msg, "error");
        setLoading(false);
      }
    } catch {
      const msg = errorMessage;
      setError(msg);
      toast(msg, "error");
      setLoading(false);
    }
  }

  return { redirect, loading, error };
}
