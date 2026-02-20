import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockDeleteSession = vi.fn();

vi.mock("node-appwrite", () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setSession() { return this; }
  }
  class MockAccount {
    deleteSession = mockDeleteSession;
  }
  return { Client: MockClient, Account: MockAccount };
});

vi.mock("@/lib/auth/csrf", () => ({
  verifyCsrf: vi.fn(() => null),
}));

// ---------------------------------------------------------------------------
// Import handler
// ---------------------------------------------------------------------------
import { POST } from "./route";

function makeRequest(sessionCookie?: string) {
  const req = new NextRequest("http://localhost:3000/api/auth/signout", {
    method: "POST",
  });
  if (sessionCookie) {
    req.cookies.set("scout_session", sessionCookie);
  }
  return req;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/auth/signout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the session cookie and returns success", async () => {
    mockDeleteSession.mockResolvedValue({});

    const res = await POST(makeRequest("active-session"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteSession).toHaveBeenCalledWith("current");

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("scout_session=");
    expect(setCookie).toContain("Max-Age=0");
  });

  it("returns success even without a session cookie", async () => {
    const res = await POST(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteSession).not.toHaveBeenCalled();
  });

  it("returns success even when Appwrite session deletion fails", async () => {
    mockDeleteSession.mockRejectedValue(new Error("Session expired"));

    const res = await POST(makeRequest("expired-session"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
