import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock: next/headers
// ---------------------------------------------------------------------------
const mockGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: vi.fn(),
    get: mockGet,
    delete: vi.fn(),
  })),
  headers: vi.fn(async () => ({
    get: vi.fn(() => "127.0.0.1"),
  })),
}));

// ---------------------------------------------------------------------------
// Mock: next/navigation — redirect throws NEXT_REDIRECT (like the real one)
// ---------------------------------------------------------------------------
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

// ---------------------------------------------------------------------------
// Mock: node-appwrite
// ---------------------------------------------------------------------------
const mockUpdatePassword = vi.fn();
const mockGetSession = vi.fn();
const mockListSessions = vi.fn();
const mockDeleteSession = vi.fn();

vi.mock("node-appwrite", () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setSession() { return this; }
  }
  class MockAccount {
    updatePassword = mockUpdatePassword;
    getSession = mockGetSession;
    listSessions = mockListSessions;
    deleteSession = mockDeleteSession;
  }
  return {
    Client: MockClient,
    Account: MockAccount,
    OAuthProvider: { Google: "google", Github: "github" },
  };
});

// ---------------------------------------------------------------------------
// Mock: rate-limit
// ---------------------------------------------------------------------------
const mockCheckRateLimit = vi.fn(async () => ({ allowed: true }));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimitAsync: (...args: Parameters<typeof mockCheckRateLimit>) => mockCheckRateLimit(...args),
}));

// ---------------------------------------------------------------------------
// Mock: admin client
// ---------------------------------------------------------------------------
const mockAdminCreateRecovery = vi.fn();
const mockAdminUpdateRecovery = vi.fn();

vi.mock("./admin", () => ({
  createAdminClient: vi.fn(() => ({
    account: {
      createRecovery: mockAdminCreateRecovery,
      updateRecovery: mockAdminUpdateRecovery,
    },
  })),
}));

// ---------------------------------------------------------------------------
// Import the functions under test AFTER all mocks
// ---------------------------------------------------------------------------
import { changePassword } from "./auth-actions";

// ===========================================================================
// changePassword
// ===========================================================================
describe("changePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue({ value: "test-session-secret" });
  });

  it("returns error when no session exists", async () => {
    mockGet.mockReturnValue(undefined);

    const result = await changePassword("old-pass", "new-pass");
    expect(result.error).toBe("Not authenticated");
  });

  it("updates password successfully", async () => {
    mockUpdatePassword.mockResolvedValue({});
    mockGetSession.mockResolvedValue({ $id: "current-session-id" });
    mockListSessions.mockResolvedValue({ sessions: [] });

    const result = await changePassword("old-pass", "new-pass");
    expect(result.error).toBeUndefined();
    expect(mockUpdatePassword).toHaveBeenCalledWith("new-pass", "old-pass");
  });

  it("returns error on wrong current password", async () => {
    mockUpdatePassword.mockRejectedValue(
      new Error("Invalid credentials. Please check the email and password.")
    );

    const result = await changePassword("wrong-pass", "new-pass");
    expect(result.error).toContain("Invalid credentials");
  });

  it("invalidates other sessions after password change", async () => {
    mockUpdatePassword.mockResolvedValue({});
    mockGetSession.mockResolvedValue({ $id: "current-session-id" });
    mockListSessions.mockResolvedValue({
      sessions: [
        { $id: "current-session-id" },
        { $id: "other-session-1" },
        { $id: "other-session-2" },
      ],
    });
    mockDeleteSession.mockResolvedValue({});

    const result = await changePassword("old-pass", "new-pass");
    expect(result.error).toBeUndefined();
    expect(mockDeleteSession).toHaveBeenCalledTimes(2);
    expect(mockDeleteSession).toHaveBeenCalledWith("other-session-1");
    expect(mockDeleteSession).toHaveBeenCalledWith("other-session-2");
    expect(mockDeleteSession).not.toHaveBeenCalledWith("current-session-id");
  });

  it("succeeds even if session invalidation fails", async () => {
    mockUpdatePassword.mockResolvedValue({});
    mockGetSession.mockRejectedValue(new Error("Session error"));

    const result = await changePassword("old-pass", "new-pass");
    expect(result.error).toBeUndefined();
  });
});
