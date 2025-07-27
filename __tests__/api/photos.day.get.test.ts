import { GET } from "@/app/api/photos/day/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    photo: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/photos/day", () => {
  it("returns photos for a given trip and day", async () => {
    (prisma.photo.findMany as jest.Mock).mockResolvedValue([{ id: "p1" }]);

    const url = new URL("http://localhost/api/photos/day?tripId=trip123&day=2025-08-01");
    const req = new NextRequest(url);

    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json[0].id).toBe("p1");
  });

  it("returns 400 if tripId or day is missing", async () => {
    const req = new NextRequest(new URL("http://localhost/api/photos/day"));
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
