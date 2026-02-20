import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockCreateEmailPasswordSession = vi.fn();

vi.mock("@/lib/appwrite/admin", () => ({
  createAdminClient: vi.fn(() => ({
    account: {
      createEmailPasswordSession: mockCreateEmailPasswordSession,
    },
  })),
}));

const mockCheckRateLimit = vi.fn(async () => ({ allowed: true }));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimitAsync: (...args: Parameters<typeof mockCheckRateLimit>) =>
    mockCheckRateLimit(...args),
}));

vi.mock("@/lib/auth/csrf", () => ({
  verifyCsrf: vi.fn(() => null),
}));

// ---------------------------------------------------------------------------
// Import handler
// ---------------------------------------------------------------------------
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/auth/signin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ allowed: true });
  });

  it("returns 200 with Set-Cookie on successful sign-in", async () => {
    mockCreateEmailPasswordSession.mockResolvedValue({ secret: "sess-abc" });

    const res = await POST(makeRequest({ email: "a@b.com", password: "password1" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("scout_session=sess-abc");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/");
  });

  it("returns 400 when email or password missing", async () => {
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Email and password are required");
  });

  it("returns 401 on wrong credentials", async () => {
    mockCreateEmailPasswordSession.mockRejectedValue(new Error("Invalid credentials"));

    const res = await POST(makeRequest({ email: "a@b.com", password: "wrong" }));
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toContain("Invalid credentials");
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false });

    const res = await POST(makeRequest({ email: "a@b.com", password: "password1" }));
    expect(res.status).toBe(429);

    const data = await res.json();
    expect(data.error).toBe("Too many attempts. Try again later.");
  });

  it("returns 400 on invalid JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
