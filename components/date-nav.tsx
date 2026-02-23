import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAdjacentDates, getAllDates } from "@/lib/data";

interface DateNavProps {
  date: string;
}

export function DateNav({ date }: DateNavProps) {
  const { prev, next } = getAdjacentDates(date);
  const latestDate = getAllDates()[0];
  const isLatest = date === latestDate;

  return (
    <nav className="flex items-center justify-between py-6">
      {prev ? (
        <Link
          href={`/edition/${prev}`}
          className="inline-flex items-center gap-1 font-mono text-xs text-text-muted hover:text-text transition-colors"
        >
          <ChevronLeft className="size-3.5" />
          <span>{prev}</span>
        </Link>
      ) : (
        <span />
      )}

      <span className="font-mono text-xs text-text-dim">{date}</span>

      {next && !isLatest ? (
        <Link
          href={next === latestDate ? "/" : `/edition/${next}`}
          className="inline-flex items-center gap-1 font-mono text-xs text-text-muted hover:text-text transition-colors"
        >
          <span>{next}</span>
          <ChevronRight className="size-3.5" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
