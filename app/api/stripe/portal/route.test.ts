import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetLoggedInUser = vi.fn();
const mockGetStripe = vi.fn();
const mockCreateOrGetCustomer = vi.fn();

vi.mock("@/lib/appwrite/server", () => ({
  getLoggedInUser: (...args: unknown[]) => mockGetLoggedInUser(...args),
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripe: () => mockGetStripe(),
}));

vi.mock("@/lib/stripe/helpers", () => ({
  createOrGetCustomer: (...args: unknown[]) => mockCreateOrGetCustomer(...args),
}));

import { POST } from "./route";

describe("POST /api/stripe/portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetLoggedInUser.mockResolvedValue(null);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns portal URL on success", async () => {
    mockGetLoggedInUser.mockResolvedValue({
      $id: "user-123",
      email: "test@example.com",
    });
    mockCreateOrGetCustomer.mockResolvedValue("cus_123");
    mockGetStripe.mockReturnValue({
      billingPortal: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            url: "https://billing.stripe.com/session/test",
          }),
        },
      },
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe("https://billing.stripe.com/session/test");
  });

  it("returns 500 on Stripe error", async () => {
    mockGetLoggedInUser.mockResolvedValue({
      $id: "user-123",
      email: "test@example.com",
    });
    mockCreateOrGetCustomer.mockRejectedValue(new Error("Stripe down"));

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create portal session");
  });
});
