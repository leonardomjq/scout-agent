"use client";

import { Link2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "./toast";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied", "success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Failed to copy link", "error");
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
      title="Copy link"
    >
      {copied ? (
        <Check className="size-4 text-accent" />
      ) : (
        <Link2 className="size-4" />
      )}
    </button>
  );
}
