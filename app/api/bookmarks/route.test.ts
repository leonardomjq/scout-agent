import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetLoggedInUser = vi.fn();
const mockCreateSessionClient = vi.fn();
const mockGetUserTier = vi.fn();
const mockAdminDatabases = {
  listDocuments: vi.fn(),
  createDocument: vi.fn(),
  deleteDocument: vi.fn(),
  getDocument: vi.fn(),
};
const mockSessionDatabases = {
  getDocument: vi.fn(),
};

vi.mock("@/lib/appwrite/server", () => ({
  getLoggedInUser: (...args: unknown[]) => mockGetLoggedInUser(...args),
  createSessionClient: () => mockCreateSessionClient(),
}));

vi.mock("@/lib/appwrite/admin", () => ({
  createAdminClient: () => ({ databases: mockAdminDatabases }),
}));

vi.mock("@/lib/appwrite/helpers", () => ({
  getUserTier: (...args: unknown[]) => mockGetUserTier(...args),
  documentToAlphaCard: (doc: Record<string, unknown>) => doc,
}));

vi.mock("@/lib/refinery/gate", () => ({
  gateAlphaCard: (card: unknown) => card,
}));

import { GET, POST, DELETE } from "./route";

describe("POST /api/bookmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSessionClient.mockResolvedValue({ databases: mockSessionDatabases });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetLoggedInUser.mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ card_id: "card-1" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when card_id is missing", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockGetUserTier.mockResolvedValue("pro");

    const req = new NextRequest("http://localhost:3000/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates bookmark for pro user", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockGetUserTier.mockResolvedValue("pro");
    mockAdminDatabases.createDocument.mockResolvedValue({ $id: "bm-1" });

    const req = new NextRequest("http://localhost:3000/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ card_id: "card-1" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.bookmarked).toBe(true);
  });

  it("enforces free tier limit of 3", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockGetUserTier.mockResolvedValue("free");
    mockAdminDatabases.listDocuments.mockResolvedValue({
      total: 3,
      documents: [{}, {}, {}],
    });

    const req = new NextRequest("http://localhost:3000/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ card_id: "card-4" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it("returns success on duplicate bookmark (409)", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockGetUserTier.mockResolvedValue("pro");
    mockAdminDatabases.createDocument.mockRejectedValue({ code: 409 });

    const req = new NextRequest("http://localhost:3000/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ card_id: "card-1" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.bookmarked).toBe(true);
  });
});

describe("DELETE /api/bookmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSessionClient.mockResolvedValue({ databases: mockSessionDatabases });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetLoggedInUser.mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/bookmarks?card_id=card-1", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it("deletes an existing bookmark", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockAdminDatabases.listDocuments.mockResolvedValue({
      documents: [{ $id: "bm-1" }],
    });
    mockAdminDatabases.deleteDocument.mockResolvedValue(undefined);

    const req = new NextRequest("http://localhost:3000/api/bookmarks?card_id=card-1", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.bookmarked).toBe(false);
    expect(mockAdminDatabases.deleteDocument).toHaveBeenCalledWith(
      expect.any(String),
      "bookmarks",
      "bm-1"
    );
  });

  it("returns success even if no bookmark exists", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockAdminDatabases.listDocuments.mockResolvedValue({
      documents: [],
    });

    const req = new NextRequest("http://localhost:3000/api/bookmarks?card_id=card-1", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.bookmarked).toBe(false);
  });
});

describe("GET /api/bookmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSessionClient.mockResolvedValue({ databases: mockSessionDatabases });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetLoggedInUser.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns bookmarked cards", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockGetUserTier.mockResolvedValue("pro");
    mockAdminDatabases.listDocuments.mockResolvedValue({
      documents: [
        { $id: "bm-1", card_id: "card-1" },
        { $id: "bm-2", card_id: "card-2" },
      ],
    });
    mockSessionDatabases.getDocument.mockImplementation(
      (_db: string, _col: string, id: string) =>
        Promise.resolve({ $id: id, title: `Card ${id}` })
    );

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toHaveLength(2);
  });

  it("skips cards that no longer exist", async () => {
    mockGetLoggedInUser.mockResolvedValue({ $id: "user-1" });
    mockGetUserTier.mockResolvedValue("pro");
    mockAdminDatabases.listDocuments.mockResolvedValue({
      documents: [
        { $id: "bm-1", card_id: "card-1" },
        { $id: "bm-2", card_id: "card-missing" },
      ],
    });
    mockSessionDatabases.getDocument.mockImplementation(
      (_db: string, _col: string, id: string) => {
        if (id === "card-missing") return Promise.reject(new Error("Not found"));
        return Promise.resolve({ $id: id, title: `Card ${id}` });
      }
    );

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });
});
