import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockCreateEmailPasswordSession = vi.fn();
const mockUsersCreate = vi.fn();

vi.mock("node-appwrite", () => ({
  ID: { unique: vi.fn(() => "unique-id") },
}));

const mockCheckRateLimit = vi.fn(async () => ({ allowed: true }));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimitAsync: (...args: Parameters<typeof mockCheckRateLimit>) =>
    mockCheckRateLimit(...args),
}));

vi.mock("@/lib/auth/csrf", () => ({
  verifyCsrf: vi.fn(() => null),
}));

const mockEnsureUserProfile = vi.fn(async () => {});

vi.mock("@/lib/appwrite/helpers", () => ({
  ensureUserProfile: (...args: Parameters<typeof mockEnsureUserProfile>) =>
    mockEnsureUserProfile(...args),
}));

vi.mock("@/lib/appwrite/admin", () => ({
  createAdminClient: vi.fn(() => ({
    users: { create: mockUsersCreate },
    databases: { createDocument: vi.fn() },
    account: {
      createEmailPasswordSession: mockCreateEmailPasswordSession,
    },
  })),
}));

// ---------------------------------------------------------------------------
// Import handler
// ---------------------------------------------------------------------------
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ allowed: true });
  });

  it("returns 201 with Set-Cookie on successful sign-up", async () => {
    mockUsersCreate.mockResolvedValue({ $id: "user-123" });
    mockCreateEmailPasswordSession.mockResolvedValue({ secret: "new-sess" });

    const res = await POST(makeRequest({ email: "new@b.com", password: "password1" }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("scout_session=new-sess");
    expect(mockEnsureUserProfile).toHaveBeenCalledWith(expect.anything(), "user-123");
  });

  it("returns 400 when password too short", async () => {
    const res = await POST(makeRequest({ email: "a@b.com", password: "short" }));
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Password must be at least 8 characters");
  });

  it("returns 400 when fields missing", async () => {
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when user already exists", async () => {
    mockUsersCreate.mockRejectedValue(new Error("User already exists"));

    const res = await POST(makeRequest({ email: "dup@b.com", password: "password1" }));
    expect(res.status).toBe(409);

    const data = await res.json();
    expect(data.error).toContain("already exists");
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false });

    const res = await POST(makeRequest({ email: "a@b.com", password: "password1" }));
    expect(res.status).toBe(429);
  });
});
