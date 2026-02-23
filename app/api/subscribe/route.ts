import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

const SUBSCRIBERS_PATH = join(process.cwd(), "data", "subscribers.json");

interface Subscriber {
  email: string;
  subscribed_at: string;
}

function readSubscribers(): Subscriber[] {
  if (!existsSync(SUBSCRIBERS_PATH)) return [];
  const raw = readFileSync(SUBSCRIBERS_PATH, "utf-8");
  return JSON.parse(raw) as Subscriber[];
}

function writeSubscribers(subscribers: Subscriber[]): void {
  writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subscribers, null, 2), "utf-8");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email address." },
        { status: 400 },
      );
    }

    const subscribers = readSubscribers();

    if (subscribers.some((s) => s.email === email)) {
      return NextResponse.json({ ok: true });
    }

    subscribers.push({ email, subscribed_at: new Date().toISOString() });
    writeSubscribers(subscribers);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Something went wrong." },
      { status: 500 },
    );
  }
}
