"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function getMinutesUntilNext8AM(): number {
  const now = new Date();
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  const minutesSinceMidnight = utcH * 60 + utcM;
  const target = 8 * 60; // 8 AM UTC in minutes
  const diff = target - minutesSinceMidnight;
  return diff > 0 ? diff : diff + 24 * 60;
}

function formatCountdown(totalMinutes: number): string {
  if (totalMinutes <= 15) return "Arriving...";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function NextEditionCountdown() {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    setMinutes(getMinutesUntilNext8AM());
    const interval = setInterval(() => {
      setMinutes(getMinutesUntilNext8AM());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (minutes === null) return null;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-text-muted">
        <Clock className="size-3.5 text-text-dim" />
        <span>Next edition</span>
      </div>
      <span className="font-mono text-xs text-accent-muted">
        {formatCountdown(minutes)}
      </span>
    </div>
  );
}
