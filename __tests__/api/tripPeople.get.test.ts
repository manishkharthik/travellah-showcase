import { GET } from "@/app/api/tripPeople/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    trip: {
      findUnique: jest.fn(),
    },
  },
}));

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/tripPeople", () => {
  it("returns 400 if tripId is missing", async () => {
    const req = new NextRequest(new URL("http://localhost/api/tripPeople"));
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns people in a trip", async () => {
    (prisma.trip.findUnique as jest.Mock).mockResolvedValue({
      tripMemberships: [
        { user: { name: "Alice", username: "alice123", id: "u1" } },
        { user: { name: "Bob", username: "bob456", id: "u2" } },
      ],
    });

    const url = new URL("http://localhost/api/tripPeople?tripId=trip123");
    const req = new NextRequest(url);
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.people.length).toBe(2);
    expect(json.people[0].username).toBe("alice123");
  });

  it("returns 404 if trip not found", async () => {
    (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

    const url = new URL("http://localhost/api/tripPeople?tripId=trip123");
    const req = new NextRequest(url);
    const res = await GET(req);

    expect(res.status).toBe(404);
  });

  it("returns 500 on DB error", async () => {
    (prisma.trip.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"));

    const url = new URL("http://localhost/api/tripPeople?tripId=trip123");
    const req = new NextRequest(url);
    const res = await GET(req);

    expect(res.status).toBe(500);
  });
});
