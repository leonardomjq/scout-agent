import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetLoggedInUser = vi.fn();
const mockCreateSessionClient = vi.fn();
const mockGetUserTier = vi.fn();
const mockSessionDatabases = {
  listDocuments: vi.fn(),
  getDocument: vi.fn(),
};

vi.mock("@/lib/appwrite/server", () => ({
  getLoggedInUser: (...args: unknown[]) => mockGetLoggedInUser(...args),
  createSessionClient: () => mockCreateSessionClient(),
}));

vi.mock("@/lib/appwrite/helpers", () => ({
  getUserTier: (...args: unknown[]) => mockGetUserTier(...args),
}));

import { GET } from "./route";

describe("GET /api/pulse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSessionClient.mockResolvedValue({ databases: mockSessionDatabases });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetLoggedInUser.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 for free users", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockGetUserTier.mockResolvedValue("free");

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns pulse data for pro users", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockGetUserTier.mockResolvedValue("pro");

    // Active cards
    mockSessionDatabases.listDocuments
      .mockResolvedValueOnce({
        documents: [
          {
            $id: "card-1",
            category: "friction_cluster",
            signal_strength: 0.8,
            direction: "accelerating",
            entities: ["Next.js", "Vercel"],
            title: "Test opportunity",
          },
          {
            $id: "card-2",
            category: "velocity_spike",
            signal_strength: 0.9,
            direction: "accelerating",
            entities: ["Next.js", "React"],
            title: "Another opportunity",
          },
        ],
      })
      // This week
      .mockResolvedValueOnce({ total: 5, documents: [] })
      // Last week
      .mockResolvedValueOnce({ total: 3, documents: [] });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.categories).toBeDefined();
    expect(data.categories.friction_cluster.count).toBe(1);
    expect(data.categories.velocity_spike.count).toBe(1);
    expect(data.trending_entities).toBeDefined();
    expect(data.trending_entities[0].name).toBe("Next.js");
    expect(data.trending_entities[0].count).toBe(2);
    expect(data.week_over_week.this_week).toBe(5);
    expect(data.week_over_week.last_week).toBe(3);
    expect(data.week_over_week.change_pct).toBe(67);
    expect(data.top_cards).toHaveLength(2);
  });

  it("handles empty data gracefully", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockGetUserTier.mockResolvedValue("pro");

    mockSessionDatabases.listDocuments
      .mockResolvedValueOnce({ documents: [] })
      .mockResolvedValueOnce({ total: 0, documents: [] })
      .mockResolvedValueOnce({ total: 0, documents: [] });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.categories).toEqual({});
    expect(data.trending_entities).toEqual([]);
    expect(data.week_over_week.change_pct).toBe(0);
    expect(data.top_cards).toEqual([]);
  });
});
